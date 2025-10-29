// ===== Module Behaviors =====
(() => {
  type ModuleBehaviorGlobals = GlobalThis & {
    Dustland?: DustlandNamespace;
    DustlandGlobals?: DustlandGlobalHelpers;
    EventBus?: DustlandEventBus;
    eventBus?: DustlandEventBus;
    portals?: DustlandPortal[];
    setTile?: (map: string, x: number, y: number, tile: number) => void;
    setMap?: (map: string, label?: string) => unknown;
    log?: (message: string) => void;
    toast?: (message: string) => void;
    flagValue?: (flag: string) => number;
    countItems?: (idOrTag: string) => number;
    hasItem?: (idOrTag: string) => boolean;
    party?: Party;
    NPCS?: DustlandNpc[];
    state?: (DustlandCoreState & {
      arenas?: Record<string, DustlandBehaviorArenaState | undefined>;
    }) | null;
    enemyBanks?: DustlandEnemyBanks;
    gridFromEmoji?: (rows: string[]) => number[][];
    WORLD_W?: number;
    WORLD_H?: number;
    TILE?: Record<string, number>;
  };

  const scope = globalThis as unknown as ModuleBehaviorGlobals;

  const ensureDustland = (): DustlandNamespace => {
    if (scope.DustlandGlobals?.ensureDustland) {
      return scope.DustlandGlobals.ensureDustland();
    }
    if (!scope.Dustland) {
      scope.Dustland = {} as DustlandNamespace;
    }
    return scope.Dustland;
  };

  const dl = ensureDustland();
  const cleanupTasks: Array<() => void> = [];
  const timers: ReturnType<typeof setTimeout>[] = [];

  const registerCleanup = (fn: () => void): void => {
    cleanupTasks.push(fn);
  };

  const clearTimers = (): void => {
    while (timers.length) {
      const id = timers.pop();
      if (id != null) {
        clearTimeout(id);
      }
    }
  };

  const teardown = (): void => {
    clearTimers();
    while (cleanupTasks.length) {
      const fn = cleanupTasks.pop();
      if (!fn) continue;
      try {
        fn();
      } catch (err) {
        console.error('Behavior cleanup failed', err);
      }
    }
  };

  const resolveTileId = (tile: number | string | undefined): number => {
    if (typeof tile === 'number' && Number.isFinite(tile)) {
      return tile;
    }
    const tileMap = scope.TILE ?? {};
    if (typeof tile === 'string') {
      const key = tile.toUpperCase();
      if (Object.prototype.hasOwnProperty.call(tileMap, key)) {
        return tileMap[key] ?? 0;
      }
    }
    return tileMap.DOOR ?? 0;
  };

  const ensurePortal = (cfg: DustlandStepUnlockBehavior): void => {
    if (!cfg.portal || !Array.isArray(scope.portals)) return;
    const { toMap, toX, toY } = cfg.portal;
    if (!cfg.map || typeof cfg.x !== 'number' || typeof cfg.y !== 'number') return;
    if (!toMap || typeof toX !== 'number' || typeof toY !== 'number') return;
    const exists = scope.portals.some(
      portal =>
        portal.map === cfg.map &&
        portal.x === cfg.x &&
        portal.y === cfg.y &&
        portal.toMap === toMap &&
        portal.toX === toX &&
        portal.toY === toY
    );
    if (!exists) {
      scope.portals.push({ map: cfg.map, x: cfg.x, y: cfg.y, toMap, toX, toY });
    }
  };

  const getEventBus = (): DustlandEventBus | undefined =>
    dl.eventBus ?? scope.eventBus ?? scope.EventBus;

  const setupStepUnlocks = (list: DustlandStepUnlockBehavior[] | null | undefined): void => {
    if (!Array.isArray(list) || list.length === 0) return;
    const bus = getEventBus();
    if (!bus?.on || !bus?.off) return;
    list.forEach(cfg => {
      if (!cfg) return;
      const mapId = cfg.map ?? 'world';
      const stepsReq = Math.max(1, Number.isFinite(cfg.steps) ? Number(cfg.steps) : 1);
      const tileId = resolveTileId(cfg.tile);
      let steps = 0;
      const handler: DustlandEventHandler<'sfx'> = id => {
        if (id !== 'step') return;
        if (scope.state?.map !== mapId) return;
        steps += 1;
        if (steps < stepsReq) return;
        if (typeof scope.setTile === 'function' && typeof cfg.x === 'number' && typeof cfg.y === 'number') {
          scope.setTile(mapId, cfg.x, cfg.y, tileId);
        }
        ensurePortal(cfg);
        if (cfg.log && typeof scope.log === 'function') scope.log(cfg.log);
        if (cfg.toast && typeof scope.toast === 'function') scope.toast(cfg.toast);
        bus.off('sfx', handler);
      };
      bus.on('sfx', handler);
      registerCleanup(() => bus.off('sfx', handler));
    });
  };

  const adjustDefense = (enemy: { DEF?: number }, delta: number): void => {
    if (!enemy || typeof delta !== 'number') return;
    const current = typeof enemy.DEF === 'number' ? enemy.DEF : 0;
    enemy.DEF = Math.max(0, current + delta);
  };

  const hasUpgrade = (ids: string | string[] | undefined): boolean => {
    if (!ids) return false;
    const targets = Array.isArray(ids) ? ids : [ids];
    const roster = Array.isArray(scope.party) ? scope.party : [];
    for (const id of targets) {
      if (!id) continue;
      for (const member of roster) {
        const slots = member?.equip;
        if (!slots) continue;
        if (slots.weapon?.id === id || slots.armor?.id === id || slots.trinket?.id === id) {
          return true;
        }
      }
      if (typeof scope.countItems === 'function' && scope.countItems(id) > 0) return true;
      if (typeof scope.hasItem === 'function' && scope.hasItem(id)) return true;
    }
    return false;
  };

  type ArenaState = {
    wave: number;
    engaged: boolean;
    pending: boolean;
    cleared: boolean;
    currentId?: string;
  };

  const setupArenas = (
    list: DustlandArenaConfig[] | null | undefined,
    moduleData: DustlandModuleInstance | null | undefined
  ): void => {
    if (!Array.isArray(list) || list.length === 0) return;
    const bus = getEventBus();
    if (!bus?.on || !bus?.off) return;
    const enemyBanksRef = scope.enemyBanks;
    if (!enemyBanksRef) return;

    const rosterState = (typeof scope.state === 'object' && scope.state) ? scope.state : null;
    const arenaStore = rosterState ? (rosterState.arenas ??= {}) : null;

    const findTemplate = (templateId?: string): DustlandNpc | null => {
      if (!templateId) return null;
      const templates = moduleData?.templates;
      if (!Array.isArray(templates)) return null;
      return (templates.find(t => t?.id === templateId) as DustlandNpc | undefined) ?? null;
    };

    list.forEach((cfg, index) => {
      if (!cfg || !Array.isArray(cfg.waves) || cfg.waves.length === 0) return;
      const arenaMap = cfg.map;
      if (!arenaMap) return;
      const bankId = cfg.bankId || arenaMap;
      const arenaKey = `${arenaMap}:${cfg.bankId ?? ''}:${index}`;
      const saved = arenaStore?.[arenaKey];
      const arenaState: ArenaState = {
        wave: 0,
        engaged: false,
        pending: false,
        cleared: false
      };
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

      const persistArenaState = (): void => {
        if (!arenaStore || !rosterState) return;
        if (!arenaState.cleared && arenaState.wave <= 0) {
          delete arenaStore[arenaKey];
          if (Object.keys(arenaStore).length === 0) delete rosterState.arenas;
          return;
        }
        arenaStore[arenaKey] = { wave: arenaState.wave, cleared: arenaState.cleared };
      };

      const ensureBank = (waveIndex: number): void => {
        const bank = enemyBanksRef[bankId] ?? (enemyBanksRef[bankId] = []);
        bank.length = 0;
        if (waveIndex >= 0 && cfg.waves[waveIndex]) {
          const wave = cfg.waves[waveIndex];
          const entry: DustlandEnemyBankEntry = {
            templateId: wave.templateId,
            count: wave.count ?? 1
          };
          if (wave.bankChallenge != null) entry.challenge = wave.bankChallenge;
          bank.push(entry);
        }
      };

      const buildEnemy = (
        wave: DustlandArenaWave
      ): (CombatParticipant & { DEF?: number; count?: number; xp?: number; challenge?: number }) | null => {
        const template = findTemplate(wave.templateId);
        if (!template) return null;
        const combat = template.combat ? JSON.parse(JSON.stringify(template.combat)) : {};
        return {
          id: template.id,
          name: template.name ?? 'Enemy',
          portraitSheet: template.portraitSheet,
          portraitLock: template.portraitLock,
          ...(combat as Record<string, unknown>)
        } as CombatParticipant & { DEF?: number; count?: number; xp?: number; challenge?: number };
      };

      const applyVulnerability = (
        wave: DustlandArenaWave,
        enemy: Record<string, unknown> & { DEF?: number }
      ): void => {
        const vulnerability = wave.vulnerability;
        if (!vulnerability || !enemy) return;
        const has = vulnerability.items ? hasUpgrade(vulnerability.items) : false;
        if (has) {
          if (typeof vulnerability.matchDef === 'number') adjustDefense(enemy, vulnerability.matchDef);
          const matchMod = vulnerability.defMod?.match;
          if (typeof matchMod === 'number') adjustDefense(enemy, matchMod);
          if (vulnerability.successLog && typeof scope.log === 'function') {
            scope.log(vulnerability.successLog);
          }
        } else {
          if (typeof vulnerability.missDef === 'number') adjustDefense(enemy, vulnerability.missDef);
          const missMod = vulnerability.defMod?.miss;
          if (typeof missMod === 'number') adjustDefense(enemy, missMod);
          if (vulnerability.failLog && typeof scope.log === 'function') {
            scope.log(vulnerability.failLog);
          }
        }
      };

      const startWave = (waveIndex: number): void => {
        const wave = cfg.waves?.[waveIndex];
        if (!wave) return;
        const enemy = buildEnemy(wave);
        if (!enemy) return;
        ensureBank(waveIndex);
        enemy.count = wave.count ?? 1;
        if (wave.prompt) (enemy as { prompt?: string }).prompt = wave.prompt;
        applyVulnerability(wave, enemy);
        if (wave.announce && typeof scope.log === 'function') scope.log(wave.announce);
        if (wave.toast && typeof scope.toast === 'function') scope.toast(wave.toast);
        arenaState.engaged = true;
        arenaState.pending = false;
        arenaState.currentId = wave.templateId;
        dl.actions?.startCombat?.(enemy);
      };

      const queueWaveStart = (delay = 0): void => {
        if (arenaState.pending || arenaState.engaged || arenaState.cleared) return;
        if (scope.state?.map !== arenaMap) return;
        arenaState.pending = true;
        ensureBank(arenaState.wave);
        const timer = setTimeout(() => {
          arenaState.pending = false;
          if (scope.state?.map !== arenaMap || arenaState.engaged || arenaState.cleared) return;
          startWave(arenaState.wave);
        }, Math.max(0, delay));
        timers.push(timer);
      };

      const resetArena = (): void => {
        arenaState.wave = 0;
        arenaState.pending = false;
        arenaState.engaged = false;
        arenaState.cleared = false;
        ensureBank(0);
        persistArenaState();
      };

      if (arenaState.cleared) {
        ensureBank(-1);
      } else {
        ensureBank(arenaState.wave);
      }
      persistArenaState();

      const movementHandler: DustlandEventHandler<'movement:player'> = payload => {
        if (!payload || payload.map !== arenaMap) return;
        if (arenaState.cleared) return;
        queueWaveStart();
      };

      const combatHandler: DustlandEventHandler<'combat:ended'> = payload => {
        const result = (payload?.result as CombatOutcome | string | null | undefined) ?? null;
        if (!arenaState.engaged) return;
        arenaState.engaged = false;
        if (result === 'loot') {
          arenaState.wave += 1;
          if (arenaState.wave < (cfg.waves?.length ?? 0)) {
            if (typeof scope.log === 'function') {
              scope.log(`The arena shifts. Prepare for wave ${arenaState.wave + 1}.`);
            }
            persistArenaState();
            queueWaveStart(600);
          } else {
            arenaState.cleared = true;
            arenaState.wave = cfg.waves?.length ?? arenaState.wave;
            ensureBank(-1);
            if (cfg.reward?.log && typeof scope.log === 'function') scope.log(cfg.reward.log);
            if (cfg.reward?.toast && typeof scope.toast === 'function') scope.toast(cfg.reward.toast);
            persistArenaState();
          }
        } else {
          resetArena();
          if (cfg.resetLog && typeof scope.log === 'function') scope.log(cfg.resetLog);
        }
      };

      bus.on('movement:player', movementHandler);
      bus.on('combat:ended', combatHandler);
      registerCleanup(() => bus.off('movement:player', movementHandler));
      registerCleanup(() => bus.off('combat:ended', combatHandler));

      if (scope.state?.map === arenaMap) {
        queueWaveStart(cfg.entranceDelay ?? 0);
      }
    });
  };

  const setupMemoryTapes = (list: DustlandMemoryTapeBehavior[] | null | undefined): void => {
    if (!Array.isArray(list) || list.length === 0) return;
    const roster = Array.isArray(scope.NPCS) ? scope.NPCS : [];
    list.forEach(cfg => {
      if (!cfg?.npcId) return;
      const npc = roster.find(n => n?.id === cfg.npcId);
      if (!npc) return;
      const base = npc.onMemoryTape ?? null;
      npc.onMemoryTape = (msg: string | null): void => {
        if (cfg.log && typeof scope.log === 'function') {
          scope.log(cfg.log.replace('{{msg}}', msg ?? ''));
        } else if (cfg.logPrefix && typeof scope.log === 'function') {
          scope.log(cfg.logPrefix + (msg ?? ''));
        }
        if (typeof base === 'function') base.call(npc, msg);
      };
      registerCleanup(() => {
        npc.onMemoryTape = base ?? undefined;
      });
    });
  };

  const checkCondition = (cond?: DustlandBehaviorCondition): boolean => {
    if (!cond) return true;
    if (cond.type === 'npcExists') {
      return Array.isArray(scope.NPCS) && scope.NPCS.some(n => n?.id === cond.npcId);
    }
    if (cond.type === 'flag') {
      if (typeof scope.flagValue !== 'function') return false;
      const flagId = cond.flag as string;
      const value = scope.flagValue(flagId) ?? 0;
      const target = typeof cond.value === 'number' ? cond.value : 0;
      const op = typeof cond.op === 'string' ? cond.op : '>=';
      switch (op) {
        case '>=':
          return value >= target;
        case '>':
          return value > target;
        case '<=':
          return value <= target;
        case '<':
          return value < target;
        case '==':
        case '=':
          return value === target;
        case '!=':
          return value !== target;
        default:
          return false;
      }
    }
    return false;
  };

  const setupDialogMutations = (list: DustlandDialogMutation[] | null | undefined): void => {
    if (!Array.isArray(list) || list.length === 0) return;
    const roster = Array.isArray(scope.NPCS) ? scope.NPCS : [];
    list.forEach(cfg => {
      if (!cfg?.npcId || !cfg.nodeId) return;
      const npc = roster.find(n => n?.id === cfg.npcId);
      if (!npc || !npc.tree) return;
      const baseProcess = typeof npc.processNode === 'function' ? npc.processNode.bind(npc) : null;
      npc.processNode = (nodeId: string): void => {
        if (nodeId === cfg.nodeId) {
          const node = (npc.tree as Record<string, DustlandDialogNode | undefined>)?.[nodeId];
          if (node) {
            const variant = (cfg.variants ?? []).find(v => checkCondition(v.condition));
            const text = variant?.text ?? cfg.defaultText;
            if (typeof text === 'string') {
              (node as DustlandDialogNode).text = text;
            }
          }
        }
        if (baseProcess) baseProcess(nodeId);
      };
      registerCleanup(() => {
        npc.processNode = baseProcess ?? undefined;
      });
    });
  };

  interface PortalLayoutInterior {
    id?: string;
    w?: number;
    h?: number;
    grid?: unknown;
    entryX?: number;
    entryY?: number;
    [key: string]: unknown;
  }

  interface PortalLayoutInfo {
    id: string;
    w: number;
    h: number;
    entryX: number;
    entryY: number;
    grid: number[][];
  }

  const setupPortalLayout = (moduleData: DustlandModuleInstance | null | undefined): void => {
    const props = (moduleData?.props ?? {}) as { portalLayout?: unknown };
    if (!props.portalLayout) return;
    const startMap = moduleData?.start?.map;
    if (!startMap) return;
    const portalList = Array.isArray(moduleData?.portals) ? moduleData.portals : [];
    if (!portalList.length) return;

    const interiors = new Map<string, PortalLayoutInfo>();
    const toEmojiGrid = scope.gridFromEmoji;
    const interiorDefs = (moduleData?.interiors ?? []) as PortalLayoutInterior[];
    interiorDefs.forEach(def => {
      if (!def?.id) return;
      let grid = def.grid;
      if (Array.isArray(grid) && grid.length && typeof grid[0] === 'string') {
        grid = typeof toEmojiGrid === 'function'
          ? toEmojiGrid(grid as string[])
          : (grid as string[]).map(row => Array.from(row).map(() => scope.TILE?.FLOOR ?? 7));
      } else if (Array.isArray(grid)) {
        grid = (grid as number[][]).map(row => Array.isArray(row) ? row.map(cell => Number(cell) || 0) : []);
      } else {
        grid = null;
      }
      const rows = Array.isArray(grid) ? (grid as number[][]) : null;
      const h = rows?.length ?? Math.max(0, Number(def.h) || 0);
      const w = rows?.[0]?.length ?? Math.max(0, Number(def.w) || 0);
      if (!w || !h) return;
      const entryX = typeof def.entryX === 'number' ? def.entryX : Math.floor(w / 2);
      const entryY = typeof def.entryY === 'number' ? def.entryY : Math.max(0, Math.min(h - 1, Math.floor(h / 2)));
      if (!rows) return;
      interiors.set(def.id, { id: def.id, w, h, entryX, entryY, grid: rows });
    });
    if (!interiors.size || !interiors.has(startMap)) return;

    const normalizePos = (info: PortalLayoutInfo | undefined, value: number | undefined, axis: 'x' | 'y'): number => {
      if (typeof value === 'number') return value;
      if (!info) return 0;
      return axis === 'x' ? info.entryX : info.entryY;
    };

    const edgeDirection = (
      info: PortalLayoutInfo | undefined,
      x?: number,
      y?: number
    ): { dx: number; dy: number } | null => {
      if (!info) return null;
      if (typeof x === 'number' && typeof y === 'number') {
        if (y <= 0) return { dx: 0, dy: -1 };
        if (y >= info.h - 1) return { dx: 0, dy: 1 };
        if (x <= 0) return { dx: -1, dy: 0 };
        if (x >= info.w - 1) return { dx: 1, dy: 0 };
      }
      return null;
    };

    const edges = new Map<string, Array<{ map: string; dir: { dx: number; dy: number }; fromX: number; fromY: number; toX: number; toY: number }>>();
    const pushEdge = (from: string, data: { map: string; dir: { dx: number; dy: number }; fromX: number; fromY: number; toX: number; toY: number }): void => {
      if (!edges.has(from)) edges.set(from, []);
      edges.get(from)?.push(data);
    };

    portalList.forEach(portal => {
      if (!portal?.map || !portal.toMap) return;
      const fromInfo = interiors.get(portal.map);
      const toInfo = interiors.get(portal.toMap);
      if (!fromInfo || !toInfo) return;
      const fromX = normalizePos(fromInfo, typeof portal.x === 'number' ? portal.x : undefined, 'x');
      const fromY = normalizePos(fromInfo, typeof portal.y === 'number' ? portal.y : undefined, 'y');
      const toX = normalizePos(toInfo, typeof portal.toX === 'number' ? portal.toX : undefined, 'x');
      const toY = normalizePos(toInfo, typeof portal.toY === 'number' ? portal.toY : undefined, 'y');
      let dir = edgeDirection(fromInfo, portal.x, portal.y);
      if (!dir) {
        const rev = edgeDirection(toInfo, portal.toX, portal.toY);
        if (rev) dir = { dx: -rev.dx, dy: -rev.dy };
      }
      if (!dir) return;
      pushEdge(portal.map, { map: portal.toMap, dir, fromX, fromY, toX, toY });
    });

    if (!edges.size) return;

    const placements = new Map<string, { x: number; y: number }>();
    placements.set(startMap, { x: 0, y: 0 });
    const queue: string[] = [startMap];
    while (queue.length) {
      const current = queue.shift();
      if (!current) continue;
      const basePos = placements.get(current);
      if (!basePos) continue;
      const adj = edges.get(current) ?? [];
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

    const worldW = Number(scope.WORLD_W) || 120;
    const worldH = Number(scope.WORLD_H) || 90;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
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
    const finalPlacement = new Map<string, { x: number; y: number }>();
    placements.forEach((pos, id) => {
      finalPlacement.set(id, { x: pos.x + offsetX, y: pos.y + offsetY });
    });

    const filler = typeof scope.TILE?.SAND === 'number' ? scope.TILE.SAND : 0;
    const rendered = new Set<string>();

    const renderRoom = (id: string): void => {
      if (!id || rendered.has(id)) return;
      const info = interiors.get(id);
      const origin = finalPlacement.get(id);
      if (!info || !origin) return;
      const grid = info.grid;
      if (!Array.isArray(grid)) return;
      if (typeof scope.setTile !== 'function') return;
      for (let yy = 0; yy < info.h; yy += 1) {
        for (let xx = 0; xx < info.w; xx += 1) {
          const wx = origin.x + xx;
          const wy = origin.y + yy;
          if (wx < 0 || wy < 0 || wx >= worldW || wy >= worldH) continue;
          scope.setTile('world', wx, wy, filler);
        }
      }
      for (let yy = 0; yy < info.h; yy += 1) {
        const row = grid[yy];
        if (!row) continue;
        for (let xx = 0; xx < info.w; xx += 1) {
          const tile = row[xx];
          if (tile == null) continue;
          const wx = origin.x + xx;
          const wy = origin.y + yy;
          if (wx < 0 || wy < 0 || wx >= worldW || wy >= worldH) continue;
          scope.setTile('world', wx, wy, tile);
        }
      }
      rendered.add(id);
    };

    const origSetMap = scope.setMap;
    if (!origSetMap) return;
    scope.setMap = function setMap(mapId: string, label?: string): unknown {
      const result = origSetMap.call(this, mapId, label);
      renderRoom(mapId);
      return result;
    };
    registerCleanup(() => {
      scope.setMap = origSetMap;
    });
    renderRoom(startMap);
  };

  const setup = (moduleData: DustlandModuleInstance | null | undefined): void => {
    teardown();
    if (!moduleData) return;
    const behaviors = (moduleData.behaviors ?? {}) as DustlandModuleBehaviors;
    setupStepUnlocks(behaviors.stepUnlocks);
    setupArenas(behaviors.arenas, moduleData);
    setupMemoryTapes(behaviors.memoryTapes);
    setupDialogMutations(behaviors.dialogMutations);
    setupPortalLayout(moduleData);
  };

  dl.behaviors = { setup, teardown };
})();
