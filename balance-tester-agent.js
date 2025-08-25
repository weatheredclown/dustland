// This script is loaded into balance-tester.html and runs the game balance simulation.

// Wait for the game to be ready
window.addEventListener('load', () => {
  console.log('Balance tester agent loaded.');
  runBalanceTest();
});

async function runBalanceTest() {
  try {
    console.log('Running balance test...');
    const modulePath = 'modules/golden.module.json';
    const res = await fetch(modulePath);
    const moduleData = await res.json();
    applyModule(moduleData);
    console.log('Balance test checkpoint: module loaded');

    // Create a party
    party.push(makeMember('player1', 'Test Player', 'Wanderer'));
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
          await move(dx, dy);
          stats.pathDistance += Math.abs(dx) + Math.abs(dy);
          return;
        }
        if (agent.job) {
          const p = PathQueue.pathFor(agent.job);
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
          agent.job = PathQueue.queue(map, { x: px, y: py }, agent.goal, leader.id);
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

    // Log the results to the page so puppeteer can grab them
    const resultsEl = document.createElement('div');
    resultsEl.id = 'results';
    resultsEl.textContent = JSON.stringify(stats, null, 2);
    document.body.appendChild(resultsEl);
  } catch (err) {
    console.error('Balance test error:', err);
    throw err;
  }
}
