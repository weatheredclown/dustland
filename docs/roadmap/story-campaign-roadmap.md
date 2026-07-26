# Dustland Story Campaign Roadmap

**Goal:** turn the main Dustland campaign into a complete game story — one with heart, real
challenge, puzzles, a difficulty ramp that pulls the player outward into the world, and a
finish that pays off everything the opening promises.

**Status:** In progress. Grounded in a code-level audit of `ts-src/modules/dustland.module.ts`
(the module `module-picker.ts` pre-selects), the core engine (`ts-src/scripts/core/`), and
the existing design docs. Per project convention, completion claims in older docs were
verified against code; several turned out to be stubs and are called out below.

**Progress (verified in code, 2026-07-25):**

- Phase 0 landed earlier (`6ec97688`), except the `applyModule: "GRAFFITI_PUZZLE"` link on
  the cave Hermit's turn-in, which survived that commit and has now been removed — the
  Hermit instead sets `observatory_route`, opening the finale.
- Phase 2 core is now in: `combat.deathEffects` (effects applied when an enemy falls,
  `combat.ts`), conditional `endSequence` slides (`{text, if}` entries filtered by
  `checkFlagCondition`, `actions.ts`) with a post-credits "Return to Title" button, and a
  `:: if flagName` line syntax in the ACK end-sequence editor. Content: the sealed
  Observatory on the southeast salt flats (`obs_door` → `observatory` interior with the
  Listener Array reveal, the amplify/rest choice, and the Long Stair point-of-no-return
  down to the Hollow), a convergence-aware Sovereign intro, and a Sovereign
  `deathEffects` ending — "Dawn Over the Relay" — with nine flag-reactive epilogue slides
  (`signal_heard`/`signal_amplified`/`signal_rested`, `broadcast_restored`,
  `pump_restored`, `scout_bren_recovered`, `duke_pact`, `bunker_waystation_online`,
  `cave_puzzle_complete`) plus credits. Covered by `test/end-sequence-finale.test.js`.
- Not yet started: Phase 1 (difficulty/stakes), Phases 3–6.

---

## Part 1 — Where the story stands today (audit summary)

### What's already good

- **The setting and tone are coherent and distinctive.** The pocket-dimension premise
  (relics slide in from Earth's timeline; the further-future the object, the more shattered
  it arrives), the "witnesses, not heroes" framing, and the "soulful, never cynical" tone
  directive (`docs/design/foundations/game-story.md`) are consistent across every doc.
