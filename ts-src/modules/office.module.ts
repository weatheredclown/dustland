// @ts-nocheck
type OfficeModule = DustlandModuleInstance & {
  worldGen?: (seed?: number) => { castleId?: string } | null;
};

type ApplyModuleResult = DustlandModuleInstance & { castleId?: string };

declare global {
  interface GlobalThis {
    OFFICE_MODULE?: OfficeModule;
  }
}

declare const applyModule: (moduleData: DustlandModuleInstance) => ApplyModuleResult;
declare const registerItem: <T>(item: T) => T;
declare const setTile: (map: string, x: number, y: number, tile: number) => void;
declare const setPartyPos: (x: number, y: number) => void;
declare const setMap: (map: string, label?: string) => void;
declare const log: (message: string, type?: string) => void;
declare const rand: (max: number) => number;
declare const setRNGSeed: (seed: number) => void;
declare const placeHut: (
  x: number,
  y: number,
  options?: DustlandBuilding
) => DustlandBuilding | null;
declare const uncurseItem: (itemId: string) => void;
declare const hasItem: (id: string) => boolean;
declare const flagValue: (flag: string) => number;

declare const WORLD_W: number;
declare const WORLD_H: number;
declare const TILE: DustlandTileset;
declare let world: number[][];
declare let interiors: Record<string, DustlandMap>;
declare let buildings: DustlandBuilding[];
declare const creatorMap: DustlandMap;
declare const DC: Record<string, number>;
declare const itemDrops: DustlandItemDrop[];
declare const player: PlayerState;

const seedWorldContent = (): void => {};
globalThis.seedWorldContent = seedWorldContent;

