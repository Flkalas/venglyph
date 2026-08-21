import type { HubStore } from "./store.js";
import type { WorkerRegistry } from "./workers.js";
import type { ConfirmGate } from "./confirm.js";
import type { SseEvent } from "../shared/protocol.js";
import {
  appendMessage,
  listMessages,
  upsertSession,
} from "./sessions.js";
import { assembleContext, type ChatMessage } from "./assemble.js";
import { routeModel } from "./route.js";
import {
  streamChatCompletion,
  toOpenAiToolCalls,
  type LlmToolCall,
} from "./llm.js";
import {
  dangerGate,
  faAutoApprove,
  isFaEnabled,
} from "./dangerGate.js";

export type DispatchDeps = {
  store: HubStore;
  workers: WorkerRegistry;
  confirm: ConfirmGate;
  emit: (event: SseEvent) => void | Promise<void>;
};

const MAX_LOOPS = 8;

export async function runChatTurn(
  deps: DispatchDeps,
  input: {
    workspace: string;
    channel: string;
    text: string;
    sessionId?: string;
  },
): Promise<{ sessionId: string; resumed: boolean }> {
  const session = input.sessionId
    ? { id: input.sessionId, resumed: true }
    : upsertSession(deps.store, {
        workspace: input.workspace,
        channel: input.channel,
      });

  if (input.sessionId) {
    const existing = deps.store.db
      .prepare(`SELECT id FROM records WHERE id = ?`)
      .get(input.sessionId);
    if (!existing) {
      throw new Error(`session not found: ${input.sessionId}`);
    }
  }

  appendMessage(deps.store, {
    recordId: session.id,
    role: "user",
    content: input.text,
  });

  const turns = listMessages(deps.store, session.id);
  // exclude the just-appended user message from history for assemble (it re-adds)
  const prior = turns.slice(0, -1);
  const assembled = assembleContext(deps.store, {
    sessionId: session.id,
    turns: prior,
    userText: input.text,
  });
  if (assembled.droppedTurns > 0) {
    await deps.emit({
      type: "truncated",
      dropped_turns: assembled.droppedTurns,
    });
  }

  const routed = routeModel(input.text);
  const baseUrl =
    process.env.HUB_LLM_BASE_URL ?? "http://127.0.0.1:1234/v1";
  let messages: ChatMessage[] = assembled.messages;

  for (let loop = 0; loop < MAX_LOOPS; loop++) {
    let result;
    try {
      result = await streamChatCompletion(
        { baseUrl, model: routed.model, messages },
        {
          onDelta: (text) => {
            void deps.emit({ type: "delta", text });
          },
        },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      appendMessage(deps.store, {
        recordId: session.id,
        role: "assistant",
        content: null,
        meta: { error: msg, model: routed.model },
      });
      await deps.emit({
        type: "done",
        session_id: session.id,
        resumed: session.resumed,
        error: msg,
      });
      return { sessionId: session.id, resumed: session.resumed };
    }

    if (result.toolCalls.length === 0) {
      appendMessage(deps.store, {
        recordId: session.id,
        role: "assistant",
        content: result.content,
        meta: { model: routed.model },
      });
      await deps.emit({
        type: "done",
        session_id: session.id,
        resumed: session.resumed,
      });
      return { sessionId: session.id, resumed: session.resumed };
    }

    const openAiCalls = toOpenAiToolCalls(result.toolCalls);
    appendMessage(deps.store, {
      recordId: session.id,
      role: "assistant",
      content: result.content || null,
      toolCalls: openAiCalls,
      meta: { model: routed.model },
    });
    messages = [
      ...messages,
      {
        role: "assistant",
        content: result.content || null,
        tool_calls: openAiCalls,
      },
    ];

    for (const call of result.toolCalls) {
      await deps.emit({
        type: "tool_call",
        call_id: call.id,
        tool: call.tool,
        args: call.args,
      });
      const toolMsg = await handleToolCall(deps, session.id, input.workspace, call);
      messages.push(toolMsg);
    }
  }

  await deps.emit({
    type: "done",
    session_id: session.id,
    resumed: session.resumed,
    error: "tool loop limit reached",
  });
  return { sessionId: session.id, resumed: session.resumed };
}

async function handleToolCall(
  deps: DispatchDeps,
  sessionId: string,
  workspace: string,
  call: LlmToolCall,
): Promise<ChatMessage> {
  const gate = dangerGate({ tool: call.tool, args: call.args });

  if (gate.tier === "deny") {
    const err = `denied: ${gate.reason}`;
    appendMessage(deps.store, {
      recordId: sessionId,
      role: "tool",
      content: err,
      meta: { tool_call_id: call.id, gate: gate.tier, reason: gate.reason },
    });
    await deps.emit({
      type: "tool_result",
      call_id: call.id,
      ok: false,
      error: err,
    });
    return {
      role: "tool",
      content: err,
      tool_call_id: call.id,
    };
  }

  if (gate.tier === "confirm" && !faAutoApprove(gate.tier, isFaEnabled())) {
    const { token, promise } = deps.confirm.waitForApproval();
    await deps.emit({
      type: "confirm",
      token,
      tool: call.tool,
      args: call.args,
      reason: gate.reason,
    });
    const approved = await promise;
    if (!approved) {
      const err = `user rejected: ${gate.reason}`;
      appendMessage(deps.store, {
        recordId: sessionId,
        role: "tool",
        content: err,
        meta: { tool_call_id: call.id, gate: "confirm", approved: false },
      });
      await deps.emit({
        type: "tool_result",
        call_id: call.id,
        ok: false,
        error: err,
      });
      return { role: "tool", content: err, tool_call_id: call.id };
    }
  }

  const worker = deps.workers.pickForWorkspace(workspace);
  if (!worker) {
    const err = "no online worker for workspace";
    appendMessage(deps.store, {
      recordId: sessionId,
      role: "tool",
      content: err,
      meta: { tool_call_id: call.id },
    });
    await deps.emit({
      type: "tool_result",
      call_id: call.id,
      ok: false,
      error: err,
    });
    return { role: "tool", content: err, tool_call_id: call.id };
  }

  try {
    const result = await deps.workers.invoke(
      worker,
      call.tool,
      call.args,
      typeof call.args.timeout_ms === "number" ? call.args.timeout_ms : 30_000,
    );
    const output = result.ok
      ? (result.output ?? "")
      : (result.error ?? "tool failed");
    appendMessage(deps.store, {
      recordId: sessionId,
      role: "tool",
      content: output,
      meta: {
        tool_call_id: call.id,
        worker_id: worker.id,
        ok: result.ok,
        truncated: result.truncated,
      },
    });
    await deps.emit({
      type: "tool_result",
      call_id: call.id,
      ok: result.ok,
      output: result.output,
      error: result.error,
    });
    return {
      role: "tool",
      content: output,
      tool_call_id: call.id,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    appendMessage(deps.store, {
      recordId: sessionId,
      role: "tool",
      content: msg,
      meta: { tool_call_id: call.id, worker_id: worker.id, ok: false },
    });
    await deps.emit({
      type: "tool_result",
      call_id: call.id,
      ok: false,
      error: msg,
    });
    return { role: "tool", content: msg, tool_call_id: call.id };
  }
}
