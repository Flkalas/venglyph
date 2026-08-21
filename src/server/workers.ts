import type { WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import type { InvokeFrame, ResultFrame } from "../shared/protocol.js";

export type WorkerInfo = {
  id: string;
  workspace: string;
  tools: string[];
  online: boolean;
  lastPongAt: number;
  missedPings: number;
  ws: WebSocket;
};

type PendingCall = {
  resolve: (result: ResultFrame) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class WorkerRegistry {
  private byId = new Map<string, WorkerInfo>();
  private pending = new Map<string, PendingCall>();

  register(info: Omit<WorkerInfo, "online" | "lastPongAt" | "missedPings">): WorkerInfo {
    const existing = this.byId.get(info.id);
    if (existing) {
      try {
        existing.ws.close();
      } catch {
        /* ignore */
      }
    }
    const worker: WorkerInfo = {
      ...info,
      online: true,
      lastPongAt: Date.now(),
      missedPings: 0,
    };
    this.byId.set(info.id, worker);
    return worker;
  }

  unregister(id: string): void {
    const w = this.byId.get(id);
    if (!w) return;
    w.online = false;
    this.byId.delete(id);
  }

  markPong(id: string): void {
    const w = this.byId.get(id);
    if (!w) return;
    w.lastPongAt = Date.now();
    w.missedPings = 0;
    w.online = true;
  }

  tickPing(sendPing: (w: WorkerInfo) => void): void {
    for (const w of this.byId.values()) {
      if (!w.online) continue;
      w.missedPings += 1;
      if (w.missedPings > 3) {
        w.online = false;
        try {
          w.ws.close();
        } catch {
          /* ignore */
        }
        this.byId.delete(w.id);
        continue;
      }
      sendPing(w);
    }
  }

  list(): Array<{
    id: string;
    workspace: string;
    online: boolean;
    tools: string[];
  }> {
    return [...this.byId.values()].map((w) => ({
      id: w.id,
      workspace: w.workspace,
      online: w.online,
      tools: w.tools,
    }));
  }

  onlineCount(): number {
    return [...this.byId.values()].filter((w) => w.online).length;
  }

  /** Prefer worker whose workspace matches (normalized). */
  pickForWorkspace(workspace: string): WorkerInfo | undefined {
    const norm = normalizePath(workspace);
    const online = [...this.byId.values()].filter((w) => w.online);
    const exact = online.find((w) => normalizePath(w.workspace) === norm);
    if (exact) return exact;
    return online[0];
  }

  handleResult(frame: ResultFrame): void {
    const pending = this.pending.get(frame.call_id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(frame.call_id);
    pending.resolve(frame);
  }

  invoke(
    worker: WorkerInfo,
    tool: string,
    args: Record<string, unknown>,
    timeoutMs = 30_000,
  ): Promise<ResultFrame> {
    const call_id = randomUUID();
    const frame: InvokeFrame = {
      type: "invoke",
      call_id,
      tool,
      args,
      timeout_ms: timeoutMs,
    };
    return new Promise<ResultFrame>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(call_id);
        reject(new Error(`invoke timeout: ${tool}`));
      }, timeoutMs);
      this.pending.set(call_id, { resolve, reject, timer });
      try {
        worker.ws.send(JSON.stringify(frame));
      } catch (err) {
        clearTimeout(timer);
        this.pending.delete(call_id);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }
}

function normalizePath(p: string): string {
  return p.replaceAll("\\", "/").replace(/\/+$/, "").toLowerCase();
}
