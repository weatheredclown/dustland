# Hydration System: Thirst and Survival

## Status Update
- Hydration value and `hydration:tick` event exist; tests cover dry-zone drain and camp refills.
- HUD droplet meter and prototype script are not in the repo.
- Caution phase and gear/perk-based modifiers remain unimplemented.

*By Mateo "Wing" Alvarez*
> **Priority:** 5 – Survival polish.
*Date: 2025-09-06*
*Status: Draft*

> **Wing:** Players shouldn't fail because they didn't find a menu. Survival should push momentum, not punish curiosity.

## Goals
- Ease early-game frustration without removing survival tension.
- Provide clear feedback on water reserves and dehydration.
- Leave space for mods to tweak timers and starting gear.

## Mechanics
1. **Starting Canteen:** New characters spawn with a two-sip canteen. Refill at wells, oases, and base water barrels.
2. **Hydration Meter:** A small droplet icon drains every in-game hour. When empty, HP drains rapidly.
3. **Caution Phase:** At 25% hydration, HUD flashes amber and stamina regen slows.
4. **Perks & Gear:** Items and perks can slow drain or auto-refill over time.

## Implementation Sketch
- [x] Add `hydration` property to party members in `scripts/core/status.js`.
 - [x] Broadcast `hydration:tick` from the world loop; listeners reduce the meter only in zones marked dry.
- [x] Update the HUD with a compact droplet meter next to HP when not full (games that don't trigger this effect shouldn't have to worry about this as the meter should hide)
- [x] Seed a starter canteen in character creation via `data/items/starter.js`.

> **Gizmo:** Keep values in `data/balance/hydration.json` so modders can adjust without touching code.
> **Wing:** we can put it in a stand-alone .js file, but it has to be source to allow for running locally
> **Gizmo:** Oh right, I keep forgetting.

## Risks
- Extra HUD elements could clutter small screens.
- Sparse water sources might still soft-lock players.

## Prototype
Run `node scripts/hydration-prototype.js` to simulate hourly drain and canteen refills.
