function seedWorldContent() {}

const DATA = `
{
  "seed": "pit-bas",
  "name": "pit-bas",
  "start": { "map": "cavern", "x": 3, "y": 5 },
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
  "portals": [
    { "map": "cavern", "x": 3, "y": 1, "toMap": "whistle_room", "toX": 1, "toY": 1 },
    { "map": "whistle_room", "x": 1, "y": 1, "toMap": "cavern", "toX": 3, "toY": 1 },
    { "map": "cavern", "x": 3, "y": 5, "toMap": "small_cavern", "toX": 2, "toY": 1 },
    { "map": "small_cavern", "x": 2, "y": 0, "toMap": "cavern", "toX": 3, "toY": 5 },
    { "map": "small_cavern", "x": 0, "y": 2, "toMap": "large_cavern", "toX": 3, "toY": 1 },
    { "map": "large_cavern", "x": 4, "y": 1, "toMap": "small_cavern", "toX": 1, "toY": 2 }
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
        "🧱🚪🏝🧱",
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
        "🧱🏝🏝🏝🧱",
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
  setMap(s.map, s.map === 'world' ? 'Wastes' : 'PIT.BAS');
};
