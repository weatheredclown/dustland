# Dynamic Weather: Dust and Echoes

*By Alex "Echo" Johnson*

> **Echo:** The sky isn't just overhead—it's the tone poem of the wastes. Let it murmur, scream, or hold its breath.

## Goals
- **Mood Driver:** Weather colors every step, from blood-orange dawns to hushed ashfall.
- **Play Impact:** Each condition nudges stats—speed, visibility, encounter rates.
- **Lightweight:** No heavy shaders; reuse existing sprite layers and CSS filters.

## Implementation Sketch
1. [x] Add `scripts/core/weather.js` managing region forecasts and broadcasting `weather:change`.
2. [ ] Hook listeners in movement and encounter modules to adjust behavior.
3. [ ] Display a small banner with icon and descriptor at top of HUD.

> **Gizmo:** Data stays flat: `{state: "dust", speedMod: 0.8, encounterBias: "bandits"}`. Easy to debug, easier to extend.

## Risks
- Overlapping filters may muddy the CRT aesthetic.
- Too many storms could bog pacing; cap adverse days per week.

## Prototype
```
node scripts/weather-prototype.js
```
Runs a console simulation cycling states and logging modifiers.
