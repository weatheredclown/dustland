// @ts-nocheck
function seedWorldContent() {}

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

function postLoad(module){
  let sawDrop = false;
  Dustland.eventFlags.watch('spoils:opened', 'cache_opened');
  Dustland.eventBus.on('spoils:drop', () => { sawDrop = true; });
  Dustland.eventBus.on('combat:ended', ({ result }) => {
    if(result === 'loot'){
      incFlag('dummy_defeated');
      if(!sawDrop) Dustland.eventBus.emit('mentor:bark', { text:'Better luck next time', sound:'mentor' });
      sawDrop = false;
    }
  });
  Dustland.eventBus.on('spoils:opened', () => {
    Dustland.eventBus.emit('mentor:bark', { text:'Good job', sound:'mentor' });
  });

  // Map effect strings to real functions
  module.npcs?.forEach(n => {
    for (const key in n.tree){
      const node = n.tree[key];
      (node.choices || []).forEach(ch => {
        if (Array.isArray(ch.effects)){
          ch.effects = ch.effects.map(e => e === 'clear_cache'
            ? () => Dustland.eventFlags.clear('cache_opened')
            : e === 'inc_challenge'
              ? () => incFlag('dummy_challenge')
              : e);
        }
        if (ch.spawn && ch.spawn.challenge){
          if (ch.spawn.challenge.flag){
            ch.spawn.challenge = flagValue(ch.spawn.challenge.flag);
          } else if (ch.spawn.challenge.add){
            const [f, amt] = ch.spawn.challenge.add;
            ch.spawn.challenge = flagValue(f) + amt;
          }
        }
      });
    }
  });
}

globalThis.LOOTBOX_DEMO_MODULE = JSON.parse(DATA);
globalThis.LOOTBOX_DEMO_MODULE.postLoad = postLoad;

startGame = function(){
  LOOTBOX_DEMO_MODULE.postLoad?.(LOOTBOX_DEMO_MODULE);
  applyModule(LOOTBOX_DEMO_MODULE);
  setFlag('dummy_challenge', 5);
  const s = LOOTBOX_DEMO_MODULE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Loot Box Demo');
  const template = LOOTBOX_DEMO_MODULE.templates.find(t => t.id === 'training_dummy');
  const npc = makeNPC('training_dummy_1', 'demo_room', 5, Math.floor(6/2), template.color, template.name, '', template.desc, {}, null, null, null, { combat: { ...template.combat, HP: 5, challenge: 5 } });
  NPCS.push(npc);
};
