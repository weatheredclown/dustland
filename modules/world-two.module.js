function seedWorldContent() {}

const DATA = `
{
  "seed": "world-two",
  "start": { "map": "world", "x": 2, "y": 2 },
  "items": [
    { "id": "shiny_cog", "name": "Shiny Cog", "type": "quest", "map": "world", "x": 2, "y": 3 }
  ],
  "npcs": [
    {
      "id": "cog_hunter",
      "map": "world",
      "x": 2,
      "y": 1,
      "color": "#acf",
      "name": "Cog Hunter",
      "desc": "Looking for a shiny cog.",
      "prompt": "Scavenger eyeing a broken robot",
      "tree": {
        "start": {
          "text": "I could use a shiny cog.",
          "choices": [
            { "label": "(Give cog)", "to": "turnin", "reqItem": "shiny_cog" },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "turnin": {
          "text": "Great, thanks.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        }
      }
    }
  ]
}
`;

globalThis.WORLD_TWO_MODULE = JSON.parse(DATA);

startGame = function(){
  applyModule(WORLD_TWO_MODULE);
  const s = WORLD_TWO_MODULE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'World Two');
};
