function seedWorldContent() {}

const ECHOES_MODULE = (() => {
  const ROOM_W = 16, ROOM_H = 8;
  function makeRoom(id, doorSide) {
    const grid = Array.from({ length: ROOM_H }, (_, y) =>
      Array.from({ length: ROOM_W }, (_, x) => {
        const edge = y === 0 || y === ROOM_H - 1 || x === 0 || x === ROOM_W - 1;
        return edge ? TILE.WALL : TILE.FLOOR;
      })
    );
    if (doorSide === 'east') grid[Math.floor(ROOM_H / 2)][ROOM_W - 1] = TILE.DOOR;
    if (doorSide === 'west') grid[Math.floor(ROOM_H / 2)][0] = TILE.DOOR;
    return { id, w: ROOM_W, h: ROOM_H, grid, entryX: 1, entryY: Math.floor(ROOM_H / 2) };
  }

  const atrium = makeRoom('atrium', 'east');
  const workshop = makeRoom('workshop', 'east');
  const archive = makeRoom('archive', 'east');

  const items = [
    { map: 'atrium', x: 3, y: 2, id: 'spark_key', name: 'Spark Key', type: 'quest', tags: ['key'] },
    { map: 'workshop', x: 4, y: 5, id: 'cog_key', name: 'Cog Key', type: 'quest', tags: ['key'] },
    { map: 'archive', x: 8, y: 4, id: 'sun_charm', name: 'Sun Charm', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } }
  ];

  const quests = [
    { id: 'q_spark', title: 'Spark the Way', desc: 'Find the Spark Key to open the workshop.' },
    { id: 'q_cog', title: 'Unlock the Archive', desc: 'Find the Cog Key to reach the beacon.' },
    { id: 'q_beacon', title: 'Light the Beacon', desc: 'Defeat the Gear Ghoul and claim hope.' }
  ];

  const npcs = [
    {
      id: 'sparkcrate',
      map: 'atrium',
      x: 3,
      y: 2,
      color: '#9ef7a0',
      name: 'Sparking Crate',
      desc: 'Faint humming echoes from inside.',
      tree: {
        start: {
          text: 'A crate vibrates with energy.',
          choices: [
            { label: '(Open)', to: 'open', once: true },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        open: { text: 'Inside you find a Spark Key.', choices: [ { label: '(Take Key)', to: 'empty', reward: 'spark_key' } ] },
        empty: { text: 'An empty crate.', choices: [ { label: '(Leave)', to: 'bye' } ] }
      }
    },
    {
      id: 'door_workshop',
      map: 'atrium',
      x: ROOM_W - 2,
      y: atrium.entryY,
      color: '#a9f59f',
      name: 'Humming Door',
      title: 'To Workshop',
      desc: 'Its lock crackles for a Spark Key.',
      questId: 'q_spark',
      tree: {
        start: {
          text: 'The door is sealed.',
          choices: [
            { label: '(Use Spark Key)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        do_turnin: { text: 'The door slides aside.', choices: [ { label: '(Continue)', to: 'bye', goto: { map: 'workshop', x: 1, y: workshop.entryY } } ] }
      }
    },
    {
      id: 'cogcrate',
      map: 'workshop',
      x: 4,
      y: 5,
      color: '#9ef7a0',
      name: 'Gear Crate',
      desc: 'Loose gears rattle within.',
      tree: {
        start: {
          text: 'The crate is heavy with metal.',
          choices: [
            { label: '(Open)', to: 'open', once: true },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        open: { text: 'Among the gears is a Cog Key.', choices: [ { label: '(Take Key)', to: 'empty', reward: 'cog_key' } ] },
        empty: { text: 'Only scraps remain.', choices: [ { label: '(Leave)', to: 'bye' } ] }
      }
    },
    {
      id: 'door_archive',
      map: 'workshop',
      x: ROOM_W - 2,
      y: workshop.entryY,
      color: '#a9f59f',
      name: 'Rust Door',
      title: 'To Archive',
      desc: 'Its hinges await a Cog Key.',
      questId: 'q_cog',
      tree: {
        start: {
          text: 'The door is locked tight.',
          choices: [
            { label: '(Use Cog Key)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        do_turnin: { text: 'The door creaks open.', choices: [ { label: '(Continue)', to: 'bye', goto: { map: 'archive', x: 1, y: archive.entryY } } ] }
      }
    },
    {
      id: 'rat',
      map: 'atrium',
      x: 7,
      y: atrium.entryY,
      color: '#f88',
      name: 'Dust Rat',
      title: 'Menace',
      desc: 'A rat swollen with dust.',
      tree: { start: { text: 'The rat bares its teeth.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      combat: { HP: 5, ATK: 2, DEF: 1, loot: { name: 'Rat Tail' } }
    },
    {
      id: 'ghoul',
      map: 'archive',
      x: 7,
      y: archive.entryY,
      color: '#f88',
      name: 'Gear Ghoul',
      title: 'Guardian',
      desc: 'A whirring husk hungry for scraps.',
      questId: 'q_beacon',
      tree: { start: { text: 'The ghoul clanks forward.', choices: [ { label: '(Fight)', to: 'do_fight', q: 'turnin' }, { label: '(Leave)', to: 'bye' } ] } },
      combat: { HP: 8, ATK: 3, DEF: 2, loot: { name: 'Copper Cog' } }
    },
    {
      id: 'beacon',
      map: 'archive',
      x: ROOM_W - 3,
      y: archive.entryY,
      color: '#b8ffb6',
      name: 'Hope Beacon',
      title: 'Lightbringer',
      desc: 'A small lamp pulsing warmly.',
      tree: {
        start: {
          text: 'The beacon glows, promising brighter days.',
          choices: [
            { label: '(Take Sun Charm)', to: 'reward', reward: 'sun_charm' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        reward: {
          text: 'You pocket the charm. The light feels hopeful.',
          choices: [ { label: '(Step outside)', to: 'bye', goto: { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) } } ]
        }
      }
    }
  ];

  return {
    seed: Date.now(),
    start: { map: 'atrium', x: atrium.entryX, y: atrium.entryY },
    items,
    quests,
    npcs,
    interiors: [atrium, workshop, archive],
    buildings: []
  };
})();

const _startGame = startGame;
startGame = function () {
  startWorld();
  applyModule(ECHOES_MODULE);
  const s = ECHOES_MODULE.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setPlayerPos(s.x, s.y);
  setMap(s.map, s.map === 'world' ? 'Wastes' : 'Echoes');
  renderInv();
  renderQuests();
  renderParty();
  updateHUD();
};
