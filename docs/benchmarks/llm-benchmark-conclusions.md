# LLM 벤치마크 vs OpenRouter 가격 — 결론 레포트

**스냅샷:** 2026-08-06 (UTC)  
**범위:** OpenRouter 주요 모델 · SWE-bench Verified + LiveCodeBench 교집합 **n=15** (핵심 결론) · 전체 파레토는 보조  
**비용 가정:** 월 300M 토큰, 입출력 3:1 · blend `(3×input+1×output)/4` $/1M

관련 자료: [전체 파레토](llm-benchmark-pareto.md) · [SWE∩LCB](llm-benchmark-pareto-swe-lcb.md) · [robust 추세 JSON](data/llm-benchmark-pareto-swe-lcb-robust-trend.json) · **[SWE-Pro · TB · BrowseComp](llm-benchmark-pareto-agentic-coding.md)** ([triple](llm-benchmark-pareto-agentic-coding-triple.md) · **[에이전틱 결론](llm-benchmark-agentic-coding-conclusions.md)**) · **[TB·Browse·deepSwe / K3 vs Luna](llm-benchmark-tb-browse-deepswe-conclusions.md)**

---

## 한 줄 요약

**코딩 품질(SWE+LCB)과 OpenRouter 비용을 같이 보면, 합리적 기본값은 DeepSeek V4(Flash/Pro)이고, “돈 더 내면 확실히 좋아진다”는 성립하지 않는다.** Opus 4.5만 최고 SWE 한 축에서 비싸게 정당화되고, Qwen3.7 Max / Kimi K2.6은 파레토에는 없지만 **가격 대비 초과 성과(잔차)**가 크다.

---

## 1. 무엇을 측정했는가

| 렌즈 | 질문 | 답이 말하는 것 |
| --- | --- | --- |
| **Joint Pareto** (SWE↑, LCB↑, 비용↓) | 세 축을 동시에 보면 누가 지배되지 않는가? | “이 셋을 쓰면 다른 후보를 전부 이길 수는 없다” |
| **벤치별 2D Pareto** | 한 벤치만 보면? | 단일 목표 최적화 후보 |
| **Robust OLS 잔차** (`score ~ log10($/mo)`, V3 0324·Gemini 2.5 Pro 제외) | 같은 가격대 기대치 대비 얼마나 위/아래인가? | 파레토에 안 올라가도 **가성비 히트**를 찾음 |

세 렌즈는 서로 다른 순위를 낸다. **파레토 ≠ 잔차 랭킹**이 이번 분석의 핵심 교훈이다.

---

## 2. 핵심 결론

### 2.1 기본 추천 스택은 DeepSeek V4다

| 모델 | SWE | LCB | 월 비용 | 역할 |
| --- | ---: | ---: | ---: | --- |
| **V4 Flash** | 79.0 | 91.6 | **~$33** | 기본·볼륨 · joint Pareto · 양쪽 벤치 frontier |
| **V4 Pro** | 80.6 | 93.5 | **~$163** | 품질 한 단계 up · joint Pareto · LCB 최고점 |

- Flash는 **비용 최전선**: SWE/LCB 둘 다 frontier에 있고 joint에도 들어간다.
- Pro는 Flash 대비 월 ~$130만 더 내고 SWE +1.6 · LCB +1.9를 산다. **가성비로도 잔차 상위**(평균 +3.8).
- “OpenRouter에서 코딩용으로 뭘 쓸까?”에 대한 1차 답은 **Flash → 부족하면 Pro**로 충분하다.

### 2.2 돈과 품질은 단조 증가하지 않는다

Robust 적합(n=13) 후:

| 벤치 | 기울기 (점수 / log10 월비용) | 해석 |
| --- | ---: | --- |
| SWE | **+1.75** | 비용 10배 ↑ ≈ SWE +1.75pt — **거의 평탄** |
| LCB | **−9.99** | 비싼 쪽이 LiveCodeBench에서 **오히려 기대치 아래**가 많음 |

함의:

- SWE는 상위권(~78–81)이 **가격대와 무관하게 수렴**한다. Opus $3k와 V4 Pro $163의 SWE 차이는 **0.3pt**.
- LCB는 저가·중가 중국계(DeepSeek, Qwen, Kimi)가 강하고, Gemini 3.1 / GPT-5.4 / Opus 4.6 등 고가 모델은 **가격 대비 코딩 벤치가 약하다**.
- 따라서 “프리미엄 모델 = 코딩도 프리미엄”은 **이 데이터로는 기각**에 가깝다.

