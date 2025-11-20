(function () {
    const globals = globalThis;
    const DATA = `
{
  "seed": "world-two",
  "start": {
    "map": "world",
    "x": 2,
    "y": 2
  },
  "world": [
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  ],
  "items": [
    {
      "id": "fuel_cell",
      "name": "Fuel Cell",
      "type": "quest",
      "fuel": 50,
      "map": "world",
      "x": 5,
      "y": 5,
      "desc": "Courier crate brimming with fuel cells."
    },
    {
      "id": "shiny_cog",
      "name": "Shiny Cog",
      "type": "quest",
      "map": "world",
      "x": 2,
      "y": 3
    },
    {
      "id": "beta_cache_market",
      "name": "Salvage Cache (Market)",
      "type": "quest",
      "map": "world",
      "x": 1,
      "y": 4,
      "fuel": 7,
      "desc": "Abandoned courier locker stuffed with cells."
    },
    {
      "id": "beta_cache_rooftop",
      "name": "Salvage Cache (Rooftop)",
      "type": "quest",
      "map": "world",
      "x": 5,
      "y": 1,
      "fuel": 9,
      "desc": "Wind-scoured cache lashed to the bunker roof."
    },
    {
      "id": "beta_fuel",
      "name": "Beta Fuel Dividend",
      "type": "quest",
      "fuel": 10,
      "desc": "Courier thanks with fresh power cells."
    }
  ],
  "buildings": [
    {
      "x": 6,
      "y": 3,
      "w": 1,
      "h": 1,
      "doorX": 6,
      "doorY": 3,
      "boarded": false,
      "bunker": true,
      "bunkerId": "beta"
    }
  ],
  "npcs": [
    {
      "id": "npc_b",
      "map": "world",
      "x": 2,
      "y": 1,
      "color": "#acf",
      "name": "NPC B",
      "desc": "Looking for a shiny cog.",
      "prompt": "Scavenger eyeing a broken robot",
      "tree": {
        "start": {
          "text": "I could use a shiny cog.",
          "choices": [
            {
              "label": "(Give cog)",
              "to": "turnin",
              "reqItem": "shiny_cog"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "turnin": {
          "text": "Great, thanks.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ],
          "effects": [
            {
              "effect": "addItem",
              "id": "beta_fuel"
            },
            {
              "effect": "toast",
              "msg": "Fuel +10 from grateful courier."
            }
          ]
        }
      }
    },
    {
      "id": "bunker_beta",
      "map": "world",
      "x": 6,
      "y": 3,
      "color": "#aaa",
      "name": "Bunker Beta",
      "desc": "A flickering terminal awaits activation.",
      "prompt": "Dusty bunker terminal",
      "tree": {
        "start": {
          "text": "Power hums faintly behind the panel.",
          "choices": [
            {
              "label": "(Activate)",
              "to": "activate"
            },
            {
              "label": "(Fast travel)",
              "effects": [
                {
                  "effect": "openWorldMap",
                  "id": "beta"
                }
              ],
              "to": "bye"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "activate": {
          "text": "Beta bunker added to network.",
          "effects": [
            {
              "effect": "activateBunker",
              "id": "beta"
            }
          ],
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      }
    }
  ],
  "templates": [
    {
      "id": "scrap_rat",
      "name": "Scrap Rat",
      "combat": {
        "HP": 3,
        "ATK": 1,
        "DEF": 0
      }
    }
  ],
  "encounters": {
    "world": [
      {
        "templateId": "scrap_rat",
        "loot": "fuel_cell",
        "maxDist": 5
      }
    ]
  },
  "name": "world-two-module",
  "props": {
    "fastTravelModules": [
      {
        "script": "modules/world-one.module.js",
        "global": "WORLD_ONE_MODULE",
        "module": "world-one"
      }
    ]
  }
}
`;
    const WORLD_TWO_MODULE = (globals.WORLD_TWO_MODULE = JSON.parse(DATA));
    function postLoad(module) {
        const handle = (list) => (list || []).map((e) => {
            if (e && e.effect === 'activateBunker') {
                return () => globals.Dustland?.fastTravel?.activateBunker?.(e.id);
            }
            if (e && e.effect === 'openWorldMap') {
                return () => globals.Dustland?.worldMap?.open?.(e.id);
            }
            return e;
        });
        module.npcs?.forEach(n => {
            Object.values(n.tree || {}).forEach(node => {
                if (node.effects)
                    node.effects = handle(node.effects);
                node.choices?.forEach(c => {
                    if (c.effects)
                        c.effects = handle(c.effects);
                });
            });
        });
        function activateBunkerWhenReady(id, attempts) {
            if (!id || attempts <= 0)
                return;
            const ft = globals.Dustland?.fastTravel;
            if (ft?.activateBunker) {
                ft.activateBunker(id);
                return;
            }
            if (typeof setTimeout === 'function') {
                setTimeout(() => activateBunkerWhenReady(id, attempts - 1), 50);
            }
        }
        activateBunkerWhenReady('beta', 20);
        const timers = module._timers ?? (module._timers = {});
        const partyState = globals.party ?? (globals.party = {});
        function ensureCourier(flag, dropFactory, messageFactory, intervalMs) {
            if (!flag || typeof setTimeout !== 'function')
                return;
            if (timers[flag])
                return;
            const interval = Math.max(1000, intervalMs || 22000);
            partyState.flags = partyState.flags || {};
            const last = Number(partyState.flags[flag]) || 0;
            const now = Date.now();
            const initialDelay = last ? Math.max(0, interval - (now - last)) : interval;
            function schedule(delay) {
                timers[flag] = setTimeout(() => {
                    timers[flag] = null;
                    const drop = typeof dropFactory === 'function' ? dropFactory() : { ...dropFactory };
                    let added = false;
                    if (typeof globals.addToInv === 'function') {
                        added = !!globals.addToInv(drop);
                    }
                    if (!added && typeof globals.dropItemNearParty === 'function') {
                        globals.dropItemNearParty(drop);
                    }
                    partyState.flags[flag] = Date.now();
                    const msg = typeof messageFactory === 'function' ? messageFactory(drop) : messageFactory;
                    if (msg) {
                        if (typeof globals.log === 'function')
                            globals.log(msg);
                        if (typeof globals.toast === 'function')
                            globals.toast(msg);
                    }
                    globals.Dustland?.eventBus?.emit?.('courier:delivered', {
                        module: module.seed || module.name || 'world-two',
                        flag,
                        item: drop
                    });
                    schedule(interval);
                }, Math.max(0, delay));
            }
            schedule(initialDelay);
        }
        ensureCourier('world_two_courier', () => ({
            id: 'world_two_courier_drop',
            name: 'Courier Drop (Beta Line)',
            type: 'quest',
            fuel: 10,
            desc: 'Beta line couriers stash fuel near the terminal.'
        }), drop => `Courier drop delivered ${drop.fuel ?? 0} fuel to Beta.`, 22000);
    }
    globals.WORLD_TWO_MODULE.postLoad = postLoad;
})();
globalThis.startGame = function () {
    const globals = globalThis;
    const moduleData = globals.WORLD_TWO_MODULE;
    if (!moduleData)
        return;
    moduleData.postLoad?.(moduleData);
    globals.applyModule?.(moduleData);
    const s = moduleData.start;
    if (!s)
        return;
    globals.setPartyPos?.(s.x, s.y);
    globals.setMap?.(s.map, 'World Two');
};
