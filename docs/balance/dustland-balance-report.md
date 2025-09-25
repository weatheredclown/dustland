# Dustland Combat Balance Report: dustland-module
_Generated 2025-09-25T14:24:25.694Z_

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
| T2 | 1 | 4 | 20 | 5 | 1 | ranged |
| T3 | 2 | 5 | 31.5 | 8.66 | 1 | heavy, ranged |
| T4 | 1 | 6 | 26 | 7.15 | 1 | ranged |
| T5 | 1 | 10 | 45 | 11.25 | 1 | heavy, ranged, wand |

## Armor Tiers
| Tier | Items | Avg DEF | ADR Gen Mod | ADR Dmg Mod |
| --- | --- | --- | --- | --- |
| T1 | 2 | 1 | 1.05 | 1 |
| T2 | 1 | 2 | 1 | 1 |
| T3 | 6 | 3 | 1 | 1.03 |
| T4 | 1 | 4 | 1 | 1 |
| T5 | 2 | 5 | 1.07 | 1 |

## Party Damage Benchmarks
| Archetype | Level | Weapon Tier | Armor Tier | Primary Stat | ATK Bonus | DEF Bonus | ADR Gain/Attack | Attacks to Fill ADR | Avg Damage (0/50/100%) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | STR 4 | 1 | 1 | 3.47 | 29 | 0%: 1.5<br>50%: 2.33<br>100%: 3.15 |
| Ranged | 1 | T1 | T1 | AGI 4 | 3 | 1 | 4.73 | 22 | 0%: 2.5<br>50%: 3.75<br>100%: 5 |
| Melee | 4 | T3 | T3 | STR 7 | 3 | 3 | 4 | 25 | 0%: 5.5<br>50%: 8.32<br>100%: 11.14 |
| Ranged | 4 | T3 | T3 | AGI 7 | 5 | 3 | 8.66 | 12 | 0%: 7.83<br>50%: 11.85<br>100%: 15.86 |
| Melee | 7 | T6 | T5 | STR 10 | 6 | 5 | 6.72 | 15 | 0%: 11.5<br>50%: 17.25<br>100%: 23 |
| Ranged | 7 | T5 | T5 | AGI 10 | 10 | 5 | 12.09 | 9 | 0%: 15.5<br>50%: 23.25<br>100%: 31 |

## Enemy Overview
| Enemy | HP | ATK | DEF | Counter | Immune | Requires | Special |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Rotwalker | 6 | 1 | 0 | — | — | — | — |
| Mira | 8 | 3 | 1 | 2 | — | — | — |
| Nora | 8 | 2 | 1 | — | — | — | dmg 2 |
| Tess | 8 | 2 | 1 | — | — | — | dmg 2 |
| Road Raider | 16 | 4 | 5 | — | — | — | — |
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
| Ashen Howler Ambush | 28 | 5 | 2 | — | — | — | dmg 5 |
| Ashen Screamers | 32 | 6 | 3 | — | — | — | dmg 6 |
| Ashen Alpha | 48 | 8 | 4 | — | — | — | dmg 7 |

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
| Melee | 4 | T3 | T3 | 5.5 | 8.32 | 11.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 7.83 | 11.85 | 15.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 15.5 | 23.25 | 31 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Mira
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 4 | 1 | 10 | 2 |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 1 | 10 | 2 |
| Melee | 4 | T3 | T3 | 4.5 | 7.32 | 10.14 | 1 | 0 | — | 2 |
| Ranged | 4 | T3 | T3 | 6.83 | 10.85 | 14.86 | 1 | 0 | — | 2 |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | 2 |
| Ranged | 7 | T5 | T5 | 14.5 | 22.25 | 30 | 1 | 0 | — | 2 |

Effective HP bar: █░░░░░░░░░░░

