// @ts-nocheck
// This script is loaded into balance-tester.html and runs the game balance simulation.

// Wait for the game to be ready in the browser or set up a jsdom
// environment when executed under Node.js. This allows the balance
// tester to run headlessly via `node scripts/supporting/balance-tester-agent.js`.
if (typeof window === 'undefined') {
  (async () => {
    const { JSDOM } = await import('jsdom');
    const fs = await import('node:fs');
    const path = await import('node:path');
    const baseDir = process.cwd();

    const html = `<!DOCTYPE html><body>
      <div id="log"></div>
      <div id="hp"></div>
      <div id="scrap"></div>
      <canvas id="game"></canvas>
      <div id="mapname"></div>
      <div id="tabInv"></div>
      <div id="tabParty"></div>
      <div id="tabQuests"></div>
      <div id="inv"></div>
      <div id="party"></div>
      <div id="quests"></div>
      <button id="saveBtn"></button>
      <button id="loadBtn"></button>
      <button id="resetBtn"></button>
      <div id="start"><div id="startContinue"></div><div id="startNew"></div></div>
      <div id="creator">
        <div id="ccStep"></div><div id="ccRight"></div><div id="ccHint"></div>
        <div id="ccBack"></div><div id="ccNext"></div>
        <div id="ccPortrait"></div><div id="ccStart"></div><div id="ccLoad"></div>
      </div>
      <div id="combatOverlay">
        <div id="combatEnemies"></div>
        <div id="combatParty"></div>
        <div id="combatCmd"></div>
        <div id="turnIndicator"></div>
      </div>
    </body>`;
    const dom = new JSDOM(html, { url: 'http://localhost/dustland.html?ack-player=1' });
    const { window: w } = dom;
    global.window = w;
    global.document = w.document;
    global.location = w.location;
    w.requestAnimationFrame = () => {};
    global.requestAnimationFrame = w.requestAnimationFrame;
    w.NanoDialog = { init: () => {} };
    global.NanoDialog = w.NanoDialog;
    w.AudioContext = function() {};
    w.webkitAudioContext = w.AudioContext;
    w.Audio = function(){ return { cloneNode: () => ({ play: () => ({ catch: () => {} }), pause: () => {} }) }; };
    global.Audio = w.Audio;
    global.EventBus = { on: () => {}, emit: () => {} };
    global.TS = 16;
    global.camX = 0;
    global.camY = 0;
    global.interactAt = () => {};
    w.HTMLCanvasElement.prototype.getContext = () => ({
      drawImage: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {}
    });
    const store = { dustland_crt: '{}' };
    Object.defineProperty(w, 'localStorage', {
      value: {
        getItem: (k) => store[k],
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; }
      }
    });
    global.localStorage = w.localStorage;
    global.showStart = () => {};
    global.openCreator = () => {};
    global.bootMap = () => {};
    global.draw = () => {};
    global.runTests = () => {};

    const scripts = [
      'scripts/event-bus.js',
      'scripts/dustland-nano.js',
      'scripts/dustland-core.js',
      'scripts/core/party.js',
      'scripts/core/quests.js',
      'scripts/core/abilities.js',
      'scripts/core/actions.js',
      'scripts/core/combat.js',
      'scripts/core/dialog.js',
      'scripts/core/effects.js',
      'scripts/core/inventory.js',
      'scripts/core/loop.js',
      'scripts/core/movement.js',
      'scripts/core/npc.js',
      'scripts/dustland-path.js',
      'scripts/dustland-engine.js'
    ];
    for (const file of scripts) {
      w.eval(fs.readFileSync(path.join(baseDir, file), 'utf8'));
    }
    global.NanoDialog = w.NanoDialog;
    await runBalanceTest();
  })().catch(err => {
    console.error('Balance test error:', err);
    process.exit(1);
  });
} else {
  window.addEventListener('load', () => {
    console.log('Balance tester agent loaded.');
    runBalanceTest();
  });
}

