/* global toast, log, EventBus */
const { on } = globalThis.EventBus;

/**
 * @typedef {object} GameItem
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {{[key:string]: number}} [mods]
 * @property {{type:string, amount?:number, duration?:number, stat?:string, text?:string, onUse?:Function}} [use]
 * @property {string} [desc]
 * @property {number} [rarity]
 * @property {number} [value]
 */

/**
 * A party member character.
 * @typedef {object} PartyMember
 * @property {string} id
 * @property {string} name
 * @property {number} hp
 * @property {number} maxHp
 * @property {number} lvl
 * @property {Record<string, number>} stats
 * @property {{weapon:GameItem|null, armor:GameItem|null, trinket:GameItem|null}} equip
 * @property {string} [origin]
 * @property {string} [quirk]
 */

/**
 * @typedef {object} QuestState
 * @property {string} id
 * @property {'available'|'active'|'completed'} status
 */

/**
 * @typedef {object} NPC
 * @property {string} id
 * @property {string} map
 * @property {number} x
 * @property {number} y
 * @property {string} color
 * @property {string} name
 * @property {string} title
 * @property {{[key:string]: any}} tree
 * @property {Quest} [quest]
 */

/**
 * @typedef {object} Quest
 * @property {string} id
 * @property {string} name
 * @property {'available'|'active'|'completed'} status
 * @property {string} [desc]
 * @property {Function} [onStart]
 * @property {Function} [onComplete]
 */

/**
 * @typedef {object} Map
 * @property {string} id
 * @property {number} w
 * @property {number} h
 * @property {number[][]} grid
 * @property {number} [entryX]
 * @property {number} [entryY]
 * @property {string} [name]
 * @property {{name:string,HP?:number,DEF?:number,loot?:string}[]} [enemies]
 */

/**
 * @typedef {object} Check
 * @property {string} stat
 * @property {number} dc
 * @property {Function[]} [onSuccess]
 * @property {Function[]} [onFail]
 */

// ===== Core helpers =====
const ROLL_SIDES = 12;
const DC = Object.freeze({ TALK:8, REPAIR:9 });
const CURRENCY = 'Scrap';

// Placeholder; actual content provided by modules (e.g. Dustland)
function seedWorldContent(){}

