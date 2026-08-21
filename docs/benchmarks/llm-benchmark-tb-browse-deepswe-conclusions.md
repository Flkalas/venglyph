# Terminal-Bench · BrowseComp · deepSwe — 결론 레포트

**스냅샷:** 2026-08-06 (UTC)

Kimi K3와 GPT-5.6 Luna를 같은 축에서 보기 위해 SWE-Pro 대신 **Terminal-Bench 2.0 + BrowseComp (+ deepSwe)** 로 재분석.

상세 표: [`llm-benchmark-pareto-tb-browse-deepswe.md`](llm-benchmark-pareto-tb-browse-deepswe.md)

---

## 한 줄 요약

**공개 TB/Browse 점수만 보면 Kimi K3가 Luna를 앞선다** (TB 88.3 vs 84.7, Browse 91.2 vs 83.3, deepSwe ≈ 동점). 다만 OpenRouter 월비용은 **K3 $1,800 vs Luna $68** — 잔차(가성비) 1위는 **Luna**.

---

## 1. 왜 이 세 벤치인가

| 벤치 | 역할 | K3 | Luna |
| --- | --- | --- | --- |
| Terminal-Bench 2.0 | 터미널 에이전트 | 있음 | 있음 |
| BrowseComp | 웹/브라우징 에이전트 | 있음 | 있음 |
| deepSwe | 긴 호라이즌 SE | 있음 | 있음 |
| ~~SWE-bench Pro~~ | 리포 패치 | **없음** | 있음 |

deepSwe까지 요구하면 교집합 **n=5** (매우 작음). TB+Browse만이면 **n=23**.

## 2. Triple 결과 (TB + Browse + deepSwe)

Joint Pareto: `deepseek/deepseek-v4-flash`, `moonshotai/kimi-k3`, `openai/gpt-5.6-luna`, `openai/gpt-5.6-sol`, `openai/gpt-5.6-terra`

### 평균 잔차 (가격 대비)

| Rank | Model | Mean | Joint |
| ---: | --- | ---: | --- |
| 1 | GPT-5.6 Luna | +7.47 | yes |
| 2 | GPT-5.6 Terra | +1.48 | yes |
| 3 | GPT-5.6 Sol | -0.77 | yes |
| 4 | Kimi K3 | -1.56 | yes |
| 5 | DeepSeek V4 Flash | -6.62 | yes |

## 3. Pair 결과 (TB + Browse, 더 넓음)

Joint Pareto n=7.

### 평균 잔차 상위 8

| Rank | Model | Mean | TB | Browse | $/mo | Joint |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | GPT-5.6 Luna | +21.02 | +29.92 | +12.11 | $68 | yes |
| 2 | GPT-5.6 Terra | +13.27 | +18.51 | +8.03 | $675 | yes |
| 3 | Kimi K3 | +10.80 | +13.40 | +8.20 | $1,800 | yes |
| 4 | GPT-5.6 Sol | +10.04 | +13.15 | +6.94 | $3,375 | yes |
| 5 | DeepSeek V4 Pro | +8.38 | +7.72 | +9.03 | $163 | yes |
| 6 | MiniMax M3 | +7.65 | +6.03 | +9.28 | $158 | yes |
| 7 | Claude Sonnet 5 | +5.58 | +7.99 | +3.16 | $1,200 | — |
| 8 | DeepSeek V4 Flash | +5.53 | +6.49 | +4.57 | $33 | yes |

## 4. 의사결정

```
점수(TB/Browse) 최대, 예산 여유 (~$1.8k/mo)
  → Kimi K3

가성비·볼륨·OpenAI 티어 (~$68/mo)
  → GPT-5.6 Luna          ← 잔차 1위 (pair +21, triple +7.5)

중간 사다리
  → GPT-5.6 Terra (~$675)

TB/Browse 천장
  → GPT-5.6 Sol (~$3.4k)

초저가
  → V4 Flash (~$33)

리포 SWE-Pro가 핵심
  → 이 축 말고 SWE-Pro 레포트 (K3는 Pro 미공개)
```

**K3 vs Luna 한 줄:** 점수는 K3, **달러당 성과는 Luna가 압도** (월 $1,800 vs $68에 TB +3.6 · Browse +7.9만 차이).

## 5. 한계

1. Triple n이 작아 잔차·파레토가 민감함.
2. Luna `estimated`, K3 `supported` — 증거 비대칭.
3. deepSwe 미공개 모델은 pair에만 등장.
4. OpenRouter 가격은 라우트·캐시에 따라 달라짐.

**실무 한 문장:** TB+Browse에서 **점수는 K3, 가성비는 Luna**. K3에 $1.8k를 쓸 만큼의 마진(+3.6 TB / +7.9 Browse)인지는 워크로드가 결정한다. SWE-Pro가 필요하면 아직 K3를 같은 줄에 세우지 마라.
