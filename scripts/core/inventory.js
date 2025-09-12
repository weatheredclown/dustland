// ===== Inventory / equipment =====

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
 * @property {{id:string, prompt?:string}} [narrative]
 */

/**
 * @typedef {object} ItemDrop
 * @property {string} map
 * @property {number} x
 * @property {number} y
 * @property {string} [id]
 * @property {string[]} [items]
 */

globalThis.Dustland = globalThis.Dustland || {};
const { emit } = globalThis.EventBus;

/** @type {Record<string, GameItem>} */
const ITEMS = {};
/** @type {ItemDrop[]} */
const itemDrops = [];
const EQUIP_TYPES = ['weapon','armor','trinket'];
function cloneItem(it){
  return {
    ...it,
    mods: { ...it.mods },
    tags: Array.isArray(it.tags) ? [...it.tags] : [],
    use: it.use ? JSON.parse(JSON.stringify(it.use)) : null,
    equip: it.equip ? JSON.parse(JSON.stringify(it.equip)) : null,
    narrative: it.narrative ? { ...it.narrative } : null
  };
}
/**
 * @param {GameItem} item
 * @returns {GameItem}
 */
function registerItem(item){
  const norm = normalizeItem(item);
  if(!norm.id) throw new Error('Item must have id');
  ITEMS[norm.id] = norm;
  return norm;
}
/**
 * @param {string} id
 * @returns {GameItem|null}
 */
function getItem(id){
  const it = ITEMS[id];
  return it ? cloneItem(it) : null;
}
/**
 * @param {string|GameItem} def
 * @returns {GameItem|null}
 */
function resolveItem(def){
  if(!def) return null;
  const id = typeof def === 'string' ? def : def.id;
  let it = id ? getItem(id) : null;
  if(!it && typeof def === 'object') it = def;
  return it;
}
function notifyInventoryChanged(){
  emit('inventory:changed');
}
function getPartyInventoryCapacity() {
  return party.length * 20;
}

function loadStarterItems(){
  try {
    const items = globalThis.Dustland && globalThis.Dustland.starterItems;
    if (Array.isArray(items)) {
      items.forEach(it => addToInv(it));
    }
  } catch (e) {
    // ignore load errors
  }
}

/**
 * @param {string|GameItem} item
 */
function dropItemNearParty(item) {
  const it = resolveItem(item);
  if (!it || !it.id) {
    throw new Error('Unknown item');
  }
  const base = cloneItem(ITEMS[it.id] || registerItem(it));
  itemDrops.push({ id: base.id, map: party.map, x: party.x, y: party.y });
  log(`Inventory full, ${base.name} was dropped.`);
  if (typeof toast === 'function') toast(`Inventory full, ${base.name} was dropped.`);
}

/**
 * @param {string|GameItem} item
 * @returns {boolean}
 */
function addToInv(item) {
  const it = resolveItem(item);
  if (!it || !it.id) {
    throw new Error('Unknown item');
  }
  const base = cloneItem(ITEMS[it.id] || registerItem(it));
  const fuel = typeof base.fuel === 'number' ? base.fuel : (base.id === 'fuel_cell' ? 50 : 0);
  if (fuel > 0) {
    player.fuel = (player.fuel || 0) + fuel;
    emit('item:picked', base);
    if (base.narrative) {
      emit('item:narrative', { itemId: base.id, narrative: base.narrative });
    }
    notifyInventoryChanged();
    if (typeof log === 'function') log('Fuel +' + fuel);
    return true;
  }
  if (player.inv.length >= getPartyInventoryCapacity()) {
    return false;
  }
  player.inv.push(base);
  emit('item:picked', base);
  if(base.narrative){
    emit('item:narrative', { itemId: base.id, narrative: base.narrative });
  }
  notifyInventoryChanged();
  return true;
}

function removeFromInv(invIndex) {
  player.inv.splice(invIndex, 1);
  notifyInventoryChanged();
}

// Drop multiple items from inventory as a single cache on the ground
/**
 * @param {number[]} indices
 * @returns {number}
 */
function dropItems(indices) {
  if (!Array.isArray(indices) || indices.length === 0) return 0;
  const ids = indices.map(i => {
    const it = player.inv[i];
    return it ? it.id : null;
  }).filter(Boolean);
  const sorted = [...indices].sort((a, b) => b - a);
  for (const idx of sorted) {
    if (idx >= 0) player.inv.splice(idx, 1);
  }
  if (ids.length) {
    itemDrops.push({ items: ids, map: party.map, x: party.x, y: party.y });
    notifyInventoryChanged();
  }
  return ids.length;
}

// Add all items from a cache drop into inventory
/**
 * @param {ItemDrop} drop
 * @returns {boolean}
 */
function pickupCache(drop) {
  const ids = Array.isArray(drop?.items) ? drop.items : (drop?.id ? [drop.id] : []);
  if (player.inv.length + ids.length > getPartyInventoryCapacity()) {
    log('Inventory is full.');
    if (typeof toast === 'function') toast('Inventory is full.');
    return false;
  }
  ids.forEach(id => addToInv(getItem(id)));
  return true;
}

