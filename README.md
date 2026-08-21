# VenGlyph

개인 LLM 작업 허브 — 여러 창(IDE · 메신저 · 웹 · CLI)이 하나의 원격 관제(**Ven**)를 보고, 대화·작업 맥락을 영구 기억(**Glyph**)으로 남긴다. 실행은 Worker(손).

| 문서 | 내용 |
| --- | --- |
| [docs/design/venglyph-naming.md](docs/design/venglyph-naming.md) | 네이밍 기원·철학 |
| [docs/design/personal-llm-work-hub.md](docs/design/personal-llm-work-hub.md) | 상위 설계 |
| [docs/design/control-plane-implementation-plan.md](docs/design/control-plane-implementation-plan.md) | 제어평면 M0–M2 |
| [docs/notes/google-ai/](docs/notes/google-ai/) | 설계 탐색 메모 |
| [docs/benchmarks/](docs/benchmarks/) | LLM 성능·파레토 참고 |
| [docs/usage/](docs/usage/) | 사용량·토큰·가격 실측 |
| [docs/sessions/](docs/sessions/) | Hermes 세션 export |

## 관심사 분리

| 레포 | 담당 |
| --- | --- |
| **venglyph** (여기) | 관제 · Store · Worker · 채널 스킨 · 벤치/비용 참고 |
| `one-min-mcp` | 1min.ai MCP · OpenAI 호환 게이트웨이 · tools protocol |
| `hermes-ops` | Hermes / OpenRouter / LM Studio 호스트 운영 |

## 상태

제어평면 M0+M1 구현 중 (`feat/control-plane`). 설계·벤치·사용량 문서는 `docs/` 참고.

## 실행 (Hub)

요구: Node 24+, pnpm, 로컬 llmster/LM Studio (`HUB_LLM_BASE_URL`).

```powershell
pnpm install
copy .env.example .env   # 필요 시 수정
pnpm dev:hub             # http://127.0.0.1:8787
# 다른 터미널
pnpm exec venglyph hub worker --workspace .
pnpm exec venglyph hub chat "README 첫 줄 알려줘"
```

| 스크립트 | 역할 |
| --- | --- |
| `pnpm dev:hub` | Hub HTTP 서버 (tsx) |
| `pnpm typecheck` | TypeScript 검사 |
| `pnpm test` | `node:test` (dangerGate 등) |

## 환경 변수

| 키 | 기본 | 설명 |
| --- | --- | --- |
| `HUB_PORT` | `8787` | Hub HTTP 포트 |
| `HUB_HOST` | `127.0.0.1` | bind 주소 |
| `HUB_DB_PATH` | `./data/hub.db` | SQLite WAL 파일 |
| `HUB_WORKER_TOKEN` | (example) | Worker `hello` 공유 비밀 |
| `HUB_FA` | `0` | `1`이면 confirm만 자동 승인 (deny 불가) |
| `HUB_LLM_BASE_URL` | `http://127.0.0.1:1234/v1` | llmster OpenAI 호환 |
| `HUB_LLM_MODEL` | `qwen/qwen3.5-9b` | 기본 chat 모델 |
| `HUB_LLM_CODE_MODEL` | (같음) | code 힌트 시 모델 id |
