# AITOL — AI Token Optimization Layer

> Universal middleware that cuts AI API costs and latency by compressing, caching, routing, and compiling natural-language requests before they ever hit a model.

---

## 1. Overview

**AITOL (AI Token Optimization Layer)** is a middleware layer that sits between an application and any LLM provider (OpenAI, Anthropic, Google, open-source models, etc.). It intercepts outgoing requests and applies a pipeline of optimizations — caching, compression, smart routing, and analytics — before the request reaches the model, and optimizes the response on the way back.

The long-term evolution of the project adds an **MRL (Machine-Readable Language) compilation layer**: instead of sending verbose natural language to the model, ATOL compiles repeated/structural prompt patterns into compact structured bytecode that the model (or a lightweight interpreter) can execute faster and more cheaply.

**Core thesis:** most AI token spend is *waste* — repeated context, redundant instructions, unnecessarily verbose prompts, and uncached duplicate queries. ATOL recovers that waste without the developer changing how they write prompts.

---

## 2. Problem Statement

| Problem | Cost |
|---|---|
| Same/similar prompts sent repeatedly | Wasted tokens + latency on every call |
| Verbose, unstructured natural-language prompts | More input tokens than the task needs |
| Single-provider lock-in | No cost/quality arbitrage across models |
| No visibility into spend | Token costs scale silently with usage |
| Long system prompts re-sent every call | Fixed token tax on every request |

AITOL is designed to be a **drop-in proxy** — change a base URL, not your application logic — and immediately start reducing spend.

---

## 3. High-Level Architecture

```
                         ┌─────────────────────────────┐
                         │        Client App           │
                         │  (sends normal API request)  │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │         AITOL GATEWAY         │
                         │  (drop-in API-compatible      │
                         │   reverse proxy)              │
                         └──────────────┬───────────────┘
                                        │
        ┌───────────────┬──────────────┼──────────────┬───────────────┐
        ▼               ▼              ▼              ▼               ▼
 ┌────────────┐  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐
 │   CACHE     │  │ COMPRESSOR │ │  MRL        │ │   ROUTER    │ │  ANALYTICS   │
 │   LAYER     │  │ (semantic  │ │  COMPILER   │ │ (model      │ │  ENGINE      │
 │ (exact +    │  │ + prompt   │ │ (NL → byte- │ │  selection) │ │ (cost, token,│
 │  semantic)  │  │ trimming)  │ │  code)      │ │             │ │  latency)    │
 └─────┬──────┘  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └──────┬───────┘
       │               │              │              │               │
       └───────────────┴──────────────┴──────────────┴───────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │     PROVIDER ADAPTER LAYER    │
                         │  Anthropic / OpenAI / Gemini  │
                         │  / Local models               │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │   LLM Provider     │
                              └──────────────────┘
```

---

## 4. Core Components

### 4.1 Gateway
- Drop-in reverse proxy exposing an API-compatible interface (e.g. `/v1/messages`, `/v1/chat/completions`) so existing SDKs work unchanged — only the base URL changes.
- Auth pass-through to the underlying provider (ATOL never stores provider API keys insecurely; keys are forwarded or vaulted per deployment).

### 4.2 Cache Layer
- **Exact-match cache:** hash of (model, messages, params) → cached response, configurable TTL.
- **Semantic cache:** embeds incoming prompts and checks for near-duplicate requests above a similarity threshold; returns cached response when safe (only for idempotent/non-time-sensitive queries — disabled by default for anything flagged as time-sensitive).
- Cache invalidation rules per use case (e.g. never cache when `temperature > 0.7`, never cache function-calling/tool-use turns by default).

### 4.3 Compressor
- Strips redundant whitespace, repeated boilerplate, and duplicate context from message history.
- **Prompt trimming:** summarizes or truncates long conversation history beyond a configurable token budget while preserving the most relevant turns.
- **System-prompt deduplication:** detects when the same large system prompt is sent on every call and replaces it with a short reference after the first call within a session (where provider/cache semantics allow).

### 4.4 MRL Compiler (Machine-Readable Language layer)
- Converts repeated structural prompt patterns (e.g. "extract fields X, Y, Z from this text and return JSON") into a compact bytecode-like instruction set.
- A lightweight interpreter expands the bytecode back into the minimum natural-language the target model needs, or — for supported models — sends the structured instruction directly.
- Maintains a **pattern library**: once a prompt shape has been compiled, subsequent calls with the same shape but different slot values reuse the compiled form instead of re-sending full natural language.
- Goal: turn "send the same 300-token instruction every time with 10 different words swapped" into "send a 20-token reference + the 10 words."

### 4.5 Smart Router
- Routes each request to the cheapest/fastest model capable of handling it, based on:
  - task complexity classification (simple extraction vs. multi-step reasoning)
  - configured cost/quality preferences
  - live provider latency and error rates
- Supports fallback chains (e.g. try cheap model → escalate to stronger model if confidence/quality check fails).

