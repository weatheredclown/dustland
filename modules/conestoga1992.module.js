function seedWorldContent() {}

const CONESTOGA1992_MODULE = (() => {
  const ROOM_W = 12, ROOM_H = 8;
  const HALL_W = 12, HALL_H = 10;
  const midHallX = Math.floor(HALL_W / 2);
  const midHallY = Math.floor(HALL_H / 2);

  function makeRoom(id, doorSide) {
    const grid = Array.from({ length: ROOM_H }, (_, y) =>
      Array.from({ length: ROOM_W }, (_, x) => {
        const edge =
          y === 0 || y === ROOM_H - 1 || x === 0 || x === ROOM_W - 1;
        return edge ? TILE.WALL : TILE.FLOOR;
      })
    );
    const midY = Math.floor(ROOM_H / 2);
    const midX = Math.floor(ROOM_W / 2);
    let entryX = midX,
      entryY = midY;
    if (doorSide === 'east') {
      grid[midY][ROOM_W - 1] = TILE.DOOR;
      entryX = ROOM_W - 2;
    }
    if (doorSide === 'west') {
      grid[midY][0] = TILE.DOOR;
      entryX = 1;
    }
    if (doorSide === 'north') {
      grid[0][midX] = TILE.DOOR;
      entryY = 1;
    }
    if (doorSide === 'south') {
      grid[ROOM_H - 1][midX] = TILE.DOOR;
      entryY = ROOM_H - 2;
    }
    return { id, w: ROOM_W, h: ROOM_H, grid, entryX, entryY };
  }

  function makeHall() {
    const grid = Array.from({ length: HALL_H }, (_, y) =>
      Array.from({ length: HALL_W }, (_, x) => {
        const edge =
          y === 0 || y === HALL_H - 1 || x === 0 || x === HALL_W - 1;
        return edge ? TILE.WALL : TILE.FLOOR;
      })
    );
    grid[midHallY][0] = TILE.DOOR;
    grid[midHallY][HALL_W - 1] = TILE.DOOR;
    grid[0][midHallX] = TILE.DOOR;
    grid[HALL_H - 1][midHallX] = TILE.DOOR;
    return { id: 'hall', w: HALL_W, h: HALL_H, grid, entryX: midHallX, entryY: midHallY };
  }

  const hall = makeHall();
  const science = makeRoom('science', 'east');
  const cafeteria = makeRoom('cafeteria', 'west');
  const library = makeRoom('library', 'south');
  const computer = makeRoom('computer', 'north');

  const items = [
    { id: 'fruit_fly_sample', name: 'Fruit Fly Sample', type: 'quest' },
    { id: 'cafeteria_snack', name: 'Cafeteria Snack', type: 'quest' },
    { map: 'hall', x: 2, y: 2, id: 'guitar_pick', name: 'Guitar Pick', type: 'quest' },
    { map: 'hall', x: midHallX + 2, y: 2, id: 'lost_floppy', name: 'Lost Floppy', type: 'quest' },
    { map: 'hall', x: midHallX - 2, y: HALL_H - 3, id: 'overdue_book', name: 'Overdue Book', type: 'quest' },
    { id: 'circle_badge', name: 'Circle Badge', type: 'trinket', slot: 'trinket', mods: { ATK: 1 } },
    { id: 'gick_spear', name: "Gick's Spear", type: 'weapon', slot: 'weapon', mods: { ATK: 2 } },
    { id: 'history_scroll', name: 'History Scroll', type: 'trinket', slot: 'trinket', mods: { INT: 1 } }
  ];

  const quests = [
    {
      id: 'q_scope',
      title: 'Study Fruit Flies',
      desc: 'Examine the fruit flies under the electron microscope for Tim.',
      item: 'fruit_fly_sample',
      reward: { id: 'lab_goggles', name: 'Lab Goggles', type: 'trinket', slot: 'trinket', mods: { PER: 1 } },
      xp: 3
    },
    {
      id: 'q_pizza',
      title: 'Snack Run',
      desc: 'Fetch a snack for Dennis.',
      item: 'cafeteria_snack',
      reward: { id: 'signed_tray', name: 'Signed Tray', type: 'trinket', slot: 'trinket', mods: { DEF: 1 } },
      xp: 2
    },
    {
      id: 'q_pick',
      title: 'Find the Pick',
      desc: "Find Matt's guitar pick in the hall.",
      item: 'guitar_pick',
      reward: { id: 'bass_clef_pin', name: 'Bass Clef Pin', type: 'trinket', slot: 'trinket', mods: { CHA: 1 } },
      xp: 2
    },
    {
      id: 'q_floppy',
      title: 'Recover the Floppy',
      desc: 'Bring Charlie the lost floppy disk.',
      item: 'lost_floppy',
      reward: { id: 'debugger_disk', name: 'Debugger Disk', type: 'trinket', slot: 'trinket', mods: { INT: 1 } },
      xp: 3
    },
    {
      id: 'q_book',
      title: 'Return the Book',
      desc: 'Bring Tim Laubach his overdue book.',
      item: 'overdue_book',
      reward: { id: 'library_pass', name: 'Library Pass', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } },
      xp: 3
    }
  ];

  const npcs = [
    {
      id: 'tim_breslin',
      map: 'science',
      x: 3,
      y: 3,
      color: '#a9f59f',
      name: 'Tim Breslin',
      title: 'Lab Partner',
      desc: 'Hanging at the microscope.',
      questId: 'q_scope',
      tree: {
        start: {
          text: 'Check the electron microscope?',
          choices: [
            { label: '(Accept)', to: 'accept', q: 'accept' },
            { label: '(I have the sample)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'Grab a sample from the scope.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        do_turnin: {
          text: 'Tim hands you lab goggles.',
          choices: [ { label: '(Thanks)', to: 'bye', reward: 'lab_goggles' } ]
        }
      }
    },
    {
      id: 'scope',
      map: 'science',
      x: 8,
      y: 3,
      color: '#9ef7a0',
      name: 'Electron Microscope',
      desc: 'Fruit flies squirm under the lens.',
      tree: {
        start: {
          text: 'A slide waits for inspection.',
          choices: [
            { label: '(Take sample)', to: 'empty', reward: 'fruit_fly_sample', once: true },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        empty: { text: 'The slide is empty now.', choices: [ { label: '(Leave)', to: 'bye' } ] }
      }
    },
    {
      id: 'dennis',
      map: 'cafeteria',
      x: 4,
      y: 3,
      color: '#a9f59f',
      name: 'Dennis Fleming',
      title: 'Friend',
      desc: 'Chilling with Matt.',
      questId: 'q_pizza',
      tree: {
        start: {
          text: 'Got any snacks?',
          choices: [
            { label: '(Accept)', to: 'accept', q: 'accept' },
            { label: '(Give snack)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'Check the vending machine.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        do_turnin: {
          text: 'Dennis signs a tray for you.',
          choices: [ { label: '(Take tray)', to: 'bye', reward: 'signed_tray' } ]
        }
      }
    },
    {
      id: 'matt',
      map: 'cafeteria',
      x: 5,
      y: 3,
      color: '#a9f59f',
      name: 'Matt Eagleson',
      title: 'Friend',
      desc: 'Tapping beats on the table.',
      questId: 'q_pick',
      tree: {
        start: {
          text: 'Seen my guitar pick?',
          choices: [
            { label: '(Accept)', to: 'accept', q: 'accept' },
            { label: '(Give pick)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'Maybe lost in the hall.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        do_turnin: {
          text: 'Matt pins a badge on you.',
          choices: [ { label: '(Take pin)', to: 'bye', reward: 'bass_clef_pin' } ]
        }
      }
    },
    {
      id: 'vending',
      map: 'cafeteria',
      x: 2,
      y: 5,
      color: '#a9f59f',
      name: 'Vending Machine',
      desc: 'Whirs softly.',
      tree: {
        start: {
          text: 'A snack drops if you press the button.',
          choices: [
            { label: '(Take snack)', to: 'empty', reward: 'cafeteria_snack', once: true },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        empty: { text: 'It is empty.', choices: [ { label: '(Leave)', to: 'bye' } ] }
      }
    },
    {
      id: 'charlie',
      map: 'computer',
      x: 4,
      y: 3,
      color: '#a9f59f',
      name: 'Charlie Ross',
      title: 'Coder',
      desc: 'Fixing an ancient PC.',
      questId: 'q_floppy',
      tree: {
        start: {
          text: 'Did you find my floppy?',
          choices: [
            { label: '(Accept)', to: 'accept', q: 'accept' },
            { label: '(Give floppy)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'Might be in the hall.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        do_turnin: {
          text: 'Charlie hands you a debugger disk.',
          choices: [ { label: '(Take disk)', to: 'bye', reward: 'debugger_disk' } ]
        }
      }
    },
    {
      id: 'tim_laubach',
      map: 'library',
      x: 4,
      y: 3,
      color: '#a9f59f',
      name: 'Tim Laubach',
      title: 'Reader',
      desc: 'Surrounded by books.',
      questId: 'q_book',
      tree: {
        start: {
          text: 'Can you return my overdue book?',
          choices: [
            { label: '(Accept)', to: 'accept', q: 'accept' },
            { label: '(Give book)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'I left it in the hall.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        do_turnin: {
          text: 'Tim hands you a library pass.',
          choices: [ { label: '(Take pass)', to: 'bye', reward: 'library_pass' } ]
        }
      }
    },
    {
      id: 'mr_mann',
      map: 'hall',
      x: 3,
      y: 1,
      color: '#f88',
      name: 'Mr Mann',
      title: 'Circle Guy',
      desc: 'Chemistry teacher drawing circles.',
      combat: { HP: 6, ATK: 2, DEF: 1, loot: 'circle_badge', auto: true },
      tree: {
        start: {
          text: 'He challenges you with chalk.',
          choices: [ { label: '(Fight)', to: 'do_fight' }, { label: '(Leave)', to: 'bye' } ]
        }
      }
    },
    {
      id: 'gick',
      map: 'hall',
      x: 8,
      y: 8,
      color: '#f88',
      name: 'Mr Gickings',
      title: 'Coach',
      desc: 'Looks ready to duel.',
      combat: { HP: 8, ATK: 3, DEF: 1, loot: 'gick_spear', auto: true },
      tree: {
        start: {
          text: 'Gick blocks the hallway.',
          choices: [ { label: '(Fight)', to: 'do_fight' }, { label: '(Leave)', to: 'bye' } ]
        }
      }
    },
    {
      id: 'rich',
      map: 'hall',
      x: 9,
      y: 1,
      color: '#f88',
      name: 'Rich',
      title: 'History Teacher',
      desc: 'Wields a hefty textbook.',
      combat: { HP: 7, ATK: 2, DEF: 1, loot: 'history_scroll', auto: true },
      tree: {
        start: {
          text: 'History exam time.',
          choices: [ { label: '(Fight)', to: 'do_fight' }, { label: '(Leave)', to: 'bye' } ]
        }
      }
    }
  ];

  const portals = [
    { map: 'hall', x: 0, y: midHallY, toMap: 'science', toX: science.entryX, toY: science.entryY },
    { map: 'science', x: science.w - 1, y: science.entryY, toMap: 'hall', toX: 1, toY: midHallY },
    { map: 'hall', x: HALL_W - 1, y: midHallY, toMap: 'cafeteria', toX: cafeteria.entryX, toY: cafeteria.entryY },
    { map: 'cafeteria', x: 0, y: cafeteria.entryY, toMap: 'hall', toX: HALL_W - 2, toY: midHallY },
    { map: 'hall', x: midHallX, y: 0, toMap: 'library', toX: library.entryX, toY: library.entryY },
    { map: 'library', x: library.entryX, y: library.h - 1, toMap: 'hall', toX: midHallX, toY: 1 },
    { map: 'hall', x: midHallX, y: HALL_H - 1, toMap: 'computer', toX: computer.entryX, toY: computer.entryY },
    { map: 'computer', x: computer.entryX, y: 0, toMap: 'hall', toX: midHallX, toY: HALL_H - 2 }
  ];

  return {
    seed: Date.now(),
    start: { map: 'hall', x: hall.entryX, y: hall.entryY },
    items,
    quests,
    npcs,
    interiors: [hall, science, cafeteria, library, computer],
    buildings: [],
    portals
  };
})();

const _startGame = startGame;
startGame = function () {
  startWorld();
  applyModule(CONESTOGA1992_MODULE);
  const s = CONESTOGA1992_MODULE.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Conestoga 1992');
  renderInv();
  renderQuests();
  renderParty();
  updateHUD();
};

