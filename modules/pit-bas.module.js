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
      "y": 3
    },
    {
      "id": "whistle",
      "name": "Whistle",
      "type": "quest",
      "map": "whistle_room",
      "x": 2,
      "y": 2
    },
    {
      "id": "silver_medallion",
      "name": "Silver Medallion",
      "type": "quest",
      "map": "dungeon",
      "x": 2,
      "y": 2
    },
    {
      "id": "mace",
      "name": "Mace",
      "type": "quest",
      "map": "dungeon",
      "x": 3,
      "y": 2
    },
    {
      "id": "axe",
      "name": "Axe",
      "type": "quest",
      "map": "dungeon",
      "x": 1,
      "y": 2
    },
    {
      "id": "canteen",
      "name": "Canteen",
      "type": "quest",
      "map": "river_room",
      "x": 2,
      "y": 2
    },
    {
      "id": "diamond_ring",
      "name": "Diamond Ring",
      "type": "quest",
      "map": "river_bed",
      "x": 2,
      "y": 2
    },
    {
      "id": "key",
      "name": "Key",
      "type": "quest",
      "map": "merchant_room",
      "x": 2,
      "y": 2
    },
    {
      "id": "air_tanks",
      "name": "Air Tanks",
      "type": "quest",
      "map": "air_room",
      "x": 2,
      "y": 2
    },
    {
      "id": "sunglasses",
      "name": "Sunglasses",
      "type": "quest",
      "map": "rag_room",
      "x": 2,
      "y": 2
    },
    {
      "id": "bright_sphere",
      "name": "Bright Sphere",
      "type": "quest",
      "map": "bright_room",
      "x": 2,
      "y": 2
    },
    {
      "id": "lightning_rod",
      "name": "Lightning Rod",
      "type": "quest",
      "map": "roof_of_house",
      "x": 2,
      "y": 2
    }
  ],
  "quests": [],
  "npcs": [
    {
      "id": "bandit",
      "map": "bandit_room",
      "x": 2,
      "y": 2,
      "color": "#f88",
      "name": "Bandit",
      "prompt": "Tattered bandit eyeing you warily",
      "tree": {
        "start": {
          "text": "The bandit watches your every move.",
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
      "id": "troll",
      "map": "troll_room",
      "x": 2,
      "y": 2,
      "color": "#f88",
      "name": "Troll",
      "prompt": "Menacing troll blocking the path",
      "tree": {
        "start": {
          "text": "The troll snarls but does not attack.",
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
      "id": "merchant",
      "map": "merchant_room",
      "x": 2,
      "y": 2,
      "color": "#a9f59f",
      "name": "Merchant",
      "prompt": "Wary merchant guarding his wares",
      "tree": {
        "start": {
          "text": "The merchant adjusts his pack.",
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
            {
              "label": "(Leave)",
              "to": "bye"
            }
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
      "tree": {
        "start": {
          "text": "The bees buzz around angrily.",
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
      "tree": {
        "start": {
          "text": "It is dark. You are likely to be eaten by a grue.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
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
    "lightning_room": "Lightning Room",
    "magician_book_room": "Magician Book Room",
    "air_room": "Air Room",
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
  "interiors": [
    {
      "id": "cavern",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝⬇️🏝🧱",
        "🧱🧱🚪🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "large_cavern",
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
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝⬆️🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "golden_gate",
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
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝⬇️🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "bandit_room",
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
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝⬆️🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "trophy_room",
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
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝⬆️🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "rapid_water",
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
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝⬇️🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "white_room",
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
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝⬆️🏝🧱",
        "🚪🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "whisper_room",
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
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝⬆️🏝🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "roof_of_house",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝⬆️🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝⬇️🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "alice_room",
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
      "id": "lightning_room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝⬇️🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "magician_book_room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
        "🧱🏝⬇️🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "air_room",
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
      "id": "maze_small_room",
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
      "id": "dead_end",
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
  ],
  "buildings": [],
  "listing": "MCBDT0xPUiAxNTogQ0xTDQoxIEtFWSBPRkY6IEJFR0lOID0gMTogR09TVUIgMzgwMDANCjIgSU5QVVQgIldIQVQgSVMgWU9VUiBOQU1FPyAiLCBNQU1FJDogR09TVUIgMzkwMDANCjMgQ0xTIDogSUYgTUFNRSQgPSAiQlJJQU4gR0FMTEVUVEEiIFRIRU4gR09TVUIgNDIwMDANCjQgSU5QVVQgIldPVUxEIFlPVSBMSUtFIElOU1RSVUNUSU9OUz8gIiwgQSQ6IElGIEEkID0gIlkiIE9SIEEkID0gIllFUyIgVEhFTiBHT1NVQiAzNzAwMA0KNSBDT0xPUiAxNSwgMA0KNyBJRiBNQU1FJCA9ICJILlAuIEhBQ0tFUiIgVEhFTiBQUklOVCAiV0hBVCBJUyBZT1VSIFJFQUwgTkFNRT8iOiBJTlBVVCBNQU1FJDogSUYgTUFNRSQgPSAiVElNIiBUSEVOIE1BTUUkID0gIkguUC4gSEFDS0VSIg0KOCBJRiBNQU1FJCA9ICJUSU0gTEFVQkFDSCIgVEhFTiBHT1RPIDQxMDAwDQo5IFBSSU5UICJXSElMRSBPTiBZT1UgV0FZIFRPIElTVE1BUyBZT1UgRkFMTCBJTlRPIEEgREVFUCBDQVZFUk4uICBZT1UgTVVTVCBUUlkgVE8gUkVUVVJOIFRPIFRIRSBTVVJGQUNFIFdPUkxELiI6IEZPUiBYID0gMSBUTyAxMjAwMDogTkVYVCBYOiBDTFMNCjEwIFJFTSBQSVQNCjExIFBSSU5UICJDQVZFUk4iDQoxMiBJRiBNQU1FJCA9ICJERU5OSVMiIFRIRU4gUFJJTlQgIlVoLCBERU5OSVMuLi4gICBJJ00gQkVUVEVSIFRIQU4gWU9VISAgSSBBTFdBWVMgV0FTIEFORCBBTFdBWVMgV0lMTCBCRSBCRVRURVIhIg0KMTUgUFJJTlQgIlRISVMgUk9PTSBIQVMgRVhJVFMgVE8gVEhFIE5PUlRIIEFORCBTT1VUSC4gIFRIRVJFIElTIEFMU08gQSBTUElSQUwgU1RBSVJDQVNFICAgTEVBRElORyBET1dOLiAgVEhFUkUgSVMgQU4gSU5TQ1JJUFRJT04gT04gVEhFIFdBTEwuICAiOw0KMTcgSUYgSUEkIDw+ICJMSUdIVEJVTEIiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgTUFHSUMgTElHSFRCVUxCIEhFUkUuKFBST1ZJRElORyBMSUdIVCkuIjsNCjE5IFBSSU5UIDogSUYgTUFNRSQgPSAiSk9IQU5OQSIgVEhFTiBJTlBVVCAiQVJFIFlPVSBXRUFSSU5HIFNIT1VMREVSUEFEUz8gIiwgU0hPVUxERVJQQUQkOiBJRiBTSE9VTERFUlBBRCQgPSAiWUVTIiBUSEVOIFNQJCA9ICJTSE9VTERFUlBBRFMiOiBQUklOVCAiR09PRCEiOiBQUklOVA0KMjAgR09TVUIgMjUwMDANCjMwIElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gMTAwDQo0MCBJRiBBJCA9ICJTT1VUSCIgVEhFTiBHT1RPIDIwMA0KNDUgSUYgQSQgPSAiUkVBRCBJTlNDUklQVElPTiIgVEhFTiBQUklOVCAiRklORCBUSEUgTUVSQ0hBTlQgVE8gRlVMRklMTCBZT1VSIERFU1RJTlkiIEVMU0UgR09UTyA1MA0KNDcgR09UTyAyMA0KNTAgSUYgQSQgPSAiRE9XTiIgVEhFTiBHT1RPIDMwMA0KNjAgSUYgQSQgPSAiS0lMTCBTRUxGIiBUSEVOIEVORA0KNzAgSUYgQSQgPSAiVEFLRSBCVUxCIiBUSEVOIFBSSU5UICJUQUtFTiINCjc1IElGIEEkID0gIlJFQUQgV0FMTCIgVEhFTiBQUklOVCAiRklORCBUSEUgTUVSQ0hBTlQgVE8gRlVMRklMTCBZT1UgREVTVElOWSI6IFBSSU5UIDogR09UTyAyMA0KODAgSUYgQSQgPSAiVEFLRSBCVUxCIiBUSEVOIElBJCA9ICJMSUdIVEJVTEIiDQo4MSBJRiBBJCA9ICJUQUtFIExJR0hUQlVMQiIgVEhFTiBJQSQgPSAiTElHSFRCVUxCIg0KODIgSUYgQSQgPSAiVEFLRSBMSUdIVEJVTEIiIFRIRU4gUFJJTlQgIkRPTkUiOiBQUklOVCA6IEdPVE8gMjANCjgzIElGIEEkID0gIlRBS0UgTElHSFQiIFRIRU4gSUEkID0gIkxJR0hUQlVMQiI6IFBSSU5UICJET05FIjogUFJJTlQgOiBHT1RPIDIwDQo4NSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMTANCjkwIElGIEEkID0gIlRBS0UgQlVMQiIgVEhFTiBHT1RPIDIwDQo5MiBJRiBBJCA9IEIkIFRIRU4gUFJJTlQgIllPVSBUUklFRCBUSEFUISAgSVQgRElETidUIFdPUkshIjogR09UTyAyMA0KOTMgTEVUIEIkID0gQSQNCjk4IFBSSU5UICJUUlkgQUdBSU4iDQo5OSBHT1RPIDIwDQoxMDAgQ09MT1IgMjogUFJJTlQgIkxBUkdFIENBVkVSTiINCjEwNSBDT0xPUiAxNTogUFJJTlQgIlRISVMgQ0FWRVJOIEhBUyBFWElUUyBUTyBUSEUgU09VVEggQU5EIEVBU1QuICBZT1UgTk9USUNFIEEgRkFJTlQgR0xPVyBUTyBUSEUgICAgRUFTVC4iOw0KMTA2IElGIElBJCA8PiAiTElHSFRCVUxCIiBUSEVOIFBSSU5UICIoUFJPVklESU5HIExJR0hUKSIgRUxTRSBQUklOVA0KMTEwIEdPU1VCIDI1MDAwDQoxMjAgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyAxMA0KMTMwIElGIEEkID0gIkVBU1QiIFRIRU4gR09UTyA0MDANCjE0MCBJRiBBJCA9ICJLSUxMIFNFTEYiIFRIRU4gR09UTyAxMDEwMA0KMTQ1IElGIEEkID0gIkxPT0siIFRIRU4gR09UTyAxMDANCjE1MCBQUklOVA0KMTk4IFBSSU5UICJUUlkgQUdBSU4iDQoxOTkgR09UTyAxMTANCjIwMCBTT1VUSCA9IDENCjIwMSBJRiBJQSQgPD4gIkxJR0hUQlVMQiIgVEhFTiBQUklOVCAiWU9VIEhBVkUgTU9WRUQgSU5UTyBBIERBUksgUExBQ0UuIFlPVSBBUkUgSU4gREFOR0VSIE9GIEJFSU5HIEVBVEVOIEJZIEEgR1JVRS4iIEVMU0UgR09UTyAyMDMNCjIwMiBHT1RPIDIxMA0KMjAzIENPTE9SIDU6IFBSSU5UICJTTUFMTCBDQVZFUk4iDQoyMDQgQ09MT1IgMTU6IFBSSU5UICJZT1UgQVJFIElOIEEgU01BTEwgQ0FWRVJOLiBJVCBIQVMgRVhJVFMgVE8gVEhFIE5PUlRIIEFORCBTT1VUSC4iDQoyMTAgR09TVUIgMjUwMDANCjIyMCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHRVIkID0gIkdFUiI6IExFVCBTT1VUSCA9IFNPVVRIIC0gMTogSUYgU09VVEggPSAwIFRIRU4gR09UTyAxMCBFTFNFIEdPVE8gMjAwDQoyMzAgSUYgQSQgPSAiU09VVEgiIFRIRU4gTEVUIFBMQVlETyA9IFJORCgxKSAqIDEwOiBJRiBJQSQgPD4gIkxJR0hUQlVMQiIgVEhFTiBHRVIkID0gIkdFUiI6IElGIFBMQVlETyA+IDggVEhFTiBQUklOVCAiWU9VIEhBVkUgU1RFUFBFRCBJTiBUTyBUSEUgR0FQRUlORyBKQVdTIE9GIEEgR1JVRSEiOiBGT1IgWCA9IDEgVE8gNTAwMDogTkVYVCBYOiBTWVNURU0NCjIzNSBJRiBBJCA9ICJTT1VUSCIgVEhFTiBMRVQgU09VVEggPSBTT1VUSCArIDE6IEdPVE8gMjAxDQoyNDAgSUYgQSQgPSAiS0lMTCBTRUxGIiBUSEVOIEdPVE8gMTAxMDANCjI1MCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMjAxDQoyOTggUFJJTlQgIlRSWSBBR0FJTiINCjI5OSBHT1RPIDIxMA0KMzAwIElGIElBJCA8PiAiTElHSFRCVUxCIiBUSEVOIFBSSU5UICJJVCBJUyBEQVJLIERPV04gSEVSRSEiIEVMU0UgR09UTyAzMDINCjMwMSBHT1RPIDMxMA0KMzAyIENPTE9SIDQ6IFBSSU5UICJXSElTVExFIFJPT00iDQozMDQgQ09MT1IgMTU6IFBSSU5UICJUSEVSRSBJUyBBTiBFWElUIFRPIFRIRSBFQVNUIEFORCBBIFNQSVJBTCBTVEFJUkNBU0UgTEVBRElORyBVUFdBUkQgSU5UTyBEQVJLTkVTUyI7DQozMDcgSUYgSUIkIDw+ICJXSElTVExFIiBUSEVOIFBSSU5UICJUSEVSRSBJUyBBIFdISVNUTEUgSEFOR0lORyBPTiBUSEUgV0FMTC4iDQozMTAgV0hJU0tFTCA9IDE6IEdPU1VCIDI1MDAwDQozMjAgSUYgQSQgPSAiRUFTVCIgVEhFTiBXSElTS0VMID0gMDogR09UTyA1MDANCjMzMCBJRiBBJCA9ICJVUCIgVEhFTiBXSElTS0VMID0gMDogR09UTyAxMA0KMzQwIElGIEEkID0gIktJTEwgU0VMRiIgVEhFTiBHT1RPIDEwMTAwDQozNTAgSUYgQSQgPSAiQkxPVyBXSElTVExFIiBPUiBBJCA9ICJCTE9XIElUIiBUSEVOIEdPVE8gNTgwMA0KMzU1IElGIEEkID0gIkxPT0siIFRIRU4gR09UTyAzMDANCjM4MCBJRiBBJCA9ICJUQUtFIFdISVNUTEUiIFRIRU4gSUIkID0gIldISVNUTEUiIEVMU0UgR09UTyAzOTgNCjM4NSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMzAwDQozOTAgUFJJTlQgIkRPTkUiOiBHT1RPIDMxMA0KMzk4IFBSSU5UICJUUlkgQUdBSU4iDQozOTkgR09UTyAzMTANCjQwMCAgQ09MT1IgMTQ6IFBSSU5UICJHT0xERU4gR0FURSINCjQwMSBDT0xPUiAxNTogUFJJTlQgIllPVSBBUkUgU1RBTkRJTkcgQVQgQSBMQVJHRSBHQVRFIENPTlNUUlVDVEVEIE9GIEdPTEQgQ09WRVJFRCBJTiBJTlRSSUNBVEUgICAgICAgSU5HUkFWSU5HUy4gIFRIUk9VR0ggVEhFIEdBVEUgWU9VIFNFRSBBIE1BR0lDIENBUlBFVCBBTkQgSElHSCBBQk9WRSBZT1UgSVMgQSAgICBGTE9BVElORyBQRURJU1RBTC4gIFRIRSBFWElUIElTIFRPIFRIRSBXRVNULiINCjQxMCBHT1NVQiAyNTAwMA0KNDE1IElGIEEkID0gIlRPVUNIIEdBVEUiIFRIRU4gUFJJTlQgIllPVSBHRVQgQU4gRUxFQ1RSSUMgU0hPQ0sgVEhBVCBNQUtFUyBZT1VSIEZJTExJTkdTIEFDSEUuIjogUFJJTlQgOiBHT1RPIDQxMA0KNDIwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyAxMDANCjQzMCBJRiBBJCA9ICJLSUxMIFNFTEYiIFRIRU4gR09UTyAxMDEwMA0KNDM1IElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA0MDANCjQ0MCBJRiBBJCA9ICJHTyBUSFJPVUdIIFRIRSBHQVRFIiBUSEVOIFBSSU5UICJJVCBJUyBDTE9TRUQiDQo0NDUgSUYgQSQgPSAiR08gVEhST1VHSCBHQVRFIiBUSEVOIFBSSU5UICJJVCBJUyBDTE9TRUQiDQo0NTAgSUYgQSQgPSAiT1BFTiBUSEUgR0FURSIgVEhFTiBQUklOVCAiSVQgSVMgTE9DS0VEIg0KNDU1IElGIEEkID0gIk9QRU4gR0FURSIgVEhFTiBQUklOVCAiSVQgSVMgTE9DS0VEIg0KNDYwIElGIEEkID0gIlVOTE9DSyBUSEUgR0FURSIgVEhFTiBHT1RPIDQ3MCBFTFNFIEdPVE8gNDY1DQo0NjUgSUYgQSQgPSAiVU5MT0NLIEdBVEUiIFRIRU4gR09UTyA0NzAgRUxTRSBHT1RPIDQ5OA0KNDcwIElGIElaJCA9ICJLRVkiIFRIRU4gR09UTyAyMDAwMA0KNDgwIElGIElaJCA8PiAiS0VZIiBUSEVOIFBSSU5UICJZT1UgSEFWRSBOTyBLRVkuIg0KNDk4IFBSSU5UICJUUlkgQUdBSU4iDQo0OTkgR09UTyA0MTANCjUwMCBQUklOVCAiRFVOR0VPTiINCjUwNCBQUklOVCAiVEhFUkUgQVJFIFZBUklPVVMgVE9SVFVSRSBERVZJQ0VTIElOIFRISVMgUk9PTSwgQUxMIFRPTyBIRUFWWSBUTyBUQUtFLiAgT04gVEhFICBSQUNLIElTIEFOIFVORk9SVFVOQVRFIEFEVkVOVFVSRVIuIjsNCjUwNSBJRiBJQyQgPD4gIk1FREFMTElPTiIgVEhFTiBQUklOVCAiICBIRSBJUyBXRUFSSU5HIEEgU0lMVkVSIE1FREFMTElPTiI7DQo1MDYgSUYgSUQkIDw+ICJNQUNFIiBUSEVOIFBSSU5UICJUSEVSRSBJUyBBIE1BQ0UgSEVSRS4iOw0KNTA3IElGIElFJCA8PiAiQVhFIiBUSEVOIFBSSU5UICIgIFRIRVJFIElTIEFOIEFYRSBIRVJFLiINCjUwOSBQUklOVCAiVEhFIEVYSVQgQVJFIFRPIFRIRSBTT1VUSCwgTk9SVEgsIEFORCBXRVNULiINCjUxMCBHT1NVQiAyNTAwMA0KNTIwIElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gNjAwDQo1MjUgSUYgQSQgPSAiS0lMTCBTRUxGIiBUSEVOIEdPVE8gMTAxMDANCjUzMCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gMzAwDQo1MzMgSUYgQSQgPSAiRlJFRSBBRFZFTlRVUkVSIiBUSEVOIFBSSU5UICJJVCBJUyBQT0lOVExFU1MsIEhFIElTIERFQUQiDQo1NDAgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyA3MDANCjU0NSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNTAwDQo1NTAgSUYgQSQgPSAiVEFLRSBBTEwiIFRIRU4gSUMkID0gIk1FREFMTElPTiIgRUxTRSBHT1RPIDU2MA0KNTUxIElEJCA9ICJNQUNFIg0KNTUzIElFJCA9ICJBWEUiDQo1NTUgUFJJTlQgIkRPTkUiDQo1NTYgR09UTyA1MTANCjU2MCBJRiBBJCA9ICJUQUtFIE1FREFMTElPTiIgVEhFTiBJQyQgPSAiTUVEQUxMSU9OIiBFTFNFIEdPVE8gNTY1DQo1NjEgUFJJTlQgIkRPTkUiDQo1NjMgR09UTyA1MTANCjU2NSBJRiBBJCA9ICJUQUtFIEFYRSIgVEhFTiBJRSQgPSAiQVhFIiBFTFNFIEdPVE8gNTcwDQo1NjYgUFJJTlQgIkRPTkUiDQo1NjkgR09UTyA1MTANCjU3MCBJRiBBJCA9ICJUQUtFIE1BQ0UiIFRIRU4gSUQkID0gIk1BQ0UiIEVMU0UgR09UTyA1OTgNCjU4MCBQUklOVCAiRE9ORSINCjU5MCBHT1RPIDUxMA0KNTk4IFBSSU5UICJUUlkgQUdBSU4iDQo1OTkgR09UTyA1MTANCjYwMCBQUklOVCAiUklWRVIgUk9PTSINCjYwMiBQUklOVCAiQSBRVUlFVCBOT1JUSC1TT1VUSCBSSVZFUiBGTE9XUyBUTyBUSEUgV0VTVCBPRiBZT1UuICBUSEVSRSBBUkUgRVhJVFMgT04gVEhFICAgICBPVEhFUiBUSFJFRSBTSURFUyBPRiBUSEUgUk9PTS4gIEEgV0FSTSBCUkVFWkUgSVMgQ09NTUlORyBGUk9NIFRIRSBFQVNULiAgICINCjYwNCBJRiBJRkYkID0gIkNBTlRFRU4iIFRIRU4gR09UTyA2MTANCjYwNiBJRiBJRkYkID0gIkNBTlRFRU4gQU5EIFdBVEVSIiBUSEVOIEdPVE8gNjEwDQo2MDcgUFJJTlQgIlRIRVJFIElTIEFOIEVNUFRZIENBTlRFRU4gT04gVEhFIEdST1VORCINCjYxMCBHT1NVQiAyNTAwMA0KNjIwIElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gODAwDQo2MjUgSUYgQSQgPSAiRUFTVCIgVEhFTiBHT1RPIDkwMA0KNjMwIElGIEEkID0gIlNPVVRIIiBUSEVOIEdPVE8gNTAwDQo2MzUgSUYgUklHSFQkKEEkLCA0KSA9ICJGSVNIIiBUSEVOIFBSSU5UICJZT1UgQ0FOJ1QgR08gRklTSElORyBIRVJFISINCjY0MCBJRiBBJCA8PiAiV0VTVCIgVEhFTiBHT1RPIDY1MA0KNjQ1IElGIElJSSQgPD4gIkFJUiBUQU5LUyIgVEhFTiBQUklOVCAiWU9VIENBTidUIEdPIFRIQVQgV0FZLiINCjY0NyBJRiBJSUkkID0gIkFJUiBUQU5LUyIgVEhFTiBHT1RPIDEwMDANCjY1MCBJRiBBJCA9ICJLSUxMIFNFTEYiIFRIRU4gR09UTyAxMDEwMA0KNjU1IElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA2MDANCjY2MCBJRiBBJCA8PiAiVEFLRSBDQU5URUVOIiBUSEVOIEdPVE8gNjcwDQo2NjUgSUZGJCA9ICJDQU5URUVOIg0KNjY3IFBSSU5UICJET05FIg0KNjY4IEdPVE8gNjEwDQo2NzAgSUYgQSQgPD4gIkZJTEwgQ0FOVEVFTiIgVEhFTiBHT1RPIDY5OA0KNjc1IElGRiQgPSAiQ0FOVEVFTiBBTkQgV0FURVIiDQo2NzcgUFJJTlQgIkRPTkUiOiBHT1RPIDYxMA0KNjk4IFBSSU5UICJUUlkgQUdBSU4iDQo2OTkgR09UTyA2MTANCjcwMCBQUklOVCAiR0xBU1MgUk9PTSINCjcwMiBQUklOVCAiVEhFIEZMT09SIElTIE1BREUgTUFERSBPRiBBIFRSQU5TUEFSRU5UIFNVQlNUQU5DRS4gIFRIRVJFIElTIEFOIEVYSVQgSU4gVE8gVEhFICBFQVNULiAgWU9VIFNFRSBBIENSWVNUQUwgU1RBSVJDQVNFIExFQURJTkcgRE9XTi4gICI7DQo3MDQgSUYgSUQkIDw+ICJBWEUiIFRIRU4gUFJJTlQgIlRIRVJFIEEgTUVOQUNFSU5HIFRST0xMIExVUktTIg0KNzEwIEdPU1VCIDI1MDAwDQo3MTUgUFJJTlQNCjcyMCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gNTAwDQo3MzAgSUYgQSQgPSAiRE9XTiIgVEhFTiBHT1RPIDExMDANCjczNSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNzAwDQo3NDAgSUYgQSQgPSAiS0lMTCBTRUxGIiBUSEVOIEdPVE8gMTAxMDANCjc5OCBQUklOVCAiVFJZIEFHQUlOIg0KNzk5IEdPVE8gNzEwDQo4MDAgUFJJTlQgIkJBTkRJVCBST09NIg0KODAxIFBSSU5UICJUSEUgRVhJVCBJUyBUTyBUSEUgU09VVEguIg0KODAyIElGIEJBTkRJVCA9IDAgVEhFTiBQUklOVCAiVEhFUkUgSVMgQSBCQU5ESVQgSU4gVEhFIFJPT00iDQo4MTAgR09TVUIgMjUwMDANCjgyMCBJRiBBJCA9ICJTT1VUSCIgVEhFTiBHT1RPIDYwMA0KODI1IElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA4MDANCjgzMCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gMTIwMA0KODQwIElGIEEkID0gIktJTEwgU0VMRiIgVEhFTiBHT1RPIDEwMTAwDQo4NTUgUFJJTlQgIlRIRSBCQU5ESVQgVkFOSVNIRVMgSU4gQSBDTE9VRCBPRiBTTU9LRS4iDQo4OTggUFJJTlQgIlRSWSBBR0FJTiINCjg5OSBHT1RPIDgxMA0KOTAwIFBSSU5UICJHUkVFTiBIT1VTRSINCjkwMiBQUklOVCAiVEhFUkUgQVJFIE1BTlkgUE9UVEVEIFBMQU5UUyBJTiBUSElTIFJPT00uICBBTEwgTkVFRCBXQVRFUi4gIFRIRSBFWElUIElTIFRPIFRIRSBXRVNULiINCjkxMCBHT1NVQiAyNTAwMA0KOTIwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyA2MDANCjkyNSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gOTAwDQo5MzAgSUYgQSQgPSAiS0lMTCBTRUxGIiBUSEVOIEdPVE8gMTAxMDANCjk0MCBJRiBBJCA9ICJXQVRFUiBQTEFOVFMiIFRIRU4gR09UTyA5NTANCjk0NSBHT1RPIDk5OA0KOTUwIFBSSU5UICJUSEUgUExBTlRTIEdST1cgVE8gVFJFTUVORE9VUyBQUk9QT1JUSU9OUyBCVVQgVEhFTiBTSFJJVkVMIg0KOTk4IFBSSU5UICJUUlkgQUdBSU4iDQo5OTkgR09UTyA5MTANCjEwMDAgUFJJTlQgIlJJVkVSIEJFRCINCjEwMDUgUFJJTlQgIllPVSBBUkUgQVQgVEhFIEJPVFRPTSBPRiBUSEUgUklWRVIuICBZT1UgQ0FOIEdPIEVBU1QgT1IgTk9SVEguIg0KMTAwNyBJRiBJSiQgPD4gIkRJQU1PTkQgUklORyIgVEhFTiBQUklOVCAiVEhFUkUgSVMgQSBESUFNT05EIFJJTkcgSEVSRSINCjEwMTAgUFJJTlQgIllPVSBBUkUgVU5ERVIgV0FURVIuIg0KMTAyMCBHT1NVQiAyNTAwMA0KMTAzMCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDEzMDANCjEwNDAgSUYgQSQgPSAiRUFTVCIgVEhFTiBHT1RPIDYwMA0KMTA0NSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMTAwMA0KMTA1MCBJRiBBJCA9ICJLSUxMIFNFTEYiIFRIRU4gRU5EDQoxMDYwIElGIEEkID0gIlRBS0UgUklORyIgVEhFTiBJSiQgPSAiRElBTU9ORCBSSU5HIg0KMTA3MCBJRiBBJCA9ICJUQUtFIFJJTkciIFRIRU4gUFJJTlQgIkRPTkUiDQoxMDgwIElGIEEkID0gIlRBS0UgUklORyIgVEhFTiBHT1RPIDEwMTANCjEwOTggUFJJTlQgIlRSWSBBR0FJTiINCjEwOTkgR09UTyAxMDEwDQoxMTAwIFBSSU5UICJUUk9MTCBST09NIg0KMTEwMiBQUklOVCAiVEhFIFRST0xMIERJU0FQRUFSUyBJTlRPIEFOIFVOU0VFTiBQQVNTQUdFLiAgWU9VIEFSRSBJTiBBIFNNQUxMIFJPT00gV0lUSCBFWElUUyBUTyBUSEUgRUFTVCBBTkQgVEhFIFdFU1QuICBUSEVSRSBJUyBBIEdMQVNTIFNUQUlSQ0FTRSBMRUFESU5HIFVQLiAgQklHIFNDUkFUQ0hFU0FORCBCTE9PRCBTVEFJTlMgQ09WRVIgVEhFIFdBTExTLiINCjExMTAgR09TVUIgMjUwMDANCjExMjAgSUYgQSQgPSAiVVAiIFRIRU4gR09UTyA3MDANCjExMjUgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDExMDANCjExMzAgSUYgQSQgPSAiRUFTVCIgVEhFTiBHT1RPIDE0MDANCjExNDAgSUYgQSQgPSAiV0VTVCIgVEhFTiBHT1RPIDE1MDANCjExOTggUFJJTlQgIlRSWSBBR0FJTiINCjExOTkgR09UTyAxMTEwDQoxMjAwIFBSSU5UICJUUk9QSFkgUk9PTSINCjEyMDQgUFJJTlQgIllPVSBBUkUgSU4gQSBISURERU4gUk9PTSBXSVRIIFRSRUFTVVJFUyBQSUxFRCBUTyBUSEUgQ0lFTElORy4gIFVQT04gQ0xPU0VSICAgICAgRVhBTUlOQVRJT04gWU9VIFJFQUxJWkUgQUxMIE9GIFRIRSBUUkVBU1VSRUQgSEFWRSBUUkFQUyBIT09LRUQgVE8gVEhFTS4iDQoxMjA5IElGIElIJCA8PiAiU1dPUkQiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEFOIEVMVklOIFNXT1JEIEhFUkUgVEhBVCBJUyBOT1QgSE9PS0VEIFVQIFRPIEEgVFJBUC4iDQoxMjEwIEdPU1VCIDI1MDAwDQoxMjIwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyA4MDANCjEyMjUgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDEyMDANCjEyMzAgSUYgQSQgPSAiS0lMTCBTRUxGIiBUSEVOIENPTE9SIDIxIEVMU0UgR09UTyAxMjQwDQoxMjMzIFBSSU5UICJZT1UgSEFWRSBKVVNUIEJFRU4gUkUtSU5DQVJOQVRFRCINCjEyMzQgQ09MT1IgMTUNCjEyMzUgR09UTyAxMzEwDQoxMjQwIElGIEEkID0gIlRBS0UgU1dPUkQiIFRIRU4gUFJJTlQgIkRPTkUiIEVMU0UgR09UTyAxMjUwDQoxMjQzIElIJCA9ICJTV09SRCINCjEyNDQgR09UTyAxMjEwDQoxMjUwIFBSSU5UICJUUlkgQUdBSU4iDQoxMjk5IEdPVE8gMTIxMA0KMTMwMCBQUklOVCAiRFJBSU4iDQoxMzEwIFBSSU5UICJZT1UgQVJFIFVOREVSIFdBVEVSLiINCjEzMTIgUFJJTlQgIlRIRSBFWElUUyBBUkUgVE8gVEhFIFdFU1QgQU5EIFRPIFRIRSBTT1VUSC4gIFlPVSBNVVNUIFNUUlVHR0xFIFRPIFNUT1AgWU9VUlNFTEYgRlJPTSBCRUlORyBEUkFHR0VEIERPV04gSU5UTyBUSEUgRFJBSU4uIg0KMTMxNSBJRiBJSyQgPD4gIlNBRkUiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgU0FGRSBIRVJFLiINCjEzMjAgR09TVUIgMjUwMDANCjEzMzAgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyAxMDAwDQoxMzM1IElGIEEkID0gIkxPT0siIFRIRU4gR09UTyAxMzAwDQoxMzQwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyAxNjAwDQoxMzUwIElGIEEkID0gIktJTEwgU0VMRiIgVEhFTiBQUklOVCAiVEFLRSBBIERFRVAgQlJFQVRIIg0KMTM2MCBJRiBBJCA9ICJUQUtFIEEgREVFUCBCUkVBVEgiIFRIRU4gUFJJTlQgIllPVSBIQVZFIERST1dORUQiDQoxMzcwIElGIEEkID0gIlRBS0UgQSBERUVQIEJSRUFUSCIgVEhFTiBFTkQNCjEzODAgSUYgQSQgPSAiVEFLRSBTQUZFIiBUSEVOIFBSSU5UICJET05FIiBFTFNFIEdPVE8gMTM5OA0KMTM4NSBJSyQgPSAiU0FGRSINCjEzODcgR09UTyAxMzIwDQoxMzk4IFBSSU5UICJUUlkgQUdBSU4iDQoxMzk5IEdPVE8gMTMyMA0KMTQwMCBQUklOVCAiUkFHIFJPT00iDQoxNDAxIFBSSU5UICJUSEVSRSBBUkUgRVhJVFMgVE8gVEhFIE5PUlRIIEFORCBFQVNULiAgWU9VIEhFQVIgQSBGQUlOVCBNVVJNVVIgVE8gVEhFIEVBU1QuIg0KMTQwOSBJRiBJTCQgPD4gIlJBR1MiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgUElMRSBPRiBSQUdTIEhFUkUuIg0KMTQxMCBHT1NVQiAyNTAwMA0KMTQyMCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDExMDANCjE0MzAgSUYgQSQgPSAiRUFTVCIgVEhFTiBHT1RPIDIwMDANCjE0MzUgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDE0MDANCjE0NDAgSUYgQSQgPSAiS0lMTCBTRUxGIiBUSEVOIEdPVE8gMTAxMDANCjE0NTAgSUYgQSQgPSAiVEFLRSBSQUdTIiBUSEVOIFBSSU5UICJET05FIiBFTFNFIEdPVE8gMTQ5OA0KMTQ1NSBJTCQgPSAiUkFHUyI6IElNJCA9ICJTVU5HTEFTU0VTIg0KMTQ2MCBQUklOVCAiU1VQUklaRS4uLiAgIFlPVSBGT1VORCBBIFBBSVIgT0YgU1VOR0xBU1NFUyBJTiBUSEUgUkFHUy4iDQoxNDcwIEdPVE8gMTQxMA0KMTQ5OCBQUklOVCAiVFJZIEFHQUlOIg0KMTQ5OSBHT1RPIDE0MTANCjE1MDAgUFJJTlQgIkJSSUdIVCBST09NIg0KMTUwMSBJRiBJTSQgPD4gIlNVTkdMQVNTRVMiIFRIRU4gUFJJTlQgIlRISVMgUk9PTSBJUyBUT08gQlJJR0hULiIgRUxTRSBHT1RPIDE1MTANCjE1MDIgUFJJTlQNCjE1MDMgR09UTyAxMTAwDQoxNTEwIFBSSU5UICJZT1UgQVJFIElOIEEgUk9PTSBXSVRIIEVYSVRTIFRPIFRIRSBOT1JUSCBBTkQgRUFTVC4gIEEgR1JFRU4gU1RBSVJDQVNFIExFQURTIFVQIg0KMTUxMyBJRiBJTiQgPD4gIlNQSEVSRSIgVEhFTiBQUklOVCAiVEhFUkUgSVMgQSBCUklHSFQgU1BIRVJFIElOIFRIRSBNSURETEUgT0YgVEhFIFJPT00iDQoxNTE1IElGIElZJCA8PiAiR09MRCBTVEFUVUUiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgR09MRCBTVEFUVUUgSEVSRSINCjE1MjAgR09TVUIgMjUwMDANCjE1MjMgSUYgQSQgPSAiVEFLRSBBTEwiIFRIRU4gSVkkID0gIkdPTEQgU1RBVFVFIiBFTFNFIEdPVE8gMTUzMA0KMTUyNSBJTiQgPSAiU1BIRVJFIg0KMTUyNyBQUklOVCAiRE9ORSI6IEdPVE8gMTUyMA0KMTUzMCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gMTEwMA0KMTUzNSBJRiBBJCA9ICJVUCIgVEhFTiBHT1RPIDE3MDANCjE1NDAgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyAxODAwDQoxNTQ1IElGIEEkID0gIkxPT0siIFRIRU4gR09UTyAxNTAwDQoxNTUwIElGIEEkID0gIktJTEwgU0VMRiIgVEhFTiBHT1RPIDI1MDAwDQoxNTYwIElGIEEkID0gIlRBS0UgU1BIRVJFIiBUSEVOIFBSSU5UICJET05FIiBFTFNFIEdPVE8gMTU3MA0KMTU2MyBJTiQgPSAiU1BIRVJFIg0KMTU2NSBHT1RPIDE1MjANCjE1NzAgSUYgQSQgPSAiVEFLRSBTVEFUVUUiIFRIRU4gUFJJTlQgIkRPTkUiIEVMU0UgMTU5OA0KMTU3MiBJWSQgPSAiR09MRCBTVEFUVUUiDQoxNTc1IEdPVE8gMTUyMA0KMTU5OCBQUklOVCAiVFJZIEFHQUlOIg0KMTU5OSBHT1RPIDE1MjANCjE2MDAgUFJJTlQgIlJBUElEIFdBVEVSIg0KMTYxMCBQUklOVCAiWU9VIEFSRSBVTkRFUiBXQVRFUiINCjE2MTUgUFJJTlQgIkhPTFkgUEVSQ0hIRUFEUyBCQVRNQU4hIFRIRSBFWElUUyBBUkUgVE8gVEhFIEVBU1QgQU5EIFdFU1QuIg0KMTYyMCBHT1NVQiAyNTAwMA0KMTYzMCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gMTkwMA0KMTY0MCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gMTMwMA0KMTY0NSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMTYwMA0KMTY1MCBJRiBBJCA9ICJLSUxMIFNFTEYiIFRIRU4gR09UTyAxMDIwMA0KMTY2MCBQUklOVCAiVFJZIEFHQUlOIg0KMTY3MCBHT1RPIDE2MjANCjE3MDAgUFJJTlQgIlBPSU5UTEVTUyBST09NIg0KMTcwMiBQUklOVCAgXw0KIlRISVMgUk9PTSBIQVMgQSBCUklMTElBTlQgUkVEIEZMT09SIFdJVEggVEhSRUUgU1FVQVJFUyBPRiBZRUxMT1cgT04gSVQuICBUSEUgICAgV0FMTFMgQVJFIEdSRVkgQU5EIFBBSU5URUQgT04gVEhFIFNPVVRIIFdBTEwgSVMgQSBQSUNUVVJFIE9GIFRIRSBHUkVBVCBESU1XSVQgICBGTEFUSEVBRC4gIFRIRSBST09NIFNNRUxMUyBMSUtFIFJPU0VTIEFORCBBIEZMT1VSRVNDRU5UIEdSRUVOIFNUQUlSQ0FTRSBMRUFEUyAiDQoxNzA0IElGIENVUCQgPSAiIiBUSEVOIFBSSU5UICJET1dOLiAgVEhFUkUgSVMgQU4gRU1QVFkgQ1VQIEhFUkUgVEhBVCBJUyBCT0xURUQgVE8gVEhFIEZMT09SLiIgRUxTRSBQUklOVCAiRE9XTi4gIFRIRVJFIElTIEEgQ1VQIEhFUkUgRklMTEVEIFdJVEggV0FURVIgQU5EIEEgRE9PUiBUTyBUSEUgV0VTVC4iDQoxNzEwIEdPU1VCIDI1MDAwDQoxNzIwIElGIEEkID0gIkRPV04iIFRIRU4gR09UTyAxNTAwDQoxNzMwIElGIEEkIDw+ICJGSUxMIENVUCIgVEhFTiBHT1RPIDE3NDANCjE3MzIgSUYgSUZGJCA9ICJDQU5URUVOIEFORCBXQVRFUiIgVEhFTiBQUklOVCAiU09SUlksIFdST05HIEtJTkQgT0YgV0FURVIiIEVMU0UgR09UTyAxNzM0DQoxNzMzIEdPVE8gMTcxMA0KMTczNCBJRiBJRkYkID0gIkNBTlRFRU4iIFRIRU4gUFJJTlQgIllPVSBIQVZFIE5PIFdBVEVSIElOIFlPVVIgQ0FOVEVFTiIgRUxTRSBHT1RPIDE3MzYNCjE3MzUgR09UTyAxNzEwDQoxNzM2IElGIElGRiQgPSAiIiBUSEVOIFBSSU5UICJBIE5PQkxFIElERUE6SE9XIERPIFlPVSBJTlRFTkQgVE8gRE8gVEhBVD8iIEVMU0UgR09UTyAxNzM4DQoxNzM3IEdPVE8gMTcxMA0KMTczOCBJRkYkID0gIkNBTlRFRU4iOiBDVVAkID0gIkNVUCBBTkQgV0FURVJGQUxMIFdBVEVSIjogUFJJTlQgIkEgRE9PUiBPUEVOUyBUTyBUSEUgV0VTVCI6IFdFU1QgPSAxDQoxNzQwIElGIEEkID0gIkVBU1QiIFRIRU4gUFJJTlQgIkNISU5BIChKVVNUIEtJRERJTkcpIg0KMTc0MiBJRiBBJCA9ICJXSVRIIFNQSVQiIFRIRU4gUFJJTlQgIkZPUkdFVCBJVCEgIEJFU0lERVMsIFRIQVQnUyBBIE5BU1RZIEhBQklUIFlPVSdWRSBHT1QgVEhFUkUhIg0KMTc0NSBJRiBBJCA9ICJXRVNUIiBUSEVOIFdMS0VKQiA9IDE6IElGIFdFU1QgPSAxIFRIRU4gR09UTyA2MDAwDQoxNzUwIElGIEEkID0gIk5PUlRIIiBUSEVOIFBSSU5UICJIRSBXQVMgQSBIRVJPIiBFTFNFIEdPVE8gMTc1NQ0KMTc1MSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMTcwMA0KMTc1NSBJRiBBJCA8PiAiQkxVRSIgVEhFTiBHT1RPIDE3OTgNCjE3NjAgQ09MT1IgMTUsIDExOiBGT1IgWCA9IDEgVE8gMTAwMDogTkVYVCBYOiBDT0xPUiAxNSwgMA0KMTc5OCBQUklOVCAiQVRURU5USU9OIEstTUFSVCBTSE9QUEVSUyI6IFBSSU5UICJXSEFUJ1MgVEhBVCBTVVBQT1NFRCBUTyBNRUFOPyINCjE3OTkgR09UTyAxNzEwDQoxODAwIFBSSU5UICJXSElURSBST09NIg0KMTgwMSBQUklOVCAiWU9VIEFSRSBJTiBBIFdISVRFIFJPT00gV0lUSCBQUkVUVFkgQkxBQ0sgQ1VSVElBTlMgT1ZFUiBUSEUgV0lORE9XLiAgT1VUIFNJREUgICBUSEUgV0lORE9XIElTIEEgVFJBSU4gU1RBVElPTi4gIFRIRVJFIElTIEEgTEFSR0UgQ09OVFJPTCBQQU5FTCBJTiBUSEUgTUlERExFIE9GIFRIRSBST09NIFdISUNIIEFQRUFSUyBUTyBCRSBTRUNVUkxZIEJPTFRFRCBUTyBUSEUgRkxPT1IuIg0KMTgwMiBQUklOVCAiVEhFUkUgSVMgQSBCVUNLRVQgVFlQRSBQQVJUIE9OIFRIRSBNQUNISU5FLiBJVCBJUyBMQUJFTEVEICAgICAgICAgICAgICAgICAgICAgICAnSU5GSU5JVEUgSU1QUk9CQUJJTElUWSBEUklWRScuICBUSEVSRSBBUkUgRVhJVFMgVE8gVEhFIFdFU1QgQU5EIFNPVVRILiI6IElGIElURUEkIDw+ICJDVVAgT0YgVEVBIiBUSEVOIFBSSU5UICJUSEVSRSBJUyBBIENVUCBPRiBURUEgSEVSRS4iDQoxODAzIElGIElPJCA8PiAiU0hFRVQgT0YgTVVTSUMiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgU0hFRVQgT0YgTVVTSUMgSEVSRS4iDQoxODEwIEdPU1VCIDI1MDAwDQoxODIwIElGIEEkID0gIlNPVVRIIiBUSEVOIEdPVE8gMTUwMA0KMTgzMCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gMjEwMA0KMTgzNSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMTgwMA0KMTg0MCBJRiBBJCA9ICJUQUtFIFRFQSIgVEhFTiBJVEVBJCA9ICJDVVAgT0YgVEVBIg0KMTg0MiBJRiBBJCA9ICJQT1VSIFRFQSBJTlRPIEJVQ0tFVCIgVEhFTiBHT1RPIDIyMDEwDQoxODQzIExFVCBEQVZFID0gREFWRSArIDENCjE4NjUgUkVNIEJPQiBXQVMgSEVSRQ0KMTg4MCBJRiBBJCA9ICJUQUtFIFNIRUVUIE9GIE1VU0lDIiBUSEVOIElPJCA9ICJTSEVFVCBPRiBNVVNJQyIgRUxTRSBHT1RPIDE4OTANCjE4ODIgUFJJTlQgIkRPTkUiDQoxODg1IEdPVE8gMTgxMA0KMTg5MCBJRiBBJCA9ICJUQUtFIFRFQSIgVEhFTiBJVEVBJCA9ICJDVVAgT0YgVEVBIjogUFJJTlQgIkRPTkUiOiBQUklOVCA6IEdPVE8gMTgxMA0KMTg5NSBHT1RPIDE4MTANCjE4OTggUFJJTlQgIkkgVEhJTksgTk9UIg0KMTkwMCBQUklOVCAiU0hPUkUiDQoxOTAxIFBSSU5UICJZT1UgQVJFIE9OIEEgQkVBQ0guICBFWElUUyBBUkUgVE8gVEhFIFdFU1QgT1IgVVAgQSBMQURERVIuICBUSEUgUklWRVIgSVMgVE8gVEhFIEVBU1QuIg0KMTkxMCBHT1NVQiAyNTAwMA0KMTkxNSBJRiBJSUkkIDw+ICJBSVIgVEFOS1MiIFRIRU4gR09UTyAxOTMwDQoxOTIwIElGIEEkID0gIkVBU1QiIFRIRU4gR09UTyAxNjAwDQoxOTMwIElGIEEkID0gIlVQIiBUSEVOIEdPVE8gMjIwMA0KMTkzNSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMTkwMA0KMTk0MCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gMjMwMA0KMTk5OCBQUklOVCAiVFJZIEFHQUlOIg0KMTk5OSBHT1RPIDE5MTANCjIwMDAgUFJJTlQgIldISVNQRVIgUk9PTSINCjIwMDEgUFJJTlQgIklOIFRISVMgUk9PTSBUSElTIFJPT00sIFRIT1VTQU5EUyBPRiBWT0lDRVMgV0hJU1BFUiBUTyBZT1UuICBUSEUgRVhJVFMgQVJFIFRPICAgVEhFIFdFU1QsIE5PUlRILCBBTkQgTk9SVEhFQVNULiINCjIwMTAgR09TVUIgMjUwMDANCjIwMjAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDIwMDANCjIwMzAgSUYgQSQgPSAiV0VTVCIgVEhFTiBHT1RPIDE0MDANCjIwNDAgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyAyODAwDQoyMDUwIElGIEEkID0gIk5PUlRIRUFTVCIgVEhFTiBHT1RPIDI5MDANCjIwNjAgSUYgQSQgPSAiTElTVEVOIiBUSEVOIFBSSU5UICJZT1UgSEVBUiBBIExJVFRMRSBQT0VNOiAgICAgV0hFTiBMT1NUIFdJVEhJTiBUSEUgSEFMTFMgT0YgR0xBU1MsIERPTidUIFdBVkUgVEhFIFdBTkQgLSBZT1UnTEwgUk9BU1QgWU9VUi4uLlJVTVAhIg0KMjA5OCBQUklOVCAiVFJZIEFHQUlOIg0KMjA5OSBHT1RPIDIwMTANCjIxMDAgUFJJTlQgIldJWkFSRCBST09NIg0KMjEwMSBQUklOVCAiVEhFIFJPT00gSVMgRklMTEVEIFdJVEggTUlTVC4gIFlPVSBDQU4gR08gRUFTVCBPUiBXRVNULiAgVE8gVEhFIFNPVVRIIElTIEEgICAgICBNQUdJQ0FMIEJPWCBZT1UgQ0FOIEdFVCBJTlRPLiINCjIxMTAgR09TVUIgMjUwMDANCjIxMjAgSUYgQSQgPSAiRUFTVCIgVEhFTiBHT1RPIDE4MDANCjIxMjUgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDIxMDANCjIxMzAgSUYgQSQgPSAiVVAiIFRIRU4gR09UTyAyNDAwDQoyMTQwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyAyNTAwDQoyMTUwIElGIEEkID0gIlNPVVRIIiBUSEVOIEdPVE8gMjYwMA0KMjE2MCBJRiBBJCA9ICJHRVQgSU5UTyBUSEUgQk9YIiBUSEVOIEdPVE8gMjYwMA0KMjE2NSBJRiBBJCA9ICJJTiIgVEhFTiBHT1RPIDI2MDANCjIxNjcgSUYgQSQgPSAiR0VUIElOIiBUSEVOIEdPVE8gMjYwMA0KMjE3MCBJRiBBJCA9ICJJTlRPIFRIRSBCT1giIFRIRU4gR09UTyAyNjAwDQoyMTgwIElGIEEkID0gIklOIEJPWCIgVEhFTiBHT1RPIDI2MDANCjIxOTAgSUYgQSQgPSAiR0VUIElOIEJPWCIgVEhFTiBHT1RPIDI2MDANCjIxOTUgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDIxMDANCjIxOTggUFJJTlQgIlRSWSBBR0FJTiINCjIxOTkgR09UTyAyMTEwDQoyMjAwIFBSSU5UICJST09GIE9GIEhPVVNFIg0KMjIwMSBQUklOVCAiVVAsIERPV04sIE9SIFdFU1Q/Ig0KMjIwMiBJRiBJUCQgPD4gIkxJR0hUTklORyBST0QiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgTElHSFROSU5HIFJPRCBJTiBUSEUgUk9PTS4iDQoyMjEwIEdPU1VCIDI1MDAwDQoyMjIwIElGIEEkID0gIlVQIiBUSEVOIEdPVE8gMjQwMA0KMjIzMCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gMjUwMA0KMjI0MCBJRiBBJCA9ICJET1dOIiBUSEVOIEdPVE8gMTkwMA0KMjI1MCBJRiBBJCA9ICJUQUtFIFJPRCIgVEhFTiBQUklOVCAiRE9ORSI6IFBSSU5UIDogSVAkID0gIkxJR0hUTklORyBST0QiOiBHT1RPIDIyMTANCjIyNjAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDIyMDANCjIyOTggUFJJTlQgIllPVSBDQU4nVCBETyBUSEFUIEhFQVIiDQoyMjk5IEdPVE8gMjIxMA0KMjMwMCBQUklOVCAiQUxJQ0UgUk9PTSINCjIzMDEgUFJJTlQgIllPVSBBUkUgSU4gQSBST09NIFdJVEggQU4gRVhJVCBUTyBUSEUgRUFTVCBBTkQgQSBNSVJST1IgT04gVEhFIFdFU1QgV0FMTC4iDQoyMzEwIEdPU1VCIDI1MDAwDQoyMzIwIElGIEEkID0gIkVBU1QiIFRIRU4gR09UTyAxOTAwDQoyMzMwIElGIEEkID0gIldFU1QiIFRIRU4gUFJJTlQgIllPVSBIQVZFIEdPTkUgVEhST1VHSCBUSEUgTUlSUk9SISI6IEdPVE8gMzAwMA0KMjM0MCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMjMwMA0KMjM5OCBQUklOVCAiWU9VIENBTidUIERPIFRIQVQgSEVSRSINCjIzOTkgR09UTyAyMzEwDQoyNDAwIFBSSU5UICJMSUdIVE5JTkcgUk9PTSINCjI0MDEgUFJJTlQgIlRISVMgSVMgQSBMQVJHRSBST09NLiAgRVhJVFMgQVJFIE5PUlRIIEFORCBET1dOIg0KMjQwMiBJRiBJUCQgPD4gIkxJR0hUTklORyBST0QiIFRIRU4gUFJJTlQgIkJPTFRTIE9GIEVMRUNUUklDSVRZIENSSVNTLUNST1NTIFRIRSBST09NLiAgWU9VIEFSRSBMSUtFTFkgVE8gQkUgU1RSVUNLIEJZICAgICAgTElHSFROSU5HLiINCjI0MDMgSUYgSVAkID0gIkxJR0hUTklORyBST0QiIFRIRU4gUllUVUZKTlJFVSQgPSAiTFc7RUtGSiI6IElGIElSJCA8PiAiTUFHSUMgV0FORCIgVEhFTiBQUklOVCAiVEhFUkUgSVMgQSBXQU5EIEhFUkUuIg0KMjQwNCBJRiBYID0gMSBUSEVOIFBSSU5UICJZT1UgSEFWRSBCRUVOIFNUUlVDSyBCWSBMSUdIVE5JTkchIjogRU5EDQoyNDEwIEdPU1VCIDI1MDAwDQoyNDIwIElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gMjIwMA0KMjQzMCBJRiBBJCA9ICJET1dOIiBUSEVOIEdPVE8gMjEwMA0KMjQ0MCBJRiBBJCA9ICJUQUtFIFdBTkQiIFRIRU4gUFJJTlQgIkRPTkUiOiBQUklOVCA6IElSJCA9ICJNQUdJQyBXQU5EIjogR09UTyAyNDEwDQoyNDUwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyAyNDAwDQoyNDk2IElGIElQJCA9ICJMSUdIVE5JTkcgUk9EIiBUSEVOIFggPSAwDQoyNDk3IElGIElQJCA8PiAiTElHSFROSU5HIFJPRCIgVEhFTiBYID0gMQ0KMjQ5OCBQUklOVCAiWU9VIENBTidUIERPIFRIQVQgSEVSRSEiDQoyNDk5IEdPVE8gMjQxMA0KMjUwMCBQUklOVCAiTk9SVEgvU09VVEggUEFTU0FHRSINCjI1MDEgUFJJTlQgIlRIRVJFIElTIEFOIEVYSVQgVE8gVEhFIFdFU1QgQUxTTy4iDQoyNTEwIEdPU1VCIDI1MDAwDQoyNTIwIElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gMjIwMA0KMjU0MCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gNDcwMA0KMjU1MCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMjUwMA0KMjU2MCBJRiBBJCA9ICJTT1VUSCIgVEhFTiBHT1RPIDIxMDANCjI1OTggUFJJTlQgIllPVSBDQU4nVCBETyBUSEFUIEhFUkUiDQoyNTk5IEdPVE8gMjUxMA0KMjYwMCBQUklOVCAiSU4tQS1CT1giDQoyNjEwIEdPU1VCIDI1MDAwDQoyNjIwIElGIEEkID0gIiIgVEhFTiBHT1RPIDI3MDANCjI2MjUgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDI2MDANCjI2MzAgSUYgQSQgPSAiT1VUIiBUSEVOIEdPVE8gMjcwMA0KMjY0MCBJRiBBJCA9ICJHRVQgT1VUIiBUSEVOIEdPVE8gMjcwMA0KMjY1MCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDM4MDANCjI2NjAgSUYgQSQgPSAiR0VUIE9VVCBPRiBUSEUgQk9YIiBUSEVOIEdPVE8gMjcwMA0KMjY3MCBJRiBBJCA9ICJPVVQgT0YgQk9YIiBUSEVOIEdPVE8gMjcwMA0KMjY4MCBJRiBBJCA9ICJPVVQgT0YgVEhFIEJPWCIgVEhFTiBHT1RPIDI3MDANCjI2OTAgSUYgQSQgPSAiR0VUIE9VVCBPRiBUSEUgQk9YIiBUSEVOIEdPVE8gMjcwMA0KMjY5OCBQUklOVCAiV0hZIERPIFlPVSBXQU5UIFRPIERPIFRIQVQ/ICBZT1VSIElOIEEgQk9YICINCjI2OTkgR09UTyAyNjAwDQoyNzAwIFBSSU5UICJNQUdJQ0lBTidTIEJPT0sgUk9PTSINCjI3MDEgUFJJTlQgIkVYSVRTIEFSRSBUTyBUSEUgV0VTVCBBTkQgRE9XTi4gIFRIRVJFIElTIEEgQk9YIEhFUkUgVEhBVCBZT1UgQ0FOIEdFVCBJTlRPLiINCjI3MDIgSUYgSVNUJCA8PiAiTUFHSUMgQk9PSyIgVEhFTiBQUklOVCAiVEhFUkUgSVMgQSBNQUdJQyBCT09LIEhFUkUiDQoyNzEwIEdPU1VCIDI1MDAwDQoyNzIwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyAzMTAwDQoyNzMwIElGIEEkID0gIkRPV04iIFRIRU4gR09UTyA1ODAwDQoyNzQwIElGIEEkID0gIklOIiBUSEVOIEdPVE8gMzQwMA0KMjc1MCBJRiBBJCA9ICJHRVQgSU5UTyBUSEUgQk9YIiBUSEVOIEdPVE8gMzQwMA0KMjc2MCBJRiBBJCA9ICJHRVQgSU4gQk9YIiBUSEVOIEdPVE8gMzQwMA0KMjc4MCBJRiBBJCA9ICJUQUtFIEJPT0siIFRIRU4gS0xIQkIkID0gIkxKSyI6IElGIElSJCA8PiAiTUFHSUMgV0FORCIgVEhFTiBQUklOVCAiWU9VIENBTidUIFRBS0UgVEhFIEJPT0sgQkVDQVVTRSBPRiBBIE1BR0lDQUwgRk9SQ0UgRklFTEQgUFJPVEVDVElORyBJVCEiOiBHT1RPIDI3OTANCjI3ODEgSUYgQSQgPSAiVEFLRSBCT09LIiBUSEVOIFBSSU5UICJET05FIjogSVNUJCA9ICJNQUdJQyBCT09LIjogUFJJTlQgOiBHT1RPIDI3MTANCjI3OTAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDI3MDANCjI3OTggUFJJTlQgIllPVSBDQU4nVCBETyBUSEFUIFlFVC4iDQoyNzk5IEdPVE8gMjcxMA0KMjgwMCBQUklOVCAiTUFaRSINCjI4MDUgUFJJTlQgIk5PUlRIIE9SIFNPVVRIIg0KMjgxMCBHT1NVQiAyNTAwMA0KMjgyMCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDMzMDANCjI4MzAgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyAyMDAwDQoyODQwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyAyODAwDQoyODk4IFBSSU5UICJZT1UgQ0FOJ1QgRE8gVEhBVCBIRVJFIg0KMjg5OSBHT1RPIDI4MTANCjI5MDAgUFJJTlQgIk1BWkUiDQoyOTA1IFBSSU5UICJFQVNUIE9SIFNPVVRIIg0KMjkxMCBHT1NVQiAyNTAwMA0KMjkyMCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gMzUwMA0KMjkzMCBJRiBBJCA9ICJTT1VUSCIgVEhFTiBHT1RPIDM5MDANCjI5NDAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDI5MDANCjI5OTggUFJJTlQgIllPVSBDQU4nVCBETyBUSEFUIEhFUkUiDQoyOTk5IEdPVE8gMjkwMA0KMzAwMCBQUklOVCAiQUxJQ0UgUk9PTSINCjMwMDUgUFJJTlQgIllPVSBBUkUgSU4gQSBST09NIFdJVEggQU4gRVhJVCBUTyBUSEUgV0VTVCBBTkQgQSBNSVJST1IgT04gVEhFIEVBU1QgV0FMTC4iDQozMDEwIEdPU1VCIDI1MDAwDQozMDIwIElGIEEkID0gIkVBU1QiIFRIRU4gUFJJTlQgIllPVSBIQVZFIEdPTkUgVEhST1VHSCBUSEUgTUlSUk9SISI6IEdPVE8gMjMwMA0KMzAzMCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gNDUwMA0KMzA0MCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMzAwMA0KMzA5OCBQUklOVCAiT2ssIFlPVSAiOyBMRUZUJChBJCwgNCk7ICIuLi4gV0FJVCBBIFNFQ09ORCBZT1UgQ0FOJ1QgRE8gVEhBVC4iDQozMDk5IEdPVE8gMzAxMA0KMzEwMCBQUklOVCAiQUlSIFJPT00iDQozMTAxIFBSSU5UICJZT1UgQVJFIElOIEEgU01BTEwgUk9PTSBXSVRIIEVYSVRTIFRPIFRIRSBFQVNUIEFORCBOT1JUSFdFU1QiDQozMTAyIElGIElJSSQgPD4gIkFJUiBUQU5LUyIgVEhFTiBQUklOVCAiVEhFUkUgQVJFIEFJUiBUQU5LUyBIRVJFIg0KMzExMCBHT1NVQiAyNTAwMA0KMzEyMCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gMjcwMA0KMzEzMCBJRiBBJCA9ICJOT1JUSFdFU1QiIFRIRU4gR09UTyA0OTAwDQozMTQwIElGIExFRlQkKEEkLCA0KSA9ICJUQUtFIiBUSEVOIFogPSAxOiBJRiBSSUdIVCQoQSQsIDUpID0gIlRBTktTIiBUSEVOIFBSSU5UICJET05FIjogUFJJTlQgOiBJSUkkID0gIkFJUiBUQU5LUyINCjMxNTAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDMxMDANCjMxOTggUFJJTlQgIlRSWSBBR0FJTiINCjMxOTkgR09UTyAzMTEwDQozMzAwIFBSSU5UICJNQVpFIg0KMzMwNSBQUklOVCAiRUFTVCwgV0VTVCwgT1IgTk9SVEg/Ig0KMzMxMCBHT1NVQiAyNTAwMA0KMzMyMCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gMzUwMA0KMzMzMCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gMjgwMA0KMzM0MCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDM2MDANCjMzNTAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDMzMDANCjMzOTggUFJJTlQgIllPVSBDQU4nVCBETyBUSEFUIEhFUkUiDQozMzk5IEdPVE8gMzMxMA0KMzQwMCBQUklOVCAiSU4tQS1CT1giDQozNDEwIEdPU1VCIDI1MDAwDQozNDIwIElGIEEkID0gIk9VVCIgVEhFTiBHT1RPIDIxMDANCjM0MzAgSUYgQSQgPSAiR0VUIE9VVCIgR09UTyAyMTAwDQozNDQwIElGIEEkID0gIkVYSVQiIFRIRU4gR09UTyAyMTAwDQozNDUwIElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gMjEwMA0KMzQ2MCBJRiBBJCA9ICJHRVQgT1VUIE9GIEJPWCIgVEhFTiBHT1RPIDIxMDANCjM0OTggUFJJTlQgIldIWSBETyBZT1UgV0FOVCBETyBUSEFULiBZT1VSIElOIEEgQk9YIg0KMzQ5OSBHT1RPIDM0MTANCjM1MDAgUFJJTlQgIk1BWkUiDQozNTA1IFBSSU5UICJXRVNULCBTT1VUSCwgT1IgRUFTVD8iDQozNTEwIEdPU1VCIDI1MDAwDQozNTIwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyAzMzAwDQozNTMwIElGIEEkID0gIlNPVVRIIiBUSEVOIEdPVE8gMjkwMA0KMzU0MCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gMzcwMA0KMzU1MCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMzUwMA0KMzU5OCBQUklOVCAiVFJZIEFHQUlOIg0KMzU5OSBHT1RPIDM1MTANCjM2MDAgUFJJTlQgIlNNQUxMIFJPT00gSU4gVEhFIE1BWkUiDQozNjA1IFBSSU5UICJOT1JUSCwgV0VTVCwgT1IgRUFTVD8iDQozNjA2IElGIElTJCA8PiAiU1RJQ0tZIFNVQlNUQU5DRSIgVEhFTiBTS0xGSUhWJCA9ICJTQUtHQiI6IElGIElTJCA8PiAiSE9ORVkiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgU1RJQ0tZIFNVQlRBTkNFIEhFUkUuIg0KMzYxMCBHT1NVQiAyNTAwMA0KMzYyMCBJRiBMRUZUJChBJCwgNCkgPSAiVEFLRSIgVEhFTiBQUklOVCAiRE9ORSI6IFBSSU5UIDogSVMkID0gIlNUSUNLWSBTVUJTVEFOQ0UiOiBHT1RPIDM2MTANCjM2MzAgSUYgQSQgPSAiRUFTVCIgVEhFTiBHT1RPIDM3MDANCjM2NDAgSUYgQSQgPSAiV0VTVCIgVEhFTiBHT1RPIDM1MDANCjM2NTAgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyAzODAwDQozNjYwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyAzNjAwDQozNjk4IFBSSU5UICJZT1UgQ0FOJ1QgRE8gVEhBVC4oRE9SSykiDQozNjk5IEdPVE8gMzYxMA0KMzcwMCBQUklOVCAiTUFaRSINCjM3MDUgUFJJTlQgIk5PUlRILCBTT1VUSCwgRUFTVCwgT1IgV0VTVD8iDQozNzEwIEdPU1VCIDI1MDAwDQozNzIwIElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gMzYwMA0KMzcyNSBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gMzcwMA0KMzczMCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gMzUwMA0KMzc0MCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gNDIwMA0KMzc1MCBJRiBBJCA9ICJTT1VUSCIgVEhFTiBHT1RPIDQzMDANCjM3OTggUFJJTlQgIlRSWSBBR0FJTiINCjM3OTkgR09UTyAzNzEwDQozODAwIFBSSU5UICJERUFEIEVORCINCjM4MDUgUFJJTlQgIllPVSBDQU4gR08gU09VVEguIChISU5UOiBIRSBXQVMgQSBIRVJPKSINCjM4MTAgR09TVUIgMjUwMDANCjM4MjAgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyAzNjAwDQozODMwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyAzODAwDQozODQwIElGIEEkID0gIk5PUlRIIiBUSEVOIFBSSU5UICJZT1UgU1RVTUJMRSBVUE9OIEEgU0VDUkVUIFBBU1NBR0UuIjogR09UTyA2MTAwDQozODk4IFBSSU5UICJUUlkgQUdBSU4iDQozODk5IEdPVE8gMzgxMA0KMzkwMCBQUklOVCAiQkVFIFJPT00iDQozOTAxIFBSSU5UICJUSElTIElTIEEgU01BTEwgUk9PTS4gIElOIFRIRSBNSURETEUgT0YgVEhFIFJPT00gSVMgQSBCRUUgSElWRS4gIFRIRSBFWElUUyBBUkUgIFRPIFRIRSBFQVNULCBOT1JUSCwgQU5EIFNPVVRIV0VTVC4gIFRIRSBST09NIElTIEZJTExFRCBXSVRIIEJFRVMuIg0KMzkwMiBJRiBJUyQgPD4gIiIgVEhFTiBQUklOVCAiVEhFIEJFRVMgQVJFIEZMT0NLSU5HIFRPIFlPVVIgSE9ORVkuIjogSUYgSVQkIDw+ICJHT0xEIENPSU4iIFRIRU4gUFJJTlQgIiAgVEhFUkUgSVMgQSBDT0lOIEhFUkUuIjogSVMkID0gIkhPTkVZIg0KMzkxMCBHT1NVQiAyNTAwMA0KMzkyMCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDI5MDANCjM5MzAgSUYgQSQgPSAiU09VVEhXRVNUIiBUSEVOIEdPVE8gNDEwMA0KMzk0MCBJRiBBJCA9ICJFQVNUIiBUSEVOIExTS0okID0gIkxBU0hEViI6IElGIElTJCA9ICJIT05FWSIgVEhFTiBHT1RPIDQwMDAgRUxTRSBQUklOVCAiVEhFIEJFRVMgQkxPQ0sgWU9VUiBQQVRILiINCjM5NTAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDM5MDANCjM5NjAgSUYgQSQgPSAiVEFLRSBDT0lOIiBUSEVOIElUJCA9ICJHT0xEIENPSU4iOiBQUklOVCAiVEFLRU4iOiBQUklOVCA6IEdPVE8gMzkxMA0KMzk5OCBQUklOVCAiVFJZIFNPTUVUSElORyBORVciDQozOTk5IEdPVE8gMzkxMA0KNDAwMCBQUklOVCAiTUVSQ0hBTlQgUk9PTSINCjQwMDEgUFJJTlQgIkEgU01BTEwgUk9PTSBXSVRIIEZPVVIgV0FMTFMuICBUSEVSRSBJUyBBIE1FUkNIQU5UIEhFUkUuICBZT1UgQ0FOIEdPIFdFU1QuIg0KNDAwMiBJRiBJWiQgPSAiS0VZIiBUSEVOIEdPVE8gNDAxMA0KNDAwMyBQUklOVCAiVEhFIE1FUkNIQU5UIFdJTEwgR0lWRSBZT1UgQSBLRVkgSUYgWU9VIEdJVkUgSElNIFlPVVIgVkFMVUFCTEVTLiINCjQwMDQgUFJJTlQgIlRPIEdJVkUgU1RVRkYgVE8gVEhFIE1FUkNIQU5UIFRZUEUgJ0dJVkUgIjsgOiBDT0xPUiAxMjogUFJJTlQgIklURU0iOyA6IENPTE9SIDE1OiBQUklOVCAiJyINCjQwMTAgR09TVUIgMjUwMDANCjQwMjAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDQwMDANCjQwMzAgSUYgQSQgPSAiV0VTVCIgVEhFTiBHT1RPIDM5MDANCjQwNDAgSUYgQSQgPSAiS0lMTCBNRVJDSEFOVCIgVEhFTiBQUklOVCAiWU9VIFNUQUdHRVIgQkFDSyBVTkRFUiBBIEhBSUwgT0YgVU5TRUVOIEFYRVMuIjogR09UTyAzOTAwDQo0MDUwIElGIEEkID0gIk1VRyBNRVJDSEFOVCIgVEhFTiBQUklOVCAiVEhFIE1FUkNIQU5UIExBVUdIUyBBTkQgUFVMTFMgT1VUIEEgLjM1NyINCjQwNjAgSUYgQSQgPSAiVEFLRSBHVU4iIFRIRU4gUFJJTlQgIkxFVCBNRSBHRVQgVEhJUyBTVEFJVCwgU09NRU9ORSBJUyBQT0lOVElORyBBIC4zNTcgTUFHTlVNIEFUIFlPVSBBTkQgWU9VIFdBTlQgVE8gVEFLRSBJVCBGUk9NIEhJTT8gIEkgVEhJTksgTk9UISINCjQwNzAgSUYgQSQgPSAiVEFLRSBNRVJDSEFOVCIgVEhFTiBQUklOVCAiWU9VIEdSQUIgVEhFIE1FUkNIQU5ULCBLSUNLSU5HIEFORCBTQ1JFQU1JTkcsIEFORCBTSE9WRSBISU0gSU5UTyBZT1VSIEJBRy4gICAgICAoSSBUSElOSyBOT1QpIg0KNDA4MCBJRiBBJCA9ICJUQUtFIEtFWSIgVEhFTiBQUklOVCAiVVNJTkcgWU9VUiBTS0lMTFMgQVMgQSBUSElFRiBZT1UgVEFLRSBUSEUgS0VZIEFORCBSVU4sIEJVVCBVTkZPUlRVTkFURUxZIFRIRSAgICBNRVJDSEFOVCBQVUxMUyBPVVQgQU4gSVNSRUFMSSBTVUItTUFDSElORSBHVU4gQU5EIFlPVSBHUkFUSU9VU0xZIFJFVFVSTiBUSEUgS0VZLiINCjQwOTAgSUYgTEVGVCQoQSQsIDQpID0gIkdJVkUiIFRIRU4gR09TVUIgNTUwMDANCjQwOTkgR09UTyA0MDEwDQo0MTAwIFBSSU5UICJGTFVURSBST09NIg0KNDEwMSBQUklOVCAiQSBTTUFMTCBST09NIFdJVEggQk9BUkRTIE5BSUxFRCBPVkVSIERPT1JTIFRPIFRIRSBOT1JUSCBBTkQgU09VVEguICBFWElUIEFSRSBUTyBUSEUgRUFTVCBBTkQgVVAuIg0KNDEwMiBJRiBJVSQgPD4gIkZMVVRFIiBUSEVOIFBSSU5UICJUSEVSRSBJUyBBIEZMVVRFIEhFUkUuIg0KNDExMCBHT1NVQiAyNTAwMA0KNDEyMCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNDEwMA0KNDEzMCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gMzkwMA0KNDE0MCBJRiBBJCA9ICJVUCIgVEhFTiBHT1RPIDQ0MDANCjQxNTAgSUYgQSQgPSAiVEFLRSBGTFVURSIgVEhFTiBQUklOVCAiRE9ORSI6IFBSSU5UIDogSVUkID0gIkZMVVRFIjogR09UTyA0MTEwDQo0MTk4IFBSSU5UICJUSEFUIFdPTidUIERPIEEgV0hPTEUgTE9UIE9GIEdPT0QiDQo0MTk5IEdPVE8gNDExMA0KNDIwMCBQUklOVCAiTUFaRSINCjQyMDUgUFJJTlQgIkVBU1QsIFdFU1QsIE9SIFNPVVRIPyINCjQyMTAgR09TVUIgMjUwMDANCjQyMjAgSUYgQSQgPSAiRUFTVCIgVEhFTiBHT1RPIDQyMDANCjQyMzAgSUYgQSQgPSAiV0VTVCIgVEhFTiBHT1RPIDM3MDANCjQyNDAgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyA0MzAwDQo0MjUwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA0MjAwDQo0Mjk4IFBSSU5UICJUUlkgQU5PVEhFUiBDT01NQU5EIg0KNDI5OSBHT1RPIDQyMTANCjQzMDAgUFJJTlQgIk1BWkUiDQo0MzA1IFBSSU5UICJVUCwgTk9SVEgsIE9SIEVBU1Q/Ig0KNDMxMCBHT1NVQiAyNTAwMA0KNDMyMCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNDMwMA0KNDMzMCBJRiBBJCA9ICJVUCIgVEhFTiBHT1RPIDUwMDANCjQzNDAgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyAzNzAwDQo0MzUwIElGIEEkID0gIkVBU1QiIFRIRU4gR09UTyA0MjAwDQo0MzYwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA0MzAwDQo0Mzk4IFBSSU5UICJUUlkgU09NRVRISU5HIE5FVyINCjQzOTkgR09UTyA0MzEwDQo0NDAwIFBSSU5UICJTTE9QRSBST09NIg0KNDQwNSBQUklOVCAiVEhFIFdIT0xFIFJPT00gSVMgQVQgQU4gQU5HTEUgV0lUSCBBTiBFWElUIERPV05XQVJELiINCjQ0MDYgSUYgSVYkIDw+ICJTVFJPTkcgV0hJU0tZIiBUSEVOIFBSSU5UICJUSEVSRSBJUyBBIEJPVFRMRSBIRVJFLiINCjQ0MTAgR09TVUIgMjUwMDANCjQ0MjAgSUYgTEVGVCQoQSQsIDQpID0gIlRBS0UiIFRIRU4gUFJJTlQgIkRPTkUiOiBQUklOVCA6IElWJCA9ICJTVFJPTkcgV0hJU0tZIjogR09UTyA0NDEwDQo0NDMwIElGIEEkID0gIkRPV04iIFRIRU4gR09UTyA0MTAwDQo0NDQwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA0NDAwDQo0NDk4IFBSSU5UICIoTk9UISEhKSINCjQ0OTkgR09UTyA0NDEwDQo0NTAwIFBSSU5UICJDTE9DS1dPUksgUk9PTSINCjQ1MDUgUFJJTlQgIkFCT1ZFIFlPVSBIRUFEIFRIRVJFIElTIEFOIElOVFJJQ0FURSBTWVNURU0gT0YgQ0xPQ0tXT1JLIEdFQVJTIE9QRVJBVElORyBBIEJFTEwgRVZFUlkgMTAgU0VDT05EUy4gIEFOIEVYSVQgTEVBRCBTT1VUSCBBTkQgQU5PVEhFUiBMRUFEIEVBU1QuIg0KNDUwNiBMRVQgWCA9IDk2NQ0KNDUwNyBMRVQgWCA9IFggLSA0OiBTT1VORCBYLCAxOiBJRiBYID0gOTM3IFRIRU4gR09UTyA0NTEwIEVMU0UgR09UTyA0NTA3DQo0NTEwIEdPU1VCIDI1MDAwDQo0NTIwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA0NTAwDQo0NTMwIElGIEEkID0gIkVBU1QiIFRIRU4gR09UTyAzMDAwDQo0NTQwIElGIEEkID0gIlNPVVRIIiBUSEVOIEdPVE8gNDYwMA0KNDU5OCBQUklOVCAiV0hZIT8hIg0KNDU5OSBHT1RPIDQ1MTANCjQ2MDAgUFJJTlQgIlBSSVNPTkVSIFJPT00iDQo0NjAyIFBSSU5UICJUSEVSRSBJUyBBTiBFWElUIFRPIFRIRSBOT1JUSCBBTkQgU09VVEguIg0KNDYwNCBJRiBJVyQgPD4gIkJMT09EWSBLTklGRSIgVEhFTiBQUklOVCAiVEhFUkUgSVMgQSBCT0RZIEhFUkUgV0lUSCBBIEtOSUZFIFNUSUNLSU5HIElOIFRPIElULiINCjQ2MTAgR09TVUIgMjUwMDANCjQ2MjAgSUYgTEVGVCQoQSQsIDQpID0gIlRBS0UiIFRIRU4gUFJJTlQgIkRPTkUiOiBJRiBSSUdIVCQoQSQsIDUpID0gIktOSUZFIiBUSEVOIElXJCA9ICJCTE9PRFkgS05JRkUiIEVMU0UgUFJJTlQgIldBSVQgQSBTRUNPTkQuLi4gWU9VIENBTidUIERPIFRIQVQhIg0KNDYyNSBJRiBMRUZUJChBJCwgNCkgPSAiVEFLRSIgVEhFTiBHT1RPIDQ2MTANCjQ2MzAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDQ2MDANCjQ2NDAgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyA0NTAwDQo0NjUwIElGIEEkID0gIlNPVVRIIiBUSEVOIEdPVE8gNDcwMA0KNDY5OCBQUklOVCAiT2sgWU9VIFBST0NFRUQgVE8gIjsgTEVGVCQoQSQsIDQpOyAiLi4uIFlPVSBDQU4nVCBETyBUSEFUISINCjQ2OTkgR09UTyA0NjEwDQo0NzAwIFBSSU5UICJCQU5ESVQgUk9PTSBJSSINCjQ3MDIgUFJJTlQgIkVYSVRTOk5PUlRIIEFORCBFQVNUIg0KNDcxMCBHT1NVQiAyNTAwMA0KNDcyMCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gMjUwMA0KNDczMCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDQ2MDANCjQ3OTggUFJJTlQgIlRIQVQgRE9FU04nVCBNQUtFIFNFTlNFIFRPIE1FLiINCjQ3OTkgR09UTyA0NzEwDQo0ODAwIFBSSU5UICJPR1JFIFJPT00iDQo0ODA1IFBSSU5UICJJTiBUSElTIFJPT00gVEhFUkUgQVJFIEFCT1VUIEZJVkUgQ09NUExFVEUgU0tFTEVUT05TIEFORCBBVCBMRUFTVCBUV0VOVFktRklWRSAgIFBBUlRTIE9GIE9USEVSIEFEVkVOVFVSRVJTLiAgVEhFIEVYSVQgSVMgVE8gVEhFIE5PUlRIV0VTVC4iOiBJRiBJWCQgPD4gIkpBREUgU1RBRkYiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgSkFERSBTVEFGRiBIRVJFLiINCjQ4MDYgSUYgT0dSRSQgPD4gIk9HUkUiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEFORCBPR1JFIEhFUkUgRklOSVNISU5HIEhJUyBMQVNUIE1FQUwuIiBFTFNFIFBSSU5UICJUSEVSRSBJUyBBIERJU1RJTkNUIExBQ0sgT0YgQU4gT0dSRSBIRVJFIg0KNDgxMCBHT1NVQiAyNTAwMA0KNDgyMCBJRiBBJCA9ICJOT1JUSFdFU1QiIFRIRU4gR09UTyA1MDAwDQo0ODI1IElGIElWJCA8PiAiU1RST05HIFdISVNLWSIgVEhFTiBHT1RPIDQ4NDANCjQ4MzAgSUYgTEVGVCQoQSQsIDExKSA9ICJHSVZFIEJPVFRMRSIgVEhFTiBQUklOVCAiVEhFIE9HUkUgVEFLRVMgQSBEUklOSyBPRiBUSEUgV0hJU0tZLi4uICBIQU5EUyBUSEUgQk9UVExFIEJBQ0sgVE8gWU9VLi4uICBBTkQgICBQQVNTRVMgT1VUIENPTEQuIjogUFJJTlQgIllPVSBUQUtFIFRIRSBTVEFGRiBBTkQgUlVOIE9VVCBPRiBUSEUgUk9PTS4iOiBJWCQgPSAiSkFERSBTVEFGRiI6IFBSSU5UIDogR09UTyA1MDAwDQo0ODQwIElGIEEkID0gIktJTEwgT0dSRSIgVEhFTiBQUklOVCAiSEUgR0lWRVMgWU9VIEEgTUVBTiBMT09LIEFORCBTVEVQUyBPTUlOT1VTTFkgVE9XQVJEUyBZT1UuIg0KNDg1MCBJRiBBJCA9ICJUQUtFIE9HUkUiIFRIRU4gUFJJTlQgIkRPTkUiOiBQUklOVCA6IE9HUkUkID0gIk9HUkUiOiBHT1RPIDQ4MTANCjQ4OTggSUYgT0dSRSQgPD4gIk9HUkUiIFRIRU4gUFJJTlQgIkkgV09VTEROJ1QgRE8gVEhBVCBJRiBJIFdBUyBZT1UuLi4gIFRIRSBPR1JFIElTIEVZRUlORyBZT1UgSFVOR1JJTFkiOiAgRUxTRSBQUklOVCAiVEhFUkUgSVMgTk8gUE9JTlQgVE8gVEhBVCEiDQo0ODk5IEdPVE8gNDgxMA0KNDkwMCBQUklOVCAiV0VTVCBIQUxMIg0KNDkwMSBQUklOVCAiSU4gVEhJUyBST09NIFRIRSBXQUxMIEdSQURVQUxMWSBTTE9QRVMgVE8gRk9STSBUSEUgSElHSCBDRUlMSU5HLiAgVEhFUkUgQVJFIE1BTlkgIEJFTkNIRVMgSEVSRS4gIFRIRSBFWElUUyBBUkUgVE8gVEhFIFNPVVRIRUFTVCwgU09VVEgsIEFORCBOT1JUSC4iDQo0OTEwIEdPU1VCIDI1MDAwDQo0OTIwIElGIEEkID0gIlNPVVRIRUFTVCIgVEhFTiBHT1RPIDMxMDANCjQ5MzAgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyA1MjAwDQo0OTQwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA0OTAwDQo0OTUwIElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gNTEwMA0KNDk2MCBJRiBBJCA9ICJTSVQiIFRIRU4gUFJJTlQgIk9rIFlPVSBUQUtFIEEgU0VBVC4iDQo0OTk4IFBSSU5UICJOTywgIjsgTUFNRSQ7ICIhIg0KNDk5OSBHT1RPIDQ5MTANCjUwMDAgUFJJTlQgIk1BWkUiDQo1MDAyIFBSSU5UICJET1dOIE9SIFNPVVRIRUFTVD8iDQo1MDEwIEdPU1VCIDI1MDAwDQo1MDIwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA1MDAwDQo1MDMwIElGIEEkID0gIlNPVVRIRUFTVCIgVEhFTiBHT1RPIDQ4MDANCjUwNDAgSUYgQSQgPSAiRE9XTiIgVEhFTiBHT1RPIDQzMDANCjUwOTggUFJJTlQgIk9rIjogSU5QVVQgIiIsIEJHVCQNCjUwOTkgR09UTyA1MDEwDQo1MTAwIElGIElOJCA8PiAiU1BIRVJFIiBUSEVOIFBSSU5UICJUSElTIFJPT00gSVMgVE9PIERBUkshIjogR09UTyA1MTEwDQo1MTAyIFBSSU5UICJEQVJLIFJPT00iDQo1MTA0IFBSSU5UICJUSElTIFJPT00gSVMgRklMTEVEIFdJVEggQSBNQUdJQyBEQVJLTkVTUyBTTyBQT1dFUkZVTCBUSEFUIE9OTFkgWU9VUiBCUklHSFQgICAgIFNQSEVSRSBDQU4gQ1VUIFRIUk9VR0ggSVQuICBUSEUgRVhJVCBJUyBUTyBUSEUgU09VVEguIg0KNTEwNiBJRiBJQUEkIDw+ICJHT0xEIFdBVENIIiBUSEVOIFBSSU5UICJUSEUgRkxPT1IgQ09OU0lTVFMgT0YgU0VWRVJBTCBMT09TRSBCT0FSRFMgVEhBVCBMT09LIExJS0UgVEhFWSBDQU4gQkUgTU9WRUQuIg0KNTExMCBHT1NVQiAyNTAwMA0KNTEyMCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNTEwMA0KNTEzMCBJRiBBJCA9ICJTT1VUSCIgVEhFTiBHT1RPIDQ5MDANCjUxMzUgSUYgSU4kIDw+ICJTUEhFUkUiIFRIRU4gR09UTyA1MTk4DQo1MTQwIElGIEEkID0gIk1PVkUgQk9BUkRTIiBUSEVOIFBSSU5UICJZT1UgTU9WRSBUSEUgQk9BUkRTIEFORCBSRVZFQUwgQSBHT0xERU4gV0FUQ0guLi4gIFlPVSBUQUtFIElULiI6IElBQSQgPSAiR09MRCBXQVRDSCI6IEdPVE8gNTExMA0KNTE5OCBQUklOVCAiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChOT1QpIg0KNTE5OSBHT1RPIDUxMDANCjUyMDAgUFJJTlQgIkdBUyBST09NIg0KNTIwMiBMRVQgTUcgPSBNRyArIDE6IElGIE1HID0gMSBUSEVOIFBSSU5UICJBIEdBUyBCRUdJTlMgVE8gRklMTCBUSEUgUk9PTSEiDQo1MjA0IElGIE1HID4gMSBUSEVOIFBSSU5UICJUSEVSRSBJUyBBIEdBUyBJTiBUSElTIFJPT00hIg0KNTIwNiBQUklOVCAiVEhFUkUgQVJFIEVYSVRTIFRPIFRIRSBOT1JUSCBBTkQgU09VVEhFQVNULiINCjUyMTAgR09TVUIgMjUwMDANCjUyMjAgSUYgQSQgPSAiTE9PSyIgVEhFTiBHT1RPIDUyMDANCjUyMzAgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyA0OTAwDQo1MjQwIElGIEEkID0gIlNPVVRIRUFTVCIgVEhFTiBXRVIgPSAxOiBJRiBJSUkkIDw+ICJBSVIgVEFOS1MiIFRIRU4gUFJJTlQgIF8NCiJZT1UgREVMVkUgREVFUEVSIElOVE8gVEhFIEdBUy4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNVRERFTkxZIFlPVSBFWFBFUklFTkNFIENBUkRJQUMgQVJSRVNULCBIRUFUIFNUUk9LRSwgU1VGRklDQVRJT04sIEFORCBTRVZFUkUgICAgQ09OVlVMVElPTlMgQUxMIEFUIE9OQ0UuIjogRU5EDQo1MjUwIElGIEEkID0gIlNPVVRIRUFTVCIgVEhFTiBHT1RPIDUzMDANCjUyOTggUFJJTlQgIldIQVQ/Ig0KNTI5OSBHT1RPIDUyMTANCjUzMDAgUFJJTlQgIkJBTkRJVCBIQUxMIg0KNTMwMiBQUklOVCAiVEhJUyBJUyBBIExPTkcgV0lERSBST09NIFdJVEggVEFMTCBDRUlMSU5HUy4gIEJFQU1TIFdJVEggSU5UUklDVVQgSU5HUkFWSU5HUyAgICBTVVBPUlQgVEhFIFdBTEwuICBFWElUUyBBUkUgVE8gVEhFIFdFU1QgQU5EIE5PUlRIV0VTVC4iDQo1MzA0IElGIElBQiQgPD4gIkJSQVNTIFNISUVMRCIgVEhFTiBQUklOVCAiVEhFUkUgSVMgQSBCUkFTUyBTSElFTEQgT04gVEhFIFdBTEwiDQo1MzEwIEdPU1VCIDI1MDAwDQo1MzIwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA1MzAwDQo1MzMwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyA1NDAwDQo1MzQwIElGIEEkID0gIk5PUlRIV0VTVCIgVEhFTiBHT1RPIDUyMDANCjUzNTAgSUYgQSQgPSAiVEFLRSBTSElFTEQiIFRIRU4gUFJJTlQgIkRPTkUiOiBJQUIkID0gIkJSQVNTIFNISUVMRCI6IFBSSU5UIDogR09UTyA1MzEwDQo1Mzk4IFBSSU5UICJIVUg/Ig0KNTM5OSBHT1RPIDUzMTANCjU0MDAgUFJJTlQgIk1VU0lDIFJPT00iOiBGTFVURSA9IDENCjU0MDIgSUYgTVVTSUMgPSAwIFRIRU4gUFJJTlQgIlRIRSBFWElUIElTIFRPIFRIRSBFQVNULiAgVEhFIFJPT00gSVMgRFJBQi4gIFRIRSBXQUxMUyBBUkUgR1JBWS4iDQo1NDA0IElGIE1VU0lDID0gMSBUSEVOIFBSSU5UICJUSEUgUk9PTSBTRUVNUyBUTyBDT01FIEFMSVZFLi4uICBZT1UgQkVHSU4gVE8gTk9USUNFIEJSSUdIVCBQQVRDSEVTIE9GIENPTE9SICAgIFdISUNIIFlPVSBESUQgTk9UIE5PVElDRSBCRUZPUkUuICBBIFJFRCBET09SIEFQUEVBUlMgVE8gVEhFIFNPVVRILiAgVEhFUkUgSVMgQU4gRVhJVCBUTyBUSEUgRUFTVC4iDQo1NDEwIEdPU1VCIDI1MDAwDQo1NDIwIElGIElVJCA9ICJGTFVURSIgVEhFTiBQUklOVCAiT2siOiBJRiBBJCA9ICJQTEFZIEZMVVRFIiBUSEVOIFBMQVkgIkVGR0FHQyI6IE1VU0lDID0gMTogR09UTyA1NDAwDQo1NDMwIElGIEEkID0gIlBMQVkgTVVTSUMiIFRIRU4gUExBWSAiRUdGQ0ErQiIgRUxTRSBHT1RPIDU0NDANCjU0MzIgUFJJTlQgIlRIRSBXSElTVExFIFNFRU1TIFRPIEJFIE9VVCBPRiBUVU5FIg0KNTQzNCBHT1RPIDU0MTANCjU0NDAgSUYgTVVTSUMgPSAxIFRIRU4gRVIkID0gIkVSLi4uIjogSUYgQSQgPSAiU09VVEgiIEdPVE8gNTUwMDogRkxVVEUgPSAwDQo1NDUwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA1NDAwDQo1NDYwIElGIEEkID0gIkVBU1QiIFRIRU4gR09UTyA1MzAwOiBGTFVURSA9IDANCjU0OTggUFJJTlQgIj8/Pz8/Pz8iDQo1NDk5IEdPVE8gNTQxMA0KNTUwMCBJRiBGQUxTUyA8PiAyIFRIRU4gUFJJTlQgIldBVEVSRkFMTCIgRUxTRSBQUklOVCAiQkFTRSBPRiBDTElGRiINCjU1MDIgSUYgRkFMU1MgPD4gMiBUSEVOIFBSSU5UICJZT1UgQVJFIFRIRSBGT09UIE9GIFRIRSBTUEVDVEFDVUxBUiBGTEFUSEVBRCBGQUxMUy4gIE5FWFQgVE8gWU9VIElTIFRIRSBXQVRFUiAgIENSQVNISU5HIERPV04gT04gVEhFIFJPQ0tTIENSRUFUSU5HIEEgUkVGUkVTSElORyBNSVNULiAgVEhFUkUgSVMgQSBSRUQgRE9PUiBJTiAgVEhFIENMSUZGIEZBQ0UgVE8gVEhFIE5PUlRILiI6IEdPVE8gNTUwNA0KNTUwMyBQUklOVCAiWU9VIEFSRSBTVEFORElORyBBVCBUSEUgRk9PVCBPRiBUSEUgU1BFQ1RBQ1VMQVIgRkxBVEhFQUQgTk8tRkFMTFMuIE5FWFQgVE8gWU9VICBJUyBUSEUgTk8tV0FURVIgQ1JBU0hJTkcgRE9XTiBDUkVBVElORyBBIE5PVC1SRUZSRVNISU5HIE5PLU1JU1QuICBUSEVSRSBJUyBBIFJFRERPT1IgVE8gVEhFIE5PUlRILiINCjU1MDQgSUYgRkFMTFMgPSAxIFRIRU4gUFJJTlQgIllPVSBDQU4gQUxTTyBHTyBFQVNULiINCjU1MDUgSUYgRkFMTFMgPSAwIFRIRU4gUFJJTlQgIihISU5UOiAgSVQgSU5WT0xWRVMgQSBTTUFMTCBTUEFSSyBPRiBNSU5PUiBNQUdJQy4pIg0KNTUxMCBHT1NVQiAyNTAwMA0KNTUyMCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDU0MDANCjU1MzAgSUYgQSQgPSAiRUFTVCIgVEhFTiBTREYgPSBTTElESkI6IElGIEZBTExTID0gMCBUSEVOIFBSSU5UICJZT1UgQ0FOJ1QgR08gVEhBVCBXQVkhIiBFTFNFIEdPVE8gNTYwMA0KNTU0MCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNTUwMA0KNTU1MCBJRiBBJCA9ICJXQVZFIFdBTkQiIFRIRU4gRkFMTFMgPSAxOiBQUklOVCAiQSBQT1JUSU9OIE9GIFRIRSBDTElGRiBGQUNFIFNMSURFUyBBV0FZIFRPIFRIRSBFQVNULiI6IFBSSU5UIDogR09UTyA1NTEwDQo1NTYwIElGIEEkID0gIkZJTEwgQ0FOVEVFTiIgVEhFTiBJRkYkID0gIkNBTlRFRU4gQU5EIFdBVEVSRkFMTCBXQVRFUiI6IFBSSU5UICJET05FIjogUFJJTlQgOiBHT1RPIDU1MTANCjU1OTggUFJJTlQgIldBU1NVUElUQ0hVPyINCjU1OTkgR09UTyA1NTEwDQo1NjAwIFBSSU5UICJCRUhJTkQgV0FURVJGQUxMIg0KNTYwMiBQUklOVCAiVEhFUkUgSVMgQU4gRVhJVCBUTyBUSEUgV0VTVCI6IElGIElBQyQgPD4gIlBJWElFIERVU1QiIFRIRU4gUFJJTlQgIlRIRVJFIElTIFNPTUUgUElYSUUgRFVTVCBMQVlJTkcgT04gVEhFIFJPQ0tTIEhFUkUuIg0KNTYxMCBHT1NVQiAyNTAwMA0KNTYyMCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNTYwMA0KNTYzMCBJRiBBJCA9ICJXRVNUIiBUSEVOIEdPVE8gNTUwMA0KNTY0MCBJRiBBJCA9ICJUQUtFIERVU1QiIFRIRU4gSUFDJCA9ICJQSVhJRSBEVVNUIjogUFJJTlQgIkRPTkUiOiBQUklOVCA6IEdPVE8gNTYxMA0KNTY5OCBQUklOVCAiWU8sIFlPVSwgRE9PUiwgTk9XISINCjU2OTkgR09UTyA1NjEwDQo1ODAwIElGIElBJCA8PiAiTElHSFRCVUxCIiBUSEVOIFBSSU5UICJJVCBJUyBEQVJLIERPV04gSEVSRSEiIEVMU0UgR09UTyA1ODAyDQo1ODAxIEdPVE8gNTgxMA0KNTgwMiBDT0xPUiA0OiBQUklOVCAiV0hJU1RMRSBST09NIg0KNTgwMyBDT0xPUiAxNTogUFJJTlQgIlRIRVJFIElTIEFOIEVYSVQgVE8gVEhFIEVBU1QgQU5EIEEgU1BJUkFMIFNUQUlSQ0FTRSBMRUFESU5HIFVQV0FSRCBJTlRPIERBUktORVNTIjsNCjU4MDcgSUYgSUJUJCA8PiAiV0hJU1RMRSIgVEhFTiBQUklOVCAiVEhFUkUgSVMgQSBXSElTVExFIEhBTkdJTkcgT04gVEhFIFdBTEwuIg0KNTgxMCBXSElTS0VMID0gMTogR09TVUIgMjUwMDANCjU4MjAgSUYgQSQgPSAiRUFTVCIgVEhFTiBXSElTS0VMID0gMDogR09UTyA1OTAwDQo1ODI1IElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA1ODAwDQo1ODMwIElGIEEkID0gIlVQIiBUSEVOIFdISVNLRUwgPSAwOiBHT1RPIDI3MDANCjU4NDAgSUYgQSQgPSAiS0lMTCBTRUxGIiBUSEVOIEdPVE8gMTAxMDANCjU4NjAgSUYgQSQgPSAiQkxPVyBXSElTVExFIiBPUiBBJCA9ICJCTE9XIElUIiBUSEVOIEdPVE8gMzAwDQo1ODcwIElGIEEkID0gIlRBS0UgV0hJU1RMRSIgVEhFTiBJQlQkID0gIldISVNUTEUiIEVMU0UgR09UTyA1ODk4DQo1ODc1IFBSSU5UICJET05FIjogR09UTyA1ODEwDQo1ODk4IFBSSU5UICJUUlkgQUdBSU4iDQo1ODk5IEdPVE8gNTgxMA0KNTkwMCBQUklOVCAiRFVOR0VPTiI6IFBSSU5UICJUSElTIFJPT00gSVMgQSBEQVJLIEFORCBESVJUWSBEVU5HRU9OIENFTEwgTVVDSCBMSUtFIE1BTlkgT1RIRVJTLiAgVEhFUkUgQVJFICAgIFNLRUxFVE9OUyBDSEFJTk5FRCBUTyBUSEUgV0FMTCBIRVJFLiAgICBUSEVSRSBBUkUgRVhJVFMgVE8gVEhFIE5PUlRILCBTT1VUSCwgQU5EIFdFU1QuIg0KNTkxMCBHT1NVQiAyNTAwMA0KNTkyMCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNTkwMA0KNTkzMCBJRiBBJCA9ICJTT1VUSCIgVEhFTiBHT1RPIDU5MDANCjU5NDAgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyA1OTAwDQo1OTUwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyA1ODAwDQo1OTk4IFBSSU5UICJUUlkgQU5PVEhFUiBDT01NQU5EIg0KNTk5OSBHT1RPIDU5MTANCjYwMDAgUFJJTlQgIkNMT1NFVCINCjYwMDIgUFJJTlQgIllPVSBBUkUgU1RBTkRJTkcgSU4gQSBDTE9TRVQuICBUSEUgRVhJVCBJUyBUTyBUSEUgRUFTVC4iDQo2MDA0IElGIElBRCQgPD4gIlBFQVJMIE5FQ0tMQUNFIiBUSEVOIFBSSU5UICJZT1UgU0VFIEEgUEVBUkwgTkVDS0xBQ0UgT04gQSBTSEVMRiBIRVJFLiINCjYwMTAgR09TVUIgMjUwMDANCjYwMjAgSUYgQSQgPSAiRUFTVCIgVEhFTiBHT1RPIDE3MDANCjYwMzAgSUYgTEVGVCQoQSQsIDQpID0gIlRBS0UiIFRIRU4gSUFEJCA9ICJQRUFSTCBORUNLTEFDRSI6IFBSSU5UICJET05FIjogUFJJTlQgOiBHT1RPIDYwMTANCjYwOTggUFJJTlQgOiBHT1RPIDYwMTANCjYxMDAgUFJJTlQgIlBPSU5UTEVTUyBST09NIElJIg0KNjEwMiBQUklOVCAgXw0KIllPVSBDQU4gSEVBUiBXSEFUIEFQUEVBUlMgVE8gQkUgQ0hJTERSRU4gTEFVR0hJTkcgSU4gVEhFIERJU1RBTkNFLiAgT04gVEhFIE5PUlRIV0FMTCBJTiBBTiBJTlNDUklQVElPTi4gIEFCT1ZFIFlPVSBJUyBBIFNPTkdCSVJEIEZMWUlORyBJTiBDSVJDTEVTLiAgQUJPVkUgVEhFICBET09SIFRPIFRIRSBTT1VUSCBJUyBBIFBJQ1RVUkUuICBUSEVSRSBJUyBBIFdJTkRPVyBIRVJFIFRIUk9VR0ggV0hJQ0ggWU9VIFNFRSBBIg0KNjEwMyBQUklOVCAiRE9SSy4gIE9IIE5FVkVSIE1JTkQuIElUIFdBU04nVCBBIFdJTkRPVyBBRlRFUiBBTEwuLi5KVVNUIEEgTElUVExFIE1JUlJPUi4gICAgICBUSEVSRSBJUyBBTFNPIEEgRE9PUiBUTyBUSEUgTk9SVEguIg0KNjExMCBHT1NVQiAyNTAwMA0KNjEyMCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNjEwMA0KNjEzMCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDYyMDANCjYxNDAgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyAzODAwDQo2MTUwIElGIEEkID0gIlJFQUQgSU5TQ1JJUFRJT04iIFRIRU4gUFJJTlQgIktub3cgWWUgdGhhdCBZZSBzaGFsbCBiZSBzbWl0dGVuIHZlcmlseSB1bnRvIHRoZSBlbmQgb2YgdGhlIGVhcnRoLi4uICBUaG91IHNoYWxsaW5jdXIgdGhlIHdyYXRoIG9mIHRoZSBIb2x5IEJvdWxkZXIuICAoVGhpcyBtZXNzYWdlIHdhcyBicm91Z2h0IHRvIHlvdSBieSB0aGUgICBQcmVzaWRlbnRzIENvdW5jaWwgZm9yIGtlZXBpbmcgdGhlIHBlYWNlLikiDQo2MTk4IFBSSU5UICJ5by4uIG5vdCEiDQo2MTk5IEdPVE8gNjExMA0KNjIwMCBQUklOVCAiU1BFQ0lPVVMgU0hSSU5FIg0KNjIwMiBQUklOVCAgXw0KIkFTIFlPVSBUQUtFIEEgUVVJQ0sgTE9PSyBBUk9VTkQgVEhFIFJPT00sIFlPVSBJTU1FRElBVEVMWSBSRUFMSVpFIFRIQVQgQSBMQVJHRSAgQUxUQVIgT0NDVVBJRVMgTVVDSCBPRiBUSEUgTk9SVEhFUk4gSEFMRiBPRiBUSEUgUk9PTS4gIE9OIFRIRSBBTFRBUiBJUyBBIEJVUk5UICBPRkZFUklORyBPRiBTT01FIEtJTkQsIEFORCBCRUhJTkQgVEhFIEFMVEFSIElTIEEgSFVHRSBDQVJWSU5HIFdJVEggU09NRVRISU5HICI6DQo2MjAzIFBSSU5UICJXUklUVEVOIEFUIElUUyBCQVNFLiAgQVQgWU9VUiBGRUVUIExJRVMgQSBNT05LLiAgWU9VIENBTiBHTyBFQVNUIE9SIFNPVVRILiINCjYyMTAgR09TVUIgMjUwMDANCjYyMTUgSUYgQSQgPSAiRVhBTUlORSBNT05LIiBUSEVOIFBSSU5UICJZT1UgRklORCBBIFdBTExFVCINCjYyMTYgSUYgQSQgPSAiRVhBTUlORSBXQUxMRVQiIFRIRU4gUFJJTlQgIllPVSBGSU5EIEEgQlVTSU5FU1MgQ0FSRC4gIElUIFJFQURTOiI6IFBSSU5UICIgICAgICAgICAgICAgICAgICAgICAgICAgICBILlAuIE1PTkssIERFQ0VBU0VEIg0KNjIxNyBJRiBBJCA9ICJFWEFNSU5FIENBUlZJTkciIFRIRU4gUFJJTlQgIklUIElTIEEgQ0FSVklORyBPRiBBIE1PTksuICBUSEUgQkFTRSBSRUFEUzogICAgICAgICAgICAgICAgICAgICAgICBILlAuIE1PTkssIGluIG1lbW9yaWFtIg0KNjIxOCBJRiBBJCA9ICJFWEFNSU5FIE9GRkVSSU5HIiBPUiBBJCA9ICJFWEFNSU5FIFNBQ1JBRklDRSIgVEhFTiBQUklOVCAiSVQgQVBQRUFSUyBUTyBCRSBTT01FIFNPUlQgT0YgQSBNRUFUTE9BRi4gIEFOIEFUVEFDSEVEIFRBRyBTQVlTICBgRE9OQVRFRCBUTyBUSEUgR1JFQVQgR09EIE5FWUFSTE9USE9URVAgQlkgSC5QLiBNT00nLiINCjYyMTkgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyA2MTAwDQo2MjIwIElGIEEkID0gIkVBU1QiIFRIRU4gNjMwMA0KNjIzMCBJRiBBJCA9ICJMT09LIiBUSEVOIEdPVE8gNjIwMA0KNjI0MCBJRiBMRUZUJChBJCwgNCkgPSAiVEFLRSIgVEhFTiBQUklOVCAiWU9VUiBSRVNQRUNUIEZPUiBSRUxJR0lPTiBBTkQgVEhFIERFQUQgUFJFVkVOVCBZT1UuIg0KNjI5OCBQUklOVCAiWklQUElEWSBET08gREFILCBaSVBQSURZIEFZLi4uVEhBVCBXT04nVCBIRUxQIFlBIFNPIEknRCBUUlkgU09NRVRISU5HIEVMU0UuLi4iDQo2Mjk5IEdPVE8gNjIxMA0KNjMwMCBQUklOVCAiVEhFIFJPT00gVE8gRU5EIEFMTCBST09NUyINCjYzMDIgUFJJTlQgIF8NCiJUSEUgUk9PTSBZT1UgQVJFIFNUQU5ESU5HIElOIElTIEFQUEFSRU5UTFkgUEFSVCBPRiBBIEhPVVNFIE9XTkVEIEJZIEEgVkVSWSAgICAgIElOU0FORSBPUiBWRVJZIEVDQ0VOVFJJQyBEV0FSRi4gIFRIRSBFWElUUyBBUkUgVE8gVEhFIE5PUlRILCBJTlRPIFdIQVQgU0VFTVMgVE8gQkUgVEhFIEVOVFJBTkNFIFRPIEEgQ0FWRTsgIFdFU1QgVEhST1VHSCBBIFJFVk9MVklORyBHTEFTUyBET09SOyAgQU5EIERPV04gQSAgIg0KNjMwMyBQUklOVCAiU1BJUkFMIFNUQUlSQ0FTRTsgIFRIRVJFIElTIEFOIEVYSVQgVE8gVEhFIEVBU1QgVEhST1VHSCBBIEhPTEUgSU4gVEhFIFdBTEwgSlVTVCBMQVJHRSBFTk9VR0ggVE8gQ1JBV0wgVEhST1VHSC4iDQo2MzEwIEdPU1VCIDI1MDAwDQo2MzIwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA2MzAwDQo2MzMwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyA2MjAwDQo2MzQwIElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gNjQwMA0KNjM1MCBJRiBBJCA9ICJET1dOIiBUSEVOIEdPVE8gNjUwMA0KNjM2MCBJRiBBJCA9ICJFQVNUIiBUSEVOIFBSSU5UICJJIERJRE4nVCBGT1IgV0hPTSBJVCBXQVMgQklHIEVOT1VHSCBUTyBDUkFXTCBUSFJPVUdIISI6IFBSSU5UIDogR09UTyA2MzAwDQo2Mzk4IFBSSU5UICJUUlkgQUdBSS4uLiAgV0VMTCwgWU9VIEtOT1chIg0KNjM5OSBHT1RPIDYzMTANCjY0MDAgUFJJTlQgIlRIRSBGTE9PUiBJUyBNVVNIWS4gIE5PUlRIIE9SIFNPVVRILiINCjY0MDIgR09TVUIgMjUwMDANCjY0MDQgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyA2NDEwDQo2NDA2IElGIEEkID0gIlNPVVRIIiBUSEVOIEdPVE8gNjMwMA0KNjQwOCBQUklOVCA6IEdPVE8gNjQwMg0KNjQxMCBQUklOVCAiVEhFIEZMT09SIElTIE1VU0hZLiAgTk9SVEggT1IgU09VVEguIg0KNjQxMiBHT1NVQiAyNTAwMA0KNjQxNCBJRiBBJCA9ICJOT1JUSCIgVEhFTiBHT1RPIDY0MjANCjY0MTYgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyA2NDAwDQo2NDE4IFBSSU5UIDogR09UTyA2NDEyDQo2NDIwIFBSSU5UICJUSEUgRkxPT1IgSVMgTVVTSFkuICBOT1JUSCBPUiBTT1VUSC4iDQo2NDIyIEdPU1VCIDI1MDAwDQo2NDI0IElGIEEkID0gIk5PUlRIIiBUSEVOIEdPVE8gNjQzMA0KNjQyNiBJRiBBJCA9ICJTT1VUSCIgVEhFTiBHT1RPIDY0MTANCjY0MjggUFJJTlQgOiBHT1RPIDY0MjINCjY0MzAgUFJJTlQgIlRIRSBGTE9PUiBJUyBNVVNIWS4gIE5PUlRIIE9SIFNPVVRILiINCjY0MzIgR09TVUIgMjUwMDANCjY0MzQgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyA2NDQwDQo2NDM2IElGIEEkID0gIlNPVVRIIiBUSEVOIEdPVE8gNjQyMA0KNjQzOCBQUklOVCA6IEdPVE8gNjQzMg0KNjQ0MCBQUklOVCAiREVBRCBFTkQuLi4gQkxPQ0tFRCBCWSBIQU1CVVJHRVJTLiINCjY0NDEgR09TVUIgMjUwMDANCjY0NDMgSUYgQSQgPSAiU09VVEgiIFRIRU4gR09UTyA2NDMwDQo2NDQ5IEdPVE8gNjQ0MA0KNjUwMCBQUklOVCAiVEhFICI7IDogQ09MT1IgMTM6IFBSSU5UICLDm8Obw5vDmyAiOyA6IENPTE9SIDE1OiBQUklOVCAiUk9PTSINCjY1MDIgUFJJTlQgIlRIRVJFIElTIEEgUFVSUExFIFNUQUlSV0FZIExFQURJTkcgVVAgT1IgRUFTVCINCjY1MDMgUFJJTlQgIkVWRVJZVEhJTkcgSU4gVEhJUyBST09NIElTIFBVUlBMRS4iDQo2NTEwIEdPU1VCIDI1MDAwDQo2NTIwIElGIEEkID0gIlVQIiBUSEVOIEdPVE8gNjMwMA0KNjUzMCBJRiBBJCA9ICJFQVNUIiBUSEVOIEdPVE8gNjYwMA0KNjU5OSBQUklOVCAiTk8sIFRSWSBBR0FJTiI6IEdPVE8gNjUxMA0KNjYwMCBQUklOVCAiQkVBVkVSIFJPT00iDQo2NjAyIFBSSU5UICJUSEVSRSBJUyBBTiBFWElUIFRPIFRIRSBXRVNULiAgVEhFUkUgSVMgQSBOTy1CRUFWRVIgSEVSRS4iDQo2NjEwIEdPU1VCIDI1MDAwDQo2NjIwIElGIEEkID0gIldFU1QiIFRIRU4gR09UTyA2NTAwDQo2NjMwIEdPVE8gNjYxMA0KNjcwMCBQUklOVCAiWUVUIEFOT1RIRVIgR05PTUUgUk9PTSINCjY3MDIgSUYgSU5PVCQgPD4gIkJPT0siIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgQk9PSyBIRVJFIEFORCBBIFJPUEUgTEFEREVSIExFQURJTkcgVVAuIiBFTFNFIFBSSU5UICJZT1UgQ0FOIEdPIFVQLiINCjY3MTAgR09TVUIgMjUwMDANCjY3MjAgSUYgQSQgPSAiVVAiIFRIRU4gUFJJTlQgIkRPTkUiOiBSRVRVUk4NCjY3MzAgSUYgQSQgPSAiVEFLRSBCT09LIiBUSEVOIFBSSU5UICJET05FIjogUFJJTlQgOiBJTk9UJCA9ICJCT09LIjogR09UTyA2NzEwDQo2NzQwIElGIEEkID0gIkxPT0siIFRIRU4gR09UTyA2NzAwDQo2NzUwIEdPVE8gNjcxMA0KMTAxMDAgQ09MT1IgNzogUFJJTlQgIllPVSBIQVZFIEpVU1QgTUFERSBUSEUgQ0hPSUNFIFRPIEtJTEwgWU9VUlNFTEYuLi4iDQoxMDExMCBGT1IgWCA9IDEgVE8gOTAwMDogTkVYVCBYDQoxMDEyMCBQUklOVA0KMTAxMzAgUFJJTlQNCjEwMTQwIENPTE9SIDk6IFBSSU5UICJXT1VMRCBZT1UgTElLRSBUTzoiDQoxMDE1MCBQUklOVCAiQS4gIEpVTVAgT0ZGIE9GIEEgQ0xJRkYgSEVBRCBGSVJTVCBPTiBUTyBTSEFSUCBTVEFMQUdNSVRFUy4iDQoxMDE2MCBQUklOVCAiQi4gIFRIRSBPTEQgQlVUIFBPUFVMQVIgSEFSSS1LQVJJLiINCjEwMTcwIFBSSU5UICJDLiAgREVBVEggQlkgUlVOTklORyBJTlRPIEEgV0FMTCBSRVBFQVRFRExZLiINCjEwMTgwIFBSSU5UICJELiAgRElWRSBVTkRFUiBXQVRFUiBBTkQgVEFLRSBBIERFRVAgQlJFQVRILiINCjEwMTkwIFBSSU5UDQoxMDIwMCBDT0xPUiAxNTogSU5QVVQgRElFJA0KMTAyMTAgU1lTVEVNDQoxOTAwMCBQUklOVCAiWU9VIEFSRSBDQVJSWUlORzoiDQoxOTAwMSBJRiBHQyQgPSAiKEdJVkVOKSIgVEhFTiBXQyQgPSAiIg0KMTkwMTAgUFJJTlQgSUEkOyAiLSI7IElCJDsgIi0iOyBJQyQgKyBHQSQ7ICItIjsgSUQkICsgV0IkOyAiLSI7IElFJCArIFdBJDsgIi0iOyBJRkYkOyAiLSI7IElHJDsgIi0iOyBTV09SRE5BTUUkICsgSUgkICsgV0MkICsgR0MkOyAiLSI7IElJSSQ7ICItIjsgSUokICsgR0IkOyAiLSI7IElVJDsgIi0iOyBJViQ7ICItIjsgSVckICsgV0QkOyAiLSI7IElYJDsgIi0iOyBJWSQgKyBHRSQ7ICItIjsgSVokOyAiLSI7IElBQSQ7ICItIjsgIF8NCklTVCQgKyBHRiQ7ICItIjsgSVRFQSQNCjE5MDIwIFBSSU5UIElLJCArIEdEJDsgIi0iOyBJTCQ7ICItIjsgSU0kOyAiLSI7IElOJDsgIi0iOyBJTyQ7ICItIjsgSVAkOyAiLSI7IElRJDsgIi0iOyBJUiQ7ICItIjsgSVMkOyAiLSI7IElUJCArIEdHJDsgIi0iOyBJQlQkOyAiLSI7IElBQiQ7ICItIjsgSUFEJCArIEdaJDsgIi0iOyBJTk9UJDsgIi0iOyBPR1JFJDsgIi0iOyBTUCQNCjE5MDMwIEdPVE8gMjUwMDANCjIwMDAwIFBSSU5UICBfDQoiVVBPTiBVTkxPQ0tJTkcgVEhFIEdBVEUgQU4gSVJSRVNJU1RBQkxFIEZPUkNFIENBVVNFUyBZT1UgVE8gR0VUIE9OIFRPIFRIRSBDQVJQRVQgVEhFIENBUlBFVCBMRVZBVEFURVMgWU9VIFVQIFRPIFRIRSBQRURFU1RBTCBXSEVSRSBZT1UgRklORCBBIFBBSVIgT0YgUlVCWSAgICAgIEdMQVNTRVMuICBZT1UgVEFLRSBUSEVNIEFORCBGSU5EIFlPVVJTRUxGIE9OIFRIRSBST0FEIFRPIFJPQUQgVE8gSVNUSE1BUyBXSEVSRSINCjIwMDAxIFBSSU5UICJGVVJUSEVSIEFEVkVOVFVSRVMgQVdBSVQgWU9VLi4uIjogUFJJTlQgOiBQUklOVCAiWU9VUiBUT1RBTCBTQ09SRSBJTiBQSVQgV0FTOiI6IFBSSU5UIFNDT1JFDQoyMDAwMiBQUklOVCAiQVJFIFlPVSBSRUFEWSBUTyBQUk9DRUVEIFRPIFBJVCBJST8oWS9OKSI7DQoyMDAwMyBBJCA9IElOS0VZJDogSUYgQSQgPSAiWSIgVEhFTiBSVU4gIlBJVDIiDQoyMDAwNCBJRiBBJCA9ICJOIiBUSEVOIEVORA0KMjAwMDUgR09UTyAyMDAwMw0KMjIwMTAgUFJJTlQgIkFTIFlPVSBQT1VSIFRIRSBDVVAgT0YgSE9UIFRFQSBJTlRPIFRIRSBNQUNISU5FLCBBIFNUUkFOR0UgRkVFTElORyBPRiBERUpBIFZVICAgT1ZFUldIRUxNUyBZT1UuLi4iOiBQUklOVCAiUFJFU1MgQU5ZIEtFWSBUTyBDT05USU5VRS4uLiI6IFBSSU5UIDogQSQgPSBJTlBVVCQoMSk6IEdPVE8gMjIwMTANCjIzMDAwIENMUyA6IFBSSU5UICJZT1UgSEFWRSBBU0tFRCBGT1IgSEVMUDoiDQoyMzAxMCBQUklOVCAiRElSRUNUSU9OIFJPT00iOiBQUklOVCAiVEhFUkUgSVMgQU4gSU5TQ0lQVElPTiBPTiBUSEUgV0FMTCBBTkQgQU4gRVhJVCBUTyBUSEUgTk9SVEguIg0KMjMwMjAgR09TVUIgMjUwMDA6IFBSSU5UIDogSUYgQSQgPSAiUkVBRCBJTlNDUklQVElPTiIgVEhFTiBQUklOVCAiSVQgU0FZUywnVFlQRSBTVEFOREFSRCBDT01QQVNTIERJUkVDVElPTlMgVE8gTU9WNiBBUk9VTkQgT1IgQUJSRVZJQVRFIFdJVEggTixORSxFLFNFLFMsU1csVyxOVy4gIFVQIEFORCBET1dOIEFMU08gV09SSy4nIg0KMjMwMjEgSUYgQSQgPSAiTk9SVEgiIFRIRU4gR09UTyAyMzAzMA0KMjMwMjUgUFJJTlQgIk5PVywgVFJZIEFOT1RIRVIgQ09NTUFORCINCjIzMDI2IEdPVE8gMjMwMjANCjIzMDMwIFBSSU5UICJGVU5DVElPTiBST09NIg0KMjMwNDAgUFJJTlQgIkkgU0VFIFlPVSBIQVZFIE1BU1RFUkVEIFRIRSBGSVJTVCBTS0lMTC4gIFRIRVJFIElTIEFOIElOU0NSSVBUSU9OIE9OIFRIRSBXQUxMLiAgVEhFIEVYSVRTIEFSRSBUTyBUSEUgU09VVEggQU5EIFdFU1QiDQoyMzA1MCBHT1NVQiAyNTAwMDogUFJJTlQgOiBMRVQgU0NPUkUgPSBTQ09SRSArIDENCjIzMDYwIElGIEEkID0gIlNPVVRIIiBUSEVOIEdPVE8gMjMwMTANCjIzMDcwIElGIEEkID0gIlJFQUQgSU5TQ1JJUFRJT04iIFRIRU4gUFJJTlQgIklUIFNBWVMgJ1RPIERFRklORSBGVU5DVElPTiBLRVlTOjEuIFRZUEUgREVGSU5FIEYxLUY5IDIuW1JFVFVSTl0gMy5UWVBFIFdIQVQgWU9VIFdIQVQgWU9VIFdBTlQgVE8gREVGSU5FIElUIEFTICAzLltSRVRVUk5dIg0KMjMwODAgSUYgQSQgPSAiV0VTVCIgVEhFTiBHT1RPIDIzMDkwDQoyMzA4MSBQUklOVCAiVFJZIEFOT1RIRVIgQ09NTUFORCBOT1chIg0KMjMwODIgR09UTyAyMzA1MA0KMjMwOTAgUFJJTlQgIklURU1TIFJPT00iDQoyMzEwMCBQUklOVCAiVEhJUyBST09NIEhBUyBFWElUUyBUTyBUSEUgTk9SVEhFQVNUIEFORCBFQVNUIFRIRVJFIElTIEFOIElOU0NSSVBUSU9OIE9OIFRIRSAgICBXQUxMLiINCjIzMTEwIElOUFVUIEhFJDogUFJJTlQgOiBMRVQgU0NPUkUgPSBTQ09SRSArIDENCjIzMTIwIElGIEhFJCA9ICJFQVNUIiBUSEVOIEdPVE8gMjMwMzANCjIzMTMwIElGIEhFJCA9ICJOT1JUSEVBU1QiIFRIRU4gR09UTyAyMzE4MA0KMjMxNDAgSUYgSEUkID0gIlJFQUQgSU5TQ1JJUFRJT04iIFRIRU4gUFJJTlQgIlRPIFRBS0UgQU4gSVRFTSBUWVBFICdUQUtFIFtJVEVNXScgKE5PVCBHRVQgW0lURU1dKS4gIElGIFRIRVJFIEFSRSBNVUxUSVBMRSAgICAgSVRFTVMgVFlQRSAnVEFLRSBBTEwnLiINCjIzMTUwIFBSSU5UICJUUlkgQU5PVEhFUiBDT01NQU5EIE5PVyINCjIzMTYwIEdPVE8gMjMxMTANCjIzMTgwIFBSSU5UICJMT09LSU5HIEFUIFdIQVQgWU9VIEhBVkUgUk9PTSINCjIzMTkwIFBSSU5UICJUSElTIFJPT00gSEFTIEFOIEVYSVQgVE8gVEhFIFNPVVRIV0VTVC4gIFRIRVJFIElTIEFOIElOU0NSSVBUSU9OIE9OIFRIRSBXQUxMLiINCjIzMjAwIElGIElTQ1JPTEwkIDw+ICJTQ1JPTEwiIFRIRU4gUFJJTlQgIlRIRVJFIElTIEEgU0NST0xMIEhFUkUuIg0KMjMyMTAgSU5QVVQgSEUkOiBQUklOVCA6IExFVCBTQ09SRSA9IFNDT1JFICsgMQ0KMjMyMjAgSUYgSEUkID0gIlJFQUQgSU5TQ1JJUFRJT04iIFRIRU4gUFJJTlQgIlRIRSBJTlNDUklQVElPTiBTQVlTIFNPTUVUSElORyBBQk9VVCBZT1UgTkVFRElORyBUTyBUWVBFICdJTlZFTlRPUlknIFRPIFRFTEwgV0hBVCBZT1UgQVJFIEhPTERJTkcuIg0KMjMyMzAgSUYgSEUkID0gIlNPVVRIV0VTVCIgVEhFTiBQUklOVCAiVEhFIERPT1IgQ0xPU0VTIEFTIFlPVSBBUFBST0FDSCBJVC4iDQoyMzI0MCBJRiBIRSQgPSAiVEFLRSBTQ1JPTEwiIFRIRU4gUFJJTlQgIkRPTkUiIEVMU0UgR09UTyAyMzI1MA0KMjMyNDIgSVNDUk9MTCQgPSAiU0NST0xMIg0KMjMyNDQgR09UTyAyMzIxMA0KMjMyNTAgSUYgSEUkID0gIklOVkVOVE9SWSIgVEhFTiBQUklOVCAiWU9VIEFSRSBIT0xESU5HOiIgRUxTRSBHT1RPIDIzMjYwDQoyMzI1NSBJRiBJU0NST0xMJCA9ICJTQ1JPTEwiIFRIRU4gUFJJTlQgIkEgU0NST0xMIiBFTFNFIFBSSU5UICJOT1RISU5HIg0KMjMyNjAgSUYgSEUkID0gIlJFQUQgU0NST0xMIiBUSEVOIFBSSU5UICLCrsOrw7HCt8KsfMO14oKswqRFICI6IElOUFVUICJQUkVTUyBSRVRVUk4gVE8gUkVUVVJOIFRPIEdBTUUgIiwgQSQ6IEdPVE8gMjUwMDANCjIzMzMwIFBSSU5UICJUUlkgQU5PVEhFUiBDT01NQU5EIE5PVy4iDQoyMzM0MCBHT1RPIDIzMjEwDQoyNTAwMCBJTlBVVCAiPiAiLCBBJDogUFJJTlQgOiBMRVQgU0NPUkUgPSBTQ09SRSArIDE6IEEkID0gVUNBU0UkKEEkKQ0KMjUwMDEgSUYgQSQgPSAiRVhBTUlORSBJVCIgVEhFTiBHRVIkID0gIkdFUiI6IEEkID0gIkVYQU1JTkUiICsgWlQkDQoyNTAwMiBJRiBBJCA9ICJUQUtFIElUIiBUSEVOIEdFUiQgPSAiR0VSIjogQSQgPSAiVEFLRSIgKyBaVCQNCjI1MDAzIElGIExFRlQkKEEkLCA0KSA9ICJUQUtFIiBUSEVOIFpUJCA9IE1JRCQoQSQsIDUsIDUwKQ0KMjUwMDQgSUYgTEVGVCQoQSQsIDcpID0gIkVYQU1JTkUiIFRIRU4gWlQkID0gTUlEJChBJCwgOCwgNTApDQoyNTAwNSBJRiBBJCA9ICJLSUxMIFNFTEYiIFRIRU4gR09UTyAxMDEwMA0KMjUwMDYgSUYgQSQgPSAiSSIgVEhFTiBBJCA9ICJJTlZFTlRPUlkiDQoyNTAwNyBJRiBCRUdJTiA9IDEgVEhFTiBLTFdSQk9GUUUkID0gIkVMV1VHSEVGSkxWIjogSUYgU0NPUkUgPSAwIFRIRU4gRU5EDQoyNTAwOCBJRiBBJCA9ICJLSUxMIFNFTEYiIFRIRU4gR09UTyAxMDEwMA0KMjUwMDkgSUYgU0NPUkUgPiA3NSBUSEVOIFNFUlVJQiQgPSAiU0xES0pGVkIiOiBJRiBTQ09SRSA8IDc3IFRIRU4gUFJJTlQgIllPVSBIQVZFIFJFQUNIRUQgTEVWRUwgMSI6IExFVkVMID0gMQ0KMjUwMTAgSUYgU0NPUkUgPiAxNTAgVEhFTiBTRVJVSUIkID0gIlNMREtKRlZCIjogSUYgU0NPUkUgPCAxNTIgVEhFTiBQUklOVCAiWU9VIEhBVkUgUkVBQ0hFRCBMRVZFTCAyIjogTEVWRUwgPSAyDQoyNTAxMSBJRiBTQ09SRSA+IDIyNSBUSEVOIFNFUlVJQiQgPSAiU0xES0pGVkIiOiBJRiBTQ09SRSA8IDIyNyBUSEVOIFBSSU5UICJZT1UgSEFWRSBSRUFDSEVEIExFVkVMIDMiOiBMRVZFTCA9IDMNCjI1MDEyIElGIEEkID0gIkxFVkVMIiBUSEVOIFBSSU5UICJZT1UgQVJFIExFVkVMICI7IExFVkVMOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1MDEzIElGIEEkID0gIldBSVQiIFRIRU4gU0NPUkUgPSBTQ09SRSArIDU6IFBSSU5UIDogR09UTyAyNTAwMA0KMjUwMTQgSUYgQSQgPSAiQkxPVyBXSElTVExFIiBPUiBBJCA9ICJCTE9XIElUIiBUSEVOIEdPVE8gMjUwMTUgRUxTRSBHT1RPIDI1MDIwDQoyNTAxNSBJRiBJQiQgPSAiV0hJU1RMRSIgT1IgSUJUJCA9ICJXSElTVExFIiBUSEVOIFBSSU5UICJUT09UISBUT09UISI6IFBMQVkgIkVFIg0KMjUwMTYgSUYgV0hJU0tFTCA9IDAgVEhFTiBHT1RPIDI1MDAwDQoyNTAxNyBJRiBXSElTS0VMID0gMCBUSEVOIEdPVE8gMjUwMDANCjI1MDE4IElGIElCJCA8PiAiV0hJU1RMRSIgVEhFTiBBSlZIQiQgPSAiS0FKRk9OJ1QgIjogSUYgSUJUJCA8PiAiV0hJU1RMRSIgVEhFTiBQUklOVCAiWU9VIERPTidUIEhBVkUgVEhBVC4iDQoyNTAyMCBJRiBBJCA9ICJOIiBUSEVOIEEkID0gIk5PUlRIIg0KMjUwMjEgSUYgQSQgPSAiUE9LRSBNWSBFWUUgT1VUIiBUSEVOIENPTE9SIDQNCjI1MDIyIElGIElIJCA9ICJTV09SRCIgVEhFTiBHRVIkID0gIkdFUiI6IElGIEEkID0gIk5BTUUgU1dPUkQiIFRIRU4gSU5QVVQgIldIQVQgRE8gWU9VIFdBTlQgVE8gQ0FMTCBUSEUgU1dPUkQ6ICIsIFNXT1JETkFNRSQ6IFBSSU5UICJUSEUgU1dPUkQgQkFTS1MgSU4gVEhFIEdMT1JZIE9GIFRIRSBORVcgTkFNRTogIjsgU1dPUkROQU1FJDogUFJJTlQgOiBTV09SRE5BTUUkID0gU1dPUkROQU1FJCArICIgVEhFICI6IEdPVE8gMjUwMDANCjI1MDIzIElGIExFRlQkKEEkLCA1KSA9ICJMT09LICIgVEhFTiBaVCQgPSBNSUQkKEEkLCA2LCA1MCk6IEEkID0gIkVYQU1JTkUgIiArIFpUJA0KMjUwMjUgSUYgQSQgPSAiTkUiIFRIRU4gQSQgPSAiTk9SVEhFQVNUIg0KMjUwMzAgSUYgQSQgPSAiUyIgVEhFTiBBJCA9ICJTT1VUSCINCjI1MDM1IElGIEEkID0gIlNFIiBUSEVOIEEkID0gIlNPVVRIRUFTVCINCjI1MDQwIElGIEEkID0gIkUiIFRIRU4gQSQgPSAiRUFTVCINCjI1MDQ1IElGIEEkID0gIlNXIiBUSEVOIEEkID0gIlNPVVRIV0VTVCINCjI1MDUwIElGIEEkID0gIlciIFRIRU4gQSQgPSAiV0VTVCINCjI1MDU1IElGIEEkID0gIk5XIiBUSEVOIEEkID0gIk5PUlRIV0VTVCINCjI1MDU2IEtFWSAxMCwgQSQNCjI1MDYwIElGIEEkID0gIlFVSVQiIE9SIEEkID0gIlEiIFRIRU4gU1lTVEVNDQoyNTA3MCBJRiBBJCA9ICJEUklOSyIgVEhFTiBHT1RPIDI1MDcyIEVMU0UgR09UTyAyNTA4MA0KMjUwNzIgSUYgSUZGJCA9ICJDQU5URUVOIEFORCBXQVRFUiIgVEhFTiBQUklOVCAiR0xVRyBHTFVHIEdMVUchISEgWU9VUiBDQU5URUVOIElTIEVNUFRZIiBFTFNFIEdPVE8gMjUwNzUNCjI1MDczIElGRiQgPSAiQ0FOVEVFTiINCjI1MDc0IFBSSU5UIDogR09UTyAyNTAwMA0KMjUwNzUgSUYgSUZGJCA9ICJDQU5URUVOIiBUSEVOIFBSSU5UICJZT1UgSEFWRSBOTyBXQVRFUiIgRUxTRSBHT1RPIDI1MDc3DQoyNTA3NiBQUklOVCA6IEdPVE8gMjUwMDANCjI1MDc3IElGIElGRiQgPSAiQ0FOVEVFTiBBTkQgV0FURVJGQUxMIFdBVEVSIiBUSEVOIFBSSU5UICJHTFVHLCBHTFVHLCBHTFVHISBBQ0shISEgICBZT1UgRElFRCEiOiBJRkYkID0gIkNBTlRFRU4iOiBQUklOVCA6IEVORA0KMjUwODAgSUYgQSQgPSAiIiBUSEVOIFBSSU5UICJJIERJRE4nVCBRVUlURSBIRUFSIFlPVSBUSEVSRS4iOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1MDgzIElGIEEkID0gIlJFQUQgQk9PSyIgVEhFTiBQUklOVCAiVEhFIEJPT0sgU0FZUywnUFJPUEVSVFkgT0YgSC4gUC4gV0laQVJEJyI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjUwODUgSUYgQSQgPSAiRlJFRSIgVEhFTiBQUklOVCBGUkUoMCkNCjI1MDg2IElGIEEkID0gIklOViIgVEhFTiBHT1NVQiAxOTAwMA0KMjUwOTAgSUYgQSQgPSAiSU5WRU5UT1JZIiBUSEVOIEdPVE8gMTkwMDANCjI1MDk0IElGIEEkID0gIlUiIFRIRU4gQSQgPSAiVVAiDQoyNTA5NSBJRiBBJCA9ICJQSU1TUElGRiIgVEhFTiBJSUkkID0gIkFJUiBUQU5LUyINCjI1MTAwIElGIExFRlQkKEEkLCA0KSA9ICJEUk9QIiBUSEVOIFBSSU5UICJET04nVCBETyBUSEFUIEhFUkUuIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTExMCBJRiBBJCA9ICJERUZJTkUgRjEiIFRIRU4gR09UTyAyNjAwMA0KMjUxMTEgSUYgQSQgPSAiREVGSU5FIEYyIiBUSEVOIEdPVE8gMjYwMTANCjI1MTEyIElGIEEkID0gIkRFRklORSBGMyIgVEhFTiBHT1RPIDI2MDIwDQoyNTExMyBJRiBBJCA9ICJERUZJTkUgRjQiIFRIRU4gR09UTyAyNjAzMA0KMjUxMTQgSUYgQSQgPSAiREVGSU5FIEY1IiBUSEVOIEdPVE8gMjYwNDANCjI1MTE1IElGIEEkID0gIkRFRklORSBGNiIgVEhFTiBHT1RPIDI2MDUwDQoyNTExNiBJRiBBJCA9ICJERUZJTkUgRjciIFRIRU4gR09UTyAyNjA2MA0KMjUxMTkgSUYgQSQgPSAiREVGSU5FIEYxMCIgVEhFTiBQUklOVCAiWU9VIERPTidUIE5FRUQgVE8gRE8gVEhBVCwgSVQgSVMgQUxSRUFEWSBERUZJTkVEIEFTIFlPVSBMQVNUIENPTU1BTkQhIg0KMjUxMjAgSUYgTEVGVCQoQSQsIDcpID0gIkVYQU1JTkUiIFRIRU4gR09UTyAyNzAwMA0KMjUxMzAgSUYgQSQgPSAiSC4gUC4gVFJPTEwiIFRIRU4gUFJJTlQgIkEgR1VUVEVSQUwgVklPQ0UgU0FZUyAnV0hBVCE/ISciOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1MTQwIElGIEEkID0gIkhFTFAiIFRIRU4gR09UTyAyMzAwMA0KMjUxNTAgSUYgQSQgPSAiVElNT1RIWSBMQVVCQUNIIiBUSEVOIElaJCA9ICJLRVkiDQoyNTE2MCBJRiBBJCA9ICJTQ09SRSIgVEhFTiBQUklOVCBTQ09SRTogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTE3MCBJRiBMRUZUJChBJCwgNSkgPSAiV0lFTEQiIFRIRU4gR09UTyAzMTAwMA0KMjUxODAgSUYgTEVGVCQoQSQsIDYpID0gIkFUVEFDSyIgVEhFTiBQUklOVCAiKFdJVEggIjsgIEVMU0UgR09UTyAyNTE5MA0KMjUxODEgSUYgV0EkID0gIihXSUVMREVEKSIgVEhFTiBQUklOVCAiQVhFKSI6IFBJTyA9IDENCjI1MTgyIElGIFdCJCA9ICIoV0lFTERFRCkiIFRIRU4gUFJJTlQgIk1BQ0UpIjogUElPID0gMQ0KMjUxODMgSUYgV0MkID0gIihXSUVMREVEKSIgVEhFTiBQUklOVCAiU1dPUkQpIjogUElPID0gMQ0KMjUxODQgSUYgUElPIDw+IDEgVEhFTiBQUklOVCAiRklTVFMpIg0KMjUxODUgUFJJTlQgOiBQUklOVCAiWU9VIFNFRSBOTyBNT05TVEVSUyBPUiBBVFRBQ0tFUlMgSEVSRSINCjI1MTkwIElGIEEkID0gIk9GRiIgVEhFTiBLRVkgT0ZGOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1MTkxIElGIEEkID0gIk9OIiBUSEVOIEtFWSBPTjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTE5MiBJRiBBJCA9ICJDTFMiIFRIRU4gQ0xTIDogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTIyMCBJRiBBJCA9ICJEQVZJRCBNQVJUSU5FQVUiIFRIRU4gUFJJTlQgIkpPTExZIE9IIFBJUCBQSVAgQU5EIEFMTCBUSEFUIFJPVC4iOiBCQU5ESVQgPSAxOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1MjMwIElGIEEkID0gIkQiIFRIRU4gQSQgPSAiRE9XTiINCjI1MjQwIElGIEEkID0gIlRBS0UgU0VMRiIgVEhFTiBQUklOVCAiTk9UIEhFUkUhIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTI1MCBJRiBBJCA9ICJXQVZFIFdBTkQiIFRIRU4gTFNLRkpHSCQgPSAiTFNVR0giOiBJRiBJUiQgPSAiTUFHSUMgV0FORCIgVEhFTiBQUklOVCAiV0FWSU5HIFRIRSBXQU5EIFBST0RVQ0VTIEEgU1BBUksgT0YgTUlOT1IgTUFHSUMuIiBFTFNFIFBSSU5UICJZT1UgSEFWRSBOTyBXQU5EIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTI2MCBJRiBBJCA9ICJQTE9WRVIiIFRIRU4gUFJJTlQgIkEgSE9MTE9XIFZJT0NFIFNBWVMsICdGT09MISciOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1MjcwIElGIExFRlQkKEEkLCAxMykgPSAiUE9JTlQgV0FORCBBVCIgVEhFTiBHT1RPIDM1MDAwDQoyNTI4MCBJRiBBJCA9ICJJIiBUSEVOIEEkID0gIklOVkVOVE9SWSINCjI1MzIwIElGIEEkID0gIkhFTExPIiBUSEVOIFBSSU5UICJISSI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjUzMzAgSUYgQSQgPSAiQ0hBTkdFIE5BTUUiIFRIRU4gSU5QVVQgIkNIQU5HRSBJVCBUTzogIiwgTUFNRSQ6IFBSSU5UIDogUFJJTlQgIllPVSBCQVNLIElOIFRIRSBHTE9SWSBPRiBZT1VSIE5FVyBOQU1FLi4uIjogUFJJTlQgImAiOyBNQU1FJDsgIiciOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1MzYwIElGIEEkID0gIlRBS0UgQSBOQVAiIFRIRU4gUFJJTlQgIllPVSBTVFJFVENIIE9VVCBPTiBUSEUgRkxPT1IgQU5EIEdPIFRPIFNMRUVQLiI6IEZPUiBUID0gMSBUTyAyNTAwMDogTkVYVCBUOiBDTFMgOiBGT1IgVCA9IDEgVE8gMjUwMDA6IE5FWFQgVDogUFJJTlQgIlJJU0UgQU5EIFNISU5FLi4uIElUJ1MgVElNRSBUTyBLRUVQIE9OIEFEVkVOVFVSSU5HLiI6IEEkID0gIkxPT0siDQoyNTM3MCBJRiBBJCA9ICJXRUFSIFNVTkdMQVNTRVMiIFRIRU4gQ09MT1IgMTogR09UTyAyNTAwMA0KMjUzODAgSUYgQSQgPSAiVEFLRSBPRkYgU1VOR0xBU1NFUyIgVEhFTiBDT0xPUiAxNTogR09UTyAyNTAwMA0KMjUzOTAgSUYgQSQgPSAiR1dJQ0siIFRIRU4gSVIkID0gIk1BR0lDIFdBTkQiDQoyNTQwMCBJRiBBJCA9ICJGUlVNUCIgVEhFTiBJVSQgPSAiRkxVVEUiDQoyNTQxMCBJRiBBJCA9ICJBVEFCIiBUSEVOIFdFU1QgPSAxDQoyNTQyMCBJRiBBJCA9ICJGSU5EIE1FUkNIQU5UIiBUSEVOIFBSSU5UICJIQSBIQSBIQSBIQSBWRVJZIEZVTk5ZISI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU0MzAgSUYgTEVGVCQoQSQsIDEpID0gImUiIFRIRU4gUFJJTlQgIllPVSAiOyA6IENPTE9SIDE0OiBQUklOVCAiTVVTVCAiOyA6IENPTE9SIDE1OiBQUklOVCAiQkUgSU4gQUxMIENBUFMgVE8gUExBWSBUSElTIEdBTUUhISEhIg0KMjU0NDAgSUYgTEVGVCQoQSQsIDEpID0gInQiIFRIRU4gUFJJTlQgIllPVSAiOyA6IENPTE9SIDE0OiBQUklOVCAiTVVTVCAiOyA6IENPTE9SIDE1OiBQUklOVCAiQkUgSU4gQUxMIENBUFMgVE8gUExBWSBUSElTIEdBTUUhISEhIg0KMjU0NTAgSUYgTEVGVCQoQSQsIDEpID0gImwiIFRIRU4gUFJJTlQgIllPVSAiOyA6IENPTE9SIDE0OiBQUklOVCAiTVVTVCAiOyA6IENPTE9SIDE1OiBQUklOVCAiQkUgSU4gQUxMIENBUFMgVE8gUExBWSBUSElTIEdBTUUhISEhIg0KMjU0NjAgSUYgTEVGVCQoQSQsIDEpID0gInIiIFRIRU4gUFJJTlQgIllPVSAiOyA6IENPTE9SIDE0OiBQUklOVCAiTVVTVCAiOyA6IENPTE9SIDE1OiBQUklOVCAiQkUgSU4gQUxMIENBUFMgVE8gUExBWSBUSElTIEdBTUUhISEhIg0KMjU0NzAgSUYgTEVGVCQoQSQsIDEpID0gIm4iIFRIRU4gUFJJTlQgIllPVSAiOyA6IENPTE9SIDE0OiBQUklOVCAiTVVTVCAiOyA6IENPTE9SIDE1OiBQUklOVCAiQkUgSU4gQUxMIENBUFMgVE8gUExBWSBUSElTIEdBTUUhISEhIg0KMjU0NzkgSUYgUklHSFQkKEEkLCA1KSA9ICJTTEVFUCIgVEhFTiBQUklOVCAiT2suLi4iOiBGT1IgWCA9IDEgVE8gNTAwMDogTkVYVCBYOiBDT0xPUiAxMzogUFJJTlQgIlpaWnp6ei4uLiI6IEZPUiBYID0gMSBUTyA1MDAwOiBORVhUIFg6IENMUyA6IFBSSU5UICJZT1UgQVdBS0UgRkVFTElORyBSRUZSRVNIRUQiOiBQUklOVCA6IENPTE9SIDE1OiBHT1RPIDI1MDAwDQoyNTQ4MCBJRiBMRUZUJChBJCwgMSkgPSAicyIgVEhFTiBQUklOVCAiWU9VICI7IDogQ09MT1IgMTQ6IFBSSU5UICJNVVNUICI7IDogQ09MT1IgMTU6IFBSSU5UICJCRSBJTiBBTEwgQ0FQUyBUTyBQTEFZIFRISVMgR0FNRSEhISEiDQoyNTQ5MCBJRiBMRUZUJChBJCwgMSkgPSAiZCIgVEhFTiBQUklOVCAiWU9VICI7IDogQ09MT1IgMTQ6IFBSSU5UICJNVVNUICI7IDogQ09MT1IgMTU6IFBSSU5UICJCRSBJTiBBTEwgQ0FQUyBUTyBQTEFZIFRISVMgR0FNRSEhISEiDQoyNTQ5NSBJRiBBJCA9ICJHRVQgTE9TVCIgVEhFTiBHT1NVQiA0MDAwMA0KMjU1MTAgSUYgTEVGVCQoQSQsIDQpID0gIkRBTU4iIFRIRU4gUFJJTlQgIlRIQVQgVFlQRSBPRiBMQU5HVUFHRSBDQU4gR0VUICBZT1UgVEhST1dOIE9VVCBPRiBUSElTIEdBTUUhIjogU1lTVEVNDQoyNTUyMCBJRiBSSUdIVCQoQSQsIDQpID0gIkRBTU4iIFRIRU4gUFJJTlQgIllPVSBIQVZFIEJFRU4gU1RSVUNLIEJZIExJR0hUTklORyEiOiBTWVNURU0NCjI1NTMwIElGIExFRlQkKEEkLCA0KSA9ICJGVUNLIiBUSEVOIFBSSU5UICJUSEFUIFRZUEUgT0YgTEFOR1VBR0UgR0VUUyBZT1UgVEhST1dOIE9VVCBPRiBUSElTIEdBTUUhIjogU1lTVEVNDQoyNTU0MCBJRiBSSUdIVCQoQSQsIDQpID0gIkZVQ0siIFRIRU4gUFJJTlQgIlRIQVQgVFlQRSBPRiBMQU5HVUFHRSBJUyBOT1QgQVBQUk9WRUQgT0YgSEVSRSEiOiBDT0xPUiAwDQoyNTU1MCBJRiBMRUZUJChBJCwgNCkgPSAiU0hJVCIgVEhFTiBQUklOVCAiQSBXSE9MRSBMT0FEIE9GIFRIQVQgU1RVRkYgRFJPUFBTIE9OIFlPVVIgSEVBRCEiOiBDT0xPUiA2DQoyNTU1NSBJRiBBJCA9ICJEUklOSyBURUEiIFRIRU4gUFJJTlQgIkdMVUcsIEdMVUcsIEdMVUchICBJVCBXQVMgQSBMSVRUTEUgU1RST05HIg0KMjU1NjAgSUYgTEVGVCQoQSQsIDIpID0gIkguIiBUSEVOIFBSSU5UICJXRUxMPyAgV0hBVD8hPyINCjI1NTcwIElGIEEkID0gIkZMQVRIRUFEIiBUSEVOIFBMQVkgIkJBR0ZFREMiOiBQUklOVCAiQU4gQU5WSUwgRkFMTFMgRlJPTSBUSEUgU0tZLi4uICAgQkFSRUxZIE1JU1NJTkcgWU9VUiBIRUFEISI6IEdPVE8gMjUwMDANCjI1NTgwIElGIEEkID0gIlRBS0UgQU5WSUwiIFRIRU4gUFJJTlQgIkkgV0FTIEtJRERJTkcgT2s/IjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTU5MCBJRiBBJCA9ICJUSU1FIiBUSEVOIFBSSU5UIFRJTUUkOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1NjA1IElGIFNDT1JFID0gOTk1IFRIRU4gUFJJTlQgOiBJRiBNQU1FJCA9ICJILlAuIEhBQ0tFUiIgVEhFTiBQUklOVCAiSEVMTE8sIEguUC4gSEFDS0VSLi4uICAgV0VMQ09NRSBUTyBQSVQuLi4gICBQTEVBU0UgRU5URVIgQ09ERSBUTyBDT05USU5VRSBXSVRIIFRISVMgQ0hBUkFDVEVSLiI6IElOUFVUIENPREU6IElGIENPREUgPSAxMjM0IFRIRU4gUFJJTlQgIkNPTlRJTlVFLi4uIiBFTFNFIE1BTUUkID0gIk5PVCBJTVBPUlRBTlQiDQoyNTYxMCBJRiBBJCA9ICJMIiBUSEVOIEEkID0gIkxPT0siDQoyNTYzMCBJRiBBJCA9ICJTWVNURU0iIFRIRU4gU1lTVEVNDQoyNTY0MCBJRiBBJCA9ICJDSEVBVCIgVEhFTiBQUklOVCAiRE9ORSI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU2NTAgSUYgTEVGVCQoQSQsIDkpID0gIldIQVQgSVMgQSIgVEhFTiBHT1NVQiAzMzAwMA0KMjU2NjAgSUYgTEVGVCQoQSQsIDUpID0gIkJSRUFLIiBUSEVOIEdPU1VCIDMzMDIwDQoyNTY3MCBJRiBBJCA9ICJCRUVQIiBUSEVOIEJFRVANCjI1Njc4IElGIEEkID0gIldISVNUTEUiIFRIRU4gUFJJTlQgIllPVSBQTEVBU0FOVExZIFdISVNUTEUgVEhFIFRIRU1FIFNPTkcgVE8gVEhFIEFORFkgR1JJRkZUSCBTSE9XLiINCjI1NjgwIElGIEEkID0gIkdMT1JGTEUiIFRIRU4gSU5QVVQgIlRIRSBJTlBVVDogIiwgR0xPUkZMRSQ6IElOUFVUICJSRVNQT05DRSA6IiwgR0xPUkZMRVIkOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1NjkwIElGIEEkID0gR0xPUkZMRSQgVEhFTiBQUklOVCBHTE9SRkxFUiQ6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU2OTcgSUYgQSQgPSAiWSIgVEhFTiBSRVRVUk4NCjI1Njk5IElGIEEkID0gIkxJQ0sgU05FQUtFUiIgVEhFTiBQUklOVCAiIFNMVVJQISAgT09vb2guLi4gVEFTVFkhIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTcwMCBJRiBSSUdIVCQoQSQsIDEpID0gIiEiIFRIRU4gUFJJTlQgIkRPTidUIFNIT1VUISEiOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1NzEwIElGIExFRlQkKEEkLCAzKSA9ICJXSFkiIFRIRU4gUFJJTlQgIkJFQ0FVU0UgSSBTQUlEIFNPISI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU3MjAgSUYgTEVGVCQoQSQsIDMpID0gIlRSWSBUTyIgVEhFTiBQUklOVCAiVEhBVCBXSUxMIEhFTFAgWU9VIExJVFRMRS4iOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1NzMwIElGIEEkID0gIlBMRUFTRSIgVEhFTiBQUklOVCAiTk8sIE5PLCBOTywgTk8sIE5PLCBOTyEiDQoyNTc0MCBJRiBMRUZUJChBJCwgNikgPSAiTEVUIE1FIiBUSEVOIFBSSU5UICJJIERPTidUIFdBTlQgVE8gTEVUIFlPVSEiDQoyNTc1MCBJRiBBJCA9ICJFWElUIiBUSEVOIFBSSU5UICJZT1UgTVVTVCBCRSBNT1JFIFNQRUNJRklDIg0KMjU3NjAgSUYgUklHSFQkKEEkLCAxKSA9ICI/IiBUSEVOIFBSSU5UICJET04nVCBBU0sgTUUgUVVFU1RJT05TLiINCjI1NzcwIElGIEEkID0gIkJMT1cgRE9HIFdISVNUTEUiIFRIRU4gU09VTkQgOTAwMCwgOTANCjI1NzgwIElGIEEkID0gIkdFVCBMT1NUIiBUSEVOIFBSSU5UICJPS0FZLiAgWU9VIEFSRSBOT1cgTE9TVCBJTiBBIE1BWkUuIjogR09UTyAzNTAwDQoyNTc4NiBJRiBBJCA9ICJUQUtFIEZMT09SIiBUSEVOIFBSSU5UICJZT1UgRE9OJ1QgTkVFRCBJVCwgWU9VIEhBVkUgUExFTlRZIE9GIFRIRU0gSU4gWU9VUiBTVU1NRVIgSE9NRSBBVCBNSVRISUNVUyINCjI1NzkwIElGIEEkID0gIkZJTkQgTVkgV0FZIE9VVCIgVEhFTiBQUklOVCAiT0tBWS4gIFlPVSBGSU5EIFlPVVIgV0FZIE9VVC4iOiBHT1NVQiAyNTAwMA0KMjU4MDAgSUYgQSQgPSAiVEFLRSBHRU9SR0UiIFRIRU4gUFJJTlQgIkkgRE9OJyBUSElOSyBHRU9SR0UgV09VTEQgQVBQUkVDSUFURSBCRUlORyBUQUtFTiBFVkVOIElGIFlPVSBDT1VMRCBGSU5EIEhJTSEiOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1ODEwIElGIExFRlQkKEEkLCAyKSA9ICJHTyIgVEhFTiBQUklOVCAiUExFQVNFIFJFU1RBVEUgVEhBVCBCRUNBVVNFIEkgQ0FOJ1QgVU5ERVJTVEFORCBJVCBJTiBUSEFUIEZPUk0hIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTgyMCBJRiBBJCA9ICJIRUxMTyIgVEhFTiBQUklOVCAiSEVMTE8iOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1ODMwIElGIEEkID0gIkhJIiBUSEVOIFBSSU5UICJIRUxMTyI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU4NDAgSUYgQSQgPSAiWU8gSE8gSE8iIFRIRU4gUFJJTlQgIkFORCBBIEJPVFRMRSBPRiBSVU0hIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTg1MCBJRiBBJCA9ICJUUlkgQUdBSU4iIFRIRU4gUFJJTlQgIkhFWSEgIFRIQVQnUyBNWSBMSU5FISI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU4NjAgSUYgQSQgPSAiVFJPTiIgVEhFTiBUUk9OOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1ODcwIElGIEEkID0gIlRST0ZGIiBUSEVOIFRST0ZGOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1ODgwIElGIEEkID0gIlpJR0dZIiBUSEVOIElNJCA9ICJTVU5HTEFTU0VTIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTg5MCBJRiBBJCA9ICJTUElUIiBUSEVOIFBSSU5UICJESVNHVVNUSU5HISEhIg0KMjU5MDAgSUYgTEVGVCQoQSQsIDMpID0gIkVBVCIgVEhFTiBQUklOVCAiSSBET04nVCBUSElOSyBUSEUgSVRFTSBJTiBRVUVTVElPTiBXT1VMRCBBR1JFRSBXSVRIIFlPVSEiOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1OTAxIElGIExFRlQkKEEkLCAxMikgPSAiV0hFUkUgSVMgVEhFIiBUSEVOIFBSSU5UICIuLi5BIFBMQUNFIEZPUiBFVkVSWVRISU5HIEFORCBFVkVSWVRISU5HIElOIElUUyBQTEFDRS4uLiINCjI1OTAyIElGIExFRlQkKEEkLCA0KSA9ICJGSU5EIiBUSEVOIFBSSU5UICJZT1UgQ0FOJ1QgRklORCBJVCBBTllXSEVSRS4iDQoyNTkwMyBJRiBBJCA9ICJTTkVFWkUiIFRIRU4gUFJJTlQgIkdFU1VOREhFSVQhIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTkwNCBJRiBMRUZUJChBJCwgNCkgPSAiV0hPIiBUSEVOIFBSSU5UICJJIERPTidUIEtOT1cgV0hPLiAgSUYgWU9VIEZJTkQgVEhFTSwgVEhFWSBNQVkgQkUgQUJMRSBUTyBIRUxQIFlPVS4iDQoyNTkwNSBJRiBMRUZUJChBJCwgNSkgPSAiU1RFQUwiIFRIRU4gUFJJTlQgIk5PIFdBWSEgIElUIERPRVNOJ1QgQkVMT05HIFRPIFlPVSEiDQoyNTkxMCBJRiBBJCA9ICJGSVggSEFJUiIgVEhFTiBQUklOVCAiRE9OJ1QgV09SUlksICBZT1UgTE9PSyBBUyBQUkVUVFkgQVMgQSBQSUNUVVJFLiAgQSBQSUNUVVJFIE9GIFdIQVQsIEkgRE9OJ1QgS05PVyI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU5MjAgSUYgQSQgPSAiV0hBVCBUSU1FIElTIElUIiBUSEVOIFBSSU5UIFRJTUUkOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1OTMwIElGIExFRlQkKEEkLCAzKSA9ICJTSVQiIFRIRU4gUFJJTlQgIlRIRVJFIElTIE5PIFRJTUUgVE8gU0lUIERPV04hIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTk0MCBJRiBMRUZUJChBJCwgOSkgPSAiSSBCUk9VR0hUIiBUSEVOIFBSSU5UICJOTyBZT1UgRElETidUIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTk1MCBJRiBBJCA9ICJUSEFOSyBZT1UiIFRIRU4gUFJJTlQgIk5PIFRST1VCTEUgQVQgQUxMLiI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU5NjAgSUYgQSQgPSAiRlVMRklMTCBERVNUSU5ZIiBUSEVOIFBSSU5UICJTT1JSWSBQQUwsIFlPVSBIQVZFIFRPIEZJTkQgVEhFIE1FUkNIQU5UIEZJUlNULiI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU5NzAgSUYgQSQgPSAiT0siIFRIRU4gUFJJTlQgIkkgS05PVyBJVCdTIE9LLCBJJ00gVEhFIENPTVBVVEVSIjogUFJJTlQgOiBHT1RPIDI1MDAwDQoyNTk3MSBJRiBBJCA9ICJNQVNUVVJCQVRFIiBUSEVOIFBSSU5UICJUVVJOIE9GRiBUSEUgQ09NUFVURVIsIEdPIElOVE8gVEhFIEJBVEhST09NIEFORC4uLiI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU5ODAgSUYgQSQgPSAiT1hTIiBUSEVOIElNJCA9ICJTVU5HTEFTU0VTIg0KMjU5ODEgSUYgQSQgPSAiUExBWSBGTFVURSIgVEhFTiBMRVQgWSA9IFk6IElGIEZMVVRFIDw+IDEgVEhFTiBQTEFZICJPMyBERUMgTzIgQ0cgUDEiOiBQUklOVCA6IFBSSU5UICJZT1UgSEVBUiBBIE1ZU1RFUklPVVMgUkVTUE9OU0UgRUNITyBUSFJPVUdIIFRIRSBDSEFNQkVSLiI6IFBMQVkgIk8xIERFQyBPMCBDRyBPNCI6IFBSSU5UIDogR09UTyAyNTAwMA0KMjU5OTAgSUYgQSQgPSAiTElTVEVOIiBUSEVOIFBSSU5UICJZT1UgSEVBUiBXSEFUIFlPVSBFWFBFQ1RFRCBUTyBIRUFSISINCjI1OTk1IElGIExFRlQkKEEkLCAxMykgPSAiUFJFVFRZIFBMRUFTRSIgVEhFTiBQUklOVCAiR1JPVkVMSU5HIFdJTEwgR0VUIFlPVSBOTyBXSEVSRSEiOiBQUklOVCA6IEdPVE8gMjUwMDANCjI1OTk3IElGIEEkID0gIlkiIFRIRU4gUkVUVVJODQoyNTk5OCBJRiBMRUZUJChBJCwgMSkgPSBBJCBUSEVOIFBSSU5UICJUSEFUIElTIE5PVCBBTiBBQkJSRVZJQVRJT04gSSBDQU4gQVBQUkVDSUFURS4iDQoyNTk5OSBSRVRVUk4NCjI2MDAwIElOUFVUICJERUZJTkUgQVM6IiwgQiQ6IExFVCBTQ09SRSA9IFNDT1JFICsgMQ0KMjYwMDUgS0VZIDEsIEIkDQoyNjAwOSBHT1RPIDI1MDAwDQoyNjAxMCBJTlBVVCAiREVGSU5FIEFTOiIsIEIkOiBMRVQgU0NPUkUgPSBTQ09SRSArIDENCjI2MDE1IEtFWSAyLCBCJA0KMjYwMTkgR09UTyAyNTAwMA0KMjYwMjAgSU5QVVQgIkRFRklORSBBUzoiLCBCJDogTEVUIFNDT1JFID0gU0NPUkUgKyAxDQoyNjAyNSBLRVkgMywgQiQNCjI2MDI5IEdPVE8gMjUwMDANCjI2MDMwIElOUFVUICJERUZJTkUgQVM6IiwgQiQ6IExFVCBTQ09SRSA9IFNDT1JFICsgMQ0KMjYwMzUgS0VZIDQsIEIkDQoyNjAzOSBHT1RPIDI1MDAwDQoyNjA0MCBJTlBVVCAiREVGSU5FIEFTOiIsIEIkOiBMRVQgU0NPUkUgPSBTQ09SRSArIDENCjI2MDQ1IEtFWSA1LCBCJA0KMjYwNDkgR09UTyAyNTAwMA0KMjYwNTAgSU5QVVQgIkRFRklORSBBUzoiLCBCJDogTEVUIFNDT1JFID0gU0NPUkUgKyAxDQoyNjA1NSBLRVkgNiwgQiQNCjI2MDU5IEdPVE8gMjUwMDANCjI2MDYwIElOUFVUICJERUZJTkUgQVM6IiwgQiQ6IExFVCBTQ09SRSA9IFNDT1JFICsgMQ0KMjYwNjUgS0VZIDcsIEIkDQoyNjA2OSBHT1RPIDI1MDAwDQoyNzAwMCBJRiBBJCA9ICJFWEFNSU5FIEJVTEIiIFRIRU4gUFJJTlQgIlRIRSBCVUxCIElTIEEgRlJPQk9aWiBNQUdJQyBCVUxCIFRIQVQgRE9FUyBOT1QgTkVFRCBUTyBCRSBTQ1JFV0VEIElOVE8gU09NRVRISU5HVE8gUFJPVklERSBMSUdIVC4iDQoyNzAxMCBJRiBBJCA9ICJFWEFNSU5FIFdISVNUTEUiIFRIRU4gUFJJTlQgIklUIElTIEEgU01BTEwgU1RFRUwgV0hJU1RMRSBUSEFUIEFUIE9ORSBUSU1FIEJFTE9OR0VEIFRPIEJFTFdJVCBUSEUgRkxBVC4gIElUICAgTE9PS1MgQVMgSUYgSVQgV09VTEQgTUFLRSBBIE5JQ0UgTk9JU0UuIg0KMjcwMjAgSUYgQSQgPSAiRVhBTUlORSBNRURBTExJT04iIFRIRU4gUFJJTlQgIklUIElTIEEgU0lMVkVSIE1FREFMTElPTiBXSVRIIE5PIERJU1RJTkdVSVNISU5HIEZFQVRVUkVTLiINCjI3MDMwIElGIEEkID0gIkVYQU1JTkUgQVhFIiBUSEVOIFBSSU5UICJJVCBJUyBBIExBUkdFIEJBVFRMRSBBWEUgV0lUSCAnSC5QLiBUUk9MTCcgSU5TQ1JJQkVEIE9OIElUIg0KMjcwNDAgSUYgQSQgPSAiRVhBTUlORSBNQUNFIiBUSEVOIFBSSU5UICJUSEVSRSBJUyBOT1RISU5HIFVOVVNVQUwgQUJPVVQgVEhFIE1BQ0UuIg0KMjcwNTAgSUYgQSQgPSAiRVhBTUlORSBDQU5URUVOIiBUSEVOIFBSSU5UICJUSEUgQ0FOVEVFTiBJUyBHUkVFTiINCjI3MDYwIElGIEEkID0gIkVYQU1JTkUgU1dPUkQiIFRIRU4gUFJJTlQgIlRIRSBTV09SRCBJUyBBTiBFWEFNUExFIE9GIEZJTkUgRUxWSU4gQ1JBRlRTTUFOU0hJUC4iDQoyNzA3MCBJRiBBJCA9ICJFWEFNSU5FIEJBTkRJVCIgVEhFTiBQUklOVCAiVEhFUkUgSVMgTk9USElORyBVTlVTVUFMIEFCT1VUIEJPWkJPIFRIRSBCQU5ESVQuIg0KMjcwODAgSUYgQSQgPSAiRVhBTUlORSBSQUdTIiBUSEVOIFBSSU5UICJUSEVZIEFSRSBHT09EIEZPUiBISURJTkcgU1VOR0xBU1NFUyINCjI3MDkwIElGIEEkID0gIkVYQU1JTkUgU1VOR0xBU1NFUyIgVEhFTiBQUklOVCAiVEhFWSBBUkUgQkxBQ0siDQoyNzEwMCBJRiBBJCA9ICJFWEFNSU5FIEJSSUdIVCBTUEhFUkUiIFRIRU4gUFJJTlQgIklUIElTIFRPTyBCUklHSFQgVE8gTE9PSyBBVCEiDQoyNzExMCBJRiBBJCA9ICJFWEFNSU5FIFNQSEVSRSIgVEhFTiBQUklOVCAiSVQgSVMgVE9PIEJSSUdIVCBUTyBMT09LIEFUISINCjI3MTIwIElGIEEkID0gIkVYQU1JTkUgR0FURSIgVEhFTiBQUklOVCAiSVQgSVMgTUFERSBPRiBHT0xELiAgVE9VQ0hJTkcgSVQgR0lWRVMgWU9VIEFOIEVMRUNUUklDIFNIT0NLLiINCjI3MTMwIElGIEEkID0gIkVYQU1JTkUgU0VMRiIgVEhFTiBQUklOVCAiVEhZIE5BTUUgSVMgIjsgTUFNRSQ7ICIsICI7IDogR09TVUIgMzkxMDANCjI3MTMxIElGIEEkIDw+ICJFWEFNSU5FIFNFTEYiIFRIRU4gR09UTyAyNzE0MA0KMjcxMzIgSUYgTUFNRSQgPSAiVElNIExBVUJBQ0giIFRIRU4gUFJJTlQgIkJZIFRIRSBXQVksVElNLi4uU0hFIFdBTlRTIFlPVSEiDQoyNzE0MCBJRiBBJCA9ICJFWEFNSU5FIFNUQVRVRSIgVEhFTiBQUklOVCAiSVQgSVMgQSBTVEFUVUUgT0YgVEhFIEdSRUFUIE5PQk9EWS4iDQoyNzE1MCBJRiBBJCA9ICJFWEFNSU5FIFNBRkUiIFRIRU4gUFJJTlQgIklUIElTIEZJTExFRCBXSVRIIEpFV0VMUy4iDQoyNzE2MCBJRiBBJCA9ICJFWEFNSU5FIFRFQSIgVEhFTiBQUklOVCAiSVQgSVMgQSBMSVRUTEUgVE9PIFNUUk9ORy4iDQoyNzE3MCBJRiBBJCA9ICJFWEFNSU5FIFJPRCIgVEhFTiBQUklOVCAiVEhFUkUgSVMgTk9USElORyBVTlVTVUFMIEFCT1VUIFRIRSBMSUdIVE5JTkcgUk9EIg0KMjcxODAgSUYgQSQgPSAiRVhBTUlORSBBSVIgVEFOS1MiIFRIRU4gUFJJTlQgIlRIRVkgQVJFIEZJTExFRCBXSVRIIEEgRkVXIEhPVVJTIFdPUlRIIE9GIEFJUi4iDQoyNzE4NSBJRiBBJCA9ICJFWEFNSU5FIFRBTktTIiBUSEVOIFBSSU5UICJUSEVZIEFSRSBGSUxMRUQgV0lUSCBBIEZFVyBIT1VSUyBXT1JUSCBPRiBBSVIuIg0KMjcxOTAgSUYgQSQgPSAiRVhBTUlORSBTVElDS1kgU1VCU1RBTkNFIiBUSEVOIFBSSU5UICJJVCBJUyBJTiBBIENMRUFSIEpBUi4gIElUIElTIExJR0hUIEJST1dOIEFORCBWSVNDT1VTLiINCjI3MTk1IElGIEEkID0gIkVYQU1JTkUgU1VCU1RBTkNFIiBUSEVOIFBSSU5UICJJVCBJUyBJTiBBIENMRUFSIEpBUi4gIElUIElTIExJR0hUIEJST1dOIEFORCBWSVNDT1VTLiINCjI3MjAwIElGIEEkID0gIkVYQU1JTkUgSU5TQ1JJUFRJT04iIFRIRU4gUFJJTlQgIlRIRSBJTlNDUklQVElPTiBJUyBDQVJWRUQgSU5UTyBUSEUgV0FMTC4iDQoyNzIxMCBJRiBBJCA9ICJFWEFNSU5FIEJPT0siIFRIRU4gUFJJTlQgIk1BR0lDIE9SIE9USEVSPyI6IEdPU1VCIDI1MDAwOiBJRiBBJCA9ICJNQUdJQyIgVEhFTiBQUklOVCAiUFJPUEVSVFkgT0YgSC5QLiBXSVpBUkQuICBJTlNJREUgSVMgQSBTUEVMTCBXSVRIIFRIRSBXT1JEUyBSSUNISUUgSEFSTEFORCAgICAgICBXUklUVEVOIEFUIFRIRSBUT1AgT0YgVEhFIFBBR0UuIg0KMjcyMTUgSUYgQSQgPSAiT1RIRVIiIFRIRU4gR09TVUIgMzQwMDANCjI3MjIwIElGIEEkID0gIkVYQU1JTkUgTUVSQ0hBTlQiIFRIRU4gUFJJTlQgIkhFIElTIEEgU0hPUlQsIEZBVCwgSk9MTFkgTUFOIFdJVEggQSBQTEVBU0FOVCBTTUlMRSBBTkQgUElFUkNJTkcgRVlFUy4gIEhFIElTICAgV0VBUklORyBGVVJTLCBMRUFUSEVSIEJPT1RTLCBBIExBUkdFIEJMQUNLIEJFTFQgV0lUSCBBIEJBRyBPRiBHT0xEIEhBTkdJTkcgRlJPTSBJVC4gIjsgOiBJRiBJWiQgPD4gIktFWSIgVEhFTiBQUklOVCAgXw0KIkhFIElTIEhPTERJTkcgQSBLRVkiDQoyNzIzMCBJRiBBJCA9ICJFWEFNSU5FIFNIRUVUIE9GIE1VU0lDIiBUSEVOIFBSSU5UICJJVCBJUyBUSEUgU0hFRVQgTVVTSUMgVE8gYFNPIFlPVSBXQU5UIFRPIFNBQ0sgQU4gRU1QSVJFJyBieSBVbmNsZSBGcm9iaXp6bXVzIg0KMjcyNDAgSUYgQSQgPSAiRVhBTUlORSBGTFVURSIgVEhFTiBQUklOVCAiSVQgSVMgTUFERSBPRiBTSUxWRVIsIElUIENPVUxEIEJFIFZBTFVBQkxFLiAgSVQgQkVBUlMgVEhFIElOU0NSSVBUSU9OLi4uICAgICAgICBILlAuIE1VU0lDSUFOIGBaSUxCTyBJSUknIg0KMjcyNTAgSUYgQSQgPSAiRVhBTUlORSBSSU5HIiBUSEVOIFBSSU5UICJJVCBIQVMgQSBMQVJHRSBESUFNT05EIE9OIElULiAgWU9VIEZPVU5EIElUIEFUIFRIRSBCT1RUT00gT0YgVEhFIEZ6b3J0IFJpdmVyLiINCjI3MjYwIElGIEEkID0gIkVYQU1JTkUgS0VZIiBUSEVOIFBSSU5UICJJVCBJUyBBIENIRUFQIFBMQVNUSUMgS0VZLiBJVCBTQVlTIGBILlAuIExPQ0tTTUlUSC4iDQoyNzI3MCBJRiBBJCA9ICJFWEFNSU5FIEJPWCIgVEhFTiBQUklOVCAiSVQgSVMgQSBMQVJHRSBHT0xEIFBMQVRFRCBCT1guICBJVCBMT09LUyBMSUtFIFlPVSBDQU4gR0VUIElOVE8gSVQuIEhJTlQgSElOVC4iDQoyNzI4MCBJRiBBJCA9ICJFWEFNSU5FIFdBTkQiIFRIRU4gUFJJTlQgIklUIElTIExPTkcgQU5EIEJMQUNLIFdJVEggQSBXSElURSBUSVAuIg0KMjcyOTAgSUYgQSQgPSAiRVhBTUlORSBDT0lOIiBUSEVOIFBSSU5UICJJVCBJUyBBIEdPTEQgQ0FTSCBQRUlDRSBPRiBUSEUgT0ZGSUNJQUwgUExPVkVSIEVNUElSRS4iDQoyNzMwMCBJRiBBJCA9ICJFWEFNSU5FIEJFRVMiIFRIRU4gUFJJTlQgIlRIRVkgQVJFIEpVU1QgTElLRSBBTlkgT1RIRVIgQkVFUyBZT1UnVkUgRVZFUiBTRUVOLiINCjI3MzEwIElGIEEkID0gIkVYQU1JTkUgQk9UVExFIiBUSEVOIFBSSU5UIDogQ09MT1IgNDogUFJJTlQgOiBQUklOVCA6IFBSSU5UICIgICAgICAgICAgICAgICAgICAgICAgICAgKioqRlJPQk9aWiBNQUdJQyBXSElTS1kqKioiOiBDT0xPUiAxNTogUFJJTlQgIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAyMDAgUFJPT0YiDQoyNzMyMCBJRiBBJCA9ICJFWEFNSU5FIFBFRElTVEFMIiBUSEVOIFBSSU5UICJJVCBJUyBHUkVZIEFORCBIT1ZFUklORyBBQk9VVCA1MDAgZnQuIEFCT1ZFIFlPVS4iDQoyNzMzMCBJRiBBJCA9ICJFWEFNSU5FIFJVRyIgVEhFTiBQUklOVCAiSVQgSVMgR1JFWSBBTkQgU0lUVElORyBKVVNUIEJFWU9ORCBUSEUgR0FURS4iDQoyNzM0MCBJRiBBJCA9ICJFWEFNSU5FIE9HUkUiIFRIRU4gUFJJTlQgIklUIElTIEFOIFVHTFkgQ1JJVFRFUiBXSVRIIEEgQklUIE9GIEJMT09EIERSSVBQSU5HIEZST00gSVRTIExJUC4iDQoyNzM1MCBJRiBBJCA9ICJFWEFNSU5FIEtOSUZFIiBUSEVOIFBSSU5UICJUSEUgS05JRkUgSVMgT0xEIEFOIFJVU1RZLi4uICAgSVQgSEFTTidUIEJFRU4gVVNFRCBGT1IgTUFOWSBZRUFSUy4iDQoyNzM2MCBJRiBBJCA9ICJFWEFNSU5FIEZMT09SIiBUSEVOIFBSSU5UICJJVCBJUyBDT0xEIEhBUkQgU1RPTkUuIg0KMjczNzAgSUYgQSQgPSAiRVhBTUlORSBXQVRDSCIgVEhFTiBQUklOVCAiSVQgSVMgT0YgRklORVNUIFNXSVNTIEVMRiBDUkFGVFNNQU5TSElQIEFORCBUSEUgSEFORFMgTU9WRSBXSVRIIElOQ1JFRElCTEUgICAgICBBQ0NVUkFDWSBBTkQgU1dJRlRORVNTLiAgT04gVEhFIEJBQ0sgT0YgVEhFIEdPTEQgV0FUQ0ggVEhFUkUgSVMgQU4gSVNDUklQVElPTi4uLmBILlAuIENMT0NLU01JVEgnIjogUFJJTlQgIlRIRSBUSU1FIElTICI7IFRJTUUkDQoyNzM4MCBJRiBBJCA9ICJFWEFNSU5FIFNISUVMRCIgVEhFTiBQUklOVCAiSVQgSVMgQSBCUkFTUyBTSElFTEQgSU5TQ1JJQkVEIFdJVEggVEhFIElOU0NSSVBUSU9OLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYEguUC4gV0FSUklPUiciDQoyNzM5MCBJRiBBJCA9ICJFWEFNSU5FIERVU1QiIFRIRU4gUFJJTlQgIklUIFNQQVJLTEVTIElOIFRIRSBMSUdIVC4gIElUIElTIEhJR0hMWSBSQURJT0FDVElWRSINCjI3NDAwIElGIEEkID0gIkVYQU1JTkUgSU5HUkFWSU5HUyIgVEhFTiBQUklOVCAiVEhFWSBBUkUgSU1QT1JUQU5UIExPT0tJTkcgQlVUIFlPVSBDQU4gVEVMTCBUSEVZIEhBVkUgTk8gTUVBTklORy4iDQoyNzQxMCBJRiBBJCA9ICJFWEFNSU5FIENBUlBFVCIgVEhFTiBQUklOVCAiSVQgSVMgR1JBWSBBTkQgSlVTVCBCRVlPTkQgVEhFIEdBVEUuIg0KMjc0MjAgSUYgQSQgPSAiRVhBTUlORSBNT05LIiBUSEVOIFBSSU5UICJZT1UgRklORCBBIFdBTExFVCINCjI3NDMwIElGIEEkID0gIkVYQU1JTkUgV0FMTEVUIiBUSEVOIFBSSU5UICJZT1UgRklORCBBIEJVU0lORVNTIENBUkQuICBJVCBSRUFEUzoiOiBQUklOVCAiICAgICAgICAgICAgICAgICAgICAgICAgICAgSC5QLiBNT05LLCBERUNFQVNFRCINCjI3NDUwIElGIEEkID0gIkVYQU1JTkUgQ0FSVklORyIgVEhFTiBQUklOVCAiSVQgSVMgQSBDQVJWSU5HIE9GIEEgTU9OSy4gIFRIRSBCQVNFIFJFQURTOiAgICAgICAgICAgICAgICAgICAgICAgIEguUC4gTU9OSywgaW4gbWVtb3JpYW0iDQoyNzQ2MCBJRiBBJCA9ICJFWEFNSU5FIE9GRkVSSU5HIiBPUiBBJCA9ICJFWEFNSU5FIFNBQ1JBRklDRSIgVEhFTiBQUklOVCAiSVQgQVBQRUFSUyBUTyBCRSBTT01FIFNPUlQgT0YgQSBNRUFUTE9BRi4gIEFOIEFUVEFDSEVEIFRBRyBTQVlTICBgRE9OQVRFRCBUTyBUSEUgR1JFQVQgR09EIE5FWUFSTE9USE9URVAgQlkgSC5QLiBNT00nLiINCjI3NDcwIElGIEEkID0gIkVYQU1JTkUgU1RBSVJDQVNFIiBUSEVOIFBSSU5UICJZT1UgRE9OJ1QgTkVFRCBUTyBETyBUSEFUIFlPVSdWRSBTRUVOIFNUSUFSQ0FTRVMgTElLRSBUSEFUIEJFRk9SRSEiDQoyNzQ4MCBJRiBBJCA9ICJFWEFNSU5FIFNIT1VMREVSUEFEUyIgVEhFTiBQUklOVCAiVEhFWSBTRUVNIFRPIExPT0sgTElLRSBNQU5ZIE9USEVSIFNIT1VMREVSUEFEUyBZT1UnVkUgU0VFTiBCRUZPUkUhIg0KMjc0OTAgSUYgQSQgPSAiRVhBTUlORSBSSVZFUiIgVEhFTiBQUklOVCAiQSBCT1VZIEZMT0FUSU5HIElOIElUIFNBWVMgYFRIRSBGWk9SVCBSSVZFUi4gTk8gU1dJTU1JTkchIg0KMjc1MDAgSUYgQSQgPSAiRVhBTUlORSBCT0FSRFMiIFRIRU4gUFJJTlQgIldIWT8iDQoyNzUxMCBJRiBBJCA9ICJFWEFNSU5FIEhJVkUiIFRIRU4gUFJJTlQgIklUIExPT0tTIE1VQ0ggTElLRSBNQU5ZIE9USEVSIEJFRSBISVZFUyBZT1UnVkUgU0VFTiBCRUZPUkUuICBJVCBIQVMgQSBTSUdOICAgICAgUElOTkVEIFRPIElULi4uIGBZRSBPTERFIE1FUkNIQU5UIFJPT006IEVBU1QnIg0KMjc1MjAgSUYgQSQgPSAiRVhBTUlORSBXQUxMIiBUSEVOIFBSSU5UICJJVCBIQVMgU09NRVRISU5HIElOR1JBVkVEIE9OIElULiINCjI3NTMwIElGIEEkID0gIkVYQU1JTkUgQURWRU5UVVJFUiIgVEhFTiBQUklOVCAiTk9UIEEgUFJFVFRZIFNJR0hUISINCjI3NTQwIElGIEEkID0gIkVYQU1JTkUgTk9SVEgiIE9SIEEkID0gIkVYQU1JTkUgU09VVEgiIE9SIEEkID0gIkVYQU1JTkUgRUFTVCIgT1IgQSQgPSAiRVhBTUlORSBXRVNUIiBUSEVOIFBSSU5UICJZT1UgU0VFIE5PVEhJTkcgU1BFQ0lBTCBBQk9VVCBUSEUgRElSRUNUSU9OLiINCjI3NjAwIEdPVE8gMjUwMDANCjMwMDAwICBQUklOVCAiSEkiDQozMDAxMCBSRVRVUk4NCjMxMDAwIFBJT05UID0gMDogSUYgSUQkID0gIk1BQ0UiIFRIRU4gUFFJTlQgPSAxOiBJRiBBJCA9ICJXSUVMRCBNQUNFIiBUSEVOIFdCJCA9ICIoV0lFTERFRCkiOiBXQSQgPSAiIjogV0MkID0gIiI6IFdEJCA9ICIiOiBXRSQgPSAiIjogUElPTlQgPSAxDQozMTAxMCBJRiBJRSQgPSAiQVhFIiBUSEVOIFBRSU5UID0gMTogSUYgQSQgPSAiV0lFTEQgQVhFIiBUSEVOIFdBJCA9ICIoV0lFTERFRCkiOiBXQiQgPSAiIjogV0MkID0gIiI6IFdEJCA9ICIiOiBXRSQgPSAiIjogUElPTlQgPSAxDQozMTAyMCBJRiBJSCQgPSAiU1dPUkQiIFRIRU4gUFFJTlQgPSAxOiBJRiBHQyQgPD4gIihHSVZFTikiIFRIRU4gR0VSJCA9ICJHRVIiOiBJRiBBJCA9ICJXSUVMRCBTV09SRCIgVEhFTiBXQyQgPSAiKFdJRUxERUQpIjogV0EkID0gIiI6IFdCJCA9ICIiOiBXRCQgPSAiIjogV0UkID0gIiI6IFBJT05UID0gMQ0KMzEwMzAgSUYgSVckID0gIkJMT09EWSBLTklGRSIgVEhFTiBQUUlOVCA9IDE6IElGIEEkID0gIldJRUxEIEtOSUZFIiBUSEVOIFdEJCA9ICIoV0lFTERFRCkiOiBXQSQgPSAiIjogV0IkID0gIiI6IFdDJCA9ICIiOiBXRSQgPSAiIjogUElPTlQgPSAxDQozMTA5OCBJRiBQSU9OVCA8PiAxIFRIRU4gUFJJTlQgIllPVSBDQU4nVCBXSUVMRCBUSEFUISEhIiBFTFNFIFBSSU5UICJET05FIg0KMzEwOTkgUFJJTlQgOiBHT1RPIDI1MDAwDQozMzAwMCBJRiBSSUdIVCQoQSQsIDQpID0gIkdSVUUiIFRIRU4gUFJJTlQgIF8NCiJUSEUgR1JVRSBJUyBBIFNJTklTVEVSLCBMVVJLSU5HIFBSRVNFTkNFIElOIERBUksgUExBQ0VTIE9GIFRIRSBFQVJUSC4gSVRTIEZBVk9SLUlURSBESUVUIElTIEFEVkVOVFVSRVJTLCBCVVQgSU4gSU5TQVRJQUJMRSBBUFBFVElURSBJUyBURU1QRVJFRCBCWSBJVFMgRkVBUiBPRiAgVEhFIExJR0hULiBOTyBHUlVFIEhBUyBFVkVSIEJFRU4gU0VFTiBJTiBUSEUgTElHSFQiOw0KMzMwMDEgSUYgUklHSFQkKEEkLCA0KSA9ICJHUlVFIiBUSEVOIFBSSU5UICJPRiBEQVk7IEZFVyBIQVZFIFNVUlZJVkVEIElUUyBGRUFSU09NRSBKQVdTIFRPIFRFTEwgVEhFIFRBTEUuIiBFTFNFIFBSSU5UICJJVCBET0VTTidUIE1BVFRFUi4iDQozMzAxMCBSRVRVUk4NCjMzMDIwIElGIEEkID0gIkJSRUFLIFNUQUZGIiBUSEVOIENPTE9SIDAsIDQ6IENMUyA6IFBSSU5UIDogUFJJTlQgOiBQUklOVCAiICAgICAgICAgIMObw5vDm8ObICAgICAgw5vDm8Obw5vDm8ObICAgIMObw5vDm8Obw5vDmyAgICDDm8Obw5vDm8Obw5vDm8Obw5vDmyI6IFBSSU5UICIgICAgICAgICAgw5vDmyAgw5vDmyAgICDDm8ObICDDm8ObICAgIMObw5sgIMObw5sgICAgw5vDmyAgw5vDmyAgw5vDmyI6IFBSSU5UICIgICAgICAgICAgw5vDm8Obw5sgICAgICDDm8ObICDDm8ObICAgIMObw5sgIMObw5sgICAgw5vDmyAgw5vDmyAgw5vDmyINCjMzMDIxIElGIEEkID0gIkJSRUFLIFNUQUZGIiBUSEVOIFBSSU5UICIgICAgICAgICAgw5vDmyAgw5vDmyAgICDDm8ObICDDm8ObICAgIMObw5sgIMObw5sgICAgw5vDmyAgw5vDmyAgw5vDmyI6IFBSSU5UICIgICAgICAgICAgw5vDm8Obw5sgICAgICDDm8Obw5vDm8Obw5sgICAgw5vDm8Obw5vDm8ObICAgIMObw5sgIMObw5sgIMObw5siDQozMzAyMiBJRiBBJCA9ICJCUkVBSyBTVEFGRiIgVEhFTiBQUklOVCA6IFBSSU5UICJXT1VMRCBZT1UgTElLRSBUTyBQTEFZIEFHQUlOPyI6IEdPU1VCIDI1MDAwOiBJRiBMRUZUJChBJCwgMSkgPSAiWSIgVEhFTiBSVU4gRUxTRSBFTkQNCjMzMDMwIFJFVFVSTg0KMzQwMDAgUFJJTlQgIkNIQVBURVIgT05FIg0KMzQwMTAgUFJJTlQgIiAgSVQgV0FTIEEgREFSSyBEUkVBUlkgTU9STklORyBBTkQgQklHTEVTIFdBUyBOT1QgUFJFUEFJUkVEIEZPUiBUSEUgREFZIEFIRUFEIE9GSElNLiAgSEUgR09UIE9VVCBPRiBCRUQgQU5EIEhFQURFRCBGT1IgVEhFIEJBVEhST09NLiAgQUZURVIgMTUgTE9ORyBNSU5VVEVTIEhFICBJTU1FUkdFRCBGUk9NIFRIRSBCQVRIUk9PTSBBTkQgV0FMS0VEIE9WRVIgVE8gVEhFIE5JR0hUU1RBTkQuIg0KMzQwMjAgUFJJTlQgIkhFIFNIVUZGTEVEIFRIUk9VR0ggVEhFIFBJTEUgT0YgUEFQRVJTIEFORCBGT1VEIFdIQVQgSEUgV0FTIExPT0tJTkcgRk9SLiAgQSAgICAgQlJBTkQgTkVXLCBTVEFJTkxFU1MgU1RFRUwsIFBSRVNIQVJQRU5FRCwgRUxFQ1RST05JQywgTkVXIEFORCBJTlBST1ZFRCBJTlNUQU5UIEJFQVZFUi4iDQozNDAzMCBQUklOVCAgXw0KIkhFIEhFTEQgSVQgSU4gSElTIEhBTkQgV0lUSCBHUkVBVCBSRVNQRUNUIEZPUiBBIE1PTUVOVCBBTkQgUExBQ0VEIElUIElOVE8gQSAgICAgQlJPV04gUEFQRVIgQkFHLiAgSEUgU1RVTUJMRUQgT1ZFUiBUTyBBIFNNQUxMIFJFRlJJREdFUkFUT1IuICBIRSBPUEVORUQgSVQgQU5EICBCUk9VR0hUIE9VVCBBIENBTklTVEVSIE1BUktFRCwgYFNQQVJLTElORyBGQUxMUycgQlJBTkQgV0FURVIuICBIRSBQT1VSRUQgSVQgSU5UTyI7DQozNDA0MCBQUklOVCAgXw0KIkEgR09MREVOIENVUCBIRSBIQUQgR09UVEVOIEZST00gSElTIEdSRUFUIEdSRUFUIEdSRUFUIEdSRUFUIEdSQU5ETU9USEVSICAgICAgICAgYEguUC4gR1JFQVQgR1JFQVQgR1JFQVQgR1JFQVQgR1JBTkRNT1RIRVInLiAgSEUgRFJBTksgVEhFIFdBVEVSIEFORCBXQUxLRUQgT1VUICBUSEUgRE9PUi4gIElGIFlPVSBIQUQgQkVFTiBPTkUgT0YgVEhFIFJBVFMgTElWSU5HIElOIEJJR0xFUydTIEhPTUUgWU9VIFdPVUxEIg0KMzQwNTAgUFJJTlQgIkhBVkUgTk9USUNFRCBUV08gVEhJTkdTLi4uICAgT05FOiAgVEhFIFJFTUFJTklORyBMSVFVSUQgSU4gVEhFIENVUCBXQVMgRUFUSU5HICAgVEhST1VHSCBUSEUgSVQuICBUV086ICBUSEUgU09VTkQgT0YgQSBMT1VEIFNIUkVJSyBBTkQgU09NRU9ORSBDT0xMQVBTSU5HIE9VVFNJREUgVEhFIERPT1IuLi4iDQozNDA2MCBQUklOVCA6IFBSSU5UICJFVEMuIg0KMzQwNzAgUkVUVVJODQozNTAwMCBJRiBJUiQgPD4gIk1BR0lDIFdBTkQiIFRIRU4gUFJJTlQgIllPVSBDQU4nVCBETyBUSEFUIjogR09UTyAyNTAwMA0KMzUwMTAgSUYgQSQgPSAiUE9JTlQgV0FORCBBVCBUUk9MTCIgVEhFTiBQUklOVCAiVFJPTEwgRElTQVBFQVJTIElOIEEgU1BFQ1RSQUwgRkxBU0guIFRIRU4gUkUtQVBQRUFSUy4iDQozNTAyMCBJRiBBJCA9ICJQT0lOVCBXQU5EIEFUIEJBTkRJVCIgVEhFTiBQUklOVCAiTk9USElORyBIQVBQRU5TIg0KMzUwMzAgSUYgQSQgPSAiUE9JTlQgV0FORCBBVCBCRUVTIiBUSEVOIFBSSU5UICJXSFk/Ig0KMzUwNDAgSUYgQSQgPSAiUE9JTlQgV0FORCBBVCBCT09LIiBUSEVOIFBSSU5UICJBIFNVUkdFIE9GIEVORVJHWSBQVUxTRVMgQkFDSyBBVCBZT1UuIg0KMzUwNTAgSUYgQSQgPSAiUE9JTlQgV0FORCBBVCBNRVJDSEFOVCIgVEhFTiBQUklOVCAiSEUgU1RBR0VSUyBCQUNLIFVOREVSIEEgSEFJTCBPRiBVTlNFRU4gQVhFUyEiDQozNTA3MCBJRiBBJCA9ICJQT0lOVCBXQU5EIEFUIFBMQU5UUyIgVEhFTiBQUklOVCAiVEhFIFBMQU5UUyBTSFJJVkVMIEVWRU4gTU9SRS4iDQozNTA4MCBJRiBBJCA9ICJQT0lOVCBXQU5EIEFUIFJJVkVSIiBUSEVOIFBSSU5UICJBIEJSSUdIVCBGTEFTSCBCTElORFMgWU9VISINCjM1MDkwIElGIEEkID0gIlBPSU5UIFdBTkQgQVQgU0VMRiIgVEhFTiBQUklOVCAiWU9VIEJVUlNUIElOVE8gRkxBTUVTIjogUFJJTlQgOiBFTkQNCjM1MTAwIElGIEEkID0gIlBPSU5UIFdBTkQgQVQgTk8tQkVBVkVSIiBUSEVOIFBSSU5UICJUSEUgTk8tQkVBVkVSIEdSQURVQUxMWSBGQURFUyBJTlRPIEJFSU5HLi4uICBIRSBMT09LUyBZT1UgT1ZFUiBBTkQgVEhFTiBGQURFUyAgIEJBQ0sgVE8gVEhFIE5FR0FUSVZFIEJFQVZFUiBQTEFJTi4iDQozNTExMCBJRiBBJCA9ICJQT0lOVCBXQU5EIEFUIEJVTEIiIFRIRU4gUFJJTlQgIldIWSINCjM1MTIwIElGIEEkID0gIlBPSU5UIFdBTkQgQVQgQVhFIiBUSEVOIFBSSU5UICJJVCBHTE9XUyBXSVRIIEEgTUFHSUNBTCBCUklHSFRORVNTIg0KMzUxMzAgSUYgQSQgPSAiUE9JTlQgV0FORCBBVCBTUEhFUkUiIFRIRU4gUFJJTlQgIllPVSBDQU4nVCBETyBUSEFUIEhFUkUiDQozNTE0MCBJRiBBJCA9ICJQT0lOVCBXQU5EIEFUIFJFRkxFQ1RJT04iIFRIRU4gUFJJTlQgIklUIENSVU1CTEVTIFRPIERVU1QuIg0KMzUxNTAgSUYgQSQgPSAiUE9JTlQgV0FORCBBVCBGTE9PUiIgVEhFTiBQUklOVCAiQSBUUkFQIERPT1IgT1BFTlMiOiBHT1NVQiA2NzAwDQozNTE2MCBJRiBBJCA9ICJQT0lOVCBXQU5EIEFUIEdPRCIgVEhFTiBQUklOVCAiSSBET04nVCBUSElOSyBHT0QgV09VTEQgQVBQUkVDSUFURSBJVCBWRVJZIE1VQ0guIg0KMzUxNzAgSUYgQSQgPSAiUE9JTlQgV0FORCBBVCBXQU5EIiBUSEVOIEdPU1VCIDM0MDAwDQozNTE4MCBJRiBBJCA9ICJQT0lOVCBXQU5EIEFUIE9HUkUiIFRIRU4gUFJJTlQgIkhFIEJFR0lOUyBUTyBHTE9XIFdJVEggQSBNQUdJQ0FMIElOVlVMTkVSQUJJTElUWSINCjM1MTkwIElGIEEkID0gIlBPSU5UIFdBTkQgQVQgRkFMTFMiIFRIRU4gRkFMU1MgPSAyDQozNTIwMCBJRiBBJCA9ICJQT0lOVCBXQU5EIEFUIElOR1JBVklORyIgVEhFTiBQUklOVCAiVEhFWSBTRUVNIFRPIEdMT1cgRk9SIEEgTU9NRU5ULiINCjM1MzAwIEdPVE8gMjUwMDANCjM3MDAwIENMUyA6IFBSSU5UICIgICBZb3Ugd2lsbCBiZSBhYmxlIHRvIG1vdmUgYWJvdXQgYnkgdHlwaW5nIGNvbXBhc3MgZGlyZWN0aW9ucyAoaS5lLi0gTm9ydGgpLiAgIFRoZXJlIGRpcmVjdGlvbnMgY2FuIGJlIGFiYnJldmlhdGVkIHRvIGEgc2luZ2xlIGxldHRlciAoaS5lLiBOKS4iOiBQUklOVCA6IFBSSU5UICBfDQoiICAgWW91IHdpbGwgYWxzbyBiZSBhYmxlIHRvIG1ha2UgdXNlIG9mIG90aGVyIHdvcmRzIGFsb25nIHRoZSB3YXkuICBTb21lIG9mIg0KMzcwMTAgUFJJTlQgInRoZXNlIGFyZToiDQozNzAyMCBQUklOVA0KMzcwMzAgUFJJTlQgIiAgICAgICAgICAgICAgIFRBS0UgICAgICAgICAgICBSRUFEICAgICAgICAgICAgR0lWRSINCjM3MDQwIFBSSU5UICIgICAgICAgICAgICAgICBFWEFNSU5FICAgICAgICAgTE9PSyAgICAgICAgICAgIEFUVEFDSyINCjM3MDUwIFBSSU5UICIgICAgICAgICAgICAgICBFQVQgICAgICAgICAgICAgV0lFTEQgICAgICAgICAgIEZJTEwiDQozNzA2MCBQUklOVCAiICAgICAgICAgICAgICAgRFJJTksgICAgICAgICAgIE9QRU4gICAgICAgICAgICBNT1ZFIg0KMzcwNzAgUFJJTlQgIiAgICAgICAgICAgICAgIFdBVkUgICAgICAgICAgICBRVUlUICAgICAgICAgICAgU0xFRVAiDQozNzA4MCBQUklOVCA6IFBSSU5UIDogUFJJTlQgIiAgIFRvIHJlcGVhdCB5b3VyIGxhc3QgY29tbWFuZCwgcHJvdmlkZWQgaXQgaXMgbGVzcyB0aGFuIDE1IGNoYXJhY3RlcnMgbG9uZywgICAganVzdCBoaXQgW2YxMF0gYW5kIFtSRVRVUk5dLiAgKCBQcmVzcyBbUkVUVVJOXSB0byBiZWdpbi4uLikiOyA6IElOUFVUICIiLCBBJDogQ0xTDQozNzk5OSBSRVRVUk4NCjM4MDAwIEtFWSAxLCAiVEFLRSI6IEtFWSAyLCAiTE9PSyI6IEtFWSAzLCAiRVhBTUlORSI6IEtFWSA0LCAiUE9JTlQgV0FORCBBVCI6IEtFWSA1LCAiR0lWRSI6IEtFWSA2LCAiVVAiOiBLRVkgNywgIllPIEhPIEhPIjogS0VZIDgsICJDSEFOR0UgTkFNRSI6IEtFWSA5LCAiQkxPVyBXSElTVExFIjogUkVUVVJODQozOTAwMCBJRiBNQU1FJCA9ICJTVEVWRSIgVEhFTiBQUklOVCAiSEVMTE8gU1RFVkUhIjogRk9SIFggPSAxIFRPIDUwMDA6IE5FWFQgWA0KMzkwMTAgSUYgTUFNRSQgPSAiVElNIiBUSEVOIE1BTUUkID0gIkguUC4gSEFDS0VSIg0KMzkwMjAgSUYgTUFNRSQgPSAiSk9FWSIgVEhFTiBNQU1FJCA9ICJKT0hBTk5BIg0KMzkwMzAgSUYgTUFNRSQgPSAiR09EIiBUSEVOIFBSSU5UICJTT1JSWSwgR09EIENBTk5PVCBQTEFZIFRISVMgR0FNRS4iOiBGT1IgWCA9IDEgVE8gNTAwMDogTkVYVCBYOiBTWVNURU0NCjM5MDQwIElGIE1BTUUkID0gIk5PVCBJTVBPUlRBTlQiIFRIRU4gUFJJTlQgIkVWRVJZVEhJTkcgSVMgSU1QT1JUQU5UIjogSU5QVVQgTUFNRSQNCjM5MDUwIElGIE1BTUUkID0gIlFVSVQiIFRIRU4gRU5EDQozOTA5MCBSRVRVUk4NCjM5MTAwIExFVCBNRU1FID0gUk5EKDEpICogMTA6IFBJT05FRVIgPSAxDQozOTExMCBJRiBNRU1FID4gMCBUSEVOIEdFUiQgPSAiR0VSIjogSUYgTUVNRSA8IDIgVEhFTiBQUklOVCAiVEhFIE9ORSBUUlVFIExPUkQgT0YgV0FTVEUuIjogR0VSVElQID0gMQ0KMzkxMjAgSUYgTUVNRSA+IDIgVEhFTiBHRVIkID0gIkdFUiI6IElGIE1FTUUgPCAzIFRIRU4gUFJJTlQgIlRIRSBSQVQgS0lORy4iOiBHRVJUSVAgPSAxDQozOTEzMCBJRiBNRU1FID4gMyBUSEVOIEdFUiQgPSAiR0VSIjogSUYgTUVNRSA8IDQgVEhFTiBQUklOVCAiVEhFIFNXSUZUIEFORCBTSUxFTlQuIjogR0VSVElQID0gMQ0KMzkxNDAgSUYgTUVNRSA+IDQgVEhFTiBHRVIkID0gIkdFUiI6IElGIE1FTUUgPCA1IFRIRU4gUFJJTlQgIlRIRSBQSElMT1NPUEhZU0VSLiI6IEdFUlRJUCA9IDENCjM5MTUwIElGIE1FTUUgPiA1IFRIRU4gR0VSJCA9ICJHRVIiOiBJRiBNRU1FIDwgNiBUSEVOIFBSSU5UICJQUk9GRVNTT1IgT0YgQVJUUyBBTkQgU0NJRU5DRVMgQVQgVEhFIFVOSVZFUlNJVFkgT0YgR1JZU1dBTEQuIjogR0VSVElQID0gMQ0KMzkxNjAgSUYgTUVNRSA+IDYgVEhFTiBHRVIkID0gIkdFUiI6IElGIE1FTUUgPCA3IFRIRU4gUFJJTlQgIldBUlJJT1IsIEFEVkVOVFVSRVIsIEFORCBIT01FLU1BS0VSLiI6IEdFUlRJUCA9IDENCjM5MTcwIElGIE1FTUUgPiA3IFRIRU4gR0VSJCA9ICJHRVIiOiBJRiBNRU1FIDwgOCBUSEVOIFBSSU5UICJGT1JNRVIgTUFKT1IgRElFVFkuIjogR0VSVElQID0gMQ0KMzkxODAgSUYgTUVNRSA+IDggVEhFTiBHRVIkID0gIkdFUiI6IElGIE1FTUUgPCA5IFRIRU4gUFJJTlQgIlJFLUlOQ0FSTkFUSU9OIE9GIEJPQiBUSEUgR1VZLiI6IEdFUlRJUCA9IDENCjM5MTkwIElGIE1FTUUgPiA5IFRIRU4gR0VSJCA9ICJHRVIiOiBJRiBNRU1FIDwgMTAgVEhFTiBQUklOVCAiT05FIFdITyBDT01FUyBBUyBBIFRISUVGIElOIFRIRSBOSUdIVCBUTyBTVEVBTCBUUkVBU1VSRVMgRlJPTSBBTlRJRU5UIENBVkVSTlMuIjogR0VSVElQID0gMQ0KMzkyMDAgSUYgTUVNRSA+IDEwIFRIRU4gR0VSJCA9ICJHRVIiOiBJRiBNRU1FIDwgMTEgVEhFTiBQUklOVCAiVEhFIE1FUkNIQU5ULiI6IEdFUlRJUCA9IDENCjM5MjEwIElGIEdFUlRJUCA8PiAxIFRIRU4gRU5EDQozOTk5OSBSRVRVUk4NCjQwMDAwIFBSSU5UICJPS0FZLiAgWU9VIEFSRSBOT1cgSE9QRUxFU1NMWSBMT1NUIElOIEEgTUFaRSBPRiBNSVJST1JTLiAgWU9VIERPTidUIFRISU5LIFRIQVQgIFlPVSBDQU4gRklORCBZT1VSIFdBWSBPVVQuIg0KNDAwMTAgUFJJTlQgIk1BWkUgT0YgTUlSUk9SUyINCjQwMDIwIElOUFVUICI+IiwgQSQ6IElGIEEkID0gIkZJTkQgTVkgV0FZIE9VVCIgVEhFTiBQUklOVCAiT0tBWSwgTUFZQkUgWU9VIENBTi4gIFNPUlJZLiI6IFJFVFVSTg0KNDAwMjUgSUYgQSQgPSAiV0FWRSBXQU5EIiBUSEVOIFBSSU5UICJQSU5HIjogRk9SIFRCUyA9IDEgVE8gMjUwOiBORVhUIFRCUzogUFJJTlQgIlBJTkciOiBGT1IgVEJTID0gMSBUTyAyNTA6IE5FWFQgVEJTOiBQUklOVCAiUElORyI6IEZPUiBUQlMgPSAxIFRPIDI1MDogTkVYVCBUQlM6IFBSSU5UICJaQVAhISEgIE5PVCBBIFZFUlkgV0lTRSBNT1ZFLiI6IEVORA0KNDAwMzAgUFJJTlQgIllPVSBBUkUgU1RJTEwgTE9TVCBJTiBUSEUgTUFaRSBPRiBNSVJST1JTLiINCjQwMDQwIEdPVE8gNDAwMjANCjQxMDAwIENPTE9SIDE0LCAwDQo0MTAxMCBDTFMNCjQxMDIwIFBSSU5UIDogUFJJTlQgOiBQUklOVCA6IFBSSU5UIDogUFJJTlQgOiBQUklOVCAiICAgICDDm8Obw5vDmyAgIMObICAgw5sgICDDmyAgIMObICAgw5vDm8Obw5vDmyAgw5vDmyAgw5vDmyAgw5vDmyINCjQxMDMwICAgICAgICAgICBQUklOVCAiICAgIMObw5sgICAgICDDmyAgIMObICAgIMObIMObICAgICAgw5sgICAgw5vDmyAgw5vDmyAgw5vDmyINCjQxMDUwICAgICAgICAgICBQUklOVCAiICAgICDDm8Obw5sgICAgw5sgw5sgw5sgICAgIMObICAgICAgIMObICAgIMObw5sgIMObw5sgIMObw5siDQo0MTA2MCAgICAgICAgICAgUFJJTlQgIiAgICAgICDDm8ObICAgw5vDm8Obw5vDmyAgICAgw5sgICAgICAgw5sgICAgICAgICAgICAgICINCjQxMDcwICAgICAgICAgICBQUklOVCAiICAgIMObw5vDm8ObICAgICDDmyDDmyAgICAgIMObICAgICAgIMObICAgIMObw5sgIMObw5sgIMObw5siDQo0MTA4MCBGT1IgSEFNU1RSSU5HID0gMSBUTyA1MDA6IE5FWFQgSEFNU1RSSU5HDQo0MTA5MCBDT0xPUiAxNSwgMDogQ0xTDQo0MTA5NSBHT1RPIDkNCjQyMDAwIENPTE9SIDINCjQyMDEwIFBSSU5UICJBTEwgUklHSFQgWU9VIFNDVU0sIFNVQ0tJTkcgUElHLiAgV0hZIElOIFRIRSBIRUxMIEFSRSBZT1UgVVNJTkcgTVkgTkFNRSBZT1UgSE9TRUhFQUQuIg0KNDIwMjAgRk9SIFggPSAxIFRPIDkwMDANCjQyMDMwIE5FWFQgWA0KNDIwNDAgQ0xTDQo0MjA1MCBJTlBVVCAiPiIsIEckDQo0MjA2MCBJRiBHJCA9ICJJIEFNIEJSSUFOIEdBTExFVFRBIiBUSEVOIDQyMDcwIEVMU0UgNDI5OTkNCjQyMDcwIFBSSU5UICJPSCwgV0VMTCBTT1JSWSBZT1UgSU5DUkVESUJMRSwgU1RVRCBPRiBBIE1BTi4gIFdFTEwgQ0hFUklPIFBJUCBQSVAgQU5EIEFMTCBUSEFULiI6IFBMQVkgIk8zIEwxIEcgTDQgRyBPNCBMMSBDIg0KNDI5OTkgUkVUVVJODQo1NTAwMCBHT0sgPSAwOiBJRiBJQyQgPSAiTUVEQUxMSU9OIiBUSEVOIEdPTyA9IEdPTyArIDE6IElGIEEkID0gIkdJVkUgTUVEQUxMSU9OIiBUSEVOIEdBJCA9ICIoR0lWRU4pIjogUFJJTlQgOiBQUklOVCAiRE9ORSI6IExFVCBHT0sgPSBHT0sgKyAxDQo1NTAxMCBJRiBJSCQgPSAiU1dPUkQiIFRIRU4gR09PID0gR09PICsgMTogSUYgQSQgPSAiR0lWRSBTV09SRCIgVEhFTiBHQyQgPSAiKEdJVkVOKSI6IFBSSU5UIDogUFJJTlQgIkRPTkUiOiBMRVQgR09LID0gR09LICsgMQ0KNTUwMjAgSUYgSUokID0gIkRJQU1PTkQgUklORyIgVEhFTiBHT08gPSBHT08gKyAxOiBJRiBBJCA9ICJHSVZFIFJJTkciIFRIRU4gR0IkID0gIihHSVZFTikiOiBQUklOVCA6IFBSSU5UICJET05FIjogTEVUIEdPSyA9IEdPSyArIDENCjU1MDMwIElGIElLJCA9ICJTQUZFIiBUSEVOIEdPTyA9IEdPTyArIDE6IElGIEEkID0gIkdJVkUgU0FGRSIgVEhFTiBHRCQgPSAiKEdJVkVOKSI6IFBSSU5UIDogUFJJTlQgIkRPTkUiOiBMRVQgR09LID0gR09LICsgMQ0KNTUwNDAgSUYgSVkkID0gIkdPTEQgU1RBVFVFIiBUSEVOIEdPTyA9IEdPTyArIDE6IElGIEEkID0gIkdJVkUgU1RBVFVFIiBUSEVOIEdFJCA9ICIoR0lWRU4pIjogUFJJTlQgOiBQUklOVCAiRE9ORSI6IExFVCBHT0sgPSBHT0sgKyAxDQo1NTA1MCBJRiBJU1QkID0gIk1BR0lDIEJPT0siIFRIRU4gR09PID0gR09PICsgMTogSUYgQSQgPSAiR0lWRSBCT09LIiBUSEVOIEdGJCA9ICIoR0lWRU4pIjogUFJJTlQgOiBQUklOVCAiRE9ORSI6IExFVCBHT0sgPSBHT0sgKyAxDQo1NTA2MCBJRiBJVCQgPSAiR09MRCBDT0lOIiBUSEVOIEdPTyA9IEdPTyArIDE6IElGIEEkID0gIkdJVkUgQ09JTiIgVEhFTiBHRyQgPSAiKEdJVkVOKSI6IFBSSU5UIDogUFJJTlQgIkRPTkUiOiBMRVQgR09LID0gR09LICsgMQ0KNTUwNjUgSUYgSUFEJCA9ICJQRUFSTCBORUNLTEFDRSIgVEhFTiBHT08gPSBHT08gKyAxOiBJRiBBJCA9ICJHSVZFIE5FQ0tMQUNFIiBUSEVOIEdaJCA9ICIoR0lWRU4pIjogUFJJTlQgOiBQUklOVCAiRE9ORSI6IExFVCBHT0sgPSBHT0sgKyAxDQo1NTA3MCBJRiBHT0sgPCA3IFRIRU4gUFJJTlQgIllPVSBET04nVCBIQVZFIEVOT1VHSCBWQUxVQUJMRVMhIjogUFJJTlQgOiBSRVRVUk4NCjU1MDgwIFBSSU5UICJUSEUgTUVSQ0hBTlQgSEFTIEFMTCBIRSBORUVEUyBBTkQgSEFORFMgWU9VIFRIRSBLRVkuIjogUFJJTlQgOiBJWiQgPSAiS0VZIg0KNTUxMDAgUkVUVVJODQo1NjAwMCBQUklOVCAiV0FJVCBBIE1PTUVOVC4uLiBXRSBIQVZFIEFOIEVSUk9SIElOIFRIRSBQUk9HUkFNISI6IEZPUiBYID0gMSBUTyAxMDAwMDogTkVYVCBYOiBHT1RPIDYwMA0KNjAwMDAgRk9SIFggPSAxIFRPIDMxDQo2MDAxMCBDT0xPUiBYDQo2MDAxNSBQUklOVCBYOw0KNjAwMjAgTkVYVCBYDQoNCg=="
}
`;

function postLoad(module) {
  log('You land in a shadowy cavern.');
}

globalThis.PIT_BAS_MODULE = JSON.parse(DATA);
globalThis.PIT_BAS_MODULE.postLoad = postLoad;

startGame = function () {
  PIT_BAS_MODULE.postLoad?.(PIT_BAS_MODULE);
  applyModule(PIT_BAS_MODULE);
  const s = PIT_BAS_MODULE.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setPartyPos(s.x, s.y);
  setMap(s.map, s.map === 'world' ? 'Wastes' : undefined);
};
