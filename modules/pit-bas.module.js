function seedWorldContent() {}

const DATA = `
{
  "seed": "pit-bas",
  "name": "pit-bas",
  "start": { "map": "cavern", "x": 1, "y": 1 },
  "items": [],
  "quests": [],
  "npcs": [],
  "interiors": [],
  "buildings": []
}
`;

function postLoad(module) {}

globalThis.PIT_BAS_MODULE = JSON.parse(DATA);
globalThis.PIT_BAS_MODULE.postLoad = postLoad;

startGame = function () {
  applyModule(PIT_BAS_MODULE);
  const s = PIT_BAS_MODULE.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setPartyPos(s.x, s.y);
  setMap(s.map, s.map === 'world' ? 'Wastes' : 'PIT.BAS');
};
