# Terminal-Bench · BrowseComp · deepSwe — Pareto & residuals

**Snapshot:** 2026-08-06 (UTC)

Benchmarks chosen for **Kimi K3 vs GPT-5.6 Luna** overlap (SWE-Pro missing on K3).

## Coverage

| Subset | n |
| --- | ---: |
| TB ∩ BrowseComp ∩ deepSwe | **5** |
| TB ∩ BrowseComp | **23** |
| with deepSwe inside pair | 5 |

## Spotlight: Kimi K3 vs GPT-5.6 Luna

| | Kimi K3 | GPT-5.6 Luna | Δ (K3−Luna) |
| --- | ---: | ---: | ---: |
| Terminal-Bench 2.0 | 88.3 | 84.7 | +3.6 |
| BrowseComp | 91.2 | 83.3 | +7.9 |
| deepSwe | 67.5 | 67.2 | +0.3 |
| Monthly $ | $1,800 | $68 | $+1,732 |
| OpenRouter id | `moonshotai/kimi-k3` | `openai/gpt-5.6-luna` | |

K3 leads on TB and BrowseComp in published BenchLM rows; deepSwe is near-tie. Price comparison depends on OpenRouter list at snapshot — see table.

## A. Triple joint Pareto (TB + Browse + deepSwe)

| Model | TB | Browse | deepSwe | Monthly $ | Joint |
| --- | ---: | ---: | ---: | ---: | --- |
| DeepSeek V4 Flash (`deepseek/deepseek-v4-flash`) | 56.9 | 73.2 | 54.4 | $33 | yes |
| GPT-5.6 Luna (`openai/gpt-5.6-luna`) | 84.7 | 83.3 | 67.2 | $68 | yes |
| GPT-5.6 Terra (`openai/gpt-5.6-terra`) | 87.4 | 87.5 | 69.6 | $675 | yes |
| GPT-5.6 Sol (`openai/gpt-5.6-sol`) | 91.9 | 92.2 | 72.7 | $3,375 | yes |
| Kimi K3 (`moonshotai/kimi-k3`) | 88.3 | 91.2 | 67.5 | $1,800 | yes |

### Triple mean residual rank

| Rank | Model | Mean | TB | Browse | deepSwe | Joint |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | GPT-5.6 Luna | +7.47 | +12.59 | +4.06 | +5.75 | yes |
| 2 | GPT-5.6 Terra | +1.48 | +2.54 | +0.08 | +1.82 | yes |
| 3 | GPT-5.6 Sol | -0.77 | -1.87 | -0.94 | +0.50 | yes |
| 4 | Kimi K3 | -1.56 | -1.99 | +0.30 | -2.98 | yes |
| 5 | DeepSeek V4 Flash | -6.62 | -11.26 | -3.50 | -5.09 | yes |

### Terminal-Bench 2.0 trend (triple)

Slope full +12.751 → robust **+12.751** (n=5; excl: none)


### BrowseComp trend (triple)

Slope full +8.180 → robust **+8.180** (n=5; excl: none)


### deepSwe trend (triple)

Slope full +6.328 → robust **+6.328** (n=5; excl: none)


## B. Pair joint Pareto (TB + BrowseComp only)

Wider set (n=23). deepSwe shown when available.

