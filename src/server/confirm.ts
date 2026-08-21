import { randomUUID } from "node:crypto";

export type PendingConfirm = {
  token: string;
  resolve: (approved: boolean) => void;
  createdAt: number;
};

/** In-memory approve tokens for SSE confirm → resume. */
export class ConfirmGate {
  private pending = new Map<string, PendingConfirm>();

  waitForApproval(timeoutMs = 300_000): {
    token: string;
    promise: Promise<boolean>;
  } {
    const token = randomUUID();
    let resolve!: (approved: boolean) => void;
    const promise = new Promise<boolean>((r) => {
      resolve = r;
    });
    this.pending.set(token, { token, resolve, createdAt: Date.now() });
    const timer = setTimeout(() => {
      const p = this.pending.get(token);
      if (!p) return;
      this.pending.delete(token);
      p.resolve(false);
    }, timeoutMs);
    void promise.finally(() => clearTimeout(timer));
    return { token, promise };
  }

  approve(token: string, approved: boolean): boolean {
    const p = this.pending.get(token);
    if (!p) return false;
    this.pending.delete(token);
    p.resolve(approved);
    return true;
  }
}
