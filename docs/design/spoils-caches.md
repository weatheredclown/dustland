# Spoils Caches, v1

*By Riley "Clown" Morgan*

> **Clown:** Loot that drops like confetti is fun, but a mystery box with a buzzsaw edge? That's a party. After combat, let's give players Spoils Caches—clanking gifts from the wasteland that spill out whatever the war gods feel like today.

### What Are Spoils Caches?
Spoils Caches are post-fight loot boxes that materialize when the final enemy faceplants. They're battered metal cubes stamped with derelict corporate logos, humming with leftover shield tech. Click one and it cracks open, showering the party with gear.

> **Echo:** Give me a quick line of text when a cache hits the dirt. Something like "The ground coughs up a Sealed Cache." It keeps the vibe and anchors the drop in the fiction.

### Ranks
Each cache carries a physical vibe that hints at its contents:
- **Rusted Cache:** Hinges squeal; expect scraps and makeshift tools.
- **Sealed Cache:** Intact plating and corporate wax. Solid baseline loot.
- **Armored Cache:** Reinforced with ex-military alloy. High-grade hardware.
- **Vaulted Cache:** Quantum locks and glowing seams. Legendary rarities.

> **Wing:** Keep the opening animation snappy—two seconds max. Players should be back in the flow before their tea cools.

### Drop Mechanics
- Enemies flaunt a `challenge` rating from 1–10.
- After combat, roll `dropChance = baseRate * challenge`.
- If the roll hits, spawn a Spoils Cache. Tier is weighted by challenge; bosses practically guarantee Armored or better.

> **Gizmo:** We'll expose `baseRate` and tier weights in a global object so mods can reskin the math without touching core files.

### Item Assembly
Opening a cache triggers a generator that stitches gear on the fly:
1. Pick a type: weapon, armor, gadget, or oddity.
2. Mash a name from adjectives and nouns ("Grit-Stitched Repeater").
3. Roll stats and scrap value based on cache rank. Vaulted caches can sprout weird affixes or mini-quests.

> **Echo:** Oddities should come with tiny lore hooks. Even a busted compass can whisper about a lost caravan.

### UI/UX
- Cache icons show their rank at a glance—rust flakes, sealed seams, armored ribs, or quantum glow.
- Clicking a cache plays a crunchy pop and dumps the loot into inventory with a quick card-flip reveal.
- A small "Open All" button appears when multiple caches stack.

> **Clown:** The "Open All" button should jitter like it's daring you to press it. Punk energy, not casino vibes.

### Balance & Economy
- Common fights (challenge 1–3) mostly drop Rusted Caches with a 10–20% chance.
- Mid-tier clashes (challenge 4–6) lean toward Sealed, with occasional Armored surprises.
- High-stakes battles (challenge 7+) shower Armored caches and dangle the rare Vaulted one (1–3% chance unless it's a boss).
- Scrap value from cache items feeds directly into the shop economy; no overflow inflation.

### Expanded Task List

#### Phase 1: Core Systems
- [x] Define `SpoilsCache` item type and rank data structure.
- [x] Implement drop roll tied to enemy `challenge` rating.
- [x] Create modular item generator for type, name, and stats.

#### Phase 2: UI/UX
- [x] Add cache icons and quick-open animations.
- [x] Implement inventory UI for cache stacking and "Open All".

#### Phase 3: Content & Balancing
- [x] Populate adjective/noun pools for item names and tier stat tables.
- [ ] Tune `baseRate` and tier weights for different enemy challenges.
- [ ] Author lore snippets for oddity items.

#### Phase 4: Testing
- [ ] Write tests to verify drop odds and tier distribution across challenge levels.
- [ ] Simulate 1,000 cache openings per tier to ensure stat ranges stay sane.
- [ ] Run `node presubmit.js` to confirm no async snafus in cache UI.

> **Clown:** When players crack open a Vaulted Cache and a "Quantum Harmonica" drops, I want them to laugh, equip it, and blow something up with a punchline.
