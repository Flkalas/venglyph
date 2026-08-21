# 에이전틱·코딩 벤치 vs OpenRouter 가격 — 결론 레포트

**스냅샷:** 2026-08-06 (UTC)  
**범위:** SWE-bench Pro · Terminal-Bench 2.0 · BrowseComp 교집합 **n=18** (OpenRouter 매칭)  
**비용 가정:** 월 300M 토큰, I:O 3:1 · blend `(3×input+1×output)/4` $/1M  
**점수:** BenchLM `coding.swePro` / `terminalBench2` / `agentic.browseComp` · 가격: OpenRouter list

관련 자료: [방법·전체](llm-benchmark-pareto-agentic-coding.md) · [triple](llm-benchmark-pareto-agentic-coding-triple.md) · [잔차 JSON](data/llm-benchmark-pareto-agentic-coding-trend.json) · canvas `llm-agentic-coding-pareto.canvas.tsx`  
이전 축(SWE-Verified∩LCB): [결론 레포트](llm-benchmark-conclusions.md)

---

## 한 줄 요약

**터미널·브라우징·리포(Pro)를 같이 보면, 가성비 기본값은 GPT-5.6 Luna(~$68/mo)다.** CostGoat의 “싸면서 좋다”는 **이 축에서는 수치로도 맞다.** DeepSeek V4 Flash는 최저가 joint로 남지만 추세선 아래이고, 리포 최전선만 보면 Opus 4.8, 에이전트 천장만 보면 Sol이다.

---

## 1. 무엇을 측정했는가

| 렌즈 | 질문 | 답이 말하는 것 |
| --- | --- | --- |
| **Joint Pareto** (SWE-Pro↑, TB↑, Browse↑, 비용↓) | 네 축을 동시에 보면 누가 지배되지 않는가? | 바꿔 쓸 때 한 축에서라도 손해 보는 관계 |
| **벤치별 2D Pareto** | 한 벤치만 최적화하면? | 단일 워크로드 후보 |
| **Robust OLS 잔차** (`score ~ log10($/mo)`, resid₀ &lt; mean−2σ 제외 후 재적합) | 같은 가격대 기대치 대비 얼마나 위인가? | **가격 대비 초과성과** (파레토와 별개) |

이전 Verified+LCB 분석과 달리, 이 세 벤치는 **GPT-5.6 Luna를 포함한 2026 frontier**가 공개 점수를 갖고 있어 Luna·Terra·Sol 비교가 가능하다.

---

## 2. 핵심 결론

### 2.1 기본 추천은 GPT-5.6 Luna다 (이 축 기준)

| 모델 | SWE-Pro | TB 2.0 | BrowseComp | 월 비용 | Joint | 평균 잔차 |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| **GPT-5.6 Luna** | 62.7 | 84.7 | 83.3 | **~$68** | yes | **+11.4** |
| GPT-5.6 Terra | 63.4 | 87.4 | 87.5 | ~$675 | yes | +8.7 |
| GPT-5.6 Sol | 64.6 | 91.9 | 92.2 | ~$3,375 | yes | +8.5 |
| V4 Flash | 52.6 | 56.9 | 73.2 | ~$33 | yes | −3.0 |
| V4 Pro | 55.4 | 67.9 | 83.4 | ~$163 | yes | +1.4 |
| Opus 4.8 | 69.2 | 74.6 | 84.3 | ~$3,000 | yes | +1.9 |

- Luna는 **joint + 잔차 1위**를 동시에 차지한다. TB 잔차 **+21.3**이 평균을 끌어올린다.
- Flash→Luna는 월 ~$35 추가에 SWE-Pro +10 · TB +28 · Browse +10pt 수준. **한계 가성비가 매우 큼.**
- Luna→Terra(~10× 비용)는 점수가 소폭만 오른다. Terra→Sol(~5×)도 마찬가지. **Luna가 “싼 GPT-5.6”의 실질 기본값.**

### 2.2 돈과 품질은 양의 관계지만, 초과성과는 저가 GPT-5.6에 몰린다

Robust 기울기 (점수 / log10 월비용):

| 벤치 | 기울기 | 해석 |
| --- | ---: | --- |
| SWE-Pro | **+3.50** | 비용 10배 ↑ ≈ +3.5pt — Verified 때(+1.75)보다 가파름 |
| Terminal-Bench | **+7.97** | 가격과 가장 강하게 동행 |
| BrowseComp | **+4.15** | 중간 (Kimi K2.5만 −2σ 제외) |

함의:

- 이 축에서는 “비쌀수록 평균적으로 높다”가 **성립**한다 (LCB처럼 음수 기울기가 아님).
- 그래도 **선 위의 초과분**은 Luna/Terra/Sol에 집중. 비싸기만 한 Opus 4.6·GPT-5.4는 잔차 음수·중하위.

### 2.3 Joint Pareto는 7개 — 역할이 갈린다

| 역할 | 모델 | 월 비용 | 한 줄 |
| --- | --- | ---: | --- |
| 최저가 버팀목 | **V4 Flash** | $33 | 세 점수 모두 낮지만 싸서 비지배 |
| **가성비 핵심** | **GPT-5.6 Luna** | $68 | joint + 잔차 동시 1위권 |
| 중저가 보조 | MiniMax M3 / V4 Pro | $158–163 | Browse·균형. Pro는 잔차 소폭 양수 |
| 중가 upscale | **GPT-5.6 Terra** | $675 | Luna와 Sol 사이 사다리 |
| SWE-Pro 최전선 | **Opus 4.8** | $3,000 | triple 안 SWE 최고(69.2). TB는 선 아래 |
| TB/Browse 천장 | **GPT-5.6 Sol** | $3,375 | 두 에이전트 벤치 최고. 비용 큼 |

