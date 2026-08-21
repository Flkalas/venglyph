import {
  fromOpenAiToolName,
  toOpenAiToolName,
} from "../shared/protocol.js";
import type { ChatMessage } from "./assemble.js";

export type LlmToolCall = {
  id: string;
  tool: string;
  args: Record<string, unknown>;
};

export type LlmStreamResult = {
  content: string;
  toolCalls: LlmToolCall[];
};

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: toOpenAiToolName("fs.read"),
      description: "Read a file under the worker workspace",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative or workspace path" },
          max_bytes: { type: "number", description: "Max bytes to read" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: toOpenAiToolName("fs.write"),
      description: "Write a file under the worker workspace",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: toOpenAiToolName("shell.exec"),
      description: "Run a shell command in the worker workspace",
      parameters: {
        type: "object",
        properties: {
          cmd: { type: "string" },
          cwd: { type: "string" },
          timeout_ms: { type: "number" },
        },
        required: ["cmd"],
      },
    },
  },
];

export type StreamHandlers = {
  onDelta?: (text: string) => void;
};

export async function streamChatCompletion(
  opts: {
    baseUrl: string;
    model: string;
    messages: ChatMessage[];
    signal?: AbortSignal;
  },
  handlers: StreamHandlers = {},
): Promise<LlmStreamResult> {
  const url = `${opts.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      tools: TOOLS,
      tool_choice: "auto",
      stream: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `LLM ${res.status} from ${url} model=${opts.model}: ${body.slice(0, 400)}`,
    );
  }
  if (!res.body) throw new Error("LLM response missing body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  const toolAcc = new Map<
    number,
    { id: string; name: string; arguments: string }
  >();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      let json: unknown;
      try {
        json = JSON.parse(data);
      } catch {
        continue;
      }
      const choice = (json as { choices?: Array<{ delta?: Delta }> }).choices?.[0];
      const delta = choice?.delta;
      if (!delta) continue;
      if (typeof delta.content === "string" && delta.content) {
        content += delta.content;
        handlers.onDelta?.(delta.content);
      }
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          const cur = toolAcc.get(idx) ?? { id: "", name: "", arguments: "" };
          if (tc.id) cur.id = tc.id;
          if (tc.function?.name) cur.name = tc.function.name;
          if (tc.function?.arguments) cur.arguments += tc.function.arguments;
          toolAcc.set(idx, cur);
        }
      }
    }
  }

  const toolCalls: LlmToolCall[] = [];
  for (const tc of toolAcc.values()) {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(tc.arguments || "{}") as Record<string, unknown>;
    } catch {
      args = { _raw: tc.arguments };
    }
    toolCalls.push({
      id: tc.id || `call_${toolCalls.length}`,
      tool: fromOpenAiToolName(tc.name),
      args,
    });
  }

  return { content, toolCalls };
}

type Delta = {
  content?: string | null;
  tool_calls?: Array<{
    index?: number;
    id?: string;
    function?: { name?: string; arguments?: string };
  }>;
};

/** OpenAI-shaped tool_calls for persistence / next turn */
export function toOpenAiToolCalls(calls: LlmToolCall[]): unknown[] {
  return calls.map((c) => ({
    id: c.id,
    type: "function",
    function: {
      name: toOpenAiToolName(c.tool),
      arguments: JSON.stringify(c.args),
    },
  }));
}
