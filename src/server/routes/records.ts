import { Hono } from "hono";
import type { AppEnv } from "../app.js";
import { searchRecords } from "../sessions.js";

export function recordsRoutes(): Hono<AppEnv> {
  const r = new Hono<AppEnv>();
  r.get("/", (c) => {
    const type = c.req.query("type") ?? undefined;
    const q = c.req.query("q") ?? undefined;
    const limit = c.req.query("limit")
      ? Number(c.req.query("limit"))
      : undefined;
    const records = searchRecords(c.get("store"), { type, q, limit });
    return c.json({ records });
  });
  return r;
}
