# Changelog

## 2025-09-16
- Pulled upstream PR #1414 to align TypeScript and runtime modules, including
  the rebuilt office module wiring and synced JavaScript artifacts.
- Extended Dustland global type declarations so effects, movement metadata, and
  `PartyItem.use` signatures match the runtime, easing downstream TypeScript
  integrations.
- Added Firebase client override helpers and refreshed module picker tests so
  the new globals and ACK hooks remain covered under Node's test runner.

## 2025-09-15
- Camp interface now appears even when no masks are available.

## 2025-09-14
- Bunker door now opens fast-travel map with fuel cost confirmation.

## 2025-09-13
- Added button to clear saved game data.

## 2025-09-12
- Reduced random encounter enemy loot drops in Dustland by 25%.

## 2025-09-11
- Equipment now toasts stat changes when equipped.

## 2025-09-09
- Added overlay UI for equipping personas at camp.

## 2025-09-08
- Added bunker flag for buildings, enabling fast travel via world map.

## 2025-09-06
- Removed hub city module.
- Replaced unequip text button with 🚫 emoji.

## 2025-09-05
- Added configurable procedural map generation with regeneration support.
- Introduced camp persona menu for equipping masks at rest stops.
- Built initial hub city module for resupply and quest staging.
