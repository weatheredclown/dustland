globalThis.seedWorldContent = globalThis.seedWorldContent ?? (() => {});

(function () {
const DATA = `
{
  "seed": "world-one",
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
      0
    ],
    [
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
      0
    ],
    [
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
      "x": 0,
      "y": 1,
      "desc": "Packaged fuel cell tucked under debris."
    },
    {
      "id": "rusty_gear",
      "name": "Rusty Gear",
      "type": "quest",
      "map": "world",
      "x": 3,
      "y": 2
    },
    {
      "id": "alpha_cache_one",
      "name": "Salvage Cache (Alpha)",
      "type": "quest",
      "map": "world",
      "x": 1,
      "y": 3,
      "fuel": 8,
      "desc": "Hand-packed power cells ready for bunker jumps."
    },
    {
      "id": "alpha_cache_two",
      "name": "Salvage Cache (Alpha East)",
      "type": "quest",
      "map": "world",
      "x": 3,
      "y": 4,
      "fuel": 6,
      "desc": "Cache of scavenged cells near the bunker."
    },
    {
      "id": "alpha_fuel",
      "name": "Alpha Fuel Reserve",
      "type": "quest",
      "fuel": 12,
      "desc": "Power cells gifted by the grateful mechanic."
    }
  ],
  "buildings": [
    {
      "x": 4,
      "y": 2,
      "w": 1,
      "h": 1,
      "doorX": 4,
      "doorY": 2,
      "boarded": true,
      "bunker": true,
      "bunkerId": "alpha"
    }
  ],
  "npcs": [
    {
      "id": "npc_a",
      "map": "world",
      "x": 1,
      "y": 2,
      "color": "#cfa",
      "name": "NPC A",
      "desc": "Needs a rusty gear.",
      "prompt": "Wanderer fiddling with broken machine",
      "tree": {
        "start": {
          "text": "My rig is missing a rusty gear. Seen one?",
          "choices": [
            {
              "label": "(Give gear)",
              "to": "turnin",
              "reqItem": "rusty_gear"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "turnin": {
          "text": "Perfect fit! Thanks.",
          "effects": [
            {
              "effect": "toast",
              "id": null,
              "msg": "The bunker door slides open."
            },
            {
              "effect": "unboardDoor",
              "bunkerId": "alpha"
            },
            {
              "effect": "activateBunker",
              "id": "alpha"
            },
            {
              "effect": "addItem",
              "id": "alpha_fuel"
            },
            {
              "effect": "toast",
              "msg": "Fuel +12 from the repaired rig."
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
            {
              "label": "(Activate)",
              "to": "activate"
            },
            {
              "label": "(Fast travel)",
              "effects": [
                {
                  "effect": "openWorldMap",
                  "id": "alpha"
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
          "text": "Alpha bunker added to network.",
          "effects": [
            {
              "effect": "activateBunker",
              "id": "alpha"
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
  "name": "world-one-module",
  "props": {
    "fastTravelModules": [
      {
        "script": "modules/world-two.module.js",
        "global": "WORLD_TWO_MODULE",
        "module": "world-two"
      }
    ]
  }
}
`;

const worldOneModule = JSON.parse(DATA) as DustlandModuleInstance;
globalThis.WORLD_ONE_MODULE = worldOneModule;

function postLoad(module: DustlandModuleInstance) {
  const handle = (list?: unknown): unknown[] => {
    const entries = Array.isArray(list) ? list : [];
    return entries.map(effect => {
      if (effect && typeof effect === 'object') {
        const effectRecord = effect as { effect?: string; id?: string };
        if (effectRecord.effect === 'activateBunker') {
          return () => Dustland.fastTravel?.activateBunker?.(effectRecord.id);
        }
        if (effectRecord.effect === 'openWorldMap') {
          return () => Dustland.worldMap?.open?.(effectRecord.id);
        }
      }
      return effect;
    });
  };
  module.npcs?.forEach(npc => {
    const nodes = npc.tree ? Object.values(npc.tree) : [];
    nodes.forEach(node => {
      if (!node || typeof node !== 'object') {
        return;
      }
      const nodeRecord = node as Record<string, unknown>;
      const nodeEffects = nodeRecord['effects'];
      if (Array.isArray(nodeEffects)) {
        nodeRecord['effects'] = handle(nodeEffects);
      }
      const choices = nodeRecord['choices'];
      if (Array.isArray(choices)) {
        choices.forEach(choice => {
          if (!choice || typeof choice !== 'object') {
            return;
          }
          const choiceRecord = choice as Record<string, unknown>;
          const choiceEffects = choiceRecord['effects'];
          if (Array.isArray(choiceEffects)) {
            choiceRecord['effects'] = handle(choiceEffects);
          }
        });
      }
    });
  });

  type ModuleWithTimers = DustlandModuleInstance & {
    _timers?: Record<string, ReturnType<typeof setTimeout> | null>;
  };
  const moduleWithTimers = module as ModuleWithTimers;
  const timers = moduleWithTimers._timers ?? (moduleWithTimers._timers = {});
  function ensureCourier(
    flag: string,
    dropFactory: (() => Record<string, unknown>) | Record<string, unknown>,
    messageFactory: ((drop: Record<string, unknown>) => string) | string,
    intervalMs?: number
  ){
    if (!flag || typeof setTimeout !== 'function') return;
    if (timers[flag]) return;
    const interval = Math.max(1000, intervalMs ?? 20000);
    const roster = (globalThis as { party?: Party }).party;
    if (!roster) return;
    const flags = roster.flags ?? (roster.flags = {} as PartyFlags);
    const last = Number(flags[flag]) || 0;
    const now = Date.now();
    const initialDelay = last ? Math.max(0, interval - (now - last)) : interval;
    function schedule(delay: number){
      timers[flag] = setTimeout(() => {
        timers[flag] = null;
        const drop = typeof dropFactory === 'function'
          ? dropFactory()
          : { ...(dropFactory as Record<string, unknown>) };
        let added = false;
        if (typeof globalThis.addToInv === 'function') {
          added = !!globalThis.addToInv(drop);
        }
        if (!added && typeof globalThis.dropItemNearParty === 'function') {
          globalThis.dropItemNearParty(drop);
        }
        flags[flag] = Date.now();
        const msg = typeof messageFactory === 'function'
          ? messageFactory(drop)
          : messageFactory;
        if (msg) {
          if (typeof log === 'function') log(msg);
          if (typeof toast === 'function') toast(msg);
        }
        Dustland.eventBus?.emit?.('courier:delivered', {
          module: module.seed || module.name || 'world-one',
          flag,
          item: drop
        });
        schedule(interval);
      }, Math.max(0, delay));
    }
    schedule(initialDelay);
  }

  ensureCourier(
    'world_one_courier',
    () => ({
      id: 'world_one_courier_drop',
      name: 'Courier Drop (Alpha Line)',
      type: 'quest',
      fuel: 8,
      desc: 'Emergency cells routed to keep Alpha online.'
    }),
    drop => `Courier drop delivered ${drop.fuel ?? 0} fuel to Alpha.`,
    20000
  );
}
worldOneModule.postLoad = postLoad;

})();

globalThis.startGame = function startGame() {
  const moduleData = globalThis.WORLD_ONE_MODULE;
  if (!moduleData) {
    return;
  }

  moduleData.postLoad?.(moduleData);
  applyModule(moduleData);
  const start = moduleData.start;
  if (start) {
    setPartyPos(start.x, start.y);
    setMap(start.map, 'World One');
  }
};
