# Dustland Combat Balance Report: dustland-module
_Generated 2025-09-20T00:19:18.552Z_

This report estimates how Dustland combatants perform using deterministic averages drawn from the current data files. It considers party builds at multiple levels and equipment tiers, then compares their expected output against enemies found in the module.

> Assumptions: Party members start with 10 HP and gain +10 HP per level. Each new level increases the primary combat stat (STR for melee, AGI for ranged) by 1. Damage values use the mean roll from in-game formulas and ignore luck, guard, and other transient effects.

## Weapon Tiers
### Melee Weapons
| Tier | Items | Avg ATK | Avg ADR | Avg ADR Gain | ADR Dmg Mod | Notable Tags |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | 2 | 1 | 12 | 3.3 | 1.1 | — |
| T2 | 2 | 2 | 12 | 3 | 1 | — |
| T3 | 2 | 3 | 16 | 4 | 1 | — |
| T4 | 1 | 4 | 16 | 4 | 1 | — |
| T5 | 1 | 5 | 22 | 5.5 | 1 | — |
| T6 | 1 | 6 | 25 | 6.25 | 1 | — |

### Ranged Weapons
| Tier | Items | Avg ATK | Avg ADR | Avg ADR Gain | ADR Dmg Mod | Notable Tags |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | 1 | 3 | 18 | 4.5 | 1 | ranged |
| T2 | 1 | 5 | 35 | 8.75 | 1 | heavy, ranged |

## Armor Tiers
| Tier | Items | Avg DEF | ADR Gen Mod | ADR Dmg Mod |
| --- | --- | --- | --- | --- |
| T1 | 2 | 1 | 1.05 | 1 |
| T2 | 1 | 2 | 1 | 1 |
| T3 | 2 | 3 | 0.95 | 1 |
| T4 | 1 | 4 | 1 | 1 |
| T5 | 1 | 5 | 1 | 1 |

## Party Damage Benchmarks
| Archetype | Level | Weapon Tier | Armor Tier | Primary Stat | ATK Bonus | DEF Bonus | ADR Gain/Attack | Attacks to Fill ADR | Avg Damage (0/50/100%) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | STR 4 | 1 | 1 | 3.47 | 29 | 0%: 1.5<br>50%: 2.33<br>100%: 3.15 |
| Ranged | 1 | T1 | T1 | AGI 4 | 3 | 1 | 4.73 | 22 | 0%: 2.5<br>50%: 3.75<br>100%: 5 |
| Melee | 4 | T3 | T3 | STR 7 | 3 | 3 | 3.8 | 27 | 0%: 5.5<br>50%: 8.25<br>100%: 11 |
| Ranged | 4 | T2 | T3 | AGI 7 | 5 | 3 | 8.31 | 13 | 0%: 7.5<br>50%: 11.25<br>100%: 15 |
| Melee | 7 | T6 | T5 | STR 10 | 6 | 5 | 6.25 | 16 | 0%: 11.5<br>50%: 17.25<br>100%: 23 |
| Ranged | 7 | T2 | T5 | AGI 10 | 5 | 5 | 8.75 | 12 | 0%: 10.5<br>50%: 15.75<br>100%: 21 |

## Enemy Overview
| Enemy | HP | ATK | DEF | Counter | Immune | Requires | Special |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Rotwalker | 6 | 1 | 0 | — | — | — | — |
| Mira | 8 | 3 | 1 | 2 | — | — | — |
| Nora | 8 | 2 | 1 | — | — | — | dmg 2 |
| Tess | 8 | 2 | 1 | — | — | — | dmg 2 |
| Road Raider | — | 4 | 5 | — | — | — | — |
| Scrap Mutt | 5 | 1 | 0 | — | — | — | — |
| Rust Bandit | 6 | 1 | 0 | — | — | — | — |
| Feral Nomad | 6 | 2 | 0 | — | — | — | — |
| Waste Ghoul | 7 | 2 | 0 | — | — | — | — |
| Iron Brute | 15 | 3 | 2 | — | — | — | — |
| Grit Stalker | 7 | 2 | 1 | — | — | — | — |
| Scrap Behemoth | 30 | 3 | 2 | — | — | — | dmg 5 |
| Dust Rat | 5 | 2 | 1 | — | — | — | — |
| Gear Ghoul | 8 | 3 | 2 | — | — | — | — |
| Siltpack Ravener | 14 | 4 | 1 | — | — | tag:ranged | dmg 3 |
| Grinder Matriarchs | 22 | 5 | 2 | — | — | artifact_blade | dmg 4 |
| Glasswing Pride | 28 | 6 | 3 | — | — | wand | dmg 5 |
| Sovereign of Dust | 160 | 12 | 6 | — | — | artifact_blade, epic_blade | dmg 12 |

### Enemy Templates
| Template | HP | Special Dmg | Immune |
| --- | --- | --- | --- |
| Arcane Wraith | 8 | 5 | basic |
| Overcharger | 14 | 6 | — |
| Reflective Slime | 10 | 3 | — |
| Shield Drone | 12 | 4 | basic |

## Matchup Details
### Rotwalker
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.33 | 3.15 | 2 | 0 | — | — |
| Ranged | 1 | T1 | T1 | 2.5 | 3.75 | 5 | 2 | 0 | — | — |
| Melee | 4 | T3 | T3 | 5.5 | 8.25 | 11 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 7.5 | 11.25 | 15 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Mira
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 4 | 1 | 10 | 2 |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 1 | 10 | 2 |
| Melee | 4 | T3 | T3 | 4.5 | 7.25 | 10 | 1 | 0 | — | 2 |
| Ranged | 4 | T2 | T3 | 6.5 | 10.25 | 14 | 1 | 0 | — | 2 |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | 2 |
| Ranged | 7 | T2 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | 2 |

