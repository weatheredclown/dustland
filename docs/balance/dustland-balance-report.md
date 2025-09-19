# Dustland Combat Balance Report: dustland-module
_Generated 2025-09-19T21:19:45.067Z_

This report estimates how Dustland combatants perform using deterministic averages drawn from the current data files. It considers party builds at multiple levels and equipment tiers, then compares their expected output against enemies found in the module.

> Assumptions: Party members start with 10 HP and gain +10 HP per level. Each new level increases the primary combat stat (STR for melee, AGI for ranged) by 1. Damage values use the mean roll from in-game formulas and ignore luck, guard, and other transient effects.

## Weapon Tiers
### Melee Weapons
| Tier | Items | Avg ATK | Avg ADR | Avg Adr Gain | Adr Dmg Mod | Notable Tags |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | 5 | 1 | 11.4 | 2.85 | 1.04 | — |
| T2 | 2 | 2 | 10.5 | 2.63 | 1 | — |
| T3 | 2 | 5 | 10 | 2.5 | 1 | — |

### Ranged Weapons
| Tier | Items | Avg ATK | Avg ADR | Avg Adr Gain | Adr Dmg Mod | Notable Tags |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | 1 | 2 | 15 | 3.75 | 1 | ranged |
| T2 | 1 | 8 | 45 | 11.25 | 1 | heavy, ranged |

## Armor Tiers
| Tier | Items | Avg DEF | Adr Gen Mod | Adr Dmg Mod |
| --- | --- | --- | --- | --- |
| T1 | 3 | 1 | 1.03 | 1 |
| T2 | 1 | 2 | 1 | 1 |
| T3 | 1 | 3 | 0.9 | 1 |
| T4 | 1 | 4 | 1 | 1 |
| T5 | 1 | 5 | 1 | 1 |

## Party Damage Benchmarks
| Archetype | Level | Weapon Tier | Armor Tier | Primary Stat | ATK Bonus | DEF Bonus | ADR Gain/Attack | Attacks to Fill ADR | Avg Damage (0/50/100%) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | STR 4 | 1 | 1 | 3.06 | 33 | 0%: 1.5<br>50%: 2.28<br>100%: 3.06 |
| Ranged | 1 | T1 | T1 | AGI 4 | 2 | 1 | 3.88 | 26 | 0%: 2<br>50%: 3<br>100%: 4 |
| Melee | 4 | T2 | T3 | STR 7 | 2 | 3 | 2.36 | 43 | 0%: 4.5<br>50%: 6.75<br>100%: 9 |
| Ranged | 4 | T2 | T3 | AGI 7 | 8 | 3 | 10.13 | 10 | 0%: 10.5<br>50%: 15.75<br>100%: 21 |
| Melee | 7 | T3 | T5 | STR 10 | 5 | 5 | 2.5 | 40 | 0%: 10.5<br>50%: 15.75<br>100%: 21 |
| Ranged | 7 | T2 | T5 | AGI 10 | 8 | 5 | 11.25 | 9 | 0%: 13.5<br>50%: 20.25<br>100%: 27 |

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
| Melee | 1 | T1 | T1 | 1.5 | 2.28 | 3.06 | 2 | 0 | — | — |
| Ranged | 1 | T1 | T1 | 2 | 3 | 4 | 2 | 0 | — | — |
| Melee | 4 | T2 | T3 | 4.5 | 6.75 | 9 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 13.5 | 20.25 | 27 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Mira
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.28 | 2.06 | 4 | 1 | 10 | 2 |
| Ranged | 1 | T1 | T1 | 1 | 2 | 3 | 3 | 1 | 10 | 2 |
| Melee | 4 | T2 | T3 | 3.5 | 5.75 | 8 | 1 | 0 | — | 2 |
| Ranged | 4 | T2 | T3 | 9.5 | 14.75 | 20 | 1 | 0 | — | 2 |
| Melee | 7 | T3 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | 2 |
| Ranged | 7 | T2 | T5 | 12.5 | 19.25 | 26 | 1 | 0 | — | 2 |

Effective HP bar: █░░░░░░░░░░░

### Nora
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.28 | 2.06 | 4 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1 | 2 | 3 | 3 | 0.5 | 20 | — |
| Melee | 4 | T2 | T3 | 3.5 | 5.75 | 8 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 12.5 | 19.25 | 26 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Tess
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.28 | 2.06 | 4 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1 | 2 | 3 | 3 | 0.5 | 20 | — |
| Melee | 4 | T2 | T3 | 3.5 | 5.75 | 8 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 12.5 | 19.25 | 26 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Road Raider
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | — | 1.5 | 7 | — |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | — | 1.5 | 7 | — |
| Melee | 4 | T2 | T3 | 0 | 1.75 | 4 | — | 0 | — | — |
| Ranged | 4 | T2 | T3 | 5.5 | 10.75 | 16 | — | 0 | — | — |
| Melee | 7 | T3 | T5 | 5.5 | 10.75 | 16 | — | 0 | — | — |
| Ranged | 7 | T2 | T5 | 8.5 | 15.25 | 22 | — | 0 | — | — |

