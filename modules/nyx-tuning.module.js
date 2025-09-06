const DATA = `{
  "seed": "nyx-tuning",
  "name": "nyx-tuning",
  "items": [],
  "quests": [],
  "npcs": [
    {
      "id": "nyx",
      "map": "world",
      "x": 10,
      "y": 10,
      "color": "#f9f",
      "name": "Nyx",
      "desc": "Listens to static for hidden verses.",
      "prompt": "Wanderer with headphones listening to static",
      "tree": {
        "start": {
          "text": "The static hums. Can you find the note?",
          "choices": [
            { "label": "Hum along", "to": "hum" },
            { "label": "Stay silent", "to": "silent" }
          ]
        },
        "hum": {
          "text": "Your tone aligns and the static softens.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        },
        "silent": {
          "text": "Nyx tilts her head, waiting.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        }
      }
    }
  ],
  "interiors": [],
  "events": [],
  "portals": [],
  "buildings": [],
  "start": { "map": "world", "x": 10, "y": 10 }
}`;

function postLoad(module) {}

globalThis.NYX_TUNING = JSON.parse(DATA);
globalThis.NYX_TUNING.postLoad = postLoad;

startGame = function () {
  applyModule(NYX_TUNING);
  const s = NYX_TUNING.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Nyx');
  log('Nyx studies the static, awaiting your tone.');
};