- **The voice is better than the structure.** The Archivist ("Every scrap of sound is a
  life. What do you bring?"), the Scrap Duchess ("Road tax or road rash."), and the Lysa/Bren
  antidote rescue are genuinely warm, characterful writing.
- **The main module is bigger than it looks:** 1 overworld + 14 interiors, ~20 named story
  NPCs, 21 quests, ~70 items, a real final boss (Sovereign of Dust, gated behind forging the
  Epic Blade), and three interwoven quest arcs.
- **The engine's content backbone is solid:** the effects/flag system can mutate the world
  (reveal NPCs, rewrite dialog, teleport, board doors), dialog skill checks with
  success/fail branches work, encounter zones with spawn tables and road-distance danger
  scaling work, fast travel with fuel costs works, and the Arena system supports data-driven
  wave fights with item-gated vulnerabilities.

### The five structural problems

1. **No declared canon.** Three campaign narratives coexist in the docs with different casts
   and villains: the *Plot Bible* ("Dawn Over the Relay" — Nora/Tess/Grin, Sovereign of
   Dust, `docs/world/dustland-expedition-plot-bible.md`), the *Broadcast Story / Ghost
   Signal* (Mara/Jax/Nyx vs. the Silencers, `docs/design/narrative-world/plot-draft.md`),
   and *True Dust* (Rygar/Stonegate, `docs/design/narrative-world/true-dust.md`). The main
   module blends the first two without resolving them.
2. **A main arc dead-ends into a missing module.** The Ghost Signal thread (Sparks → Echo →
   Hermit, the best-written arc) ends with the Hermit sending you to "the Salt Flats. The
   Observatory." — which chains through `graffiti-puzzle.module.ts` (a one-room stub) into
   `applyModule: "MARA_PUZZLE"`, **a module that does not exist anywhere in the repo**.
3. **There is no ending.** Killing the Sovereign yields loot and a "Victory!" combat log
   line. No epilogue, no credits, no world reaction, no ending state anywhere in the engine
   (grep confirms). The story just stops.
4. **There is no difficulty ramp and no stakes.** Enemy stats are static; XP *decreases* as
   the party levels (`dustland-core.ts` ~line 289); `state.difficulty` is a dead knob no
   system reads; a full party wipe teleports you to the entrance with a **free full heal**.
   Combat cannot threaten, so exploration is never brave.
5. **Choices don't matter.** No moral choice has a consequence; companions (Grin, Bren) have
   no personal arcs; the toll, the Duke alliance, and every fetch quest resolve identically
   for every player.

### Smaller coherence defects (fix-in-an-afternoon list)

- Three near-identically named collectible systems: `signal_fragment_a/b/c`,
  `signal_fragment_1/2/3`, and generic `signal_fragment` (×3 for `q_signal`).
- Orphaned quests `task_grudge_sour_routes` / `task_grudge_patch_wagon` — no giver, and
  Cass's dialog tree has only Buy/Sell.
- Nila's opening line is a malformed two-in-one string (`"…breathe again.,Pump's choking…"`)
  — the comma displays to the player.
- The hall's training ghoul is still titled **"Test Monster"**; the hall itself is "Test Hall".
- The Sovereign's blade-gating (`resists` → ×0.1 damage without both blades) is expressed
  only as a combat rule; the boss door itself gives no in-fiction warning.
- No protagonist framing: the game opens with "You smell rot." and a locked door, with no
  motive or goal.

---

## Part 2 — The canon decision (Phase 0 prerequisite)

**Recommendation: declare the Plot Bible arc the canon spine of the main module, and make
the Ghost Signal arc its second act rather than a competing story.**

Rationale: the main module already *is* a Plot Bible implementation — the Hall, the
Archivist, Grin, Ivo/Nila/Cass road quests, Spark/Cog keys, the Gear Ghoul, the Sun Charm,
and the Sovereign of Dust are all Plot Bible beats, and the Plot Bible is the only narrative
in the repo with a written ending. The Ghost Signal arc (Sparks/Echo/Hermit) is already in
the module and is its emotional high point; instead of dead-ending into a missing puzzle
module, it should *converge* on the finale: the Observatory reveals what the Signal is and
why the Sovereign silences the wastes, making the two arcs one story.

Consequences of this decision:

- **True Dust** stays what it is: a standalone, selectable second campaign (and the
  persona/mask showcase). No merge.
- **The Silencers and Mara/Jax/Nyx** are not deleted — they become the post-1.0 "broadcast
  fragment" expansion content they were designed as, once cross-module state exists
  (`docs/design/foundations/todo-roadmap.md` Milestone 1). The roadmap below does not
  depend on that engine work.
- The `two-worlds`/`world-one`/`world-two` and `edge` modules are formally demos, excluded
  from campaign coherence work.

---

## Part 3 — The phases

Each phase is tagged **[content]** (authorable today via module JSON / `scripts/module-tools/`
CLI / ACK) or **[engine+ACK]** (needs engine code plus a data-driven schema + editor surface,
per the project rule that new functionality must be configurable via the Adventure Kit).
Phases 1–2 are sequenced first because every later phase's content wants to be authored
against real stakes and a real ending; 3–5 can overlap once 1–2 land.

---

### Phase 0 — Repair coherence (the afternoon of fixes) **[content]**

*Make the existing campaign internally consistent before adding anything.*

- Fix Nila's malformed dialog string (make it a proper two-element array).
- Rename "Test Monster"/"Test Hall" in-fiction (e.g. "Rotwalker" chained as the Hall's grim
  training relic; the hall becomes "Founders' Hall").
- Rename the three fragment systems so each arc's collectibles are distinct in name and
  icon-glyph (e.g. *beacon shards* for Arc A, *echo reels* for the Ghost Signal, drop or
  fold the generic `q_signal` trio into one of the others).
- Either wire Cass's grudge tasks into her dialog (givers + turn-in nodes; the `shopGrudge`
  mechanic already exists) or delete both quests.
