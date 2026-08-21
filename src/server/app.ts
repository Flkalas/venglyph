import { Hono } from "hono";
import type { HubStore } from "./store.js";
import { storeHealth } from "./store.js";
import type { WorkerRegistry } from "./workers.js";
import type { ConfirmGate } from "./confirm.js";
import { sessionsRoutes } from "./routes/sessions.js";
import { recordsRoutes } from "./routes/records.js";
import { workersRoutes } from "./routes/workers.js";
import { chatRoutes } from "./routes/chat.js";
import { approveRoutes } from "./routes/approve.js";

export type AppEnv = {
  Variables: {
    store: HubStore;
  };
};

export type CreateAppOptions = {
  store: HubStore;
  workers: WorkerRegistry;
  confirm: ConfirmGate;
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
      workers: opts.workers.onlineCount(),
    });
  });

  app.route("/v1/hub/sessions", sessionsRoutes());
  app.route("/v1/hub/records", recordsRoutes());
  app.route("/v1/hub/workers", workersRoutes(opts.workers));
  app.route("/v1/hub/chat", chatRoutes(opts.workers, opts.confirm));
  app.route("/v1/hub/approve", approveRoutes(opts.confirm));

  return app;
}
