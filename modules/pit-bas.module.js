function seedWorldContent() {}

const DATA = `
{
  "seed": "pit-bas",
  "name": "pit-bas",
  "start": {
    "map": "cavern",
    "x": 2,
    "y": 2
  },
  "items": [
    {
      "id": "magic_lightbulb",
      "name": "Magic Lightbulb",
      "type": "quest",
      "map": "cavern",
      "x": 3,
      "y": 3,
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "whistle",
      "name": "Whistle",
      "type": "quest",
      "map": "whistle_room",
      "x": 2,
      "y": 2,
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "silver_medallion",
      "name": "Silver Medallion",
      "type": "quest",
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "mace",
      "name": "Mace",
      "type": "weapon",
      "slot": "weapon",
      "mods": { "ATK": 2, "ADR": 10 },
      "map": "dungeon",
      "x": 3,
      "y": 2,
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "axe",
      "name": "Axe",
      "type": "weapon",
      "slot": "weapon",
      "mods": { "ATK": 3, "ADR": 10 },
      "map": "dungeon",
      "x": 1,
      "y": 2,
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "canteen",
      "name": "Canteen",
      "type": "quest",
      "map": "river_room",
      "x": 2,
      "y": 2,
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "diamond_ring",
      "name": "Diamond Ring",
      "type": "quest",
      "map": "river_bed",
      "x": 2,
      "y": 2,
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "key",
      "name": "Key",
      "type": "quest",
      "tags": [
        "key"
      ]
    },
    {
      "id": "air_tanks",
      "name": "Air Tanks",
      "type": "quest",
      "map": "air_room",
      "x": 2,
      "y": 2,
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "sunglasses",
      "name": "Sunglasses",
      "type": "quest",
      "map": "rag_room",
      "x": 2,
      "y": 2,
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "bright_sphere",
      "name": "Bright Sphere",
      "type": "quest",
      "map": "bright_room",
      "x": 2,
      "y": 2,
      "tags": [
        "treasure"
      ]
    },
    {
      "id": "lightning_rod",
      "name": "Lightning Rod",
      "type": "quest",
      "map": "roof_of_house",
      "x": 2,
      "y": 2,
      "tags": [
        "treasure"
      ]
    }
  ],
  "quests": [
    {
      "id": "q_treasure",
      "title": "Merchant's Hoard",
      "desc": "Collect all valuables for the merchant.",
      "item": "treasure",
      "count": 11,
      "reward": "key"
    }
  ],
  "npcs": [
    {
      "id": "bandit",
      "map": "bandit_room",
      "x": 2,
      "y": 2,
      "color": "#f88",
      "name": "Bandit",
      "prompt": "Tattered bandit eyeing you warily",
      "desc": "It eyes your coin purse.",
      "combat": { "HP": 6, "ATK": 2, "DEF": 1 },
      "tree": {
        "start": {
          "text": "The bandit watches your every move.",
          "choices": [
            { "label": "(Fight)", "to": "do_fight" },
            { "label": "(Leave)", "to": "bye" }
          ]
        }
      }
    },
    {
      "id": "troll",
      "map": "troll_room",
      "x": 2,
      "y": 2,
      "color": "#f88",
      "name": "Troll",
      "prompt": "Menacing troll blocking the path",
      "desc": "A hulking troll blocks the way.",
      "combat": { "HP": 8, "ATK": 3, "DEF": 2 },
      "tree": {
        "start": {
          "text": "The troll snarls but does not attack.",
          "choices": [
            { "label": "(Fight)", "to": "do_fight" },
            { "label": "(Leave)", "to": "bye" }
          ]
        }
      }
    },
    {
      "id": "merchant",
      "map": "merchant_room",
      "x": 2,
      "y": 2,
      "color": "#a9f59f",
      "name": "Merchant",
      "prompt": "Wary merchant guarding his wares",
      "questId": "q_treasure",
      "tree": {
        "start": {
          "text": "Bring me all valuables from the pit and I'll hand over the key.",
          "choices": [
            { "label": "(Accept)", "to": "accept", "q": "accept" },
            { "label": "(Turn in valuables)", "to": "turnin", "q": "turnin" },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "accept": {
          "text": "I'll be waiting.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        },
        "turnin": {
          "text": "The merchant counts the haul and hands you a key.",
          "choices": [ { "label": "(Take Key)", "to": "bye" } ]
        }
      }
    },
    {
      "id": "golden_gate_door",
      "map": "large_cavern",
      "x": 4,
      "y": 2,
      "color": "#a9f59f",
      "name": "Golden Gate",
      "prompt": "Gate shimmering with golden light",
      "door": true,
      "locked": true,
      "tree": {
        "locked": {
          "text": "The gate is locked.",
          "choices": [
            { "label": "(Use Key)", "to": "open", "once": true, "reqItem": "key", "effects": [ { "effect": "unlockNPC", "npcId": "golden_gate_door" } ] },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "open": {
          "text": "The gate swings open.",
          "choices": [ { "label": "(Enter)", "to": "enter" } ]
        },
        "enter": {
          "text": "You step through the golden gate.",
          "choices": [ { "label": "(Continue)", "to": "bye", "goto": { "map": "golden_gate", "x": 2, "y": 2 } } ]
        }
      }
    },
    {
      "id": "dead_adventurer",
      "map": "dungeon",
      "x": 2,
      "y": 2,
      "color": "#ffa",
      "name": "Dead Adventurer",
      "prompt": "Unmoving adventurer bound to a rack",
      "tree": {
        "start": {
          "text": "The adventurer doesn't respond.",
          "choices": [
            { "label": "(Loot)", "to": "loot" },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "loot": {
          "text": "You search the body and find a medallion.",
          "choices": [
            { "label": "(Take Medallion)", "to": "empty", "reward": "silver_medallion" }
          ]
        },
        "empty": {
          "text": "The body has nothing else.",
          "choices": [
            { "label": "(Leave)", "to": "bye" }
          ]
        }
      }
    },
    {
      "id": "bees",
      "map": "bee_room",
      "x": 2,
      "y": 2,
      "color": "#ff0",
      "name": "Bees",
      "prompt": "Swarm of buzzing bees",
      "desc": "A furious swarm.",
      "combat": { "HP": 3, "ATK": 1, "DEF": 0 },
      "tree": {
        "start": {
          "text": "The bees buzz around angrily.",
          "choices": [
            { "label": "(Fight)", "to": "do_fight" },
            { "label": "(Leave)", "to": "bye" }
          ]
        }
      }
    },
    {
      "id": "wizard",
      "map": "wizard_room",
      "x": 2,
      "y": 2,
      "color": "#9ef7a0",
      "name": "Wizard",
      "prompt": "A robed wizard studying you",
      "tree": {
        "start": {
          "text": "The wizard nods in greeting.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "magician",
      "map": "magician_book_room",
      "x": 2,
      "y": 2,
      "color": "#9ef7a0",
      "name": "Magician",
      "prompt": "Magician flipping through a dusty tome",
      "tree": {
        "start": {
          "text": "The magician whispers arcane words.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "grue",
      "map": "small_cavern",
      "x": 2,
      "y": 2,
      "color": "#f88",
      "name": "Grue",
      "prompt": "Hungry grue lurking in the shadows",
      "desc": "It hungers for light.",
      "combat": { "HP": 10, "ATK": 4, "DEF": 2 },
      "tree": {
        "start": {
          "text": "It is dark. You are likely to be eaten by a grue.",
          "choices": [
            { "label": "(Fight)", "to": "do_fight" },
            { "label": "(Leave)", "to": "bye" }
          ]
        }
      }
    }
  ],
  "mapLabels": {
    "cavern": "Cavern",
    "large_cavern": "Large Cavern",
    "small_cavern": "Small Cavern",
    "whistle_room": "Whistle Room",
    "golden_gate": "Golden Gate",
    "dungeon": "Dungeon",
    "river_room": "River Room",
    "glass_room": "Glass Room",
    "bandit_room": "Bandit Room",
    "green_house": "Green House",
    "river_bed": "River Bed",
    "troll_room": "Troll Room",
    "trophy_room": "Trophy Room",
    "drain": "Drain",
    "rag_room": "Rag Room",
    "bright_room": "Bright Room",
    "rapid_water": "Rapid Water",
    "pointless_room": "Pointless Room",
    "white_room": "White Room",
    "shore": "Shore",
    "whisper_room": "Whisper Room",
    "wizard_room": "Wizard Room",
    "roof_of_house": "Roof Of House",
    "alice_room": "Alice Room",
    "mirror_alice_room": "Mirror Alice Room",
    "lightning_room": "Lightning Room",
    "magician_book_room": "Magician Book Room",
    "air_room": "Air Room",
    "north_south_passage": "North/South Passage",
    "in_a_box": "In-A-Box",
    "mirror_alice_room": "Alice Room (Mirror)",
    "maze_2800": "Maze",
    "maze_2900": "Maze",
    "maze_3500": "Maze",
    "maze_3700": "Maze",
    "maze_small_room": "Maze Small Room",
    "bee_room": "Bee Room",
    "merchant_room": "Merchant Room",
    "flute_room": "Flute Room",
    "dead_end": "Dead End"
  },
  "portals": [
    {
      "map": "large_cavern",
      "x": 2,
      "y": 4,
      "toMap": "cavern",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "cavern",
      "x": 2,
      "y": 0,
      "toMap": "large_cavern",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "small_cavern",
      "x": 2,
      "y": 0,
      "toMap": "cavern",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "cavern",
      "x": 2,
      "y": 4,
      "toMap": "small_cavern",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "whistle_room",
      "x": 2,
      "y": 1,
      "toMap": "cavern",
      "toX": 2,
      "toY": 3
    },
    {
      "map": "cavern",
      "x": 2,
      "y": 3,
      "toMap": "whistle_room",
      "toX": 2,
      "toY": 2
    },
    {
      "map": "golden_gate",
      "x": 0,
      "y": 2,
      "toMap": "large_cavern",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "large_cavern",
      "x": 4,
      "y": 2,
      "toMap": "golden_gate",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "dungeon",
      "x": 0,
      "y": 2,
      "toMap": "whistle_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "whistle_room",
      "x": 4,
      "y": 2,
      "toMap": "dungeon",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "river_room",
      "x": 2,
      "y": 4,
      "toMap": "dungeon",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "dungeon",
      "x": 2,
      "y": 0,
      "toMap": "river_room",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "glass_room",
      "x": 4,
      "y": 2,
      "toMap": "dungeon",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "dungeon",
      "x": 0,
      "y": 2,
      "toMap": "glass_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "bandit_room",
      "x": 2,
      "y": 4,
      "toMap": "river_room",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "river_room",
      "x": 2,
      "y": 0,
      "toMap": "bandit_room",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "green_house",
      "x": 0,
      "y": 2,
      "toMap": "river_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "river_room",
      "x": 4,
      "y": 2,
      "toMap": "green_house",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "river_bed",
      "x": 4,
      "y": 2,
      "toMap": "river_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "river_room",
      "x": 0,
      "y": 2,
      "toMap": "river_bed",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "dungeon",
      "x": 2,
      "y": 4,
      "toMap": "troll_room",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "troll_room",
      "x": 2,
      "y": 0,
      "toMap": "dungeon",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "troll_room",
      "x": 2,
      "y": 1,
      "toMap": "glass_room",
      "toX": 2,
      "toY": 3
    },
    {
      "map": "glass_room",
      "x": 2,
      "y": 3,
      "toMap": "troll_room",
      "toX": 2,
      "toY": 1
    },
    {
      "map": "trophy_room",
      "x": 0,
      "y": 2,
      "toMap": "bandit_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "bandit_room",
      "x": 4,
      "y": 2,
      "toMap": "trophy_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "drain",
      "x": 2,
      "y": 4,
      "toMap": "river_bed",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "river_bed",
      "x": 2,
      "y": 0,
      "toMap": "drain",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "rag_room",
      "x": 2,
      "y": 0,
      "toMap": "troll_room",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "troll_room",
      "x": 2,
      "y": 4,
      "toMap": "rag_room",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "bright_room",
      "x": 4,
      "y": 2,
      "toMap": "troll_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "troll_room",
      "x": 0,
      "y": 2,
      "toMap": "bright_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "rapid_water",
      "x": 4,
      "y": 2,
      "toMap": "drain",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "drain",
      "x": 0,
      "y": 2,
      "toMap": "rapid_water",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "pointless_room",
      "x": 2,
      "y": 3,
      "toMap": "bright_room",
      "toX": 2,
      "toY": 1
    },
    {
      "map": "bright_room",
      "x": 2,
      "y": 1,
      "toMap": "pointless_room",
      "toX": 2,
      "toY": 3
    },
    {
      "map": "white_room",
      "x": 2,
      "y": 4,
      "toMap": "bright_room",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "bright_room",
      "x": 2,
      "y": 0,
      "toMap": "white_room",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "shore",
      "x": 4,
      "y": 2,
      "toMap": "rapid_water",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "rapid_water",
      "x": 0,
      "y": 2,
      "toMap": "shore",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "whisper_room",
      "x": 2,
      "y": 0,
      "toMap": "maze_2800",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "maze_2800",
      "x": 2,
      "y": 4,
      "toMap": "whisper_room",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "whisper_room",
      "x": 4,
      "y": 2,
      "toMap": "maze_2900",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "maze_2900",
      "x": 0,
      "y": 2,
      "toMap": "whisper_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "whisper_room",
      "x": 0,
      "y": 2,
      "toMap": "rag_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "rag_room",
      "x": 4,
      "y": 2,
      "toMap": "whisper_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "wizard_room",
      "x": 4,
      "y": 2,
      "toMap": "white_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "white_room",
      "x": 0,
      "y": 2,
      "toMap": "wizard_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "roof_of_house",
      "x": 2,
      "y": 3,
      "toMap": "shore",
      "toX": 2,
      "toY": 1
    },
    {
      "map": "shore",
      "x": 2,
      "y": 1,
      "toMap": "roof_of_house",
      "toX": 2,
      "toY": 3
    },
    {
      "map": "alice_room",
      "x": 4,
      "y": 2,
      "toMap": "shore",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "shore",
      "x": 0,
      "y": 2,
      "toMap": "alice_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "alice_room",
      "x": 0,
      "y": 2,
      "toMap": "mirror_alice_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "mirror_alice_room",
      "x": 4,
      "y": 2,
      "toMap": "alice_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "lightning_room",
      "x": 2,
      "y": 3,
      "toMap": "wizard_room",
      "toX": 2,
      "toY": 1
    },
    {
      "map": "wizard_room",
      "x": 2,
      "y": 1,
      "toMap": "lightning_room",
      "toX": 2,
      "toY": 3
    },
    {
      "map": "lightning_room",
      "x": 2,
      "y": 0,
      "toMap": "roof_of_house",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "roof_of_house",
      "x": 2,
      "y": 4,
      "toMap": "lightning_room",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "magician_book_room",
      "x": 2,
      "y": 3,
      "toMap": "5800",
      "toX": 2,
      "toY": 1
    },
    {
      "map": "5800",
      "x": 2,
      "y": 1,
      "toMap": "magician_book_room",
      "toX": 2,
      "toY": 3
    },
    {
      "map": "air_room",
      "x": 4,
      "y": 2,
      "toMap": "magician_book_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "magician_book_room",
      "x": 0,
      "y": 2,
      "toMap": "air_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "maze_small_room",
      "x": 2,
      "y": 0,
      "toMap": "dead_end",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "dead_end",
      "x": 2,
      "y": 4,
      "toMap": "maze_small_room",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "maze_small_room",
      "x": 4,
      "y": 2,
      "toMap": "maze_3700",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "maze_3700",
      "x": 0,
      "y": 2,
      "toMap": "maze_small_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "maze_small_room",
      "x": 0,
      "y": 2,
      "toMap": "maze_3500",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "maze_3500",
      "x": 4,
      "y": 2,
      "toMap": "maze_small_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "bee_room",
      "x": 2,
      "y": 0,
      "toMap": "maze_2900",
      "toX": 2,
      "toY": 4
    },
    {
      "map": "maze_2900",
      "x": 2,
      "y": 4,
      "toMap": "bee_room",
      "toX": 2,
      "toY": 0
    },
    {
      "map": "bee_room",
      "x": 4,
      "y": 2,
      "toMap": "merchant_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "merchant_room",
      "x": 0,
      "y": 2,
      "toMap": "bee_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "bee_room",
      "x": 0,
      "y": 2,
      "toMap": "flute_room",
      "toX": 4,
      "toY": 2
    },
    {
      "map": "flute_room",
      "x": 4,
      "y": 2,
      "toMap": "bee_room",
      "toX": 0,
      "toY": 2
    }
  ],
  "events": [
    {
      "map": "lightning_room",
      "x": 2,
      "y": 2,
      "events": [ { "when": "enter", "effect": "lightningZap" } ]
    },
    {
      "map": "river_bed",
      "x": 4,
      "y": 2,
      "events": [ { "when": "enter", "effect": "requireAirTanks" } ]
    },
    {
      "map": "river_bed",
      "x": 2,
      "y": 0,
      "events": [ { "when": "enter", "effect": "requireAirTanks" } ]
    }
  ],
  "interiors": [
    {
      "id": "cavern",
      "label": "Cavern",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "large_cavern",
      "label": "Large Cavern",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "small_cavern",
      "label": "Small Cavern",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "whistle_room",
      "label": "Whistle Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "golden_gate",
      "label": "Golden Gate",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "dungeon",
      "label": "Dungeon",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "river_room",
      "label": "River Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "glass_room",
      "label": "Glass Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "bandit_room",
      "label": "Bandit Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "green_house",
      "label": "Green House",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "river_bed",
      "label": "River Bed",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "troll_room",
      "label": "Troll Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 3
    },
    {
      "id": "trophy_room",
      "label": "Trophy Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "drain",
      "label": "Drain",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "rag_room",
      "label": "Rag Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "bright_room",
      "label": "Bright Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "rapid_water",
      "label": "Rapid Water",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "pointless_room",
      "label": "Pointless Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "white_room",
      "label": "White Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "shore",
      "label": "Shore",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "whisper_room",
      "label": "Whisper Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "wizard_room",
      "label": "Wizard Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "north_south_passage",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "roof_of_house",
      "label": "Roof Of House",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🧱🚪🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 3
    },
    {
      "id": "alice_room",
      "label": "Alice Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "mirror_alice_room",
      "label": "Alice Room (Mirror)",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "lightning_room",
      "label": "Lightning Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 4,
      "entryY": 2
    },
    {
      "id": "magician_book_room",
      "label": "Magician Book Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "in_a_box",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "air_room",
      "label": "Air Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "maze_2800",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "maze_2900",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "maze_3500",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "maze_3700",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "maze_small_room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "dead_end",
      "label": "Dead End",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "bee_room",
      "label": "Bee Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "merchant_room",
      "label": "Merchant Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "flute_room",
      "label": "Flute Room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    }
  ]
}
`;

function postLoad(module) {
  log('You land in a shadowy cavern.');
  module.effects = module.effects || {};
  module.effects.lightningZap = () => {
    if (hasItem('lightning_rod')) {
      log('The lightning rod hums and deflects the bolt.');
    } else {
      log('A lightning bolt strikes! You tumble back to the cavern.');
      setMap('cavern', 'Cavern');
      setPartyPos(2, 2);
    }
  };
  module.effects.requireAirTanks = () => {
    if (!hasItem('air_tanks')) {
      log('You need air tanks to go underwater.');
      setMap('river_room', 'River Room');
      setPartyPos(0, 2);
    }
  };
}

globalThis.PIT_BAS_MODULE = JSON.parse(DATA);
globalThis.PIT_BAS_MODULE.postLoad = postLoad;

startGame = function () {
  PIT_BAS_MODULE.postLoad?.(PIT_BAS_MODULE);
  applyModule(PIT_BAS_MODULE);
  const s = PIT_BAS_MODULE.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setMap(s.map, s.map === 'world' ? 'Wastes' : undefined);
  setPartyPos(s.x, s.y);
};
