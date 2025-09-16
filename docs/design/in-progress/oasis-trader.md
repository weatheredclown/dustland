# Oasis Trader: Barter and Trust

*By Priya "Gizmo" Sharma*
> **Priority:** 7 – Economy needs persistence.
*Date: 2025-09-06*
*Status: Draft*

> **Gizmo:** A fair trade shouldn't feel like a slot machine reset. Let's make commerce persistent and readable.

## Goals
- Slow inventory resets so goods feel grounded.
- React to player haggling patterns.
- Surface stock and refresh timers through clean UI.

## Mechanics
1. **Inventory Cycles:** Traders refresh 25% of stock daily; rare items rotate weekly.
2. **Haggling Memory:** Cancelled deals increase a `grudge` meter; at three strikes, prices rise 10% for a day.
3. **Scrap Barter:** Prices list scrap values and show stat deltas in a compare panel. Baseline costs stay within the same order of magnitude as comparable loot drops, then adjust up or down based on trust and scarcity rather than flat inflation.
4. **UI:** Timer tooltip shows next refresh; grudge state tints the trader portrait.

## Implementation Sketch
- [x] Extend `scripts/core/trader.js` with `inventory` arrays and `grudge` fields.
- [x] Store refresh schedules in the module json and make editable by ACK.
 - [x] Update `scripts/ui/trade.js` to display timers and grudge indicators.
- [x] Emit `trader:refresh` events for mods to hook into.

> **Clown:** Keep the JSON flat so mods can drop in new traders without rewriting logic.

## Dustland Integration
- [x] Replace static shop NPC in `dustland.module.js` with a traveling trader.
- [x] Give the trader an east-west patrol loop across the world map.
 - [x] Stock begins with scavenged gear and upgrades across three refresh waves.
- [ ] Calibrate early-upgrade price bands in `data/traders/oasis.json` and `scripts/core/trader.js` so stat bumps cost 60–90 scrap (target < 200 LOC leveraging existing price helpers).
- [ ] Teach the trader grudge meter to award stacked discounts for positive standings and surface the math in the trade UI (target < 220 LOC across logic and UI copy).
- [ ] Define the premium gear weekly rotation tables and cap their prices at 2× top wasteland drops, plus add a regression test covering the refresh window (target < 240 LOC including data + test harness).

## Risks
- Long refresh timers may stall players lacking supplies.
- Grudge mechanics could confuse without explicit UI.

## Prototype
`node scripts/trader-refresh-prototype.js` simulates daily stock rotations and grudge accumulation.
