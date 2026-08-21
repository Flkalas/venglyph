import { z } from "zod";

/** Worker → Hub */
export const HelloFrame = z.object({
  type: z.literal("hello"),
  worker_id: z.string().min(1),
  token: z.string().min(1),
  workspace: z.string().min(1),
  tools: z.array(z.string()),
  version: z.string().default("1"),
});

/** Hub → Worker */
export const ReadyFrame = z.object({
  type: z.literal("ready"),
  session_hint: z.string().optional(),
});

export const InvokeFrame = z.object({
  type: z.literal("invoke"),
  call_id: z.string().min(1),
  tool: z.string().min(1),
  args: z.record(z.string(), z.unknown()),
  timeout_ms: z.number().int().positive().default(30_000),
});

/** Worker → Hub */
export const ResultFrame = z.object({
  type: z.literal("result"),
  call_id: z.string().min(1),
  ok: z.boolean(),
  output: z.string().optional(),
  error: z.string().optional(),
  truncated: z.boolean().optional(),
});

export const ProgressFrame = z.object({
  type: z.literal("progress"),
  call_id: z.string().min(1),
  chunk: z.string(),
});

export const PingFrame = z.object({
  type: z.literal("ping"),
  ts: z.number().optional(),
});

export const PongFrame = z.object({
  type: z.literal("pong"),
  ts: z.number().optional(),
});

export const WsFrame = z.discriminatedUnion("type", [
  HelloFrame,
  ReadyFrame,
  InvokeFrame,
  ResultFrame,
  ProgressFrame,
  PingFrame,
  PongFrame,
]);

export type WsFrame = z.infer<typeof WsFrame>;
export type HelloFrame = z.infer<typeof HelloFrame>;
export type InvokeFrame = z.infer<typeof InvokeFrame>;
export type ResultFrame = z.infer<typeof ResultFrame>;

/** SSE events for POST /chat */
export const SseDelta = z.object({
  type: z.literal("delta"),
  text: z.string(),
});

export const SseToolCall = z.object({
  type: z.literal("tool_call"),
  call_id: z.string(),
  tool: z.string(),
  args: z.record(z.string(), z.unknown()),
});

export const SseToolResult = z.object({
  type: z.literal("tool_result"),
  call_id: z.string(),
  ok: z.boolean(),
  output: z.string().optional(),
  error: z.string().optional(),
});

export const SseConfirm = z.object({
  type: z.literal("confirm"),
  token: z.string(),
  tool: z.string(),
  args: z.record(z.string(), z.unknown()),
  reason: z.string(),
});

export const SseDone = z.object({
  type: z.literal("done"),
  session_id: z.string(),
  resumed: z.boolean().optional(),
  error: z.string().optional(),
});

export const SseTruncated = z.object({
  type: z.literal("truncated"),
  dropped_turns: z.number().int().nonnegative(),
});

export const SseEvent = z.discriminatedUnion("type", [
  SseDelta,
  SseToolCall,
  SseToolResult,
  SseConfirm,
  SseDone,
  SseTruncated,
]);

export type SseEvent = z.infer<typeof SseEvent>;

export const TOOL_NAMES = ["fs.read", "fs.write", "shell.exec"] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

/** Map OpenAI-safe function names ↔ protocol tool ids */
export function toOpenAiToolName(tool: string): string {
  return tool.replaceAll(".", "_");
}

export function fromOpenAiToolName(name: string): string {
  if (name === "fs_read") return "fs.read";
  if (name === "fs_write") return "fs.write";
  if (name === "shell_exec") return "shell.exec";
  return name.replaceAll("_", ".");
}
