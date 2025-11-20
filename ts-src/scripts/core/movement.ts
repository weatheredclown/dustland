const { effects: Effects } = globalThis.Dustland || {};
var bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;
let combatActive = false;
bus?.on?.('combat:started', () => { combatActive = true; });
bus?.on?.('combat:ended', () => { combatActive = false; });

// active temporary stat modifiers
const buffs = [];              // 2c342c / 313831
const tileColors = {0:'#1e271d',1:'#313831',2:'#1573ff',3:'#203320',4:'#777777',5:'#304326',6:'#4d5f4d',7:'#233223',8:'#8bd98d',9:'#000000'};// 2B382B / 203320
let moveDelay = 0;
let encounterCooldown = 0;
let weatherSpeed = 1;
let encounterBias = null;
const activeMsgZones = new Set<any>();
let lastWeatherZone = null;
let prevWeather = null;
const WORLD_LOOT_DECAY_TURNS = 200;
let worldTurnCounter = 0;
const ESSENTIAL_SUPPLY_RESTOCKS = Object.freeze([
  { id: 'medkit', interval: 10, count: 1 },
  { id: 'water_flask', interval: 10, count: 1 }
]);
const essentialRestockState = new Map();
let essentialRestockCache = { module: null, data: null };
type ShopNpc = { id?: string; shop?: { inv?: unknown[] } | boolean };

function normalizePositiveInt(value, fallback){
  const base = Number.isFinite(value) ? value : fallback;
  if(!Number.isFinite(base)) return 1;
  return Math.max(1, Math.round(base));
}

function getEssentialRestockConfig(){
  const moduleNameRoot = globalThis.Dustland?.currentModule;
  const moduleName = typeof moduleNameRoot === 'string' ? moduleNameRoot : null;
  if(!moduleName) return null;
  if(essentialRestockCache.module !== moduleName){
    essentialRestockState.clear();
    const config = new Map();
    ESSENTIAL_SUPPLY_RESTOCKS.forEach(entry => {
      config.set(entry.id, {
        interval: normalizePositiveInt(entry.interval, 10),
        count: normalizePositiveInt(entry.count, 1),
        targets: new Map()
      });
    });
    const modules = globalThis.Dustland?.loadedModules as Record<string, { npcs?: unknown[] }> | undefined;
    const moduleData = modules?.[moduleName];
    const baseNpcs = Array.isArray(moduleData?.npcs) ? (moduleData.npcs as ShopNpc[]) : [];
    baseNpcs.forEach(baseNpc => {
      const shop = baseNpc?.shop && baseNpc.shop !== true ? baseNpc.shop : null;
      const inv = Array.isArray(shop?.inv) ? (shop.inv as Array<Record<string, unknown>>) : [];
      inv.forEach(entry => {
        const itemId = typeof entry?.id === 'string' ? entry.id : null;
        if(!itemId) return;
        const restock = config.get(itemId);
        if(!restock) return;
        if(!baseNpc.id) return;
        const normalizedEntry = (entry && typeof entry === 'object') ? entry : { id: itemId };
        restock.targets.set(baseNpc.id, { ...normalizedEntry, id: itemId });
      });
    });
    essentialRestockCache = { module: moduleName, data: config };
  }
  return essentialRestockCache.data;
}

function shopHasItem(shop, itemId){
  if(!shop || shop === true) return false;
  const inv = Array.isArray(shop.inv) ? shop.inv : [];
  return inv.some(entry => {
    if(!entry || entry.id !== itemId) return false;
    const count = Number.isFinite(entry.count) ? entry.count : 1;
    return count > 0;
  });
}