### 2.3 Joint Pareto는 단 3개뿐

비지배 집합:

1. **DeepSeek V4 Flash** — 최저가에서 양쪽 고득점  
2. **DeepSeek V4 Pro** — Flash를 SWE·LCB 모두 이기며 여전히 저가  
3. **Claude Opus 4.5** — SWE **최고**(80.9), LCB는 Pro보다 낮고 월 **~$3,000**

Opus 4.5가 joint에 남는 이유: **SWE만으로 Flash/Pro를 근소 상회**하고, 그 SWE를 더 싼 모델이 동시에 따라잡지 못함. LCB·비용 축에서는 지배당한다.  
→ **에이전트/리포 수정(SWE류)에서 마진이 중요하고 예산이 열려 있을 때만** Opus가 후보. 일상 코딩·알고리즘(LCB류) 기본값으로는 비싸다.

### 2.4 파레토에 없어도 “가격 대비 히트”는 있다

Robust 선 대비 **평균 잔차** 상위:

| 순위 | 모델 | 평균 잔차 | 월 비용 | Joint? | 메모 |
| ---: | --- | ---: | ---: | --- | --- |
| 1 | **Qwen3.7 Max** | **+5.21** | $664 | — | LCB 잔차 +9.3이 끌어올림. V4 Pro보다 비싸고 SWE·LCB는 비슷·열위 → 파레토 탈락 |
| 2 | **Claude Opus 4.5** | +4.75 | $3,000 | yes | LCB가 가격 대비 크게 위 |
| 3 | **DeepSeek V4 Pro** | +3.75 | $163 | yes | 파레토와 잔차 모두 상위 — **가장 안정적인 중가 선택** |
| 4 | **Kimi K2.6** | +2.73 | $308 | — | 추정 점수 포함. Pro/Flash에 SWE·LCB·가격에서 밀림 |

**DeepSeek V4 Flash**는 joint 1위인데 평균 잔차는 **−0.85**(SWE +2.0 / LCB −3.7).  
이유: robust 선이 Flash의 극저가 구간에서 LCB 기대치를 높게 잡음. **“선 위인가”와 “누가 지배하는가”는 다른 질문**이다. Flash는 지배력(파레토)에서 이기고, Max/Kimi는 중가대 **초과성과**에서 보인다.

### 2.5 피해야 할 / 과대평가하기 쉬운 구간

| 모델 | 문제 |
| --- | --- |
| **DeepSeek V3 0324** | 싸지만 SWE 42 / LCB 49 — 적합·실사용 모두 **아웃라이어 실패** |
| **Gemini 2.5 Pro** | ~$1k/mo에 SWE 63.8 / LCB 69 — **가격 대비 최하위권**(평균 잔차 −13.6, 적합 제외) |
| **Gemini 3.1 Pro · GPT-5.4 · Opus 4.6** | SWE는 상위권(~80)이나 LCB가 약하고 비용이 큼 → 잔차 하위. **“최신 플래그십”만으로 코딩 기본 모델을 고르면 손해** |
| **HumanEval/MBPP 중심 전체 파레토** | 포화 벤치라 싸구려 모델이 frontier에 뜸. **코딩 에이전트 의사결정에는 SWE∩LCB가 더 신뢰** |

---

## 3. 의사결정 가이드

```
예산 타이트 / 대량 호출
  → DeepSeek V4 Flash (~$33/mo @ 300M tok)

품질 한 단계 + 여전히 저가
  → DeepSeek V4 Pro (~$163/mo)     ← 기본 추천의 “상한”

SWE 마진이 중요하고 예산 여유
  → Claude Opus 4.5 (~$3,000/mo)   ← joint에만 남는 고가 옵션

중가에서 LCB·가성비 실험
  → Qwen3.7 Max / Kimi K2.6        ← 파레토는 아니나 잔차 상위
                                     (Kimi LCB는 estimated 플래그 주의)

비추천 (이 스냅샷 기준)
  → Gemini 2.5 Pro, DeepSeek V3 0324
  → “비싸니까 코딩도 나을 것” 가정으로 Gemini 3.1 / GPT-5.4 / Opus 4.6만 고르기
```