- Put an in-fiction warning on the Sovereign's door (a corpse clutching a shattered common
  blade + one line: "Steel that isn't tempered twice just… stops.").
- Remove the `GRAFFITI_PUZZLE → MARA_PUZZLE` chain until Phase 4 rebuilds it — a broken
  door is worse than a locked one. The Hermit's turn-in line changes to point at the sealed
  Observatory ("Not yet. The way opens when the wastes go quiet." — flag-gated for Phase 2).
- Run `node scripts/supporting/placement-check.js` on the module after edits.

**Exit criteria:** no quest without a giver, no reachable reference to missing content, no
placeholder names player-visible, module passes placement check.

---

### Phase 1 — Stakes and the difficulty ramp **[engine+ACK]**

*Combat that cannot threaten cannot pace a story. This is the engine phase everything else
leans on.*

1. **Wire the dead difficulty knob.** `state.difficulty` (`game-state.ts`) becomes real:
   easy/normal/hard multipliers on enemy HP/ATK and wipe penalties, read in `combat.ts` and
   exposed in module JSON + ACK module properties.
2. **Zone challenge tiers.** Extend zone JSON with a `challenge` band (the schema already
   has a per-module 1–10 `challenge`; push it down to zones/encounter banks). The world gets
   authored as concentric danger: Hall ring (1–2) → roads (3–4) → deep wastes (5–7) →
   Echo Relay / Observatory region (8–10). Encounter spawns, loot-cache tiers
   (`spoils-cache.ts` already keys tiers off challenge), and scrap rewards all read the band.
3. **Fix the XP curve.** Replace the `xp += count * ceil(str / avgLvl)` de-scaling with
   challenge-based XP so harder zones are worth visiting — this single change makes the
   danger gradient *pull* the player outward instead of punishing leveling.
4. **Real failure stakes.** Replace free-heal wipe respawn with a difficulty-scaled penalty:
   respawn at last bunker (not dungeon door), scrap loss, and a lingering "battered" debuff
   until rest. Hydration 0 gets a consequence (collapse → same respawn path). Keep easy mode
   close to today's behavior — the ramp should have a floor, not just a ceiling.
5. **Boss depth.** Extend the enemy `special` schema from one telegraphed attack to a small
   phase list (`phases: [{hpBelow, special, cue}]`), data-driven and editable in ACK's
   template editor. The Arena wave system is the model — reuse its vocabulary.
6. **Broaden status/ability vocabulary modestly:** add burn (DoT) and weaken (ATK down) to
   the existing poison/stun/guard set so bosses and specials have texture. No elemental
   matrix — keep the Wasteland feel.
7. **Balance validation.** Extend `scripts/supporting/balance-tester-agent.js` to sweep the
   zone bands and enforce the design docs' 90-second-fight rule per tier.

**Exit criteria:** a level-3 party that walks into a band-7 zone runs or dies; a wipe costs
something on normal; the balance tester passes per-band time/lethality budgets; every new
knob is a module-JSON field visible in ACK.

---

### Phase 2 — A real finish **[engine+ACK], then [content]**

*The single highest-impact story change: the game must end.*

**Engine (small, generic):**
1. **Ending-sequence system.** A data-driven `endings` block in module JSON: an ordered list
   of slides (text + optional portrait/glyph + flag conditions per slide), triggered by an
   `effects` entry (`showEnding: <id>`). Renders CRT-style full-screen text slides →
   credits → back to module picker. Conditional slides give reactive epilogues for free
   (Nila's pump running, Bren on patrol, the Duke's pledge — each keyed to quest flags the
   module already sets).
2. **Point-of-no-return gate.** A confirm-prompt effect (`confirmGate`) usable on any portal
   or dialog choice, plus the existing per-bunker save slots as the "last camp" affordance.
3. ACK surface: an Endings editor (slide list + condition picker) and `showEnding` in the
   effects dropdown. This also gives every future ACK author a finale tool — honoring the
   "configurable via Adventure Kit" law.

**Content (the rewritten finale):**
4. **Unify the two arcs at the Observatory.** Author the Salt Flats / Observatory region
   (band 8–10, the Phase 1 outer ring): the three echo reels the Ghost Signal arc already
   awards unlock the Observatory; inside, the player learns the Signal is the wastes'
   surviving voice — and that the Sovereign of Dust is what's been silencing it. Arc A
   (the blades) is the *means*; Arc B (the Signal) is the *reason*. One story.