function restockEssentialSupplies(turn){
  const config = getEssentialRestockConfig();
  if(!config) return;
  const rosterRoot = (globalThis as typeof globalThis & { NPCS?: unknown[] }).NPCS;
  const roster = Array.isArray(rosterRoot) ? (rosterRoot as ShopNpc[]) : [];
  if(!roster.length) return;
  for(const [itemId, cfg] of config.entries()){
    if(!cfg) continue;
    const interval = Number.isFinite(cfg.interval) ? cfg.interval : 10;
    const lastTurn = essentialRestockState.has(itemId) ? essentialRestockState.get(itemId) : 0;
    if(turn - lastTurn < interval) continue;
    if(roster.some(npc => shopHasItem(npc?.shop, itemId))) continue;
    const targetIds = Array.from(cfg.targets?.keys() || []);
    if(!targetIds.length) continue;
    for(const npc of roster){
      if(!npc || !targetIds.includes(npc.id)) continue;
      const shop = npc.shop;
      if(!shop || shop === true) continue;
      if(!Array.isArray(shop.inv)) shop.inv = [];
      const baseEntry = cfg.targets.get(npc.id) || { id: itemId };
      const desired = Number.isFinite(baseEntry.count) ? baseEntry.count : cfg.count;
      const restockEntry = { ...baseEntry, id: itemId };
      restockEntry.count = normalizePositiveInt(desired, cfg.count);
      shop.inv.push(restockEntry);
      essentialRestockState.set(itemId, turn);
      break;
    }
  }
}

bus?.on?.('weather:change', w => {
  weatherSpeed = typeof w?.speedMod === 'number' ? w.speedMod : 1;
  encounterBias = w?.encounterBias || null;
});

const RANDOM_COMBAT_INPUT_LOCK_MS = 333;

function lockInput(ms = RANDOM_COMBAT_INPUT_LOCK_MS, key){
  const game = globalThis.Dustland || (globalThis.Dustland = {});
  const target = Date.now() + ms;
  const current = typeof game.inputLockUntil === 'number' ? game.inputLockUntil : 0;
  game.inputLockUntil = current > target ? current : target;
  game.inputLockKey = typeof key === 'string' ? key.toLowerCase() : null;
}

function getDropType(drop){
  if(!drop) return null;
  const type = typeof drop.dropType === 'string' ? drop.dropType : (drop.source === 'loot' ? 'loot' : 'world');
  return type;
}

function isLootDrop(drop){
  return getDropType(drop) === 'loot';
}

function markLootDropAges(beforeTurn){
  if(!Array.isArray(itemDrops) || !itemDrops.length) return;
  for(const drop of itemDrops){
    if(!isLootDrop(drop)) continue;
    if(!Number.isFinite(drop.worldTurn)) drop.worldTurn = beforeTurn;
  }
}

function decayWorldLoot(now){
  if(!Array.isArray(itemDrops) || !itemDrops.length) return;
  for(let i=itemDrops.length-1;i>=0;i--){
    const drop=itemDrops[i];
    if(!isLootDrop(drop)) continue;
    const born = Number.isFinite(drop.worldTurn) ? drop.worldTurn : (now - 1);
    if(now - born >= WORLD_LOOT_DECAY_TURNS){
      itemDrops.splice(i,1);
    }
  }
}

function advanceWorldTurn(){
  const before = worldTurnCounter;
  markLootDropAges(before);
  worldTurnCounter = before + 1;
  const now = worldTurnCounter;
  decayWorldLoot(now);
  if(globalThis.Dustland){
    globalThis.Dustland.worldTurns = now;
  }
  restockEssentialSupplies(now);
}

function zoneAttrs(map,x,y){
  let healMult = 1;
  let noEncounters = false;
  let spawns = null;
  let minSteps = null;
  let maxSteps = null;
  const zones = globalThis.Dustland?.zoneEffects || [];
  for(const z of zones){
    if(z.if && !globalThis.checkFlagCondition?.(z.if)) continue;
    if((z.map||'world')!==map) continue;
    if(x<z.x || y<z.y || x>=z.x+(z.w||0) || y>=z.y+(z.h||0)) continue;
    if(z.noEncounters) noEncounters = true;
    if(typeof z.healMult === 'number') healMult *= z.healMult;
    if(z.spawns) spawns = z.spawns;
    if(typeof z.minSteps === 'number') minSteps = z.minSteps;
    if(typeof z.maxSteps === 'number') maxSteps = z.maxSteps;
  }
  return { healMult, noEncounters, spawns, minSteps, maxSteps };
}

function hexToHsv(hex) {
    // 1. Convert Hex to RGB
    let r = 0, g = 0, b = 0;
    // Handle #RRGGBB format
    if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    } 
    // Handle #RGB format (shorthand)
    else if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else {
        // Invalid hex format
        return null; 
    }

    // Normalize RGB values to a 0-1 range
    r /= 255;
    g /= 255;
    b /= 255;

    // 2. Convert RGB to HSV
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Return HSV values, typically hue in [0, 360], saturation and value in [0, 100]
    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