const OFFICE_IMPL: OfficeModule = (() => {
  const tileSet = TILE;
  const tileWall = tileSet.WALL ?? 0;
  const tileFloor = tileSet.FLOOR ?? 0;
  const tileDoor = tileSet.DOOR ?? 0;
  const tileRoad = tileSet.ROAD ?? 0;
  const tileWater = tileSet.WATER ?? 0;
  const tileRock = tileSet.ROCK ?? 0;
  const tileSand = tileSet.SAND ?? 0;
  const tileBrush = tileSet.BRUSH ?? 0;

  const worldWidth = WORLD_W;
  const worldHeight = WORLD_H;
  const dcTalk = DC.TALK ?? 0;

  interiors ||= {} as Record<string, DustlandMap>;
  buildings ||= [] as DustlandBuilding[];
  const creatorMapData = creatorMap;

  const FLOOR_W = 20,
    // Expanded height to make room for an exterior elevator area
    FLOOR_H = 24;
  const midX = Math.floor(FLOOR_W / 2);

  const portraits = {
    security: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZmZiNmI2Ii8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5TPC90ZXh0Pjwvc3ZnPg==',
    worker: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjYjhmZmI2Ii8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5XPC90ZXh0Pjwvc3ZnPg==',
    friendJ: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjY2FmZmM2Ii8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5KPC90ZXh0Pjwvc3ZnPg==',
    friendL: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjY2FmZmM2Ii8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5MPC90ZXh0Pjwvc3ZnPg==',
    toll: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjYTlmNTlmIi8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5UPC90ZXh0Pjwvc3ZnPg==',
    fae: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjY2FmZmM2Ii8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5GPC90ZXh0Pjwvc3ZnPg==',
    rat: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZmZiNmI2Ii8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5SPC90ZXh0Pjwvc3ZnPg==',
    bandit: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjg4Ii8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5CPC90ZXh0Pjwvc3ZnPg==',
    ogre: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjU1Ii8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5PPC90ZXh0Pjwvc3ZnPg==',
    vending: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjYTlmNTlmIi8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5WPC90ZXh0Pjwvc3ZnPg==',
    janitor: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjg4Ii8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5KPC90ZXh0Pjwvc3ZnPg==',
    elevator: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjYTlmNTlmIi8+PHRleHQgeD0iMTYiIHk9IjIxIiBmb250LXNpemU9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5FPC90ZXh0Pjwvc3ZnPg=='
  };

  const WORLD_MID = Math.floor(worldWidth / 2),
    WORLD_MIDY = Math.floor(worldHeight / 2);

  function liftHelmetCurse(): void {
    uncurseItem('cursed_vr_helmet');
  }

  function genForestWorld(seed = Date.now()): { castleId?: string } {
    setRNGSeed(seed);
    world = Array.from({ length: worldHeight }, () =>
      Array.from({ length: worldWidth }, (_, x) => {
        if (x === WORLD_MID) return tileWater;
        // Add variety so the forest isn't a featureless expanse
        const roll = rand(100);
        if (roll < 10) return tileRock;
        if (roll < 30) return tileSand;
        return tileBrush;
      })
    );
    setTile('world', WORLD_MID, WORLD_MIDY, tileRoad);
    Object.keys(interiors).forEach((key) => delete interiors[key]);
    if (creatorMapData.grid && creatorMapData.grid.length) interiors['creator'] = creatorMapData;
    buildings.length = 0;
    const hut = placeHut(WORLD_MID + 3, WORLD_MIDY - 2, {
      interiorId: 'castle',
      boarded: true
    });
    return { castleId: hut?.interiorId };
  }

  function baseGrid() {
    return Array.from({ length: FLOOR_H }, (_, y) =>
      Array.from({ length: FLOOR_W }, (_, x) =>
        y === 0 ||
        y === FLOOR_H - 1 ||
        x === 0 ||
        x === FLOOR_W - 1 ||
        y === 4
          ? tileWall
          : tileFloor
      )
    );
  }

  function addElevator(grid) {
    // Wider elevator placed outside the main office rectangle
    for (let y = 1; y <= 4; y++) {
      grid[y][midX - 2] = tileWall;
      grid[y][midX + 2] = tileWall;
    }
    for (let y = 1; y < 4; y++) {
      grid[y][midX - 1] = tileFloor;
      grid[y][midX] = tileFloor; // NPC spot and elevator floor
      grid[y][midX + 1] = tileFloor;
    }
    grid[4][midX - 1] = tileDoor;
    grid[4][midX] = tileDoor;
    grid[4][midX + 1] = tileDoor;
  }

  function makeFloor1() {
    const grid = baseGrid();
    addElevator(grid);
    // four pillars
    [6, FLOOR_W - 7].forEach((x) =>
      [10, FLOOR_H - 7].forEach((y) => (grid[y][x] = tileWall))
    );
    // front desk
    for (let x = 3; x < FLOOR_W - 3; x++) {
      if (x !== midX) grid[FLOOR_H - 5][x] = tileWall;
    }
    return { id: 'floor1', label: 'Lobby', w: FLOOR_W, h: FLOOR_H, grid, entryX: midX, entryY: 2 };
  }

  function makeFloor2() {
    const grid = baseGrid();
    addElevator(grid);
    // cubicle walls
    [4, 8, 12, 16].forEach((x, i) => {
      for (let y = 8; y < FLOOR_H - 4; y++) {
        if (y === (i % 2 === 0 ? 14 : 18)) continue; // door gaps
        grid[y][x] = tileWall;
      }
    });
    return { id: 'floor2', label: 'Workspace', w: FLOOR_W, h: FLOOR_H, grid, entryX: midX, entryY: 2 };
  }

  function makeFloor3() {
    const grid = baseGrid();
    addElevator(grid);
    // central conference room
    for (let y = 9; y <= FLOOR_H - 6; y++) {
      for (let x = 5; x <= FLOOR_W - 6; x++) {
        const edge =
          y === 9 || y === FLOOR_H - 6 || x === 5 || x === FLOOR_W - 6;
        if (edge) grid[y][x] = tileWall;
      }
    }
    grid[FLOOR_H - 6][midX] = tileDoor;
    return { id: 'floor3', label: 'Executive Suite', w: FLOOR_W, h: FLOOR_H, grid, entryX: midX, entryY: 2 };
  }

  function makeCastle() {
    const W = 30,
      H = 30;
    const grid = Array.from({ length: H }, () =>
      Array.from({ length: W }, () => tileWall)
    );
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    function carve(x, y) {
      grid[y][x] = tileFloor;
      shuffle(
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ]
      ).forEach(([dx, dy]) => {
        const nx = x + dx * 2,
          ny = y + dy * 2;
        if (
          nx > 0 &&
          ny > 0 &&
          nx < W - 1 &&
          ny < H - 1 &&
          grid[ny][nx] === tileWall
        ) {
          grid[y + dy][x + dx] = tileFloor;
          carve(nx, ny);
        }
      });
    }
    carve(1, 1);
    grid[1][1] = tileDoor;
    return { id: 'castle', label: 'Castle', w: W, h: H, grid, entryX: 1, entryY: 1 };
  }

  const floor1 = makeFloor1();
  const floor2 = makeFloor2();
  const floor3 = makeFloor3();
  const castle = makeCastle();

  const elevatorNPCs = ['floor1', 'floor2', 'floor3'].map((map) => ({
    id: `elevator_${map}`,
    map,
    x: midX,
    // Centered inside the larger elevator
    y: 1,
    symbol: '?',
    color: '#225a20',
    name: 'Elevator Buttons',
    desc: 'A panel to select floors.',
    portraitSheet: portraits.elevator,
    tree: {
      start: {
        text: 'Select floor:',
        choices: [
          { label: 'Lobby', to: 'bye', goto: { map: 'floor1', x: midX, y: 2 } },
          { label: 'Workspace', to: 'bye', goto: { map: 'floor2', x: midX, y: 2 } },
          {
            label: 'Executive Suite',
            to: 'bye',
            goto: { map: 'floor3', x: midX, y: 2 },
            reqItem: 'access_card',
            failure: 'Requires Access Card.'
          }
        ]
      }
    }
  }));

  const npcs = [
    ...elevatorNPCs,
    {
      id: 'security',
      map: 'floor1',
      x: midX - 3,
      y: FLOOR_H - 6,
      color: '#ffb6b6',
      name: 'Security Guard',
      desc: 'A sharp-eyed guard watches the lobby.',
      portraitSheet: portraits.security,
      tree: {
        start: {
          text: 'Access to the third floor requires a card.',
          choices: [
            {
              label: '(Persuade for card)',
              check: { stat: 'CHA', dc: dcTalk },
              success: 'He sighs and hands over a spare card.',
              failure: 'Rules are rules.',
              reward: 'access_card'
            },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      }
    },
    {
      id: 'worker1',
      map: 'floor2',
      x: 6,
      y: 10,
      color: '#b8ffb6',
      name: 'Office Worker',
      desc: 'Busy typing at their desk.',
      portraitSheet: portraits.worker,
      tree: () => {
        const visitedForest = Boolean(flagValue('visited_forest'));
        const baseText = visitedForest
          ? 'Back from the forest already?'
          : 'Too busy to chat.';
        const choices: Array<Record<string, unknown>> = [];
        const playerScrap = player.scrap;
        const hasAccessCard = hasItem('access_card');
        if (playerScrap < 2 && !hasAccessCard)
          choices.push({ label: 'Borrow 2 scrap', to: 'borrow', reward: 'SCRAP 2' });
        choices.push({ label: '(Leave)', to: 'bye' });
        const nodes: Record<string, { text: string; choices?: Array<Record<string, unknown>> }> = {
          start: { text: baseText, choices }
        };
        if (playerScrap < 2 && !hasAccessCard) {
          nodes.borrow = {
            text: 'Here, buy back your badge.',
            choices: [ { label: '(Thanks)', to: 'bye' } ]
          };
        }
        return nodes;
      }
    },
    {
      id: 'worker2',
      map: 'floor2',
      x: FLOOR_W - 7,
      y: 18,
      color: '#b8ffb6',
      name: 'Office Worker',
      desc: 'On a long conference call.',
      portraitSheet: portraits.worker,
      tree: () =>
        flagValue('visited_forest')
          ? { start: { text: 'Heard you roamed the forest.', choices: [ { label: '(Leave quietly)', to: 'bye' } ] } }
          : { start: { text: 'Shh, on a call...', choices: [ { label: '(Leave quietly)', to: 'bye' } ] } }
    },
    {
      id: 'friend1',
      map: 'floor3',
      x: 6,
      y: FLOOR_H - 7,
      color: '#caffc6',
      name: 'Coworker Jen',
      desc: 'Your friend scrolling through code.',
      portraitSheet: portraits.friendJ,
      questId: 'q_card',
      tree: () =>
        flagValue('visited_forest')
          ? { start: { text: 'Glad you made it back from the forest.' } }
          : { start: { text: '' } }
    },
    {
      id: 'friend2',
      map: 'floor3',
      x: FLOOR_W - 7,
      y: FLOOR_H - 8,
      color: '#caffc6',
      name: 'Coworker Luis',
      desc: 'Testing a new patch.',
      portraitSheet: portraits.friendL,
      tree: () =>
        flagValue('visited_forest')
          ? { start: { text: 'The forest changed you.', choices: [ { label: '(Smile)', to: 'bye' } ] } }
          : { start: { text: 'See you in the forest.', choices: [ { label: '(Laugh)', to: 'bye' } ] } }
    },
    {
      id: 'toll',
      map: 'world',
      x: WORLD_MID,
      y: WORLD_MIDY,
      color: '#a9f59f',
      name: 'Toll Keeper',
      desc: 'Blocks the only bridge across the river.',
      portraitSheet: portraits.toll,
      questId: 'q_toll',
      tree: {
        start: { text: 'Pay a trinket to cross.' }
      }
    },
    {
      id: 'fae_king',
      map: 'world',
      x: WORLD_MID + 9,
      y: WORLD_MIDY - 2,
      color: '#caffc6',
      name: 'Fae King',
      desc: 'A regal fae with an enigmatic smile.',
      portraitSheet: portraits.fae,
      tree: {
        start: {
          text: 'Welcome, wanderer. Is this real or dream?',
          choices: [
            { label: '(Ask)', to: 'ask' },
            {
              label: '(Open Castle)',
              to: 'unlock',
              once: true,
              effects: [ { effect: 'unboardDoor', interiorId: 'castle' } ]
            },
            {
              label: '(Request Boon)',
              to: 'gift',
              if: { flag: 'visited_castle', op: '>=', value: 1 },
              once: true,
              reward: 'fae_token',
              effects: [liftHelmetCurse]
            },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        unlock: {
          text: 'He gestures; the castle doors creak open.',
          choices: [ { label: '(Thanks)', to: 'bye' } ]
        },
        ask: {
          text: 'He only laughs and vanishes into mist.',
          choices: [ { label: '(Contemplate)', to: 'bye' } ]
        },
        gift: {
          text: 'He presses a token into your palm. The curse on your helm fades.',
          choices: [ { label: '(Accept)', to: 'bye' } ]
        }
      }
    },
    {
      id: 'forest_rat',
      map: 'world',
      x: WORLD_MID + 5,
      y: WORLD_MIDY + 3,
      color: '#ffb6b6',
      name: 'Giant Rat',
      desc: 'It bares its teeth.',
      portraitSheet: portraits.rat,
      portraitLock: false,
      combat: { HP: 3, ATK: 1, DEF: 0, loot: 'rat_tail', auto: true },
      tree: {
        start: {
          text: 'The rat lunges!',
          choices: [
            { label: '(Fight)', to: 'do_fight' },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      }
    },
    {
      id: 'forest_bandit',
      map: 'world',
      x: WORLD_MID + 6,
      y: WORLD_MIDY - 4,
      color: '#f88',
      name: 'Bandit',
      desc: 'Lurks among the trees.',
      portraitSheet: portraits.bandit,
      portraitLock: false,
      combat: { HP: 6, ATK: 2, DEF: 1, loot: 'rusty_dagger', auto: true },
      tree: {
        start: {
          text: 'Your coin or your life!',
          choices: [
            { label: '(Fight)', to: 'do_fight' },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      }
    },
    {
      id: 'forest_ogre',
      map: 'world',
      x: WORLD_MID + 12,
      y: WORLD_MIDY + 1,
      color: '#f55',
      name: 'Forest Ogre',
      desc: 'Towering and enraged.',
      portraitSheet: portraits.ogre,
      portraitLock: false,
      combat: { HP: 12, ATK: 4, DEF: 2, loot: 'ogre_tooth', auto: true },
      tree: {
        start: {
          text: 'The ogre roars.',
          choices: [
            { label: '(Fight)', to: 'do_fight' },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      }
    },
    {
      id: 'vending',
      map: 'floor2',
      x: midX,
      y: 6,
      symbol: '?',
      color: '#225a20',
      name: 'Vending Machine',
      desc: 'It flashes "TRADE".',
      portraitSheet: portraits.vending,
      shop: { inv: [ { id: 'dusty_candy' } ] },
      vending: true,
      tree: { start: { text: 'The machine hums softly.', choices: [ { label: '(Leave)', to: 'bye' } ] } }
    },
    {
      id: 'rogue_janitor',
      map: 'floor1',
      x: 3,
      y: 6,
      color: '#f88',
      name: 'Rogue Janitor',
      desc: 'Wields a dripping mop.',
      portraitSheet: portraits.janitor,
      portraitLock: false,
      tree: {
        start: {
          text: 'He blocks your path.',
          choices: [
            { label: '(Fight)', to: 'do_fight' },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      },
      combat: { DEF: 3, loot: 'rusty_mop' }
    }
  ];

  const portals = [
    { map: 'floor1', x: midX, y: 4, toMap: 'floor2', toX: midX, toY: 4 },
    { map: 'floor2', x: midX, y: 4, toMap: 'floor1', toX: midX, toY: 4 },
    { map: 'floor2', x: midX + 1, y: 4, toMap: 'floor3', toX: midX + 1, toY: 4 },
    { map: 'floor3', x: midX + 1, y: 4, toMap: 'floor2', toX: midX + 1, toY: 4 }
  ];

  return {
    seed: Date.now(),
    worldGen: genForestWorld,
    start: { map: 'floor1', x: midX, y: FLOOR_H - 2 },
    events: [
      {
        map: 'castle',
        x: 2,
        y: 2,
        events: [ { when: 'enter', effect: 'addFlag', flag: 'visited_castle' } ]
      }
    ],
    portals,
    items: [
        { id: 'access_card', name: 'Access Card', type: 'quest', tags: ['pass'], value: 1 },
        {
          id: 'cursed_vr_helmet',
          name: 'VR Helmet',
          type: 'armor',
          slot: 'armor',
          cursed: true,
          equip: {
            teleport: { map: 'world', x: 2, y: WORLD_MIDY },
            msg: 'You step into the forest.',
            flag: 'visited_forest'
          },
          unequip: {
            teleport: { map: 'floor1', x: midX, y: FLOOR_H - 2 },
            msg: 'You remove the helmet and return to the office.'
          }
        },
        {
          map: 'world',
          x: 3,
          y: WORLD_MIDY,
          id: 'boots_of_speed',
          name: 'Boots of Speed',
          type: 'trinket',
          slot: 'trinket',
          mods: { AGI: 5, move_delay_mod: 0.5 }
        },
        {
          map: 'world',
          x: WORLD_MID - 2,
          y: WORLD_MIDY,
          id: 'river_trinket',
          name: 'River Trinket',
          type: 'trinket',
          slot: 'trinket',
          mods: { LCK: 1 }
        },
        { map: 'world', x: WORLD_MID - 4, y: WORLD_MIDY - 2, id: 'healing_potion1', name: 'Healing Potion', type: 'consumable', use: { type: 'heal', amount: 5 } },
        { map: 'world', x: WORLD_MID + 5, y: WORLD_MIDY + 3, id: 'healing_potion2', name: 'Healing Potion', type: 'consumable', use: { type: 'heal', amount: 5 } },
        { map: 'world', x: WORLD_MID - 6, y: WORLD_MIDY + 5, id: 'healing_potion3', name: 'Healing Potion', type: 'consumable', use: { type: 'heal', amount: 5 } },
        { id: 'dusty_candy', name: 'Dusty Candy Bar', type: 'consumable', value: 2, use: { type: 'heal', amount: 1 } },
        { id: 'fae_token', name: 'Fae Token', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } },
        { id: 'rat_tail', name: 'Rat Tail', type: 'quest' },
        { id: 'rusty_dagger', name: 'Rusty Dagger', type: 'weapon', slot: 'weapon', mods: { ATK: 1, ADR: 10 } },
        { id: 'ogre_tooth', name: 'Ogre Tooth', type: 'quest' },
        { id: 'rusty_mop', name: 'Rusty Mop', type: 'weapon', slot: 'weapon', mods: { ATK: 1, ADR: 10 } },
        { id: 'maze_sword', name: 'Maze Sword', type: 'weapon', slot: 'weapon', mods: { ATK: 10 } },
      ],
      quests: [
        {
          id: 'q_card',
          title: 'Access Granted',
          desc: 'Convince security to lend you an access card and join Jen in the sim.',
          reward: 'cursed_vr_helmet',
          dialog: {
            offer: {
              text: 'Ready for the sim once you get the card.',
              choice: { label: '(Where do I get one?)' }
            },
            accept: { text: 'Security downstairs hoards spares.' },
            turnIn: {
              text: 'Jen hands you a battered VR headset.',
              choice: { label: '(I have the card)' }
            },
            completed: { text: 'Glad you made it back from the forest.' }
          }
        },
        {
          id: 'q_toll',
          title: 'Bridge Tax',
          desc: 'Pay the Toll Keeper with a trinket.',
          moveTo: { x: WORLD_MID + 2, y: WORLD_MIDY },
          dialog: {
            offer: {
              text: 'Pay a trinket to cross.',
              choice: { label: '(Accept quest)' }
            },
            accept: { text: 'Bring me a trinket and you may cross.' },
            turnIn: {
              text: 'The toll keeper steps aside.',
              choice: {
                label: '(Pay)',
                costSlot: 'trinket',
                success: '',
                failure: 'You have no trinket.'
              }
            }
          }
        }
      ],
    npcs,
    interiors: [floor1, floor2, floor3, castle]
  };
})();

const DATA = `{
  "seed": "office",
  "name": "office"
}`;

function postLoad(module: OfficeModule): void {
  Object.assign(module, OFFICE_IMPL);
}

const officeModule = JSON.parse(DATA) as OfficeModule;
officeModule.postLoad = postLoad;
const OFFICE_MODULE = officeModule;
globalThis.OFFICE_MODULE = OFFICE_MODULE;

globalThis.startGame = function (): void {
  const module = globalThis.OFFICE_MODULE;
  if (!module) throw new Error('Malformed or incomplete module: OFFICE_MODULE');
  module.postLoad?.(module);
  if (module.worldGen) {
    const { castleId } = applyModule(OFFICE_MODULE);
    const charm = registerItem({
      id: 'forest_charm',
      name: 'Forest Charm',
      type: 'trinket',
      slot: 'trinket',
      mods: { LCK: 1 }
    });
    const stim = registerItem({
      id: 'adrenaline_charm',
      name: 'Adrenaline Charm',
      type: 'trinket',
      slot: 'trinket',
      mods: { adrenaline_gen_mod: 2, adrenaline_dmg_mod: 1.5 }
    });
    if (castleId && interiors[castleId]) {
      const interior = interiors[castleId];
      const ix = Math.floor(interior.w / 2);
      const iy = Math.floor(interior.h / 2);
      itemDrops.push({ id: charm.id, map: castleId, x: ix, y: iy, dropType: 'world' });
      itemDrops.push({ id: stim.id, map: castleId, x: ix + 1, y: iy, dropType: 'world' });
    }
    const start = module.start;
    if (start) {
      setPartyPos(start.x, start.y);
      setMap(start.map);
    }
    player.scrap = 10;
    log('You arrive at the office.');
  } else {
    throw Error("Malformed or incomplete module: OFFICE_MODULE");
  }
};

export {};
