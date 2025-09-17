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
const mp = await fs.readFile(new URL('../scripts/multiplayer.js', import.meta.url), 'utf8');

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
  vm.runInContext(mp, env);
  return { env, bus: b };
}

test('movement events propagate between clients', async () => {
  const shared = { offers: new Map(), answers: new Map(), nextOffer: 1, nextAnswer: 1 };
  const { env: host } = ctx(shared);
  const { env: c1, bus: bus1 } = ctx(shared);
  const { env: c2, bus: bus2 } = ctx(shared);

  const room = await host.Dustland.multiplayer.startHost();

  const t1 = await room.createOffer();
  const s1 = await c1.Dustland.multiplayer.connect({ code: t1.code });
  await room.acceptAnswer(t1.id, s1.answer);
  await s1.ready;

  const t2 = await room.createOffer();
  const s2 = await c2.Dustland.multiplayer.connect({ code: t2.code });
  await room.acceptAnswer(t2.id, s2.answer);
  await s2.ready;

  const received = new Promise(resolve => {
    bus2.on('movement:player', payload => {
      if (payload && payload.x === 5 && payload.y === 6) resolve();
    });
  });

  bus1.emit('movement:player', { x: 5, y: 6 });
  await received;

  s1.close();
  s2.close();
  room.close();
});