function tileDelay(t, map=state.map){
  if(t===TILE.ROAD) return 0;
  if(map!=='world') return 100;
  const col=tileColors[t];
  if(!col) return 200;
  const brightness = hexToHsv(col)[2];
  const maxBright=26;
  const minBright=15;
  const pct = clamp(((brightness - minBright) / (maxBright - minBright)) * 100, 0, 100);
  const minDelay=100, maxDelay=500;
  const delay = minDelay + (pct/100)*(maxDelay-minDelay);
  return delay;
}

function calcMoveDelay(tile, actor, map=state.map){
  const base = tileDelay(tile, map);
  const agi = (actor?.stats?.AGI || 0) + (actor?._bonus?.AGI || 0);
  let adjusted = base - agi * 10;
  const delayMod = actor?._bonus?.move_delay_mod || 0;
  if (delayMod) adjusted *= Math.max(0, 1 - delayMod);
  adjusted *= weatherSpeed;
  return adjusted > 0 ? adjusted : 0;
}

// ===== Helpers =====
function mapIdForState(){ return state.map; }
function mapWH(map=state.map){
  if(map==='world') return {W:WORLD_W,H:WORLD_H};
  if(map==='creator') return {W:creatorMap.w||VIEW_W,H:creatorMap.h||VIEW_H};
  const I=interiors[map];
  return {W:(I&&I.w)||VIEW_W,H:(I&&I.h)||VIEW_H};
}
function gridFor(map){
  if(map==='world') return world;
  if(map==='creator') return creatorMap.grid;
  return interiors[map] && interiors[map].grid;
}
function getTile(map,x,y){
  const g=gridFor(map); if(!g) return null;
  if(y<0||x<0||y>=g.length||!g[0]||x>=g[0].length) return null;
  return g[y][x];
}
function setTile(map,x,y,t){
  const g=gridFor(map); if(!g) return false;
  if(y<0||x<0||y>=g.length||x>=g[0].length) return false;
  g[y][x]=t; return true;
}
function currentGrid(){ return gridFor(mapIdForState()); }
function queryTile(x,y,map=mapIdForState()){
  const tile=getTile(map,x,y);
  if(tile===null) return {tile:null, walkable:false, entities:[], items:[]};
  const entities=(typeof NPCS !== 'undefined' ? NPCS : []).filter(n=> n.map===map && n.x===x && n.y===y);
  const items=itemDrops.filter(it=> it.map===map && it.x===x && it.y===y);
  // doors allow passage when unlocked
  const blocking=entities.some(e=> !(e.door && !e.locked));
  // Ground items no longer block movement; allow walking onto item tiles
  const walkableFlag=!!(walkable[tile] && !blocking);
  return {tile, walkable:walkableFlag, entities, items};
}
// Find nearest free, walkable, unoccupied (and not water on world)
function findFreeDropTile(map,x,y){
  const {W,H}=mapWH(map);
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  const seen=new Set([x+','+y]);
  const q=[[x,y,0]];
  const MAX_RAD=50;
  while(q.length){
    const [cx,cy,d]=q.shift();
    if(d>MAX_RAD) break;
    if(cx>=0&&cy>=0&&cx<W&&cy<H){
      const info=queryTile(cx,cy,map);
      if(info.walkable) return {x:cx,y:cy};
    }
    for(const [dx,dy] of dirs){
      const nx=cx+dx, ny=cy+dy, nd=d+1, k=nx+','+ny;
      if(nx>=0&&ny>=0&&nx<W&&ny<H&&!seen.has(k) && nd<=MAX_RAD){ seen.add(k); q.push([nx,ny,nd]); }
    }
  }
  return {x,y};
}

function onEnter(map,x,y,ctx){
  const t = tileEvents.find(e => (e.map || 'world') === map && e.x === x && e.y === y);
  if (!t) {
    const wasInDustStorm = state.mapFlags && state.mapFlags.dustStorm;
    if (wasInDustStorm) {
      Effects.apply([{ effect: 'dustStorm', active: false }]);
      if(state.mapFlags) state.mapFlags.dustStorm = false;
    }
    return;
  }
  const events = Array.isArray(t.events) ? t.events : [];
  const list = events.filter(ev => ev?.when === 'enter');
  if(list.length) Effects.apply(list, ctx);

  const hasDustStorm = list.some(e => e.effect === 'dustStorm');
  if(state.mapFlags) state.mapFlags.dustStorm = hasDustStorm;
  if (!hasDustStorm) {
    Effects.apply([{ effect: 'dustStorm', active: false }]);
  }
}

