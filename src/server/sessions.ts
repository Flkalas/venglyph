import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { HubStore } from "./store.js";

export type RecordRow = {
  id: string;
  type: string;
  title: string | null;
  body: string | null;
  workspace_ref: string | null;
  channel: string | null;
  created_at: number;
  updated_at: number;
};

export type MessageRow = {
  id: string;
  record_id: string;
  seq: number;
  role: string;
  content: string | null;
  tool_calls: string | null;
  meta: string | null;
  created_at: number;
};

function now(): number {
  return Date.now();
}

export function upsertSession(
  store: HubStore,
  opts: { workspace: string; channel: string; title?: string },
): { id: string; resumed: boolean } {
  const workspace = opts.workspace;
  const channel = opts.channel;
  const existing = store.db
    .prepare(
      `SELECT id FROM records
       WHERE type = 'session' AND workspace_ref = ? AND channel = ?
       LIMIT 1`,
    )
    .get(workspace, channel) as { id: string } | undefined;

  if (existing) {
    store.db
      .prepare(`UPDATE records SET updated_at = ? WHERE id = ?`)
      .run(now(), existing.id);
    return { id: existing.id, resumed: true };
  }

  const id = randomUUID();
  const t = now();
  store.db
    .prepare(
      `INSERT INTO records (id, type, title, body, workspace_ref, channel, created_at, updated_at)
       VALUES (?, 'session', ?, NULL, ?, ?, ?, ?)`,
    )
    .run(id, opts.title ?? null, workspace, channel, t, t);
  return { id, resumed: false };
}

export function getSession(store: HubStore, id: string): RecordRow | undefined {
  return store.db
    .prepare(`SELECT * FROM records WHERE id = ? AND type = 'session'`)
    .get(id) as RecordRow | undefined;
}

export function listMessages(
  store: HubStore,
  recordId: string,
  afterSeq = 0,
): MessageRow[] {
  return store.db
    .prepare(
      `SELECT * FROM messages
       WHERE record_id = ? AND seq > ?
       ORDER BY seq ASC`,
    )
    .all(recordId, afterSeq) as MessageRow[];
}

export function nextSeq(db: DatabaseSync, recordId: string): number {
  const row = db
    .prepare(`SELECT COALESCE(MAX(seq), 0) AS m FROM messages WHERE record_id = ?`)
    .get(recordId) as { m: number };
  return row.m + 1;
}

export function appendMessage(
  store: HubStore,
  opts: {
    recordId: string;
    role: string;
    content?: string | null;
    toolCalls?: unknown;
    meta?: unknown;
  },
): MessageRow {
  const id = randomUUID();
  const seq = nextSeq(store.db, opts.recordId);
  const t = now();
  const toolCalls =
    opts.toolCalls === undefined ? null : JSON.stringify(opts.toolCalls);
  const meta = opts.meta === undefined ? null : JSON.stringify(opts.meta);
  store.db
    .prepare(
      `INSERT INTO messages (id, record_id, seq, role, content, tool_calls, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, opts.recordId, seq, opts.role, opts.content ?? null, toolCalls, meta, t);
  store.db
    .prepare(`UPDATE records SET updated_at = ? WHERE id = ?`)
    .run(t, opts.recordId);
  return {
    id,
    record_id: opts.recordId,
    seq,
    role: opts.role,
    content: opts.content ?? null,
    tool_calls: toolCalls,
    meta,
    created_at: t,
  };
}

export function searchRecords(
  store: HubStore,
  opts: { type?: string; q?: string; limit?: number },
): RecordRow[] {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
  const q = opts.q?.trim();
  if (opts.type && q) {
    const like = `%${q}%`;
    return store.db
      .prepare(
        `SELECT * FROM records
         WHERE type = ? AND (title LIKE ? OR body LIKE ? OR workspace_ref LIKE ?)
         ORDER BY updated_at DESC LIMIT ?`,
      )
      .all(opts.type, like, like, like, limit) as RecordRow[];
  }
  if (opts.type) {
    return store.db
      .prepare(
        `SELECT * FROM records WHERE type = ? ORDER BY updated_at DESC LIMIT ?`,
      )
      .all(opts.type, limit) as RecordRow[];
  }
  if (q) {
    const like = `%${q}%`;
    return store.db
      .prepare(
        `SELECT * FROM records
         WHERE title LIKE ? OR body LIKE ? OR workspace_ref LIKE ?
         ORDER BY updated_at DESC LIMIT ?`,
      )
      .all(like, like, like, limit) as RecordRow[];
  }
  return store.db
    .prepare(`SELECT * FROM records ORDER BY updated_at DESC LIMIT ?`)
    .all(limit) as RecordRow[];
}