### Nora
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 4 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 4.5 | 7.32 | 10.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 6.83 | 10.85 | 14.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 14.5 | 22.25 | 30 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Tess
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 4 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 4.5 | 7.32 | 10.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 6.83 | 10.85 | 14.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 14.5 | 22.25 | 30 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Road Raider
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | — | 1.5 | 7 | — |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | — | 1.5 | 7 | — |
| Melee | 4 | T3 | T3 | 0.5 | 3.32 | 6.14 | 3 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 2.83 | 6.85 | 10.86 | 2 | 0 | — | — |
| Melee | 7 | T6 | T5 | 6.5 | 12.25 | 18 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 10.5 | 18.25 | 26 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Scrap Mutt
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.33 | 3.15 | 2 | 0 | — | — |
| Ranged | 1 | T1 | T1 | 2.5 | 3.75 | 5 | 1 | 0 | — | — |
| Melee | 4 | T3 | T3 | 5.5 | 8.32 | 11.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 7.83 | 11.85 | 15.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 15.5 | 23.25 | 31 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Rust Bandit
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.33 | 3.15 | 2 | 0 | — | — |
| Ranged | 1 | T1 | T1 | 2.5 | 3.75 | 5 | 2 | 0 | — | — |
| Melee | 4 | T3 | T3 | 5.5 | 8.32 | 11.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 7.83 | 11.85 | 15.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 15.5 | 23.25 | 31 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Feral Nomad
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.33 | 3.15 | 2 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 2.5 | 3.75 | 5 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 5.5 | 8.32 | 11.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 7.83 | 11.85 | 15.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 15.5 | 23.25 | 31 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Waste Ghoul
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.33 | 3.15 | 3 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 2.5 | 3.75 | 5 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 5.5 | 8.32 | 11.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 7.83 | 11.85 | 15.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 11.5 | 17.25 | 23 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 15.5 | 23.25 | 31 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Iron Brute
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.33 | 1.15 | 14 | 1 | 10 | — |
| Ranged | 1 | T1 | T1 | 0.5 | 1.75 | 3 | 5 | 1 | 10 | — |
| Melee | 4 | T3 | T3 | 3.5 | 6.32 | 9.14 | 2 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 5.83 | 9.85 | 13.86 | 2 | 0 | — | — |
| Melee | 7 | T6 | T5 | 9.5 | 15.25 | 21 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 13.5 | 21.25 | 29 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Grit Stalker
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 4 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 4.5 | 7.32 | 10.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 6.83 | 10.85 | 14.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 14.5 | 22.25 | 30 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Scrap Behemoth
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.33 | 1.15 | 27 | 1 | 10 | — |
| Ranged | 1 | T1 | T1 | 0.5 | 1.75 | 3 | 10 | 1 | 10 | — |
| Melee | 4 | T3 | T3 | 3.5 | 6.32 | 9.14 | 4 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 5.83 | 9.85 | 13.86 | 3 | 0 | — | — |
| Melee | 7 | T6 | T5 | 9.5 | 15.25 | 21 | 2 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 13.5 | 21.25 | 29 | 2 | 0 | — | — |

Effective HP bar: ██░░░░░░░░░░

### Dust Rat
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.33 | 2.15 | 3 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T3 | T3 | 4.5 | 7.32 | 10.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 6.83 | 10.85 | 14.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 10.5 | 16.25 | 22 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 14.5 | 22.25 | 30 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Gear Ghoul
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.33 | 1.15 | 7 | 1 | 10 | — |
| Ranged | 1 | T1 | T1 | 0.5 | 1.75 | 3 | 3 | 1 | 10 | — |
| Melee | 4 | T3 | T3 | 3.5 | 6.32 | 9.14 | 1 | 0 | — | — |
| Ranged | 4 | T3 | T3 | 5.83 | 9.85 | 13.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 9.5 | 15.25 | 21 | 1 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 13.5 | 21.25 | 29 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Siltpack Ravener
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 1.5 | 7 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 1.5 | 2.75 | 4 | 4 | 1.5 | 7 | — |
| Melee | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 4 | T3 | T3 | 6.83 | 10.85 | 14.86 | 1 | 0 | — | — |
| Melee | 7 | T6 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 7 | T5 | T5 | 14.5 | 22.25 | 30 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Grinder Matriarchs
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 2.5 | 4 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 2.5 | 4 | Gear mismatch |
| Melee | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 0.5 | 80 | Gear mismatch |
| Ranged | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 0.5 | 80 | Gear mismatch |
| Melee | 7 | T6 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 7 | T5 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |

