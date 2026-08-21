import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { SCHEMA_SQL } from "./schema.js";

export type HubStore = {
  db: DatabaseSync;
  path: string;
  close: () => void;
};

export function openStore(dbPath: string): HubStore {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA_SQL);
  return {
    db,
    path: dbPath,
    close: () => db.close(),
  };
}

export function storeHealth(store: HubStore): { ok: true; path: string } {
  store.db.prepare("SELECT 1 AS ok").get();
  return { ok: true, path: store.path };
}
