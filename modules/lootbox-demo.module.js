function seedWorldContent() {}

const LOOTBOX_DEMO_MODULE = (() => {
  const ROOM_W = 10, ROOM_H = 6;
  const grid = Array.from({ length: ROOM_H }, (_, y) =>
    Array.from({ length: ROOM_W }, (_, x) => {
      const edge = y === 0 || y === ROOM_H - 1 || x === 0 || x === ROOM_W - 1;
      return edge ? TILE.WALL : TILE.FLOOR;
    })
  );
  const demoRoom = { id: 'demo_room', w: ROOM_W, h: ROOM_H, grid, entryX: 1, entryY: Math.floor(ROOM_H / 2) };

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

  const npcs = [
    {
      id: 'cache_guide',
      map: 'demo_room',
      x: 2,
      y: 2,
      color: '#a9f59f',
      name: 'Cache Guide',
      desc: 'An eager scavenger itching to teach you about spoils caches.',
      tree: {
        start: {
          jump: [
            { if: { flag: 'cache_opened', op: '>=', value: 1 }, to: 'opened' },
            { if: { flag: 'dummy_defeated', op: '>=', value: 1 }, to: 'fought' },
            { to: 'intro' }
          ]
        },
        opened: {
          text: 'Nice work. Want another dummy?',
          choices: [
            { label: '(Same dummy)', to: 'spawn_same', effects: [() => Dustland.eventFlags.clear('cache_opened')], spawn: { templateId: 'training_dummy', x: 5, y: Math.floor(ROOM_H / 2), challenge: flagValue('dummy_challenge') } },
            { label: '(Tougher dummy)', to: 'spawn_tough', effects: [() => incFlag('dummy_challenge'), () => Dustland.eventFlags.clear('cache_opened')], spawn: { templateId: 'training_dummy', x: 5, y: Math.floor(ROOM_H / 2), challenge: flagValue('dummy_challenge') + 1 } },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        fought: {
          text: 'No cache yet? Want to try again?',
          choices: [
            { label: '(Same dummy)', to: 'spawn_same', effects: [() => Dustland.eventFlags.clear('cache_opened')], spawn: { templateId: 'training_dummy', x: 5, y: Math.floor(ROOM_H / 2), challenge: flagValue('dummy_challenge') } },
            { label: '(Tougher dummy)', to: 'spawn_tough', effects: [() => incFlag('dummy_challenge'), () => Dustland.eventFlags.clear('cache_opened')], spawn: { templateId: 'training_dummy', x: 5, y: Math.floor(ROOM_H / 2), challenge: flagValue('dummy_challenge') + 1 } },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        intro: {
          text: 'Defeat the dummy and open the spoils cache it drops. The higher the challenge, the better the loot.',
          choices: [ { label: '(Leave)', to: 'bye' } ]
        },
        spawn_same: { text: 'Another dummy ready.', choices: [ { label: '(Back)', to: 'start' } ] },
        spawn_tough: { text: 'Tougher dummy coming up.', choices: [ { label: '(Back)', to: 'start' } ] }
      }
    }
  ];

  const templates = [
    {
      id: 'training_dummy',
      name: 'Training Dummy',
      desc: 'A sturdy dummy built for testing spoils caches.',
      color: '#f88',
      combat: { ATK: 0, DEF: 0 }
    }
  ];

  return {
    seed: Date.now(),
    start: { map: 'demo_room', x: demoRoom.entryX, y: demoRoom.entryY },
    npcs,
    items: [],
    quests: [],
    interiors: [demoRoom],
    buildings: [],
    templates,
    ROOM_W: ROOM_W,
    ROOM_H: ROOM_H
  };
})();

startGame = function(){
  applyModule(LOOTBOX_DEMO_MODULE);
  setFlag('dummy_challenge', 5);
  const s = LOOTBOX_DEMO_MODULE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Loot Box Demo');
  const template = LOOTBOX_DEMO_MODULE.templates.find(t => t.id === 'training_dummy');
  const npc = makeNPC('training_dummy_1', 'demo_room', 5, Math.floor(LOOTBOX_DEMO_MODULE.ROOM_H/2), template.color, template.name, '', template.desc, {}, null, null, null, { combat: { ...template.combat, HP: 5, challenge: 5 } });
  NPCS.push(npc);
  refreshUI();
};
