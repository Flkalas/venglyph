import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, type WebSocket } from "ws";
import {
  HelloFrame,
  PingFrame,
  PongFrame,
  ResultFrame,
  type WsFrame,
} from "../../shared/protocol.js";
import type { WorkerRegistry } from "../workers.js";

export type WorkerWsOptions = {
  registry: WorkerRegistry;
  token: string;
};

export function createWorkerWsServer(opts: WorkerWsOptions): {
  wss: WebSocketServer;
  handleUpgrade: (
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
  ) => void;
  startHeartbeat: () => () => void;
} {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
    let workerId: string | null = null;

    ws.on("message", (raw) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(raw));
      } catch {
        ws.send(JSON.stringify({ type: "error", error: "invalid json" }));
        return;
      }
      const type = (parsed as { type?: string }).type;
      if (type === "hello") {
        const hello = HelloFrame.safeParse(parsed);
        if (!hello.success) {
          ws.send(
            JSON.stringify({ type: "error", error: hello.error.message }),
          );
          ws.close();
          return;
        }
        if (hello.data.token !== opts.token) {
          ws.send(JSON.stringify({ type: "error", error: "unauthorized" }));
          ws.close();
          return;
        }
        const info = opts.registry.register({
          id: hello.data.worker_id,
          workspace: hello.data.workspace,
          tools: hello.data.tools,
          ws,
        });
        workerId = info.id;
        ws.send(JSON.stringify({ type: "ready" }));
        return;
      }

      if (type === "pong") {
        const pong = PongFrame.safeParse(parsed);
        if (pong.success && workerId) opts.registry.markPong(workerId);
        return;
      }

      if (type === "ping") {
        const ping = PingFrame.safeParse(parsed);
        if (ping.success) {
          ws.send(JSON.stringify({ type: "pong", ts: Date.now() } satisfies WsFrame));
        }
        return;
      }

      if (type === "result") {
        const result = ResultFrame.safeParse(parsed);
        if (result.success) opts.registry.handleResult(result.data);
        return;
      }
    });

    ws.on("close", () => {
      if (workerId) opts.registry.unregister(workerId);
    });
  });

  const handleUpgrade = (
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
  ) => {
    const url = req.url ?? "";
    if (!url.startsWith("/v1/hub/worker")) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  };

  const startHeartbeat = () => {
    const timer = setInterval(() => {
      opts.registry.tickPing((w) => {
        try {
          w.ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        } catch {
          /* ignore */
        }
      });
    }, 15_000);
    return () => clearInterval(timer);
  };

  return { wss, handleUpgrade, startHeartbeat };
}
