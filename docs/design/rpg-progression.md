# RPG Progression
*By Mateo "Wing" Alvarez*
*Comments from Alex "Echo" Johnson, Priya "Gizmo" Sharma, and Riley "Clown" Morgan appear in blockquotes.*

Level ups need to hit like split-second boosts. Every time a character gains enough XP, they ding, snag +10 max HP automatically, grab a skill point, and reset the clock. Points funnel into stats or moves, no passive fluff.

> **Echo:** Could an early mentor narrate these boosts? A pinch of story makes each ding ring louder.
> **Wing:** Keep it tight—mentor barks a one-liner, then we move.

An optional mentor can shout a quick line at each ding, but play snaps right back to action.

Spend those points at a trainer NPC. Walk up, pick the **Upgrade Skills** dialog, and a lean menu pops: speed, power, endurance, or new tricks. Keep it snappy so players return to the fray fast.

> **Echo:** Love the tempo, but maybe each trainer has a shtick—wasteland hermit for endurance, arena champ for power?
> **Wing:** Works if shticks stay snappy—hermit for endurance, champ for power, etc.

> **Gizmo:** Let's preview stat shifts in that menu—clear numbers keep the upgrade flow accessible.
> **Wing:** Agreed. We'll show stat delta before locking in.

Enemies run the same playbook. Each foe carries a level, gains the same +10 max HP per level automatically, and spends its own points on presets, so their damage and defense climb in pace with the party. Zones set enemy level ranges to keep fights fair—outplays win, not inflated numbers.

> **Echo:** Can bosses bend the rules for drama or do they march in lockstep?
> **Wing:** Bosses can script a spike or phase shift, but we telegraph it.

Behind the curtain, an XP curve doubles every five levels, and every level grants one point. No rubber-banding: you earn it, they mirror it, and the stopwatch stays honest.

> **Gizmo:** If the curve lives in a JSON config, we can tweak pacing without digging through code.
> **Wing:** To dodge file-loading issues, embed `xpCurve` in code and expose it globally for quick tuning.

> **Echo:** If players mis-spend a point, do trainers offer respecs?
>
> **Wing:** Maybe through pricey tokens. Keeps choices sticky but not permanent.

**Player Experience**

From a fresh spawn, the XP bar ticks up as players mow through on-level foes.
About five even-match wins trigger the ding: +10 max HP flashes, a skill point
slots into their pool, and a mentor quips if one tags along. Between fights,
players trek back to a nearby specialist trainer, open **Upgrade Skills**, and
see exact stat deltas before committing. Zones advertise enemy level ranges so
wandering into tougher turf feels like a choice, not a trap.

**HUD & UX**

The party panel along the bottom left gains a tiny XP bar and a skill point badge for each character. The bar shows `currentXP/nextXP` when hovered and stays a thin progress strip otherwise so the HUD stays clean. Unspent points raise a small glowing badge with the point count over the portrait until the player spends them at a trainer. This keeps level progress visible without cluttering the action.


**Numbers**

*XP Curve (levels 1–20)*

| Level | Total XP | XP to Next |
| --- | --- | --- |
| 1 | 0 | 100 |
| 2 | 100 | 100 |
| 3 | 200 | 100 |
| 4 | 300 | 100 |
| 5 | 400 | 100 |
| 6 | 500 | 200 |
| 7 | 700 | 200 |
| 8 | 900 | 200 |
| 9 | 1100 | 200 |
| 10 | 1300 | 200 |
| 11 | 1500 | 400 |
| 12 | 1900 | 400 |
| 13 | 2300 | 400 |
| 14 | 2700 | 400 |
| 15 | 3100 | 400 |
| 16 | 3500 | 800 |
| 17 | 4300 | 800 |
| 18 | 5100 | 800 |
| 19 | 5900 | 800 |
| 20 | 6700 | 800 |

Default `xpCurve` array:

```js
[0,100,200,300,400,500,700,900,1100,1300,1500,1900,2300,2700,3100,3500,4300,5100,5900,6700]
```

*Auto Gains*

- +10 max HP automatically per level; no points needed.

*Skill Points*

- 1 point per level; unspent points carry over.
- Stat bump: +5 to chosen stat for 1 point.
- New ability: costs 2 points and shows prerequisites.
- Respec: costs 1 token; vendors sell tokens for 500 scrap and bosses drop 1.

*Enemy Presets*

| Zone | Enemy Levels | Example Allocation |
| --- | --- | --- |
| Scrap Wastes | 1–5 | 3 speed / 2 power |
| Gear Alley | 6–10 | 5 power / 3 endurance |
| Steel Summit | 11–15 | 4 speed / 6 power |
| Final Gauntlet | 16–20 | Custom boss scripts |

*Enemy XP & Availability*

> **Gizmo:** How much juice does each foe spill? Designers need counts so players
aren't stuck grinding.
> **Wing:** Same-level grunts drop 20 XP × their level—roughly five takedowns per
ding. Elites pay 30 × level so zones don't stall.

- Common enemies: 20 XP × level.
- Elite enemies: 30 XP × level.
- Zones should seed 5–7 on-level foes near each trainer so players can level
without backtracking.
- Sprinkle higher-level threats off the main path as opt-in challenges.
- Route loops should funnel back toward trainers so the upgrade trip feels
natural.

**Systems**
- XP thresholds double every five levels; curve stored in the `xpCurve` array.
- Each level auto grants +10 max HP, yields one skill point, and can trigger a mentor one-liner.
- Trainer NPCs specialize and open the Upgrade Skills menu with previewed stat shifts.
- Skill points fuel stat bumps or new abilities; respec via costly tokens.
- Enemies spend equal points on predefined builds; bosses get telegraphed boosts.

> **Clown:** Let's carve a roadmap so each slice ships mod-ready and testable.

**Task List**
- [x] Embed `xpCurve` with sane defaults and expose it for mods.
- [x] Track XP and level-ups, auto-apply +10 max HP and grant skill points.
- [ ] Show each character's current and next level XP on the party HUD.
- [ ] Badge portraits when unspent skill points are available.
- [ ] Trigger optional mentor one-liners on level-up.
- [ ] Build trainer NPCs with specialized **Upgrade Skills** dialogs that preview stat deltas and costs.
- [ ] Enforce trainer specialties through UI and stat preview hooks.
- [ ] Define enemy level ranges and point presets in external JSON files.
- [ ] Seed zones with 5–7 on-level foes and optional higher-level challenges near trainers.
- [ ] Script boss spike telegraphs and implement a token-based respec vendor.
- [ ] Write tests for XP progression, mentor hooks, trainer menus, enemy scaling, boss spikes, and respec flows.

> **Wing:** Task granularity looks good—core loop first, content second, tests last.
> **Gizmo:** Each bullet maps to one system; capture JSON schemas and UI mocks while we implement.
> **Echo:** Narrative beats land through mentor barks and boss telegraphs—keep the flair.
> **Clown:** We'll spin each bullet into a ticket and split trainer UI versus specialties if scope balloons.