월 300M 토큰 기준 **Flash → Pro는 약 5배 비용**, **Pro → Opus 4.5는 약 18배 비용**인데 SWE 이득은 각각 +1.6 / +0.3pt 수준이다. **한계 비용 대비 한계 SWE는 급감**한다.

---

## 4. 방법론이 말해 주는 한계 (결론의 경계)

1. **벤치 커버리지:** 전체 ~43모델 중 SWE∩LCB는 15개. BFCL·RULER·NIAH는 거의 비어 있어 “종합 지능” 결론으로 확장하면 안 된다.  
2. **SWE = Verified + 하네스 의존:** 스캐폴드/벤더 리포트에 따라 순위가 흔들릴 수 있다.  
3. **일부 점수 estimated** (Kimi K2.6 LCB, Qwen3.5 397B 등): 잔차·순위 해석 시 가중치를 낮출 것.  
4. **OpenRouter 리스트 가격:** 프로바이더 라우트·캐시·할인은 미반영.  
5. **잔차는 상대 지표:** 샘플(13모델) 안의 “선”일 뿐, 절대 품질 보증이 아니다.  
6. **Joint 3모델**은 SWE+LCB+비용에 한정. 멀티모달·장문맥·툴콜(BFCL)이 필수면 별도 파레토가 필요하다.

---

## 5. 최종 정리

| 질문 | 답 |
| --- | --- |
| 가성비 코딩 기본 모델? | **DeepSeek V4 Flash**, 필요 시 **V4 Pro** |
| 돈 더 내면 SWE가 계속 오르나? | **거의 안 오른다** (robust 기울기 +1.75 / log10$) |
| LCB는? | **비싼 쪽이 유리하지 않음** (기울기 음수) |
| 고가 정당화 구간? | **Opus 4.5의 SWE 최전선** 정도 |
| 파레토 밖 주목? | **Qwen3.7 Max, Kimi K2.6** (잔차) |
| 명확한 회피? | **V3 0324, Gemini 2.5 Pro** |

**실무 한 문장:** OpenRouter 코딩 워크로드는 DeepSeek V4를 기본으로 두고, SWE에서 끝까지 깎아야 할 때만 Opus 4.5를 쓰고, 플래그십 브랜드·가격만 보고 Gemini/GPT 최신형을 고르지 마라.

---

## 6. 후속: SWE-Pro · Terminal-Bench · BrowseComp (2026-08-06)

Verified+LCB 대신 **에이전틱/코딩 최신 축**으로 재평가한 결과 ([상세](llm-benchmark-pareto-agentic-coding-triple.md)):

| 역할 | 모델 | 월 비용 | 메모 |
| --- | --- | ---: | --- |
| 최저가 joint | V4 Flash | ~$33 | 세 벤치 모두 낮지만 비용으로 joint 유지 |
| **가성비 joint 핵심** | **GPT-5.6 Luna** | **~$68** | SWE-Pro 62.7 · TB 84.7 · Browse 83.3 — CostGoat “싸면서 좋음”이 **이 축에서는** 설득력 있음 |
| 중가 균형 | GPT-5.6 Terra | ~$675 | Luna↑ · Sol↓ |
| TB/Browse 최전선 | GPT-5.6 Sol | ~$3,375 | 비싸지만 TB·BrowseComp 최고 |
| SWE-Pro 최전선(triple) | Claude Opus 4.8 | ~$3,000 | Mythos(80.3)는 OpenRouter 미등재 |

이전 Verified+LCB 결론(V4 기본)과 충돌하지 않음: **축이 바뀌면 Luna가 joint에 진입**. 리포 패치(SWE-Pro)만 보면 Opus 4.8이 여전히 비싸게 우세하고, 터미널·브라우징 에이전트에서는 GPT-5.6 계열(특히 Luna→Terra)이 강하다.

**잔차(가격 대비 초과성과) 상위:** GPT-5.6 Luna (+11.3), GPT-5.6 Terra (+8.7), GPT-5.6 Sol (+8.5), Claude Sonnet 5 (+4.0), MiniMax M3 (+2.0).

→ 해석·의사결정 가이드 전문: [`llm-benchmark-agentic-coding-conclusions.md`](llm-benchmark-agentic-coding-conclusions.md) · K3 비교 축: [`llm-benchmark-tb-browse-deepswe-conclusions.md`](llm-benchmark-tb-browse-deepswe-conclusions.md)

