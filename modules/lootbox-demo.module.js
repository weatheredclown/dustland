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

  let dummyChallenge = 5;
  function spawnDummy(){
    const npc = makeNPC(
      'training_dummy',
      'demo_room',
      5,
      Math.floor(ROOM_H / 2),
      '#f88',
      'Training Dummy',
      '',
      {
        start:{
          text:'A sturdy dummy built for testing spoils caches.',
          choices:[
            { label:'(Fight)', to:'do_fight' },
            { label:'(Leave)', to:'bye' }
          ]
        }
      },
      null,
      null,
      null,
      { combat:{ HP: dummyChallenge, ATK:0, DEF:0, challenge: dummyChallenge } }
    );
    NPCS.push(npc);
    refreshUI?.();
  }

  let sawDrop = false;
  watchEventFlag?.('spoils:opened', 'cache_opened');
  EventBus.on('spoils:drop', () => { sawDrop = true; });
  EventBus.on('combat:ended', ({ result }) => {
    if(result === 'loot'){
      incFlag('dummy_defeated');
      if(!sawDrop) EventBus.emit('mentor:bark', { text:'Better luck next time', sound:'mentor' });
      sawDrop = false;
    }
  });
  EventBus.on('spoils:opened', () => {
    EventBus.emit('mentor:bark', { text:'Good job', sound:'mentor' });
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
        start: { text: '', choices: [] },
        spawn_same: { text: 'Another dummy ready.', choices:[{ label:'(Back)', to:'start' }] },
        spawn_tough: { text: 'Tougher dummy coming up.', choices:[{ label:'(Back)', to:'start' }] }
      },
      processNode(node){
        if(node === 'start'){
          const opened = flagValue('cache_opened') >= 1;
          const fought = flagValue('dummy_defeated') >= 1;
          if(opened){
            this.tree.start.text = 'Nice work. Want another dummy?';
          } else if(fought){
            this.tree.start.text = 'No cache yet? Want to try again?';
          } else {
            this.tree.start.text = 'Defeat the dummy and open the spoils cache it drops. The higher the challenge, the better the loot.';
          }
          const choices = [];
          if(fought){
            choices.push({ label:'(Same dummy)', to:'spawn_same' });
            choices.push({ label:'(Tougher dummy)', to:'spawn_tough' });
          }
          choices.push({ label:'(Leave)', to:'bye' });
          this.tree.start.choices = choices;
        }
      },
      processChoice(c){
        if(c.to === 'spawn_same'){
          spawnDummy();
          clearFlag('cache_opened');
        } else if(c.to === 'spawn_tough'){
          dummyChallenge++;
          spawnDummy();
          clearFlag('cache_opened');
        }
      }
    }
  ];

  return {
    seed: Date.now(),
    start: { map: 'demo_room', x: demoRoom.entryX, y: demoRoom.entryY },
    npcs,
    items: [],
    quests: [],
    interiors: [demoRoom],
    buildings: []
  };
})();

startGame = function(){
  applyModule(LOOTBOX_DEMO_MODULE);
  const s = LOOTBOX_DEMO_MODULE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Loot Box Demo');
  spawnDummy();
  refreshUI();
};
