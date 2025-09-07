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
  "npcs": [],
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
    "flute_room": "Flute Room"
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
  "buildings": []
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
