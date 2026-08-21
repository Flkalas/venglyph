# Personal LLM Work Hub (VenGlyph)

> 상태: 초안 **v3.5** — 관제+Worker; 대화=구별 가능한 기억; **통일 Store + 대화→기억 승격 루프** (Memory/Conversation 분리는 옵션)  
> 제품명: **[VenGlyph](./venglyph-naming.md)** (네이밍 기원)  
> 관련 탐색 메모: 형제 레포 `one-min-mcp`의 `docs/notes/google-ai/` (Hermes vs IDE friction 등)

## 의도 (한 문장)

**텔레그램 · 웹 · VS Code** 가 **하나의 원격 관제**를 보고, **대화는 id로 구별되는 기억 존재**로 통일 Store에 올라가 지식·스킬과 같은 무차원 공간에서 검색·링크되며, **내부 승격 루프**가 대화를 요약·파일화해 기억으로 전환한다(원본 대화 id는 유지). 실행은 Worker. 관제는 코드 중심. 모델 UX 기본은 Auto.

---

## 0. 문제 / 성공

### 고통

1. 지식·스킬·진행이 IDE / 웹 / 텔레그램에 끊김.  
2. 실행 레벨 미스매치.  
3. 루프: **웹 고찰 → IDE 스킬 고정 → 챗봇 실행**.  
4. Hermes에 가깝게 원하던 것: 채널을 넘는 **기억을 다시 쓰고 싶음** (매사를 비싼 에이전틱으로만 처리하고 싶지는 않음).

### 성공

1. **대화가 기억으로 재사용** 가능 — 무차원 검색·링크 대상이면서 **서로 구별되는 존재**(type+id).  
2. **세션**이 표면을 넘어 이어짐 — 바인딩 ≈ **workspace**; 과거 대화·Mimir 등은 Store에서 첨부.  
3. 산출물·스킬 트리 (이관 세부 보류).  
4. FA + 에이전틱 허용; 위험 명령만 검토 게이트.

### 비목표

- OpenClaw/Cline을 **제품 통째 본선**으로 잠그기 (부품·패턴만 참고)  
- Pi만 VS Code에 넣어 채널 맥락 공유 기대  
- Cline 유지 + 프로바이더만 연결 (런타임 대체 아님)  
- Cursor 런타임 래핑 / AG2 이중 엔진  
- LangChain을 Gateway 본체  
- Gateway = “OpenRouter 같은 프로바이더”로만 보기  
- Worker가 **관제 Store를 탐색**한다고 가정 (과거 세션 조회는 **관제** 일)  
- 세션을 위키 페이지로 **흡수**해 구별 불가능한 텍스트 더미로 만들기  
- 무차원 = 타입·id 없음 (무차원은 **칸/폴더 SSOT 없음**; 존재는 id로 구별)

---

## 1. 배치: Control plane / Worker

Gateway는 **프로바이더가 아니라**, 기존 앱에 붙어 있던 **관제 평면**을 밖으로 뺀 것이다. **관제 플레인은 원격에 하나**로 고정.

```text
원격 Control plane (= Hub Gateway)     ← 관제 플레인 하나
  ├─ Store: Session | Knowledge | Skill  (타입 분화, 인덱스·링크 통일)
  ├─ 검색 / 링크 순회 / 컨텍스트 조립 (코드; 선택적 소형 분류·요약)
  ├─ 모델 Auto 라우터 · 프로바이더 어댑터
  ├─ TG / 웹 / IDE 채널
  ├─ Worker 페어링 · 실행 파일 배포
  └─ LLM 호출 → tool_calls → 적절한 Worker에 전달
         │
    ┌────┴────┐
    ▼         ▼
로컬 Worker   원격 Worker (기본, TG·웹 등 IDE 없을 때)
로컬 files    원격 workspace files
VS Code 스킨
```