### Scrap Mutt
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.28 | 3.06 | 2 | 0 | — | — |
| Ranged | 1 | T1 | T1 | 2 | 3 | 4 | 2 | 0 | — | — |
| Melee | 4 | T2 | T3 | 4.5 | 6.75 | 9 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 13.5 | 20.25 | 27 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Rust Bandit
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.28 | 3.06 | 2 | 0 | — | — |
| Ranged | 1 | T1 | T1 | 2 | 3 | 4 | 2 | 0 | — | — |
| Melee | 4 | T2 | T3 | 4.5 | 6.75 | 9 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 13.5 | 20.25 | 27 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Feral Nomad
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.28 | 3.06 | 2 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 2 | 3 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T2 | T3 | 4.5 | 6.75 | 9 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 13.5 | 20.25 | 27 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Waste Ghoul
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 1.5 | 2.28 | 3.06 | 3 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 2 | 3 | 4 | 2 | 0.5 | 20 | — |
| Melee | 4 | T2 | T3 | 4.5 | 6.75 | 9 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 10.5 | 15.75 | 21 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 13.5 | 20.25 | 27 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Iron Brute
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.28 | 1.06 | 15 | 1 | 10 | — |
| Ranged | 1 | T1 | T1 | 0 | 1 | 2 | 8 | 1 | 10 | — |
| Melee | 4 | T2 | T3 | 2.5 | 4.75 | 7 | 3 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 8.5 | 13.75 | 19 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 8.5 | 13.75 | 19 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 11.5 | 18.25 | 25 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Grit Stalker
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.28 | 2.06 | 4 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1 | 2 | 3 | 3 | 0.5 | 20 | — |
| Melee | 4 | T2 | T3 | 3.5 | 5.75 | 8 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 12.5 | 19.25 | 26 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Scrap Behemoth
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.28 | 1.06 | 29 | 1 | 10 | — |
| Ranged | 1 | T1 | T1 | 0 | 1 | 2 | 15 | 1 | 10 | — |
| Melee | 4 | T2 | T3 | 2.5 | 4.75 | 7 | 5 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 8.5 | 13.75 | 19 | 2 | 0 | — | — |
| Melee | 7 | T3 | T5 | 8.5 | 13.75 | 19 | 2 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 11.5 | 18.25 | 25 | 2 | 0 | — | — |

Effective HP bar: ██░░░░░░░░░░

### Dust Rat
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0.5 | 1.28 | 2.06 | 3 | 0.5 | 20 | — |
| Ranged | 1 | T1 | T1 | 1 | 2 | 3 | 2 | 0.5 | 20 | — |
| Melee | 4 | T2 | T3 | 3.5 | 5.75 | 8 | 1 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 12.5 | 19.25 | 26 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Gear Ghoul
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0.28 | 1.06 | 8 | 1 | 10 | — |
| Ranged | 1 | T1 | T1 | 0 | 1 | 2 | 4 | 1 | 10 | — |
| Melee | 4 | T2 | T3 | 2.5 | 4.75 | 7 | 2 | 0 | — | — |
| Ranged | 4 | T2 | T3 | 8.5 | 13.75 | 19 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 8.5 | 13.75 | 19 | 1 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 11.5 | 18.25 | 25 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Siltpack Ravener
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 1.5 | 7 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 1 | 2 | 3 | 5 | 1.5 | 7 | — |
| Melee | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 4 | T2 | T3 | 9.5 | 14.75 | 20 | 1 | 0 | — | — |
| Melee | 7 | T3 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 7 | T2 | T5 | 12.5 | 19.25 | 26 | 1 | 0 | — | — |

Effective HP bar: █░░░░░░░░░░░

### Grinder Matriarchs
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 2.5 | 4 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 2.5 | 4 | Gear mismatch |
| Melee | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 0.5 | 80 | Gear mismatch |
| Ranged | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 0.5 | 80 | Gear mismatch |
| Melee | 7 | T3 | T5 | 8.5 | 13.75 | 19 | 2 | 0 | — | — |
| Ranged | 7 | T2 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |

Effective HP bar: ██░░░░░░░░░░

### Glasswing Pride
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 3.5 | 3 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 3.5 | 3 | Gear mismatch |
| Melee | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 1.5 | 27 | Gear mismatch |
| Ranged | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 1.5 | 27 | Gear mismatch |
| Melee | 7 | T3 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |
| Ranged | 7 | T2 | T5 | 0 | 0 | 0 | Immune | 0 | — | Gear mismatch |

Effective HP bar: ██░░░░░░░░░░

### Sovereign of Dust
| Archetype | Level | Weapon Tier | Armor Tier | 0% | 50% | 100% | Atk to Kill | Enemy Dmg | Enemy Atk to Down | Counter |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Melee | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 9.5 | 2 | Gear mismatch |
| Ranged | 1 | T1 | T1 | 0 | 0 | 0 | Immune | 9.5 | 2 | Gear mismatch |
| Melee | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 7.5 | 6 | Gear mismatch |
| Ranged | 4 | T2 | T3 | 0 | 0 | 0 | Immune | 7.5 | 6 | Gear mismatch |
| Melee | 7 | T3 | T5 | 4.5 | 9.75 | 15 | 11 | 5.5 | 13 | — |
| Ranged | 7 | T2 | T5 | 0 | 0 | 0 | Immune | 5.5 | 13 | Gear mismatch |

Effective HP bar: ████████████

---
Regenerate this report after tuning stats by running `node scripts/supporting/balance-report.cjs`. Adjust `--levels` or `--adrenaline` to explore different breakpoints.