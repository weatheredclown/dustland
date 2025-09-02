const DATA = `{
  "seed": "true-dust",
  "name": "true-dust",
  "interiors": [
    {
      "id": "stonegate",
      "w": 6,
      "h": 6,
      "grid": [
        "🏝🏝🏝🏝🏝🏝",
        "🏝🧱🧱🧱🧱🏝",
        "🏝🧱🏝🏝🧱🏝",
        "🏝🧱🏝🏝🧱🏝",
        "🏝🧱🧱🧱🧱🏝",
        "🏝🏝🏝🏝🏝🏝"
      ],
      "entryX": 2,
      "entryY": 3
    }
  ],
  "npcs": [
    {
      "id": "rygar",
      "map": "stonegate",
      "x": 2,
      "y": 2,
      "color": "#d4aa70",
      "name": "Rygar",
      "title": "Gatewatch",
      "desc": "Keeps watch over Stonegate's gate.",
      "tree": {
        "start": {
          "text": "Stay sharp. The wastes bite.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        }
      }
    },
    {
      "id": "gossip_mira",
      "map": "stonegate",
      "x": 3,
      "y": 2,
      "color": "#a9f59f",
      "name": "Settler",
      "title": "Gossip",
      "desc": "Whispers about Mira's radio obsession.",
      "tree": {
        "start": {
          "text": [
            "Mira was always tuning the old towers.",
            "Rygar still wears that copper pendant."
          ],
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        }
      }
    }
  ],
  "zoneEffects": [
    {
      "map": "stonegate",
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 6,
      "spawns": [
        { "name": "Scavenger Rat", "HP": 5, "ATK": 1, "DEF": 0 },
        { "name": "Feral Dog", "HP": 8, "ATK": 2, "DEF": 1 }
      ],
      "minSteps": 2,
      "maxSteps": 4
    },
    {
      "map": "stonegate",
      "x": 1,
      "y": 1,
      "w": 4,
      "h": 4,
      "noEncounters": true
    }
  ],
  "start": { "map": "stonegate", "x": 2, "y": 3 }
}`;

function postLoad(module) {}

globalThis.TRUE_DUST = JSON.parse(DATA);
globalThis.TRUE_DUST.postLoad = postLoad;

startGame = function () {
  applyModule(TRUE_DUST);
  const s = TRUE_DUST.start;
  setMap(s.map, 'Stonegate');
  setPartyPos(s.x, s.y);
};
