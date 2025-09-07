import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function bus(){
  const listeners = {};
  return {
    on(evt, fn){ (listeners[evt]=listeners[evt]||[]).push(fn); },
    emit(evt, payload){ (listeners[evt]||[]).forEach(f=>f(payload)); }
  };
}

test.skip('combat events propagate between clients', async () => {
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  const sync = await fs.readFile(new URL('../scripts/supporting/multiplayer-sync.js', import.meta.url), 'utf8');
  const mp = await fs.readFile(new URL('../scripts/multiplayer.js', import.meta.url), 'utf8');
  const ws = await import('ws');

  function ctx(){
    const b = bus();
    const env = {
      EventBus: b,
      Dustland: { eventBus: b },
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      console,
      WebSocket: ws.WebSocket,
      WebSocketServer: ws.WebSocketServer
    };
    vm.createContext(env);
    vm.runInContext(gs, env);
    vm.runInContext(sync, env);
    vm.runInContext(mp, env);
    return { env, bus: b };
  }

  const { env: host } = ctx();
  const { env: c1, bus: b1 } = ctx();
  const { env: c2, bus: b2 } = ctx();

  const port = 8132;
  const server = await host.Dustland.multiplayer.startHost({ port });
  const s1 = await c1.Dustland.multiplayer.connect(`ws://localhost:${port}`);
  const s2 = await c2.Dustland.multiplayer.connect(`ws://localhost:${port}`);
  await Promise.all([new Promise(r=>s1.on('open',r)), new Promise(r=>s2.on('open',r))]);

  const received = new Promise(res => b2.on('combat:event', ev => { if(ev.type==='attack') res(); }));
  b1.emit('combat:event', { type:'attack' });
  await received;

  s1.close();
  s2.close();
  await Promise.all([
    new Promise(res => s1.on('close', res)),
    new Promise(res => s2.on('close', res))
  ]);
  await new Promise(res => server.close(res));
});
