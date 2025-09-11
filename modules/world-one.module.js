function seedWorldContent() {}

const DATA = `
{
  "seed": "world-one",
  "start": { "map": "world", "x": 2, "y": 2 },
  "items": [
    { "id": "fuel_cell", "name": "Fuel Cell", "type": "quest" },
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
          "effects": [ { "effect": "activateBunker", "id": "beta" } ],
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        }
      }
    },
    {
      "id": "bunker_alpha",
      "map": "world",
      "x": 4,
      "y": 2,
      "color": "#aaa",
      "name": "Bunker Alpha",
      "desc": "A flickering terminal awaits activation.",
      "prompt": "Dusty bunker terminal",
      "tree": {
        "start": {
          "text": "Power hums faintly behind the panel.",
          "choices": [
            { "label": "(Activate)", "to": "activate" },
            { "label": "(Fast travel)", "effects": [ { "effect": "openWorldMap", "id": "alpha" } ], "to": "bye" },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "activate": {
          "text": "Alpha bunker added to network.",
          "effects": [ { "effect": "activateBunker", "id": "alpha" } ],
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

globalThis.WORLD_ONE_MODULE = JSON.parse(DATA);
function postLoad(module){
  const handle = list => (list || []).map(e => {
    if (e && e.effect === 'activateBunker') {
      return () => Dustland.fastTravel?.activateBunker?.(e.id);
    }
    if (e && e.effect === 'openWorldMap') {
      return () => Dustland.worldMap?.open?.(e.id);
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
globalThis.WORLD_ONE_MODULE.postLoad = postLoad;

startGame = function(){
  WORLD_ONE_MODULE.postLoad?.(WORLD_ONE_MODULE);
  applyModule(WORLD_ONE_MODULE);
  const s = WORLD_ONE_MODULE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'World One');
};
