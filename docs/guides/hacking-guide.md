# Hacking Dustland CRT

Dustland CRT uses plain JavaScript with globals and no build step. This guide lists useful entry points for exploring or extending the game.

## Architecture
- `dustland.html` bootstraps the game.
- Game state and module loading live in `scripts/dustland-core.js`.
- Rendering and input are handled by `scripts/dustland-engine.js`.
- Individual systems are in `scripts/core/`.

## World and content
- `genWorld(seed, opts)` – generate the overworld grid.
- `seedWorldContent()` – populate default NPCs and items for a module.

## NPCs and quests
- `makeNPC(...)` – helper to build an NPC.
- `NPCS` – array of active NPCs.
- `quests` – quest registry managed by the quest log.
- `itemDrops` – ground items awaiting pickup.

## UI helpers
 - `refreshUI()` – refresh side panels.

## Interactions and movement
- `takeNearestItem()` – pick up adjacent items.
- `interact()` / `interactAt(x, y)` – trigger NPC dialog or tile actions.
- `move(dx, dy)` – move the party leader.

## Modules and ACK
- `applyModule(data)` – load module data into the game.
- `openCreator()` – open the Adventure Construction Kit editor.

## Inventory utilities
- `uncurseItem(id)` – remove a curse from the given item.

## Development tips
- Run `npm test` to execute the test suite.
- Run `node scripts/presubmit.js` to check HTML files for unsupported patterns.

