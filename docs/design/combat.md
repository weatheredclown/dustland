# Combat Design: The Razor's Edge

*By Mateo "Wing" Alvarez*

> **Wing:** The current system is a placeholder. It's a knife fight in a phone booth—claustrophobic and without nuance. We need to blow the doors off this thing. Combat should be a dance, not a stat check. Every choice needs to have weight, every second needs to count. We're building a system that rewards aggression, timing, and tactical thinking. It should feel dangerous, stylish, and above all, fun.

### Core Philosophy: Push Forward or Die

The core of this new system is **Adrenaline**. This isn't your typical mana bar. You don't start with it; you earn it. Every hit you land, every perfectly timed dodge, it builds your Adrenaline meter. It's a resource that fuels your most powerful abilities, your "Specials."

This creates a simple, aggressive loop:
1.  **Engage:** Basic attacks build Adrenaline.
2.  **Escalate:** Spend Adrenaline on powerful Specials.
3.  **Dominate:** Use Specials to control the battlefield and end fights decisively.

Sitting back and playing defensively is a losing strategy. The player who isn't actively generating Adrenaline is a player who isn't using their best tools.

Adrenaline persists between encounters, gently cooling when a character is at full health. A full rest that restores the whole party immediately clears any stored Adrenaline.

The more Adrenaline you have, the harder you hit. Damage scales with the current meter, reaching +100% at a full bar. Items that carry an `adrenaline_dmg_mod` can amplify this boost beyond 200%.

> **Clown:** I'm into the forward momentum, but we should confirm the Adrenaline bar doesn't crowd the HUD. Let's prototype it with placeholder art before committing. When it's full, it could arc with energy. When you use a Special, it slams down, then starts building again. The UI itself should feel energetic.

### Specials: High Risk, High Reward

Specials are the heart of tactical combat. They're how the player turns the tide of a difficult fight. But they can't be spammed.

**Why not use Specials all the time?**
*   **Cost:** They consume significant chunks of the Adrenaline bar. A player might have to choose between one big, fight-ending move or several smaller, tactical ones.
*   **Cooldown:** Some specials might have a short cooldown period after use, preventing rapid-fire repetition.
*   **Risk:** More powerful specials might have a "wind-up" period, leaving the player vulnerable. If they get hit, the Special is interrupted, and the Adrenaline is lost.

**What enemies can they affect?**
*   Most specials will affect their target directly. However, some enemies might have resistances or counters.
*   **Armored Foes:** A "Shield Breaker" special might be required to soften them up first.
*   **Agile Foes:** Might dodge area-of-effect (AoE) specials if the player's timing is off.
*   **Bosses:** Might have phases where they are immune to certain types of specials, requiring the player to adapt their strategy.

> **Echo:** Plenty of room for interesting enemy design, but we need to avoid overbuilding puzzles that kill the tempo. We can create "puzzle" encounters where the player needs to figure out the right combination of specials to use. A heavily shielded enemy guarding a group of snipers? Use a "Stun Grenade" special to disable the shield, then a multi-hit AoE to clear the snipers. It makes combat a conversation, not just a damage race.

### Equipment: The Tools of the Trade

Equipment isn't just about bigger numbers. It's about changing *how* you fight.

*   **Weapons:** Determine your basic attack speed, damage, and Adrenaline generation rate. A heavy hammer might generate more Adrenaline per hit, but a quick knife lets you build it faster with rapid strikes. Some rare weapons might even come with a unique Special move. Melee attacks add your STR to the hit, while rifles and other ranged weapons lean on AGI.
*   **Armor:** Provides damage resistance, but can also have passive combat effects. A "Scavenger's Rig" might grant a small amount of Adrenaline at the start of combat. A "Juggernaut Plate" could make you immune to being interrupted while using a Special. Its DEF subtracts from incoming damage before luck can save you.
*   **Gadgets (Accessories):** This is where things get wild. A "Stim-Pack" gadget could allow you to convert HP into Adrenaline in an emergency. A "Targeting Visor" could increase the critical hit chance of your specials. An "Adrenaline Charm" might double the rate at which Adrenaline builds.

Some wasteland horrors shrug off ordinary steel. Enemies like the Sand Colossus won't take damage unless the party carries an artifact-grade weapon, making gear progression essential, while others such as the Dune Reaper simply hit harder the deeper you wander. Rare artifact blades lie buried in the wastes for those bold enough to seek them.

> **Gizmo:** The data structures for this need to be clean. An item should just have a `modifiers` object. For example: `{"adrenaline_gen_mod": 1.2, "granted_special": "CLEAVE"}`. The combat system just iterates through the equipped items and applies the modifiers at the start of a fight. This makes it incredibly easy for us, and for modders, to add new gear, but we'll need profiling to ensure modifier checks stay cheap.

### UI/UX: Clarity in Chaos

The player needs to understand what's happening at a glance. The chaos should be on the screen, not in the player's head.