| 관심사 | 위치 | 역할 |
| --- | --- | --- |
| 관제 플레인 | **원격 하나** | 세션 SSOT, Store, Auto, 프로바이더, 채널, Worker 지휘 |
| 컨텍스트 조립 | **원격 (코드)** | 현재 세션 + Store 검색/링크로 관련 조각 첨부 |
| 과거 세션·지식 조회 | **원격 Store API** | Worker가 관제를 “탐색”하지 않음 |
| 툴·파일·프로세스 | **Worker** | 로컬(IDE) 또는 원격(대화 채널 기본) |
| 에이전트 실행 파일 | **원격 배포 → Worker 기동** | |

### Worker 인스턴스

- **로컬 Worker**: VS Code·로컬 workspace.  
- **원격 Worker**: TG/웹 등에서 손이 필요할 때 **기본 손** (원격 workspace).  
- 선택: 로컬 Worker online이면 채널도 로컬로 (폴백 정책은 미정).

### 한 턴 (전형)

1. 표면 → 원격 Gateway.  
2. Store 검색·링크로 관련 세션/지식 첨부(코드) → 현재 세션 로드 → Auto → 프로바이더.  
3. `tool_calls` → 적절한 Worker 실행.  
4. 결과 append → 루프 → 답 스트림.

아키텍처 타입 **C**(관제 하나 + 실행 계열). 슬롯 인터페이스만 예약. 서브에이전트는 루프 **내부**.

---

## 2. 기존 구조에서 뜯어 옮긴 것

| 층 | Cline/Roo | OpenClaw | Hermes | **Hub 재배치** |
| --- | --- | --- | --- | --- |
| 표면 UI/채널 | VS Code 웹뷰 | TG·Discord·Web… | TG 등 | 얇은 어댑터·스킨 |
| 세션·컨텍스트 | 확장 안 | Gateway 안 | 봇 안 | **원격 Gateway / Store** |
| Auto·모델 선택 | 확장 설정 | Gateway/에이전트 | 봇 설정 | **원격 Gateway** |
| 프로바이더 호출 | 확장이 API 직결 | Gateway/런타임 | 봇이 직결 | **원격 Gateway** |
| 에이전트 루프 | 확장 코어 | Pi 임베드 | Hermes 코어 | 관제 오케스트 + Worker 실행 |
| 툴 실행(손) | **로컬** | Gateway 호스트(또는 node) | 봇 호스트 | **로컬/원격 Worker** |

**빌린 패턴:** OpenClaw 다채널+Gateway·node · Cline 로컬 손 · Hermes 메신저 · Pi 루프 · Cursor Auto · control plane 개념.  
**안 빌림:** 세션+루프+손 한 프로세스 독점.

Gateway ≠ OpenRouter. Gateway = **Store + 검색/조립 + Auto + 프로바이더 창구 + 채널 + Worker 지휘** (도서관·교환기).

---

## 3. 관제 = 코드 중심 (두뇌 아님)

| 관제 (대부분 순수 코드) | LLM이 끼는 곳 (선택·별층) |
| --- | --- |
| Session/Knowledge/Skill CRUD, 링크, 인덱스 | Auto용 소형 분류 (없어도 규칙으로 가능) |
| 검색·링크 순회, token 예산에 맞게 첨부 | compact 요약 (truncate만으로 시작 가능) |
| 프로바이더 HTTP·스트림 중계 | **에이전트 루프**가 `store.search` 툴로 추가 조회 |

자동 맥락 첨부 (LLM 필수 아님):

1. 요청 (유저 문장 + workspace 바인딩)  
2. Store 검색 → 관련 session/knowledge/skill + 링크 펼침  
3. window 예산에 맞게 조립 → `messages`에 첨부  
4. Auto → 프로바이더 / 에이전트 루프 → 툴: 손=Worker, 기억=**Store API(관제)**

---

## 4. 대화 = 무차원 공간의 **구별 가능한 기억 존재**

사용자가 원하는 형태:

