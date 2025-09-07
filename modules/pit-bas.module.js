function seedWorldContent() {}

const DATA = `
{
  "seed": "pit-bas",
  "name": "pit-bas",
  "start": {
    "map": "cavern",
    "x": 3,
    "y": 5
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
    }
  ],
  "quests": [],
  "npcs": [],
  "mapLabels": {
    "cavern": "Cavern",
    "whistle_room": "Whistle Room",
    "small_cavern": "Small Cavern",
    "large_cavern": "Large Cavern",
    "golden_gate": "Golden Gate",
    "dungeon": "Dungeon",
    "river_room": "River Room",
    "glass_room": "Glass Room",
    "bandit_room": "Bandit Room",
    "green_house": "Green House",
    "river_bed": "River Bed",
    "troll_room": "Troll Room",
    "trophy_room": "Trophy Room",
    "rag_room": "Rag Room",
    "bright_room": "Bright Room",
    "pointless_room": "Pointless Room",
    "white_room": "White Room",
    "whisper_room": "Whisper Room",
    "wizard_room": "Wizard Room",
    "alice_room": "Alice Room",
    "lightning_room": "Lightning Room",
    "magician_book_room": "Magician Book Room",
    "air_room": "Air Room",
    "maze_small_room": "Maze Small Room",
    "bee_room": "Bee Room"
  },
  "portals": [
    {
      "map": "cavern",
      "x": 3,
      "y": 1,
      "toMap": "whistle_room",
      "toX": 1,
      "toY": 1
    },
    {
      "map": "whistle_room",
      "x": 1,
      "y": 1,
      "toMap": "cavern",
      "toX": 3,
      "toY": 1
    },
    {
      "map": "whistle_room",
      "x": 2,
      "y": 1,
      "toMap": "dungeon",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "dungeon",
      "x": 4,
      "y": 1,
      "toMap": "whistle_room",
      "toX": 2,
      "toY": 1
    },
    {
      "map": "cavern",
      "x": 3,
      "y": 5,
      "toMap": "small_cavern",
      "toX": 2,
      "toY": 1
    },
    {
      "map": "small_cavern",
      "x": 2,
      "y": 0,
      "toMap": "cavern",
      "toX": 3,
      "toY": 5
    },
    {
      "map": "small_cavern",
      "x": 0,
      "y": 2,
      "toMap": "large_cavern",
      "toX": 3,
      "toY": 1
    },
    {
      "map": "large_cavern",
      "x": 4,
      "y": 1,
      "toMap": "small_cavern",
      "toX": 1,
      "toY": 2
    },
    {
      "map": "small_cavern",
      "x": 4,
      "y": 1,
      "toMap": "golden_gate",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "golden_gate",
      "x": 0,
      "y": 2,
      "toMap": "small_cavern",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "golden_gate",
      "x": 4,
      "y": 1,
      "toMap": "dungeon",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "dungeon",
      "x": 0,
      "y": 2,
      "toMap": "golden_gate",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "dungeon",
      "x": 4,
      "y": 1,
      "toMap": "river_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "river_room",
      "x": 0,
      "y": 2,
      "toMap": "dungeon",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "river_room",
      "x": 4,
      "y": 1,
      "toMap": "glass_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "glass_room",
      "x": 0,
      "y": 2,
      "toMap": "river_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "glass_room",
      "x": 4,
      "y": 1,
      "toMap": "bandit_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "bandit_room",
      "x": 0,
      "y": 2,
      "toMap": "glass_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "bandit_room",
      "x": 4,
      "y": 1,
      "toMap": "green_house",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "green_house",
      "x": 0,
      "y": 2,
      "toMap": "bandit_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "green_house",
      "x": 4,
      "y": 1,
      "toMap": "river_bed",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "river_bed",
      "x": 0,
      "y": 2,
      "toMap": "green_house",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "river_bed",
      "x": 4,
      "y": 1,
      "toMap": "troll_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "troll_room",
      "x": 0,
      "y": 2,
      "toMap": "river_bed",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "troll_room",
      "x": 4,
      "y": 1,
      "toMap": "trophy_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "trophy_room",
      "x": 0,
      "y": 2,
      "toMap": "troll_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "trophy_room",
      "x": 4,
      "y": 1,
      "toMap": "rag_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "rag_room",
      "x": 0,
      "y": 2,
      "toMap": "trophy_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "rag_room",
      "x": 4,
      "y": 1,
      "toMap": "bright_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "bright_room",
      "x": 0,
      "y": 2,
      "toMap": "rag_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "bright_room",
      "x": 4,
      "y": 1,
      "toMap": "pointless_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "pointless_room",
      "x": 0,
      "y": 2,
      "toMap": "bright_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "pointless_room",
      "x": 4,
      "y": 1,
      "toMap": "white_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "white_room",
      "x": 0,
      "y": 2,
      "toMap": "pointless_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "white_room",
      "x": 4,
      "y": 1,
      "toMap": "whisper_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "whisper_room",
      "x": 0,
      "y": 2,
      "toMap": "white_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "whisper_room",
      "x": 4,
      "y": 1,
      "toMap": "wizard_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "wizard_room",
      "x": 0,
      "y": 2,
      "toMap": "whisper_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "wizard_room",
      "x": 4,
      "y": 1,
      "toMap": "alice_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "alice_room",
      "x": 0,
      "y": 2,
      "toMap": "wizard_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "alice_room",
      "x": 4,
      "y": 1,
      "toMap": "lightning_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "lightning_room",
      "x": 0,
      "y": 2,
      "toMap": "alice_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "lightning_room",
      "x": 4,
      "y": 1,
      "toMap": "magician_book_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "magician_book_room",
      "x": 0,
      "y": 2,
      "toMap": "lightning_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "magician_book_room",
      "x": 4,
      "y": 1,
      "toMap": "air_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "air_room",
      "x": 0,
      "y": 2,
      "toMap": "magician_book_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "air_room",
      "x": 4,
      "y": 1,
      "toMap": "maze_small_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "maze_small_room",
      "x": 0,
      "y": 2,
      "toMap": "air_room",
      "toX": 4,
      "toY": 1
    },
    {
      "map": "maze_small_room",
      "x": 4,
      "y": 1,
      "toMap": "bee_room",
      "toX": 0,
      "toY": 2
    },
    {
      "map": "bee_room",
      "x": 0,
      "y": 2,
      "toMap": "maze_small_room",
      "toX": 4,
      "toY": 1
    }
  ],
  "interiors": [
    {
      "id": "cavern",
      "w": 7,
      "h": 7,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱",
        "🧱🏝🏝🚪🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🚪🏝🏝🧱",
        "🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 3,
      "entryY": 5
    },
    {
      "id": "whistle_room",
      "w": 4,
      "h": 4,
      "grid": [
        "🧱🧱🧱🧱",
        "🧱🚪🚪🧱",
        "🧱🏝🏝🧱",
        "🧱🧱🧱🧱"
      ],
      "entryX": 1,
      "entryY": 1
    },
    {
      "id": "small_cavern",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🚪🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 3
    },
    {
      "id": "large_cavern",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
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
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "river_room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
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
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
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
        "🧱🏝🏝🏝🚪",
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
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "rag_room",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
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
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
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
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
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
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
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
        "🧱🏝🏝🏝🚪",
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
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🚪",
        "🚪🏝🏝🏝🧱",
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
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🧱",
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
