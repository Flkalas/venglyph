import { Hono } from "hono";
import type { AppEnv } from "../app.js";
import type { WorkerRegistry } from "../workers.js";

export function workersRoutes(registry: WorkerRegistry): Hono<AppEnv> {
  const r = new Hono<AppEnv>();
  r.get("/", (c) => {
    return c.json({ workers: registry.list() });
  });
  return r;
}
