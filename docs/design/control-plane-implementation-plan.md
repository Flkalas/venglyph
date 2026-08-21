# 제어평면 구현 계획서 (M0–M2)

> 상태: 계획 **v1** — 2026-08-20  
> 제품: **[VenGlyph](./venglyph-naming.md)**  
> 상위 설계: [personal-llm-work-hub.md](./personal-llm-work-hub.md) (v3.5). 이 문서는 그 7장(시작 지점)을 **실행 가능한 단위**로 쪼갠 것이다.  
> 범위: **제어평면 + 로컬 Worker + CLI**. 지식원천(Knowledge 인제스트·승격 루프·임베딩 검색)은 **이 계획서 밖**.

## 0. 이 계획의 한 줄

`records`/`messages` 테이블 하나와 아웃바운드 페어링 Worker 하나로 **"같은 workspace 키로 CLI를 다시 열면 대화가 이어지고, 로컬 파일을 Worker가 만진다"** 를 증명한다. 그 외 전부 후속.

### 왜 제어평면 먼저인가 (요약)

| 근거 | 내용 |
| --- | --- |
| 의존 방향 | 제어평면은 지식원천 없이 검증되지만 반대는 불가 — 소비자 없는 Store는 스키마가 추측이 된다 |
| 열린 질문 | 상위 문서 Q7(검색 방식)·Q9(승격 트리거)는 "무엇이 첨부되어야 했나"를 굴려본 뒤에 답이 나온다 |
| 되돌리는 비용 | 관제 스켈레톤은 버려도 싸다. Mimir/위키 이관은 비싸고 되돌리기 어렵다 |

**대신 SSOT의 씨앗은 심는다:** `records(type)` 스키마를 처음부터 두고 `type=session` 행만 쓴다. 나중에 지식원천은 **스키마 변경이 아니라 행 추가**가 된다.

---

## 1. 배치 결정 (이번 스파이크에서 고정)

| 항목 | 결정 | 근거 / 대안을 버린 이유 |
| --- | --- | --- |
| 코드 위치 | 이 레포 `src/**`, CLI `venglyph` | 관제·Worker·CLI는 VenGlyph. 1min 어댑터는 형제 레포 `one-min-mcp`에서 재사용(패키지/경로 연결) |
| 런타임 | Node 24 + TypeScript + Hono | `one-min-mcp`와 동일 계열 스택 |
| Store | **`node:sqlite`** (내장, WAL) 단일 파일 | 의존성 0. Postgres 교체는 4.2 Memory 계약 뒤에서 |
| 검색 | M1은 `LIKE` 한 줄 스텁 | 인덱스 설계를 소비 패턴보다 먼저 하지 않는다. FTS5/임베딩은 M2+ |
| 프로바이더 | 1min 하나 (`one-min-mcp`의 `OneMinClient`) | Auto는 M2 규칙표까지 스텁 |
| Worker 링크 | **아웃바운드 WebSocket only** (Worker → 관제) | 상위 Q2 결정. NAT·방화벽 뒤에서 동작. 관제가 Worker로 접속 시도 안 함 |
| 첫 표면 | **CLI** | 상위 Q3 결정. 스킨 패턴을 UI 비용 없이 검증하는 유일한 표면 |
| 세션 키 | `workspace` 절대경로 + `channel` | 재개 조건이 "같은 폴더에서 다시 열기"이므로 |
| 루프 | 관제 오케스트레이션 + Worker executor | 상위 Q4를 이 방향으로 잠정 고정 (Pi 임베드 안 함) |

```text
CLI (src/cli/)                    로컬 Worker (src/worker/)
  │  POST /v1/hub/chat (SSE)         │  ws  ← 아웃바운드만
  ▼                                  ▼
┌──────────── 제어평면  src/server/ ────────────────┐
│ routes: sessions · chat · records · worker(ws)    │
│ store: node:sqlite  (records · messages · links)  │
│ assemble: 현재 세션 + LIKE 검색 (예산 truncate)   │
│ route: Auto 스텁 → OneMinClient (one-min-mcp)     │
│ dispatch: tool_calls → danger-gate → Worker       │
└───────────────────────────────────────────────────┘
```

---

## 2. 데이터 모델 (M1에 실제로 만드는 것)

```sql
-- 존재: 무차원 공간의 구별 가능한 레코드 (상위 문서 4장)
CREATE TABLE records (
  id            TEXT PRIMARY KEY,          -- 구별자
  type          TEXT NOT NULL,             -- 'session' | 'knowledge' | 'skill'
  title         TEXT,
  body          TEXT,                      -- session: 요약/포인터 (턴은 messages)
  workspace_ref TEXT,                      -- Worker cwd 바인딩 (선택)
  channel       TEXT,                      -- 'cli' | 'web' | 'tg' | 'ide'
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX records_type_ws ON records(type, workspace_ref);

-- 핫 경로: 턴 append (같은 Store, 상위 문서 4.1)
CREATE TABLE messages (
  id         TEXT PRIMARY KEY,
  record_id  TEXT NOT NULL REFERENCES records(id),
  seq        INTEGER NOT NULL,
  role       TEXT NOT NULL,                -- user | assistant | tool | system
  content    TEXT,
  tool_calls TEXT,                         -- JSON
  meta       TEXT,                          -- JSON: model, usage, worker_id
  created_at INTEGER NOT NULL,
  UNIQUE(record_id, seq)
);

-- 크로스 레프 (M1은 테이블만; 채우기는 M2)
CREATE TABLE links (
  src_id TEXT NOT NULL, dst_id TEXT NOT NULL, kind TEXT,
  PRIMARY KEY (src_id, dst_id, kind)
);
```

