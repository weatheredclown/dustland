import assert from 'node:assert';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('fast travel merges remote module bunkers for cost calculations', async () => {
  const context = {
    console,
    EventBus: { emit(){}, on(){} },
    log(){},
    save(){},
    load(){},
    player: {},
    party: {},
    localStorage: {
      getItem(){ return null; },
      setItem(){},
      removeItem(){}
    }
  };
  context.globalThis = context;
  context.Dustland = { eventBus: context.EventBus, bunkers: [] };

  const fastTravelSrc = readFileSync(new URL('../scripts/core/fast-travel.js', import.meta.url), 'utf8');
  vm.runInNewContext(fastTravelSrc, context);

  const fastTravel = context.Dustland.fastTravel;
  fastTravel.upsertBunkers([{ id: 'edge', x: 5, y: 5, map: 'world', module: 'edge', active: true }]);
  assert.strictEqual(fastTravel.fuelCost('edge', 'alpha'), Infinity);

  context.Dustland.currentModule = 'edge';
  context.Dustland.moduleProps = { edge: { fastTravelModules: [{ global: 'WORLD_ONE_MODULE' }] } };
  context.Dustland.loadedModules = {};
  context.WORLD_ONE_MODULE = {
    name: 'world-one',
    buildings: [
      { bunker: true, bunkerId: 'alpha', x: 20, y: 21, doorX: 22, doorY: 23, boarded: false }
    ]
  };

  const worldMapSrc = readFileSync(new URL('../scripts/ui/world-map.js', import.meta.url), 'utf8');
  vm.runInNewContext(worldMapSrc, context);

  const gather = context.Dustland.worldMap._gatherBunkers;
  assert.ok(typeof gather === 'function');

  const bunkers = await new Promise(resolve => gather(resolve));
  assert.ok(bunkers.some(b => b.id === 'alpha'));

  const globalEntry = context.Dustland.bunkers.find(b => b.id === 'alpha');
  assert.ok(globalEntry, 'remote bunker was registered globally');
  assert.strictEqual(globalEntry.x, 22);
  assert.strictEqual(globalEntry.y, 23);
  assert.strictEqual(globalEntry.network, 'global');

  const cost = fastTravel.fuelCost('edge', 'alpha');
  assert.strictEqual(cost, 1 + Math.abs(5 - 22) + Math.abs(5 - 23));
  assert.ok(Number.isFinite(cost));
});

test('module-scoped bunkers remain local', async () => {
  const context = {
    console,
    EventBus: { emit(){}, on(){} },
    log(){},
    save(){},
    load(){},
    player: {},
    party: {},
    localStorage: {
      getItem(){ return null; },
      setItem(){},
      removeItem(){}
    }
  };
  context.globalThis = context;
  context.Dustland = { eventBus: context.EventBus, bunkers: [], moduleProps: { local: { bunkerTravelScope: 'module', fastTravelModules: [{ global: 'REMOTE_MODULE', module: 'remote' }] } }, loadedModules: { local: { name: 'local', seed: 1, props: { bunkerTravelScope: 'module' } } }, currentModule: 'local' };

  const fastTravelSrc = readFileSync(new URL('../scripts/core/fast-travel.js', import.meta.url), 'utf8');
  vm.runInNewContext(fastTravelSrc, context);

  const fastTravel = context.Dustland.fastTravel;
  fastTravel.upsertBunkers([{ id: 'local_a', x: 3, y: 3, map: 'world', module: 'local', active: true }]);
  assert.strictEqual(context.Dustland.bunkers[0].network, 'module:local');

  context.REMOTE_MODULE = {
    name: 'remote',
    buildings: [
      { bunker: true, bunkerId: 'remote_a', x: 10, y: 10, doorX: 11, doorY: 11, boarded: false }
    ]
  };

  const worldMapSrc = readFileSync(new URL('../scripts/ui/world-map.js', import.meta.url), 'utf8');
  vm.runInNewContext(worldMapSrc, context);

  const gather = context.Dustland.worldMap._gatherBunkers;
  assert.ok(typeof gather === 'function');

  await new Promise(resolve => gather(resolve));

  const remoteEntry = context.Dustland.bunkers.find(b => b.id === 'remote_a');
  assert.ok(remoteEntry, 'remote bunker registered');
  assert.strictEqual(remoteEntry.network, 'global');

  const cost = fastTravel.fuelCost('local_a', 'remote_a');
  assert.strictEqual(cost, Infinity);
});

test('travel pass removes fast travel fuel cost', () => {
  const context = {
    console,
    EventBus: { emit(){}, on(){} },
    log(){},
    save(){},
    load(){},
    player: { fuel: 2, inv: [] },
    party: {},
    localStorage: {
      getItem(){ return null; },
      setItem(){},
      removeItem(){}
    },
    hasItem(){ return false; }
  };
  context.globalThis = context;
  context.Dustland = { eventBus: context.EventBus, bunkers: [] };

  const fastTravelSrc = readFileSync(new URL('../scripts/core/fast-travel.js', import.meta.url), 'utf8');
  vm.runInNewContext(fastTravelSrc, context);

  const fastTravel = context.Dustland.fastTravel;
  fastTravel.upsertBunkers([
    { id: 'north', x: 0, y: 0, map: 'world', module: 'dustland', active: true },
    { id: 'south', x: 3, y: 4, map: 'world', module: 'dustland', active: true }
  ]);

  const costWithoutPass = fastTravel.fuelCost('north', 'south');
  assert.ok(costWithoutPass > 0, 'cost should require fuel before pass');
  const travelWithoutPass = fastTravel.travel('north', 'south');
  assert.strictEqual(travelWithoutPass, false);
  assert.strictEqual(context.player.fuel, 2);

  context.hasItem = id => id === 'travel_pass';
  context.player.fuel = 0;

  const costWithPass = fastTravel.fuelCost('north', 'south');
  assert.strictEqual(costWithPass, 0);
  const travelWithPass = fastTravel.travel('north', 'south');
  assert.strictEqual(travelWithPass, true);
  assert.strictEqual(context.player.fuel, 0);
});
