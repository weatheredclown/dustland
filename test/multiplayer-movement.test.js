import { test } from 'node:test';
import assert from 'node:assert/strict';
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

test('remote party positions sync to peers', async () => {
  const shared = { offers: new Map(), answers: new Map(), nextOffer: 1, nextAnswer: 1 };
  const { env: hostEnv, bus: hostBus } = ctx(shared);
  const { env: clientA, bus: busA } = ctx(shared);
  const { env: clientB, bus: busB } = ctx(shared);

  const room = await hostEnv.Dustland.multiplayer.startHost();

  const ticketA = await room.createOffer();
  const socketA = await clientA.Dustland.multiplayer.connect({ code: ticketA.code });
  await room.acceptAnswer(ticketA.id, socketA.answer);
  await socketA.ready;

  const ticketB = await room.createOffer();
  const socketB = await clientB.Dustland.multiplayer.connect({ code: ticketB.code });
  await room.acceptAnswer(ticketB.id, socketB.answer);
  await socketB.ready;

  const hostUpdate = new Promise(resolve => {
    hostBus.on('multiplayer:party-sync', list => {
      if (Array.isArray(list) && list.some(p => p.id === ticketA.id && p.x === 4 && p.y === 7)) resolve();
    });
  });

  const peerUpdate = new Promise(resolve => {
    busB.on('multiplayer:party-sync', list => {
      if (Array.isArray(list) && list.some(p => p.id === ticketA.id && p.x === 4 && p.y === 7)) resolve();
    });
  });

  busA.emit('movement:player', { x: 4, y: 7, map: 'world' });

  await hostUpdate;
  await peerUpdate;

  const hostSnapshot = hostEnv.Dustland.multiplayerParties.list();
  const peerSnapshot = clientB.Dustland.multiplayerParties.list();
  assert.ok(hostSnapshot.some(p => p.id === ticketA.id && p.x === 4 && p.y === 7));
  assert.ok(peerSnapshot.some(p => p.id === ticketA.id && p.x === 4 && p.y === 7));

  const clientHostUpdate = new Promise(resolve => {
    busA.on('multiplayer:party-sync', list => {
      if (Array.isArray(list) && list.some(p => p.id === 'host' && p.x === 9 && p.y === 2)) resolve();
    });
  });

  hostBus.emit('movement:player', { x: 9, y: 2, map: 'world' });
  await clientHostUpdate;

  const clientView = clientA.Dustland.multiplayerParties.list();
  assert.ok(clientView.some(p => p.id === 'host' && p.x === 9 && p.y === 2));

  socketA.close();
  socketB.close();
  room.close();
});
