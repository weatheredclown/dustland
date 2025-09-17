import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function bus(){
  const listeners = {};
  return {
    on(evt, fn){ (listeners[evt] = listeners[evt] || []).push(fn); },
    emit(evt, payload){ (listeners[evt] || []).forEach(fn => fn(payload)); }
  };
}

const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
const sync = await fs.readFile(new URL('../scripts/supporting/multiplayer-sync.js', import.meta.url), 'utf8');

function ctx(shared){
  const b = bus();
  const env = {
    EventBus: b,
    Dustland: { eventBus: b },
    setTimeout,
    clearTimeout,
    console,
    Buffer,
    queueMicrotask,
    navigator: {},
    __dustlandLoopback: shared
  };
  vm.createContext(env);
  vm.runInContext(gs, env);
  vm.runInContext(sync, env);
  return env;
}

test('world state broadcasts to clients', async () => {
  const shared = { offers: new Map(), answers: new Map(), nextOffer: 1, nextAnswer: 1 };
  const host = ctx(shared);
  const client = ctx(shared);

  const hostRoom = await host.Dustland.multiplayer.startHost();
  const ticket = await hostRoom.createOffer();
  const socket = await client.Dustland.multiplayer.connect({ code: ticket.code });
  await hostRoom.acceptAnswer(ticket.id, socket.answer);
  await socket.ready;

  host.Dustland.gameState.updateState(state => { state.test = 42; });
  await new Promise(res => setTimeout(res, 10));
  assert.equal(client.Dustland.gameState.getState().test, 42);

  socket.close();
  hostRoom.close();
});
