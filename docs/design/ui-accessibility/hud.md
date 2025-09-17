# HUD Iterations

*By Priya "Gizmo" Sharma*

> **Gizmo:** The HUD is a drifter's dashboard—responsive, accessible, and always within reach.

## Feedback
Internal playtest sessions flagged two pain points:
- Badges cramped on narrow displays.
- Screen readers lacked cues for health and adrenaline changes.

## Changes
- HUD grid now auto-fits badges (`minmax(100px, 1fr)`) for better responsiveness.
- Health and adrenaline bars expose `role="progressbar"` with live `aria-*` updates.
- Badge layout uses column flex with consistent gaps for clearer reading.

## Rationale
Keeping the CRT vibe while boosting clarity and accessibility keeps our drifters' tools sharp wherever they roam. Chunky panels and a 256-color palette wink at VGA adventure roots.
