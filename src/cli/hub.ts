import { createServer } from "node:http";
import { getRequestListener } from "@hono/node-server";
import { resolve } from "node:path";
import { createApp } from "../server/app.js";
import { openStore } from "../server/store.js";
import { WorkerRegistry } from "../server/workers.js";
import { ConfirmGate } from "../server/confirm.js";
import { createWorkerWsServer } from "../server/routes/workerWs.js";
import { runChatCli } from "./chat.js";
import { runWorkerCli } from "./worker.js";

export async function runHub(args: string[]): Promise<void> {
  const cmd = args[0] ?? "help";
  switch (cmd) {
    case "server":
      await startServer();
      break;
    case "chat":
      await runChatCli(args.slice(1));
      break;
    case "worker":
      await runWorkerCli(args.slice(1));
      break;
    case "help":
    default:
      console.log(`hub commands:
  hub server                 Start hub HTTP + worker WS
  hub chat [text]            Chat via SSE (--workspace)
  hub worker                 Local worker (--workspace)
`);
      if (cmd !== "help") process.exitCode = 1;
  }
}

async function startServer(): Promise<void> {
  const port = Number(process.env.HUB_PORT ?? "8787");
  const host = process.env.HUB_HOST ?? "127.0.0.1";
  const dbPath = resolve(
    process.cwd(),
    process.env.HUB_DB_PATH ?? "./data/hub.db",
  );
  const token = process.env.HUB_WORKER_TOKEN ?? "dev-worker-token";

  const store = openStore(dbPath);
  const workers = new WorkerRegistry();
  const confirm = new ConfirmGate();
  const app = createApp({ store, workers, confirm });
  const { handleUpgrade, startHeartbeat } = createWorkerWsServer({
    registry: workers,
    token,
  });

  const server = createServer(getRequestListener(app.fetch));
  server.on("upgrade", handleUpgrade);
  const stopHeartbeat = startHeartbeat();

  server.listen(port, host, () => {
    console.log(`VenGlyph hub listening on http://${host}:${port}`);
    console.log(`worker ws: ws://${host}:${port}/v1/hub/worker`);
    console.log(`store: ${dbPath}`);
  });

  const shutdown = () => {
    stopHeartbeat();
    server.close();
    store.close();
  };
  process.on("SIGINT", () => {
    shutdown();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    shutdown();
    process.exit(0);
  });
}