/**
 * @param {number} memberIndex
 * @param {number} invIndex
 */
function equipItem(memberIndex, invIndex){
  const m=party[memberIndex]; const it=player.inv[invIndex];
  if(!m||!it||!EQUIP_TYPES.includes(it.type)){ log('Cannot equip that.'); return; }
  const slot = it.type;
  const prevEq = m.equip[slot];
  const before = { ...(m._bonus || {}) };
  if(prevEq){
    if(prevEq.cursed){
      prevEq.cursedKnown = true;
      notifyInventoryChanged();
      log(`${prevEq.name} is cursed and cannot be removed.`);
      return;
    }
    player.inv.push(prevEq);
  }
  m.equip[slot]=it;
  player.inv.splice(invIndex,1);
  applyEquipmentStats(m);
  const after = m._bonus || {};
  const deltas = [];
  const stats = new Set([...Object.keys(before), ...Object.keys(after)]);
  stats.forEach(stat => {
    const diff = (after[stat] || 0) - (before[stat] || 0);
    if(diff) deltas.push(`${diff>0?'+':''}${diff} ${stat}`);
  });
  notifyInventoryChanged();
  log(`${m.name} equips ${it.name}.`);
  if(typeof toast==='function'){ toast(`${m.name} equips ${it.name}`); if(deltas.length) toast(deltas.join(', ')); }
  emit('sfx','tick');
  if(it.equip && it.equip.teleport){
    const t=it.equip.teleport;
    setPartyPos(t.x, t.y);
    if(t.map) setMap(t.map);
    updateHUD();
  }
  if(it.equip && it.equip.flag){
    incFlag(it.equip.flag);
  }
  if(it.equip && it.equip.msg){
    log(it.equip.msg);
  }
}

/**
 * @param {number} memberIndex
 * @param {string} slot
 */
function unequipItem(memberIndex, slot){
  const m=party[memberIndex];
  if(!m) return;
  const it=m.equip[slot];
  if(!it){ log('Nothing to unequip.'); return; }
  if(it.cursed){
    it.cursedKnown = true;
      notifyInventoryChanged();
      log(`${it.name} is cursed and won't come off!`);
      return;
    }
    m.equip[slot]=null;
    player.inv.push(it);
    applyEquipmentStats(m);
    notifyInventoryChanged();
    log(`${m.name} unequips ${it.name}.`);
  if(typeof toast==='function') toast(`${m.name} unequips ${it.name}`);
  emit('sfx','tick');
  if(it.unequip && it.unequip.teleport){
    const t=it.unequip.teleport;
    setPartyPos(t.x, t.y);
    if(t.map) setMap(t.map);
    updateHUD();
  }
  if(it.unequip && it.unequip.msg){
    log(it.unequip.msg);
  }
}

// Remove curse flag from item with given id in inventory or equipped slots
/**
 * @param {string} id
 * @returns {boolean}
 */
function uncurseItem(id){
  if(!id) return false;
  let found=false;
  for(const it of player.inv){
    if(it.id===id){ it.cursed=false; it.cursedKnown=false; found=true; }
  }
  for(const m of party){
    ['weapon','armor','trinket'].forEach(sl=>{
      const eq=m.equip[sl];
      if(eq && eq.id===id){ eq.cursed=false; eq.cursedKnown=false; found=true; }
    });
  }
  if(found) notifyInventoryChanged();
  return found;
}

/**
 * @param {GameItem} it
 * @returns {number}
 */
function estimateItemValue(it){
  let val = 0;
  if(it.use){
    if(it.use.type==='heal'){
      val += it.use.amount || 0;
    }
    if(it.use.type==='boost'){
      const amt = it.use.amount || 0;
      const dur = it.use.duration || 0;
      val += amt * (dur || 1);
    }
  }
  for(const v of Object.values(it.mods || {})){
    if(v>0) val += v*10;
  }
  return val;
}

function normalizeItem(it){
  if(!it) return null;
  const baseValue = typeof it.value === 'number' ? it.value : 0;
  const val = baseValue > 0 ? baseValue : estimateItemValue(it);
  const type = it.type || it.slot || 'misc';
  return {
    id: it.id || '',
    name: it.name || 'Unknown',
    type,
    rank: it.rank,
    tags: Array.isArray(it.tags) ? it.tags.map(t=>t.toLowerCase()) : [],
    mods: it.mods ? { ...it.mods } : {},
    use: it.use || null,
    equip: it.equip || null,
    unequip: it.unequip || null,
    cursed: !!it.cursed,
    cursedKnown: !!it.cursedKnown,
    rarity: it.rarity || 'common',
    value: val,
    scrap: typeof it.scrap === 'number' ? it.scrap : undefined,
    fuel: typeof it.fuel === 'number' ? it.fuel : undefined,
    desc: it.desc || '',
    persona: it.persona,
    narrative: it.narrative ? { ...it.narrative } : null,
  };
}

