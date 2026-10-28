# Fallout

**Fallout tells teams which decisions stop being trustworthy when the evidence underneath them breaks.**

Built for the Nebius × NVIDIA Global AI Hackathon. The product models evidence, claims, and decisions as verified support dependencies, then computes a reverse blast radius when a source is invalidated.

## Why it exists

Teams are usually able to answer “why did we make this decision?” eventually. They are much worse at the reverse question: **“this evidence was wrong — which decisions now need to be revisited?”**

Fallout turns that into an inspectable graph rather than a chatbot answer.

## Current demo

The committed Atlas Onboarding corpus is synthetic and labeled as such. It contains:

- Experiment E-17 (+11% activation result)
- a later Android instrumentation incident that invalidates E-17
- Interview Study E-19, an independent qualitative evidence source
- two product claims
- three product decisions
- one sales artifact

Invalidating E-17 produces a deliberately differentiated result:

- **Global rollout → Unsupported**
- **Q4 onboarding roadmap → Needs Review**
- **Sales deck claim → Needs Review**
- **Progressive profile setup → Still Supported**

The UI consumes the same deterministic propagation engine covered by tests; post-invalidation states are not hard-coded presentation values.

## Architecture

```text
workspace artifacts
      ↓
Nemotron structured extraction        [live proof pending credentials]
      ↓
candidate support dependencies
      ↓
cited + counterfactual verification
      ↓
verified evidence-dependency graph
      ↓
deterministic invalidation propagation
      ↓
targeted re-review queue + explanations
```

The model is intentionally not asked to “discover true causality.” Each dependency must be grounded in visible source text and answer a counterfactual question: **if the source were false, would the target rationale materially weaken?**

## Run locally

Requires Node 20+.

```bash
npm run dev
```

Open `http://localhost:4173`.

Run deterministic tests:

```bash
npm test
```

## Nebius / Nemotron

The live model boundary is already implemented in `src/model/nebius.mjs` and `src/model/dependency.mjs`.

Set:

```bash
export NEBIUS_API_KEY="..."
```

Then run the labeled edge benchmark:

```bash
npm run eval:nemotron
```

Until that credential exists, model quality remains explicitly **UNPROVEN**. The demo fixture does not masquerade as a completed live inference run.

## Repository map

- `artifacts/` — realistic synthetic source corpus
- `src/data/atlas.mjs` — labeled demo graph with citations and counterfactuals
- `src/core/propagate.mjs` — deterministic blast-radius engine
- `src/model/` — Nebius/Nemotron provider boundary
- `evals/` — labeled live model benchmark
- `tests/` — deterministic propagation and corpus-integrity tests
- `api/` — deployment-ready provider status/inference handlers
- `prompts/` — grounded dependency-classification instructions
- `.github/workflows/` — CI test proof for every push and pull request
