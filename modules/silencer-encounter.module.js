function seedWorldContent() {}
const DATA = `{
  "seed": "silencer-encounter",
  "name": "silencer-encounter",
  "start": { "map": "arena", "x": 2, "y": 2 },
  "items": [],
  "quests": [],
  "npcs": [
    {
      "id": "silencer",
      "map": "arena",
      "x": 2,
      "y": 2,
      "name": "Silencer Scout",
      "desc": "A rival drifter watches your moves.",
      "tree": {
        "start": {
          "text": "The Silencer narrows his eyes. You're after the signal too.",
          "choices": [
            { "label": "It's mine.", "to": "taunt" },
            { "label": "Back away.", "to": "bye" }
          ]
        },
        "taunt": {
          "text": "We'll see who reaches it first, he replies.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        }
      }
    }
  ],
  "interiors": [
    {
      "id": "arena",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    }
  ],
  "events": [],
  "portals": [],
  "buildings": []
}`;

function postLoad(module) {}

globalThis.SILENCER_ENCOUNTER = JSON.parse(DATA);
globalThis.SILENCER_ENCOUNTER.postLoad = postLoad;

startGame = function () {
  applyModule(SILENCER_ENCOUNTER);
  var s = SILENCER_ENCOUNTER.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Arena');
  log('A Silencer scout blocks your path.');
};
