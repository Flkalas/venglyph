# Triple subset — SWE-Pro ∩ Terminal-Bench 2.0 ∩ BrowseComp

**Snapshot date:** 2026-08-06 (UTC) · **n=18**

## Joint Pareto (all three scores ↑, cost ↓)

| Model | SWE-Pro | TB 2.0 | BrowseComp | Monthly $ | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| DeepSeek: DeepSeek V4 Flash 0423 (`deepseek/deepseek-v4-flash`) | 52.6 | 56.9 | 73.2 | $33 | BenchLM slug 'deepseek-v4-flash-max' mapped to base OpenRouter SKU (effort variant) |
| OpenAI: GPT-5.6 Luna (`openai/gpt-5.6-luna`) | 62.7 | 84.7 | 83.3 | $68 | estimated |
| OpenAI: GPT-5.6 Terra (`openai/gpt-5.6-terra`) | 63.4 | 87.4 | 87.5 | $675 | estimated |
| OpenAI: GPT-5.6 Sol (`openai/gpt-5.6-sol`) | 64.6 | 91.9 | 92.2 | $3,375 | — |
| MiniMax: MiniMax M3 (`minimax/minimax-m3`) | 59.0 | 66.0 | 83.52 | $158 | — |
| Anthropic: Claude Opus 4.8 (`anthropic/claude-opus-4.8`) | 69.2 | 74.6 | 84.3 | $3,000 | — |
| DeepSeek: DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`) | 55.4 | 67.9 | 83.4 | $163 | BenchLM slug 'deepseek-v4-pro-max' mapped to base OpenRouter SKU (effort variant) |

## Full triple table

| Rank | Model | SWE-Pro | TB | Browse | Monthly $ | Frontiers | Joint | Est |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1 | DeepSeek: DeepSeek V4 Flash 0423 | 52.6 | 56.9 | 73.2 | $33 | 3/3 | yes | — |
| 2 | OpenAI: GPT-5.6 Luna | 62.7 | 84.7 | 83.3 | $68 | 3/3 | yes | yes |
| 3 | OpenAI: GPT-5.6 Terra | 63.4 | 87.4 | 87.5 | $675 | 3/3 | yes | yes |
| 4 | OpenAI: GPT-5.6 Sol | 64.6 | 91.9 | 92.2 | $3,375 | 2/3 | yes | — |
| 5 | MiniMax: MiniMax M3 | 59.0 | 66.0 | 83.52 | $158 | 1/3 | yes | — |
| 6 | Anthropic: Claude Opus 4.8 | 69.2 | 74.6 | 84.3 | $3,000 | 1/3 | yes | — |
| 7 | DeepSeek: DeepSeek V4 Pro | 55.4 | 67.9 | 83.4 | $163 | 0/3 | yes | yes |
| 8 | StepFun: Step 3.7 Flash | 56.3 | 59.5 | 75.82 | $131 | 0/3 | — | yes |
| 9 | Thinking Machines: Inkling Small | 55.9 | 64.7 | 77.4 | $202 | 0/3 | — | — |
| 10 | MoonshotAI: Kimi K2.6 | 58.6 | 66.7 | 83.2 | $308 | 0/3 | — | yes |
| 11 | MoonshotAI: Kimi K2.5 | 50.7 | 50.8 | 60.6 | $342 | 0/3 | — | — |
| 12 | Z.ai: GLM 5 | 58.4 | 63.5 | 68.0 | $405 | 0/3 | — | — |
| 13 | Thinking Machines: Inkling | 54.3 | 63.8 | 77.1 | $529 | 0/3 | — | — |
| 14 | Anthropic: Claude Sonnet 5 | 63.2 | 80.4 | 84.7 | $1,200 | 0/3 | — | yes |
| 15 | OpenAI: GPT-5.4 | 57.7 | 75.1 | 82.7 | $1,688 | 0/3 | — | — |
| 16 | Anthropic: Claude Opus 4.7 | 64.3 | 69.4 | 79.3 | $3,000 | 0/3 | — | yes |
| 17 | Anthropic: Claude Opus 4.6 | 53.4 | 65.4 | 83.7 | $3,000 | 0/3 | — | — |
| 18 | OpenAI: GPT-5.5 | 58.6 | 82.0 | 84.4 | $3,375 | 0/3 | — | yes |

### Triple per-bench frontiers

**SWE-bench Pro:**
- Anthropic: Claude Opus 4.8: 69.2 @ $3,000/mo
- OpenAI: GPT-5.6 Terra: 63.4 @ $675/mo
- OpenAI: GPT-5.6 Luna: 62.7 @ $68/mo
- DeepSeek: DeepSeek V4 Flash 0423: 52.6 @ $33/mo

**Terminal-Bench 2.0:**
- OpenAI: GPT-5.6 Sol: 91.9 @ $3,375/mo
- OpenAI: GPT-5.6 Terra: 87.4 @ $675/mo
- OpenAI: GPT-5.6 Luna: 84.7 @ $68/mo
- DeepSeek: DeepSeek V4 Flash 0423: 56.9 @ $33/mo

**BrowseComp:**
- OpenAI: GPT-5.6 Sol: 92.2 @ $3,375/mo
- OpenAI: GPT-5.6 Terra: 87.5 @ $675/mo
- MiniMax: MiniMax M3: 83.52 @ $158/mo
- OpenAI: GPT-5.6 Luna: 83.3 @ $68/mo
- DeepSeek: DeepSeek V4 Flash 0423: 73.2 @ $33/mo

## Robust trend (cost–score residuals)

OLS `score ~ log10(monthly $)` on the triple subset (n=18). Robust fit drops points with first-pass residual **< mean − 2σ**, then refits. Positive residual ⇒ above the cost–score line (better than expected for the price).

### SWE-bench Pro

- Full slope +3.501 → robust **+3.501** (n_fit=18; excluded: none)

| Rank | Model | Resid | Score | Pred | Above |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | Claude Opus 4.8 | +7.79 | 69.2 | 61.4 | yes |
| 2 | GPT-5.6 Luna | +7.06 | 62.7 | 55.6 | yes |
| 3 | GPT-5.6 Terra | +4.26 | 63.4 | 59.1 | yes |
| 4 | Claude Sonnet 5 | +3.19 | 63.2 | 60.0 | yes |
| 5 | GPT-5.6 Sol | +3.02 | 64.6 | 61.6 | yes |
| 6 | Claude Opus 4.7 | +2.89 | 64.3 | 61.4 | yes |
| 7 | MiniMax M3 | +2.07 | 59.0 | 56.9 | yes |
| 8 | Kimi K2.6 | +0.65 | 58.6 | 58.0 | yes |

### Terminal-Bench 2.0

- Full slope +7.974 → robust **+7.974** (n_fit=18; excluded: none)

| Rank | Model | Resid | Score | Pred | Above |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | GPT-5.6 Luna | +21.30 | 84.7 | 63.4 | yes |
| 2 | GPT-5.6 Terra | +16.02 | 87.4 | 71.4 | yes |
| 3 | GPT-5.6 Sol | +14.95 | 91.9 | 77.0 | yes |
| 4 | Claude Sonnet 5 | +7.03 | 80.4 | 73.4 | yes |
| 5 | GPT-5.5 | +5.05 | 82.0 | 77.0 | yes |
| 6 | DeepSeek V4 Pro | +1.44 | 67.9 | 66.5 | yes |
| 7 | GPT-5.4 | +0.55 | 75.1 | 74.5 | yes |
| 8 | MiniMax M3 | -0.34 | 66.0 | 66.3 | — |

### BrowseComp

- Full slope +4.725 → robust **+4.149** (n_fit=17; excluded: Kimi K2.5)

| Rank | Model | Resid | Score | Pred | Above |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | GPT-5.6 Sol | +7.54 | 92.2 | 84.7 | yes |
| 2 | GPT-5.6 Terra | +5.74 | 87.5 | 81.8 | yes |
| 3 | GPT-5.6 Luna | +5.69 | 83.3 | 77.6 | yes |
| 4 | MiniMax M3 | +4.39 | 83.5 | 79.1 | yes |
| 5 | DeepSeek V4 Pro | +4.20 | 83.4 | 79.2 | yes |
| 6 | Kimi K2.6 | +2.86 | 83.2 | 80.3 | yes |
| 7 | Claude Sonnet 5 | +1.91 | 84.7 | 82.8 | yes |
| 8 | Claude Opus 4.8 | -0.14 | 84.3 | 84.4 | — |

### Mean residual rank (avg of three robust residuals)

| Rank | Model | Mean | SWE-Pro | TB | Browse | Joint | Est |
| ---: | --- | ---: | ---: | ---: | ---: | --- | --- |
| 1 | GPT-5.6 Luna | +11.35 | +7.06 | +21.30 | +5.69 | yes | yes |
| 2 | GPT-5.6 Terra | +8.67 | +4.26 | +16.02 | +5.74 | yes | yes |
| 3 | GPT-5.6 Sol | +8.50 | +3.02 | +14.95 | +7.54 | yes | — |
| 4 | Claude Sonnet 5 | +4.04 | +3.19 | +7.03 | +1.91 | — | yes |
| 5 | MiniMax M3 | +2.04 | +2.07 | -0.34 | +4.39 | yes | — |
| 6 | Claude Opus 4.8 | +1.90 | +7.79 | -1.94 | -0.14 | yes | — |
| 7 | DeepSeek V4 Pro | +1.35 | -1.58 | +1.44 | +4.20 | yes | yes |
| 8 | GPT-5.5 | +0.60 | -2.98 | +5.05 | -0.26 | — | yes |
| 9 | Kimi K2.6 | +0.52 | +0.65 | -1.96 | +2.86 | — | yes |
| 10 | GPT-5.4 | -1.00 | -2.83 | +0.55 | -0.71 | — | — |
| 11 | Inkling Small | -2.04 | -1.41 | -2.51 | -2.19 | — | — |
| 12 | DeepSeek V4 Flash | -3.03 | -1.95 | -4.03 | -3.12 | yes | — |
| 13 | Claude Opus 4.7 | -3.13 | +2.89 | -7.14 | -5.14 | — | yes |
| 14 | Step 3.7 Flash | -3.18 | -0.35 | -6.21 | -2.98 | — | yes |
| 15 | Inkling | -5.14 | -4.47 | -6.73 | -4.22 | — | — |
| 16 | GLM 5 | -6.30 | +0.04 | -6.11 | -12.84 | — | — |
| 17 | Claude Opus 4.6 | -6.63 | -8.01 | -11.14 | -0.74 | — | — |
| 18 | Kimi K2.5 † | -15.18 | -7.40 | -18.22 | -19.93 | — | — |

† = excluded from at least one bench’s robust fit (still scored against that line).

Data: [`data/llm-benchmark-pareto-agentic-coding-trend.json`](data/llm-benchmark-pareto-agentic-coding-trend.json)

Parent: [`llm-benchmark-pareto-agentic-coding.md`](llm-benchmark-pareto-agentic-coding.md) · Data: [`data/llm-benchmark-pareto-agentic-coding-triple.json`](data/llm-benchmark-pareto-agentic-coding-triple.json) · **Conclusions:** [`llm-benchmark-agentic-coding-conclusions.md`](llm-benchmark-agentic-coding-conclusions.md)