| Rank | Model | TB | Browse | deepSwe | Monthly $ | Joint | Est |
| ---: | --- | ---: | ---: | ---: | ---: | --- | --- |
| 1 | DeepSeek V4 Flash | 56.9 | 73.2 | 54.4 | $33 | yes | — |
| 2 | GPT-5.6 Luna | 84.7 | 83.3 | 67.2 | $68 | yes | yes |
| 3 | GPT-5.6 Terra | 87.4 | 87.5 | 69.6 | $675 | yes | yes |
| 4 | Kimi K3 | 88.3 | 91.2 | 67.5 | $1,800 | yes | — |
| 5 | GPT-5.6 Sol | 91.9 | 92.2 | 72.7 | $3,375 | yes | — |
| 6 | MiniMax M3 | 66.0 | 83.52 | — | $158 | yes | — |
| 7 | DeepSeek V4 Pro | 67.9 | 83.4 | — | $163 | yes | yes |
| 8 | Qwen: Qwen3.5-35B-A3B | 40.5 | 61.0 | — | $106 | — | — |
| 9 | Step 3.7 Flash | 59.5 | 75.82 | — | $131 | — | yes |
| 10 | Qwen: Qwen3.5-27B | 41.6 | 61.0 | — | $161 | — | — |
| 11 | Inkling Small | 64.7 | 77.4 | — | $202 | — | — |
| 12 | Qwen: Qwen3.5-122B-A10B | 49.4 | 63.8 | — | $214 | — | — |
| 13 | GLM 4.7 | 41.0 | 52.0 | — | $221 | — | — |
| 14 | Kimi K2.6 | 66.7 | 83.2 | — | $308 | — | yes |
| 15 | Kimi K2.5 | 50.8 | 60.6 | — | $342 | — | — |
| 16 | GLM 5 | 63.5 | 68.0 | — | $405 | — | — |
| 17 | Inkling | 63.8 | 77.1 | — | $529 | — | — |
| 18 | Claude Sonnet 5 | 80.4 | 84.7 | — | $1,200 | — | yes |
| 19 | GPT-5.4 | 75.1 | 82.7 | — | $1,688 | — | — |
| 20 | Claude Opus 4.8 | 74.6 | 84.3 | — | $3,000 | — | — |
| 21 | Claude Opus 4.7 | 69.4 | 79.3 | — | $3,000 | — | yes |
| 22 | Claude Opus 4.6 | 65.4 | 83.7 | — | $3,000 | — | — |
| 23 | GPT-5.5 | 82.0 | 84.4 | — | $3,375 | — | yes |

### Pair mean residual rank (TB + Browse)

| Rank | Model | Mean | TB | Browse | Monthly $ | Joint |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | GPT-5.6 Luna | +21.02 | +29.92 | +12.11 | $68 | yes |
| 2 | GPT-5.6 Terra | +13.27 | +18.51 | +8.03 | $675 | yes |
| 3 | Kimi K3 | +10.80 | +13.40 | +8.20 | $1,800 | yes |
| 4 | GPT-5.6 Sol | +10.04 | +13.15 | +6.94 | $3,375 | yes |
| 5 | DeepSeek V4 Pro | +8.38 | +7.72 | +9.03 | $163 | yes |
| 6 | MiniMax M3 | +7.65 | +6.03 | +9.28 | $158 | yes |
| 7 | Claude Sonnet 5 | +5.58 | +7.99 | +3.16 | $1,200 | — |
| 8 | DeepSeek V4 Flash | +5.53 | +6.49 | +4.57 | $33 | yes |
| 9 | Kimi K2.6 | +4.58 | +2.62 | +6.55 | $308 | — |
| 10 | Inkling Small | +2.72 | +3.19 | +2.26 | $202 | — |
| 11 | Step 3.7 Flash | +1.45 | +0.65 | +2.24 | $131 | — |
| 12 | GPT-5.5 | +1.20 | +3.25 | -0.86 | $3,375 | — |
| 13 | GPT-5.4 | +0.27 | +0.60 | -0.06 | $1,688 | — |
| 14 | Claude Opus 4.8 | -1.98 | -3.43 | -0.53 | $3,000 | — |
| 15 | Inkling | -2.54 | -3.59 | -1.49 | $529 | — |
| 16 | GLM 5 | -5.95 | -2.26 | -9.63 | $405 | — |
| 17 | Claude Opus 4.6 | -6.88 | -12.63 | -1.13 | $3,000 | — |
| 18 | Claude Opus 4.7 | -7.08 | -8.63 | -5.53 | $3,000 | — |
| 19 | Qwen: Qwen3.5-122B-A10B | -12.01 | -12.46 | -11.55 | $214 | — |
| 20 | Qwen: Qwen3.5-35B-A3B | -14.45 | -17.07 | -11.83 | $106 | — |
| 21 | Kimi K2.5 | -15.18 | -13.92 | -16.43 | $342 | — |
| 22 | Qwen: Qwen3.5-27B | -15.91 | -18.50 | -13.32 | $161 | — |
| 23 | GLM 4.7 | -22.26 | -21.05 | -23.46 | $221 | — |

## Caveats

- deepSwe published for few models; triple n is small — treat ranks cautiously.
- Kimi K3 `supported`; Luna often `estimated` on BenchLM.
- Not comparable to SWE-Pro axis (K3 missing Pro).

Data: [`data/llm-benchmark-pareto-tb-browse-deepswe.json`](data/llm-benchmark-pareto-tb-browse-deepswe.json) · [`data/llm-benchmark-pareto-tb-browse.json`](data/llm-benchmark-pareto-tb-browse.json)

Conclusions: [`llm-benchmark-tb-browse-deepswe-conclusions.md`](llm-benchmark-tb-browse-deepswe-conclusions.md)
