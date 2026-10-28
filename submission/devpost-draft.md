# Fallout — Devpost draft

## Project name

Fallout

## Tagline

**Know which decisions stop being trustworthy when the evidence underneath them breaks.**

## Track

Best Apps and Agents

## What it does

Fallout is an evidence-dependency system for business decisions.

Teams make product, roadmap, sales, and strategy decisions from experiments, research, metrics, and internal claims. The failure mode is usually not that the original evidence disappears — it is that the evidence later becomes unreliable while all of the downstream decisions remain in place.

Fallout models evidence, claims, decisions, and business artifacts as support dependencies. When a source is invalidated, Fallout computes a reverse semantic blast radius and separates downstream items into:

- **Unsupported** — the primary rationale collapsed.
- **Needs Review** — a material support path broke, but independent support remains.
- **Still Supported** — the invalidated evidence was secondary and the primary rationale survives.

The key distinction is semantic rather than referential. A document mentioning an experiment does not automatically depend on it. Fallout accepts a support edge only when the target rationale would materially weaken if the source were false and the relationship is grounded in visible source text.

## The demo

The Atlas Onboarding demo uses a synthetic but realistic product workspace containing an experiment, user research, product claims, roadmap decisions, rollout decisions, and sales messaging.

Experiment E-17 appears to show an 11% relative activation lift. A later instrumentation incident reveals that Android activation events were under-recorded, invalidating the experiment.

When E-17 is invalidated, Fallout propagates the impact:

- **Global rollout → Unsupported**
- **Q4 onboarding roadmap → Needs Review**
- **Sales deck claim → Needs Review**
- **Progressive profile setup → Still Supported**

That final item is important: Fallout does not simply turn every connected item red. It preserves decisions whose independent evidence still holds.

## How we built it

The system is split into two layers:

1. **Semantic dependency inference** — NVIDIA Nemotron, called through Nebius Token Factory, reads workspace artifacts and proposes evidence-support relationships with exact grounding spans and a counterfactual check: *would this target rationale materially weaken if the source were false?*
2. **Deterministic propagation** — once support edges are accepted, Fallout computes invalidation impact with inspectable graph logic rather than asking the model to decide downstream truth.

The repository includes:

- a realistic synthetic source corpus;
- a labeled evidence-dependency graph;
- deterministic blast-radius propagation;
- grounded source excerpts for every verified fixture edge;
- an 8-case adversarial Nemotron benchmark covering support, mere mentions, topical similarity, independent evidence, chronology errors, and misleading shared numbers;
- Vercel API handlers for provider status and inference;
- GitHub Actions tests for propagation and corpus integrity.

## Why Nebius + NVIDIA matter

**FINALIZE ONLY AFTER LIVE PROOF.**

NVIDIA Nemotron is used for the part that deterministic rules cannot reliably solve: deciding whether one unstructured artifact is genuinely part of the reasoning basis for another, rather than merely being mentioned or topically related.

Nebius Token Factory provides the runtime inference layer for that semantic dependency step. Fallout deliberately keeps the model boundary narrow and auditable: Nemotron proposes and verifies cited support relationships; the application performs reverse invalidation propagation deterministically.

Before submission, replace this section with measured observations from the live Token Factory benchmark and state the exact Nemotron model used in production.

## What makes Fallout different

Search answers: **“Where is E-17 mentioned?”**

Ordinary lineage answers: **“What is linked to E-17?”**

Fallout answers: **“If E-17 is false, which previous decisions lose a material part of their justification?”**

That reverse question is the product.

## Challenges

The hardest design problem was avoiding a fake notion of AI causality. An LLM cannot prove that one human decision was truly caused by one document. We narrowed the claim to something auditable: evidence dependency backed by verbatim source spans and counterfactual reasoning.

The second challenge was avoiding false precision. The propagation engine can use internal support factors, but the judge-facing UI does not present those values as calibrated probabilities. Instead it exposes broken versus surviving support paths and defensible categorical outcomes.

## Accomplishments

- Built a working reverse evidence-dependency graph rather than a chat wrapper.
- Made the core magic moment visual: one invalidated source transforms the graph into a targeted revalidation queue.
- Preserved independent evidence instead of marking every descendant invalid.
- Grounded fixture edges in committed source excerpts and machine-checks that prevent citation drift.
- Separated model reasoning from deterministic propagation so judges can inspect where AI is actually required.
- Deployed a public production demo and public MIT-licensed repository.

## What we learned

Business decisions have an underdeveloped equivalent of software dependency management. Codebases can tell you what breaks when a package changes, and data platforms can trace lineage when a dataset changes. Decision systems usually store the forward rationale but do not operationalize the reverse question when evidence is invalidated.

We also learned that semantic lineage is only useful if it distinguishes dependency from proximity. A graph with too many weak edges creates panic, not clarity.

## What’s next

- ingest real Notion, Google Docs, Linear/Jira, experiment, and research workspaces;
- add human review workflows for accepting or rejecting inferred support edges;
- continuously monitor evidence sources for invalidation events;
- add temporal lineage so teams can ask what was known when a decision was made;
- expand from product decisions into finance, policy, operations, and research workflows.

## Built with

- Nebius Token Factory — **live integration pending credentials at time of this draft**
- NVIDIA Nemotron — **final production model / benchmark result to be inserted after live proof**
- JavaScript / Node.js
- Vercel
- GitHub Actions

## Links

- Live demo: https://fallout-xi.vercel.app
- Public repository: https://github.com/ShalyX/fallout

## Required tool feedback

**Do not invent this section. Complete after live use.**

### Nebius Token Factory

- What we used it for:
- Zero-to-first-inference experience:
- What worked well:
- What slowed us down / could improve:
- Would we use it again and why:

### NVIDIA Nemotron

- Model used:
- What we used it for:
- Grounding / structured-output behavior:
- What worked well:
- What could improve:
- Would we use it again and why:

## Final proof placeholders

Before submitting, insert:

- exact live Nemotron model name;
- Token Factory benchmark result;
- screenshot/video proof of live runtime inference;
- public YouTube demo URL;
- specific Nebius/NVIDIA feedback from actual use.