import type { MessageRow } from "./sessions.js";
import { searchRecords } from "./sessions.js";
import type { HubStore } from "./store.js";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: unknown;
  tool_call_id?: string;
  name?: string;
};

const DEFAULT_BUDGET_CHARS = 48_000;

export type AssembleResult = {
  messages: ChatMessage[];
  droppedTurns: number;
};

export function assembleContext(
  store: HubStore,
  opts: {
    sessionId: string;
    turns: MessageRow[];
    userText: string;
    budgetChars?: number;
  },
): AssembleResult {
  const budget = opts.budgetChars ?? DEFAULT_BUDGET_CHARS;
  const systemParts: string[] = [
    "You are VenGlyph hub assistant. Use tools to read/write files and run shell commands in the worker workspace.",
    "Prefer fs.read before answering about local files. Use fs.write only when the user asks to create or edit files.",
    "When the user explicitly asks you to run a shell command, call shell.exec with their exact cmd. The hub danger-gate will deny unsafe commands; do not refuse in text instead of calling the tool.",
  ];

  const likeHits = searchRecords(store, {
    q: opts.userText.slice(0, 80),
    limit: 5,
  }).filter((r) => r.id !== opts.sessionId);

  if (likeHits.length) {
    systemParts.push(
      "Related records (LIKE stub):\n" +
        likeHits
          .map((r) => `- [${r.type}] ${r.title ?? r.id} ${r.workspace_ref ?? ""}`)
          .join("\n"),
    );
  }

  const system: ChatMessage = {
    role: "system",
    content: systemParts.join("\n\n"),
  };

  const history = turnsToChat(opts.turns);
  const withUser: ChatMessage[] = [
    ...history,
    { role: "user", content: opts.userText },
  ];

  let dropped = 0;
  let messages = [system, ...withUser];
  while (estimateChars(messages) > budget && withUser.length > 1) {
    withUser.shift();
    dropped += 1;
    messages = [system, ...withUser];
  }

  return { messages, droppedTurns: dropped };
}

function turnsToChat(turns: MessageRow[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const t of turns) {
    if (t.role === "tool") {
      const meta = t.meta ? (JSON.parse(t.meta) as { tool_call_id?: string }) : {};
      out.push({
        role: "tool",
        content: t.content,
        tool_call_id: meta.tool_call_id,
      });
      continue;
    }
    if (t.role === "assistant") {
      const msg: ChatMessage = { role: "assistant", content: t.content };
      if (t.tool_calls) {
        msg.tool_calls = JSON.parse(t.tool_calls) as unknown;
      }
      out.push(msg);
      continue;
    }
    if (t.role === "user" || t.role === "system") {
      out.push({
        role: t.role,
        content: t.content,
      });
    }
  }
  return out;
}

function estimateChars(messages: ChatMessage[]): number {
  return messages.reduce((n, m) => {
    let c = m.content?.length ?? 0;
    if (m.tool_calls) c += JSON.stringify(m.tool_calls).length;
    return n + c;
  }, 0);
}
