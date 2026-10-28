# Analytics incident INC-284 — Android activation undercount

Detected: 2026-10-21  
Affected window: 2026-08-29 → 2026-09-22

## Finding
A batching regression in Android client v6.14 dropped approximately 30% of `activation_completed` events when the app was backgrounded during the final onboarding step.

## Impact
Experiment E-17 overlapped the affected window. The missingness was not balanced across control and variant because the simplified variant reached the final step faster and backgrounded less often.

## Required action
Treat the reported activation lift from E-17 as invalid pending re-analysis from raw server-side events. Any decision relying materially on the reported lift should be re-reviewed.