- 대화를 **기억처럼** 다시 끌어올 수 있고 (검색·첨부·링크)  
- 동시에 **위키 문단으로 녹아 사라지지 않고**, `type=session` + `id` 로 **서로 구별**된다.  
- 폴더/태그 칸이 SSOT가 아니다 (무차원). 존재의 구별은 **id·타입·링크**로 한다.

| | **역할 (분화 · 구별)** | **취급 (무차원 조회 통일)** |
| --- | --- | --- |
| **Session / 대화** | 에피소드 — 그 대화·그 실행의 턴. **고유 존재** | Store 레코드; `search`·`links`·컨텍스트 첨부 대상 |
| **Knowledge** | 자산 — Mimir, wiki, 고찰 | 동일 공간, 다른 type |
| **Skill** | 재사용 능력 | 동일 |
| **workspace** | Worker cwd **바인딩** | 기억 존재 자체가 아님 |

```text
Record {
  id,                    # 구별자 (필수)
  type: session | knowledge | skill,
  body | message_ref,    # 세션은 턴 로그 / 요약 포인터
  links[],               # 크로스 레프 (다른 대화·지식·스킬)
  workspace_ref?,        # 실행 바인딩 (선택)
  embedding?
}
→ 논리 Store / 인덱스 하나  (물리 폴더 ≠ SSOT)
```

- “세션을 지식처럼” ≠ 위키로 **변환·흡수**. = **같은 도서관 서가의 다른 종류의 책**.  
- Hermes 욕구: 채널을 넘는 기억을 **다시 씀**; 관제 검색/첨부가 1차, 과한 에이전틱은 최소화.  
- 예: “커서 토큰 사용량 **그 대화**” → 해당 `session` id를 찾아 첨부. md만 있으면 `knowledge` 또는 Worker `read`. Worker가 관제 DB를 탐색하지 않음.

### 4.1 통일 Store + 대화→기억 승격 (본선)

Memory 평면과 Conversation 평면을 **반드시 나눌 필요는 없다.** 나눔은 구현 교체 편의용 옵션일 뿐이고, 존재론적으로 “기록 ≠ 기억”이라서가 아니다.

**본선:** 하나의 Record/Store 공간 + **승격(promotion) 루프**.

```text
통일 Store
  ├─ type=session   살아 있는·과거 대화 (구별되는 존재, append)
  ├─ type=knowledge 고찰·위키·Mimir…
  └─ type=skill
         ▲
         │  승격 루프 (관제 스케줄 및/또는 Worker·런타임)
         │  요약 · 파일화 · 링크 · 임베딩
         │  → knowledge 파생물 및/또는 session.summary 갱신
         │  → 원본 session id는 유지 (흡수·소멸 아님)
         │
  핫 경로: threads/messages stream (같은 Store에 append하는 API여도 됨)
```

| | 설명 |
| --- | --- |
| 인간 비유 | 대화(기록) → 나중에 정리·요약해 기억으로 남김. 대화 자체가 없어지지는 않음 |
| 누가 돌리나 | 관제 크론/큐, 또는 요약·파일화에 Worker/런타임 LLM 사용 |
| API | 한 서비스 안에서 `records`/`search` + `threads`/`messages` 엔드포인트로 둬도 됨 |

### 4.2 평면 분리 (옵션 — 교체 단위)

배포·벤더 교체가 필요할 때만 나눈다.

| 평면 | 계약 (요지) | 언제 쓰나 |
| --- | --- | --- |
| **Memory** | `records` + `search` + `links` | Store 구현만 PG/위키 등으로 교체 |
| **Conversation** | `threads` + `messages` stream | 실시간 대화 백엔드만 OpenClaw식 등으로 교체 |
| **Control** | Auto `route`, provider, Worker `runs` | 깊숙한 전용 코어여도 됨 |