1.  **Health & Adrenaline Bars:** Player health and Adrenaline should be clearly displayed on the right side of the screen, as part of the party panel. When a character takes damage, their health bar should flash red and visibly decrease. A "ghost" bar can show the amount of health lost before fading. When they are about to pass out, the screen could desaturate and the edges vignette.
2.  **Damage Numbers:** All damage, incoming and outgoing, should appear as floating numbers over the character's head. Critical hits should be larger and colored differently (yellow/orange).
3.  **Status Effects:** Icons for buffs (e.g., "Damage Up") and debuffs (e.g., "Poisoned") should appear under the character's health bar.
4.  **Telegraphing:** Enemy special attacks must be clearly telegraphed with visual cues (glowing, charging animations) and UI warnings (a subtle screen border flash).

> **Clown:** For the "passing out" effect, we can tie it to the CRT filter. As health gets critical, the filter can get more distorted, with scan lines and color bleed. It's a diegetic way of showing the player they're in trouble. When they finally go down, a sharp "static" effect and a sound cutout for a split second would be incredibly impactful.

### Difficulty Curve: From Brawls to Ballets

The challenge should grow as the player masters the system.

*   **Early Game:** Enemies are straightforward, allowing the player to learn the core loop of building and spending Adrenaline.
*   **Mid Game:** Enemies start appearing in mixed groups that require tactical use of specials (e.g., shielded enemies, healers, snipers).
*   **Late Game:** Enemies will have their own "specials," resistances, and coordinated AI. Fights become deadly puzzles that test the player's full arsenal of abilities and equipment.

### Feasibility & Risks

* **Pacing Balance:** Overly generous Adrenaline may trivialize fights, while stingy gains could frustrate. We'll run simulated bouts to dial in the numbers before content work.
* **HUD Noise:** Extra meters and icons risk clutter. Prototype the HUD in a mock fight and solicit playtester feedback.
* **Implementation Scope:** Specials, enemy AI, and equipment modifiers touch many systems. Plan for iterative rollout so the core loop ships early and we layer complexity in subsequent updates.

> **Gizmo:** Let's build a small vertical slice first. If the slice runs smoothly on low-end hardware and the flow feels right, we commit. Otherwise we adjust the design instead of patching later.

### Adrenaline Prototype: Arena Script

Run the Node-driven `scripts/adrenaline-prototype.js` to spot-check Adrenaline flow before UI work.

```
node scripts/adrenaline-prototype.js
```

The script pits a lone hero against a dummy and logs `Adrenaline: <value>` whenever the meter changes.

**Evaluate**

- **Fill rate:** Without gear bonuses the bar should reach 100 in roughly sixteen to twenty-four basic attacks. Items like an Adrenaline Charm can speed this up. If it spikes or crawls, tweak `hero.equip.weapon.mods.ADR` or the dummy's `hp` in the script.
- **Stability:** Watch for unexpected jumps or stalls in the numbers.
- **Log clarity:** Ensure the output is readable enough to guide tuning.

The prototype doesn't spend Adrenaline yet; it's a pacing probe. Once the gain curve feels right, move on to HUD and specials.

### Expanded Task List

#### Phase 1: Core Systems
- [x] **Adrenaline Resource:** Implement the Adrenaline bar (`adr`) for all combatants in `scripts/core/party.js` and `scripts/core/combat.js`.
- [x] **Adrenaline Generation:** Basic attacks now generate Adrenaline. This value is determined by weapon stats via the `ADR` modifier.
- [x] **Special Move Framework:** In `scripts/core/abilities.js`, create a data structure for Specials that includes `adrenaline_cost`, `target_type` (single, aoe), `effect` (damage, stun, etc.), and `wind_up_time`.
- [x] **Equipment Modifiers:** Update the inventory system to apply combat modifiers from equipped items at the start of each battle.
- [x] **Adrenaline Prototype:** Script a small arena fight to validate Adrenaline gain pacing and HUD readability.

#### Phase 2: Content & UI
- [x] **New HUD:** Redesign the combat UI to include the Adrenaline bar, status effect icons, and improved health bar feedback.
- [x] **Player Health Panel:** Update the right-side player health panel to show damage being taken in real-time, with visual effects for critical health and passing out.
- [x] **Implement 5-10 Specials:** Added starter moves Power Strike, Stun Grenade, First Aid, Adrenal Surge, and Guard.
 - [x] **Implement Equipment:** Create a set of weapons and armor with varied combat modifiers.
- [x] **Enemy Design:** Added four enemy types that require tactical use of specials (e.g., Shield Drone resists basic attacks, Reflective Slime counters them).
- [x] **HUD Playtest:** Ran quick usability tests with two players and tightened bar spacing and icon contrast based on feedback.

#### Phase 3: Polish & Balancing
- [x] **Visual Effects:** Add VFX for Adrenaline gain, special move activations, and status effects.
- [x] **Sound Design:** Add SFX for specials, UI feedback, and enemy telegraphing.
- [x] **Playtesting:** Conduct extensive playtests to balance Adrenaline generation rates, special costs, and overall combat difficulty. Ensure the difficulty curve is challenging but fair.
- [x] **AI Improvements:** Enhance enemy AI to use their own specials and coordinate attacks.
- [x] **Telemetry:** Log combat stats during playtests to surface pacing issues and balance swings early.
