import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function createBus(){
  const listeners = new Map();
  return {
    on(evt, fn){
      if (!listeners.has(evt)) listeners.set(evt, new Set());
      listeners.get(evt).add(fn);
    },
    off(evt, fn){
      listeners.get(evt)?.delete(fn);
    },
    emit(evt, payload){
      listeners.get(evt)?.forEach(fn => fn(payload));
    }
  };
}

const gameStateSrc = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
const syncSrc = await fs.readFile(new URL('../scripts/supporting/multiplayer-sync.js', import.meta.url), 'utf8');
const multiplayerSrc = await fs.readFile(new URL('../scripts/multiplayer.js', import.meta.url), 'utf8');

function createContext(shared){
  const bus = createBus();
  const env = {
    EventBus: bus,
    Dustland: { eventBus: bus },
    setTimeout,
    clearTimeout,
    console,
    Buffer,
    queueMicrotask,
    navigator: {},
    __dustlandLoopback: shared
  };
  vm.createContext(env);
  vm.runInContext(gameStateSrc, env);
  vm.runInContext(syncSrc, env);
  vm.runInContext(multiplayerSrc, env);
  return { env, bus };
}

test('multiplayer presence events announce joins and closes', async () => {
  const shared = { offers: new Map(), answers: new Map(), nextOffer: 1, nextAnswer: 1 };
  const { env: hostEnv, bus: hostBus } = createContext(shared);
  const { env: clientEnv, bus: clientBus } = createContext(shared);

  const hostEvents = [];
  const clientEvents = [];
  hostBus.on('multiplayer:presence', info => hostEvents.push({ ...info }));
  clientBus.on('multiplayer:presence', info => clientEvents.push({ ...info }));

  const room = await hostEnv.Dustland.multiplayer.startHost();
  const ticket = await room.createOffer();
  const socket = await clientEnv.Dustland.multiplayer.connect({ code: ticket.code });
  await room.acceptAnswer(ticket.id, socket.answer);
  await socket.ready;
  await new Promise(res => setTimeout(res, 5));

  assert.ok(hostEvents.some(e => e.role === 'host' && e.status === 'started'));
  assert.ok(hostEvents.some(e => e.role === 'host' && e.status === 'peers'));
  assert.ok(clientEvents.some(e => e.status === 'linked'));
  assert.ok(clientEvents.some(e => e.status === 'peers'));

  room.close();
  await new Promise(res => setTimeout(res, 0));
  socket.close();
  await new Promise(res => setTimeout(res, 0));

  assert.ok(hostEvents.some(e => e.role === 'host' && e.status === 'closed'));
  assert.ok(clientEvents.some(e => e.status === 'closed'));
});
