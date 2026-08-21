# Cursor 사용량(토큰) 분석 — Free 구간 추정 포함

**분석일:** 2026-08-07  
**원본:** `usage-events-2026-08-06 (1).csv` (Cursor Dashboard CSV export, `strategy=tokens`)  
**기간:** 2025-09-09 → 2026-08-06 (UTC) · **10,738** events  
**가공 데이터:** [data/cursor-usage-tokens.json](data/cursor-usage-tokens.json)

---

## 한 줄 요약

CSV에 찍힌 토큰은 **2.72B**이고, 2026-05-14 이후 Included Auto(`Cost=Free`)의 빈 토큰 칸을 중앙값 기반으로 **+0.6B** 보정하면 **약 3.32B** · **월평균 약 277M** (8월 제외 시 **약 295M**)이다.

---

## 1. 왜 추정이 필요한가

2026-05-14 전후로 Usage/CSV에서 **Included Auto** 요청이 `Cost=Free`로 바뀌며 **토큰 breakdown이 비어** 나온다. Cursor 스태프 확인: 버그가 아니라 **의도된 동작**이다. 청구·한도는 백엔드에서 잡히지만, 대시보드/CSV는 included Auto에 토큰 수를 노출하지 않는다.

- [Tokens & Cost no longer showing for Auto](https://forum.cursor.com/t/tokens-cost-no-longer-showing-for-auto-in-usage-data-in-web-dashboard/162226)
- [Auto Showing 0 Tokens in usage](https://forum.cursor.com/t/auto-showing-0-tokens-in-usage/160889)

이 CSV에서도:

| 조건 | 건수 |
| --- | ---: |
| `auto` + 토큰 있음 | 7,666 |
| `auto` + `Included` + `Free` + 토큰 빈칸 | 2,926 |
| 그 외 빈칸(에러/중단/`0.00` 등) | 94 |

`Cost=Free`인 `auto`는 **전부** 토큰 칸이 비어 있다 (채워진 Free 행 = 0).

---

## 2. 추정 방법

1. 기준 분포: `Model=auto` 이고 `Total Tokens > 0`인 **7,666건**
2. 1요청당 지표 (토큰):

| 지표 | 값 |
| --- | ---: |
| 평균 | 352,984 |
| **중앙값** | **202,942** |
| p25 | 82,516 |
| p75 | 437,409 |
| p90 | 792,413 |

3. 분포가 오른쪽 꼬리(mean/median ≈ 1.74)이므로 **중앙값**을 채택. 최빈 구간(낮은 버킷)은 총량을 크게 과소평가해 사용하지 않음.
4. 대상: `auto` + `Included` + `Free` + 토큰 빈칸 **2,926건**
5. 중앙값 × 건수 ≈ **0.594B** → 보수적으로 반올림해 **추정 가산분 0.6B**로 고정. 월별 배분은 `(월별 emptyFree × 중앙값)`을 스케일 **1.0104**로 맞춰 합이 정확히 600M이 되게 함.

**한계:** Free 구간의 요청 크기가 과거 유료/`Included`+숫자 Cost 구간과 같다고 가정한다. 실제와 다를 수 있으며, IQR 밴드(p25–p75 × n)는 대략 **0.24B–1.28B**.

---

## 3. 총량

| 항목 | 값 |
| --- | ---: |
| CSV 기록 토큰 | 2,723,559,237 (**2.72B**) |
| Free 빈칸 추정 가산 | **600,000,000 (0.6B)** |
| **추정 포함 총량** | **3,323,559,237 (3.32B)** |
| CSV Cost 합 (숫자만) | **$1,027.60** |
| 월평균 (12개월) | **~277M** |
| 월평균 (2026-08 제외 11개월) | **~295M** |

기록분만의 구성:

| 구성 | 토큰 | 비중 |
| --- | ---: | ---: |
| Cache Read | 2.46B | 90.5% |
| Input (cache write) | 0.11B | ~4.0% |
| Input (no cache write) | 0.13B | ~4.8% |
| Output | 0.021B | 0.8% |

모델: 기록 토큰의 **99.4%**가 `auto`. Max Mode 사용 없음. Cloud Agent / Automation ID 없음.

---

## 4. 월별 (기록 + 추정)

단위: 백만 토큰(M). 2026-08은 6일까지.

| 월 | 이벤트 | 기록 (M) | 추정 가산 (M) | **합 (M)** |
| --- | ---: | ---: | ---: | ---: |
| 2025-09 | 1,943 | 856 | 0 | **856** |
| 2025-10 | 962 | 337 | 0 | **337** |
| 2025-11 | 580 | 152 | 0 | **152** |
| 2025-12 | 1,195 | 475 | 0 | **475** |
| 2026-01 | 504 | 135 | 0 | **135** |
| 2026-02 | 673 | 168 | 0 | **168** |
| 2026-03 | 588 | 166 | 0 | **166** |
| 2026-04 | 1,099 | 328 | 0 | **328** |
| 2026-05 | 692 | 105 | 90 | **195** |
| 2026-06 | 605 | 0 | 124 | **124** |
| 2026-07 | 1,524 | 0 | 312 | **312** |
| 2026-08 | 373 | 1 | 75 | **76** |
| **합계** | **10,738** | **2,724** | **600** | **3,324** |

추정 가산이 붙는 달은 **2026-05 중순 이후**뿐이다. Free 구간 월평균(5–8월)은 대략 **~177M**.

---

## 5. Kind / Cost

| Kind | 이벤트 | 기록 토큰 |
| --- | ---: | ---: |
| Included | 10,569 | 2.65B |
| pro-free-trial | 141 | 74.7M |
| Errored, No Charge | 27 | 0 |
| Aborted, Not Charged | 1 | 0 |

---

## 6. 파일

| 파일 | 내용 |
| --- | --- |
| [data/cursor-usage-tokens.json](data/cursor-usage-tokens.json) | meta · estimation · totals · composition · by_model · by_kind · by_month (정수 토큰) |
| `usage-events-2026-08-06 (1).csv` | 원본 export (저장소 루트; git 미추적일 수 있음) |

JSON 필드 요약:

- `estimation` — 중앙값·스케일·대상 이벤트 수
- `totals.estimatedTotalTokens` — 3.32B
- `by_month[].recordedTokens` / `estimatedExtraTokens` / `estimatedTotalTokens`
- `meta.caveats` / `meta.references` — 해석 시 주의·포럼 근거
