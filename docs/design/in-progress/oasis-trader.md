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
- [ ] Tune prices so early upgrades land around 60–90 scrap per key stat bump, then ease discounts for players with positive grudge standings.
  - [ ] Capture live pricing data from early-game encounters and existing vendors to establish scrap baselines.
  - [ ] Update `scripts/core/trader.js` with a pricing curve that references item tiers, scarcity, and the trader's current grudge meter.
  - [ ] Expand balance tests to assert the 60–90 scrap window for first-wave upgrades and validate discount stacking rules.
- [ ] Reserve premium gear for end-of-week refreshes but keep sticker prices within twice the best wasteland drops so progression rewards skill instead of grind.
  - [ ] Tag premium inventory entries in module data with refresh cadence and rarity tiers.
  - [ ] Adjust the refresh scheduler so weekly rotations pull from the premium pool only after day seven while preserving daily partial refreshes.
  - [ ] Surface upcoming premium stock in the trade UI and write tooltips that explain scarcity-driven pricing caps.

## Risks
- Long refresh timers may stall players lacking supplies.
- Grudge mechanics could confuse without explicit UI.

## Prototype
`node scripts/trader-refresh-prototype.js` simulates daily stock rotations and grudge accumulation.