5. **Restage the Sovereign** with Phase 1 boss phases (razorsand AoE → summon ambush pack →
   desperate enrage), behind the point-of-no-return gate, with the blade warning from
   Phase 0 escalated here in dialog.
6. **Author the epilogue slides** from the Plot Bible's written ending (broadcast restored,
   water and courier routes reopening) + conditional beats for every major side quest and
   companion. First playthrough should end with the Archivist's reels finally answering back.

**Exit criteria:** a player can start the campaign, finish it, and see credits; at least six
epilogue slides vary by play; the Observatory replaces the dead `MARA_PUZZLE` chain.

---

### Phase 3 — Heart: characters and choices that carry weight **[content, mostly]**

*The audit's verdict: "the voice is better than the arc." This phase gives the voice
somewhere to go.*

1. **Protagonist framing at minute zero.** Rewrite the Hall opening: Kesh gives you a reason
   to leave (the Hall's water is failing — which retroactively makes Nila's pump quest feel
   like *the stakes*, not a chore) and the Archivist gives you the mystery (a tape that
   plays a voice no one alive remembers). Two beats, both with existing NPCs.
2. **Companion arcs for Grin and Bren.** One personal questline each, using existing
   primitives (flag-gated dialog + `dialogNodes` quest progress): Grin's crowbar has a
   history he lies about three times before telling the truth; Bren wants to go back for
   the patrol that didn't make it. Each arc ends with a small mechanical thank-you (quirk
   or special) and an epilogue slide.
3. **Three structural choices with visible consequences**, built on the existing
   effects/flag system (no new engine work):
   - *The Duchess:* pay tolls forever, fight her, or broker her into the Duke's road pact —
     changes road encounter tables and her epilogue.
   - *The Duke's favor:* won by charm, bribe, or blackmail (PER check reveals his ledger) —
     each path colors Mahra's and the Hall's dialog after.
   - *The Signal:* at the Observatory, amplify it or let it rest — two different final
     Archivist scenes and ending-slide sets. Same boss, different meaning.
4. **Archivist as emotional spine.** A five-tape collectible thread scattered across zones
   (exploration hook), each tape one minute of the world-before; turning in all five earns
   the campaign's quietest scene and one line in the credits. The Memory Keeper is already
   the best character in the module — make him the reason players finish it.
5. **Dialog polish pass** with the existing skill-check system so INT/PER/CHA builds get
   regular unique lines — half the stat sheet currently only matters in rare checks.

**Exit criteria:** every companion has an arc with an epilogue payoff; three choices produce
observably different world states; the opening states a want and a mystery inside two
minutes.

---

### Phase 4 — Puzzles worth the name **[engine+ACK], then [content]**

*Today's "puzzles" are locks, keys, and one stub. Build the small reusable kit the design
docs already specify (`plot-draft.md` "Riddles of the Road"), then author with it.*

1. **Sequence-lock primitive [engine+ACK].** One generic, data-driven mechanism: N
   interactables, a required activation order, per-step feedback cues, wrong-order
   consequence (reset + optional ambush/flag), success effects. This single primitive
   expresses combination locks, the resonant cave's crystal order, terminals, and the
   graffiti solvent-layers puzzle. ACK editor: a wizard step listing interactables + order.
2. **Dial-alignment widget [engine+ACK].** Verify/finish `scripts/ui/dial.js` (claimed
   built; verify in code) as a reusable overlay (pitch/gain/phase → target values, static
   feedback), fired by a dialog effect. Powers the radio-tower alignment and any future
   tuning puzzle. Include text-cue accessibility fallback for audio feedback.
3. **Author the real graffiti puzzle** with the sequence-lock kit (spray order reveals a
   safe route; wrong order = ambush) and retire the stub.
4. **Puzzle placement pass:** one puzzle per major interior tier — pump repair (tutorial
   dial), radio tower (dial under pressure), resonant cave (upgrade existing crystals to the
   sequence primitive with better feedback), graffiti wall (route cipher), Observatory
   (finale: align the array while waves spawn — sequence-lock + Arena together).
