import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('weather affects move delay and encounter bias', async () => {
  const code = await fs.readFile(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  const bus = { handlers:{}, on(evt,fn){ (this.handlers[evt]=this.handlers[evt]||[]).push(fn); }, emit(evt,p){ (this.handlers[evt]||[]).forEach(fn=>fn(p)); } };
  let currentWeather = { speedMod: 1, encounterBias: null };
  let encountered = null;
  const Dustland = { effects:{}, eventBus: bus, weather: { getWeather: () => currentWeather }, actions:{ startCombat: e => { encountered = e; } } };
  const context = {
    Dustland,
    state: { map: 'world' },
    enemyBanks: { world:[{ id:'bandit', name:'Bandit' }, { id:'slime', name:'Slime' }] },
    party: { x:0, y:0 },
    distanceToRoad: () => 10,
    WORLD_W: 100,
    WORLD_H: 100,
    Math,
    TILE: { ROAD: 4 },
    clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
    world: [[]],
    interiors: {},
    creatorMap: {}
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  const base = context.calcMoveDelay(0, { stats:{ AGI:0 } });
  currentWeather = { speedMod: 0.5, encounterBias: 'bandit' };
  bus.emit('weather:change', currentWeather);
  const slow = context.calcMoveDelay(0, { stats:{ AGI:0 } });
  assert.strictEqual(slow, base * 0.5);
  let call = 0;
  context.Math.random = () => (call++ === 0 ? 0 : 0.75);
  context.checkRandomEncounter();
  assert.strictEqual(encountered.id, 'bandit');
});
