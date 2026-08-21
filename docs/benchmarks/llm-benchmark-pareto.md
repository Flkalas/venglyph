# LLM Benchmark vs OpenRouter Price — Pareto Analysis

**Snapshot date:** 2026-08-06 (UTC)

## Estimation pass (BenchLM / AA)

Filled **12** missing cells from [BenchLM models.json](https://benchlm.ai/data/models.json) (2 with `estimated=true`). Public curated scores are kept; BenchLM only fills blanks. When BenchLM `evidenceStatus=estimated`, overlapping public scores are also flagged.

Attribution: **Data from BenchLM.ai** (AA fields only when embedded as `aaLiveCodeBench`).

### Fills

| Model | Bench | Score | estimated | BenchLM field | evidenceStatus |
| --- | --- | ---: | --- | --- | --- |
| `moonshotai/kimi-k2.6` | LiveCodeBench | 89.6 | yes | `coding.liveCodeBenchV6` | estimated |
| `qwen/qwen3.5-397b-a17b` | LiveCodeBench | 83.6 | yes | `coding.liveCodeBenchV6` | estimated |
| `anthropic/claude-opus-4.5` | LiveCodeBench | 84.8 | no | `coding.liveCodeBenchV6` | supported |
| `deepseek/deepseek-chat-v3-0324` | SWE-bench Verified | 42.0 | no | `coding.sweVerified` | supported |
| `google/gemini-2.5-pro` | SWE-bench Verified | 63.8 | no | `coding.sweVerified` | supported |
| `moonshotai/kimi-k2.5` | LiveCodeBench | 85.0 | no | `coding.liveCodeBenchV6` | supported |
| `openai/gpt-4.1` | SWE-bench Verified | 54.6 | no | `coding.sweVerified` | supported |
| `qwen/qwen3.5-27b` | SWE-bench Verified | 72.4 | no | `coding.sweVerified` | supported |
| `qwen/qwen3.6-plus` | LiveCodeBench | 87.1 | no | `coding.liveCodeBenchV6` | supported |
| `qwen/qwen3.7-max` | LiveCodeBench | 91.6 | no | `coding.liveCodeBench` | supported |
| `qwen/qwen3.7-plus` | LiveCodeBench | 89.6 | no | `coding.liveCodeBench` | supported |
| `z-ai/glm-4.7` | LiveCodeBench | 84.9 | no | `coding.liveCodeBench` | supported |

## Key findings (with estimated fills)

- **DeepSeek V4 Pro**: frontier 3/3 (composite 1.00), ~$163/mo
- **DeepSeek V4 Flash**: frontier 2/2 (composite 1.00), ~$33/mo
- **GPT-4o mini**: frontier 2/2 (composite 1.00), ~$79/mo
- **Llama 4 Scout**: frontier 1/1 (composite 1.00), ~$45/mo
- **MiniMax M2.5**: frontier 1/1 (composite 1.00), ~$117/mo
- **MiniMax M3**: frontier 1/1 (composite 1.00), ~$158/mo


## SWE + LCB subset (15 models)

Models with both scores: [`llm-benchmark-pareto-swe-lcb.md`](llm-benchmark-pareto-swe-lcb.md).

## Assumptions

- Cost: OpenRouter list price, blend `(3×input + 1×output)/4` $/1M tokens
- Monthly load: **300M tokens**, I:O = **3:1** → `225×input + 75×output`
- SWE-bench: **Verified**
- Per-benchmark Pareto: maximize score, minimize monthly $
- Composite: `frontier_count / available_benches`
- `estimated=true`: BenchLM Estimated model and/or AA-embedded field

## Caveats

- HumanEval/MBPP are largely saturated; frontiers skew toward cheaper models.
- BFCL-V4 public coverage on aggregator sites is sparse (many frontier models missing).
- RULER/NIAH coverage is sparse for 2026 frontier models; treat as reference-only.
- SWE-bench Verified scores depend on harness/scaffold; vendor self-reports may differ.
- OpenRouter prices can vary by provider route; used list endpoint base pricing.
- Scores with estimated=true come from BenchLM Estimated models or AA-embedded fields.
- Public curated scores are never overwritten by BenchLM fills.
- Artificial Analysis free API requires a key; AA values used only when embedded in BenchLM as aaLiveCodeBench.

## Composite Pareto Ranking (after fills)

| Rank | Model | Frontiers | Composite | Monthly $ | Est. on frontier | BenchLM fills | On |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`) | 3/3 | 1.00 | $163 | 0 | 0 | swe_bench_verified, livecodebench, humaneval |
| 2 | DeepSeek V4 Flash (`deepseek/deepseek-v4-flash`) | 2/2 | 1.00 | $33 | 0 | 0 | swe_bench_verified, livecodebench |
| 3 | GPT-4o mini (`openai/gpt-4o-mini`) | 2/2 | 1.00 | $79 | 0 | 0 | humaneval, mbpp |
| 4 | Llama 4 Scout (`meta-llama/llama-4-scout`) | 1/1 | 1.00 | $45 | 0 | 0 | niah |
| 5 | MiniMax M2.5 (`minimax/minimax-m2.5`) | 1/1 | 1.00 | $117 | 0 | 0 | swe_bench_verified |
| 6 | MiniMax M3 (`minimax/minimax-m3`) | 1/1 | 1.00 | $158 | 0 | 0 | swe_bench_verified |
| 7 | Claude Sonnet 5 (`anthropic/claude-sonnet-5`) | 1/1 | 1.00 | $1,200 | 1 | 0 | swe_bench_verified |
| 8 | Claude Opus 5 (`anthropic/claude-opus-5`) | 1/1 | 1.00 | $3,000 | 0 | 0 | swe_bench_verified |
| 9 | Qwen3.5 27B (`qwen/qwen3.5-27b`) | 1/2 | 0.50 | $161 | 0 | 1 | bfcl |
| 10 | GPT-4 Turbo (`openai/gpt-4-turbo`) | 1/2 | 0.50 | $4,500 | 0 | 0 | ruler |
| 11 | Qwen3.7 Plus (`qwen/qwen3.7-plus`) | 1/3 | 0.33 | $168 | 0 | 1 | bfcl |
| 12 | Kimi K2 0905 (`moonshotai/kimi-k2-0905`) | 1/3 | 0.33 | $322 | 0 | 0 | mbpp |
| 13 | Qwen3.7 Max (`qwen/qwen3.7-max`) | 1/3 | 0.33 | $664 | 0 | 1 | bfcl |
| 14 | GPT-5 (`openai/gpt-5`) | 1/3 | 0.33 | $1,031 | 0 | 0 | mbpp |
| 15 | Claude Opus 4.6 (`anthropic/claude-opus-4.6`) | 1/3 | 0.33 | $3,000 | 0 | 0 | humaneval |
| 16 | Claude Opus 4.5 (`anthropic/claude-opus-4.5`) | 1/3 | 0.33 | $3,000 | 0 | 1 | bfcl |

## Per-benchmark frontiers

### SWE-bench Verified

| Model | Score | estimated | Monthly $ | Source |
| --- | ---: | --- | ---: | --- |
| Claude Opus 5 | 96.0 | no | $3,000 | public_curated |
| Claude Sonnet 5 | 85.2 | yes | $1,200 | public_curated |
| DeepSeek V4 Pro | 80.6 | no | $163 | public_curated |
| MiniMax M3 | 80.5 | no | $158 | public_curated |
| MiniMax M2.5 | 80.2 | no | $117 | public_curated |
| DeepSeek V4 Flash | 79.0 | no | $33 | public_curated |

### BFCL

| Model | Score | estimated | Monthly $ | Source |
| --- | ---: | --- | ---: | --- |
| Claude Opus 4.5 | 77.5 | no | $3,000 | public_curated |
| Qwen3.7 Max | 75.0 | no | $664 | public_curated |
| Qwen3.7 Plus | 72.9 | no | $168 | public_curated |
| Qwen3.5 27B | 68.5 | no | $161 | public_curated |

### LiveCodeBench

| Model | Score | estimated | Monthly $ | Source |
| --- | ---: | --- | ---: | --- |
| DeepSeek V4 Pro | 93.5 | no | $163 | public_curated |
| DeepSeek V4 Flash | 91.6 | no | $33 | public_curated |

### HumanEval

| Model | Score | estimated | Monthly $ | Source |
| --- | ---: | --- | ---: | --- |
| Claude Opus 4.6 | 95.2 | no | $3,000 | public_curated |
| DeepSeek V4 Pro | 94.8 | no | $163 | public_curated |
| GPT-4o mini | 87.2 | no | $79 | public_curated |

### MBPP

| Model | Score | estimated | Monthly $ | Source |
| --- | ---: | --- | ---: | --- |
| GPT-5 | 91.7 | no | $1,031 | public_curated |
| Kimi K2 0905 | 90.0 | no | $322 | public_curated |
| GPT-4o mini | 84.1 | no | $79 | public_curated |

### RULER

| Model | Score | estimated | Monthly $ | Source |
| --- | ---: | --- | ---: | --- |
| GPT-4 Turbo | 81.2 | no | $4,500 | public_curated |

### NIAH

| Model | Score | estimated | Monthly $ | Source |
| --- | ---: | --- | ---: | --- |
| Llama 4 Scout | 99.0 | no | $45 | public_curated |

## Full model table

| Model | Monthly $ | SWE | BFCL | LCB | HumanEval | MBPP | RULER | NIAH | Frontiers | Est* |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| DeepSeek V4 Pro | $163 | 80.6 | — | 93.5 | 94.8 | — | — | — | 3 | 0 |
| DeepSeek V4 Flash | $33 | 79.0 | — | 91.6 | — | — | — | — | 2 | 0 |
| GPT-4o mini | $79 | — | — | — | 87.2 | 84.1 | — | — | 2 | 0 |
| Llama 4 Scout | $45 | — | — | — | — | — | — | 99.0 | 1 | 0 |
| MiniMax M2.5 | $117 | 80.2 | — | — | — | — | — | — | 1 | 0 |
| MiniMax M3 | $158 | 80.5 | — | — | — | — | — | — | 1 | 0 |
| Claude Sonnet 5 | $1,200 | 85.2* | — | — | — | — | — | — | 1 | 1 |
| Claude Opus 5 | $3,000 | 96.0 | — | — | — | — | — | — | 1 | 0 |
| Qwen3.5 27B | $161 | 72.4 | 68.5 | — | — | — | — | — | 1 | 0 |
| GPT-4 Turbo | $4,500 | — | — | — | 87.1 | — | 81.2 | — | 1 | 0 |
| Qwen3.7 Plus | $168 | 77.7 | 72.9 | 89.6 | — | — | — | — | 1 | 0 |
| Kimi K2 0905 | $322 | — | — | 53.7 | 94.5 | 90.0 | — | — | 1 | 0 |
| Qwen3.7 Max | $664 | 80.4 | 75.0 | 91.6 | — | — | — | — | 1 | 0 |
| GPT-5 | $1,031 | 74.9 | — | — | 93.4 | 91.7 | — | — | 1 | 0 |
| Claude Opus 4.6 | $3,000 | 80.8 | — | 72.8 | 95.2 | — | — | — | 1 | 0 |
| Claude Opus 4.5 | $3,000 | 80.9 | 77.5 | 84.8 | — | — | — | — | 1 | 0 |
| Qwen3 32B | $39 | — | — | 65.7 | — | — | — | — | 0 | 0 |
| Llama 4 Maverick | $105 | — | — | 43.4 | — | 77.6 | — | — | 0 | 0 |
| DeepSeek V3.1 | $128 | — | — | 56.4 | — | — | — | — | 0 | 0 |
| MiniMax M2 | $134 | — | — | 83.0 | — | — | — | — | 0 | 0 |
| DeepSeek V3 0324 | $145 | 42.0 | — | 49.2 | — | — | — | — | 0 | 0 |
| MiniMax M2.1 | $158 | — | — | 78.0 | — | — | — | — | 0 | 0 |
| Qwen3.6 Plus | $219 | 78.8 | — | 87.1 | — | — | — | — | 0 | 0 |
| GLM-4.7 | $221 | 73.8 | — | 84.9 | — | — | — | — | 0 | 0 |
| Qwen3 235B-A22B | $239 | — | — | 70.7 | — | 81.4 | — | — | 0 | 0 |
| Nova 2 Lite | $255 | — | 60.3 | 71.0 | — | — | — | — | 0 | 0 |
| Qwen3.5 397B-A17B | $263 | 76.4* | 72.9 | 83.6* | — | — | — | — | 0 | 2 |
| GLM-4.5 | $300 | — | — | 72.9 | — | — | — | — | 0 | 0 |
| Kimi K2.6 | $308 | 80.2* | — | 89.6* | — | — | — | — | 0 | 2 |
| Gemini 3 Flash | $338 | 78.0 | — | — | — | — | — | — | 0 | 0 |
| Kimi K2.5 | $342 | 76.8 | — | 85.0 | — | — | — | — | 0 | 0 |
| Claude Haiku 4.5 | $600 | 73.3* | — | — | — | — | — | — | 0 | 1 |
| Grok 4.5 | $900 | — | — | 79.0 | — | — | — | — | 0 | 0 |
| Gemini 2.5 Pro | $1,031 | 63.8 | — | 69.0 | — | 91.0 | — | — | 0 | 0 |
| GPT-5.1 | $1,031 | 76.3 | — | — | — | — | — | — | 0 | 0 |
| GPT-4.1 | $1,050 | 54.6 | — | — | — | — | — | 80.0 | 0 | 0 |
| GPT-4o | $1,312 | — | — | — | 90.2 | — | — | — | 0 | 0 |
| Gemini 3.1 Pro | $1,350 | 80.6 | — | 69.5 | 93.0 | — | — | — | 0 | 0 |
| GPT-5.2 | $1,444 | 80.0* | — | — | — | — | — | 98.0 | 0 | 1 |
| GPT-5.4 | $1,688 | 80.0 | — | 71.3 | 94.5 | — | — | — | 0 | 0 |
| Claude Sonnet 4.6 | $1,800 | 79.6 | — | — | — | — | — | — | 0 | 0 |
| Claude Opus 4.8 | $3,000 | 88.6 | — | — | — | — | — | — | 0 | 0 |
| Claude Fable 5 | $6,000 | 95.0 | — | — | — | — | — | — | 0 | 0 |

\* column = count of scores with `estimated=true`. Cell `*` = that score is estimated.

## Sources

- OpenRouter GET /api/v1/models
- https://llm-stats.com/benchmarks/swe-bench-verified
- https://llm-stats.com/benchmarks/livecodebench
- https://llm-stats.com/benchmarks/bfcl-v4
- https://llm-stats.com/benchmarks/humaneval
- https://benchlm.ai/benchmarks/swe-bench-verified
- https://tokenmix.ai/blog/llm-leaderboard-2026
- NVIDIA RULER (historical 128K)
- Awesome Agents long-context leaderboard (NIAH/MRCR proxies)
- https://benchlm.ai/data/models.json
- https://benchlm.ai (Estimated/Supported evidenceStatus)
- Artificial Analysis fields embedded in BenchLM (aaLiveCodeBench, aaCodingIndex)
- https://benchlm.ai (evidenceStatus estimated/supported)
- Artificial Analysis fields embedded in BenchLM (aaLiveCodeBench)

Machine-readable snapshot: [`data/llm-benchmark-pareto.json`](data/llm-benchmark-pareto.json)
