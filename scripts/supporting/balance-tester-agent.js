/// <reference types="node" />
// This script is loaded into balance-tester.html and runs the game balance simulation.
const runtimeGlobal = globalThis;
const bindings = runtimeGlobal;
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
        runtimeGlobal.window = w;
        runtimeGlobal.document = w.document;
        runtimeGlobal.location = w.location;
        w.requestAnimationFrame = () => { };
        runtimeGlobal.requestAnimationFrame = w.requestAnimationFrame;
        w.NanoDialog = { init: () => { } };
        runtimeGlobal.NanoDialog = w.NanoDialog;
        w.AudioContext = function () { };
        w.webkitAudioContext = w.AudioContext;
        w.Audio = function () { return { cloneNode: () => ({ play: () => ({ catch: () => { } }), pause: () => { } }) }; };
        runtimeGlobal.Audio = w.Audio;
        runtimeGlobal.EventBus = { on: () => { }, off: () => { }, emit: () => { } };
        runtimeGlobal.TS = 16;
        runtimeGlobal.camX = 0;
        runtimeGlobal.camY = 0;
        runtimeGlobal.interactAt = () => false;
        w.HTMLCanvasElement.prototype.getContext = () => ({
            drawImage: () => { },
            clearRect: () => { },
            getImageData: () => ({ data: [] }),
            putImageData: () => { }
        });
        const store = { dustland_crt: '{}' };
        Object.defineProperty(w, 'localStorage', {
            value: {
                getItem: (k) => store[k],
                setItem: (k, v) => { store[k] = String(v); },
                removeItem: (k) => { delete store[k]; }
            }
        });
        runtimeGlobal.localStorage = w.localStorage;
        runtimeGlobal.showStart = () => { };
        runtimeGlobal.openCreator = () => { };
        runtimeGlobal.bootMap = () => { };
        runtimeGlobal.draw = () => { };
        runtimeGlobal.runTests = () => { };
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
        runtimeGlobal.NanoDialog = w.NanoDialog;
        await runBalanceTest();
    })().catch(err => {
        console.error('Balance test error:', err);
        process.exit(1);
    });
}
else {
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
        }
        else {
            const fs = await import('node:fs/promises');
            const path = await import('node:path');
            const json = await fs.readFile(path.join(process.cwd(), modulePath), 'utf8');
            moduleData = JSON.parse(json);
        }
        applyModule(moduleData);
        console.log('Balance test checkpoint: module loaded');
        const party = bindings.party;
        const makeMemberFn = bindings.makeMember;
        if (!party || !makeMemberFn) {
            throw new Error('Dustland party API unavailable');
        }
        const setLeaderFn = bindings.setLeader;
        const setPartyPosFn = bindings.setPartyPos;
        const setMapFn = bindings.setMap;
        const takeNearestItemFn = bindings.takeNearestItem;
        const interactFn = bindings.interact;
        const startCombatFn = bindings.startCombat;
        const mapIdForStateFn = bindings.mapIdForState;
        const findRandomGoalFn = bindings.findRandomGoal;
        const queryTileFn = bindings.queryTile;
        const isAdjacentFn = bindings.isAdjacent;
        const dustland = bindings.Dustland;
        // Create a party
        party.addMember(makeMemberFn('player1', 'Test Player', 'Wanderer'));
        setLeaderFn?.(0);
        setPartyPosFn?.(2, 2);
        setMapFn?.('world', 'Test');
        console.log('Balance test checkpoint: party ready');
        const agent = {
            goal: null,
            path: [],
            job: null,
            think: async () => {
                // 1. Attack monsters
                const nearbyMonster = findNearbyMonster();
                if (nearbyMonster) {
                    const result = startCombatFn ? await startCombatFn(nearbyMonster) : null;
                    if (result?.result === 'loot') {
                        stats.monstersDefeated++;
                    }
                    else if (result?.result === 'bruise') {
                        stats.combatLost++;
                    }
                    return;
                }
                // 2. Grab items or use doors
                if (takeNearestItemFn?.({}))
                    return;
                const nearbyDoor = findNearbyDoor();
                if (nearbyDoor) {
                    interactFn?.();
                    return;
                }
                // 3. Talk to NPCs
                const nearbyNPC = findNearbyNPC();
                if (nearbyNPC) {
                    interactFn?.();
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
                    await dustland?.movement?.move?.(dx, dy);
                    stats.pathDistance += Math.abs(dx) + Math.abs(dy);
                    return;
                }
                if (agent.job) {
                    const nextPath = dustland?.path?.pathFor?.(agent.job);
                    if (nextPath) {
                        agent.path = nextPath.slice(1);
                        agent.job = null;
                    }
                    return;
                }
                const map = mapIdForStateFn?.();
                if (!map)
                    return;
                const target = findRandomGoalFn?.(map, agent.goal) ?? findRandomGoal(map, agent.goal);
                if (target) {
                    agent.goal = target;
                    agent.job = dustland?.path?.queue?.(map, { x: px, y: py }, agent.goal, leader.id) ?? null;
                }
            }
        };
        function findNearbyMonster() {
            if (!isAdjacentFn || !party.length)
                return null;
            const playerPos = { x: party[0].x, y: party[0].y };
            const npcs = bindings.NPCS ?? [];
            for (const npc of npcs) {
                if (npc.combat && isAdjacentFn(playerPos, npc)) {
                    return npc;
                }
            }
            return null;
        }
        function findNearbyNPC() {
            if (!isAdjacentFn || !party.length)
                return null;
            const playerPos = { x: party[0].x, y: party[0].y };
            const npcs = bindings.NPCS ?? [];
            for (const npc of npcs) {
                if (!npc.combat && isAdjacentFn(playerPos, npc)) {
                    return npc;
                }
            }
            return null;
        }
        function findNearbyDoor() {
            if (!queryTileFn)
                return false;
            const doorTile = bindings.TILE?.DOOR;
            const dirs = [
                [0, 0],
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1]
            ];
            for (const [dx, dy] of dirs) {
                const info = queryTileFn(party.x + dx, party.y + dy);
                if (!info?.walkable)
                    continue;
                const hasDoorEntity = Array.isArray(info.entities) && info.entities.some(e => e.type === 'door');
                if (hasDoorEntity || (doorTile !== undefined && info.tile === doorTile)) {
                    return true;
                }
            }
            return false;
        }
        function findRandomGoal(map, avoid) {
            const candidates = [];
            const npcs = bindings.NPCS ?? [];
            for (const npc of npcs) {
                if (!npc.combat && npc.map === map) {
                    const adj = findAdjacentWalkableTile(map, npc);
                    candidates.push(adj);
                }
            }
            const itemDrops = bindings.itemDrops ?? [];
            for (const it of itemDrops) {
                if (it.map === map)
                    candidates.push({ x: it.x, y: it.y });
            }
            const buildings = bindings.buildings ?? [];
            for (const b of buildings) {
                if (b.doorX != null && b.doorY != null && !b.boarded && (b.map == null || b.map === map)) {
                    candidates.push({ x: b.doorX, y: b.doorY });
                }
            }
            const filtered = candidates.filter(c => !(avoid && c.x === avoid.x && c.y === avoid.y));
            if (!filtered.length)
                return null;
            return filtered[Math.floor(Math.random() * filtered.length)];
        }
        function isAdjacent(pos1, pos2) {
            const dx = Math.abs(pos1.x - pos2.x);
            const dy = Math.abs(pos1.y - pos2.y);
            return dx <= 1 && dy <= 1;
        }
        function findAdjacentWalkableTile(map, pos) {
            if (!queryTileFn)
                return { x: pos.x, y: pos.y };
            const dirs = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];
            for (const d of dirs) {
                const info = queryTileFn(pos.x + d.x, pos.y + d.y, map);
                if (info?.walkable)
                    return { x: pos.x + d.x, y: pos.y + d.y };
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
        const eventBus = bindings.EventBus;
        eventBus?.on?.('xp:gained', ({ amount }) => {
            stats.experienceGained += amount ?? 0;
        });
        eventBus?.on?.('character:leveled-up', () => {
            stats.levelsAdvanced++;
        });
        eventBus?.on?.('quest:completed', () => {
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
    }
    catch (err) {
        console.error('Balance test error:', err);
        throw err;
    }
}
