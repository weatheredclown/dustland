# Puzzle Relay Arcade Module Design

*By Riley "Clown" Morgan*
*Date: 2025-03-21*
*Status: Draft*

> **Clown:** If we wire retro brain-benders into Dustland's neon grid, players will think they're cracking live circuitry.

## Overview
The **Puzzle Relay Arcade** is a compact, self-contained module that strings together four room-scale challenges inspired by classic tabletop logic games. Each puzzle reframes Dustland's existing interactables—switches, terminals, dialogue prompts, and traversal hazards—so players feel like they're solving Mastermind, Tic-Tac-Toe, Battleship, and Towers of Hanoi inside the wasteland. The module slots beside our office block and carnival districts, giving scavengers a brainy side-quest without breaking the main loop.

The arcade lives in a retrofitted subway platform. Each puzzle bay unlocks the next via our standard event-bus triggers, culminating in a prize locker that dispenses cosmetics or story hooks. Because every puzzle relies on current mechanics, builders can remix the blueprint for seasonal events or faction hideouts.

## Goals
- Deliver four replayable puzzles using only existing Dustland systems (menus, switches, NPCs, timed events, and inventory flags).
- Keep the footprint under ten rooms so it fits the "compact module" label and loads quickly in adventure seeds.
- Provide at least one cooperative beat for multiplayer parties leveraging synced switches.
- Support accessibility by exposing puzzle states through text prompts and HUD cues.
- Document reusable patterns so other modules can reskin the puzzles without reauthoring logic.

## Non-Goals
- Introducing bespoke mini-game UIs or mouse-driven input.
- Adding new engine-level puzzle scripting. All interactions use the current event bus and module schema.
- Simulating the full rulesets simultaneously; each room focuses on a distilled experience.
- Delivering combat or loot-heavy encounters—the focus is cerebral.

## Module Footprint
| Room ID | Name | Puzzle Reference | Key Mechanics |
| --- | --- | --- | --- |
| lobby | Neon Lobby | Entry, hint kiosks | Greeter NPC, dialog tree, hub routing |
| mastermind_bay | Fiber Optic Vault | Mastermind | Four-color light pillars, switch combinations |
| tictactoe_ring | Chalk Grid Arena | Tic-Tac-Toe | Pressure plates, shared board state, rival NPC |
| battleship_hall | Sonar Gallery | Battleship | Hidden floor sensors, dynamic room descriptions |
| hanoi_chamber | Servo Tower Vault | Towers of Hanoi | Crane console, inventory tokens |
| prize_locker | Prize Conduit | Reward | Loot chest, exit portal |

## Puzzle Breakdowns
### Mastermind – Fiber Optic Vault
- **Setup:** Four vertical light pylons line the room. Each accepts a color cartridge item inserted via our existing "use item on tile" interaction.
- **Mechanics Reused:**
  - Switch arrays that broadcast `eventBus.emit('switchUpdated', {...})` when toggled.
  - Color cartridges modeled as quest items stashed in the lobby vending machine.
  - Diagnostic NPC drone that reports feedback through dialogue (`correct position`, `correct color wrong slot`).
- **Flow:** Players insert cartridges, then ping the drone using the "Check Status" menu option. The drone compares the array against a seeded solution stored in module state (randomized daily via existing seeded RNG). Feedback updates pylon indicator lights (correct = solid, mispositioned = pulsing). After six failed attempts, the room vents fog and shuffles cartridge locations using our teleport hooks, keeping tension high.
- **Outcome:** Solving emits `puzzle:mastermind:complete`, unlocking the Tic-Tac-Toe bay door.

### Tic-Tac-Toe – Chalk Grid Arena
- **Setup:** Floor tiles form a 3×3 grid rendered with our existing `chalk` decal. Players stand on plates to mark `X`, while a rival NPC (controlled by simple state machine) marks `O` using timed events.
- **Mechanics Reused:**
  - Multiplayer-friendly pressure plates (`zone.effects.pressurePlate`).
  - NPC dialog prompts to explain stakes and offer difficulty toggles (easy = random moves, hard = optimal strategy).
  - HUD quest tracker to show board state for visually impaired players.