function wait(){
  return move(0,0);
}

function hasItemOrEquipped(idOrTag){
  const tag = typeof idOrTag === 'string' ? idOrTag.toLowerCase() : '';
  if(typeof hasItem === 'function' && hasItem(idOrTag)) return true;
  if(typeof leader === 'function'){
    const l = leader();
    if(l && l.equip){
      for(const sl of ['weapon','armor','trinket']){
        const it = l.equip[sl];
        if(it && (it.id === idOrTag || (it.tags||[]).map(t=>t.toLowerCase()).includes(tag))) return true;
      }
    }
  }
  return false;
}

function applyZones(map,x,y){
  const zones = (globalThis.Dustland?.zoneEffects as unknown[]) || [];
  let weatherZone = null;
  for(const zRaw of zones){
    const z = zRaw as any;
    if(z.if && !globalThis.checkFlagCondition?.(z.if)) continue;
    if((z.map||'world')!==map) continue;
    if(x<z.x || y<z.y || x>=z.x+(z.w||0) || y>=z.y+(z.h||0)) continue;
    if(z.require && !hasItemOrEquipped(z.require)) continue;
    if(z.negate && hasItemOrEquipped(z.negate)) continue;
    if(z.weather) weatherZone = z;
    const step = z.perStep || z.step;
    if(step && typeof step.hp==='number'){
      const delta = step.hp;
      (party||[]).forEach(m=>{
        const max = typeof m.maxHp==='number'?m.maxHp:m.hp;
        m.hp = Math.max(0, Math.min(max, m.hp + delta));
      });
      renderParty?.(); updateHUD?.();
      const msg = typeof step.msg === 'string' ? step.msg : (delta>0? 'You feel better.' : 'You take damage.');
      log?.(msg);
      if(typeof toast==='function') toast(msg);
    }
  }
  if(weatherZone){
    if(lastWeatherZone !== weatherZone){
      if(!lastWeatherZone) prevWeather = globalThis.Dustland?.weather?.getWeather?.();
      const w = weatherZone.weather;
      globalThis.Dustland?.weather?.setWeather?.(typeof w === 'string' ? { state: w } : w);
      lastWeatherZone = weatherZone;
    }
  } else if(lastWeatherZone){
    if(prevWeather) globalThis.Dustland?.weather?.setWeather?.(prevWeather);
    lastWeatherZone = null;
  }
  if((party||[]).length && party.every(m=>m.hp<=0)){
    log?.('Your party collapses and wakes at the entrance.');
    if(typeof toast==='function') toast('Everyone is down!');
    if(state.mapEntry){
      const entry = state.mapEntry;
      if(typeof setMap==='function') setMap(entry.map);
      setPartyPos(entry.x, entry.y);
    }
    centerCamera?.(party.x, party.y, state.map);
    party?.healAll?.();
  }
}

function updateZoneMsgs(map,x,y){
  const zones = (globalThis.Dustland?.zoneEffects as unknown[]) || [];
  const current = [];
  for(const zRaw of zones){
    const z = zRaw as any;
    if(z.if && !globalThis.checkFlagCondition?.(z.if)) continue;
    if((z.map||'world')!==map) continue;
    if(x<z.x || y<z.y || x>=z.x+(z.w||0) || y>=z.y+(z.h||0)) continue;
    const step = z.perStep || z.step;
    if(!step || !step.msg) continue;
    const others = Object.keys(step).filter(k => k !== 'msg');
    if(others.length) continue;
    current.push(z);
    if(!activeMsgZones.has(z)){
      const msg = 'entering: ' + step.msg;
      log?.(msg);
      if(typeof toast==='function') toast(msg);
    }
  }
  for(const z of activeMsgZones){
    if(!current.includes(z)){
      const step = z.perStep || z.step;
      const msg = 'exiting: ' + (step?.msg || '');
      log?.(msg);
      if(typeof toast==='function') toast(msg);
    }
  }
  activeMsgZones.clear();
  current.forEach(z => activeMsgZones.add(z));
}

