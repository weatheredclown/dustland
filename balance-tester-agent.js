// This script is loaded into balance-tester.html and runs the game balance simulation.

// Wait for the game to be ready
window.addEventListener('load', () => {
  console.log('Balance tester agent loaded.');
  runBalanceTest();
});

async function runBalanceTest() {
  try {
    console.log('Running balance test...');
    // Boot world and load the golden module
    startWorld();
    console.log('Balance test checkpoint: world started');
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
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        move(randomDirection);
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

    console.log('Balance test checkpoint: loop start');
    let lastPartySize = party.length;
    const maxSteps = 5000;
    let steps = 0;

    while (party[0].level < 5 && steps < maxSteps) {
      await agent.think();
      if (party.length > lastPartySize) {
        stats.partyMembersAdded += party.length - lastPartySize;
      }
      lastPartySize = party.length;
      steps++;
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