- **Flow:** Standing on an unclaimed tile consumes an "Arena Token" (dispensed after Mastermind). The rival moves after a one-second delay via existing turn scheduler. We use the event bus to check win conditions after each mark. A stalemate triggers a rematch without extra tokens.
- **Outcome:** Players must win twice consecutively (encouraging mastery). Completion raises the north gate and spawns a sonar scanner item required for the Battleship hall.

### Battleship – Sonar Gallery
- **Setup:** A dark hall segmented into a 5×5 coordinate grid. Players use the sonar scanner in the action menu to ping coordinates. Hidden pressure tiles simulate ship locations.
- **Mechanics Reused:**
  - Fog-of-war lighting already used in stealth encounters.
  - Environmental narration updates from `zone.descriptionVariants` reacting to hit/miss events.
  - Audio cues triggered through existing sound hooks.
- **Flow:** The scanner interface prompts for row/column via menu selections (A–E, 1–5). The module script checks the grid stored in room state (seeded per session). Hits temporarily reveal ship outlines on the floor; misses spawn harmless sparks. Players must sink three ships before the room flood timer (120 seconds real-time) expires—implemented with the current countdown utility. Cooperative parties can split tasks by scanning while another player runs to mark confirmed hits with glowsticks (inventory item placing a light decal).
- **Outcome:** Success drains the hall and unlocks the servo lift to the Hanoi chamber. Failure resets the room after a short cooldown.

### Towers of Hanoi – Servo Tower Vault
- **Setup:** Three elevator columns each hold stacked energy cores represented by crate props. A central crane console lets players move the top crate from one column to another.
- **Mechanics Reused:**
  - Existing elevator logic from the office module repurposed to raise/lower crate stacks.
  - Console interaction tree with menu options (`Move from Column A to Column B`).
  - Physics-lite animation cues by reusing the conveyor belt scripts.
- **Flow:** The console enforces the classic rule (no larger core atop a smaller one) via simple size metadata. Move counts display on the HUD. Optional accessibility toggle allows extended move limit. Solving with the minimum number of moves (15 for four cores) awards a bonus cosmetic ticket.
- **Outcome:** Completion powers the prize locker and posts a broadcast message to the lobby NPC announcing victory.

## Narrative Framing
- The lobby greeter, **Operator Quen**, invites players to "rewire the city" by restoring signals to the metro. Each puzzle is a broken circuit representing a different network subsystem (color mux, routing grid, sonar relay, load balancer).
- Ambient audio layers escalate with each cleared bay, reinforcing progress without adding UI complexity.
- Failure states tie into Dustland lore—e.g., the sonar gallery flooding hints at the nearby harbor module.

## Reuse Hooks for Builders
- **State Templates:** Provide JSON snippets for puzzle states in `docs/examples/puzzle-relay-states.json` so designers can copy seeded arrays.
- **Dialog Packs:** Ship Operator Quen's dialogue as a modular block that other NPCs can inherit via the existing `dialog-utils.js` tool.
- **Props & Tiles:** Tag new art as palette swaps of existing assets to avoid fresh pipelines.
- **Event Naming:** Prefix all puzzle events with `puzzle.arcade.*` for clarity when debugging across modules.

## Accessibility & UX Notes
- All puzzle feedback surfaces in text plus color/audio to support multiple modalities.
- Timers include audible ticks and on-screen countdowns, respecting current UI placement guidelines.
- Provide a skip lever in each room that lets players exit after three failed attempts, trading potential rewards for progress (uses current fail-safe mechanic).

## Integration Checklist
1. Sketch room layouts with `scripts/module-tools` (`append-room`, `add-portal`) to keep placement valid.
2. Populate items and NPCs via the same tools; avoid manual JSON edits.
3. Wire event-bus listeners in `modules/puzzle-relay.module.js` using existing helper patterns from `modules/office.module.js` and `modules/training-grounds.module.js`.
4. Add seeds and loot tables to the balance spreadsheet once rewards finalize.
5. Run `node scripts/supporting/placement-check.js modules/puzzle-relay.module.js` before committing.

## Open Questions
- Should we rotate daily puzzle seeds globally or per-instance to encourage repeat visits?
- Do we let parties split across multiple puzzle rooms simultaneously, or gate entry to maintain narrative flow?
- What long-term rewards justify repeat clears without overshadowing combat modules?

