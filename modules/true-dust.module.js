const DATA = `
{
  "seed": "true-dust",
  "name": "true-dust",
  "interiors": [
    {
      "id": "stonegate",
      "w": 6,
      "h": 6,
      "grid": [
        "🏝🏝🏝🏝🏝🏝",
        "🏝🧱🧱🧱🧱🏝",
        "🏝🏝🏝🏝🧱🏝",
        "🏝🧱🏝🏝🏝🚪",
        "🏝🧱🧱🧱🧱🏝",
        "🏝🏝🏝🏝🏝🏝"
      ],
      "entryX": 2,
      "entryY": 3
    },
    {
      "id": "lakeside",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🚪🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "maw_1",
      "w": 9,
      "h": 7,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🏝🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 1,
      "entryY": 3
    },
    {
      "id": "maw_2",
      "w": 9,
      "h": 7,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🏝🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 1,
      "entryY": 3
    },
    {
      "id": "maw_3",
      "w": 9,
      "h": 7,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🏝🏝🏝🏝🚪",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 1,
      "entryY": 3
    },
    {
      "id": "maw_4",
      "w": 9,
      "h": 7,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🚪🏝🏝🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 1,
      "entryY": 3
    }
  ],
  "npcs": [
    {
      "id": "rygar",
      "map": "stonegate",
      "x": 2,
      "y": 2,
      "color": "#d4aa70",
      "name": "Rygar",
      "title": "Gatewatch",
      "desc": "Keeps watch over Stonegate's gate.",
      "prompt": "Weathered gate guard with a copper pendant",
      "tree": {
        "start": {
          "text": "Stay sharp. The wastes bite.",
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
      "id": "gossip_mira",
      "map": "stonegate",
      "x": 3,
      "y": 2,
      "color": "#a9f59f",
      "name": "Settler",
      "title": "Gossip",
      "desc": "Whispers about Mira's radio obsession.",
      "prompt": "Chatty settler whispering rumors",
      "tree": {
        "start": {
          "text": [
            "Mira was always tuning the old towers.",
            "Rygar still wears that copper pendant."
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
      "id": "ganton",
      "map": "stonegate",
      "x": 1,
      "y": 2,
      "color": "#f99",
      "name": "Mayor Ganton",
      "title": "Rustwater",
      "desc": "Rustwater's mayor eyes you shiftily.",
      "prompt": "Shifty mayor in a rusted coat",
      "questId": "bandit_purge",
      "tree": {
        "start": {
          "text": "Bandits choke the road to Lakeside. Clear them and keep quiet.",
          "choices": [
            {
              "label": "(Take job)",
              "to": "accept",
              "q": "accept",
              "if": {
                "flag": "bandit_purge_active",
                "op": "<",
                "value": 1
              },
              "setFlag": {
                "flag": "bandit_purge_active",
                "op": "set",
                "value": 1
              }
            },
            {
              "label": "(Collect reward)",
              "to": "reward",
              "q": "turnin",
              "if": {
                "flag": "bandits_cleared",
                "op": ">=",
                "value": 1
              }
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "accept": {
          "text": "Don't ask questions. Just deal with them.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "reward": {
          "text": "Ganton slips you a prototype rifle.",
          "choices": [
            {
              "label": "(Take rifle)",
              "to": "bye",
              "reward": "pulse_rifle"
            }
          ]
        }
      }
    },
    {
      "id": "lakeside_dockhand",
      "map": "lakeside",
      "x": 2,
      "y": 2,
      "color": "#a9f59f",
      "name": "Dockhand",
      "title": "Lakeside",
      "desc": "A dockhand watching the shore.",
      "prompt": "Weathered dockhand staring at the water",
      "tree": {
        "start": {
          "text": "The dockhand studies the waves.",
          "choices": [
            {
              "label": "(Ask about Mira)",
              "to": "ask"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "with_rygar": {
          "text": "He hands Rygar a copper pendant fragment.",
          "choices": [
            {
              "label": "(Take fragment)",
              "to": "bye",
              "reward": "pendant_fragment"
            }
          ]
        },
        "without_rygar": {
          "text": "He warns you someone matching Mira's description was dragged onto a night boat.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye",
              "reward": "warning_note"
            }
          ]
        }
      }
    },
    {
      "id": "bandit_leader",
      "map": "lakeside",
      "x": 1,
      "y": 1,
      "color": "#f55",
      "name": "Bandit Leader",
      "desc": "A bandit blocks the road.",
      "prompt": "Road bandit in crude armor",
      "tree": {
        "start": {
          "text": "A bandit steps out, weapons drawn."
        }
      },
      "combat": {
        "HP": 10,
        "ATK": 3,
        "DEF": 1,
        "loot": "scrap"
      }
    },
    {
      "id": "mask_giver",
      "map": "world",
      "x": 8,
      "y": 5,
      "name": "Mask Hermit",
      "title": "Mask Giver",
      "desc": "A cloaked figure offers a mask.",
      "tree": {
        "start": {
          "text": "A cloaked figure offers a mask.",
          "choices": [
            {
              "label": "(Take mask)",
              "to": "give"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "give": {
          "text": "The mask hums with strange energy.",
          "choices": [
            {
              "label": "(Thanks)",
              "to": "bye",
              "reward": "mara_mask"
            }
          ]
        }
      }
    }
  ],
  "items": [
    {
      "id": "mira_note",
      "name": "Foreman's Note",
      "type": "quest",
      "desc": "A scrawled note about a girl with a copper pendant heading for Rustwater.",
      "map": "maw_4",
      "x": 7,
      "y": 3
    },
    {
      "id": "cracked_radio",
      "name": "Cracked Radio",
      "type": "trinket",
      "slot": "trinket"
    },
    {
      "id": "scrap_cache_1",
      "name": "Buried Cache",
      "type": "spoils-cache",
      "rank": "rusted",
      "map": "stonegate",
      "x": 0,
      "y": 1
    },
    {
      "id": "scrap_cache_2",
      "name": "Buried Cache",
      "type": "spoils-cache",
      "rank": "rusted",
      "map": "stonegate",
      "x": 5,
      "y": 4
    },
    {
      "id": "scrap_cache_3",
      "name": "Buried Cache",
      "type": "spoils-cache",
      "rank": "rusted",
      "map": "stonegate",
      "x": 2,
      "y": 0
    },
    {
      "id": "pulse_rifle",
      "name": "Pulse Rifle",
      "type": "weapon",
      "slot": "weapon",
      "mods": {
        "ATK": 4,
        "ADR": 25
      }
    },
    {
      "id": "pendant_fragment",
      "name": "Pendant Fragment",
      "type": "quest"
    },
    {
      "id": "warning_note",
      "name": "Warning Note",
      "type": "quest"
    },
    {
      "id": "mara_mask",
      "name": "Mara Mask",
      "type": "armor",
      "tags": [
        "mask"
      ],
      "persona": "mara.masked"
    }
  ],
  "quests": [
    {
      "id": "rygars_echo",
      "title": "Rygar's Echo",
      "desc": "Escort Rygar through the Maw Complex."
    },
    {
      "id": "static_whisper",
      "title": "Static Whisper",
      "desc": "Use the radio to uncover three scrap caches."
    },
    {
      "id": "bandit_purge",
      "title": "Bandit Purge",
      "desc": "Help Mayor Ganton clear the road to Lakeside."
    }
  ],
  "portals": [
    {
      "map": "stonegate",
      "x": 5,
      "y": 3,
      "toMap": "maw_1",
      "toX": 0,
      "toY": 3
    },
    {
      "map": "stonegate",
      "x": 0,
      "y": 3,
      "toMap": "lakeside",
      "toX": 2,
      "toY": 2
    },
    {
      "map": "lakeside",
      "x": 2,
      "y": 2,
      "toMap": "stonegate",
      "toX": 0,
      "toY": 3
    },
    {
      "map": "maw_1",
      "x": 0,
      "y": 3,
      "toMap": "stonegate",
      "toX": 5,
      "toY": 3
    },
    {
      "map": "maw_1",
      "x": 8,
      "y": 3,
      "toMap": "maw_2",
      "toX": 0,
      "toY": 3
    },
    {
      "map": "maw_2",
      "x": 0,
      "y": 3,
      "toMap": "maw_1",
      "toX": 8,
      "toY": 3
    },
    {
      "map": "maw_2",
      "x": 8,
      "y": 3,
      "toMap": "maw_3",
      "toX": 0,
      "toY": 3
    },
    {
      "map": "maw_3",
      "x": 0,
      "y": 3,
      "toMap": "maw_2",
      "toX": 8,
      "toY": 3
    },
    {
      "map": "maw_3",
      "x": 8,
      "y": 3,
      "toMap": "maw_4",
      "toX": 0,
      "toY": 3
    },
    {
      "map": "maw_4",
      "x": 0,
      "y": 3,
      "toMap": "maw_3",
      "toX": 8,
      "toY": 3
    }
  ],
  "zoneEffects": [
    {
      "map": "stonegate",
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 6,
      "spawns": [
        {
          "name": "Scavenger Rat",
          "HP": 5,
          "ATK": 1,
          "DEF": 0
        },
        {
          "name": "Feral Dog",
          "HP": 8,
          "ATK": 2,
          "DEF": 1
        }
      ],
      "minSteps": 2,
      "maxSteps": 4
    },
    {
      "map": "stonegate",
      "x": 1,
      "y": 1,
      "w": 4,
      "h": 4,
      "noEncounters": true
    },
    {
      "map": "maw_1",
      "x": 0,
      "y": 0,
      "w": 9,
      "h": 7,
      "spawns": [
        {
          "name": "Scavenger Rat",
          "HP": 5,
          "ATK": 1,
          "DEF": 0
        },
        {
          "name": "Undead Worker",
          "HP": 10,
          "ATK": 2,
          "DEF": 1
        },
        {
          "name": "Soldier Remnant",
          "HP": 12,
          "ATK": 3,
          "DEF": 2
        }
      ],
      "minSteps": 1,
      "maxSteps": 3
    },
    {
      "map": "maw_2",
      "x": 0,
      "y": 0,
      "w": 9,
      "h": 7,
      "spawns": [
        {
          "name": "Scavenger Rat",
          "HP": 5,
          "ATK": 1,
          "DEF": 0
        },
        {
          "name": "Undead Worker",
          "HP": 10,
          "ATK": 2,
          "DEF": 1
        },
        {
          "name": "Soldier Remnant",
          "HP": 12,
          "ATK": 3,
          "DEF": 2
        }
      ],
      "minSteps": 1,
      "maxSteps": 3
    },
    {
      "map": "maw_3",
      "x": 0,
      "y": 0,
      "w": 9,
      "h": 7,
      "spawns": [
        {
          "name": "Scavenger Rat",
          "HP": 5,
          "ATK": 1,
          "DEF": 0
        },
        {
          "name": "Undead Worker",
          "HP": 10,
          "ATK": 2,
          "DEF": 1
        },
        {
          "name": "Soldier Remnant",
          "HP": 12,
          "ATK": 3,
          "DEF": 2
        }
      ],
      "minSteps": 1,
      "maxSteps": 3
    },
    {
      "map": "maw_4",
      "x": 0,
      "y": 0,
      "w": 9,
      "h": 7,
      "spawns": [
        {
          "name": "Scavenger Rat",
          "HP": 5,
          "ATK": 1,
          "DEF": 0
        },
        {
          "name": "Undead Worker",
          "HP": 10,
          "ATK": 2,
          "DEF": 1
        },
        {
          "name": "Soldier Remnant",
          "HP": 12,
          "ATK": 3,
          "DEF": 2
        }
      ],
      "minSteps": 1,
      "maxSteps": 3
    }
  ],
  "start": {
    "map": "stonegate",
    "x": 2,
    "y": 3
  }
}
`;

