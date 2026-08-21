# Agentic + Coding Pareto — SWE-Pro · Terminal-Bench · BrowseComp

**Snapshot date:** 2026-08-06 (UTC)

## Method

- Scores: [BenchLM models.json](https://benchlm.ai/data/models.json) — `coding.swePro`, `terminalBench2`, `agentic.browseComp`
- Prices: OpenRouter `/api/v1/models`
- Cost: blend `(3×input+1×output)/4` $/1M · monthly **300M tok** I:O **3:1** (`225×input + 75×output`)
- Per-bench 2D Pareto: score↑ vs monthly $↓
- Composite: `frontier_count / available_benches`
- Models matched: **50** · Unmatched BenchLM rows (sample in JSON): 20

## Coverage

| Bench | Models with score |
| --- | ---: |
| SWE-bench Pro | 39 |
| Terminal-Bench 2.0 | 44 |
| BrowseComp | 27 |
| **All three** | **18** |

## Composite ranking (any coverage)

| Rank | Model | Frontiers | Composite | Monthly $ | SWE-Pro | TB 2.0 | BrowseComp | Est |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | OpenAI: GPT-5.6 Luna (`openai/gpt-5.6-luna`) | 3/3 | 1.00 | $68 | 62.7 | 84.7 | 83.3 | yes |
| 2 | OpenAI: GPT-5.6 Terra (`openai/gpt-5.6-terra`) | 3/3 | 1.00 | $675 | 63.4 | 87.4 | 87.5 | yes |
| 3 | Ling-3.0-flash (`inclusionai/ling-3.0-flash`) | 2/2 | 1.00 | $9 | 56.6 | — | 72.2 | yes |
| 4 | Poolside: Laguna S 2.1 (`poolside/laguna-s-2.1`) | 2/2 | 1.00 | $34 | 59.4 | 70.2 | — | — |
| 5 | Claude Opus 5 (`anthropic/claude-opus-5`) | 2/2 | 1.00 | $3,000 | 79.2 | — | 90.8 | — |
| 6 | Tencent: Hy3 preview (`tencent/hy3-preview`) | 1/1 | 1.00 | $30 | — | 54.4 | — | yes |
| 7 | Qwen: Qwen3.8 Max (`qwen/qwen3.8-max`) | 1/1 | 1.00 | $900 | 67.7 | — | — | yes |
| 8 | DeepSeek: DeepSeek V4 Flash 0423 (`deepseek/deepseek-v4-flash`) | 2/3 | 0.67 | $33 | 52.6 | 56.9 | 73.2 | — |
| 9 | OpenAI: GPT-5.6 Sol (`openai/gpt-5.6-sol`) | 2/3 | 0.67 | $3,375 | 64.6 | 91.9 | 92.2 | — |
| 10 | MiniMax: MiniMax M3 (`minimax/minimax-m3`) | 1/3 | 0.33 | $158 | 59.0 | 66.0 | 83.52 | — |
| 11 | Xiaomi: MiMo-V2.5 (`xiaomi/mimo-v2.5`) | 0/2 | 0.00 | $52 | 56.1 | 65.8 | — | yes |
| 12 | Qwen: Qwen3.5-35B-A3B (`qwen/qwen3.5-35b-a3b`) | 0/2 | 0.00 | $106 | — | 40.5 | 61.0 | — |
| 13 | Qwen: Qwen3.6 35B A3B (`qwen/qwen3.6-35b-a3b`) | 0/2 | 0.00 | $106 | 49.5 | 51.5 | — | yes |
| 14 | StepFun: Step 3.7 Flash (`stepfun/step-3.7-flash`) | 0/3 | 0.00 | $131 | 56.3 | 59.5 | 75.82 | yes |
| 15 | OpenAI: GPT-5.4 Nano (`openai/gpt-5.4-nano`) | 0/1 | 0.00 | $139 | — | 46.3 | — | — |
| 16 | MiniMax: MiniMax M2.7 (`minimax/minimax-m2.7`) | 0/2 | 0.00 | $142 | 56.2 | 57.0 | — | — |
| 17 | Qwen: Qwen3.5-27B (`qwen/qwen3.5-27b`) | 0/2 | 0.00 | $161 | — | 41.6 | 61.0 | — |
| 18 | DeepSeek: DeepSeek V4 Pro (`deepseek/deepseek-v4-pro`) | 0/3 | 0.00 | $163 | 55.4 | 67.9 | 83.4 | yes |
| 19 | Xiaomi: MiMo-V2.5-Pro (`xiaomi/mimo-v2.5-pro`) | 0/2 | 0.00 | $163 | 57.2 | 68.4 | — | — |
| 20 | Qwen: Qwen3.7 Plus (`qwen/qwen3.7-plus`) | 0/2 | 0.00 | $168 | 57.6 | 70.3 | — | — |
| 21 | Thinking Machines: Inkling Small (`thinkingmachines/inkling-small`) | 0/3 | 0.00 | $202 | 55.9 | 64.7 | 77.4 | — |
| 22 | Qwen: Qwen3.5-122B-A10B (`qwen/qwen3.5-122b-a10b`) | 0/2 | 0.00 | $214 | — | 49.4 | 63.8 | — |
| 23 | Qwen: Qwen3.6 Plus (`qwen/qwen3.6-plus`) | 0/2 | 0.00 | $219 | 56.6 | 61.6 | — | — |
| 24 | Z.ai: GLM 4.7 (`z-ai/glm-4.7`) | 0/2 | 0.00 | $221 | — | 41.0 | 52.0 | — |
| 25 | Z.ai: GLM 5.2 (`z-ai/glm-5.2`) | 0/2 | 0.00 | $252 | 62.1 | 81.0 | — | yes |
| 26 | Google: Gemini 3.5 Flash Lite (`google/gemini-3.5-flash-lite`) | 0/2 | 0.00 | $255 | 54.2 | 54.0 | — | — |
| 27 | MoonshotAI: Kimi K2.6 (`moonshotai/kimi-k2.6`) | 0/3 | 0.00 | $308 | 58.6 | 66.7 | 83.2 | yes |
| 28 | MoonshotAI: Kimi K2.5 (`moonshotai/kimi-k2.5`) | 0/3 | 0.00 | $342 | 50.7 | 50.8 | 60.6 | — |
| 29 | Z.ai: GLM 5 (`z-ai/glm-5`) | 0/3 | 0.00 | $405 | 58.4 | 63.5 | 68.0 | — |
| 30 | Qwen: Qwen3.6 27B (`qwen/qwen3.6-27b`) | 0/2 | 0.00 | $405 | 53.5 | 59.3 | — | yes |
| 31 | OpenAI: GPT-5.4 Mini (`openai/gpt-5.4-mini`) | 0/1 | 0.00 | $506 | — | 60.0 | — | yes |
| 32 | Thinking Machines: Inkling (`thinkingmachines/inkling`) | 0/3 | 0.00 | $529 | 54.3 | 63.8 | 77.1 | — |
| 33 | Meta: Muse Spark 1.1 (`meta/muse-spark-1.1`) | 0/2 | 0.00 | $600 | 61.5 | 80.0 | — | — |
| 34 | Qwen: Qwen3.7 Max (`qwen/qwen3.7-max`) | 0/2 | 0.00 | $664 | 60.6 | 69.7 | — | — |
| 35 | Qwen: Qwen3.6 Max Preview (`qwen/qwen3.6-max-preview`) | 0/2 | 0.00 | $693 | 57.3 | 65.4 | — | — |
| 36 | SpaceXAI: Grok 4.5 (`x-ai/grok-4.5`) | 0/2 | 0.00 | $900 | 64.7 | 83.3 | — | — |
| 37 | Google: Gemini 3.5 Flash (`google/gemini-3.5-flash`) | 0/2 | 0.00 | $1,012 | 55.1 | 76.2 | — | yes |
| 38 | Anthropic: Claude Sonnet 5 (`anthropic/claude-sonnet-5`) | 0/3 | 0.00 | $1,200 | 63.2 | 80.4 | 84.7 | yes |
| 39 | OpenAI: GPT-5.3-Codex (`openai/gpt-5.3-codex`) | 0/2 | 0.00 | $1,444 | 56.8 | 77.3 | — | — |
| 40 | OpenAI: GPT-5.2 (`openai/gpt-5.2`) | 0/2 | 0.00 | $1,444 | 55.6 | — | 65.8 | yes |

### Per-bench frontiers

#### SWE-bench Pro

| Model | Score | Monthly $ |
| --- | ---: | ---: |
| Claude Opus 5 | 79.2 | $3,000 |
| Qwen: Qwen3.8 Max | 67.7 | $900 |
| OpenAI: GPT-5.6 Terra | 63.4 | $675 |
| OpenAI: GPT-5.6 Luna | 62.7 | $68 |
| Poolside: Laguna S 2.1 | 59.4 | $34 |
| Ling-3.0-flash | 56.6 | $9 |

#### Terminal-Bench 2.0

| Model | Score | Monthly $ |
| --- | ---: | ---: |
| OpenAI: GPT-5.6 Sol | 91.9 | $3,375 |
| OpenAI: GPT-5.6 Terra | 87.4 | $675 |
| OpenAI: GPT-5.6 Luna | 84.7 | $68 |
| Poolside: Laguna S 2.1 | 70.2 | $34 |
| DeepSeek: DeepSeek V4 Flash 0423 | 56.9 | $33 |
| Tencent: Hy3 preview | 54.4 | $30 |

#### BrowseComp

| Model | Score | Monthly $ |
| --- | ---: | ---: |
| OpenAI: GPT-5.6 Sol | 92.2 | $3,375 |
| Claude Opus 5 | 90.8 | $3,000 |
| OpenAI: GPT-5.6 Terra | 87.5 | $675 |
| MiniMax: MiniMax M3 | 83.52 | $158 |
| OpenAI: GPT-5.6 Luna | 83.3 | $68 |
| DeepSeek: DeepSeek V4 Flash 0423 | 73.2 | $33 |
| Ling-3.0-flash | 72.2 | $9 |

## Caveats

- Provider-reported scores dominate; `estimated` = BenchLM evidenceStatus.
- Effort variants share base OpenRouter price.
- Prefer the **triple subset** for joint decisions.

Data: [`data/llm-benchmark-pareto-agentic-coding.json`](data/llm-benchmark-pareto-agentic-coding.json) · Triple: [`llm-benchmark-pareto-agentic-coding-triple.md`](llm-benchmark-pareto-agentic-coding-triple.md)