function findItemIndex(idOrTag){
  const tag = typeof idOrTag === 'string' ? idOrTag.toLowerCase() : '';
  return player.inv.findIndex(it => it.id === idOrTag || it.tags.map(t=>t.toLowerCase()).includes(tag));
}
function hasItem(idOrTag){ return findItemIndex(idOrTag) !== -1; }
function countItems(idOrTag) {
  const tag = typeof idOrTag === 'string' ? idOrTag.toLowerCase() : '';
  return player.inv.reduce((count, it) => {
    if (it.id === idOrTag || it.tags.map(t => t.toLowerCase()).includes(tag)) {
      return count + 1;
    }
    return count;
  }, 0);
}

function useItem(invIndex){
  const it = player.inv[invIndex];
  if(!it || !it.use){
    log('Cannot use that.');
    return false;
  }
  if(it.use.type==='heal'){
    const who = (party[selectedMember]||party[0]);
    if(!who){ log('No party member to heal.'); return false; }
    const base   = it.use.amount;
    const luck   = (who.stats?.LCK || 0) + (who._bonus?.LCK || 0);
    const eff    = Math.max(0, luck - 4);
    const bonus  = Math.floor(base * eff * 0.05);
    const before = who.hp;
    who.hp = Math.min(who.hp + base + bonus, who.maxHp);
    const healed = who.hp - before;
    const msg = it.use.text || `${who.name} drinks ${it.name} (+${healed} HP).`;
    log(msg);
    if (bonus > 0 && !it.use.text) log('Lucky boost!');
    if (typeof toast === 'function') toast(it.use.text || `${who.name} +${healed} HP`);
    emit('sfx','tick');
    player.inv.splice(invIndex,1);
    notifyInventoryChanged();
    player.hp = party[0] ? party[0].hp : player.hp;
    if(typeof updateHUD === 'function') updateHUD();
    emit(`used:${it.id}`, { item: it });
    return true;
  }
  if(it.use.type==='hydrate'){
    const who = (party[selectedMember]||party[0]);
    if(!who){ log('No party member to hydrate.'); return false; }
    if(typeof who.hydration !== 'number') who.hydration = 0;
    const before = who.hydration;
    const amt = it.use.amount || 1;
    const max = 2;
    who.hydration = Math.min(max, before + amt);
    const msg = it.use.text || `${who.name} drinks ${it.name}.`;
    log(msg);
    if(typeof toast==='function') toast(it.use.text || `${who.name} +${who.hydration - before} HYD`);
    player.inv.splice(invIndex,1);
    notifyInventoryChanged();
    globalThis.updateHUD?.();
    emit('sfx','tick');
    emit(`used:${it.id}`, { item: it });
    return true;
  }
  if(it.use.type==='boost'){
    const who = (party[selectedMember]||party[0]);
    if(!who){ log('No party member to boost.'); return false; }
    const buffList = globalThis.Dustland?.movement?.buffs;
    globalThis.Dustland?.effects?.apply?.([{ effect:'modStat', stat: it.use.stat, delta: it.use.amount, duration: it.use.duration }], { actor: who, buffs: buffList });
    const msg = it.use.text || `${who.name} feels different.`;
    log(msg);
    if(typeof toast==='function') toast(msg);
    emit('sfx','tick');
    player.inv.splice(invIndex,1);
    notifyInventoryChanged();
    emit(`used:${it.id}`, { item: it });
    return true;
  }
  if(it.use.type==='cleanse'){
    const who = (party[selectedMember]||party[0]);
    if(!who){ log('No party member to cleanse.'); return false; }
    if(Array.isArray(who.statusEffects)){
      who.statusEffects.length = 0;
    }
    const msg = it.use.text || `${who.name} feels purified.`;
    log(msg);
    if(typeof toast==='function') toast(it.use.text || `${who.name} is cleansed`);
    emit('sfx','tick');
    player.inv.splice(invIndex,1);
    notifyInventoryChanged();
    emit(`used:${it.id}`, { item: it });
    return true;
  }
  if(typeof it.use.onUse === 'function'){
    const ok = it.use.onUse({player, party, log, toast});
    if(ok!==false){
        player.inv.splice(invIndex,1);
        notifyInventoryChanged();
        const msg = it.use.text || `Used ${it.name}`;
        log(msg);
        if(typeof toast==='function') toast(msg);
        emit('sfx','tick');
        emit(`used:${it.id}`, { item: it });
    }
    return !!ok;
  }
  log('Nothing happens...');
  return false;
}

const inventoryExports = { ITEMS, itemDrops, registerItem, getItem, resolveItem, addToInv, removeFromInv, equipItem, unequipItem, normalizeItem, findItemIndex, useItem, hasItem, countItems, uncurseItem, getPartyInventoryCapacity, dropItemNearParty, dropItems, pickupCache, loadStarterItems };
globalThis.Dustland.inventory = inventoryExports;
Object.assign(globalThis, inventoryExports);
