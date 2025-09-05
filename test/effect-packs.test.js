import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

async function load(files, context){
  for(const f of files){
    const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
    vm.runInContext(code, context, { filename: f });
  }
}

test('effect packs respond to events', async () => {
  const context = { party: { flags: {} }, console };
  vm.createContext(context);
  await load([
    '../scripts/event-bus.js',
    '../scripts/core/effects.js',
    '../scripts/game-state.js'
  ], context);
  context.Dustland.gameState.loadEffectPacks({
    'test:ping': [ { effect: 'addFlag', flag: 'pinged' } ]
  });
  context.EventBus.emit('test:ping', { party: context.party });
  assert.ok(context.party.flags.pinged);
});