let worldSeed = Date.now();
function createRNG(seed){
  return function(){
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
let rng = createRNG(worldSeed);
function setRNGSeed(seed){ worldSeed = seed >>> 0; rng = createRNG(worldSeed); }
const rand = (n)=> Math.floor(rng()*n);
function nextId(prefix, arr) {
  let i = 1; while (arr.some(o => o.id === prefix + i)) i++; return prefix + i;
}
const clamp = (v,a,b)=> {
  if(a > b){ [a,b] = [b,a]; }
  return Math.max(a, Math.min(b, v));
};

function refreshUI(){
  renderInv?.();
  renderQuests?.();
  renderParty?.();
  updateHUD?.();
}

class Dice {
  static skill(character, stat, add=0, sides=ROLL_SIDES, rng=Math.random){
    const base = (character?.stats?.[stat] || 0);
    const roll = Math.floor(rng()*sides)+1;
    return roll + Math.floor(base/2) + add;
  }
}

// ===== Combat =====
/**
 * Launch the menu-based combat interface. In non-browser environments the
 * player automatically flees. Nearby combat-enabled NPCs within two tiles
 * will join the defender.
 * @param {{HP?:number,DEF:number,loot?:GameItem,name?:string,npc?:NPC}} defender
 * @returns {Promise<{result:'bruise'|'loot'|'flee'}>}
 */
async function startCombat(defender){
  const attacker = party.leader?.() || null;
  if(typeof openCombat !== 'function' || typeof document === 'undefined'){
    return { result:'flee' };
  }

  const toEnemy = (def) => {
    const { HP, portraitSheet, portraitLock, prompt, npc, name, ...rest } = def || {};
    return {
      ...rest,
      id: def.id || def.name,
      name: name || npc?.name || 'Enemy',
      hp: def.hp ?? HP ?? 5,
      npc,
      portraitSheet: portraitSheet || npc?.portraitSheet,
      portraitLock: portraitLock ?? npc?.portraitLock,
      prompt: prompt || npc?.prompt,
      special: rest.special
    };
  };

  const enemies = [];
  const combatSources = [];
  const addCombatSource = (source) => {
    if(!source) return;
    combatSources.push(source);
    const copies = Math.max(1, source.count || 1);
    for(let i=0; i<copies; i++) enemies.push(toEnemy(source));
  };
  addCombatSource(defender);
  const px = party.x, py = party.y, map = party.map || state.map;
  for (const n of (typeof NPCS !== 'undefined' ? NPCS : [])) {
    if (!n.combat) continue;
    if (n.map !== map) continue;
    const dist = Math.abs(n.x - px) + Math.abs(n.y - py);
    if (dist <= 2 && (!defender?.npc || n !== defender.npc)) {
      addCombatSource({ ...n.combat, npc: n, name: n.name, portraitSheet: n.portraitSheet, portraitLock: n.portraitLock });
    }
  }

  const result = await openCombat(enemies);

  if(result && result.result !== 'flee'){
    const avgLvl = party.reduce((s,m)=>s+(m.lvl||1),0)/(party.length||1);
    let xp = 0;
    for(const src of combatSources){
      if(!src) continue;
      const override = Number.isFinite(src.xp) ? src.xp : null;
      if(override!=null){
        xp += override;
        continue;
      }
      const count = Math.max(1, src.count || 1);
      const str = src.challenge || src.hp || src.HP || 1;
      xp += count * Math.max(1, Math.ceil(str/avgLvl));
    }
    party.forEach(m => awardXP(m, xp));
  }

  if(attacker){
    player.hp = attacker.hp;
  }
  refreshUI();
  return result;
}

// ===== Tiles =====
const TILE = Object.freeze({ SAND:0, ROCK:1, WATER:2, BRUSH:3, ROAD:4, RUIN:5, WALL:6, FLOOR:7, DOOR:8, BUILDING:9 });
const walkable = Object.freeze({0:true,1:true,2:false,3:true,4:true,5:true,6:false,7:true,8:true,9:false});

const tileEmoji = Object.freeze({
  0:'\u{1F3DD}', // 🏝
  1:'\u{1FAA8}', // 🪨
  2:'\u{1F30A}', // 🌊
  3:'\u{1F33F}', // 🌿
  4:'\u{1F6E3}', // 🛣
  5:'\u{1F3DA}', // 🏚
  6:'\u{1F9F1}', // 🧱
  7:'\u{2B1C}', // ⬜
  8:'\u{1F6AA}', // 🚪
  9:'\u{1F3E0}'  // 🏠
});
const emojiTile = Object.freeze(Object.fromEntries(Object.entries(tileEmoji).map(([k,v])=>[v,+k])));

function gridFromEmoji(rows){
  return rows.map(r=> Array.from(r).map(ch=> emojiTile[ch] ?? 0));
}
function gridToEmoji(grid){
  return grid.map(r=> r.map(t=> tileEmoji[t] || '').join(''));
}

globalThis.tileEmoji = tileEmoji;
globalThis.emojiTile = emojiTile;
globalThis.gridFromEmoji = gridFromEmoji;
globalThis.gridToEmoji = gridToEmoji;

const mapNameEl = document.getElementById('mapname');
const mapLabels = { world: 'Wastes', creator: 'Creator' };
function mapLabel(id){
  return interiors[id]?.label || mapLabels[id] || 'Interior';
}
function setMap(id,label){
  if(typeof gridFor === 'function' && !gridFor(id)){
    id = 'world';
    label = label || mapLabel(id);
  }
  state.map=id;
  party.map = id;
  state.mapEntry = null;
  if (mapNameEl) {
    mapNameEl.textContent = label || mapLabel(id);
  }
  if(typeof centerCamera==='function') centerCamera(party.x,party.y,state.map);
  if(id==='world') setGameState(GAME_STATE.WORLD);
  else if(id==='creator') setGameState(GAME_STATE.CREATOR);
  else setGameState(GAME_STATE.INTERIOR);
}
function isWalkable(tile){ return !!walkable[tile]; }

// ===== World sizes =====
const VIEW_W=40, VIEW_H=30, TS=16;
const WORLD_W=120, WORLD_H=90;

function getViewSize(){
  const iw = typeof window !== 'undefined' ? window.innerWidth : VIEW_W * TS;
  const ih = typeof window !== 'undefined' ? window.innerHeight : VIEW_H * TS;
  return {
    w: Math.min(VIEW_W, Math.floor(iw / TS)),
    h: Math.min(VIEW_H, Math.floor(ih / TS))
  };
}
globalThis.getViewSize = getViewSize;

// ===== Game state =====
let world = [], interiors = {}, buildings = [], portals = [], npcTemplates = [];
const tileEvents = [];
const zoneEffects = [];
const enemyBanks = {};
function registerTileEvents(list){ (list||[]).forEach(e => tileEvents.push(e)); }
function computeZoneWallGap(length, enabled){
  if(!enabled || length <= 0) return null;
  const size = Math.min(2, length);
  const start = Math.floor((length - size) / 2);
  return { start, end: start + size };
}
function zoneGapContains(index, gap){
  return !!gap && index >= gap.start && index < gap.end;
}
function applyZoneWalls(z){
  if(!z || !z.walled || typeof setTile !== 'function') return;
  const map = z.map || 'world';
  const grid = typeof gridFor === 'function' ? gridFor(map) : null;
  if(!grid) return;
  const width = Math.max(1, Math.round(Number(z.w) || 0));
  const height = Math.max(1, Math.round(Number(z.h) || 0));
  if(!Number.isFinite(width) || !Number.isFinite(height)) return;
  const baseX = Math.round(Number(z.x) || 0);
  const baseY = Math.round(Number(z.y) || 0);
  const entrances = typeof z.entrances === 'object' && z.entrances ? z.entrances : {};
  const northGap = computeZoneWallGap(width, entrances.north);
  const southGap = computeZoneWallGap(width, entrances.south);
  const westGap = computeZoneWallGap(height, entrances.west);
  const eastGap = computeZoneWallGap(height, entrances.east);
  const wallTile = typeof TILE === 'object' && TILE ? TILE.WALL : 6;
  for(let i=0;i<width;i++){
    if(zoneGapContains(i, northGap) || (height === 1 && zoneGapContains(i, southGap))) continue;
    setTile(map, baseX + i, baseY, wallTile);
  }
  if(height > 1){
    const by = baseY + height - 1;
    for(let i=0;i<width;i++){
      if(zoneGapContains(i, southGap)) continue;
      setTile(map, baseX + i, by, wallTile);
    }
  }
  for(let i=0;i<height;i++){
    if(zoneGapContains(i, westGap) || (width === 1 && zoneGapContains(i, eastGap))) continue;
    setTile(map, baseX, baseY + i, wallTile);
  }
  if(width > 1){
    const rx = baseX + width - 1;
    for(let i=0;i<height;i++){
      if(zoneGapContains(i, eastGap)) continue;
      setTile(map, rx, baseY + i, wallTile);
    }
  }
}
function registerZoneEffects(list){
  (list||[]).forEach(z => {
    zoneEffects.push(z);
    applyZoneWalls(z);
    const id = z.useItem?.id;
    if(id && globalThis.EventBus?.on){
      globalThis.EventBus.on(`used:${id}`, () => {
        if(z.if && !globalThis.checkFlagCondition?.(z.if)) return;
        const map = z.map || 'world';
        if(party.map !== map) return;
        const { x, y } = party;
        if(x < z.x || y < z.y || x >= z.x + (z.w || 0) || y >= z.y + (z.h || 0)) return;
        if(z.useItem.once && z.useItem._used) return;
        if(z.useItem.reward){
          globalThis.Dustland?.actions?.applyQuestReward(z.useItem.reward);
        }
        if(z.useItem.once) z.useItem._used = true;
      });
    }
  });
}
const state = { map:'world', mapFlags: {} }; // default map
const player = { hp:10, inv:[], scrap:0, campChest: [], campChestUnlocked: false };
if (typeof registerItem === 'function') {
  registerItem({
    id: 'memory_worm',
    name: 'Memory Worm',
    type: 'token',
    desc: 'Resets a character\'s spent skill points.'
  });
}
function setPartyPos(x, y){
  if(typeof x === 'number') party.x = x;
  if(typeof y === 'number') party.y = y;
  if(!state.mapEntry || state.mapEntry.map !== state.map){
    state.mapEntry = { map: state.map, x: party.x, y: party.y };
  }
  incFlag(`visits@${state.map}@${party.x},${party.y}`);
}
const worldFlags = {};
const hiddenNPCs = [];
const GAME_STATE = Object.freeze({
  TITLE: 'title',
  CREATOR: 'creator',
  WORLD: 'world',
  INTERIOR: 'interior',
  DIALOG: 'dialog',
  MENU: 'menu'
});
let gameState = GAME_STATE.TITLE;
function setGameState(next){ gameState = next; }
let doorPulseUntil = 0;
let lastInteract = 0;

// Simple map used during character creation
const creatorMap = { w:30, h:22, grid:[], entryX:15, entryY:10 };
function genCreatorMap(){
  creatorMap.grid = Array.from({length:creatorMap.h},(_,y)=> Array.from({length:creatorMap.w},(_,x)=>{
    const edge = y===0||y===creatorMap.h-1||x===0||x===creatorMap.w-1; return edge? TILE.WALL : TILE.FLOOR;
  }));
  interiors['creator'] = creatorMap;
}


function flagValue(flag){
  if (worldFlags[flag]) return worldFlags[flag].count;
  return party.flags?.[flag] ? 1 : 0;
}

function checkFlagCondition(cond){
  if(!cond) return true;
  const v = flagValue(cond.flag);
  const val = cond.value ?? 0;
  switch(cond.op){
    case '>=': return v >= val;
    case '>': return v > val;
    case '<=': return v <= val;
    case '<': return v < val;
    case '!=': return v !== val;
    case '=':
    case '==': return v === val;
  }
  return false;
}

function revealHiddenNPCs(){
  for(let i=hiddenNPCs.length-1;i>=0;i--){
    const n=hiddenNPCs[i];
    if(checkFlagCondition(n.reveal)){
      let quest=null;
      if(n.questId && quests[n.questId]) quest=quests[n.questId];
      const opts={};
      if(n.combat) opts.combat=n.combat;
      if(n.shop) opts.shop=n.shop;
      if(n.portraitSheet) opts.portraitSheet=n.portraitSheet;
      if(n.portraitLock===false) opts.portraitLock=false;
      if(n.symbol) opts.symbol=n.symbol;
      if(n.door) opts.door=n.door;
      if(typeof n.locked==='boolean') opts.locked=n.locked;
      const npc=makeNPC(n.id, n.map||'world', n.x, n.y, n.color, n.name||n.id, n.title||'', n.desc||'', n.tree, quest, null, null, opts);
      if (Array.isArray(n.loop)) npc.loop = n.loop;
      if (typeof NPCS !== 'undefined') NPCS.push(npc);
      hiddenNPCs.splice(i,1);
    }
  }
}

function setFlag(flag, value) {
  const entry = worldFlags[flag] || (worldFlags[flag] = { count: 0, time: 0 });
  entry.count = value;
  entry.time = Date.now();
  revealHiddenNPCs();
}

function incFlag(flag, amt=1){
  const entry = worldFlags[flag] || (worldFlags[flag] = {count:0, time:0});
  entry.count += amt;
  entry.time = Date.now();
  revealHiddenNPCs();
  return entry.count;
}

// ===== Module application =====
function applyModule(data = {}, options = {}) {
  const { fullReset = true } = options;
  let moduleData = data || {};
  const moduleName = moduleData.name || '';
  const dl = globalThis.Dustland ||= {};
  dl.behaviors?.teardown?.();
  dl.effects?.reset?.();
  dl.currentModule = moduleName;
  (dl.moduleProps ||= {})[moduleName] = { ...(moduleData.props || {}) };
  (dl.loadedModules ||= {})[moduleName] = moduleData;
  const personaTemplates = dl.personaTemplates;
  if (fullReset && personaTemplates) {
    const base = dl._basePersonaTemplates || (dl._basePersonaTemplates = Object.fromEntries(Object.entries(personaTemplates).map(([id, def]) => [id, { ...def }])));
    Object.keys(personaTemplates).forEach(id => delete personaTemplates[id]);
    Object.entries(base).forEach(([id, def]) => { personaTemplates[id] = { ...def }; });
  }

  if (fullReset) {
    const seed = moduleData.seed || Date.now();
    setRNGSeed(seed);

    // Clear core collections
    Object.keys(interiors).forEach(k => delete interiors[k]);
    buildings.length = 0;
    portals.length = 0;
    tileEvents.length = 0;
    itemDrops.length = 0;
    if (typeof ITEMS !== 'undefined') Object.keys(ITEMS).forEach(k => delete ITEMS[k]);
    if (typeof quests !== 'undefined') Object.keys(quests).forEach(k => delete quests[k]);
    if (typeof NPCS !== 'undefined') NPCS.length = 0;
    hiddenNPCs.length = 0;
    npcTemplates.length = 0;
    Object.keys(enemyBanks).forEach(k => delete enemyBanks[k]);

    // Reset custom map labels
    Object.keys(mapLabels).forEach(k => {
      if (k !== 'world' && k !== 'creator') delete mapLabels[k];
    });

    // Generate terrain based on config
    let generated = false;
    if (moduleData.worldGen) {
      let gen = moduleData.worldGen;
      if (typeof gen === 'string') gen = globalThis[gen];
      if (typeof gen === 'function') {
        const extra = gen(seed, moduleData) || {};
        moduleData = { ...moduleData, ...extra };
        generated = true;
      }
    }
    if (moduleData.world) {
      world.length = 0;
      const grid = Array.isArray(moduleData.world[0]) ? moduleData.world : gridFromEmoji(moduleData.world);
      grid.forEach(row => world.push([...row]));
      generated = true;
    }
    if (!generated) {
      const genOpts = moduleData.buildings ? { buildings: [] } : {};
      genWorld(seed, genOpts);
    }
  }

  // Interiors
  (moduleData.interiors || []).forEach(I => {
    const { id, grid, ...rest } = I;
    const g = grid && typeof grid[0] === 'string' ? gridFromEmoji(grid) : grid;
    interiors[id] = { ...rest, grid: g };
  });

  // Buildings
  if (moduleData.buildings) {
    moduleData.buildings.forEach(b => {
      if (!buildings.some(eb => eb.x === b.x && eb.y === b.y)) {
        placeHut(b.x, b.y, b);
      }
    });
  }

  // Portals, events, and encounters
  if (moduleData.portals) portals.push(...moduleData.portals);
  if (moduleData.events) registerTileEvents(moduleData.events);
  if (moduleData.zones) registerZoneEffects(moduleData.zones);
  if (moduleData.templates) npcTemplates.push(...moduleData.templates);
  if (moduleData.encounters) {
    Object.entries(moduleData.encounters).forEach(([map, list]) => {
      enemyBanks[map] = list.map(e => ({ ...e }));
    });
  }

  if (personaTemplates && moduleData.personas) {
    Object.entries(moduleData.personas).forEach(([id, def]) => {
      const base = personaTemplates[id] ? { ...personaTemplates[id] } : { id };
      personaTemplates[id] = { ...base, ...def, id: def.id || base.id || id };
    });
    const personaState = globalThis.Dustland?.gameState?.getState?.()?.personas;
    if (personaState && globalThis.Dustland?.gameState?.setPersona) {
      Object.keys(personaState).forEach(id => {
        if (moduleData.personas[id]) {
          const merged = { ...personaState[id], ...moduleData.personas[id], id };
          globalThis.Dustland.gameState.setPersona(id, merged);
        }
      });
    }
  }

  // Effect packs
  if (moduleData.effectPacks && globalThis.Dustland?.gameState?.loadEffectPacks) {
    globalThis.Dustland.gameState.loadEffectPacks(moduleData.effectPacks);
  }

  // Items
  const questItemLocations = {};
  if (typeof ITEMS !== 'undefined' && moduleData.items) {
    moduleData.items.forEach(it => {
      const { map, x, y, ...def } = it;
      const registered = registerItem(def);
      if (map !== undefined && x !== undefined && y !== undefined) {
        const loc = { id: registered.id, map: map || 'world', x, y };
        itemDrops.push(loc);
        questItemLocations[registered.id] = { map: loc.map, x: loc.x, y: loc.y };
      }
    });
  }

  // Quests
  if (typeof quests !== 'undefined' && moduleData.quests) {
    moduleData.quests.forEach(q => {
      quests[q.id] = new Quest(
        q.id,
        q.title,
        q.desc,
        {
          item: q.item,
          itemTag: q.itemTag,
          count: q.count,
          reward: q.reward,
          xp: q.xp,
          moveTo: q.moveTo,
          itemLocation: q.item && questItemLocations[q.item] ? questItemLocations[q.item] : null,
          dialog: q.dialog,
          progressText: q.progressText
        }
      );
    });
  }

  // NPCs
  function registerQuestGiver(q, npcDef) {
    if (!q || !npcDef) return;
    if (!Array.isArray(q.givers)) q.givers = [];
    const exists = q.givers.some(g => g && g.id === npcDef.id);
    if (!exists) {
      q.givers.push({
        id: npcDef.id,
        name: npcDef.name || npcDef.id,
        map: npcDef.map || 'world',
        x: npcDef.x,
        y: npcDef.y
      });
    }
  }
  (moduleData.npcs || []).forEach(n => {
    if (n.hidden && n.reveal) { hiddenNPCs.push(n); return; }
    let tree = n.tree;
    if (typeof tree === 'string') { try { tree = JSON.parse(tree); } catch (e) { tree = null; } }
    const dlgArr = n.dialogs || (Array.isArray(n.dialog) ? n.dialog : null);
    if (!tree) {
      const txt = dlgArr ? dlgArr[0] : (n.dialog || '');
      tree = { start: { text: txt, choices: [{ label: '(Leave)', to: 'bye' }] } };
    }
    let quest = null;
    if (n.questId && quests[n.questId]) {
      quest = quests[n.questId];
      registerQuestGiver(quest, n);
    }
    const opts = {};
    if (n.combat) opts.combat = n.combat;
    if (n.shop) opts.shop = n.shop;
    if (n.portraitSheet) opts.portraitSheet = n.portraitSheet;
    if (n.portraitLock === false) opts.portraitLock = false;
    if (n.symbol) opts.symbol = n.symbol;
    if (n.workbench) opts.workbench = n.workbench;
    if (n.trainer) opts.trainer = n.trainer;
    if (n.door) opts.door = n.door;
    if (typeof n.locked === 'boolean') opts.locked = n.locked;
    if (typeof n.overrideColor === 'boolean') opts.overrideColor = n.overrideColor;
    if (Array.isArray(n.quests)) {
      const questList = [];
      n.quests.forEach(id => {
        const q = quests[id];
        if (!q) return;
        registerQuestGiver(q, n);
        questList.push(q);
      });
      if (questList.length) opts.quests = questList;
    }
    if (dlgArr) opts.questDialogs = dlgArr;
    const npc = makeNPC(n.id, n.map || 'world', n.x, n.y, n.color, n.name || n.id, n.title || '', n.desc || '', tree, quest, null, null, opts);
    if (Array.isArray(n.loop)) npc.loop = n.loop;
    if (n.hintSound && Array.isArray(soundSources)) {
      if (!soundSources.some(s => s.id === npc.id)) {
        soundSources.push({ id: npc.id, x: npc.x, y: npc.y, map: npc.map });
      }
    }
    if (typeof NPCS !== 'undefined') NPCS.push(npc);
  });
  revealHiddenNPCs();
  dl.behaviors?.setup?.(moduleData);
  const nameForLog = moduleData.name || moduleData.id || 'module';
  if (typeof log === 'function') log(`${nameForLog} loaded successfully.`);
  else console.log(`${nameForLog} loaded successfully.`);
  if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
    const CE = document.defaultView?.CustomEvent || globalThis.CustomEvent;
    const Ev = document.defaultView?.Event || globalThis.Event;
    const evt = typeof CE === 'function' ? new CE('moduleLoaded', { detail: { name: nameForLog } }) : new Ev('moduleLoaded');
    document.dispatchEvent(evt);
  }
  return moduleData;
}

// ===== WORLD GEN =====
function genWorld(seed=Date.now(), data={}){
  setRNGSeed(seed);
  // Preserve the world array reference for consumers by clearing then repopulating
  world.length = 0;
  for(let y=0; y<WORLD_H; y++){
    const row = [];
    for(let x=0; x<WORLD_W; x++){
      const v=(Math.sin((x+seed%977)*.37)+Math.cos((y+seed%911)*.29)+Math.sin((x+y)*.11))*0.5;
      if(v> .62) row.push(TILE.ROCK);
      else if(v<-0.62) row.push(TILE.WATER);
      else if(v> .18) row.push(TILE.BRUSH);
      else row.push(TILE.SAND);
    }
    world.push(row);
  }
  for(let x=0;x<WORLD_W;x++){
    const ry= clamp(Math.floor(WORLD_H/2 + Math.sin(x*0.22)*6), 2, WORLD_H-3);
    setTile('world', x, ry, TILE.ROAD);
    setTile('world', x, ry-1, TILE.ROAD);
  }
  for(let i=0;i<120;i++){
    const rx=rand(WORLD_W), ry=rand(WORLD_H);
    if(getTile('world',rx,ry)!==TILE.WATER) setTile('world',rx,ry,TILE.RUIN);
  }
  Object.keys(interiors).forEach(k => delete interiors[k]);
  if(creatorMap.grid && creatorMap.grid.length) interiors['creator']=creatorMap;
  (data.interiors||[]).forEach(I=>{ const {id,...rest}=I; interiors[id]={...rest}; });
  buildings.length = 0;
  if (data.buildings) {
    data.buildings.forEach(b => placeHut(b.x, b.y, b));
  } else {
    for (let i = 0; i < 10; i++) {
      let x = 8 + rand(WORLD_W - 16), y = 6 + rand(WORLD_H - 12);
      if (getTile('world', x, y) === TILE.WATER) { const p = findNearestLand(x, y); x = p.x; y = p.y; }
      placeHut(x, y);
    }
  }
  portals.length=0;
  if(data.portals && data.portals.length){
    data.portals.forEach(p=> portals.push(p));
  }
  seedWorldContent();
}
function isWater(x,y){ return getTile('world',x,y)===TILE.WATER; }
function findNearestLand(sx,sy){
  const q=[[sx,sy]], seen=new Set([sx+","+sy]); const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  while(q.length){
    const [x,y]=q.shift();
    if(!isWater(x,y)) return {x,y};
    for(const [dx,dy] of dirs){
      const nx=x+dx, ny=y+dy; const k=nx+","+ny;
      if(nx>=0&&ny>=0&&nx<WORLD_W&&ny<WORLD_H&&!seen.has(k)){ seen.add(k); q.push([nx,ny]); }
    }
  }
  return {x:sx,y:sy};
}
function makeInteriorRoom(id,w=12,h=9){
  id = id || ('room_'+rng().toString(36).slice(2,8));
  const g=Array.from({length:h},(_,y)=> Array.from({length:w},(_,x)=>{
    const edge= y===0||y===h-1||x===0||x===w-1; return edge? TILE.WALL : TILE.FLOOR;
  }));
  const ex=Math.floor(w/2), ey=h-1; g[ey][ex]=TILE.DOOR;
  interiors[id] = {w,h,grid:g, entryX:ex, entryY:h-2};
  return id;
}
function placeHut(x,y,b={}){
  let grid=b.grid;
  let w,h,doorX,doorY;
  if(grid){
    h=grid.length; w=grid[0].length;
    for(let yy=0; yy<h; yy++){ for(let xx=0; xx<w; xx++){
      const tile=grid[yy][xx];
      if(tile===TILE.DOOR){ doorX=x+xx; doorY=y+yy; }
    }}
    if(doorX==null){ doorX=x+Math.floor(w/2); doorY=y+h-1; }
  }else{
    w=b.w||6; h=b.h||5;
    grid=Array.from({length:h},(_,yy)=>Array.from({length:w},(_,xx)=>TILE.BUILDING));
    const relX = b.doorX!=null ? b.doorX - x : Math.floor(w/2);
    const relY = b.doorY!=null ? b.doorY - y : h-1;
    if(relY>=0&&relY<h&&relX>=0&&relX<w) grid[relY][relX]=TILE.DOOR;
    doorX=x+relX; doorY=y+relY;
  }
  const under=Array.from({length:h},(_,yy)=>Array.from({length:w},(_,xx)=>getTile('world',x+xx,y+yy)));
  for(let yy=0; yy<h; yy++){
    for(let xx=0; xx<w; xx++){
      const t=grid[yy][xx];
      if(t===TILE.DOOR){ setTile('world',x+xx,y+yy,TILE.DOOR); }
      else if(t===TILE.BUILDING){ setTile('world',x+xx,y+yy,TILE.BUILDING); }
    }
  }
  let interiorId, boarded;
  const bunker = !!b.bunker;
  if (!bunker) {
    interiorId = b.interiorId || makeInteriorRoom();
    if (b.interiorId && !interiors[b.interiorId]) makeInteriorRoom(b.interiorId);
  } else {
    interiorId = null;
  }
  boarded = b.boarded!==undefined ? b.boarded : rng()<0.3;
  const nb={x,y,w,h,doorX,doorY,interiorId,boarded,under,grid};
  if (bunker) {
    nb.bunker = true;
    const moduleName = globalThis.Dustland?.currentModule || '';
    const bunkerId = b.bunkerId || `bunker_${x}_${y}`;
    nb.bunkerId = bunkerId;
    const bunkers = (globalThis.Dustland ||= {}).bunkers || (globalThis.Dustland.bunkers = []);
    if (!bunkers.some(b => b.id === bunkerId)) {
      const ft = globalThis.Dustland?.fastTravel;
      const network = typeof ft?.networkFor === 'function' ? ft.networkFor(moduleName) : 'global';
      const entry = { id: bunkerId, x: doorX, y: doorY, map: 'world', module: moduleName, name: moduleName, active: !boarded, network };
      bunkers.push(entry);
    }
  }
  buildings.push(nb);
  return nb;
}

// ===== Save/Load & Start =====
const SAVE_FORMAT = 'dustland.save.v2';

function isModernSavePayload(data){
  if(!data || typeof data !== 'object') return false;
  const fmt = data.format;
  if(fmt === SAVE_FORMAT) return true;
  if(typeof fmt === 'string'){
    const match = /^dustland\.save\.v(\d+)$/.exec(fmt);
    if(match){
      const ver = Number.parseInt(match[1], 10);
      if(Number.isFinite(ver) && ver >= 2) return true;
    }
  }
  const rawVer = data.version;
  const ver = typeof rawVer === 'number' ? rawVer : (typeof rawVer === 'string' ? Number.parseInt(rawVer, 10) : NaN);
  return Number.isFinite(ver) && ver >= 2;
}

function cloneWorldGrid(grid){
  if(!Array.isArray(grid)) return [];
  return grid.map(row => Array.isArray(row) ? [...row] : row);
}

function worldsDiffer(a, b){
  if(!Array.isArray(a) || !Array.isArray(b)) return Array.isArray(a) !== Array.isArray(b);
  if(a.length !== b.length) return true;
  for(let y = 0; y < a.length; y++){
    const rowA = a[y];
    const rowB = b[y];
    if(!Array.isArray(rowA) || !Array.isArray(rowB)) return true;
    if(rowA.length !== rowB.length) return true;
    for(let x = 0; x < rowA.length; x++){
      if(rowA[x] !== rowB[x]) return true;
    }
  }
  return false;
}

function resolveModuleName(rawModule){
  const seen = new Set();
  function inner(value){
    if(value == null) return null;
    if(typeof value === 'string'){
      const trimmed = value.trim();
      if(!trimmed || trimmed === '[object Object]') return null;
      if(trimmed.startsWith('{') || trimmed.startsWith('[')){
        try{
          const parsed = JSON.parse(trimmed);
          return inner(parsed);
        }catch(err){
          return trimmed;
        }
      }
      return trimmed;
    }
    if(typeof value !== 'object') return null;
    if(seen.has(value)) return null;
    seen.add(value);
    if(typeof value.id === 'string' && value.id) return value.id;
    if(typeof value.module === 'string' && value.module) return value.module;
    if(typeof value.name === 'string' && value.name) return value.name;
    if(value.module && typeof value.module === 'object'){
      const nested = inner(value.module);
      if(nested) return nested;
    }
    if(value.meta && typeof value.meta === 'object'){
      const nestedMeta = inner(value.meta.module ?? value.meta);
      if(nestedMeta) return nestedMeta;
    }
    if(value.data && typeof value.data === 'object'){
      const nestedData = inner(value.data.module ?? value.data);
      if(nestedData) return nestedData;
    }
    return null;
  }
  return inner(rawModule);
}

function deepClone(value){
  if(value == null) return value;
  if(typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function deepEqual(a, b){
  if(a === b) return true;
  if(a == null || b == null) return a === b;
  if(Array.isArray(a)){
    if(!Array.isArray(b) || a.length !== b.length) return false;
    for(let i = 0; i < a.length; i++){
      if(!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if(Array.isArray(b)) return false;
  if(typeof a === 'object' && typeof b === 'object'){
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if(keysA.length !== keysB.length) return false;
    for(const key of keysA){
      if(!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if(!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return Number.isNaN(a) && Number.isNaN(b);
}

const SHOP_DEFAULTS = Object.freeze({
  grudge: 0,
  markup: 2,
  refresh: 0,
  refreshHours: 0,
  waveIndex: 0,
  vending: false
});

function getNpcTemplateDefinition(id){
  if(!id) return null;
  const moduleName = globalThis.Dustland?.currentModule;
  if(moduleName){
    const moduleData = globalThis.Dustland?.loadedModules?.[moduleName];
    const found = moduleData?.npcs?.find(n => n.id === id);
    if(found) return found;
  }
  if(Array.isArray(npcTemplates)){
    const tmpl = npcTemplates.find(n => n?.id === id);
    if(tmpl) return tmpl;
  }
  return null;
}

function normalizeShopData(entry){
  if(!entry) return null;
  const shop = entry.shop;
  if(shop === true) return {};
  if(shop && typeof shop === 'object') return shop;
  return null;
}

function shopValuesEqual(key, current, base){
  const defaultVal = Object.prototype.hasOwnProperty.call(SHOP_DEFAULTS, key) ? SHOP_DEFAULTS[key] : undefined;
  const baseVal = base !== undefined ? base : defaultVal;
  const currentVal = current !== undefined ? current : baseVal;
  if(Array.isArray(currentVal) || Array.isArray(baseVal)) return deepEqual(currentVal, baseVal);
  if((currentVal && typeof currentVal === 'object') || (baseVal && typeof baseVal === 'object')){
    return deepEqual(currentVal, baseVal);
  }
  return currentVal === baseVal;
}

function serializeShopPatch(currentShop, baseShop){
  const current = currentShop || null;
  const base = baseShop || null;
  if(!current && !base) return null;
  const patch = {};
  const currInv = Array.isArray(current?.inv) ? current.inv : [];
  const baseInv = Array.isArray(base?.inv) ? base.inv : [];
  if(!deepEqual(currInv, baseInv)){
    patch.inv = deepClone(currInv);
  }
  const keys = new Set();
  if(current) Object.keys(current).forEach(k => keys.add(k));
  if(base) Object.keys(base).forEach(k => keys.add(k));
  keys.delete('inv');
  keys.forEach(key => {
    const currVal = current ? current[key] : undefined;
    const baseVal = base ? base[key] : undefined;
    if(!shopValuesEqual(key, currVal, baseVal)){
      patch[key] = deepClone(currVal);
    }
  });
  return Object.keys(patch).length ? patch : null;
}

function normalizeShopValueForKey(value){
  if(value == null) return value;
  if(Array.isArray(value)) return value.map(normalizeShopValueForKey);
  if(typeof value === 'object'){
    const out = {};
    Object.keys(value).sort().forEach(key => {
      out[key] = normalizeShopValueForKey(value[key]);
    });
    return out;
  }
  return value;
}

function shopEntryKey(entry){
  if(!entry || typeof entry !== 'object') return null;
  const normalized = {};
  Object.keys(entry).sort().forEach(key => {
    if(key === 'count') return;
    normalized[key] = normalizeShopValueForKey(entry[key]);
  });
  try {
    return JSON.stringify(normalized);
  } catch (err) {
    return null;
  }
}

function ensureBaselineShopInventory(npc, baseDefinition){
  if(!npc) return;
  const baseShop = normalizeShopData(baseDefinition);
  if(!baseShop) return;
  const currentShop = normalizeShopData(npc);
  if(!currentShop){
    npc.shop = deepClone(baseShop);
    return;
  }
  const target = currentShop;
  if(!Array.isArray(target.inv)) target.inv = [];
  const seen = new Set();
  target.inv.forEach(entry => {
    const key = shopEntryKey(entry);
    if(key) seen.add(key);
  });
  const baseInv = Array.isArray(baseShop.inv) ? baseShop.inv : [];
  baseInv.forEach(entry => {
    const key = shopEntryKey(entry);
    if(!key || seen.has(key)) return;
    target.inv.push(deepClone(entry));
    seen.add(key);
  });
}

function serializeNpcPatch(npc, baseDefinition){
  if(!npc) return null;
  const template = baseDefinition || getNpcTemplateDefinition(npc.id);
  const currentShop = normalizeShopData(npc);
  const baseShop = normalizeShopData(template);
  const shopPatch = serializeShopPatch(currentShop, baseShop);
  if(!shopPatch) return null;
  return { shop: shopPatch };
}

function applyNpcPatch(npc, patch){
  if(!npc || !patch) return;
  const savedShop = patch.shop;
  if(savedShop && typeof savedShop === 'object'){
    let target = npc.shop;
    if(!target || target === true || typeof target !== 'object'){
      target = {};
      npc.shop = target;
    }
    if('inv' in savedShop){
      const inv = Array.isArray(savedShop.inv) ? savedShop.inv.map(entry => deepClone(entry)) : deepClone(savedShop.inv);
      target.inv = inv ?? [];
    }
    Object.keys(savedShop).forEach(key => {
      if(key === 'inv') return;
      target[key] = deepClone(savedShop[key]);
    });
  }
}

function gatherGameState(){
  const gs = globalThis.Dustland?.gameState;
  const raw = (gs && typeof gs.getState === 'function') ? gs.getState() : null;
  return {
    flags: deepClone(raw?.flags || {}),
    personas: deepClone(raw?.personas || {}),
    effectPacks: deepClone(raw?.effectPacks || {}),
    npcMemory: deepClone(raw?.npcMemory || {})
  };
}

function applyGameState(data){
  if(!data || !globalThis.Dustland?.gameState) return;
  const gs = globalThis.Dustland.gameState;
  const flags = deepClone(data.flags || {});
  const personas = deepClone(data.personas || {});
  const effectPacks = deepClone(data.effectPacks || {});
  const npcMemory = deepClone(data.npcMemory || {});
  const clock = data.clock ?? 0;

  if(typeof gs.updateState === 'function'){
    gs.updateState(state => {
      state.flags = flags;
      state.clock = clock;
      state.npcMemory = npcMemory;
      state.effectPacks = {};
      state.personas = {};
    });
  }else if(typeof gs.getState === 'function'){
    const state = gs.getState();
    if(state){
      state.flags = flags;
      state.clock = clock;
      state.npcMemory = npcMemory;
      state.effectPacks = {};
      state.personas = {};
    }
  }

  if(typeof gs.setDifficulty === 'function' && data.difficulty){
    gs.setDifficulty(data.difficulty);
  }else if(typeof gs.getState === 'function' && data.difficulty){
    const state = gs.getState();
    if(state) state.difficulty = data.difficulty;
  }

  if(typeof gs.loadEffectPacks === 'function'){
    gs.loadEffectPacks(effectPacks);
  }else if(typeof gs.updateState === 'function'){
    gs.updateState(state => { state.effectPacks = effectPacks; });
  }else if(typeof gs.getState === 'function'){
    const state = gs.getState();
    if(state) state.effectPacks = effectPacks;
  }

  if(typeof gs.setPersona === 'function'){
    Object.entries(personas).forEach(([id, persona]) => {
      gs.setPersona(id, persona);
    });
  }else if(typeof gs.updateState === 'function'){
    gs.updateState(state => { state.personas = personas; });
  }else if(typeof gs.getState === 'function'){
    const state = gs.getState();
    if(state) state.personas = personas;
  }
}

function applyGameStateSave(data){
  applyGameState(data);
}

function serializeNPC(n){
  return {
    id:n.id,
    map:n.map,
    x:n.x,
    y:n.y,
    color:n.color,
    name:n.name,
    title:n.title,
    desc:n.desc,
    tree:n.tree,
    combat:n.combat,
    shop:n.shop,
    workbench:n.workbench,
    door:n.door,
    prompt:n.prompt,
    locked:n.locked,
    overrideColor:!!n.overrideColor,
    quest:n.quest?{id:n.quest.id,status:n.quest.status}:null,
    questIdx:typeof n.questIdx === 'number' ? n.questIdx : undefined,
    loop:n.loop,
    portraitSheet:n.portraitSheet,
    portraitLock:n.portraitLock,
    symbol:n.symbol,
    trainer:n.trainer
  };
}

function serializePartyMember(p){
  return {
    id:p.id,
    name:p.name,
    role:p.role,
    lvl:p.lvl,
    xp:p.xp,
    skillPoints:p.skillPoints,
    stats:p.stats,
    equip:p.equip,
    hp:p.hp,
    map:p.map,
    x:p.x,
    y:p.y,
    maxHp:p.maxHp,
    portraitSheet:p.portraitSheet,
    persona:p.persona
  };
}

function serializeGameState(){
  const gs = globalThis.Dustland?.gameState;
  if(!gs || typeof gs.getState !== 'function') return null;
  const raw = gs.getState();
  const gathered = gatherGameState();
  return {
    difficulty: raw.difficulty,
    flags: gathered.flags,
    clock: raw.clock ?? 0,
    personas: gathered.personas,
    effectPacks: gathered.effectPacks,
    npcMemory: gathered.npcMemory
  };
}

function save(){
  const npcData = (typeof NPCS !== 'undefined' ? NPCS : []).map(serializeNPC);
  const questData = {};
  Object.keys(quests).forEach(k=>{
    const q=quests[k];
    questData[k]={title:q.title,desc:q.desc,status:q.status,pinned:!!q.pinned};
  });
  const partyMembers = Array.from(party, serializePartyMember);
  const partyData = {
    members: partyMembers,
    map: party.map,
    x: party.x,
    y: party.y,
    flags: deepClone(party.flags || {}),
    fallen: deepClone(Array.isArray(party.fallen) ? party.fallen : [])
  };
  const playerData = deepClone(player);
  if(!Array.isArray(playerData?.inv)) playerData.inv = [];
  const stateData = deepClone(state);
  const worldData = deepClone(world);
  const interiorsData = deepClone(interiors);
  const buildingsData = deepClone(buildings);
  const itemDropData = deepClone(itemDrops);
  const worldFlagData = deepClone(worldFlags);
  const bunkerData = deepClone(globalThis.Dustland?.bunkers || []);
  const saveData={
    format: SAVE_FORMAT,
    version: 2,
    savedAt: Date.now(),
    module: globalThis.Dustland?.currentModule ?? globalThis.moduleData?.name ?? globalThis.moduleData?.id ?? null,
    worldSeed,
    world: worldData,
    player: playerData,
    state: stateData,
    buildings: buildingsData,
    interiors: interiorsData,
    itemDrops: itemDropData,
    npcs:npcData,
    quests:questData,
    party:partyData,
    worldFlags: worldFlagData,
    bunkers: bunkerData,
    gameState: serializeGameState()
  };
  localStorage.setItem('dustland_crt', JSON.stringify(saveData));
  log('Game saved.');
  if (typeof toast === 'function') toast('Game saved.');
}

function mergeBuildingState(saved){
  const keyOf = b => `${b.x},${b.y},${b.interiorId || ''}`;
  const existing = new Map(buildings.map(b => [keyOf(b), b]));
  const structuralKeys = new Set(['x', 'y', 'w', 'h', 'doorX', 'doorY', 'grid', 'under']);
  (saved||[]).forEach(sb => {
    const key = keyOf(sb);
    const target = existing.get(key);
    if(target){
      Object.entries(sb).forEach(([prop, value]) => {
        if (structuralKeys.has(prop)) return;
        target[prop] = deepClone(value);
      });
    }else{
      buildings.push(deepClone(sb));
    }
  });
}

function loadLegacySave(d){
  worldSeed = d.worldSeed || Date.now();
  setRNGSeed(worldSeed);
  if(d.world){ world=d.world; } else { genWorld(worldSeed); }
  Object.assign(player,d.player);
  Object.assign(state,d.state);
  buildings.length=0; (d.buildings||[]).forEach(b=> buildings.push(b));
  interiors={}; Object.keys(d.interiors||{}).forEach(k=> interiors[k]=d.interiors[k]);
  itemDrops.length=0; (d.itemDrops||[]).forEach(i=> itemDrops.push(i));
  Object.keys(quests).forEach(k=> delete quests[k]);
  Object.keys(d.quests||{}).forEach(id=>{
    const qd=d.quests[id];
    const q=new Quest(id,qd.title,qd.desc); q.status=qd.status; q.pinned=qd.pinned||false; quests[id]=q;
  });
  if (typeof NPCS !== 'undefined') NPCS.length = 0;
  const moduleData = globalThis.moduleData;
  moduleData?.postLoad?.(moduleData);
  const moduleNpcs = moduleData?.npcs || [];
  const moduleNpcMap = new Map(moduleNpcs.map(n => [n.id, n]));
  const npcFactory = createNpcFactory(moduleNpcs);
  (d.npcs||[]).forEach(n=>{
    let f = npcFactory[n.id];
    if(!f){
      f = createNpcFactory([n])[n.id];
    }
    if(f){
      const npc=f(n.x,n.y);
      npc.map=n.map;
      npc.color = n.color ?? npc.color;
      npc.name = n.name ?? npc.name;
      npc.title = n.title ?? npc.title;
      npc.desc = n.desc ?? npc.desc;
      if (n.portraitSheet) npc.portraitSheet = n.portraitSheet;
      if('portraitLock' in n) npc.portraitLock=n.portraitLock;
      if (n.symbol) npc.symbol = n.symbol;
      if(n.trainer) npc.trainer=n.trainer;
      if (Array.isArray(n.loop)) npc.loop = n.loop;
      if(n.quest){
        if(quests[n.quest.id]) npc.quest=quests[n.quest.id];
        else if(npc.quest) npc.quest.status=n.quest.status;
      }
      const baseDef = moduleNpcMap.get(n.id) || null;
      const npcPatch = serializeNpcPatch(n, baseDef);
      applyNpcPatch(npc, npcPatch || n);
      ensureBaselineShopInventory(npc, baseDef);
      if (typeof NPCS !== 'undefined') NPCS.push(npc);
    }
  });
  party.length=0;
  (d.party||[]).forEach(m=>{
    const mem=new Character(m.id,m.name,m.role);
    Object.assign(mem,m);
    mem.skillPoints = m.skillPoints || 0;
    party.push(mem);
  });
  if(d.party && d.party[0]){
    party.x = d.party[0].x ?? party.x;
    party.y = d.party[0].y ?? party.y;
  }
  party.map = state.map;
  if(state.map === 'dust_storm'){
    state.map = 'world';
    party.map = 'world';
    party.x = 10;
    party.y = 18;
  }
  const grid = typeof gridFor === 'function' ? gridFor(state.map) : null;
  const tile = typeof getTile === 'function' ? getTile(state.map, party.x, party.y) : null;
  if(!grid || tile === null){
    state.map = 'world';
    party.map = 'world';
    const wx = world?.[0]?.length ? Math.floor(world[0].length/2) : 0;
    const wy = world?.length ? Math.floor(world.length/2) : 0;
    setPartyPos(wx, wy);
  } else {
    setPartyPos(party.x, party.y);
  }
  Dustland.gameState.updateState(s=>{ s.party = party; });
  party.forEach(mem => {
    mem.applyEquipmentStats();
    const personaId = mem.persona;
    if(personaId) {
      globalThis.Dustland?.profiles?.remove?.(mem, personaId);
      mem.persona = undefined;
      Dustland.gameState.applyPersona(mem.id, personaId);
    }
  });
  setMap(state.map);
  refreshUI();
  log('Game loaded.');
  if (typeof toast === 'function') toast('Game loaded.');
}

function loadModernSave(d){
  const moduleName = resolveModuleName(d.module) ?? globalThis.Dustland?.currentModule ?? null;
  const moduleData = (moduleName != null ? globalThis.Dustland?.loadedModules?.[moduleName] : null) || globalThis.moduleData;
  party.length = 0;
  party.flags = {};
  party.fallen = [];
  if(player && typeof player === 'object'){
    Object.keys(player).forEach(k => { delete player[k]; });
  }
  if(moduleData){
    try{ moduleData.postLoad?.(moduleData); }catch(err){ console.error(err); }
    applyModule(moduleData, { fullReset: true });
  }else{
    genWorld(d.worldSeed || Date.now());
  }
  const moduleWorld = cloneWorldGrid(world);
  worldSeed = d.worldSeed || Date.now();
  setRNGSeed(worldSeed);
  if(Array.isArray(d.world)){
    let useSavedWorld = true;
    if(moduleWorld.length && worldsDiffer(moduleWorld, d.world)){
      const moduleLabel = moduleData?.title || moduleData?.displayName || moduleData?.name || moduleName || 'this module';
      const prompt = `${moduleLabel} has a newer world layout. Discard the world stored in your save and load the updated map? Choose Cancel to keep your saved world.`;
      const discard = typeof globalThis.confirm === 'function' ? globalThis.confirm(prompt) : false;
      if(discard){
        useSavedWorld = false;
        log('Saved world discarded; using updated module map.');
        if (typeof toast === 'function') toast('Using updated module map.');
      }
    }
    if(useSavedWorld){
      world.length = 0;
      d.world.forEach(row => world.push(Array.isArray(row) ? [...row] : row));
    }
  }
  if(d.interiors){
    Object.keys(d.interiors).forEach(id => {
      interiors[id] = deepClone(d.interiors[id]);
    });
  }
  mergeBuildingState(d.buildings);
  itemDrops.length = 0;
  (d.itemDrops || []).forEach(it => itemDrops.push(deepClone(it)));
  Object.keys(worldFlags).forEach(k => delete worldFlags[k]);
  Object.entries(d.worldFlags || {}).forEach(([flag, val]) => {
    worldFlags[flag] = deepClone(val);
  });
  Object.keys(quests).forEach(k=> delete quests[k]);
  Object.keys(d.quests||{}).forEach(id=>{
    const qd=d.quests[id];
    const q=new Quest(id,qd.title,qd.desc); q.status=qd.status; q.pinned=qd.pinned||false; quests[id]=q;
  });
  if (typeof NPCS !== 'undefined') NPCS.length = 0;
  const moduleNpcs = moduleData?.npcs || [];
  const moduleNpcMap = new Map(moduleNpcs.map(n => [n.id, n]));
  const npcFactory = createNpcFactory(moduleNpcs);
  (d.npcs||[]).forEach(n=>{
    let f = npcFactory[n.id];
    if(!f){
      f = createNpcFactory([n])[n.id];
    }
    if(f){
      const npc=f(n.x,n.y);
      npc.map=n.map;
      npc.color = n.color ?? npc.color;
      npc.name = n.name ?? npc.name;
      npc.title = n.title ?? npc.title;
      npc.desc = n.desc ?? npc.desc;
      if (n.portraitSheet) npc.portraitSheet = n.portraitSheet;
      if('portraitLock' in n) npc.portraitLock=n.portraitLock;
      if (n.symbol) npc.symbol = n.symbol;
      if(n.trainer) npc.trainer=n.trainer;
      if (Array.isArray(n.loop)) npc.loop = n.loop;
      if(typeof n.locked === 'boolean') npc.locked = n.locked;
      if(typeof n.overrideColor === 'boolean') npc.overrideColor = n.overrideColor;
      if('prompt' in n) npc.prompt = n.prompt;
      if(typeof n.questIdx === 'number') npc.questIdx = n.questIdx;
      if(n.quest){
        if(quests[n.quest.id]) npc.quest=quests[n.quest.id];
        else if(npc.quest) npc.quest.status=n.quest.status;
      }
      if(Array.isArray(npc.quests) && typeof npc.questIdx === 'number'){
        npc.quest = npc.quests[npc.questIdx] || npc.quest;
        if(Array.isArray(npc.questDialogs) && npc.questDialogs.length){
          npc.tree.start.text = npc.questDialogs[npc.questIdx] || npc.tree.start.text;
        }
      }
      const baseDef = moduleNpcMap.get(n.id) || null;
      const npcPatch = serializeNpcPatch(n, baseDef);
      applyNpcPatch(npc, npcPatch || n);
      ensureBaselineShopInventory(npc, baseDef);
      if (typeof NPCS !== 'undefined') NPCS.push(npc);
    }
  });
  const partyData = d.party || {};
  const members = Array.isArray(partyData.members) ? partyData.members : [];
  members.forEach(m=>{
    const mem=new Character(m.id,m.name,m.role);
    Object.assign(mem,m);
    mem.skillPoints = m.skillPoints || 0;
    party.push(mem);
  });
  if(typeof partyData.x === 'number') party.x = partyData.x;
  if(typeof partyData.y === 'number') party.y = partyData.y;
  party.flags = deepClone(partyData.flags || {});
  party.fallen = deepClone(Array.isArray(partyData.fallen) ? partyData.fallen : []);
  Object.assign(player, d.player || {});
  if(!Array.isArray(player.inv)) player.inv = [];
  if(!Array.isArray(player.campChest)) player.campChest = [];
  player.campChestUnlocked = !!player.campChestUnlocked;
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, d.state || {});
  state.map = state.map || 'world';
  state.mapFlags = state.mapFlags || {};
  if(Array.isArray(partyData.members) && partyData.members[0]){
    party.x = partyData.members[0].x ?? party.x;
    party.y = partyData.members[0].y ?? party.y;
  }
  party.map = state.map;
  if(state.map === 'dust_storm'){
    state.map = 'world';
    party.map = 'world';
    party.x = 10;
    party.y = 18;
  }
  const grid = typeof gridFor === 'function' ? gridFor(state.map) : null;
  const tile = typeof getTile === 'function' ? getTile(state.map, party.x, party.y) : null;
  if(!grid || tile === null){
    state.map = 'world';
    party.map = 'world';
    const wx = world?.[0]?.length ? Math.floor(world[0].length/2) : 0;
    const wy = world?.length ? Math.floor(world.length/2) : 0;
    setPartyPos(wx, wy);
  } else {
    setPartyPos(party.x, party.y);
  }
  if(globalThis.Dustland){
    const bunkers = globalThis.Dustland.bunkers || (globalThis.Dustland.bunkers = []);
    bunkers.length = 0;
    if(Array.isArray(d.bunkers)){
      if(globalThis.Dustland.fastTravel?.upsertBunkers){
        globalThis.Dustland.fastTravel.upsertBunkers(d.bunkers);
      }else{
        d.bunkers.forEach(b => bunkers.push(deepClone(b)));
      }
    }
  }
  applyGameState(d.gameState);
  Dustland.gameState.updateState(s=>{ s.party = party; });
  party.forEach(mem => {
    mem.applyEquipmentStats();
    const personaId = mem.persona;
    if(personaId) {
      globalThis.Dustland?.profiles?.remove?.(mem, personaId);
      mem.persona = undefined;
      Dustland.gameState.applyPersona(mem.id, personaId);
    }
  });
  setMap(state.map);
  refreshUI();
  log('Game loaded.');
  if (typeof toast === 'function') toast('Game loaded.');
}

function load(){
  const j=localStorage.getItem('dustland_crt');
  if(!j){ log('No save.'); return; }
  let d;
  try{
    d = JSON.parse(j);
  }catch(err){
    console.error('Failed to parse save', err);
    log('Failed to read save file.');
    if (typeof toast === 'function') toast('Failed to read save file.');
    return;
  }
  if(isModernSavePayload(d)){
    loadModernSave(d);
    return;
  }
  loadLegacySave(d);
}

function clearSave(){
  localStorage.removeItem('dustland_crt');
  log('Save cleared.');
  if (typeof toast === 'function') toast('Save cleared.');
}

const startEl = document.getElementById('start');
const startContinue = document.getElementById('startContinue');
const startNew = document.getElementById('startNew');
function showStart(){ if (startEl) {startEl.style.display='flex'; setGameState(GAME_STATE.MENU); } }
function hideStart(){
  startEl.style.display='none';
  const back = state.map==='world'
    ? GAME_STATE.WORLD
    : (state.map==='creator' ? GAME_STATE.CREATOR : GAME_STATE.INTERIOR);
  setGameState(back);
}
if (startContinue) startContinue.onclick = () => { load(); hideStart(); };
if (startNew) startNew.onclick = () => { hideStart(); resetAll(); };

function resetAll(){
  party.length=0; player.inv=[]; party.flags={}; player.scrap=0; player.campChest=[]; player.campChestUnlocked=false;
  Object.keys(worldFlags).forEach(k => delete worldFlags[k]);
  built = [];
  state.map='creator'; openCreator();
  globalThis.Dustland?.inventory?.loadStarterItems?.();
  log('Reset. Back to character creation.');
  if (typeof toast === 'function') toast('Game reset.');
}
Object.assign(globalThis, { showStart, hideStart, openCreator, closeCreator, resetAll });

// ===== Character Creator =====
const creator=document.getElementById('creator');
const ccStepEl=document.getElementById('ccStep');
const ccRight=document.getElementById('ccRight');
const ccHint=document.getElementById('ccHint');
const ccBack=document.getElementById('ccBack');
const ccNext=document.getElementById('ccNext');
const ccPortrait=document.getElementById('ccPortrait');
const ccStart=document.getElementById('ccStart');
const ccLoad=document.getElementById('ccLoad');
if(ccNext) ccNext.classList.add('btn--primary');
// Pre-generated character portraits available for player selection
const portraits = Array.from({ length: 90 }, (_, i) => `assets/portraits/portrait_${1000 + i}.png`);
let portraitIndex = 0;
function setCreatorPortrait(){
  const img = portraits[portraitIndex];
  if(ccPortrait){
    ccPortrait.style.backgroundImage = `url(${img})`;
    ccPortrait.style.backgroundSize = '100% 100%';
    ccPortrait.style.backgroundPosition = 'center';
    ccPortrait.textContent = '';
  }
  if(building) building.portraitSheet = img;
}
const specializations={
  'Scavenger':{
    desc:'Finds better loot from ruins; +1 PER and starts with crowbar.',
    stats:{PER:+1},
    gear:[{id:'crowbar',name:'Crowbar',type:'weapon',mods:{ATK:+1}}]
  },
  'Gunslinger':{
    desc:'Draws fast with +1 AGI and starts with pipe rifle.',
    stats:{AGI:+1},
    gear:[{id:'pipe_rifle',name:'Pipe Rifle',type:'weapon',mods:{ATK:+2}}]
  },
  'Snakeoil Preacher':{
    desc:'Silver tongue grants +1 CHA and a lucky Tin Sun trinket.',
    stats:{CHA:+1},
    gear:[{id:'tin_sun',name:'Tin Sun',type:'trinket',mods:{LCK:+1}}]
  },
  'Cogwitch':{
    desc:'Tinker checks succeed more often; +1 INT and a trusty toolkit.',
    stats:{INT:+1},
    gear:[{id:'toolkit',name:'Toolkit',type:'trinket',mods:{INT:+1}}]
  }
};
const classSpecials={
  Scavenger:['POWER_STRIKE'],
  Gunslinger:['STUN_GRENADE'],
  'Snakeoil Preacher':['FIRST_AID'],
  Cogwitch:['ADRENAL_SURGE'],
  Wanderer:['GUARD_UP']
};
const quirks={
  'Lucky Lint':{
    desc:'+1 LCK, start with a Lucky Coin, and enemies drop extra scrap.',
    stats:{LCK:+1},
    gear:[{id:'lucky_coin',name:'Lucky Coin',type:'trinket',mods:{LCK:+1}}]
  },
  'Brutal Past':{
    desc:'+1 STR, spiked knuckles, and finishers restore adrenaline and grit.',
    stats:{STR:+1},
    gear:[{id:'spiked_knuckles',name:'Spiked Knuckles',type:'weapon',mods:{ATK:+1}}]
  },
  'Desert Prophet':{
    desc:'+1 PER, a prophecy scroll, and visions uncover more spoils caches.',
    stats:{PER:+1},
    gear:[{id:'prophecy_scroll',name:'Prophecy Scroll',type:'trinket',mods:{INT:+1}}]
  }
};
const hiddenOrigins={ 'Rustborn':{desc:'You survived a machine womb. +1 PER, weird dialog tags.'} };
const statInfo={
  STR:{name:'Strength',benefit:'helps with DC checks'},
  AGI:{name:'Agility',benefit:'speeds up movement'},
  INT:{name:'Intelligence',benefit:'helps with DC checks'},
  PER:{name:'Perception',benefit:'helps with DC checks'},
  LCK:{name:'Luck',benefit:'boosts damage and healing'},
  CHA:{name:'Charisma',benefit:'helps with DC checks'}
};

// Pool of placeholder names to auto-fill the creator
function defaultDrifterName(n){ return 'Drifter '+n; }
const randomNames=['Ash','Rex','Nova','Jax','Mara', 'Zed','Iris','Knox','Luna','Kai','Gil'];
function randomName(){
  const used=new Set(built.map(m=>m.name));
  const avail=randomNames.filter(n=>!used.has(n));
  return avail.length? avail[Math.floor(Math.random()*avail.length)] : defaultDrifterName(built.length+1);
}
function newBuilding(){
  portraitIndex = Math.floor(Math.random()*portraits.length);
  return { id:'pc'+(built.length+1), name:randomName(), role:'Wanderer', stats:baseStats(), quirk:null, spec:null, origin:null, portraitSheet: portraits[portraitIndex] };
}

let step=1; let building=null; let built=[];
function openCreator(){
  if(!creator) return; // Gracefully skip when creator UI is absent
  if(!creatorMap.grid || creatorMap.grid.length===0) genCreatorMap();
  setPartyPos(creatorMap.entryX, creatorMap.entryY);
  setMap('creator','Creator');
  creator.style.display='flex';
  step=1;
  building=newBuilding();
  renderStep();
}
function closeCreator(){ creator.style.display='none'; }
function updateCreatorButtons(){ ccStart.disabled = (built.length===0 && !building?.name); }

function renderStep(){
  ccStepEl.textContent=step; ccBack.disabled = (step===1);
  ccNext.textContent = (step===5? 'Finish Member' : 'Next');
  const r=ccRight; r.innerHTML='';
  if(step===1){
    ccHint.textContent='Pick a name and portrait.';
    r.innerHTML=`<div class='field'><label>Name</label><input id='nm' value='${building.name||''}' class='slot' style='padding:6px;background:#0c0f0c;color:var(--ink);border:1px solid #2b382b;border-radius:6px'></div><div class='row' style='margin-top:8px'><span class='pill' id='prevP'>&lt;</span><span class='pill'>Portrait</span><span class='pill' id='nextP'>&gt;</span></div>`;
    document.getElementById('prevP').onclick=()=>{ portraitIndex=(portraitIndex+portraits.length-1)%portraits.length; setCreatorPortrait(); };
    document.getElementById('nextP').onclick=()=>{ portraitIndex=(portraitIndex+1)%portraits.length; setCreatorPortrait(); };
    const nm=document.getElementById('nm'); nm.oninput=()=>{ building.name=nm.value; updateCreatorButtons(); };
    setCreatorPortrait();
  }
  if(step===2){
    ccHint.textContent='Distribute 6 points among stats.';
    r.innerHTML=`<div class='grid'>${Object.keys(building.stats).map(k=>{const info=statInfo[k]||{name:k,benefit:'helps with DC checks'};return `<div class='field'><label title='${info.name}: ${info.benefit}'>${k}</label><div class='range'><button data-k='${k}' data-d='-1'>−</button><div id='v_${k}' class='pill'>${building.stats[k]}</div><button data-k='${k}' data-d='1'>+</button></div></div>`;}).join('')}</div><div class='small'>Points left: <span id='pts'></span></div>`;
    let pool=6; const base=baseStats(); for(const k in base){ pool -= (building.stats[k]-base[k]); }
    const ptsEl=document.getElementById('pts'); function upd(){ ptsEl.textContent=pool; for(const k in building.stats){ document.getElementById('v_'+k).textContent=building.stats[k]; } } upd();
    r.querySelectorAll('button').forEach(b=> b.onclick=()=>{ const k=b.dataset.k, d=parseInt(b.dataset.d,10); if(d>0 && pool<=0) return; if(d<0 && building.stats[k]<=1) return; building.stats[k]+=d; pool-=d; upd(); });
  }
  if(step===3){
    ccHint.textContent='Choose a specialization.';
    r.innerHTML='<div class="grid">'+Object.entries(specializations).map(([k,v])=>`<div class='pill ${building.spec===k?'sel':''}' data-k='${k}' title='${v.desc}'>${k}</div>`).join('')+'</div>';
    r.querySelectorAll('.pill').forEach(p=> p.onclick=()=>{ r.querySelectorAll('.pill').forEach(z=>z.classList.remove('sel')); p.classList.add('sel'); building.spec=p.dataset.k; });
  }
  if(step===4){
    ccHint.textContent='Pick a quirk.';
    r.innerHTML='<div class="grid">'+Object.entries(quirks).map(([k,v])=>`<div class='pill ${building.quirk===k?'sel':''}' data-k='${k}' title='${v.desc}'>${k}</div>`).join('')+'</div>';
    r.querySelectorAll('.pill').forEach(p=> p.onclick=()=>{ r.querySelectorAll('.pill').forEach(z=>z.classList.remove('sel')); p.classList.add('sel'); building.quirk=p.dataset.k; });
  }
  if(step===5){
    ccHint.textContent='A weird surge passes through the lights...';
    const roll=rand(100); const got= roll<12; building.origin = got? 'Rustborn': building.origin||null;
    r.innerHTML = `<div class='field'><div>Hidden Origin Check: ${got?'<b>RUSTBORN</b> unlocked! (+1 PER)':'No anomalies detected (this time).'}</div><div class='small'>Secrets unlock more often if you explore in future runs.</div></div>`;
    if(got){ building.stats.PER+=1; }
  }
  updateCreatorButtons();
  ccNext?.focus?.();
}

function finalizeCurrentMember(){
  if(!building) return null;
  if(!building.name || !building.name.trim()) building.name = defaultDrifterName(built.length+1);
  const m=makeMember(building.id, building.name, building.spec||'Wanderer', {permanent:true, portraitSheet: building.portraitSheet});
  m.stats=building.stats; m.origin=building.origin; m.quirk=building.quirk;
  m.special = classSpecials[building.spec||'Wanderer'] || [];
  const spec = specializations[building.spec];
  const specEquipIds=[];
  if(spec){
    if(spec.stats){ for(const k in spec.stats){ m.stats[k]=(m.stats[k]||0)+spec.stats[k]; } }
  if(spec.gear){ spec.gear.forEach(g=>{ addToInv(g); if(['weapon','armor','trinket'].includes(g.type)) specEquipIds.push(g.id); }); }
  }
  const quirk=quirks[building.quirk];
  if(quirk){
    if(quirk.stats){ for(const k in quirk.stats){ m.stats[k]=(m.stats[k]||0)+quirk.stats[k]; } }
    if(quirk.gear){ quirk.gear.forEach(g=> addToInv(g)); }
  }
  joinParty(m);
  const idx=party.indexOf(m);
  specEquipIds.forEach(id=>{
    const invIdx=player.inv.findIndex(it=>it.id===id);
    if(invIdx!==-1) equipItem(idx, invIdx);
  });
  built.push(m);
  building = null;
  return m;
}

function watchModuleLoad(){
  let loaded = false;
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('moduleLoaded', () => { loaded = true; }, { once: true });
    setTimeout(() => {
      if (!loaded) toast?.('Something went wrong loading the module. Check console.');
    }, 500);
  }
}

function beginGame(){
  watchModuleLoad();
  startGame();
  refreshUI();
}

if  (ccBack) ccBack.onclick=()=>{ if(step>1) { step--; renderStep(); } };
if (ccNext) ccNext.onclick=()=>{
  if(step<5){
    step++;
    renderStep();
  } else {
    finalizeCurrentMember();
    if(built.length>=3){
      closeCreator();
      beginGame();
    } else {
      building=newBuilding();
      step=1;
      renderStep();
      log('Member added. You can add up to '+(3-built.length)+' more, or press Start Now.');
    }
  }
};
if (ccStart) ccStart.onclick=()=>{ if(built.length===0){ finalizeCurrentMember(); } closeCreator(); beginGame(); };
if (ccLoad) ccLoad.onclick=()=>{ load(); closeCreator(); };
if (creator?.addEventListener) creator.addEventListener('keydown', e => {
  if(e.key==='Enter'){
    e.preventDefault();
    if(ccNext?.click) ccNext.click(); else ccNext?.onclick?.();
  }
});

function startGame(){
  // No default module; callers should apply their own module data.
}

on('inventory:changed', () => {
  refreshUI();
  queueNanoDialogForNPCs?.('start', 'inventory change');
});

on('item:picked', (it) => {
  log?.(`Picked up ${it.name}`);
  toast?.(`Picked up ${it.name}`);
});

on('mentor:bark', (evt) => {
  if(evt?.text) toast?.(evt.text);
  if(evt?.sound) EventBus.emit('sfx', evt.sound);
});

// Content pack moved to modules/dustland.module.js


const coreExports = {
  ROLL_SIDES,
  DC,
  clamp,
  nextId,
  createRNG,
  Dice,
  refreshUI,
  startCombat,
  TILE,
  walkable,
  mapLabels,
  mapLabel,
  setMap,
  isWalkable,
  VIEW_W,
  VIEW_H,
  TS,
  WORLD_W,
  WORLD_H,
  world,
  interiors,
  buildings,
  portals,
  tileEvents,
  enemyBanks,
  registerTileEvents,
  registerZoneEffects,
  state,
  player,
  GAME_STATE,
  setGameState,
  setPartyPos,
  doorPulseUntil,
  lastInteract,
  creatorMap,
  genCreatorMap,
  applyModule,
  serializeNpcPatch,
  applyNpcPatch,
  genWorld,
  isWater,
  findNearestLand,
  makeInteriorRoom,
  placeHut,
  startGame,
  setRNGSeed,
  worldFlags,
  setFlag,
  incFlag,
  flagValue,
  checkFlagCondition,
  gatherGameState,
  applyGameState,
  showStart,
  hideStart,
  openCreator,
  closeCreator,
  resetAll
};

Object.assign(coreExports, { getGameState: () => gameState });
globalThis.Dustland = globalThis.Dustland || {};
globalThis.Dustland.zoneEffects = zoneEffects;
Object.assign(globalThis.Dustland, coreExports);
Object.assign(globalThis, coreExports);