function applyStatusTicksOutOfCombat(actor){
  if(combatActive) return;
  const tick = typeof globalThis.tickStatuses === 'function' ? globalThis.tickStatuses : null;
  if(!tick) return;
  const roster = Array.isArray(party) ? party : [];
  let changed = false;
  for(const member of roster){
    if(!member || !Array.isArray(member.statusEffects) || member.statusEffects.length === 0) continue;
    const beforeHp = member.hp;
    tick(member);
    if(member.hp !== beforeHp) changed = true;
  }
  if(actor && typeof player === 'object' && player){
    player.hp = actor.hp;
  }
  if(changed){
    renderParty?.();
  }
}

// ===== Interaction =====
function canWalk(x,y){
  if(state.map==='creator') return false;
  return queryTile(x,y).walkable;
}
function move(dx,dy){
  if(state.map==='creator') return;
  if(typeof navigator!=='undefined' && moveDelay > 0) return;
  const nx=party.x+dx, ny=party.y+dy;
  if(canWalk(nx,ny)){
    const actor = typeof leader==='function'? leader(): null;
    moveDelay = calcMoveDelay(getTile(state.map, party.x, party.y), actor);
    return new Promise(resolve => {
      setTimeout(() => {
        Effects.tick({buffs});
        const mods = zoneAttrs(state.map, nx, ny);
        if(actor){
          if(mods.healMult>1){
            const healAmt = mods.healMult;
            (party||[]).forEach(m=>{ m.hp = Math.min(m.hp + healAmt, m.maxHp); });
            player.hp = actor.hp;
            renderParty?.();
          } else {
            actor.hp = Math.min(actor.hp + 1, actor.maxHp);
            player.hp = actor.hp;
            renderParty?.();
          }
        }
        (party||[]).forEach(m=>{
          if(m.hp >= m.maxHp){
            m.adr = Math.max(0, (m.adr||0) - 2);
          }
        });
        setPartyPos(nx, ny);
        updateZoneMsgs(state.map, nx, ny);
        bus.emit('movement:player', { x: nx, y: ny, map: state.map });
        if(typeof footstepBump==='function') footstepBump();
        onEnter(state.map, nx, ny, { player, party, state, actor, buffs });
        applyZones(state.map, nx, ny);
        applyStatusTicksOutOfCombat(actor);
        centerCamera(party.x,party.y,state.map); updateHUD();
        checkAggro();
        checkRandomEncounter();
        bus.emit('hydration:tick');
        bus.emit('sfx','step');
        // NPCs advance along paths after the player steps
        const pathing = (Dustland.path as { tickPathAI?: () => void } | undefined);
        pathing?.tickPathAI?.();
        if(state.map === 'world') advanceWorldTurn();
        const vacuumActive = (globalThis as { leaderHasLootVacuum?: () => boolean }).leaderHasLootVacuum
          ?? (globalThis.Dustland as { inventory?: { leaderHasLootVacuum?: () => boolean } } | undefined)?.inventory?.leaderHasLootVacuum;
        if (typeof vacuumActive === 'function' && vacuumActive()) {
          let sweeps = 0;
          while (takeNearestItem({ vacuum: true }) && sweeps < 5) {
            sweeps++;
          }
        }
        moveDelay = 0;
        resolve(undefined);
      }, moveDelay);
    });
  } else {
    bus.emit('sfx','denied');
  }
}

