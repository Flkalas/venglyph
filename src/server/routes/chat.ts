import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import type { AppEnv } from "../app.js";
import type { WorkerRegistry } from "../workers.js";
import type { ConfirmGate } from "../confirm.js";
import { runChatTurn } from "../dispatch.js";
import type { SseEvent } from "../../shared/protocol.js";

const ChatBody = z.object({
  workspace: z.string().min(1),
  channel: z.string().min(1).default("cli"),
  text: z.string().min(1),
  session_id: z.string().optional(),
});

export function chatRoutes(
  workers: WorkerRegistry,
  confirm: ConfirmGate,
): Hono<AppEnv> {
  const r = new Hono<AppEnv>();

  r.post("/", async (c) => {
    const body = ChatBody.parse(await c.req.json());
    const store = c.get("store");

    return streamSSE(c, async (stream) => {
      const emit = async (event: SseEvent) => {
        await stream.writeSSE({
          event: event.type,
          data: JSON.stringify(event),
        });
      };
      try {
        await runChatTurn(
          { store, workers, confirm, emit },
          {
            workspace: body.workspace,
            channel: body.channel,
            text: body.text,
            sessionId: body.session_id,
          },
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await emit({
          type: "done",
          session_id: body.session_id ?? "",
          error: msg,
        });
      }
    });
  });

  return r;
}
