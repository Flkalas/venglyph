import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../app.js";
import { upsertSession, listMessages, getSession } from "../sessions.js";

const CreateSession = z.object({
  workspace: z.string().min(1),
  channel: z.string().min(1).default("cli"),
  title: z.string().optional(),
});

export function sessionsRoutes(): Hono<AppEnv> {
  const r = new Hono<AppEnv>();

  r.post("/", async (c) => {
    const body = CreateSession.parse(await c.req.json());
    const result = upsertSession(c.get("store"), body);
    return c.json(result);
  });

  r.get("/:id/messages", (c) => {
    const id = c.req.param("id");
    const after = Number(c.req.query("after") ?? "0");
    const session = getSession(c.get("store"), id);
    if (!session) return c.json({ error: "session not found" }, 404);
    const messages = listMessages(c.get("store"), id, Number.isFinite(after) ? after : 0);
    return c.json({ messages });
  });

  return r;
}
