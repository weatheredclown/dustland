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
    list.forEach(cfg => {
      if (!cfg || !Array.isArray(cfg.waves) || !cfg.waves.length) return;
      const arenaMap = cfg.map;
      if (!arenaMap) return;
      const bankId = cfg.bankId || arenaMap;
      const enemyBanksRef = globalThis.enemyBanks;
      if (!enemyBanksRef) return;
      const state = { wave: 0, engaged: false, pending: false, cleared: false };

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
        state.engaged = true;
        state.pending = false;
        state.currentId = wave.templateId;
        globalThis.Dustland?.actions?.startCombat?.(enemy);
      }

      function queueWaveStart(delay = 0) {
        if (state.pending || state.engaged || state.cleared) return;
        if (globalThis.state?.map !== arenaMap) return;
        state.pending = true;
        ensureBank(state.wave);
        const timer = setTimeout(() => {
          state.pending = false;
          if (globalThis.state?.map !== arenaMap || state.engaged || state.cleared) return;
          startWave(state.wave);
        }, Math.max(0, delay));
        timers.push(timer);
      }

      function resetArena() {
        state.wave = 0;
        state.pending = false;
        state.engaged = false;
        state.cleared = false;
        ensureBank(0);
      }

      ensureBank(0);

      const movementHandler = payload => {
        if (!payload || payload.map !== arenaMap) return;
        if (state.cleared) return;
        queueWaveStart();
      };

      const combatHandler = ({ result }) => {
        if (!state.engaged) return;
        state.engaged = false;
        if (result === 'loot') {
          state.wave += 1;
          if (state.wave < cfg.waves.length) {
            if (typeof globalThis.log === 'function') globalThis.log(`The arena shifts. Prepare for wave ${state.wave + 1}.`);
            queueWaveStart(600);
          } else {
            state.cleared = true;
            ensureBank(-1);
            if (cfg.reward?.log && typeof globalThis.log === 'function') globalThis.log(cfg.reward.log);
            if (cfg.reward?.toast && typeof globalThis.toast === 'function') globalThis.toast(cfg.reward.toast);
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
  function setup(moduleData) {
    teardown();
    if (!moduleData) return;
    const behaviors = moduleData.behaviors || {};
    setupStepUnlocks(behaviors.stepUnlocks);
    setupArenas(behaviors.arenas, moduleData);
    setupMemoryTapes(behaviors.memoryTapes);
    setupDialogMutations(behaviors.dialogMutations);
  }

  dl.behaviors = { setup, teardown };
})();
