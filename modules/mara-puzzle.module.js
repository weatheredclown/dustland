function seedWorldContent() {}

const MARA_PUZZLE = {
  "seed": "mara-puzzle",
  "name": "mara-puzzle",
  "items": [],
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
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
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
    { "map": "dust_storm", "x": 10, "y": 10, "events": [{ "when": "enter", "effect": "addSoundSource", "id": "chime1", "x": 10, "y": 10 }] },
    { "map": "dust_storm", "x": 5, "y": 5, "events": [{ "when": "enter", "effect": "addSoundSource", "id": "chime2", "x": 5, "y": 5 }] },
    { "map": "dust_storm", "x": 15, "y": 5, "events": [{ "when": "enter", "effect": "addSoundSource", "id": "chime3", "x": 15, "y": 5 }] }
  ],
  "portals": [
    { "map": "dust_storm", "x": 10, "y": 6, "toMap": "world", "toX": 10, "toY": 10, "desc": "You emerge from the dust storm." }
  ],
  "buildings": [],
  "start": { "map": "dust_storm", "x": 10, "y": 18 }
};

startGame = function () {
  startWorld();
  applyModule(MARA_PUZZLE);
  const s = MARA_PUZZLE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Dust Storm');
  refreshUI();
  log('You are lost in a dust storm.');
};
