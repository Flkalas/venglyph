import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../app.js";
import type { ConfirmGate } from "../confirm.js";

const ApproveBody = z.object({
  token: z.string().min(1),
  approved: z.boolean(),
});

export function approveRoutes(confirm: ConfirmGate): Hono<AppEnv> {
  const r = new Hono<AppEnv>();
  r.post("/", async (c) => {
    const body = ApproveBody.parse(await c.req.json());
    const ok = confirm.approve(body.token, body.approved);
    if (!ok) return c.json({ ok: false, error: "unknown or expired token" }, 404);
    return c.json({ ok: true });
  });
  return r;
}
