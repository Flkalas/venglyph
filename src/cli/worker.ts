import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { connectWorker } from "../worker/ws.js";

function parseArgs(args: string[]): {
  workspace: string;
  hubWs: string;
  token: string;
} {
  let workspace = process.cwd();
  let hubHttp = process.env.HUB_URL ?? "http://127.0.0.1:8787";
  let token = process.env.HUB_WORKER_TOKEN ?? "dev-worker-token";
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--workspace" || a === "-w") {
      workspace = resolve(args[++i] ?? workspace);
    } else if (a === "--hub") {
      hubHttp = args[++i] ?? hubHttp;
    } else if (a === "--token") {
      token = args[++i] ?? token;
    }
  }
  const u = new URL(hubHttp);
  u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
  u.pathname = "/v1/hub/worker";
  u.search = "";
  u.hash = "";
  return { workspace, hubWs: u.toString(), token };
}

export async function runWorkerCli(args: string[]): Promise<void> {
  const opts = parseArgs(args);
  const workerId = randomUUID();
  console.log(
    `worker ${workerId} → ${opts.hubWs}\nworkspace: ${opts.workspace}`,
  );
  await connectWorker({
    url: opts.hubWs,
    workerId,
    token: opts.token,
    workspace: opts.workspace,
  });
}