Effective HP bar: █░░░░░░░░░░░

### Nora
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 4 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 4.5 | 7.25 | 10 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 6.5 | 10.25 | 14 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Tess
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 4 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 4.5 | 7.25 | 10 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 6.5 | 10.25 | 14 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Road Raider
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | — | 1.5 | 7 | — |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | — | 1.5 | 7 | — |
| Melee | 4 | T3 | T3 | 0.5 | 3.25 | 6 | — | 0 | — | — |
| Ranged | 4 | T2 | T3 | 2.5 | 6.25 | 10 | — | 0 | — | — |
| Melee | 7 | T6 | T5 | 6.5 | 12.25 | 18 | — | 0 | — | — |
| Ranged | 7 | T2 | T5 | 5.5 | 10.75 | 16 | — | 0 | — | — |

### Scrap Mutt
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.33 | 3.15 | 2 | 0 | — | — |
| Ranged | 1 | T1 | T1 | 2.5 | 3.75 | 5 | 1 | 0 | — | — |
| Melee | 4 | T3 | T3 | 5.5 | 8.25 | 11 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 7.5 | 11.25 | 15 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Rust Bandit
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.33 | 3.15 | 2 | 0 | — | — |
| Ranged | 1 | T1 | T1 | 2.5 | 3.75 | 5 | 2 | 0 | — | — |
| Melee | 4 | T3 | T3 | 5.5 | 8.25 | 11 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 7.5 | 11.25 | 15 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Feral Nomad
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.33 | 3.15 | 2 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 2.5 | 3.75 | 5 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 5.5 | 8.25 | 11 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 7.5 | 11.25 | 15 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Waste Ghoul
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.33 | 3.15 | 3 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 2.5 | 3.75 | 5 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 5.5 | 8.25 | 11 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 7.5 | 11.25 | 15 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Iron Brute
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.33 | 1.15 | 14 | 1 | 10 | — |
| Ranged | 1 | T1 | T1 | 0.5 | 1.75 | 3 | 5 | 1 | 10 | — |
| Melee | 4 | T3 | T3 | 3.5 | 6.25 | 9 | 2 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 5.5 | 9.25 | 13 | 2 | 0 | — | — |
| Melee | 7 | T6 | T5 | 9.5 | 15.25 | 21 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 8.5 | 13.75 | 19 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Grit Stalker
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 4 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 4.5 | 7.25 | 10 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 6.5 | 10.25 | 14 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Scrap Behemoth
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.33 | 1.15 | 27 | 1 | 10 | — |
| Ranged | 1 | T1 | T1 | 0.5 | 1.75 | 3 | 10 | 1 | 10 | — |
| Melee | 4 | T3 | T3 | 3.5 | 6.25 | 9 | 4 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 5.5 | 9.25 | 13 | 3 | 0 | — | — |
| Melee | 7 | T6 | T5 | 9.5 | 15.25 | 21 | 2 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 8.5 | 13.75 | 19 | 2 | 0 | — | — |

Effective HP bar: ██░░░░░░░░░░

### Dust Rat
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 3 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 4.5 | 7.25 | 10 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 6.5 | 10.25 | 14 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Gear Ghoul
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.33 | 1.15 | 7 | 1 | 10 | — |
| Ranged | 1 | T1 | T1 | 0.5 | 1.75 | 3 | 3 | 1 | 10 | — |
| Melee | 4 | T3 | T3 | 3.5 | 6.25 | 9 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 5.5 | 9.25 | 13 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 9.5 | 15.25 | 21 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 8.5 | 13.75 | 19 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Siltpack Ravener
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 1.5 | 7 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 4 | 1.5 | 7 | — |
| Melee | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 4 | T2 | T3 | 6.5 | 10.25 | 14 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 7 | T2 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Grinder Matriarchs
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 2.5 | 4 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 2.5 | 4 | Gear mismatch |
| Melee | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 0.5 | 80 | Gear mismatch |
| Ranged | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 0.5 | 80 | Gear mismatch |
| Melee | 7 | T6 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 7 | T2 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |

Effective HP bar: ██░░░░░░░░░░

### Glasswing Pride
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 3.5 | 3 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 3.5 | 3 | Gear mismatch |
| Melee | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 1.5 | 27 | Gear mismatch |
| Ranged | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 1.5 | 27 | Gear mismatch |
| Melee | 7 | T6 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 7 | T2 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |

Effective HP bar: ██░░░░░░░░░░

### Sovereign of Dust
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 9.5 | 2 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 9.5 | 2 | Gear mismatch |
| Melee | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 7.5 | 6 | Gear mismatch |
| Ranged | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 7.5 | 6 | Gear mismatch |
| Melee | 7 | T6 | T5 | 5.5 | 11.25 | 17 | 10 | 5.5 | 13 | — |
| Ranged | 7 | T2 | T5 | 0 | 0 | 0 | Immune | 5.5 | 13 | Gear mismatch |

Effective HP bar: ████████████

---
Regenerate this report after tuning stats by running `node scripts/supporting/balance-report.cjs`. Adjust `--levels` or `--adrenaline` to explore different breakpoints.