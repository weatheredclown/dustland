# Oasis Trader: Barter and Trust

*By Priya "Gizmo" Sharma*
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
3. **Scrap Barter:** Prices list scrap values and show stat deltas in a compare panel.
4. **UI:** Timer tooltip shows next refresh; grudge state tints the trader portrait.

## Implementation Sketch
1. Extend `scripts/core/trader.js` with `inventory` arrays and `grudge` fields.
2. Store refresh schedules in `data/traders/<id>.json`.
3. Update `scripts/ui/trade.js` to display timers and grudge indicators.
4. Emit `trader:refresh` events for mods to hook into.

> **Clown:** Keep the JSON flat so mods can drop in new traders without rewriting logic.

## Risks
- Long refresh timers may stall players lacking supplies.
- Grudge mechanics could confuse without explicit UI.

## Prototype
`node scripts/trader-refresh-prototype.js` simulates daily stock rotations and grudge accumulation.
