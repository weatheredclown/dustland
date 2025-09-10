function seedWorldContent() {}

const DATA = `
{
  "seed": "world-one",
  "start": { "map": "world", "x": 2, "y": 2 },
  "items": [
    { "id": "rusty_gear", "name": "Rusty Gear", "type": "quest", "map": "world", "x": 3, "y": 2 }
  ],
  "npcs": [
    {
      "id": "gear_seeker",
      "map": "world",
      "x": 1,
      "y": 2,
      "color": "#cfa",
      "name": "Gear Seeker",
      "desc": "Needs a rusty gear.",
      "prompt": "Wanderer fiddling with broken machine",
      "tree": {
        "start": {
          "text": "My rig is missing a rusty gear. Seen one?",
          "choices": [
            { "label": "(Give gear)", "to": "turnin", "reqItem": "rusty_gear" },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "turnin": {
          "text": "Perfect fit! Thanks.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        }
      }
    }
  ]
}
`;

globalThis.WORLD_ONE_MODULE = JSON.parse(DATA);

startGame = function(){
  applyModule(WORLD_ONE_MODULE);
  const s = WORLD_ONE_MODULE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'World One');
};