function checkAggro(){
  if (combatActive) return;
  for(const n of (typeof NPCS !== 'undefined' ? NPCS : [])){
    if(!n.combat || !n.combat.auto) continue;
    if(n.map!==state.map) continue;
    const d = Math.abs(n.x - party.x) + Math.abs(n.y - party.y);
    if(d<=3){
      const baseHp = typeof n.combat?.hp === 'number'
        ? n.combat.hp
        : (typeof n.combat?.HP === 'number'
          ? n.combat.HP
          : (typeof n.hp === 'number'
            ? n.hp
            : (typeof n.HP === 'number' ? n.HP : 1)));
      Dustland.actions.startCombat({ ...n.combat, npc:n, name:n.name, hp: baseHp });
      break;
    }
  }
}
function distanceToRoad(x, y, map=state.map){
  const {W,H} = mapWH(map);
  const seen = new Set([x+','+y]);
  const q = [[x,y,0]];
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while(q.length){
    const [cx,cy,d] = q.shift();
    const t = getTile(map,cx,cy);
    if(t === TILE.ROAD) return d;
    for(const [dx,dy] of dirs){
      const nx=cx+dx, ny=cy+dy, k=nx+','+ny;
      if(nx>=0 && ny>=0 && nx<W && ny<H && !seen.has(k)){
        seen.add(k);
        q.push([nx,ny,d+1]);
      }
    }
  }
  return 999;
}
function resolveEncounterChallenge(entry){
  if(!entry || typeof entry !== 'object') return null;
  if(Number.isFinite(entry.challenge)) return entry.challenge;
  const challenge = entry.combat && Number.isFinite(entry.combat.challenge)
    ? entry.combat.challenge
    : null;
  if(Number.isFinite(challenge)) return challenge;
  const templateId = entry.templateId;
  if(templateId && typeof npcTemplates !== 'undefined' && Array.isArray(npcTemplates)){
    const tpl = npcTemplates.find(t => t && t.id === templateId);
    if(tpl && Number.isFinite(tpl.combat?.challenge)){
      return tpl.combat.challenge;
    }
  }
  return null;
}

function getEncounterGuard(){
  if(typeof leader !== 'function') return null;
  const lead = leader();
  if(!lead) return null;
  const bonus = lead?._bonus?.encounter_guard;
  if(Number.isFinite(bonus)) return bonus;
  const equipped = lead?.equip?.trinket?.mods?.encounter_guard;
  if(Number.isFinite(equipped)) return equipped;
  return null;
}

function getEncounterMode(entry){
  if(!entry || typeof entry !== 'object') return 'distance';
  if(entry.mode === 'zone') return 'zone';
  if(entry.mode === 'distance') return 'distance';
  if(entry.zoneTag) return 'zone';
  return 'distance';
}

function pointInZone(map, x, y, zone){
  if(!zone) return false;
  const zoneMap = zone.map || 'world';
  if(zoneMap !== map) return false;
  const w = Number.isFinite(zone.w) ? zone.w : 0;
  const h = Number.isFinite(zone.h) ? zone.h : 0;
  if(w <= 0 || h <= 0) return false;
  return x >= zone.x && y >= zone.y && x < zone.x + w && y < zone.y + h;
}

function encounterMatchesLocation(entry, map, x, y, dist){
  const mode = getEncounterMode(entry);
  if(mode === 'zone'){
    const rawTag = typeof entry.zoneTag === 'string' ? entry.zoneTag.trim() : '';
    if(!rawTag) return false;
    const zones = globalThis.Dustland?.zoneEffects || [];
    for(const z of zones){
      const tag = typeof z.tag === 'string' ? z.tag.trim() : '';
      const id = typeof z.id === 'string' ? z.id.trim() : '';
      if(tag !== rawTag && id !== rawTag) continue;
      if(pointInZone(map, x, y, z)) return true;
    }
    return false;
  }
  const min = Number.isFinite(entry.minDist) ? entry.minDist : null;
  const max = Number.isFinite(entry.maxDist) ? entry.maxDist : null;
  if(min !== null && dist < min) return false;
  if(max !== null && dist > max) return false;
  return true;
}

