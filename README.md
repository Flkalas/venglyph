# VenGlyph

개인 LLM 작업 허브 — 여러 창(IDE · 메신저 · 웹 · CLI)이 하나의 원격 관제(**Ven**)를 보고, 대화·작업 맥락을 영구 기억(**Glyph**)으로 남긴다. 실행은 Worker(손).

| 문서 | 내용 |
| --- | --- |
| [docs/design/venglyph-naming.md](docs/design/venglyph-naming.md) | 네이밍 기원·철학 |
| [docs/design/personal-llm-work-hub.md](docs/design/personal-llm-work-hub.md) | 상위 설계 |
| [docs/design/control-plane-implementation-plan.md](docs/design/control-plane-implementation-plan.md) | 제어평면 M0–M2 |
| [docs/benchmarks/](docs/benchmarks/) | LLM 성능·파레토 참고 |
| [docs/usage/](docs/usage/) | 사용량·토큰·가격 실측 |

## 관심사 분리

| 레포 | 담당 |
| --- | --- |
| **venglyph** (여기) | 관제 · Store · Worker · 채널 스킨 · 벤치/비용 참고 |
| `one-min-mcp` | 1min.ai MCP · OpenAI 호환 게이트웨이 · tools protocol |

## 상태

설계·벤치·사용량 문서 이관 완료. 구현은 제어평면 계획서 M0부터.
