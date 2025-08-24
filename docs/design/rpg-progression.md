# RPG Progression, v2

*By Mateo "Wing" Alvarez*

> **Clown:** The first pass was a good sketch. This revision is where we ink the details and bake the chaos right into the core loop. Let's make a system that feels good to master and even better to break.

### Core Loop: The Ninety-Second Ding

Level ups need to hit like a perfectly timed parry—instant, satisfying, and immediately useful. Every time a character banks enough XP, they ding. No fanfare, no menu interruptions. Just a flash, a sound spike, and the goods: **+10 max HP, automatically applied**. One skill point lands in their pocket. Then it's right back to the action. The stopwatch is king; if the flow from combat to upgrade and back to combat takes longer than a minute and a half, we've failed.

> **Echo:** I still think a mentor's voice can add texture here. Not a lecture, just a ghostly whisper on the wind when you level up—"Another scar, another lesson learned." It makes the ding feel less like a system and more like a story beat.
>
> **Wing:** Fine, as long as it's a bark, not a monologue. A single sound file, maybe 1.5 seconds max. We can even tie it to a "mentor" item or a quest flag. Keeps it lean.

### Spending a Point: The Trainer's Booth

Skill points are spent at trainer NPCs. This isn't a spreadsheet screen. It's a quick, sharp dialogue exchange. The player walks up, picks the **Upgrade Skills** option, and gets a stripped-down menu: power, endurance, or a new trick. They see the delta, confirm, and they're out. The goal is a pit stop, not a garage rebuild.

> **Echo:** Giving each trainer a personality sells the world. The endurance trainer could be a grizzled old scavenger who smells of rust and wisdom, found hunkered over a campfire. The power trainer? A former arena champion with scars that tell stories. It turns a mechanical stop into a character moment.
>
> **Wing:** As long as their shtick is punchy. I don't want players wading through five text boxes to get a +5 stat bump. One line of flavor text, then the menu. Quick in, quick out.
>
> **Gizmo:** The UI for this needs to be crystal clear. When a player highlights an upgrade, we should show the exact numerical change: `STR: 25 -> 30`. No ambiguity. This also makes it easier for modders to add their own skills later; the UI just needs to read the delta from the data object. Let's make sure the cost is displayed just as clearly, whether it's skill points or a rare token.

### The Mirror Match: Enemy Progression

Enemies play by the same rules. They level up, get the same +10 max HP boost, and spend points on pre-defined builds. This isn't about letting the player out-grind the challenge; it's about making every fight a test of skill. The player gets smarter and stronger, and so do their opponents. Zones will have clear enemy level ranges, so walking into a high-level area is a conscious choice—a challenge, not a punishment.

> **Echo:** Do bosses get to break the rules? A climactic fight should feel like the world itself is breaking, not just a tougher stat check.
>
> **Wing:** Bosses get one or two scripted "cheats," but they have to be telegraphed. A boss might overload its core for a massive damage spike, but the player will see it coming—glowing cracks, a high-pitched whine. It's a skill check, not a cheap shot.
>
> **Clown:** This is a perfect spot for some visual mayhem. When a boss telegraphs a big move, let's mess with the CRT filter. A little screen shake, a touch of color bleed. It makes the threat feel real and gives modders a hook to create their own custom boss effects.

### The Numbers Game

The XP curve doubles every five levels—a simple, predictable ramp. It's stored in a global `xpCurve` array, so we can tune it without a full recompile. One skill point per level. No funny business.

> **Gizmo:** I still lean toward a JSON file for the curve. It's cleaner and separates data from logic. But embedding it as a global array is fine for now, as long as we document clearly where it is and how to modify it. We can always refactor it into a config file later if we need to.
>
> **Wing:** Code is faster. No file I/O, no async headaches. We stick with the embedded array for now. Speed is everything.
>
> **Echo:** What about mistakes? If a player sinks a point into a stat they regret, is there a way back?
>
> **Wing:** Respecs should be costly. Make them find or buy a "Memory Worm" token. It keeps their choices meaningful but offers an out for those who want to experiment. Make the tokens rare drops from bosses or expensive items at a special vendor.

