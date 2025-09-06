# Hydration System: Thirst and Survival

*By Mateo "Wing" Alvarez*
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
- [ ] Broadcast `hydration:tick` from the world loop; listeners reduce the meter.
- [ ] Update the HUD with a compact droplet meter next to stamina.
- [ ] Seed a starter canteen in character creation via `data/items/starter.json`.

> **Gizmo:** Keep values in `data/balance/hydration.json` so modders can adjust without touching code.

## Risks
- Extra HUD elements could clutter small screens.
- Sparse water sources might still soft-lock players.

## Prototype
Run `node scripts/hydration-prototype.js` to simulate hourly drain and canteen refills.
