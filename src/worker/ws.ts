import WebSocket from "ws";
import {
  InvokeFrame,
  type WsFrame,
} from "../shared/protocol.js";
import { runTool } from "./tools.js";

export type ConnectOptions = {
  url: string;
  workerId: string;
  token: string;
  workspace: string;
  tools?: string[];
};

export function connectWorker(opts: ConnectOptions): Promise<void> {
  const tools = opts.tools ?? ["fs.read", "fs.write", "shell.exec"];
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(opts.url);

    ws.on("open", () => {
      const hello = {
        type: "hello" as const,
        worker_id: opts.workerId,
        token: opts.token,
        workspace: opts.workspace,
        tools,
        version: "1",
      };
      ws.send(JSON.stringify(hello));
    });

    ws.on("message", async (raw) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(raw));
      } catch {
        return;
      }
      const type = (parsed as { type?: string }).type;
      if (type === "ready") {
        console.log("worker ready");
        return;
      }
      if (type === "ping") {
        ws.send(JSON.stringify({ type: "pong", ts: Date.now() } satisfies WsFrame));
        return;
      }
      if (type === "invoke") {
        const inv = InvokeFrame.safeParse(parsed);
        if (!inv.success) {
          ws.send(
            JSON.stringify({
              type: "result",
              call_id: (parsed as { call_id?: string }).call_id ?? "unknown",
              ok: false,
              error: inv.error.message,
            }),
          );
          return;
        }
        const result = await runTool(
          opts.workspace,
          inv.data.tool,
          inv.data.args,
        );
        ws.send(
          JSON.stringify({
            type: "result",
            call_id: inv.data.call_id,
            ok: result.ok,
            output: result.output,
            error: result.error,
            truncated: result.truncated,
          }),
        );
      }
    });

    ws.on("error", (err) => {
      console.error("worker ws error", err);
      reject(err);
    });

    ws.on("close", () => {
      console.log("worker disconnected");
      resolve();
    });
  });
}
