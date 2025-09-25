# Dustland Combat Tuning: Closing the Gap

*By Mateo "Wing" Alvarez*
> **Wing:** Ranged builds are lapping melee like it's sprint day while our bruisers are stuck in ankle weights. Time to tighten the screws with hard numbers, not vibes. This pass keeps the forward momentum—just trims the runaway rifles and gives melee the teeth it deserves without turning late-game bosses into brick walls.

## Goals
- Narrow the weapon-stat delta so melee and ranged parties hit comparable damage benchmarks at levels 1, 4, and 7.
- Smooth the mid-game difficulty slope by keeping roadblocks intact while raising baseline enemy durability and encounter pressure.
- Replace all-or-nothing gear gates with heavy resistances so mismatched loadouts hurt, but still let players grind through if they're stubborn or under-geared.

## Task Breakdown

### Weapon Stat Tuning
- [ ] **Boost melee damage curve.** Update `data/modules/dustland.json` (and regenerate `modules/dustland.module.js`) so the following weapons use the exact `mods` payloads below. Re-run `node scripts/supporting/balance-tester-agent.js` afterward.
  | Weapon ID | New `ATK` | New `ADR` |
  | --- | --- | --- |
  | `crowbar` | 2 | 12 |
  | `rebar_club` | 3 | 14 |
  | `raider_knife` | 4 | 16 |
  | `thornlash_whip` | 4 | 20 |
  | `corroded_hatchet` | 5 | 18 |
  | `artifact_blade` | 7 | 24 |
  | `epic_blade` | 8 | 28 |
- [ ] **Trim ranged adrenaline spikes.** In the same files, overwrite the listed ranged `mods` values to the table below, preserving other fields.
  | Weapon ID | New `ATK` | New `ADR` |
  | --- | --- | --- |
  | `pipe_rifle` | 3 | 16 |
  | `dawnforge_six_shooter` | 4 | 16 |
  | `scrapstorm_repeater` | 5 | 22 |
  | `sunset_mirage` | 6 | 22 |
  | `sunflare_bazooka` | 5 | 28 |
  | `minigun` | 9 | 32 |

### Encounter Curve Adjustments
- [ ] **Pad mid-game enemy HP/DEF.** Edit each NPC entry inside `data/modules/dustland.json` (and sync the generated module file) so their `combat` blocks use the following precise numbers:
  | Enemy ID | `HP` | `DEF` |
  | --- | --- | --- |
  | `iron_brute` | 24 | 3 |
  | `grit_stalker` | 11 | 2 |
  | `scrap_behemoth` | 36 | 3 |
  | `gear_ghoul` | 12 | 3 |
- [ ] **Introduce multi-target pressure.** For the NPCs below, add or update `combat.count` with the listed values (leaving other fields intact):
  | Enemy ID | `combat.count` |
  | --- | --- |
  | `feral_nomad` | 3 |
  | `waste_ghoul` | 2 |
  | `dust_rat` | 3 |

### Gear-Gate Resistance System
- [ ] **Implement resist penalties.** In `scripts/core/combat.js`, extract the existing weapon requirement check into a helper and add support for a new optional `resists` array on enemies. Each entry must support the object shape:
  ```js
  {
    requiresAll: [/* requirement tokens using existing string format, e.g. 'artifact_blade' or 'tag:ranged' */],
    multiplier: 0.1, // 0.0–1.0 damage multiplier when requirements are NOT all met
    message: "Custom combat log string when penalty applies"
  }
  ```
  During `doAttack`, after handling hard `requires`, multiply `tDmg` by `multiplier` (rounded down) for every `resists` entry whose `requiresAll` test fails, logging `message` once per entry that fires.
- [ ] **Convert late-game gear checks to resistances.** Replace the existing `combat.requires` fields in `data/modules/dustland.json` (and synced module output) for these enemies with the listed `resists` payloads, keeping other combat stats unchanged:
  | Enemy ID | `resists` payload |
  | --- | --- |
  | `oc3abv_siltpack` | `[ { "requiresAll": ["tag:ranged"], "multiplier": 0.2, "message": "The Ravener's carapace disperses the blow." } ]` |
  | `oc3abv_grinders` | `[ { "requiresAll": ["artifact_blade"], "multiplier": 0.15, "message": "Sawblades deflect the strike without artifact steel." } ]` |
  | `oc3abv_glasspride` | `[ { "requiresAll": ["wand"], "multiplier": 0.2, "message": "Glasswing hides behind mirrored wards, cutting the damage." } ]` |
  | `sovereign_of_dust` | `[ { "requiresAll": ["artifact_blade", "epic_blade"], "multiplier": 0.1, "message": "The Sovereign diffuses attacks lacking tempered blades." } ]` |
- [ ] **Re-run balance reporting.** After applying the data and combat-engine changes, execute `node scripts/supporting/balance-tester-agent.js` and `npm test`. Then regenerate `docs/balance/dustland-balance-report.md` using `node scripts/supporting/balance-tester-agent.js --write-report docs/balance/dustland-balance-report.md` so the published numbers match the new tuning.

## Expected Outcomes
- Level 4 melee parties move from 8.32 → ~11 average damage while ranged drop from 11.85 → ~10.5, landing within 10% of each other.
- Iron Brute now survives two special rotations (24 HP, 3 DEF) against the buffed melee party, preventing one-turn deletes.
- Gear-gated bosses still demand the right toolkit—the 0.1–0.2 multipliers make off-type runs grindy but viable, while the log messaging telegraphs the solution.
