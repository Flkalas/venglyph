# SWE + LiveCodeBench subset Pareto (15 models)

**Snapshot date:** 2026-08-06 (UTC)

Intersection of models that have **both** SWE-bench Verified and LiveCodeBench in the parent analysis (**n=15**).

## Method

- Cost: same as parent (OpenRouter, 300M tokens/mo, I:O 3:1)
- Per-bench 2D Pareto: score↑ vs monthly $↓
- Composite: `frontier_count / 2`
- **Joint Pareto**: non-dominated on (SWE↑, LCB↑, cost↓) together

## Joint Pareto (SWE + LCB + cost)

| Model | SWE | LCB | Monthly $ | Notes |
| --- | ---: | ---: | ---: | --- |
| DeepSeek V4 Flash (`deepseek/deepseek-v4-flash`) | 79.0 | 91.6 | $33 | — |
| DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`) | 80.6 | 93.5 | $163 | — |
| Claude Opus 4.5 (`anthropic/claude-opus-4.5`) | 80.9 | 84.8 | $3,000 | — |

## Above the linear cost–score trend

OLS of **score ~ log10(monthly $)** on the same 15 models. Residual &gt; 0 ⇒ above the trend (better than the subset’s average cost–performance line).

**SWE top residuals:** DeepSeek V4 Flash (+8.3), DeepSeek V4 Pro (+6.9), Kimi K2.6 (+5.3)

**LCB top residuals:** Qwen3.7 Max (+12.0), DeepSeek V4 Pro (+9.9), Claude Opus 4.5 (+9.6)

Charts live in the canvas under “Above the linear cost–score trend”.


## Robust trend (drop V3 0324 + Gemini 2.5 Pro)

Refit `score ~ log10(monthly $)` after **explicitly excluding** DeepSeek V3 0324 and Gemini 2.5 Pro (large negative cost–score outliers).

- SWE slope +4.261 → **+1.746** (n=13)
- LCB slope -6.676 → **-9.986** (n=13)

### Mean residual rank (vs this robust line)

| Rank | Model | Mean resid | SWE | LCB | Pareto | Joint |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | Qwen3.7 Max | +5.21 | +1.15 | +9.27 | 11 | — |
| 2 | Claude Opus 4.5 | +4.75 | +0.50 | +9.01 | 3 | yes |
| 3 | DeepSeek V4 Pro | +3.75 | +2.41 | +5.08 | 2 | yes |
| 4 | Kimi K2.6 | +2.73 | +1.53 | +3.94 | 9 | — |
| 5 | Qwen3.7 Plus | +0.40 | -0.51 | +1.31 | 5 | — |
| 6 | Qwen3.6 Plus | +0.18 | +0.39 | -0.03 | 6 | — |
| 7 | DeepSeek V4 Flash | -0.85 | +2.02 | -3.73 | 1 | yes |
| 8 | Kimi K2.5 | -1.07 | -1.95 | -0.20 | 10 | — |
| 9 | Claude Opus 4.6 | -1.30 | +0.40 | -2.99 | 15 | — |
| 10 | Qwen3.5 397B-A17B | -2.45 | -2.15 | -2.74 | 8 | — |
| 11 | GLM-4.7 | -3.41 | -4.62 | -2.19 | 7 | — |
| 12 | GPT-5.4 | -3.47 | +0.04 | -6.98 | 14 | — |
| 13 | Gemini 3.1 Pro | -4.47 | +0.81 | -9.75 | 13 | — |
| 14 | Gemini 2.5 Pro † | -13.61 | -15.79 | -11.42 | 12 | — |
| 15 | DeepSeek V3 0324 † | -37.91 | -36.10 | -39.73 | 4 | — |

† = excluded from the fit (still scored against the robust line).

Data: [`data/llm-benchmark-pareto-swe-lcb-robust-trend.json`](data/llm-benchmark-pareto-swe-lcb-robust-trend.json)

## Composite ranking (per-bench frontiers)

| Rank | Model | Frontiers | SWE | LCB | Monthly $ | Joint |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | DeepSeek V4 Flash | 2/2 | 79.0 | 91.6 | $33 | yes |
| 2 | DeepSeek V4 Pro | 2/2 | 80.6 | 93.5 | $163 | yes |
| 3 | Claude Opus 4.5 | 1/2 | 80.9 | 84.8 | $3,000 | yes |
| 4 | DeepSeek V3 0324 | 0/2 | 42.0 | 49.2 | $145 | — |
| 5 | Qwen3.7 Plus | 0/2 | 77.7 | 89.6 | $168 | — |
| 6 | Qwen3.6 Plus | 0/2 | 78.8 | 87.1 | $219 | — |
| 7 | GLM-4.7 | 0/2 | 73.8 | 84.9 | $221 | — |
| 8 | Qwen3.5 397B-A17B | 0/2 | 76.4* | 83.6* | $263 | — |
| 9 | Kimi K2.6 | 0/2 | 80.2* | 89.6* | $308 | — |
| 10 | Kimi K2.5 | 0/2 | 76.8 | 85.0 | $342 | — |
| 11 | Qwen3.7 Max | 0/2 | 80.4 | 91.6 | $664 | — |
| 12 | Gemini 2.5 Pro | 0/2 | 63.8 | 69.0 | $1,031 | — |
| 13 | Gemini 3.1 Pro | 0/2 | 80.6 | 69.5 | $1,350 | — |
| 14 | GPT-5.4 | 0/2 | 80.0 | 71.3 | $1,688 | — |
| 15 | Claude Opus 4.6 | 0/2 | 80.8 | 72.8 | $3,000 | — |

\* = estimated flag from parent snapshot.

## SWE-bench Verified frontier

| Model | Score | Monthly $ |
| --- | ---: | ---: |
| Claude Opus 4.5 | 80.9 | $3,000 |
| DeepSeek V4 Pro | 80.6 | $163 |
| DeepSeek V4 Flash | 79.0 | $33 |

## LiveCodeBench frontier

| Model | Score | Monthly $ |
| --- | ---: | ---: |
| DeepSeek V4 Pro | 93.5 | $163 |
| DeepSeek V4 Flash | 91.6 | $33 |

## Full subset table

| Model | SWE | LCB | Blend $/1M | Monthly $ | On frontiers |
| --- | ---: | ---: | ---: | ---: | --- |
| DeepSeek V4 Flash | 79.0 | 91.6 | $0.110 | $33 | swe_bench_verified, livecodebench |
| DeepSeek V3 0324 | 42.0 | 49.2 | $0.482 | $145 | — |
| DeepSeek V4 Pro | 80.6 | 93.5 | $0.544 | $163 | swe_bench_verified, livecodebench |
| Qwen3.7 Plus | 77.7 | 89.6 | $0.560 | $168 | — |
| Qwen3.6 Plus | 78.8 | 87.1 | $0.731 | $219 | — |
| GLM-4.7 | 73.8 | 84.9 | $0.738 | $221 | — |
| Qwen3.5 397B-A17B | 76.4 | 83.6 | $0.877 | $263 | — |
| Kimi K2.6 | 80.2 | 89.6 | $1.028 | $308 | — |
| Kimi K2.5 | 76.8 | 85.0 | $1.140 | $342 | — |
| Qwen3.7 Max | 80.4 | 91.6 | $2.212 | $664 | — |
| Gemini 2.5 Pro | 63.8 | 69.0 | $3.438 | $1,031 | — |
| Gemini 3.1 Pro | 80.6 | 69.5 | $4.500 | $1,350 | — |
| GPT-5.4 | 80.0 | 71.3 | $5.625 | $1,688 | — |
| Claude Opus 4.5 | 80.9 | 84.8 | $10.000 | $3,000 | swe_bench_verified |
| Claude Opus 4.6 | 80.8 | 72.8 | $10.000 | $3,000 | — |

Parent: [`llm-benchmark-pareto.md`](llm-benchmark-pareto.md) · Data: [`data/llm-benchmark-pareto-swe-lcb.json`](data/llm-benchmark-pareto-swe-lcb.json)
