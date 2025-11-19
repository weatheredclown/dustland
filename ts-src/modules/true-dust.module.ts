type TrueDustItem = {
  id: string;
  map?: string;
  x?: number;
  y?: number;
  [key: string]: unknown;
};

type TrueDustModule = DustlandModuleInstance & {
  items: TrueDustItem[];
  start: { map: string; x: number; y: number };
  quests?: MaskQuest[];
  postLoad?: (moduleData: DustlandModuleInstance) => void;
  startRadio?: () => void;
};

type MaskQuest = Quest & { progress?: number; desc?: string; autoStart?: boolean; title?: string };

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
      "desc": "A cloaked hermit claims masks carry borrowed lives.",
      "tree": {
        "start": {
          "text": "The hermit cradles a blank porcelain mask, whispering that personas are borrowed lives waiting for a new pulse.",
          "choices": [
            {
              "label": "(Ask about the masks)",
              "to": "lore"
            },
            {
              "label": "(Accept the mask's memory)",
              "to": "accept",
              "q": "accept",
              "if": {
                "flag": "mask_memory_stage",
                "op": "<",
                "value": 1
              },
              "setFlag": {
                "flag": "mask_memory_stage",
                "op": "set",
                "value": 1
              }
            },
            {
              "label": "(Offer recovered mask)",
              "to": "do_turnin",
              "q": "turnin",
              "if": {
                "flag": "mask_memory_stage",
                "op": "=",
                "value": 1
              }
            },
            {
              "label": "(Reflect on the persona)",
              "to": "after",
              "if": {
                "flag": "mask_memory_stage",
                "op": ">=",
                "value": 2
              }
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "give": null,
        "lore": {
          "text": "These aren't disguises, the hermit explains. A persona rides with you, murmuring memories into your bones until you let go.",
          "choices": [
            {
              "label": "(Back)",
              "to": "start"
            }
          ]
        },
        "accept": {
          "text": "Bring me a mask dredged from the Stonegate caches. We'll wake the echo trapped within and see who it still remembers.",
          "choices": [
            {
              "label": "(I'll return)",
              "to": "bye"
            }
          ]
        },
        "do_turnin": {
          "text": "He cups the scavenged mask and listens, asking the echo inside what name it still answers to.",
          "choices": [
            {
              "label": "(Channel the memory)",
              "to": "after",
              "setFlag": {
                "flag": "mask_memory_stage",
                "op": "set",
                "value": 2
              }
            }
          ]
        },
        "after": {
          "text": "The hermit presses the awakened mask into your hands. “Rest at camp,” he urges. “Let it choose whose face to wear before the memory fades.”",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "questId": "mask_memory"
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
      },
      "tags": [
        "ranged"
      ]
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
    },
    {
      "id": "mask_memory",
      "title": "Echoes in the Mask",
      "desc": "Salvage a buried mask near Stonegate so the hermit can wake the persona dreaming inside.",
      "itemTag": "mask",
      "count": 1,
      "reward": "mara_mask",
      "xp": 4,
      "autoStart": false
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

const TRUE_DUST = JSON.parse(DATA) as TrueDustModule;

let pendantTimer: ReturnType<typeof setInterval> | null = null;
const startPendant = (): void => {
  if (pendantTimer) return;
  pendantTimer = setInterval(() => {
    const r = party.find(m => m.id === 'rygar');
    if (!r) {
      if (pendantTimer) clearInterval(pendantTimer);
      pendantTimer = null;
      return;
    }
    if (typeof playFX === 'function') playFX('status');
    if (typeof log === 'function') log("Rygar's pendant glints.");
  }, 8000);
};

let radioTimer: ReturnType<typeof setInterval> | null = null;
const startRadio = (): void => {
  if (radioTimer) return;
  const caches = (TRUE_DUST.items ?? []).filter(
    (item): item is TrueDustItem => typeof item?.id === 'string' && item.id.startsWith('scrap_cache')
  );
  const partyState = party as unknown as Party & { map: string; x: number; y: number };
  radioTimer = setInterval(() => {
    const hasRadio = party.some(m => m.equip?.trinket?.id === 'cracked_radio');
    if (!hasRadio) return;
    const near = caches.some(c =>
      partyState.map === c.map && Math.abs(partyState.x - (c.x ?? 0)) <= 1 && Math.abs(partyState.y - (c.y ?? 0)) <= 1
    );
    if (near) {
      if (typeof toast === 'function') toast('Static bursts from the radio.');
      if (typeof log === 'function') log('The radio crackles with static.');
    }
  }, 1000);
};

const MASK_QUEST_ID = 'mask_memory';
const MASK_QUEST_FLAG = 'mask_memory_stage';
const MASK_JOURNAL = [
  'Salvage a buried mask near Stonegate so the hermit can wake the persona dreaming inside.',
  'You recovered a dormant mask humming with borrowed life. Bring it to the hermit before the echo fades.',
  'The mask is awake. Rest at camp so it can choose whose face to wear.'
];
const MASK_STAGE_TEXT = [
  'The hermit cradles a blank porcelain mask, whispering that personas are borrowed lives waiting for a new pulse.',
  'The hermit listens for distant echoes. “Find me a mask buried in this dust and we will wake whoever still clings to it.”',
  'Static hums around your pack. “I hear the borrowed life you carry,” he says. “Bring it before the memory slips.”',
  'The hermit watches the awakened mask tilt toward your camp, content to let the memory ride with you.'
];
const MASK_CHECKPOINTS = ['accepted', 'recovered', 'awakened'];
let maskQuestSetupDone = false;
let maskHermitTree: DustlandDialogTree | null = null;

function updateMaskHermitStart(stage: number): void {
  if (!maskHermitTree?.start) return;
  const idx = stage >= 0 ? stage + 1 : 0;
  maskHermitTree.start.text = MASK_STAGE_TEXT[idx] || MASK_STAGE_TEXT[0];
}

function maskQuestCheckpoint(stage: number): void {
  const key = MASK_CHECKPOINTS[stage];
  if (!key) return;
  if (typeof log === 'function') log(`Checkpoint: mask quest ${key}.`);
  globalThis.EventBus?.emit?.('quest:checkpoint', { questId: MASK_QUEST_ID, stage: key });
}

function setMaskQuestStage(stage: number): void {
  const quest = globalThis.quests?.[MASK_QUEST_ID] as MaskQuest | undefined;
  if (!quest) return;
  if (quest.progress === stage) {
    updateMaskHermitStart(stage);
    return;
  }
  quest.progress = stage;
  const desc = MASK_JOURNAL[Math.min(stage, MASK_JOURNAL.length - 1)] || quest.desc;
  quest.desc = desc;
  if (typeof renderQuests === 'function') renderQuests();
  updateMaskHermitStart(stage);
  if (stage === 0 && typeof flagValue === 'function' && flagValue(MASK_QUEST_FLAG) < 1) {
    globalThis.setFlag?.(MASK_QUEST_FLAG, 1);
  }
  if (stage === 2) {
    globalThis.setFlag?.(MASK_QUEST_FLAG, 2);
  }
  maskQuestCheckpoint(stage);
}

function beginMaskQuest(): void {
  const quest = globalThis.quests?.[MASK_QUEST_ID] as MaskQuest | undefined;
  if (!quest) return;
  if (quest.status !== 'active') {
    globalThis.questLog?.add?.(quest);
  }
  setMaskQuestStage(0);
}

function handleMaskAcquired(item: { tags?: string[] } | null | undefined): void {
  const quest = globalThis.quests?.[MASK_QUEST_ID];
  if (!quest || quest.status !== 'active' || quest.progress >= 1) return;
  const tags = Array.isArray(item?.tags) ? item.tags.map(t => t.toLowerCase()) : [];
  if (!tags.includes('mask')) return;
  setMaskQuestStage(1);
}

function handleMaskQuestCompleted(evt: QuestCompletedPayload | null | undefined): void {
  const quest = evt?.quest as MaskQuest | undefined;
  if (!quest || quest.id !== MASK_QUEST_ID) return;
  setMaskQuestStage(2);
}

function completeMaskQuest(): void {
  setMaskQuestStage(2);
}

function syncMaskQuestState(module: TrueDustModule): void {
  const quest = globalThis.quests?.[MASK_QUEST_ID] as MaskQuest | undefined;
  if (!quest) return;
  if (quest.status === 'completed') {
    setMaskQuestStage(2);
    return;
  }
  if (quest.status === 'active') {
    if (typeof flagValue === 'function' && flagValue(MASK_QUEST_FLAG) < 1) {
      globalThis.setFlag?.(MASK_QUEST_FLAG, 1);
    }
    const hasMask = typeof countItems === 'function' ? countItems('mask') > 0 : false;
    setMaskQuestStage(hasMask ? 1 : 0);
    return;
  }
  quest.progress = -1;
  if (!maskHermitTree) {
    const hermit = (module.npcs ?? []).find(npc => npc.id === 'mask_giver');
    maskHermitTree = (typeof hermit?.tree === 'function'
      ? hermit.tree()
      : hermit?.tree ?? null) as DustlandDialogTree | null;
  }
  updateMaskHermitStart(-1);
}

function setupMaskQuest(module: TrueDustModule): void {
  const quest = globalThis.quests?.[MASK_QUEST_ID] as MaskQuest | undefined;
  if (!quest) return;
  const hermit = (module.npcs ?? []).find(npc => npc.id === 'mask_giver');
  const hermitTree = (typeof hermit?.tree === 'function'
    ? hermit.tree()
    : hermit?.tree ?? null) as DustlandDialogTree | null;
  const treeStart = hermitTree?.start;
  if (!treeStart) return;
  maskHermitTree = hermitTree;
  const startChoices = Array.isArray(treeStart.choices) ? treeStart.choices : [];
  const accept = startChoices.find((choice): choice is DustlandDialogChoice =>
    typeof choice === 'object' && choice !== null && 'q' in choice
  );
  if (accept) {
    accept.effects = Array.isArray(accept.effects) ? accept.effects : [];
    if (!accept.effects.includes(beginMaskQuest)) accept.effects.push(beginMaskQuest);
  }
  const turninChoices = Array.isArray(hermitTree?.do_turnin?.choices)
    ? hermitTree?.do_turnin?.choices
    : [];
  const turnin = turninChoices?.find((choice): choice is DustlandDialogChoice =>
    typeof choice === 'object' && choice !== null && 'to' in choice
  );
  if (turnin) {
    turnin.effects = Array.isArray(turnin.effects) ? turnin.effects : [];
    if (!turnin.effects.includes(completeMaskQuest)) {
      turnin.effects.push(completeMaskQuest);
    }
  }
  if (!maskQuestSetupDone) {
    maskQuestSetupDone = true;
    globalThis.EventBus?.on?.('item:picked', handleMaskAcquired);
    globalThis.EventBus?.on?.('quest:completed', handleMaskQuestCompleted);
  }
  if (typeof flagValue === 'function' && flagValue(MASK_QUEST_FLAG) >= 2) {
    setMaskQuestStage(2);
    return;
  }
  syncMaskQuestState(module);
}

function postLoad(module: TrueDustModule): void {
  const npcs = module.npcs ?? [];
  const rygar = npcs.find(n => n.id === 'rygar');
  const rygarTree = (typeof rygar?.tree === 'function'
    ? rygar.tree()
    : rygar?.tree ?? null) as DustlandDialogTree | Record<string, unknown> | null;
  if (rygarTree && (rygarTree as DustlandDialogTree).start) {
    const tree = rygarTree as DustlandDialogTree;
    tree.start.choices.unshift({
      label: 'Travel with us',
      join: { id: 'rygar', name: 'Rygar', role: 'Guard' },
      effects: [startPendant],
      to: 'joined'
    });
    tree.joined = {
      text: 'Rygar nods and falls in step.',
      choices: [ { label: '(Leave)', to: 'bye' } ]
    };
  }
  const dock = npcs.find(n => n.id === 'lakeside_dockhand');
  if (dock) {
    dock.processNode = function (node: string | undefined) {
      if (node === 'ask') {
        dialogState.node = party.some(m => m.id === 'rygar') ? 'with_rygar' : 'without_rygar';
      }
    };
  }
  const bandit = npcs.find(n => n.id === 'bandit_leader');
  if (bandit && bandit.combat) {
    bandit.combat.effects = [() => setFlag('bandits_cleared', 1)];
  }
  setupMaskQuest(module);
  const addQuestFn = (globalThis as typeof globalThis & { addQuest?: (...args: unknown[]) => void }).addQuest;
  module.quests?.forEach(q => {
    const quest = q as MaskQuest | undefined;
    if (!quest || quest.autoStart === false) return;
    addQuestFn?.(quest.id, quest.title ?? quest.name, quest.desc, quest);
  });
}

const dustlandGlobals = globalThis as typeof globalThis & { TRUE_DUST?: TrueDustModule };
dustlandGlobals.TRUE_DUST = TRUE_DUST;
dustlandGlobals.TRUE_DUST.postLoad = postLoad;
dustlandGlobals.TRUE_DUST.startRadio = startRadio;

globalThis.startGame = function () {
  applyModule(TRUE_DUST);
  TRUE_DUST.postLoad?.(TRUE_DUST);
  const s = TRUE_DUST.start;
  setMap(s.map, 'Stonegate');
  setPartyPos(s.x, s.y);
  startRadio();
};
