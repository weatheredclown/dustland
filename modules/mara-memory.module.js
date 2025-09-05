function seedWorldContent() {}

const DATA = `{
  "seed": "mara-memory",
  "name": "mara-memory",
  "items": [],
  "quests": [
    {
      "id": "q_mara_memory",
      "title": "Echoes in the Dust",
      "desc": "Mara follows a mask's whisper to a buried camp."
    }
  ],
  "npcs": [
    {
      "id": "mara_memory_echo",
      "map": "memory_camp",
      "x": 2,
      "y": 2,
      "color": "#ffa",
      "name": "Flicker of Mara",
      "tree": {
        "start": {
          "text": "The mask stirs with a buried memory.",
          "choices": [ { "label": "(Listen)", "to": "end" } ]
        },
        "end": {
          "text": "Mara recalls a path once walked.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        }
      }
    }
  ],
  "interiors": [
    {
      "id": "memory_camp",
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
      "entryY": 4
    }
  ],
  "events": [],
  "portals": [],
  "buildings": [],
  "start": { "map": "memory_camp", "x": 2, "y": 4 }
}`;

function postLoad(module) {}

globalThis.MARA_MEMORY = JSON.parse(DATA);
globalThis.MARA_MEMORY.postLoad = postLoad;

startGame = function () {
  applyModule(MARA_MEMORY);
  const s = MARA_MEMORY.start;
  state.map = s.map;
  state.x = s.x;
  state.y = s.y;
  renderWorld();
};