**M1에서 쓰지 않는 것:** `embedding` 컬럼, `type=knowledge|skill` 행, `links` 채우기, 승격 루프. 컬럼·테이블만 예약한다.

---

## 3. API 계약

### 3.1 제어평면 HTTP (`/v1/hub`)

| 메서드 · 경로 | 요청 | 응답 | 단계 |
| --- | --- | --- | --- |
| `POST /sessions` | `{workspace, channel, title?}` | `{id, resumed: bool}` — 같은 `(workspace, channel)` 있으면 재사용 | M1 |
| `GET /sessions/:id/messages` | `?after=seq` | `{messages[]}` | M1 |
| `POST /chat` | `{workspace, channel, text, session_id?}` | **SSE**: `delta` · `tool_call` · `tool_result` · `done` | M1 |
| `GET /records` | `?type=&q=&limit=` | `{records[]}` — LIKE 스텁 | M1 |
| `GET /workers` | — | `{workers[]: {id, workspace, online, tools[]}}` | M1 |
| `GET /healthz` | — | `{ok, store, workers}` | M0 |

SSE 프레임은 OpenAI 스타일 `data: {json}\n\n` 로 두어 채널 어댑터가 나중에 그대로 재사용한다.

### 3.2 Worker 프로토콜 (WebSocket `/v1/hub/worker`)

Worker가 접속하고, 관제가 `invoke`를 내려보낸다. Worker는 **절대 Store를 조회하지 않는다** (상위 문서 비목표).

| 방향 | 프레임 | 페이로드 |
| --- | --- | --- |
| W→C | `hello` | `{worker_id, token, workspace, tools[], version}` |
| C→W | `ready` | `{session_hint?}` |
| C→W | `invoke` | `{call_id, tool, args, timeout_ms}` |
| W→C | `result` | `{call_id, ok, output?, error?, truncated?}` |
| W→C | `progress` | `{call_id, chunk}` (shell stdout tail) |
| 양방향 | `ping`/`pong` | 15s 하트비트, 3회 실패 시 offline 표시 |

**M1 툴 3개:** `fs.read {path, max_bytes}` · `fs.write {path, content}` · `shell.exec {cmd, cwd, timeout_ms}`.  
경로는 Worker의 `workspace` 루트 밖이면 거부 (경로 정규화 후 prefix 검사).

### 3.3 danger-gate (M0, Worker 호출 **직전**)

관제 측 순수 코드. 3-tier:

| tier | 판정 | 동작 |
| --- | --- | --- |
| `allow` | `fs.read`, 화이트리스트 shell (`git status`, `ls`, `rg`…) | 즉시 invoke |
| `confirm` | `fs.write`, 그 외 shell | SSE `confirm` 프레임 → CLI가 y/n → 승인 토큰으로 재개 |
| `deny` | `rm -rf /`, `sudo`, `mkfs`, `dd of=/dev/`, `curl \| sh`, 히스토리 조작 | 거부 사유를 세션에 append |

규칙은 `src/server/dangerGate.ts` 한 파일 + 단위 테스트. FA(full-auto) 플래그는 `confirm` tier만 자동 승인하고 `deny`는 못 넘긴다.

---

## 4. 마일스톤 · 수용 기준

상위 문서 7.2의 M0–M2를 파일 단위로 편 것.

### M0 — 골격 + 게이트 (반나절~1일)

| 산출물 | 내용 |
| --- | --- |
| `src/server/{app,store,schema}.ts` | Hono 앱, `node:sqlite` 마이그레이션, `/healthz` |
| `src/server/dangerGate.ts` (+`.test.ts`) | 3-tier 규칙, deny 패턴 |
| `src/cli.ts` | `venglyph` / `hub` 서브커맨드 |
| `.env.example` | `HUB_DB_PATH`, `HUB_PORT`, `HUB_WORKER_TOKEN`, `HUB_FA` |

**수용:** `pnpm dev:hub` → `/healthz` 200, DB 파일 생성, `node --test`로 danger-gate 규칙 통과.

### M1 — 관제 SSOT + 로컬 Worker + CLI (본 스파이크)