function startPendant() {
  if (startPendant._t) return;
  startPendant._t = setInterval(() => {
    const r = party.find(m => m.id === 'rygar');
    if (!r) {
      clearInterval(startPendant._t);
      startPendant._t = null;
      return;
    }
    if (typeof playFX === 'function') playFX('status');
    if (typeof log === 'function') log("Rygar's pendant glints.");
  }, 8000);
}

function startRadio() {
  if (startRadio._t) return;
  const caches = TRUE_DUST.items.filter(i => i.id.startsWith('scrap_cache'));
  startRadio._t = setInterval(() => {
    const hasRadio = party.some(m => m.equip?.trinket?.id === 'cracked_radio');
    if (!hasRadio) return;
    const near = caches.some(c => party.map === c.map && Math.abs(party.x - c.x) <= 1 && Math.abs(party.y - c.y) <= 1);
    if (near) {
      if (typeof toast === 'function') toast('Static bursts from the radio.');
      if (typeof log === 'function') log('The radio crackles with static.');
    }
  }, 1000);
}

function postLoad(module) {
  const rygar = module.npcs.find(n => n.id === 'rygar');
  if (rygar && rygar.tree && rygar.tree.start) {
    rygar.tree.start.choices.unshift({
      label: 'Travel with us',
      join: { id: 'rygar', name: 'Rygar', role: 'Guard' },
      effects: [startPendant],
      to: 'joined'
    });
    rygar.tree.joined = {
      text: 'Rygar nods and falls in step.',
      choices: [ { label: '(Leave)', to: 'bye' } ]
    };
  }
  const dock = module.npcs.find(n => n.id === 'lakeside_dockhand');
  if (dock) {
    dock.processNode = function (node) {
      if (node === 'ask') {
        dialogState.node = party.some(m => m.id === 'rygar') ? 'with_rygar' : 'without_rygar';
      }
    };
  }
  const bandit = module.npcs.find(n => n.id === 'bandit_leader');
  if (bandit && bandit.combat) {
    bandit.combat.effects = [() => setFlag('bandits_cleared', 1)];
  }
  module.quests?.forEach(q => addQuest(q.id, q.title, q.desc, q));
}

globalThis.TRUE_DUST = JSON.parse(DATA);
globalThis.TRUE_DUST.postLoad = postLoad;
globalThis.TRUE_DUST.startRadio = startRadio;

startGame = function () {
  applyModule(TRUE_DUST);
  const s = TRUE_DUST.start;
  setMap(s.map, 'Stonegate');
  setPartyPos(s.x, s.y);
  startRadio();
};
