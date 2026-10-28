# Fallout

**Fallout tells teams which decisions stop being trustworthy when the evidence underneath them breaks.**

[![Tests](https://github.com/ShalyX/fallout/actions/workflows/test.yml/badge.svg)](https://github.com/ShalyX/fallout/actions/workflows/test.yml)

**Live demo:** https://fallout-xi.vercel.app

Built for the Nebius × NVIDIA Global AI Hackathon. Fallout models evidence, claims, decisions, and downstream artifacts as verified support dependencies, then computes a reverse blast radius when a source is invalidated.

## Why it exists

Teams can usually answer “why did we make this decision?” eventually. They are much worse at the reverse question:

> **This evidence was wrong — which decisions now need to be revisited?**

Fallout turns that into an inspectable graph rather than a chatbot answer.

## Not just search. Not just a knowledge graph.

Keyword search can find documents that **mention** E-17. Ordinary lineage can show that one artifact links to another. Fallout asks a stricter semantic question:

> **If this evidence were false, would the target rationale materially weaken?**

A dependency is accepted only when it is grounded in visible source text and passes that counterfactual support test. This lets Fallout distinguish:

- a document that merely mentions an experiment from a decision that actually depends on it;
- a decision whose only rationale collapsed from one that still has independent support;
- direct fallout from unrelated artifacts that should remain untouched.

That distinction is what makes reverse invalidation propagation useful instead of simply turning every reference red.

## Current demo

The committed Atlas Onboarding corpus is synthetic and explicitly labeled as such. It contains:

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

### Try the demo

1. Open the live demo.
2. Inspect Experiment E-17 and its verified downstream support edges.
3. Choose **Invalidate this evidence**.
4. Propagate the Android instrumentation incident.
5. Inspect the blast-radius queue and open individual decisions to see broken vs surviving support.
6. Open **System trace** to see the boundary between Nemotron reasoning and deterministic propagation.

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

The model is intentionally not asked to “discover true causality.” Nemotron’s role is semantic dependency inference from unstructured artifacts. Once an edge is accepted, Fallout’s support-loss propagation is deterministic and inspectable.

## Proof currently available

- Production deployment returns successfully on Vercel.
- Deterministic propagation and corpus-integrity tests run in GitHub Actions on every push/PR.
- Source excerpts used by verified fixture edges are checked against committed artifacts.
- The UI uses the tested propagation engine rather than hard-coded post-invalidation statuses.
- `/api/status` reports whether the Nebius provider is actually configured.

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

The live model boundary is implemented in `src/model/nebius.mjs` and `src/model/dependency.mjs`.

Set:

```bash
export NEBIUS_API_KEY="..."
```

Then run the labeled edge benchmark:

```bash
npm run eval:nemotron
```

Until credentials are available and that benchmark actually runs, model quality remains explicitly **UNPROVEN**. The demo fixture does not masquerade as a completed live inference run.

## Repository map

- `artifacts/` — realistic synthetic source corpus
- `src/data/atlas.mjs` — labeled demo graph with citations and counterfactuals
- `src/core/propagate.mjs` — deterministic blast-radius engine
- `src/model/` — Nebius/Nemotron provider boundary
- `evals/` — labeled live-model benchmark
- `tests/` — deterministic propagation and corpus-integrity tests
- `api/` — deployment-ready provider status/inference handlers
- `prompts/` — grounded dependency-classification instructions
- `.github/workflows/` — CI test proof for every push and pull request
