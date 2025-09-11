function seedWorldContent() {}

const DATA = `
{
  "seed": "world-two",
  "start": { "map": "world", "x": 2, "y": 2 },
  "items": [
    { "id": "fuel_cell", "name": "Fuel Cell", "type": "quest" },
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
    },
    {
      "id": "bunker_beta",
      "map": "world",
      "x": 4,
      "y": 2,
      "color": "#aaa",
      "name": "Bunker Beta",
      "desc": "A flickering terminal awaits activation.",
      "prompt": "Dusty bunker terminal",
      "tree": {
        "start": {
          "text": "Power hums faintly behind the panel.",
          "choices": [
            { "label": "(Activate)", "to": "activate" },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "activate": {
          "text": "Beta bunker added to network.",
          "effects": [ { "effect": "activateBunker", "id": "beta" } ],
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        }
      }
    }
  ],
  "templates": [
    { "id": "scrap_rat", "name": "Scrap Rat", "combat": { "HP": 3, "ATK": 1, "DEF": 0 } }
  ],
  "encounters": {
    "world": [
      { "templateId": "scrap_rat", "loot": "fuel_cell", "maxDist": 5 }
    ]
  }
}
`;

globalThis.WORLD_TWO_MODULE = JSON.parse(DATA);
function postLoad(module){
  const handle = list => (list || []).map(e => {
    if (e && e.effect === 'activateBunker') {
      return () => Dustland.fastTravel?.activateBunker?.(e.id);
    }
    return e;
  });
  module.npcs?.forEach(n => {
    Object.values(n.tree || {}).forEach(node => {
      if (node.effects) node.effects = handle(node.effects);
      node.choices?.forEach(c => {
        if (c.effects) c.effects = handle(c.effects);
      });
    });
  });
}
globalThis.WORLD_TWO_MODULE.postLoad = postLoad;

startGame = function(){
  WORLD_TWO_MODULE.postLoad?.(WORLD_TWO_MODULE);
  applyModule(WORLD_TWO_MODULE);
  const s = WORLD_TWO_MODULE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'World Two');
};
