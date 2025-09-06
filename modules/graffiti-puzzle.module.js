function seedWorldContent() {}

const DATA = `{
  "seed": "graffiti-puzzle",
  "name": "graffiti-puzzle",
  "items": [],
  "quests": [],
  "npcs": [
    {
      "id": "graffiti_wall",
      "map": "graffiti",
      "x": 3,
      "y": 3,
      "color": "#f5e79f",
      "name": "Graffiti Wall",
      "prompt": "Wall layered with faded graffiti and hidden marks",
      "tree": {
        "start": {
          "text": "Layers of paint hide a message.",
          "choices": [
            { "label": "(Scrape)", "to": "scrape" },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "scrape": {
          "text": "A route symbol emerges.",
          "effects": [ { "effect": "addFlag", "flag": "graffiti_puzzle_complete" } ],
          "choices": [
            { "label": "(Continue)", "applyModule": "MARA_PUZZLE", "to": "bye" }
          ]
        }
      }
    }
  ],
  "interiors": [
    {
      "id": "graffiti",
      "w": 7,
      "h": 7,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🎨🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 3,
      "entryY": 5
    }
  ],
  "events": [],
  "portals": [],
  "buildings": [],
  "start": { "map": "graffiti", "x": 3, "y": 5 }
}`;

function postLoad(module) {}

globalThis.GRAFFITI_PUZZLE = JSON.parse(DATA);
globalThis.GRAFFITI_PUZZLE.postLoad = postLoad;

startGame = function () {
  applyModule(GRAFFITI_PUZZLE);
  const s = GRAFFITI_PUZZLE.start;
  state.map = s.map;
  state.x = s.x;
  state.y = s.y;
  renderWorld();
};
