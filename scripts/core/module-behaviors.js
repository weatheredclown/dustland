// ===== Module Behaviors =====
(function(){
  const dl = globalThis.Dustland = globalThis.Dustland || {};
  const cleanupTasks = [];
  const timers = [];

  function registerCleanup(fn) {
    if (typeof fn === 'function') cleanupTasks.push(fn);
  }

  function clearTimers() {
    while (timers.length) {
      const id = timers.pop();
      if (id) clearTimeout(id);
    }
  }

  function teardown() {
    clearTimers();
    while (cleanupTasks.length) {
      const fn = cleanupTasks.pop();
      try { fn(); } catch (err) { console.error('Behavior cleanup failed', err); }
    }
  }

  function resolveTileId(tile) {
    if (typeof tile === 'number') return tile;
    if (typeof tile === 'string' && globalThis.TILE) {
      const key = tile.toUpperCase();
      if (Object.prototype.hasOwnProperty.call(globalThis.TILE, key)) {
        return globalThis.TILE[key];
      }
    }
    return globalThis.TILE?.DOOR ?? 0;
  }

  function ensurePortal(cfg) {
    if (!cfg.portal || !Array.isArray(globalThis.portals)) return;
    const { toMap, toX, toY } = cfg.portal;
    if (!cfg.map || typeof cfg.x !== 'number' || typeof cfg.y !== 'number') return;
    if (!toMap || typeof toX !== 'number' || typeof toY !== 'number') return;
    const exists = globalThis.portals.some(p => p.map === cfg.map && p.x === cfg.x && p.y === cfg.y && p.toMap === toMap && p.toX === toX && p.toY === toY);
    if (!exists) {
      globalThis.portals.push({ map: cfg.map, x: cfg.x, y: cfg.y, toMap, toX, toY });
    }
  }

  function setupStepUnlocks(list = []) {
    if (!Array.isArray(list) || !list.length) return;
    const bus = dl.eventBus || globalThis.EventBus;
    if (!bus?.on) return;
    list.forEach(cfg => {
      const map = cfg.map;
      if (!map || typeof cfg.x !== 'number' || typeof cfg.y !== 'number') return;
      const stepsReq = Math.max(1, Number.isFinite(cfg.steps) ? cfg.steps : 1);
      const tileId = resolveTileId(cfg.tile);
      let steps = 0;
      const handler = id => {
        if (id !== 'step') return;
        if (globalThis.state?.map !== map) return;
        if (++steps < stepsReq) return;
        if (typeof globalThis.setTile === 'function') {
          globalThis.setTile(map, cfg.x, cfg.y, tileId);
        }
        ensurePortal(cfg);
        if (cfg.log && typeof globalThis.log === 'function') globalThis.log(cfg.log);
        if (cfg.toast && typeof globalThis.toast === 'function') globalThis.toast(cfg.toast);
        bus.off('sfx', handler);
      };
      bus.on('sfx', handler);
      registerCleanup(() => bus.off('sfx', handler));
    });
  }

  function findTemplate(moduleData, templateId) {
    if (!templateId) return null;
    const templates = moduleData?.templates;
    if (Array.isArray(templates)) {
      return templates.find(t => t && t.id === templateId) || null;
    }
    return null;
  }

  function adjustDefense(enemy, delta) {
    if (!enemy || typeof delta !== 'number') return;
    const current = typeof enemy.DEF === 'number' ? enemy.DEF : 0;
    enemy.DEF = Math.max(0, current + delta);
  }

  function hasUpgrade(ids) {
    if (!ids) return false;
    const list = Array.isArray(ids) ? ids : [ids];
    const roster = Array.isArray(globalThis.party) ? globalThis.party : [];
    for (const id of list) {
      if (!id) continue;
      for (const member of roster) {
        const slots = member?.equip;
        if (!slots) continue;
        if (slots.weapon?.id === id || slots.armor?.id === id || slots.trinket?.id === id) return true;
      }
      if (typeof globalThis.countItems === 'function' && globalThis.countItems(id) > 0) return true;
      if (typeof globalThis.hasItem === 'function' && globalThis.hasItem(id)) return true;
    }
    return false;
  }

  function setupArenas(list = [], moduleData) {
    if (!Array.isArray(list) || !list.length) return;
    const bus = dl.eventBus || globalThis.EventBus;
    if (!bus?.on) return;
    list.forEach((cfg, index) => {
      if (!cfg || !Array.isArray(cfg.waves) || !cfg.waves.length) return;
      const arenaMap = cfg.map;
      if (!arenaMap) return;
      const bankId = cfg.bankId || arenaMap;
      const enemyBanksRef = globalThis.enemyBanks;
      if (!enemyBanksRef) return;
      const globalState = (typeof globalThis.state === 'object' && globalThis.state) ? globalThis.state : null;
      const arenaStore = globalState ? (globalState.arenas ||= {}) : null;
      const arenaKey = `${arenaMap || 'arena'}:${cfg.bankId || ''}:${index}`;
      const saved = arenaStore ? arenaStore[arenaKey] : null;
      const arenaState = { wave: 0, engaged: false, pending: false, cleared: false };
      if (saved) {
        if (typeof saved.wave === 'number' && Number.isFinite(saved.wave)) {
          const clamped = Math.max(0, Math.min(cfg.waves.length, Math.floor(saved.wave)));
          arenaState.wave = clamped;
        }
        if (saved.cleared) {
          arenaState.cleared = true;
          arenaState.wave = cfg.waves.length;
        }
      }
      if (!arenaState.cleared && arenaState.wave >= cfg.waves.length) {
        arenaState.wave = cfg.waves.length;
        arenaState.cleared = true;
      }

      function persistArenaState() {
        if (!arenaStore || !globalState) return;
        if (!arenaState.cleared && arenaState.wave <= 0) {
          delete arenaStore[arenaKey];
          if (Object.keys(arenaStore).length === 0) delete globalState.arenas;
          return;
        }
        arenaStore[arenaKey] = { wave: arenaState.wave, cleared: !!arenaState.cleared };
      }

      function ensureBank(index) {
        const bank = enemyBanksRef[bankId] || (enemyBanksRef[bankId] = []);
        bank.length = 0;
        if (index >= 0 && cfg.waves[index]) {
          const wave = cfg.waves[index];
          const entry = { templateId: wave.templateId, count: wave.count ?? 1 };
          if (wave.bankChallenge) entry.challenge = wave.bankChallenge;
          bank.push(entry);
        }
      }

      function buildEnemy(wave) {
        const template = findTemplate(moduleData, wave.templateId);
        if (!template) return null;
        const combat = template.combat ? JSON.parse(JSON.stringify(template.combat)) : {};
        return {
          id: template.id,
          name: template.name,
          portraitSheet: template.portraitSheet,
          portraitLock: template.portraitLock,
          ...combat
        };
      }

      function applyVulnerability(wave, enemy) {
        const v = wave.vulnerability;
        if (!v || !enemy) return;
        const has = v.items ? hasUpgrade(v.items) : false;
        if (has) {
          if (typeof v.matchDef === 'number') adjustDefense(enemy, v.matchDef);
          if (v.defMod && typeof v.defMod.match === 'number') adjustDefense(enemy, v.defMod.match);
          if (typeof v.successLog === 'string' && typeof globalThis.log === 'function') globalThis.log(v.successLog);
        } else {
          if (typeof v.missDef === 'number') adjustDefense(enemy, v.missDef);
          if (v.defMod && typeof v.defMod.miss === 'number') adjustDefense(enemy, v.defMod.miss);
          if (typeof v.failLog === 'string' && typeof globalThis.log === 'function') globalThis.log(v.failLog);
        }
      }

      function startWave(index) {
        const wave = cfg.waves[index];
        if (!wave) return;
        const enemy = buildEnemy(wave);
        if (!enemy) return;
        ensureBank(index);
        enemy.count = wave.count ?? 1;
        if (wave.prompt) enemy.prompt = wave.prompt;
        applyVulnerability(wave, enemy);
        if (typeof wave.announce === 'string' && typeof globalThis.log === 'function') globalThis.log(wave.announce);
        if (typeof wave.toast === 'string' && typeof globalThis.toast === 'function') globalThis.toast(wave.toast);
        arenaState.engaged = true;
        arenaState.pending = false;
        arenaState.currentId = wave.templateId;
        globalThis.Dustland?.actions?.startCombat?.(enemy);
      }

      function queueWaveStart(delay = 0) {
        if (arenaState.pending || arenaState.engaged || arenaState.cleared) return;
        if (globalThis.state?.map !== arenaMap) return;
        arenaState.pending = true;
        ensureBank(arenaState.wave);
        const timer = setTimeout(() => {
          arenaState.pending = false;
          if (globalThis.state?.map !== arenaMap || arenaState.engaged || arenaState.cleared) return;
          startWave(arenaState.wave);
        }, Math.max(0, delay));
        timers.push(timer);
      }

      function resetArena() {
        arenaState.wave = 0;
        arenaState.pending = false;
        arenaState.engaged = false;
        arenaState.cleared = false;
        ensureBank(0);
        persistArenaState();
      }

      if (arenaState.cleared) {
        ensureBank(-1);
      } else {
        ensureBank(arenaState.wave);
      }
      persistArenaState();

      const movementHandler = payload => {
        if (!payload || payload.map !== arenaMap) return;
        if (arenaState.cleared) return;
        queueWaveStart();
      };

      const combatHandler = ({ result }) => {
        if (!arenaState.engaged) return;
        arenaState.engaged = false;
        if (result === 'loot') {
          arenaState.wave += 1;
          if (arenaState.wave < cfg.waves.length) {
            if (typeof globalThis.log === 'function') globalThis.log(`The arena shifts. Prepare for wave ${arenaState.wave + 1}.`);
            persistArenaState();
            queueWaveStart(600);
          } else {
            arenaState.cleared = true;
            arenaState.wave = cfg.waves.length;
            ensureBank(-1);
            if (cfg.reward?.log && typeof globalThis.log === 'function') globalThis.log(cfg.reward.log);
            if (cfg.reward?.toast && typeof globalThis.toast === 'function') globalThis.toast(cfg.reward.toast);
            persistArenaState();
          }
        } else {
          resetArena();
          if (cfg.resetLog && typeof globalThis.log === 'function') globalThis.log(cfg.resetLog);
        }
      };

      bus.on('movement:player', movementHandler);
      bus.on('combat:ended', combatHandler);
      registerCleanup(() => bus.off('movement:player', movementHandler));
      registerCleanup(() => bus.off('combat:ended', combatHandler));

      if (globalThis.state?.map === arenaMap) {
        queueWaveStart(cfg.entranceDelay ?? 0);
      }
    });
  }
  function setupMemoryTapes(list = []) {
    if (!Array.isArray(list) || !list.length) return;
    const roster = Array.isArray(globalThis.NPCS) ? globalThis.NPCS : [];
    list.forEach(cfg => {
      if (!cfg?.npcId) return;
      const npc = roster.find(n => n.id === cfg.npcId);
      if (!npc) return;
      const base = npc.onMemoryTape;
      npc.onMemoryTape = function (msg) {
        if (typeof cfg.log === 'string' && typeof globalThis.log === 'function') {
          globalThis.log(cfg.log.replace('{{msg}}', msg ?? ''));
        } else if (typeof cfg.logPrefix === 'string' && typeof globalThis.log === 'function') {
          globalThis.log(cfg.logPrefix + (msg ?? ''));
        }
        if (typeof base === 'function') base.call(this, msg);
      };
      registerCleanup(() => { npc.onMemoryTape = base; });
    });
  }

  function checkCondition(cond) {
    if (!cond) return true;
    switch (cond.type) {
      case 'npcExists':
        return Array.isArray(globalThis.NPCS) && globalThis.NPCS.some(n => n.id === cond.npcId);
      case 'flag': {
        if (typeof globalThis.flagValue !== 'function') return false;
        const value = globalThis.flagValue(cond.flag) || 0;
        const target = cond.value ?? 0;
        const op = cond.op || '>=';
        switch (op) {
          case '>=': return value >= target;
          case '>': return value > target;
          case '<=': return value <= target;
          case '<': return value < target;
          case '==':
          case '=': return value === target;
          case '!=': return value !== target;
        }
        return false;
      }
      default:
        return false;
    }
  }

  function setupDialogMutations(list = []) {
    if (!Array.isArray(list) || !list.length) return;
    const roster = Array.isArray(globalThis.NPCS) ? globalThis.NPCS : [];
    list.forEach(cfg => {
      if (!cfg?.npcId || !cfg.nodeId) return;
      const npc = roster.find(n => n.id === cfg.npcId);
      if (!npc || !npc.tree) return;
      const baseProcess = typeof npc.processNode === 'function' ? npc.processNode.bind(npc) : null;
      npc.processNode = function (nodeId) {
        if (nodeId === cfg.nodeId) {
          const node = this.tree?.[nodeId];
          if (node) {
            const variant = (cfg.variants || []).find(v => checkCondition(v.condition));
            const text = variant?.text ?? cfg.defaultText;
            if (typeof text === 'string') node.text = text;
          }
        }
        if (baseProcess) baseProcess(nodeId);
      };
      registerCleanup(() => { npc.processNode = baseProcess; });
    });
  }

  function setupPortalLayout(moduleData) {
    const flag = moduleData?.props?.portalLayout;
    if (!flag) return;
    const startMap = moduleData?.start?.map;
    if (!startMap) return;
    const portalList = Array.isArray(moduleData.portals) ? moduleData.portals : [];
    if (!portalList.length) return;
    const interiors = new Map();
    const toEmojiGrid = globalThis.gridFromEmoji;
    (moduleData.interiors || []).forEach(def => {
      if (!def?.id) return;
      let grid = def.grid;
      if (Array.isArray(grid) && typeof grid[0] === 'string') {
        grid = typeof toEmojiGrid === 'function' ? toEmojiGrid(grid) : grid.map(row => Array.from(row).map(() => globalThis.TILE?.FLOOR ?? 7));
      } else if (Array.isArray(grid)) {
        grid = grid.map(row => Array.from(row));
      } else {
        grid = null;
      }
      const h = grid?.length ?? Math.max(0, Number(def.h) || 0);
      const w = grid?.[0]?.length ?? Math.max(0, Number(def.w) || 0);
      if (!w || !h) return;
      const entryX = typeof def.entryX === 'number' ? def.entryX : Math.floor(w / 2);
      const entryY = typeof def.entryY === 'number' ? def.entryY : Math.max(0, Math.min(h - 1, Math.floor(h / 2)));
      interiors.set(def.id, { id: def.id, w, h, entryX, entryY, grid });
    });
    if (!interiors.size || !interiors.has(startMap)) return;

    function normalizePos(info, value, axis) {
      if (typeof value === 'number') return value;
      return axis === 'x' ? (typeof info.entryX === 'number' ? info.entryX : Math.floor(info.w / 2)) : (typeof info.entryY === 'number' ? info.entryY : Math.floor(info.h / 2));
    }

    function edgeDirection(info, x, y) {
      if (!info) return null;
      if (typeof x === 'number' && typeof y === 'number') {
        if (y <= 0) return { dx: 0, dy: -1 };
        if (y >= info.h - 1) return { dx: 0, dy: 1 };
        if (x <= 0) return { dx: -1, dy: 0 };
        if (x >= info.w - 1) return { dx: 1, dy: 0 };
      }
      return null;
    }

    const edges = new Map();
    function pushEdge(from, data) {
      if (!edges.has(from)) edges.set(from, []);
      edges.get(from).push(data);
    }

    portalList.forEach(portal => {
      if (!portal || !portal.map || !portal.toMap) return;
      if (!interiors.has(portal.map) || !interiors.has(portal.toMap)) return;
      const fromInfo = interiors.get(portal.map);
      const toInfo = interiors.get(portal.toMap);
      const fromX = normalizePos(fromInfo, portal.x, 'x');
      const fromY = normalizePos(fromInfo, portal.y, 'y');
      const toX = normalizePos(toInfo, portal.toX, 'x');
      const toY = normalizePos(toInfo, portal.toY, 'y');
      let dir = edgeDirection(fromInfo, portal.x, portal.y);
      if (!dir) {
        const rev = edgeDirection(toInfo, portal.toX, portal.toY);
        if (rev) dir = { dx: -rev.dx, dy: -rev.dy };
      }
      if (!dir) return;
      pushEdge(portal.map, { map: portal.toMap, dir, fromX, fromY, toX, toY });
    });

    if (!edges.size) return;

    const placements = new Map();
    placements.set(startMap, { x: 0, y: 0 });
    const queue = [startMap];
    while (queue.length) {
      const current = queue.shift();
      const basePos = placements.get(current);
      const adj = edges.get(current) || [];
      adj.forEach(edge => {
        if (!interiors.has(edge.map)) return;
        const next = placements.get(edge.map);
        const nx = basePos.x + edge.fromX - edge.toX + edge.dir.dx;
        const ny = basePos.y + edge.fromY - edge.toY + edge.dir.dy;
        if (!next) {
          placements.set(edge.map, { x: nx, y: ny });
          queue.push(edge.map);
        }
      });
    }

    if (!placements.size) return;

    const worldW = Number(globalThis.WORLD_W) || 120;
    const worldH = Number(globalThis.WORLD_H) || 90;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    placements.forEach((pos, id) => {
      const info = interiors.get(id);
      if (!info) return;
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + info.w - 1);
      maxY = Math.max(maxY, pos.y + info.h - 1);
    });
    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return;
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    if (!width || !height || width > worldW || height > worldH) return;
    const offsetX = Math.max(0, Math.floor((worldW - width) / 2) - minX);
    const offsetY = Math.max(0, Math.floor((worldH - height) / 2) - minY);
    const finalPlacement = new Map();
    placements.forEach((pos, id) => {
      finalPlacement.set(id, { x: pos.x + offsetX, y: pos.y + offsetY });
    });

    const filler = (globalThis.TILE && typeof globalThis.TILE.SAND === 'number') ? globalThis.TILE.SAND : 0;
    const rendered = new Set();

    function renderRoom(id) {
      if (!id || rendered.has(id)) return;
      const info = interiors.get(id);
      const origin = finalPlacement.get(id);
      if (!info || !origin || !Array.isArray(info.grid)) return;
      for (let yy = 0; yy < info.h; yy++) {
        for (let xx = 0; xx < info.w; xx++) {
          const wx = origin.x + xx;
          const wy = origin.y + yy;
          if (wx < 0 || wy < 0 || wx >= worldW || wy >= worldH) continue;
          if (typeof globalThis.setTile === 'function') globalThis.setTile('world', wx, wy, filler);
        }
      }
      for (let yy = 0; yy < info.h; yy++) {
        const row = info.grid[yy];
        if (!row) continue;
        for (let xx = 0; xx < info.w; xx++) {
          const tile = row[xx];
          if (tile == null) continue;
          const wx = origin.x + xx;
          const wy = origin.y + yy;
          if (wx < 0 || wy < 0 || wx >= worldW || wy >= worldH) continue;
          if (typeof globalThis.setTile === 'function') globalThis.setTile('world', wx, wy, tile);
        }
      }
      rendered.add(id);
    }

    const origSetMap = typeof globalThis.setMap === 'function' ? globalThis.setMap : null;
    if (!origSetMap) return;
    globalThis.setMap = function(mapId, label) {
      const result = origSetMap.apply(this, arguments);
      renderRoom(mapId);
      return result;
    };
    registerCleanup(() => { globalThis.setMap = origSetMap; });
    renderRoom(startMap);
  }
  function setup(moduleData) {
    teardown();
    if (!moduleData) return;
    const behaviors = moduleData.behaviors || {};
    setupStepUnlocks(behaviors.stepUnlocks);
    setupArenas(behaviors.arenas, moduleData);
    setupMemoryTapes(behaviors.memoryTapes);
    setupDialogMutations(behaviors.dialogMutations);
    setupPortalLayout(moduleData);
  }

  dl.behaviors = { setup, teardown };
})();