Effective HP bar: ██░░░░░░░░░░

### Glasswing Pride
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 3.5 | 3 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 3.5 | 3 | Gear mismatch |
| Melee | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 1.5 | 27 | Gear mismatch |
| Ranged | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 1.5 | 27 | Gear mismatch |
| Melee | 7 | T6 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 7 | T5 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |

Effective HP bar: ██░░░░░░░░░░

### Sovereign of Dust
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 9.5 | 2 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 9.5 | 2 | Gear mismatch |
| Melee | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 7.5 | 6 | Gear mismatch |
| Ranged | 4 | T3 | T3 | 0 | 0 | 0 | Immune | 7.5 | 6 | Gear mismatch |
| Melee | 7 | T6 | T5 | 5.5 | 11.25 | 17 | 10 | 5.5 | 13 | — |
| Ranged | 7 | T5 | T5 | 0 | 0 | 0 | Immune | 5.5 | 13 | Gear mismatch |

Effective HP bar: ████████████

### Ashen Howler Ambush
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.33 | 1.15 | 25 | 2.5 | 4 | — |
| Ranged | 1 | T1 | T1 | 0.5 | 1.75 | 3 | 10 | 2.5 | 4 | — |
| Melee | 4 | T3 | T3 | 3.5 | 6.32 | 9.14 | 4 | 0.5 | 80 | — |
| Ranged | 4 | T3 | T3 | 5.83 | 9.85 | 13.86 | 3 | 0.5 | 80 | — |
| Melee | 7 | T6 | T5 | 9.5 | 15.25 | 21 | 2 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 13.5 | 21.25 | 29 | 1 | 0 | — | — |

Effective HP bar: ██░░░░░░░░░░

### Ashen Screamers
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0.15 | 214 | 3.5 | 3 | — |
| Ranged | 1 | T1 | T1 | 0 | 0.75 | 2 | 16 | 3.5 | 3 | — |
| Melee | 4 | T3 | T3 | 2.5 | 5.32 | 8.14 | 4 | 1.5 | 27 | — |
| Ranged | 4 | T3 | T3 | 4.83 | 8.85 | 12.86 | 3 | 1.5 | 27 | — |
| Melee | 7 | T6 | T5 | 8.5 | 14.25 | 20 | 2 | 0 | — | — |
| Ranged | 7 | T5 | T5 | 12.5 | 20.25 | 28 | 2 | 0 | — | — |

Effective HP bar: ██░░░░░░░░░░

### Ashen Alpha
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | — | 5.5 | 2 | — |
| Ranged | 1 | T1 | T1 | 0 | 0 | 1 | 48 | 5.5 | 2 | — |
| Melee | 4 | T3 | T3 | 1.5 | 4.32 | 7.14 | 7 | 3.5 | 12 | — |
| Ranged | 4 | T3 | T3 | 3.83 | 7.85 | 11.86 | 5 | 3.5 | 12 | — |
| Melee | 7 | T6 | T5 | 7.5 | 13.25 | 19 | 3 | 1.5 | 47 | — |
| Ranged | 7 | T5 | T5 | 11.5 | 19.25 | 27 | 2 | 1.5 | 47 | — |

Effective HP bar: ████░░░░░░░░

---
Regenerate this report after tuning stats by running `node scripts/supporting/balance-report.cjs`. Adjust `--levels` or `--adrenaline` to explore different breakpoints.