async function runBalanceTest() {
  try {
    console.log('Running balance test...');
    const modulePath = 'modules/golden.module.json';
    let moduleData;
    if (typeof window !== 'undefined' && window.fetch) {
      const res = await fetch(modulePath);
      moduleData = await res.json();
    } else {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const json = await fs.readFile(path.join(process.cwd(), modulePath), 'utf8');
      moduleData = JSON.parse(json);
    }
    applyModule(moduleData);
    console.log('Balance test checkpoint: module loaded');

    // Create a party
    party.join(makeMember('player1', 'Test Player', 'Wanderer'));
    setLeader(0);
    setPartyPos(2, 2);
    setMap('world', 'Test');
    console.log('Balance test checkpoint: party ready');

    const agent = {
      goal: null,
      path: [],
      job: null,
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

        // 2. Grab items or use doors
        if (takeNearestItem()) return;
        const nearbyDoor = findNearbyDoor();
        if (nearbyDoor) {
          interact();
          return;
        }

        // 3. Talk to NPCs
        const nearbyNPC = findNearbyNPC();
        if (nearbyNPC) {
          interact();
          return;
        }

        // 4. Move toward goal using A* pathfinding
        const leader = party[0];
        const px = party.x;
        const py = party.y;
        if (agent.path.length) {
          const step = agent.path.shift();
          const dx = step.x - px;
          const dy = step.y - py;
          await Dustland.movement.move(dx, dy);
          stats.pathDistance += Math.abs(dx) + Math.abs(dy);
          return;
        }
        if (agent.job) {
          const p = Dustland.path.pathFor(agent.job);
          if (p) {
            agent.path = p.slice(1);
            agent.job = null;
          }
          return;
        }
        const map = mapIdForState();
        const target = findRandomGoal(map, agent.goal);
        if (target) {
          agent.goal = target;
          agent.job = Dustland.path.queue(map, { x: px, y: py }, agent.goal, leader.id);
        }
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

  function findNearbyDoor() {
    const dirs = [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    for (const [dx, dy] of dirs) {
      const info = queryTile(party.x + dx, party.y + dy);
      if (info.tile === TILE.DOOR) {
        return { x: party.x + dx, y: party.y + dy };
      }
    }
    return null;
  }

  function findRandomGoal(map, avoid) {
    const candidates = [];
    for (const npc of NPCS) {
      if (!npc.combat && npc.map === map) {
        const adj = findAdjacentWalkableTile(map, npc);
        candidates.push(adj);
      }
    }
    for (const it of itemDrops) {
      if (it.map === map) candidates.push({ x: it.x, y: it.y });
    }
    for (const b of buildings) {
      if (b.doorX != null && b.doorY != null && !b.boarded && (b.map == null || b.map === map)) {
        candidates.push({ x: b.doorX, y: b.doorY });
      }
    }
    const filtered = candidates.filter(c => !(avoid && c.x === avoid.x && c.y === avoid.y));
    if (!filtered.length) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  function isAdjacent(pos1, pos2) {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1;
  }

  function findAdjacentWalkableTile(map, pos) {
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];
    for (const d of dirs) {
      const info = queryTile(pos.x + d.x, pos.y + d.y, map);
      if (info.walkable) return { x: pos.x + d.x, y: pos.y + d.y };
    }
    return { x: pos.x, y: pos.y };
  }

  // Game loop
  const stats = {
    monstersDefeated: 0,
    combatLost: 0,
    levelsAdvanced: 0,
    experienceGained: 0,
    partyMembersAdded: 0,
    questsCompleted: 0,
    pathDistance: 0,
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

    console.log('Balance test checkpoint: loop start');
    let lastPartySize = party.length;
    const maxSteps = 50;
    let steps = 0;
    // Allow queued pathfinding and other async tasks to run between steps.
    const macroyield = () => new Promise(r => setTimeout(r, 0));

    while (party[0].lvl < 5 && steps < maxSteps) {
      await agent.think();
      if (party.length > lastPartySize) {
        stats.partyMembersAdded += party.length - lastPartySize;
      }
      lastPartySize = party.length;
      steps++;
      await macroyield();
    }
    console.log('Balance test checkpoint: loop end');

    // Log the results so puppeteer or the console can grab them
    const resultText = JSON.stringify(stats, null, 2);
    if (typeof document !== 'undefined' && document.body) {
      const resultsEl = document.createElement('div');
      resultsEl.id = 'results';
      resultsEl.textContent = resultText;
      document.body.appendChild(resultsEl);
    }
    console.log(resultText);
  } catch (err) {
    console.error('Balance test error:', err);
    throw err;
  }
}
