# VenGlyph — 네이밍 기원

> 상태: 확정 — 2026-08-21  
> 상위 설계: [personal-llm-work-hub.md](./personal-llm-work-hub.md)  
> 구현 계획: [control-plane-implementation-plan.md](./control-plane-implementation-plan.md)

제품/아키텍처의 공식 프로젝트명은 **VenGlyph**(벤글리프)이다.  
README 도입부·기술 블로그·기획 문서에 그대로 쓸 수 있도록, 설계 철학과 이름의 당위성을 한곳에 둔다.

---

## 새로운 개인 LLM 작업 허브, **VenGlyph**

본 프로젝트는 여러 창(IDE, 메신저, 웹, CLI)이 각자 에이전트 엔진을 품는 낭비를 없애고, 오직 하나의 원격 관제탑과 독립된 로컬 Worker(손)를 분리하는 아키텍처를 지향한다. 이러한 설계 철학과 목표를 가장 직관적으로 담아내기 위해 프로젝트의 이름을 VenGlyph(벤글리프)로 명명한다.

이 이름은 기존에 구상했던 다중 모델 오케스트레이션(**Vanguard**)의 중앙 통제 정신을 계승하면서도, 단순한 대화를 영구적인 지식으로 탈바꿈시킨다는 비전을 두 가지 핵심 키워드로 설명한다.

### 1. Ven — 교집합의 허브와 중앙 관제 (Venn & Vanguard)

**모든 표면이 교차하는 중심 (Venn Diagram)**  
Ven은 여러 집합이 만나는 벤 다이어그램의 교집합을 상징한다. IDE, 웹, 터미널 등 얇은 스킨(표면)들과, 오직 로컬 폴더에서만 읽고 쓰는 Worker(손)들이 각자 따로 놀지 않고 오직 하나의 Control Plane(관제탑)에서 교차하고 통제됨을 의미한다.

**정합성을 지키는 선봉 (Vanguard)**  
컨텍스트의 깊이와 범위를 조절하며 목표의 정합성을 유지하려 했던 Vanguard 프로젝트의 리듬을 유연하게 계승했다. 에이전트들이 파편화되는 것을 막고, 중앙에서 통신과 라우팅을 지휘하는 오케스트레이터로서의 정체성을 담았다.

### 2. Glyph — 영구적 기억 자산으로의 승격 (Carved Knowledge)

**휘발되지 않는 기록**  
Glyph는 돌에 새겨진 기호나 문자를 뜻한다. LLM과의 대화를 일회성 텍스트로 흘려보내지 않고, 카테고리별 Markdown 등으로 체계화하여 위키 형태의 영구적 지식 자산으로 승격시키겠다는 철학이다.

**불변의 맥락과 연결**  
대화가 요약되고 지식으로 정리되더라도, 통일 Store(초기: SQLite WAL)에서 **원본 대화 id와 링크(Link)는 유지**된다. 위키로 흡수·소멸시키지 않는다 — 구별 가능한 기억 존재(`type` + `id`)로 남긴다. 흩어진 작업 내역이 하나의 견고한 지식망(Glyph)으로 새겨진다.

### 3. 아키텍처 철학과의 일치

VenGlyph는 두뇌와 손을 철저히 분리하는 시스템이다.

| | 역할 |
| --- | --- |
| **The Ven (관제)** | 기억·세션, 모델 선택(Auto), Worker 라우팅(아웃바운드 WebSocket)을 전담하는 중앙 교환기 |
| **The Glyph (기억)** | 상용 에이전트 프레임워크에 루프를 맡기지 않고, 컨텍스트와 작업 산출을 하나의 도서관에 기록·자산화 |

**선언:** 파편화된 환경의 작업들을 단일 관제탑(**Ven**)으로 모아 제어하고, 그 모든 맥락을 영구적인 지식의 결정체(**Glyph**)로 새겨 넣는 개인용 LLM 작업 허브.

---

## 한 줄 (영문, README/블로그용)

**VenGlyph** — surfaces intersect at one control plane (*Ven*: Venn ∩ Vanguard); conversations are carved into lasting, addressable knowledge (*Glyph*), not thrown away as chat exhaust.

---

## 관련 결정

| 항목 | 값 |
| --- | --- |
| 표기 | `VenGlyph` (코드·패키지·레포는 `venglyph` 소문자 권장) |
| 한글 읽기 | 벤글리프 |
| 이전 가칭 | Personal LLM Work Hub / Hub control plane |
| 비목표 이름 충돌 | Hermes, OpenClaw, Cline 등 기존 제품명 차용 금지 |
