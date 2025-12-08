// @ts-nocheck
globalThis.seedWorldContent = globalThis.seedWorldContent ?? (() => { });
(() => {
    const DATA = `
{
  "seed": "lootbox-demo",
  "start": { "map": "demo_room", "x": 1, "y": 3 },
  "npcs": [
    {
      "id": "cache_guide",
      "map": "demo_room",
      "x": 2,
      "y": 2,
      "color": "#a9f59f",
      "name": "Cache Guide",
      "desc": "An eager scavenger itching to teach you about spoils caches.",
      "prompt": "Eager scavenger waving toward a loot cache",
      "tree": {
        "start": {
          "jump": [
            { "if": { "flag": "cache_opened", "op": ">=", "value": 1 }, "to": "opened" },
            { "if": { "flag": "dummy_defeated", "op": ">=", "value": 1 }, "to": "fought" },
            { "to": "intro" }
          ]
        },
        "opened": {
          "text": "Nice work. Want another dummy?",
          "choices": [
            { "label": "(Same dummy)", "to": "spawn_same", "effects": ["clear_cache"], "spawn": { "templateId": "training_dummy", "x": 5, "y": 3, "challenge": { "flag": "dummy_challenge" } } },
            { "label": "(Tougher dummy)", "to": "spawn_tough", "effects": ["inc_challenge", "clear_cache"], "spawn": { "templateId": "training_dummy", "x": 5, "y": 3, "challenge": { "add": ["dummy_challenge", 1] } } },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "fought": {
          "text": "No cache yet? Want to try again?",
          "choices": [
            { "label": "(Same dummy)", "to": "spawn_same", "effects": ["clear_cache"], "spawn": { "templateId": "training_dummy", "x": 5, "y": 3, "challenge": { "flag": "dummy_challenge" } } },
            { "label": "(Tougher dummy)", "to": "spawn_tough", "effects": ["inc_challenge", "clear_cache"], "spawn": { "templateId": "training_dummy", "x": 5, "y": 3, "challenge": { "add": ["dummy_challenge", 1] } } },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "intro": {
          "text": "Defeat the dummy and open the spoils cache it drops. The higher the challenge, the better the loot.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        },
        "spawn_same": { "text": "Another dummy ready.", "choices": [ { "label": "(Back)", "to": "start" } ] },
        "spawn_tough": { "text": "Tougher dummy coming up.", "choices": [ { "label": "(Back)", "to": "start" } ] }
      }
    }
  ],
  "items": [],
  "quests": [],
  "interiors": [
    {
      "id": "demo_room",
      "w": 10,
      "h": 6,
      "grid": [
        [6,6,6,6,6,6,6,6,6,6],
        [6,7,7,7,7,7,7,7,7,6],
        [6,7,7,7,7,7,7,7,7,6],
        [6,7,7,7,7,7,7,7,7,6],
        [6,7,7,7,7,7,7,7,7,6],
        [6,6,6,6,6,6,6,6,6,6]
      ],
      "entryX": 1,
      "entryY": 3
    }
  ],
  "buildings": [],
  "templates": [
    {
      "id": "training_dummy",
      "name": "Training Dummy",
      "desc": "A sturdy dummy built for testing spoils caches.",
      "color": "#f88",
      "combat": { "ATK": 0, "DEF": 0 }
    }
  ]
}`;
    function postLoad(moduleData) {
        let sawDrop = false;
        Dustland.eventFlags?.watch?.('spoils:opened', 'cache_opened');
        Dustland.eventBus?.on?.('spoils:drop', () => {
            sawDrop = true;
        });
        Dustland.eventBus?.on?.('combat:ended', (payload) => {
            if (payload?.result === 'loot') {
                incFlag('dummy_defeated');
                if (!sawDrop) {
                    Dustland.eventBus?.emit?.('mentor:bark', { text: 'Better luck next time', sound: 'mentor' });
                }
                sawDrop = false;
            }
        });
        Dustland.eventBus?.on?.('spoils:opened', () => {
            Dustland.eventBus?.emit?.('mentor:bark', { text: 'Good job', sound: 'mentor' });
        });
        // Map effect strings to real functions
        moduleData.npcs?.forEach(npc => {
            if (!npc?.tree)
                return;
            for (const key of Object.keys(npc.tree)) {
                const node = npc.tree[key];
                if (!node?.choices)
                    continue;
                node.choices = node.choices.map(choice => {
                    if (!choice)
                        return choice;
                    if (Array.isArray(choice.effects)) {
                        choice.effects = choice.effects.map(effect => effect === 'clear_cache'
                            ? () => Dustland.eventFlags?.clear?.('cache_opened')
                            : effect === 'inc_challenge'
                                ? () => incFlag('dummy_challenge')
                                : effect);
                    }
                    const spawn = choice.spawn;
                    if (spawn && typeof spawn.challenge === 'object' && spawn.challenge) {
                        const challenge = spawn.challenge;
                        if (challenge.flag) {
                            spawn.challenge = flagValue(challenge.flag);
                        }
                        else if (Array.isArray(challenge.add)) {
                            const [flag, amt] = challenge.add;
                            if (typeof flag === 'string' && typeof amt === 'number') {
                                spawn.challenge = flagValue(flag) + amt;
                            }
                        }
                    }
                    return choice;
                });
            }
        });
    }
    const lootboxModuleData = JSON.parse(DATA);
    globalThis.LOOTBOX_DEMO_MODULE = lootboxModuleData;
    lootboxModuleData.postLoad = postLoad;
    globalThis.startGame = function startGame() {
        const moduleData = globalThis.LOOTBOX_DEMO_MODULE;
        if (!moduleData)
            return;
        moduleData.postLoad?.(moduleData);
        applyModule(moduleData);
        setFlag('dummy_challenge', 5);
        const start = moduleData.start;
        setPartyPos(start.x, start.y);
        setMap(start.map, 'Loot Box Demo');
        const template = moduleData.templates.find(t => t.id === 'training_dummy');
        if (!template) {
            throw new Error('training_dummy template missing');
        }
        const npc = makeNPC('training_dummy_1', 'demo_room', 5, Math.floor(6 / 2), template.color, template.name, '', template.desc, {}, null, null, null, { combat: { ...template.combat, HP: 5, challenge: 5 } });
        const npcList = globalThis.NPCS;
        if (!npcList) {
            throw new Error('NPCS is not initialized');
        }
        npcList.push(npc);
    };
})();