분리 시: 살아 있는 thread는 스냅샷·종료 시 Store의 `type=session`으로 **구별된 채** 남기고, 승격 루프는 Memory 쪽에서 돈다.  
**Hub 기본 서술은 4.1(통일+승격)** 이다.

Worker·라우팅을 Control 안에 두더라도, 기억 쪽은 통일 Store로 두고 승격만 내부 루프로 돌리면 된다.

---

## 5. 누적 결정

| 항목 | 결정 |
| --- | --- |
| 관제 / 손 | **원격 Control plane 하나** / Worker 여러 인스턴스(로컬·원격) |
| 파일 | IDE: **로컬** workspace. 대화 기본 손: **원격** workspace 가능 |
| 대화·세션 | **구별 가능한 기억 존재** (id+type); 위키 흡수 금지; 통일 Store 조회 대상 |
| 지식 | 역할 분화; 같은 무차원 공간 |
| 기록→기억 | **승격 루프** (요약·파일화·링크); 원본 session id 유지. Memory/Conversation **분리는 옵션** |
| Control | Auto·Worker는 전용 깊숙이 두어도 됨 |
| 관제≠두뇌 | Store·검색·조립·중계 = **코드** |
| IDE | 자체 확장 = 스킨 (Cline 런타임 대체) |
| 채널 | TG ≈ 웹 같은 계층 |
| FA / Danger | 에이전틱 OK; 파괴적 sudo 등 → 검토 (Worker 직전) |
| LLM | 다수 프로바이더; UX 기본 **Auto** |
| one-min-mcp | MCP·간단 기능 축소 방향 (범위 미정) |
| OpenClaw 제품 | 참고; node 패턴 유사. 본선은 자체 관제 |

---

## 6. 선행 사례 · 유사 개념 (조사 메모)

완벽한 동일 제품은 드물고, **조각은 이미 제창·구현**되어 있다. Hub는 재조합이다.

### 6.1 이미 있는 개념

