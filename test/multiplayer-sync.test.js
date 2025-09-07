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

test.skip('world state broadcasts and reconnects', async () => {
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  const sync = await fs.readFile(new URL('../scripts/supporting/multiplayer-sync.js', import.meta.url), 'utf8');
  const ws = await import('ws');

  const hostBus = bus();
  const host = { EventBus: hostBus, Dustland:{ eventBus: hostBus }, setTimeout, clearTimeout, setInterval, clearInterval, console, WebSocket: ws.WebSocket, WebSocketServer: ws.WebSocketServer };
  vm.createContext(host);
  vm.runInContext(gs, host);
  vm.runInContext(sync, host);

  const clientBus = bus();
  const client = { EventBus: clientBus, Dustland:{ eventBus: clientBus }, setTimeout, clearTimeout, setInterval, clearInterval, console, WebSocket: ws.WebSocket, WebSocketServer: ws.WebSocketServer };
  vm.createContext(client);
  vm.runInContext(gs, client);
  vm.runInContext(sync, client);

  const port = 8090;
  let server = await host.Dustland.multiplayer.startHost({ port });
  const socket = await client.Dustland.multiplayer.connect(`ws://localhost:${port}`);
  await new Promise(res => socket.on('open', res));

  host.Dustland.gameState.updateState(s => { s.test = 1; });
  await new Promise(res => setTimeout(res, 50));
  assert.equal(client.Dustland.gameState.getState().test, 1);

  await new Promise(res => server.close(res));
  await new Promise(res => setTimeout(res, 100));
  server = await host.Dustland.multiplayer.startHost({ port });
  await new Promise(res => setTimeout(res, 200));
  host.Dustland.gameState.updateState(s => { s.test = 2; });
  await new Promise(res => setTimeout(res, 50));
  assert.equal(client.Dustland.gameState.getState().test, 2);
  socket.close();
  await new Promise(res => socket.on('close', res));
  await new Promise(res => server.close(res));
});
