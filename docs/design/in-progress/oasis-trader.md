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
3. **Scrap Barter:** Prices list scrap values and show stat deltas in a compare panel.
4. **UI:** Timer tooltip shows next refresh; grudge state tints the trader portrait.

## Implementation Sketch
- [x] Extend `scripts/core/trader.js` with `inventory` arrays and `grudge` fields.
- [x] Store refresh schedules in the module json and make editable by ACK.
 - [x] Update `scripts/ui/trade.js` to display timers and grudge indicators.
- [x] Emit `trader:refresh` events for mods to hook into.

> **Clown:** Keep the JSON flat so mods can drop in new traders without rewriting logic.

## Dustland Integration
- [ ] Replace static shop NPC in `dustland.module.js` with a traveling trader.
- [ ] Give the trader an east-west patrol loop across the world map.
- [ ] Stock begins with scavenged gear and upgrades across three refresh waves.
- [ ] Raise prices roughly 300 scrap per stat point above crowbar and flak jacket drops.
- [ ] Final wave sells top-tier gear well above 500 scrap.

## Risks
- Long refresh timers may stall players lacking supplies.
- Grudge mechanics could confuse without explicit UI.

## Prototype
`node scripts/trader-refresh-prototype.js` simulates daily stock rotations and grudge accumulation.
