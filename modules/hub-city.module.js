function seedWorldContent() {}

const DATA = `
{
  "seed": "hub-city",
  "name": "hub-city",
  "start": { "map": "hub", "x": 2, "y": 2 },
  "npcs": [
    {
      "id": "quartermaster",
      "map": "hub",
      "x": 4,
      "y": 2,
      "color": "#9ef7a0",
      "name": "Quartermaster",
      "desc": "Stocks basic supplies for caravans.",
      "prompt": "Rugged quartermaster with a grease-stained apron",
      "tree": { "start": { "text": "Need gear?", "choices": [ { "label": "(Leave)", "to": "bye" } ] } }
    }
  ],
  "interiors": [
    {
      "id": "hub",
      "w": 8,
      "h": 6,
      "grid": [
        [6,6,6,6,6,6,6,6],
        [6,7,7,7,7,7,7,6],
        [6,7,7,7,7,7,7,6],
        [6,7,7,7,7,7,7,6],
        [6,7,7,7,7,7,7,6],
        [6,6,6,6,6,6,6,6]
      ],
      "entryX": 2,
      "entryY": 2
    }
  ],
  "buildings": []
}
`;

globalThis.HUB_CITY_MODULE = JSON.parse(DATA);

startGame = function () {
  applyModule(HUB_CITY_MODULE);
  const s = HUB_CITY_MODULE.start || { map: 'hub', x: 2, y: 2 };
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Hub City');
};