### 4.6 Analytics Engine
- Per-request logging: tokens in/out, cost, latency, cache hit/miss, model used.
- Dashboards: cost trends, cache hit rate, savings vs. "no ATOL" baseline, top prompt patterns by volume.
- Alerting on cost spikes or anomalous usage.

### 4.7 Provider Adapter Layer
- Normalizes requests/responses across Anthropic, OpenAI, Google, and self-hosted/open models so the rest of the pipeline is provider-agnostic.

---

## 5. Request Lifecycle (Step-by-Step)

1. **Client sends request** to ATOL gateway exactly as it would to the provider.
2. **Cache check** — exact hash lookup, then semantic similarity lookup if enabled.
   - Hit → return cached response immediately (near-zero latency, zero token cost).
3. **Compression pass** — trims redundant history, dedupes repeated system prompt, drops unnecessary whitespace/formatting.
4. **MRL compilation check** — does this prompt match a known structural pattern?
   - Yes → compile to bytecode/compact form.
   - No → pass through as optimized natural language; optionally register as a new pattern candidate.
5. **Routing decision** — classify task complexity, select target model per cost/quality policy.
6. **Provider adapter** — translate the optimized request into the target provider's exact API format.
7. **Model call** — request sent to the actual LLM provider.
8. **Response handling** — response normalized, cached (if cacheable), logged to analytics.
9. **Response returned** to client in the original expected format.

---

## 6. Tech Stack (Reference Implementation)

| Layer | Technology |
|---|---|
| Gateway / API | Node.js (Fastify) or FastAPI (Python) |
| Cache | Redis (exact match) + vector DB (Pinecone/Weaviate/pgvector) for semantic cache |
| MRL Compiler | Custom DSL + interpreter (Python/Rust core) |
| Routing logic | Rule engine + lightweight classifier model |
| Analytics | PostgreSQL/ClickHouse for logs, Grafana/custom dashboard for visualization |
| Queue/async | Redis Streams or Kafka for high-throughput logging |
| Deployment | Docker + Kubernetes, or single-binary deploy for smaller installs |
| SDKs | Drop-in wrapper SDKs for Python and Node.js matching Anthropic/OpenAI SDK shape |

---

## 7. Repository Structure (Suggested)

```
atol/
├── gateway/                # API-compatible reverse proxy
│   ├── routes/
│   └── middleware/
├── cache/
│   ├── exact_cache.py
│   └── semantic_cache.py
├── compressor/
│   ├── trimmer.py
│   └── dedupe.py
├── mrl/
│   ├── compiler.py
│   ├── interpreter.py
│   └── pattern_library/
├── router/
│   ├── classifier.py
│   └── policy.yaml
├── adapters/
│   ├── anthropic_adapter.py
│   ├── openai_adapter.py
│   └── gemini_adapter.py
├── analytics/
│   ├── logger.py
│   └── dashboard/
├── sdk/
│   ├── python/
│   └── node/
├── tests/
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

## 8. Phased Build Roadmap

**Phase 1 — Core Proxy (Weeks 1–3)**
- Basic gateway that passes requests through unchanged to one provider (Anthropic).
- Exact-match caching only.
- Basic request/response logging.

**Phase 2 — Compression & Multi-Provider (Weeks 4–6)**
- Add prompt trimming and system-prompt dedup.
- Add OpenAI and Gemini adapters.
- Build the analytics dashboard v1 (cost, tokens, cache hit rate).

**Phase 3 — Smart Routing (Weeks 7–9)**
- Task complexity classifier.
- Cost/quality routing policy engine with fallback chains.

**Phase 4 — Semantic Cache (Weeks 10–12)**
- Vector-based semantic similarity caching.
- Configurable safety rules for when semantic caching is/isn't applied.

**Phase 5 — MRL Compilation Layer (Weeks 13–18)**
- Pattern detection engine to identify recurring structural prompts.
- Bytecode compiler + interpreter.
- Pattern library with versioning.
- Benchmark MRL-compiled vs. raw NL prompts for token savings.

**Phase 6 — Hardening & Launch (Weeks 19+)**
- Security review (key handling, multi-tenant isolation).
- Load testing, SDK polish, documentation, public launch.

---

## 9. Success Metrics

- **% token reduction** vs. baseline (uncached, uncompressed, single-model).
- **Cache hit rate** (exact + semantic).
- **Cost savings** in $ per 1,000 requests.
- **Latency delta** introduced by the middleware (target: negligible on cache miss, near-zero on cache hit).
- **Routing accuracy** — % of requests correctly routed to the cheapest viable model without quality degradation.

---

## 10. Security & Privacy Considerations

- Provider API keys are never logged or cached alongside prompt/response data.
- Semantic cache must be tenant-isolated in multi-tenant deployments — no cross-customer cache hits.
- Configurable data retention policy for logged prompts/responses (support full opt-out of prompt logging for sensitive workloads).
- MRL pattern library should not retain raw user data — only structural shapes, not the slot values themselves, where possible.

---