| 이름 | 요지 | 링크 |
| --- | --- | --- |
| **Agent control plane** | 관제(배포·정책·상태) 중앙화, 실행은 data/execution plane | [IBM](https://www.ibm.com/think/topics/agent-control-plane) · [Chainlink](https://chain.link/article/ai-agent-control-plane) |
| **Hybrid control / execution plane** | 모델·정책·메모리는 중앙, 실행은 데이터·유저 근처 | 업계 논의 일반 |
| **Planner–executor** | 계획/모델 호출과 툴 실행기 분리 | 에이전트 아키텍처 일반론 |

### 6.2 제품·프로젝트 사례와 **참조할 부분**

| 사례 | 닮은 점 | **우리가 참조할 것** | 그대로 본선으로 쓰지 않는 이유 |
| --- | --- | --- | --- |
| **OpenClaw Gateway + [nodes](https://docs2.openclaw.ai/nodes)** (`exec host=node`) | 세션·모델은 Gateway, 손은 다른 호스트 | **Gateway↔Worker invoke 계약**, 페어링·host=node 발상 | 제품 전체를 Hub로 잠그지 않음; IDE·Store·Auto는 우리가 소유 |
| **[OpenClaw Node for VS Code](https://marketplace.visualstudio.com/items?itemName=xiaoyaner.openclaw-node-vscode)** | 에디터를 node로 Gateway에 연결 | IDE=손/브리지 패턴 | 확장을 먼저 키우지 말고 **계약 검증 후** 스킨 |
| **[Claude Code Remote Control](https://code.claude.com/docs/en/remote-control)** | 실행·파일 로컬, 폰/웹은 창 | **아웃바운드 페어링**, “손은 로컬·UI는 원격” | 세션 브리지·프로바이더가 Anthropic 종속; 다프로바이더 Auto·자체 TG 관제 없음 |
| **AgentForge** 등 | control plane + deployable node, Pi executor 언급 | plane/node 분리·헬스 | 파이프라인/승인 K8s풍; Hub UX와 다름 |
| **MCP Gateway** | 중앙 툴 라우팅 | 툴 창구 아이디어 | 세션+코딩 FA 전체 아님 |
| Cline / Roo / Hermes | 로컬 손 또는 메신저 UX | 손=로컬, 채널 UX | 관제+손이 한 프로세스 |

**한 줄 교훈 (사례 공통):** 관제와 손의 **계약(세션 append + tool invoke)** 을 먼저 검증하고, 풀스택 설치·IDE UI·지식 위키는 그다음.

---

## 7. 시작 지점 · 마이그레이션

### 7.1 어디서 시작할 것인가 (사례 기준)

사례가 가리키는 첫 검증:  
**원격 세션(관제) API ↔ 로컬 Worker(손) ↔ CLI** — OpenClaw node / Claude RC와 같은 뼈대를 **직접** 갖는지.

| 순서 | 할 일 | 검증 |
| --- | --- | --- |
| **0** | danger-gate 규칙 스텁, workspace 경로를 세션 키로 넘길 합의 | FA·바인딩 |
| **1** | 원격: `sessions` + `chat` stream + `messages[]`. 프로바이더 **하나** (Auto 스텁 OK) | 관제 SSOT |
| **2** | 로컬 Worker: 페어링 후 `read`/`write`/(최소) `shell` → 결과 세션 append | 손 분리 |
| **3** | **CLI만**으로 end-to-end (VS Code·TG 아님) | 스킨 패턴 |
| **4** | Auto 규칙 표 1차 | Cursor식 Auto |
| **5** | 원격 Worker + 채널 하나 (웹 또는 TG) | 대화만 있을 때의 손 |
| **6** | VS Code 스킨 | 에디터 브리지 |
| 이후 | 승격 루프, Store 검색·크로스 첨부, Knowledge(Mimir), 실행 파일 배포, one-min MCP | |

**성공 기준 (스파이크):** 로컬 폴더 파일을 Worker가 읽고, 대화가 **원격 세션**에 남으며, 같은 workspace 키로 CLI를 다시 열면 이어진다.

**시작 단계에서 하지 말 것:** OpenClaw 풀설치를 Hub 본선으로 가정 · Cline 포크부터 · VS Code UI 먼저 · Mimir/위키 대규모 이관 · Auto/멀티프로바이더 완성.

### 7.2 단계 표

| 단계 | 내용 |
| --- | --- |
| M0 | Worker 스텁 + 원격 세션 API 스켈레톤, danger-gate |
| M1 | Store(세션)+단일 프로바이더. 로컬 Worker. **CLI**. id 첨부 스텁 가산 |
| M2 | Auto 규칙, **원격 Worker** + TG/웹, Store 검색, **승격 루프 스텁** |
| M3 | VS Code 스킨 + 로컬 Worker 페어링 |
| M4 | Knowledge(Mimir 등) 인제스트·링크, 승격 고도화, 실행 파일 배포, one-min MCP |

---

## 8. 열린 질문

1. LLM 호출은 **항상 원격**? (권장: 예)  
2. Worker 페어링: 아웃바운드만 vs 양방향?  
3. M1 첫 채널: CLI / 웹 / TG?  
4. 루프: Pi를 Worker에 vs 관제 오케스트+Worker executor?  
5. one-min 남길 MCP 목록?  
6. Auto 1차 규칙 표?  
7. Store 검색 1차: BM25 vs 임베딩 하이브리드?  
8. 원격 Worker 기본 workspace 루트?  
9. 승격 트리거: 세션 종료 / 주기 / 수동 / 토큰 예산?

---

## 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-08-11 | v1–v2 |
| 2026-08-13 | v3–v3.3 관제·Worker·Store·사례·시작점 |
| 2026-08-13 | v3.4 대화=구별 가능 기억; Memory/Conversation/Control 분리 옵션 |
| 2026-08-13 | **v3.5** 본선=통일 Store+대화→기억 승격 루프; 평면 분리는 교체용 옵션 |
