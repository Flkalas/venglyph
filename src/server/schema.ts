/** DDL for VenGlyph hub store (records / messages / links). */

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS records (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,
  title         TEXT,
  body          TEXT,
  workspace_ref TEXT,
  channel       TEXT,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS records_type_ws ON records(type, workspace_ref);

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  record_id  TEXT NOT NULL REFERENCES records(id),
  seq        INTEGER NOT NULL,
  role       TEXT NOT NULL,
  content    TEXT,
  tool_calls TEXT,
  meta       TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(record_id, seq)
);

CREATE TABLE IF NOT EXISTS links (
  src_id TEXT NOT NULL,
  dst_id TEXT NOT NULL,
  kind   TEXT NOT NULL,
  PRIMARY KEY (src_id, dst_id, kind)
);
`;
