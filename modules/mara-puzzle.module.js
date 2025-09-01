function seedWorldContent() {}

const DATA = `{
  "seed": "mara-puzzle",
  "name": "mara-puzzle",
  "items": [
    {
      "map": "dust_storm",
      "x": 9,
      "y": 9,
      "id": "maze_sword",
      "name": "Maze Sword",
      "type": "weapon",
      "slot": "weapon",
      "mods": { "ATK": 10 }
    }
  ],
  "quests": [],
  "npcs": [],
  "interiors": [
    {
      "id": "dust_storm",
      "w": 20,
      "h": 20,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🚪🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🔔🏝🏝🏝🏝🏝🏝🏝🏝🏝🔔🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🔔🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱🧱🧱🧱🚪🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 10,
      "entryY": 18
    }
  ],
  "events": [
    { "map": "dust_storm", "x": 10, "y": 18, "events": [{ "when": "enter", "effect": "dustStorm", "active": true }] },
    { "map": "dust_storm", "x": 10, "y": 10, "events": [
      { "when": "enter", "effect": "addSoundSource", "id": "chime1", "x": 10, "y": 10 },
      { "when": "enter", "effect": "log", "msg": "You hear a faint chime." }
    ] },
    { "map": "dust_storm", "x": 5, "y": 5, "events": [
      { "when": "enter", "effect": "addSoundSource", "id": "chime2", "x": 5, "y": 5 },
      { "when": "enter", "effect": "log", "msg": "You hear a faint chime." }
    ] },
    { "map": "dust_storm", "x": 15, "y": 5, "events": [
      { "when": "enter", "effect": "addSoundSource", "id": "chime3", "x": 15, "y": 5 },
      { "when": "enter", "effect": "log", "msg": "A faint bell rings." }
    ] }
  ],
  "portals": [
    { "map": "dust_storm", "x": 10, "y": 6, "toMap": "world", "toX": 10, "toY": 10, "desc": "You emerge from the dust storm." }
  ],
  "buildings": [],
  "start": { "map": "dust_storm", "x": 10, "y": 18 }
}`;

function postLoad(module) {}

globalThis.MARA_PUZZLE = JSON.parse(DATA);
globalThis.MARA_PUZZLE.postLoad = postLoad;

startGame = function () {
  applyModule(MARA_PUZZLE);
  const s = MARA_PUZZLE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Dust Storm');
  refreshUI();
  log('You are lost in a dust storm.');
  log('Listen for chimes to find your way out.');
};