5. **Respect the tempo rule** from the combat docs: every puzzle resets fast ("failure needs
   teeth, but not fangs") and skill checks (INT/PER) offer hint shortcuts, making smart
   builds feel smart.

**Exit criteria:** two reusable puzzle primitives fully authorable in ACK with zero custom
JS; five placed puzzles across the campaign; each has a fast reset and a skill-check assist.

---

### Phase 5 — Exploration and a world that answers back **[content + small engine]**

1. **Make the danger gradient legible:** road-sign NPCs, scorched-earth tile dressing at
   band boundaries, and NPC rumor lines that name far places *with rewards attached*
   ("They say the Echo Relay still sings. Nobody who walks that far stays sane — or poor.").
2. **Secrets with a ledger [small engine].** A lightweight discovery counter (`secrets found
   X/Y` on the world map screen) over the existing hidden-NPC/stepUnlock reveals, so hidden
   passages feel like a collection, not accidents. ACK: a "counts as secret" checkbox.
3. **Hazard texture [small engine]:** trap/damage tiles as a zone effect (the zone schema
   already does per-step effects — extend to authored tile patches), negated by the right
   gear — making loot answer exploration problems, not just stat sticks.
4. **Weather that matters:** wire the existing weather system's encounter bias into the
   band system (glass-storms in the deep wastes gate a shortcut; goggles open it).
5. **Tape/lore placement** (Phase 3's collectibles) biased toward off-road corners of each
   band so the emotional thread and the exploration reward are the same thread.
6. **Fast-travel as pacing, not skip:** bunkers stay fuel-gated; the Observatory region gets
   no bunker until the campaign is finished (post-credits unlock for cleanup play).

**Exit criteria:** a player can articulate where's-dangerous/where's-rich from in-game cues
alone; secrets are counted and rewarded; at least one gear-gated shortcut per band.

---

### Phase 6 — Full-campaign QA and tuning **[process]**

1. **Two full playtest sweeps** (fresh player + completionist) against a written beat sheet:
   time-to-first-choice, time-per-act, fight lengths per band (90-second rule), death count
   on normal.
2. **Automated regression:** extend the balance tester to walk the golden path
   (hall → roads → Echoes → Observatory → Sovereign → credits) asserting every quest in the
   chain is completable and every gate opens; run in CI alongside `check:prod`.
3. **Difficulty mode calibration** using the Phase 1 knobs (easy ≈ today's forgiveness,
   hard = wipe penalties + tighter fragment economy).
4. **Doc reconciliation:** update the Plot Bible and `plot-draft.md` with the declared canon
   (Part 2), mark the Broadcast Story as post-1.0 expansion, and — per this repo's history —
   check boxes only for what's verified in code.

**Exit criteria:** golden-path automation green in CI; both playtests finish without a
walkthrough; docs match the shipped campaign.

---

## Sequencing at a glance

| Phase | Focus | Type | Depends on |
|-------|-------|------|-----------|
| 0 | Coherence repair | content | — |
| 1 | Stakes + difficulty ramp | engine+ACK | — |
| 2 | Ending system + unified finale | engine+ACK → content | 0, 1 |
| 3 | Heart: framing, companions, choices | content | 2 (epilogue slides) |
| 4 | Puzzle kit + placed puzzles | engine+ACK → content | 1 (band placement) |
| 5 | Exploration + reactive world | content + small engine | 1, 3 (tapes) |
| 6 | QA, tuning, doc canon | process | all |

Phases 0 and 1 can start immediately and in parallel (different files). Phase 2's engine
half is small and can begin alongside Phase 1. Phases 3–5 are content-heavy and
parallelizable across authors once 1–2 land.

## What this roadmap deliberately does not do

- **No cross-module campaign state, no event scheduler.** The Broadcast Story's fragment
  architecture (`todo-roadmap.md` Milestone 1) stays parked; this roadmap finishes the game
  that exists inside one module.
- **No new cast.** Every emotional beat lands on NPCs already in the module — the fix is
  structure and payoff, not more content surface.
- **No combat rework.** Adrenaline, specials, guard, and gear-gating stay; Phase 1 tunes
  numbers and adds two status effects and boss phases, nothing more.
- **No multiplayer implications.** Per the prioritized backlog, multiplayer stays on ice.
