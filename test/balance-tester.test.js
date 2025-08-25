import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

test('Game balance tester', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const html = `<!DOCTYPE html><body>
    <div id="log"></div>
    <div id="hp"></div>
    <div id="ap"></div>
    <div id="scrap"></div>
    <canvas id="game"></canvas>
    <div id="mapname"></div>
    <div id="start">
      <div id="startContinue"></div>
      <div id="startNew"></div>
    </div>
    <div id="creator">
      <div id="ccStep"></div>
      <div id="ccRight"></div>
      <div id="ccHint"></div>
      <div id="ccBack"></div>
      <div id="ccNext"></div>
      <div id="ccPortrait"></div>
      <div id="ccStart"></div>
      <div id="ccLoad"></div>
    </div>
    <div id="combatOverlay">
      <div id="combatEnemies"></div>
      <div id="combatParty"></div>
      <div id="combatCmd"></div>
      <div id="turnIndicator"></div>
    </div>
  </body>`;
  const dom = new JSDOM(html, { url: 'http://localhost/dustland.html?ack-player=1' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.location = window.location;
  window.requestAnimationFrame = () => {};
  global.requestAnimationFrame = window.requestAnimationFrame;
  window.NanoDialog = { init: () => {} };
  global.NanoDialog = window.NanoDialog;
  window.AudioContext = function() {};
  window.webkitAudioContext = window.AudioContext;
  window.Audio = function(){ return { cloneNode: () => ({ play: () => ({ catch: () => {} }), pause: () => {} }) }; };
  global.Audio = window.Audio;
  global.EventBus = { on: () => {}, emit: () => {} };
  global.TS = 16;
  global.camX = 0;
  global.camY = 0;
  global.interactAt = () => {};
  window.HTMLCanvasElement.prototype.getContext = () => ({
    drawImage: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {}
  });
  const store = { dustland_crt: '{}' };
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k) => store[k],
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    }
  });
  global.localStorage = window.localStorage;
  let startShown = false;
  let creatorOpened = false;
  global.showStart = () => { startShown = true; };
  global.openCreator = () => { creatorOpened = true; };
  global.bootMap = () => {};
  global.draw = () => {};
  global.runTests = () => {};

  const nanoPath = path.join(__dirname, '..', 'dustland-nano.js');
  const corePath = path.join(__dirname, '..', 'dustland-core.js');
  const partyPath = path.join(__dirname, '..', 'core', 'party.js');
  const questsPath = path.join(__dirname, '..', 'core', 'quests.js');
  const abilitiesPath = path.join(__dirname, '..', 'core', 'abilities.js');
  const actionsPath = path.join(__dirname, '..', 'core', 'actions.js');
  const combatPath = path.join(__dirname, '..', 'core', 'combat.js');
  const dialogPath = path.join(__dirname, '..', 'core', 'dialog.js');
  const effectsPath = path.join(__dirname, '..', 'core', 'effects.js');
  const inventoryPath = path.join(__dirname, '..', 'core', 'inventory.js');
  const loopPath = path.join(__dirname, '..', 'core', 'loop.js');
  const movementPath = path.join(__dirname, '..', 'core', 'movement.js');
  const npcPath = path.join(__dirname, '..', 'core', 'npc.js');
  const enginePath = path.join(__dirname, '..', 'dustland-engine.js');
  const eventBusPath = path.join(__dirname, '..', 'event-bus.js');
  const pathPath = path.join(__dirname, '..', 'dustland-path.js');

  window.eval(fs.readFileSync(eventBusPath, 'utf8'));
  window.eval(fs.readFileSync(nanoPath, 'utf8'));
  window.eval(fs.readFileSync(corePath, 'utf8'));
  window.eval(fs.readFileSync(partyPath, 'utf8'));
  window.eval(fs.readFileSync(questsPath, 'utf8'));
  window.eval(fs.readFileSync(abilitiesPath, 'utf8'));
  window.eval(fs.readFileSync(actionsPath, 'utf8'));
  window.eval(fs.readFileSync(combatPath, 'utf8'));
  window.eval(fs.readFileSync(dialogPath, 'utf8'));
  window.eval(fs.readFileSync(effectsPath, 'utf8'));
  window.eval(fs.readFileSync(inventoryPath, 'utf8'));
  window.eval(fs.readFileSync(loopPath, 'utf8'));
  window.eval(fs.readFileSync(movementPath, 'utf8'));
  window.eval(fs.readFileSync(npcPath, 'utf8'));
  window.eval(fs.readFileSync(pathPath, 'utf8'));
  window.eval(fs.readFileSync(enginePath, 'utf8'));

  // Generate the world and then apply the module
  genWorld();
  const modulePath = path.join(__dirname, '..', 'modules', 'golden.module.json');
  const moduleData = JSON.parse(fs.readFileSync(modulePath, 'utf8'));
  applyModule(moduleData);

  // Create a party
  party.push(makeMember('player1', 'Test Player', 'Wanderer'));
  setLeader(0);
  setPartyPos(2, 2);
  setMap('world', 'Test');

  const agent = {
    think: async () => {
      // 1. Attack monsters
      const nearbyMonster = findNearbyMonster();
      if (nearbyMonster) {
        const result = await startCombat(nearbyMonster);
        if (result.result === 'loot') {
          stats.monstersDefeated++;
        } else if (result.result === 'bruise') {
          stats.combatLost++;
        }
        return;
      }

      // 2. Interact with NPCs
      const nearbyNPC = findNearbyNPC();
      if (nearbyNPC) {
        interact();
        return;
      }

      // 3. Move randomly
      const directions = ['up', 'down', 'left', 'right'];
      const dirMap = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const [dx, dy] = dirMap[dir];
      move(dx, dy);
    }
  };

  function findNearbyMonster() {
    const playerPos = { x: party[0].x, y: party[0].y };
    for (const npc of NPCS) {
      if (npc.combat && isAdjacent(playerPos, npc)) {
        return npc;
      }
    }
    return null;
  }

  function findNearbyNPC() {
    const playerPos = { x: party[0].x, y: party[0].y };
    for (const npc of NPCS) {
      if (!npc.combat && isAdjacent(playerPos, npc)) {
        return npc;
      }
    }
    return null;
  }

  function isAdjacent(pos1, pos2) {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1;
  }

  // A simple assertion to make sure the game started.
  assert.strictEqual(party.length, 1, 'Party should have one member.');

  // Game loop
  const stats = {
    monstersDefeated: 0,
    combatLost: 0,
    levelsAdvanced: 0,
    experienceGained: 0,
    partyMembersAdded: 0,
    questsCompleted: 0,
  };

  EventBus.on('xp:gained', ({ amount }) => {
    stats.experienceGained += amount;
  });

  EventBus.on('character:leveled-up', () => {
    stats.levelsAdvanced++;
  });

  EventBus.on('quest:completed', () => {
    stats.questsCompleted++;
  });

  return (async () => {
    let lastPartySize = party.length;
    for (let i = 0; i < 1000; i++) {
      await agent.think();
      if (party.length > lastPartySize) {
        stats.partyMembersAdded += party.length - lastPartySize;
      }
      lastPartySize = party.length;
    }

    // Log the results
    console.log('Balance Test Results:');
    console.log(JSON.stringify(stats, null, 2));
  })();
});