| 산출물 | 내용 |
| --- | --- |
| `src/server/routes/{sessions,chat,records,workers}.ts` | 3.1 계약 |
| `src/server/assemble.ts` | 현재 세션 turn + LIKE 검색 결과를 토큰 예산 안에서 `messages[]` 조립 (초과는 오래된 것부터 truncate) |
| `src/server/route.ts` | Auto **스텁**: 기본 모델 1개, `code` 힌트면 code 모델 |
| `src/server/dispatch.ts` | `tool_calls` → danger-gate → Worker `invoke` → `role: tool` append → 루프 |
| `src/worker/{index,ws,tools}.ts` | 아웃바운드 ws, `fs.read`/`fs.write`/`shell.exec`, workspace 샌드박스 |
| `src/cli/` | `hub chat` — SSE 소비, `confirm` 프롬프트, `--workspace` 기본 cwd |

**수용 (상위 문서 스파이크 기준 그대로):**
1. `hub worker --workspace ~/proj` 기동 → `/v1/hub/workers`에 online.
2. `hub chat` 에서 "이 폴더 README 첫 줄 알려줘" → Worker `fs.read` 결과가 답에 반영.
3. "파일 하나 만들어" → `confirm` 프롬프트 → 승인 후 로컬에 실제 생성.
4. CLI 종료 후 **같은 workspace**에서 재실행 → 이전 턴이 컨텍스트에 붙는다 (`resumed: true`).
5. `rm -rf /` 요청 → `deny`, 세션에 거부 기록, Worker에 프레임 안 감.

### M2 — Auto 규칙 + 두 번째 손·표면 + 검색

| 산출물 | 내용 |
| --- | --- |
| `route.ts` 규칙표 1차 | 상위 Q6 — 길이·코드성·비용 기준 (별도 표로 문서화) |
| 원격 Worker | 같은 프로토콜, `workspace` = 원격 루트 (상위 Q8 결정 필요) |
| 채널 1개 (웹 or TG) | 얇은 어댑터, SSE 재사용 |
| Store 검색 승격 | LIKE → SQLite FTS5 (`node:sqlite` FTS5 가용성 **선검증 필요**), 세션 id 첨부 |
| 승격 루프 **스텁** | 세션 종료 시 요약 1회 → `records.body` 갱신 (원본 id 유지) |

---

## 5. 파일 배치

```text
src/
  server/  app.ts store.ts schema.ts assemble.ts route.ts dispatch.ts
           dangerGate.ts(+test)  routes/{sessions,chat,records,workers,workerWs}.ts
  worker/  index.ts ws.ts tools.ts sandbox.ts
  cli/     index.ts sse.ts
  shared/  protocol.ts   # zod 스키마 — 3.2 프레임을 서버·Worker가 공유
```

`shared/protocol.ts`를 zod로 한 곳에 두는 것이 이 스파이크의 유일한 "구조적" 투자다. 프레임 계약이 곧 검증 대상이므로.  
1min 호출·tools protocol은 형제 `one-min-mcp`의 클라이언트를 의존으로 쓴다 (이 레포에 복제하지 않음).

---

## 6. 리스크

| 리스크 | 신호 | 대응 |
| --- | --- | --- |
| 1min이 네이티브 `tool_calls` 없음 (`one-min-mcp` `docs/gateway/tools-protocol-experiment.md`) | 루프가 안 돎 | `ONEMIN_TOOLS_PROTOCOL=json` 경로 재사용. M1 수용 기준을 이 모드로 측정 |
| `node:sqlite` FTS5 미포함 가능 | M2 검색 승격 막힘 | M1은 LIKE라 영향 없음. M2 착수 전 1줄 프로브로 확인, 없으면 `better-sqlite3` 또는 외부 인덱스 |
| WebSocket 서버 | Hono/node-server 위 ws 업그레이드 | `@hono/node-ws` 또는 `ws` 직결. 안 되면 M1은 롱폴 `GET /worker/next` + `POST /worker/result`로 대체 (계약 동일) |
| 스코프 크립 | Knowledge 인제스트·VS Code UI에 손이 감 | 상위 문서 7.1 "시작 단계에서 하지 말 것" 목록을 리뷰 체크리스트로 씀 |
| 토큰 예산 초과 | 컨텍스트 에러 | `assemble.ts`가 예산 넘으면 오래된 턴부터 자르고, 자른 사실을 프레임으로 알림 |

## 7. 이 계획으로 닫히는/남는 질문

| 상위 Q | 상태 |
| --- | --- |
| Q1 LLM 호출 항상 원격 | **닫음** — 예, 관제만 프로바이더를 호출 |
| Q2 페어링 | **닫음** — 아웃바운드 only |
| Q3 첫 채널 | **닫음** — CLI |
| Q4 루프 위치 | **잠정** — 관제 오케스트 + Worker executor |
| Q6 Auto 규칙표 · Q8 원격 루트 | M2 착수 시 |
| Q5 one-min MCP 축소 목록 · Q7 검색 방식 · Q9 승격 트리거 | **미정 (의도적)** — M1 사용 로그를 보고 결정 |
