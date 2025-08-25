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
          text: 'Defeat the dummy and open the spoils cache it drops. The higher the challenge, the better the loot.',
          choices: [ { label: '(Got it)', to: 'bye' } ]
        }
      }
    },
    {
      id: 'training_dummy',
      map: 'demo_room',
      x: 5,
      y: Math.floor(ROOM_H / 2),
      color: '#f88',
      name: 'Training Dummy',
      desc: 'It just stands there, waiting to be whacked.',
      tree: {
        start: {
          text: 'A sturdy dummy built for testing spoils caches.',
          choices: [
            { label: '(Fight)', to: 'do_fight' },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      },
      combat: { HP: 1, ATK: 0, DEF: 0, challenge: 15 }
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

startGame = function () {
  applyModule(LOOTBOX_DEMO_MODULE);
  const s = LOOTBOX_DEMO_MODULE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Loot Box Demo');
  refreshUI();
};

