import { Hono } from "hono";
import type { HubStore } from "./store.js";
import { storeHealth } from "./store.js";

export type AppEnv = {
  Variables: {
    store: HubStore;
  };
};

export type CreateAppOptions = {
  store: HubStore;
  getWorkersOnline?: () => number;
};

export function createApp(opts: CreateAppOptions): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
    c.set("store", opts.store);
    await next();
  });

  app.get("/v1/hub/healthz", (c) => {
    const health = storeHealth(opts.store);
    return c.json({
      ok: true,
      store: health,
      workers: opts.getWorkersOnline?.() ?? 0,
    });
  });

  return app;
}
