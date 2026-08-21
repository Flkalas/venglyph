import { serve } from "@hono/node-server";
import { resolve } from "node:path";
import { createApp } from "../server/app.js";
import { openStore } from "../server/store.js";

export async function runHub(args: string[]): Promise<void> {
  const cmd = args[0] ?? "help";
  switch (cmd) {
    case "server":
      await startServer();
      break;
    case "chat":
      console.error("hub chat is not implemented yet (M1)");
      process.exitCode = 1;
      break;
    case "worker":
      console.error("hub worker is not implemented yet (M1)");
      process.exitCode = 1;
      break;
    case "help":
    default:
      console.log(`hub commands:
  hub server     Start hub HTTP + store
  hub chat       Chat (M1)
  hub worker     Local worker (M1)
`);
      if (cmd !== "help") process.exitCode = 1;
  }
}

async function startServer(): Promise<void> {
  const port = Number(process.env.HUB_PORT ?? "8787");
  const host = process.env.HUB_HOST ?? "127.0.0.1";
  const dbPath = resolve(process.cwd(), process.env.HUB_DB_PATH ?? "./data/hub.db");
  const store = openStore(dbPath);
  const app = createApp({ store });

  console.log(`VenGlyph hub listening on http://${host}:${port}`);
  console.log(`store: ${dbPath}`);

  serve({ fetch: app.fetch, port, hostname: host });
}
