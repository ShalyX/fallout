# Fallout — demo video script

**Target runtime:** 2:35–2:50

**Track:** Best Apps and Agents

**Recording rule:** Show the working production app for most of the video. Keep the face/camera optional. No long architecture lecture.

## 0:00–0:18 — Problem

**Voiceover**

> Companies can usually answer why a decision was made. The harder question is the reverse: when the evidence underneath a decision turns out to be wrong, which decisions are no longer trustworthy?

**Screen**
- Open `https://fallout-xi.vercel.app`.
- Hold on the healthy dependency graph.
- Let the title “What breaks when the evidence breaks?” remain visible.

## 0:18–0:40 — What Fallout does

**Voiceover**

> Fallout builds an evidence-dependency graph across experiments, claims, decisions, and business artifacts. Unlike keyword search, an edge means the target rationale would materially weaken if the source were false.

**Screen**
- Move across E-17 → activation claim → Global rollout / Q4 roadmap / Sales deck claim.
- Click one node briefly so the right inspector reveals the exact source excerpt.

## 0:40–1:25 — Magic moment: invalidate E-17

**Voiceover**

> In this workspace, Experiment E-17 reported an eleven percent relative activation lift. Later, we discover an Android instrumentation bug that invalidates that evidence. I mark E-17 invalid and propagate the blast radius.

**Screen**
1. Click E-17.
2. Click **Invalidate this evidence**.
3. Show the instrumentation-bug reason.
4. Click **Propagate blast radius**.
5. Let the red transition play without talking over the first beat.

**Voiceover after transition**

> Now Fallout shows the consequence, not just the broken source.

## 1:25–1:55 — Nuance, not “turn everything red”

**Voiceover**

> Global rollout becomes unsupported because its primary rationale depended on E-17. The Q4 roadmap and sales claim need review because one support path broke but independent evidence survives. Progressive profile setup stays supported because its primary rationale came from user research, not the invalid experiment.

**Screen**
- Open **Global rollout** from the fallout queue.
- Show broken support in the inspector.
- Click **Q4 onboarding roadmap** and show surviving independent support.
- Point to **Progressive profile setup** remaining green on the graph.

## 1:55–2:25 — Nebius + NVIDIA technical proof

**This section MUST be updated after live credentials are available. Do not record the final video while this remains unproven.**

**Voiceover — final intended wording**

> The semantic dependency layer runs on NVIDIA Nemotron through Nebius Token Factory. Nemotron reads the workspace artifacts, proposes support edges with verbatim grounding spans, and checks the counterfactual question: would this rationale weaken if the source were false? Once an edge is accepted, Fallout’s blast-radius propagation is deterministic and inspectable.

**Screen — final intended proof**
- Open **System trace**.
- Show that the provider is configured.
- Show one real Nemotron-derived edge / inference result from the live runtime.
- If useful, briefly show `/api/status` or benchmark output as supplementary proof, but keep the application on screen.

**Do not claim benchmark accuracy until `npm run eval:nemotron` has actually completed against Token Factory.**

## 2:25–2:45 — Close

**Voiceover**

> Code has dependency graphs. Data has lineage. Fallout gives business decisions the same thing — so when evidence breaks, teams know exactly what needs to be revalidated.

**Screen**
- Return to the full red blast-radius graph and fallout queue.
- End on the Fallout mark and production UI.

## Recording checklist

- Production URL is visible at least once.
- The invalidation interaction is shown live, not as a static screenshot.
- At least one broken path and one surviving independent path are inspected.
- “Nebius Token Factory” is spoken aloud.
- “NVIDIA Nemotron” is spoken aloud.
- Real live model proof is shown after credentials arrive.
- Runtime stays under 3:00.
- Upload publicly to YouTube.
- No copyrighted music or unlicensed third-party assets.