---
### **Expanded Task List**

Here’s the roadmap. We’ll build the core systems first, get the player-facing UX in place, and then layer in the content and balancing. Each of these is a ticket waiting to happen.

#### **Phase 1: Core Progression Mechanics (The Engine)**
- [x] Embed `xpCurve` array in `core/party.js` with sane defaults and expose it globally for mods.
- [x] Implement XP tracking and level-up logic in the `Character` class. Automatically apply +10 max HP and grant one skill point upon level-up.
- [x] **Data Structure:** Define the data structure for active and passive abilities. This should include cost, prerequisites (level, other abilities), and the actual effect (e.g., `damage_boost`, `aoe_attack`).
- [x] **Enemy Scaling:** Create a function in `core/npc.js` that applies level-up logic to enemy NPCs based on their level. This should include the standard +10 max HP and a method for allocating points into predefined stat builds.
- [x] **Respec Logic:** Implement the "Memory Worm" token item. Create a function in `core/party.js` that consumes a token to reset a character's spent skill points.

#### **Phase 2: HUD and UX (The Dashboard)**
- [x] **Party Panel UI:** Add a compact XP bar below each character's health in the party panel. On hover, it should expand to show `currentXP / nextXP` values.
- [ ] **Skill Point Badge:** Create a small, glowing badge that appears over a character's portrait when they have unspent skill points. The badge should display the number of available points.
- [ ] **Mentor System:** Implement a simple event hook in the level-up function that can trigger a sound file and a brief on-screen text notification (a "bark"). This should be tied to a quest flag or a specific item to remain optional.
- [ ] **Trainer UI Mockup:** Design the "Upgrade Skills" dialog. It needs a list of available upgrades (stats and abilities), their costs, and a clear "before and after" preview for any selected stat change.
    > **Gizmo:** Let's make this UI data-driven. It should just read a list of available upgrades from the trainer NPC's data. That way, modders can add new trainers with unique skill trees just by editing a JSON file.

#### **Phase 3: Content Implementation (The World)**
- [ ] **Trainer NPCs:** Create at least three specialized trainer NPCs (e.g., Power, Endurance, Tricks) and place them in the world. Each trainer's `tree` object should include the **Upgrade Skills** dialog option and their unique list of available upgrades.
- [ ] **Enemy Presets:** Create a `presets.json` file to define enemy stat allocations per level. For example, a "Scrapper" preset might allocate points into `STR` and `AGI`, while a "Bulwark" preset focuses on `DEF`.
- [ ] **Zone Population:** Populate the "Scrap Wastes" (Levels 1-5) with 5-7 on-level enemies and one or two higher-level "challenge" enemies off the main path. Ensure the zone layout naturally funnels players back toward a trainer NPC.
- [ ] **Boss Mechanics:** Implement the first boss with a telegraphed special move. This involves creating a visual cue (e.g., a "charging up" animation or effect) and a corresponding high-damage attack that triggers after a short delay.
- [ ] **Respec Vendor:** Create a special vendor NPC who sells "Memory Worm" tokens for a high price (e.g., 500 scrap). This vendor should be placed in a mid-to-late game area.

#### **Phase 4: Testing and Balancing (The Stopwatch)**
- [ ] **Progression Test Suite:** Write automated tests to verify:
    - XP is awarded correctly.
    - Level-ups trigger at the right thresholds according to `xpCurve`.
    - HP and skill points are granted correctly.
    - Enemy stats scale as expected with their level.
- [ ] **Playtest: The First Ding:** Run internal playtests focusing on the time it takes a new player to reach their first level-up. Target: under 10 minutes of active play.
- [ ] **Playtest: Trainer Flow:** Test the trainer UI for clarity and speed. A player should be able to spend a skill point and exit the dialog in under 15 seconds.
- [ ] **Playtest: Zone Difficulty:** Evaluate the "Scrap Wastes" zone to ensure the difficulty curve feels fair but engaging. Check if players feel encouraged to tackle the optional high-level enemies.

> **Clown:** This roadmap feels solid. It's a ladder of features we can build and test one rung at a time. And every rung is something a modder can hook into and twist. Let's get to it.