function checkRandomEncounter(){
  const mods = zoneAttrs(state.map, party.x, party.y);
  if(mods.noEncounters) return;
  const minSteps = mods.minSteps ?? 3;
  const maxSteps = mods.maxSteps ?? 5;
  if(encounterCooldown > 0){
    encounterCooldown--;
    return;
  }
  if(mods.spawns && mods.spawns.length){
    let roll = Math.random();
    let acc = 0;
    let chosen = null;
    for(const s of mods.spawns){
      acc += s.prob || 0;
      if(roll < acc){ chosen = s; break; }
    }
    if(chosen){
      encounterCooldown = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));
      lockInput(undefined, globalThis.Dustland?.lastNonCombatKey);
      return Dustland.actions.startCombat({ ...chosen });
    }
    return;
  }
  const bank = enemyBanks[state.map];
  if(!bank || !bank.length) return;
  const dist = distanceToRoad(party.x, party.y);
  if(dist <= 3) return;
  const span = Math.max(WORLD_W, WORLD_H);
  const chance = Math.max(0.02, 0.25 - (dist / span) * 0.23);
  if(Math.random() < chance){
    let pool = bank.filter(entry => encounterMatchesLocation(entry, state.map, party.x, party.y, dist));
    if(!pool.length) return;
    if (encounterBias){
      const tag = encounterBias.toLowerCase();
      const biased = pool.filter(e => {
        const tags = Array.isArray(e?.tags) ? e.tags : [];
        const id = typeof e?.id === 'string' ? e.id : '';
        const name = typeof e?.name === 'string' ? e.name : '';
        const idMatch = id.toLowerCase().includes(tag);
        const nameMatch = name.toLowerCase().includes(tag);
        const tagMatch = tags.some(t => typeof t === 'string' && t.toLowerCase().includes(tag));
        return tagMatch || idMatch || nameMatch;
      });
      if (biased.length) pool = biased;
    }
    const hard = pool.filter(e => e.mode !== 'zone' && e.minDist);
    if(hard.length) pool = hard;
    const guard = getEncounterGuard();
    if(Number.isFinite(guard)){
      pool = pool.filter(entry => {
        const challenge = resolveEncounterChallenge(entry);
        if(!Number.isFinite(challenge)) return true;
        return challenge >= guard;
      });
      if(!pool.length){
        encounterCooldown = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));
        return;
      }
    }
    const base = pool[Math.floor(Math.random() * pool.length)];
    let def;
    if(base.templateId && typeof npcTemplates !== 'undefined'){
      const t = npcTemplates.find(t => t.id === base.templateId);
      def = { ...(t?.combat||{}), name: t?.name, portraitSheet: t?.portraitSheet, portraitLock: t?.portraitLock, ...base };
    } else {
      def = { ...base };
    }
    const id = def.id || def.name;
    const stats = (globalThis as typeof globalThis & { enemyTurnStats?: Record<string, { quick?: number }> }).enemyTurnStats?.[id];
    // If this enemy consistently falls in a single turn, spawn them in triples
    let count = 1;
    if (stats && stats.quick >= 3){
      count = 3;
    }
    if (count > 1) def.count = count;
    encounterCooldown = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));
    lockInput(undefined, globalThis.Dustland?.lastNonCombatKey);
    return Dustland.actions.startCombat(def);
  }
}
function adjacentNPC(){
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of dirs){
    const info=queryTile(party.x+dx,party.y+dy);
    if(info.entities.length) return info.entities[0];
  }
  return null;
}
function takeNearestItem(opts?: { cheatPickup?: boolean; vacuum?: boolean }) {
  const useVacuumFx = !!(opts && opts.vacuum);
  const dirs = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [dx, dy] of dirs) {
    const info = queryTile(party.x + dx, party.y + dy);
    if (!info.items.length) continue;
    const drops = info.items.slice();
    let tookAny = false;
    const messages = [];
    for (const drop of drops) {
      if (drop.items) {
        if (!pickupCache(drop)) {
          if (!tookAny) return false;
          break;
        }
        tookAny = true;
        messages.push(`Took ${drop.items.length} items.`);
      } else {
        if (player.inv.length >= getPartyInventoryCapacity()) {
          log('Inventory is full.');
          if (typeof toast === 'function') toast('Inventory is full.');
          if (!tookAny) return false;
          break;
        }
        addToInv(getItem(drop.id));
        tookAny = true;
      }
      const idx = itemDrops.indexOf(drop);
      if (idx > -1) itemDrops.splice(idx, 1);
    }
    if (!tookAny) continue;
    messages.forEach(msg => log(msg));
    updateHUD();
    if (useVacuumFx && (dx !== 0 || dy !== 0)) {
      globalThis.pickupVacuum?.(party.x + dx, party.y + dy, party.x, party.y);
    } else if (typeof pickupSparkle === 'function') {
      pickupSparkle(party.x + dx, party.y + dy);
    }
    bus.emit('sfx', 'pickup');
    return true;
  }
  return false;
}