Mythos 5(SWE-Pro 80.3)는 OpenRouter 미등재라 triple에 없음.

### 2.4 파레토 ≠ 잔차 (다시 확인)

| 현상 | 예 |
| --- | --- |
| Joint 1위인데 잔차 음수 | **V4 Flash** (rank 1 joint, 평균 잔차 −3.0) |
| Joint 밖인데 잔차 상위 | **Claude Sonnet 5** (평균 +4.0, joint 아님 — Luna/Terra에 SWE·TB·Browse·가격에서 밀림) |
| SWE만 보면 최강, 평균은 중위 | **Opus 4.8** (SWE 잔차 +7.8, 평균 +1.9) |

**지배력(파레토)**과 **가격 대비 보너스(잔차)**를 섞지 말 것.

### 2.5 피하거나 과대평가하기 쉬운 구간

| 모델 | 문제 |
| --- | --- |
| **Kimi K2.5** | 세 벤치 잔차 최하위(평균 −15). BrowseComp robust 적합에서 제외 |
| **Opus 4.6 / GLM 5 / Inkling** | 가격 대비 에이전트·코딩 점수 약함 |
| **V4 Flash를 “품질 기본”으로 쓰기** | Verified+LCB에선 기본값이었으나, **Pro/TB/Browse에선 점수 공백이 큼**. 초저가 볼륨용 |
| **Sol을 일상 기본으로** | 잔차는 높지만 Luna 대비 ~50× 비용. 천장 작업용 |
| **CostGoat 종합 value만 보고 Luna=만능** | Luna는 이 세 축·가벼운 에이전트에 강함. SWE-Pro 절대치는 Opus/Mythos보다 낮음 |

---

## 3. 의사결정 가이드

```
에이전트(터미널·웹 도구) + 적당한 리포 작업, 예산 의식
  → GPT-5.6 Luna (~$68/mo)          ← 이 레포트의 기본값

초저가·대량, 품질 타협 가능
  → DeepSeek V4 Flash (~$33/mo)

Luna로 부족할 때 한 단계
  → GPT-5.6 Terra (~$675/mo)

리포 이슈 해결(SWE-Pro) 마진이 예산보다 중요
  → Claude Opus 4.8 (~$3,000/mo)
    (Mythos가 OpenRouter에 생기면 재평가)

TB/Browse 천장
  → GPT-5.6 Sol (~$3,375/mo)

Browse 비중 큰 중저가 실험
  → MiniMax M3 / V4 Pro (~$160)

비추천 (이 스냅샷)
  → Kimi K2.5, Opus 4.6을 에이전트 기본으로
```

**이전 레포트(Verified+LCB)와의 관계**

| 워크로드 | 더 맞는 레포트 | 기본 후보 |
| --- | --- | --- |
| SWE-Verified·LiveCodeBench 중심 코딩 | [llm-benchmark-conclusions.md](llm-benchmark-conclusions.md) | V4 Flash / Pro |
| 터미널 에이전트·브라우징·SWE-Pro | **이 문서** | **Luna** → Terra / Opus 4.8 |

축이 바뀌면 승자가 바뀐다. 모순이 아니라 **벤치 정의의 차이다.

---

## 4. 방법론 한계

1. **n=18** OpenRouter∩세 벤치. Mythos·일부 Qwen 등은 가격 또는 점수 부재로 제외.  
2. **BenchLM / provider-reported** 비중 큼. Luna·Terra·Sonnet 5 등은 `estimated`.  
3. **Effort 변형** (`-max`/`-high`) 점수를 동일 OpenRouter SKU 가격에 붙임 — DeepSeek 특히.  
4. **하네스 불일치:** Terminal-Bench·SWE-Pro는 벤더마다 스캐폴드가 다를 수 있음.  
5. **잔차는 샘플 상대 지표**이지 절대 품질 보증이 아님.  
6. HumanEval 등 포화 벤치·BFCL·OSWorld는 이 레포트 범위 밖.

---

## 5. 최종 정리

| 질문 | 답 |
| --- | --- |
| 이 축에서 가성비 기본 모델? | **GPT-5.6 Luna** |
| CostGoat “Luna 싸고 좋다”가 맞나? | **에이전틱·코딩 세 축에서는 예** (잔차·joint 모두 상위) |
| 초저가만? | **V4 Flash** (joint 유지, 잔차는 음수) |
| SWE-Pro만 끝까지? | **Opus 4.8** (triple 내) |
| TB/Browse 천장? | **GPT-5.6 Sol** (비쌈) |
| 중간 사다리? | **Terra** · MiniMax M3 / V4 Pro |
| 명확한 회피? | **Kimi K2.5**, 잔차 하단 고가 Claude/GLM |

**실무 한 문장:** OpenRouter에서 터미널·웹 에이전트와 SWE-Pro를 같이 보면 **Luna를 기본**으로 두고, 리포 마진이 필요하면 Opus 4.8, 천장만 Sol, 초저가 볼륨만 Flash로 내려라.
