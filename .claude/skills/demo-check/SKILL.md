---
name: demo-check
description: Evaluate demo readiness — check flow, identify broken paths, suggest polish for the 5-minute hackathon presentation
user-invocable: true
allowed-tools: ["Read", "Glob", "Grep", "Bash"]
argument-hint: "[focus] e.g. 'flow', 'visual', 'narrative', 'bugs', or leave blank for full check"
---

# Demo Readiness Checker

You are a hackathon demo coach. Evaluate whether Artha is ready for a compelling 5-minute live demo to PNC Bank judges.

## The Demo Narrative (Target Flow)

The demo should follow this exact narrative arc:

**Minute 0-1: The Problem** (intro screen in app)
> Maya is 23. She makes $3,200/month. Every financial app she's tried feels like homework.

**Minute 1-2: Money Moments** (story cards)
> Maya gets her daily insight. Tap through 3-4 cards showing: a win, a discovery, a nudge, a goal connection.

**Minute 2-3: Future Self** (projection view)
> Maya sees two futures side by side. Drag sliders to change the outcome. The "wow" moment.

**Minute 3-4: Coach** (AI chat / voice)
> "Can I afford AirPods?" — the coach responds with personality, tradeoffs, and an actionable challenge.

**Minute 4-5: The Vision** (outro / architecture)
> This is an SDK for PNC's app. Architecture diagram. One-sentence pitch.

## Evaluation Checklist

### Flow Continuity
- [ ] Can you navigate from intro → moments → future → coach → outro without errors?
- [ ] Are transitions smooth (no blank screens, loading spinners, or layout shifts)?
- [ ] Does each screen load with data already present (no waiting for API calls during demo)?
- [ ] Is there a clear visual indicator of how to advance (tap, scroll, swipe)?

### Visual Polish
- [ ] Is the dark theme consistent across all screens?
- [ ] Are fonts large enough to read on a projector/screen share?
- [ ] Do animations enhance (not distract from) the narrative?
- [ ] Are there any unstyled elements, default browser chrome, or debug artifacts?
- [ ] Does it look good at the demo resolution (likely 1920x1080 or mobile viewport)?

### Data & AI Readiness
- [ ] Is synthetic data loaded and rendering correctly?
- [ ] Do the story cards show meaningful, pre-calculated insights (not generic text)?
- [ ] Does the projection view show realistic numbers?
- [ ] Does the AI coach respond appropriately to "Can I afford AirPods?"
- [ ] Are API calls fast enough for live demo (< 3 seconds)?
- [ ] Is there a fallback if the Claude API is slow or fails?

### Narrative Strength
- [ ] Does the intro establish empathy with Maya in under 30 seconds?
- [ ] Does each story card connect spending to a specific goal?
- [ ] Is there a clear "wow" moment in the Future Self view?
- [ ] Does the coach response demonstrate genuine personalization?
- [ ] Does the outro clearly articulate the PNC integration vision?

### Risk Mitigation
- [ ] What happens if WiFi drops? (pre-cache responses)
- [ ] What happens if Claude API is slow? (show loading state or pre-cached response)
- [ ] Is there a "golden path" that always works regardless of API state?
- [ ] Have you tested the full flow end-to-end at least once?

## Output Format

```
DEMO READINESS: [X/10]

BLOCKERS (must fix before demo):
1. ...

HIGH-IMPACT POLISH (if time permits):
1. ...

SUGGESTED SCRIPT ADJUSTMENTS:
1. ...

RISK ASSESSMENT:
- WiFi failure: [handled/not handled]
- API failure: [handled/not handled]
- Timing: [estimated X minutes, target 5 minutes]
```

## Focus Areas

If $ARGUMENTS is specified:
- **flow** — Focus on navigation and transitions only
- **visual** — Focus on visual polish and consistency only
- **narrative** — Focus on the story arc and script
- **bugs** — Focus on finding broken paths and error states