function interactAt(x, y) {
  if (state.map === 'creator') return false;
  const dist = Math.abs(party.x - x) + Math.abs(party.y - y);
  if (dist > 1) return false;
  const info = queryTile(x, y);
  if (info.entities.length) {
    const npc = info.entities[0];
    if (npc.workbench) {
      Dustland.openWorkbench?.();
    } else {
      openDialog(npc);
    }
    bus.emit('sfx', 'confirm');
    return true;
  }
  if (info.items.length) {
    const drop = info.items[0];
    if (drop.items) {
      if (!pickupCache(drop)) return false;
    } else {
      if (player.inv.length >= getPartyInventoryCapacity()) {
        log('Inventory is full.');
        if (typeof toast === 'function') toast('Inventory is full.');
        return false;
      }
      addToInv(getItem(drop.id));
    }
    const idx = itemDrops.indexOf(drop);
    if (idx > -1) itemDrops.splice(idx, 1);
    if (drop.items) {
      log(`Took ${drop.items.length} items.`);
    }
    updateHUD();
    if (typeof pickupSparkle === 'function') pickupSparkle(x, y);
    bus.emit('sfx', 'pickup');
    return true;
  }
  if(x===party.x && y===party.y){
    const p=portals.find(p=> p.map===state.map && p.x===x && p.y===y);
    if(p){
      if(p.if && !globalThis.checkFlagCondition?.(p.if)){
        const blocked = typeof p.blockedMsg === 'string' ? p.blockedMsg : 'It\'s locked.';
        log(blocked);
        bus.emit('sfx','denied');
        return true;
      }
      const target=p.toMap;
      const I=interiors[target];
      const px = (typeof p.toX==='number') ? p.toX : (I?I.entryX:0);
      const py = (typeof p.toY==='number') ? p.toY : (I?I.entryY:0);
      setPartyPos(px, py);
      setMap(target);
      const desc = typeof p.desc === 'string' ? p.desc : 'You move through the doorway.';
      log(desc);
      updateHUD();
      bus.emit('sfx','confirm');
      return true;
    }
    if(info.tile===TILE.DOOR){
      if(state.map==='world'){
        const b=buildings.find(b=> b.doorX===x && b.doorY===y);
        if(!b){ log('No entrance here.'); bus.emit('sfx','denied'); return true; }
        if(b.boarded){ log('The doorway is boarded up from the outside.'); bus.emit('sfx','denied'); return true; }
        if(b.bunker){
          Dustland.fastTravel?.activateBunker?.(b.bunkerId);
          if(typeof openWorldMap==='function') openWorldMap(b.bunkerId);
          bus.emit('sfx','confirm');
          return true;
        }
        const I=interiors[b.interiorId];
        if(I){ setPartyPos(I.entryX, I.entryY); }
        setMap(b.interiorId,'Interior');
        log('You step inside.'); updateHUD();
        bus.emit('sfx','confirm');
        return true;
      }
      if(state.map!=='world'){
        const b=buildings.find(b=> b.interiorId===state.map);
        if(b){
          setPartyPos(b.doorX, b.doorY);
          setMap('world');
          log('You step back outside.');
          updateHUD();
          bus.emit('sfx','confirm');
          return true;
        }
      }
    }
  }
  return false;
}
function interact(){
  if(Date.now()-lastInteract < 200) return false;
  lastInteract = Date.now();
  const dirs=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of dirs){
    if(interactAt(party.x+dx,party.y+dy)) return true;
  }
  return wait();
}

const movementSystem = { canWalk, move };
const collisionSystem = { queryTile, canWalk };
const interactionSystem = { adjacentNPC, takeNearestItem, interact, interactAt };
const movement = {
  movementSystem,
  collisionSystem,
  interactionSystem,
  queryTile,
  interactAt,
  findFreeDropTile,
  mapWH,
  mapIdForState,
  canWalk,
  move,
  wait,
  takeNearestItem,
  onEnter,
  buffs,
  calcMoveDelay,
  getMoveDelay: () => moveDelay,
  getWorldTurns: () => worldTurnCounter,
  WORLD_LOOT_DECAY_TURNS,
  checkRandomEncounter,
  distanceToRoad
};
bus?.on?.('movement:player', payload => {
  if (!payload || payload.__fromNet) return;
  const { x, y } = payload;
  setPartyPos(x, y);
});
globalThis.Dustland = globalThis.Dustland || {};
globalThis.Dustland.worldTurns = worldTurnCounter;
globalThis.Dustland.movement = movement;
Object.assign(globalThis, movement);
