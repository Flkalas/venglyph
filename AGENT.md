# AGENT.md

이 레포(VenGlyph)에서 일하는 에이전트를 위한 규약.

## 커밋: 의미 단위마다 즉시

**작업 하나가 끝날 때까지 모아두지 않는다.** 변경이 "하나의 의미 단위"를 이루는 순간 바로 커밋한다. 사용자에게 커밋 여부를 다시 묻지 않는다 — 이 문서가 상시 승인이다.

### 의미 단위란

| 커밋 하나 | 예 |
| --- | --- |
| 한 가지 동작 변경 | 파서가 새 형식을 인식하게 됨 |
| 한 문서의 완결된 추가/개정 | `docs/design/*.md` 한 편 |
| 한 가지 리팩터 | 함수 추출, 모듈 이동 (동작 변경 없음) |
| 설정·의존성 변경 | env 키 추가, 패키지 추가 |
| 인덱스 갱신 | 새 문서에 딸린 README 링크 → **문서와 같은 커밋** |

### 쪼개는 기준

- **동작 변경과 리팩터를 섞지 않는다.** 섞였으면 리팩터 먼저 커밋하고 동작 변경을 다음 커밋으로.
- 한 커밋 메시지에 "그리고"가 필요하면 두 커밋이다.
- 각 커밋은 **단독으로 typecheck/test를 통과**해야 한다. 통과 못 하는 중간 상태는 다음 단위와 합친다.
- 포맷팅만 있는 변경은 별도 `style:` 커밋.

### 하지 않는 것

- `git push` — **명시적 요청이 있을 때만**.
- `main`에 직접 커밋 — 사용자가 브랜치를 지정하지 않았고 변경이 사소하지 않으면 브랜치를 먼저 만든다. 문서 단건·오타 수정은 `main` 허용.
- `git add -A` 로 무관한 파일 끌어오기 — 그 단위에 속한 경로만 stage.
- `--amend` / rebase 로 이미 만든 단위를 되감기 (사용자 요청 시에만).

## 커밋 메시지

Conventional Commits, 영문 소문자, 명령형, 마침표 없음.

```text
docs: add control plane implementation plan
feat: add hub sessions and chat routes
fix: reject shell.exec paths outside the worker workspace
chore: ignore sqlite files
```

| prefix | 쓰는 곳 |
| --- | --- |
| `feat` | 새 동작 |
| `fix` | 잘못된 동작 교정 |
| `docs` | `docs/`, README, 이 파일 |
| `refactor` | 동작 불변 구조 변경 |
| `chore` | 설정, 스크립트, ignore, 의존성 |
| `style` | 포맷·공백 |
| `test` | 테스트만 |

## 커밋 전 확인

| 변경 | 실행 |
| --- | --- |
| `src/**` | `pnpm typecheck` — 실패하면 커밋하지 않는다 |
| `src/**` 중 테스트 있는 모듈 | `pnpm test` |
| `docs/**` | 새 문서면 해당 폴더 README + `docs/README.md` 링크를 같은 커밋에 포함 |
| `.env.example` 키 추가 | README에 설명 추가를 같은 커밋에 포함 |

비밀값(`.env`, API 키, 토큰)이 diff에 있으면 커밋을 중단하고 사용자에게 알린다.

## 보고

턴 끝에 만든 커밋을 한 줄씩 요약한다 (`<sha> <subject>`).

## 이 레포 문맥

- 문서 기본 언어는 한국어, 코드·식별자·커밋 메시지는 영어.
- 제품명: **VenGlyph** — [docs/design/venglyph-naming.md](docs/design/venglyph-naming.md).
- 설계: [docs/design/personal-llm-work-hub.md](docs/design/personal-llm-work-hub.md).
- 구현 계획: [docs/design/control-plane-implementation-plan.md](docs/design/control-plane-implementation-plan.md).
- 형제 레포 `one-min-mcp`: 1min 프로바이더 어댑터·OpenAI/MCP 게이트웨이 (후속 멀티프로바이더용). M1 LLM은 로컬 llmster.
