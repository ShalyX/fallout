# Fallout — final submission checklist

**Official deadline:** October 30, 2026 at 10:00 AM PDT / 6:00 PM WAT.

## Pass/fail gates

- [x] Public working demo exists: https://fallout-xi.vercel.app
- [x] Public repository exists: https://github.com/ShalyX/fallout
- [x] MIT license present.
- [x] README includes setup and architecture.
- [x] Project fits Best Apps and Agents.
- [ ] **Project makes a real runtime call to Nebius Token Factory or runs on Nebius AI Cloud.**
- [ ] **At least one NVIDIA open-source model is used in the live project.**
- [ ] Judges can access live model functionality without restriction through the judging period.

## Nebius / Nemotron proof

- [ ] Receive or obtain usable Nebius credentials.
- [ ] Add `NEBIUS_API_KEY` to Vercel as a secret environment variable; never commit it.
- [ ] Verify `/api/status` reports `configured: true`.
- [ ] Run `npm run eval:nemotron` against the labeled 8-case benchmark.
- [ ] Save benchmark result and exact model identifier.
- [ ] Inspect false positives for mention-only / topical-similarity cases.
- [ ] Inspect false negatives for genuine support edges.
- [ ] Tune prompt/model only if benchmark quality is inadequate.
- [ ] Verify one real inference through the deployed app/API.
- [ ] Capture live proof for demo video.

## Product / QA

- [x] Black forensic design approved and merged to production.
- [x] Healthy dependency map renders in production.
- [x] E-17 invalidation triggers differentiated propagation.
- [x] Unsupported / Needs Review / Still Supported remain distinct.
- [x] Fallout queue contains only items requiring action.
- [x] Source inspector exposes grounded excerpts.
- [x] System Trace explains Nemotron vs deterministic boundary.
- [ ] Final desktop visual pass after live model integration.
- [ ] Final mobile/narrow-width smoke test.
- [ ] Test production in an incognito/private window.
- [ ] Confirm no API keys or secrets appear in repository/client bundle.

## Demo video

- [x] Timed script prepared in `submission/demo-script.md`.
- [ ] Record final video only after live model proof exists.
- [ ] Show key application modules functioning live.
- [ ] Show E-17 invalidation and blast-radius transition.
- [ ] Show one broken path and one independently surviving path.
- [ ] Say “Nebius Token Factory” aloud.
- [ ] Say “NVIDIA Nemotron” aloud.
- [ ] Show real runtime model proof.
- [ ] Keep final runtime under 3:00.
- [ ] Upload publicly to YouTube.
- [ ] Add YouTube URL to Devpost.

## Devpost

- [x] Draft narrative prepared in `submission/devpost-draft.md`.
- [ ] Select Best Apps and Agents track.
- [ ] Add working demo URL.
- [ ] Add public GitHub URL.
- [ ] Add YouTube demo URL.
- [ ] Explicitly name Nebius Token Factory in description and Built With.
- [ ] Explicitly name exact NVIDIA model in description and Built With.
- [ ] Add measured benchmark / live-inference evidence.
- [ ] Provide specific feedback on Nebius Token Factory from actual use.
- [ ] Provide specific feedback on NVIDIA Nemotron from actual use.
- [ ] Confirm no unsupported claims remain in the writeup.
- [ ] Submit well before the deadline and verify visible submission confirmation.

## Final judge-mode questions

Before submission, we must answer each in one sentence:

1. Why is this not just search?
2. Why is this not just a knowledge graph?
3. What exactly does Nemotron do?
4. What exactly is deterministic?
5. How do we prevent hallucinated dependency edges?
6. Why does a real company care?
7. What is the one visual magic moment?
8. What proof shows the required hackathon technology is genuinely used?

## Current red gate

**Live Nebius Token Factory + NVIDIA Nemotron proof is still the only existential blocker.** Everything else can continue to be polished, but do not mark the project submission-ready until that gate is closed.