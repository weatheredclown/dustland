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
 * @property {'world'|'loot'} [dropType]
 */

globalThis.Dustland = globalThis.Dustland || {};
const { emit } = globalThis.EventBus;

/** @type {Record<string, GameItem>} */
const ITEMS = {};
/** @type {ItemDrop[]} */
const itemDrops = [];
const EQUIP_TYPES = ['weapon','armor','trinket'];
const MAX_INV_STACK = 64;
const CAMP_CHEST_EVENT = 'campChest:changed';
const LOOT_VACUUM_TAG = 'loot_vacuum';
const LOOT_VACUUM_IDS = new Set(['suction_relay']);

function cloneData(obj){
  if(!obj) return null;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    if(Array.isArray(obj)){
      return obj.map(entry => (entry && typeof entry === 'object') ? cloneData(entry) : entry);
    }
    const copy = {};
    for(const key in obj){
      copy[key] = obj[key];
    }
    return copy;
  }
}

function listRequiredRoles(it){
  const roles = [];
  const seen = new Set();
  const req = it?.equip?.requires;
  if(!req) return roles;
  const addRole = value => {
    if(typeof value !== 'string') return;
    const name = value.trim();
    if(!name) return;
    const key = name.toLowerCase();
    if(seen.has(key)) return;
    seen.add(key);
    roles.push(name);
  };
  addRole(req.role);
  if(Array.isArray(req.roles)) req.roles.forEach(addRole);
  return roles;
}

function describeRequiredRoles(it){
  const roles = listRequiredRoles(it);
  if(roles.length === 0) return '';
  if(roles.length === 1) return roles[0];
  if(roles.length === 2) return roles.join(' or ');
  return roles.slice(0, roles.length - 1).join(', ') + ', or ' + roles[roles.length - 1];
}

function inferMinLevelFromStats(it){
  if(!it || it.type !== 'weapon') return 1;
  const atk = Number.isFinite(it.mods?.ATK) ? it.mods.ATK : 0;
  if(atk >= 13) return 7;
  if(atk >= 11) return 6;
  if(atk >= 9) return 5;
  if(atk >= 7) return 4;
  if(atk >= 5) return 3;
  return 1;
}

function getEquipMinLevel(item){
  if(!item || !EQUIP_TYPES.includes(item.type)) return 1;
  const raw = item.equip?.minLevel;
  if(Number.isFinite(raw)){
    return Math.max(1, Math.floor(raw));
  }
  return inferMinLevelFromStats(item);
}

function getEquipRestrictions(member, item){
  const result = {
    allowed: false,
    levelRequired: 1,
    levelMet: true,
    roles: [],
    roleMet: true,
    reasons: []
  };
  if(!item || !EQUIP_TYPES.includes(item.type)){
    result.allowed = false;
    result.reasons.push('Cannot equip that.');
    return result;
  }
  const roles = listRequiredRoles(item);
  result.roles = roles;
  const minLevel = getEquipMinLevel(item);
  result.levelRequired = minLevel;
  const hasMember = !!member;
  const level = hasMember && Number.isFinite(member?.lvl) ? member.lvl : 1;
  const levelMet = !hasMember || level >= minLevel;
  result.levelMet = levelMet;
  if(!levelMet && minLevel > 1){
    result.reasons.push(`Requires level ${minLevel}.`);
  }
  const memberRole = typeof member?.role === 'string' ? member.role.trim().toLowerCase() : '';
  const roleMet = !hasMember || roles.length === 0 || (memberRole && roles.some(role => role.toLowerCase() === memberRole));
  result.roleMet = roleMet;
  if(!roleMet && roles.length){
    const reqText = describeRequiredRoles(item);
    result.reasons.push(reqText ? `Only ${reqText} can equip.` : 'Cannot equip.');
  }
  result.allowed = hasMember ? (levelMet && roleMet) : false;
  return result;
}

function canEquip(member, item){
  if(!member || !item || !EQUIP_TYPES.includes(item.type)) return false;
  return getEquipRestrictions(member, item).allowed;
}

function isStackable(it){
  if(!it) return false;
  if(!EQUIP_TYPES.includes(it.type)) return true;
  const rarity = typeof it.rarity === 'string' ? it.rarity.toLowerCase() : '';
  return rarity === 'common';
}

function getStackCount(it){
  return Math.max(1, Number.isFinite(it?.count) ? it.count : 1);
}

function setStackCount(it, count){
  if(!it) return;
  const next = Math.max(0, count|0);
  if(next <= 1){
    delete it.count;
  } else {
    it.count = next;
  }
}

function getStackLimit(it){
  if(!isStackable(it)) return 1;
  const raw = Number.isFinite(it?.maxStack) ? it.maxStack : MAX_INV_STACK;
  return Math.max(1, Math.min(MAX_INV_STACK, raw));
}
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

function ensureCampChest(){
  const p = globalThis.player || {};
  if(!Array.isArray(p.campChest)){
    p.campChest = [];
  }
  return p.campChest;
}

function emitCampChestChanged(){
  const chest = ensureCampChest();
  emit(CAMP_CHEST_EVENT, { chest: cloneData(chest) });
}

function isCampChestUnlocked(){
  return !!globalThis.player?.campChestUnlocked;
}

function unlockCampChest(){
  const p = globalThis.player;
  if(!p) return false;
  if(!p.campChestUnlocked){
    p.campChestUnlocked = true;
    const chest = ensureCampChest();
    if(Array.isArray(chest) && chest.length === 0){
      const medkit = getItem('medkit');
      if(medkit){
        setStackCount(medkit, 10);
        mergeIntoCampChest(medkit);
      }
    }
    emitCampChestChanged();
  }
  return true;
}

function addExistingItemToInventory(item){
  if(!item || !item.id) return false;
  if(!Array.isArray(player.inv)) player.inv = [];
  const capacity = getPartyInventoryCapacity();
  if(isStackable(item)){
    const limit = getStackLimit(item);
    const total = getStackCount(item);
    let remaining = total;
    const stackPlan = [];
    player.inv.forEach((invItem, idx) => {
      if(!invItem || invItem.id !== item.id || !isStackable(invItem)) return;
      const space = getStackLimit(invItem) - getStackCount(invItem);
      if(space <= 0) return;
      const add = Math.min(space, remaining);
      if(add > 0){
        stackPlan.push({ idx, add });
        remaining -= add;
      }
    });
    const neededSlots = Math.ceil(Math.max(0, remaining) / Math.max(1, limit));
    if(player.inv.length + neededSlots > capacity){
      return false;
    }
    let applied = 0;
    stackPlan.forEach(({ idx, add }) => {
      const target = player.inv[idx];
      setStackCount(target, getStackCount(target) + add);
      applied += add;
    });
    let leftover = total - applied;
    if(leftover > 0){
      const first = item;
      const firstAdd = Math.min(limit, leftover);
      setStackCount(first, firstAdd);
      player.inv.push(first);
      leftover -= firstAdd;
      while(leftover > 0){
        const extra = cloneItem(item);
        const add = Math.min(limit, leftover);
        setStackCount(extra, add);
        player.inv.push(extra);
        leftover -= add;
      }
    }
  }else{
    if(player.inv.length >= capacity){
      return false;
    }
    player.inv.push(item);
  }
  notifyInventoryChanged();
  return true;
}

function mergeIntoCampChest(item){
  if(!item || !item.id) return;
  const chest = ensureCampChest();
  if(!isStackable(item)){
    chest.push(item);
    return;
  }
  const limit = getStackLimit(item);
  let remaining = getStackCount(item);
  for(const entry of chest){
    if(!entry || entry.id !== item.id || !isStackable(entry)) continue;
    const space = getStackLimit(entry) - getStackCount(entry);
    if(space <= 0) continue;
    const add = Math.min(space, remaining);
    if(add > 0){
      setStackCount(entry, getStackCount(entry) + add);
      remaining -= add;
    }
    if(remaining <= 0) break;
  }
  if(remaining > 0){
    const first = item;
    const firstAdd = Math.min(limit, remaining);
    setStackCount(first, firstAdd);
    chest.push(first);
    remaining -= firstAdd;
    while(remaining > 0){
      const extra = cloneItem(item);
      const add = Math.min(limit, remaining);
      setStackCount(extra, add);
      chest.push(extra);
      remaining -= add;
    }
  }
}

function storeCampChestItem(invIndex){
  if(!isCampChestUnlocked()) return false;
  if(!Array.isArray(player.inv)) player.inv = [];
  if(invIndex < 0 || invIndex >= player.inv.length) return false;
  const removed = player.inv.splice(invIndex, 1)[0];
  if(!removed) return false;
  mergeIntoCampChest(removed);
  notifyInventoryChanged();
  emitCampChestChanged();
  return true;
}

function withdrawCampChestItem(chestIndex){
  if(!isCampChestUnlocked()) return false;
  const chest = ensureCampChest();
  if(chestIndex < 0 || chestIndex >= chest.length) return false;
  const removed = chest[chestIndex];
  if(!removed) return false;
  const toAdd = isStackable(removed) ? cloneItem(removed) : removed;
  const added = addExistingItemToInventory(toAdd);
  if(!added){
    if(typeof log === 'function') log('Inventory full.');
    return false;
  }
  chest.splice(chestIndex, 1);
  emitCampChestChanged();
  return true;
}

function getCampChest(){
  return ensureCampChest();
}
function getPartyInventoryCapacity() {
  return party.length * 20;
}

function getLeaderMember(){
  if (typeof leader === 'function') {
    try {
      const member = leader();
      if (member) return member;
    } catch (err) {
      // ignore leader lookup errors
    }
  }
  if (party && typeof party.leader === 'function') {
    try {
      const member = party.leader();
      if (member) return member;
    } catch (err) {
      // ignore leader lookup errors
    }
  }
  if (Array.isArray(party) && party.length) {
    return party[0];
  }
  return null;
}

function isLootVacuumItem(it){
  if (!it) return false;
  const tags = Array.isArray(it.tags) ? it.tags : [];
  if (tags.some(tag => typeof tag === 'string' && tag.toLowerCase() === LOOT_VACUUM_TAG)) {
    return true;
  }
  const id = typeof it.id === 'string' ? it.id.toLowerCase() : '';
  if (id && LOOT_VACUUM_IDS.has(id)) return true;
  const baseId = typeof it.baseId === 'string' ? it.baseId.toLowerCase() : '';
  if (baseId && LOOT_VACUUM_IDS.has(baseId)) return true;
  return false;
}

function leaderHasLootVacuum(){
  const lead = getLeaderMember();
  if (!lead || !lead.equip) return false;
  return isLootVacuumItem(lead.equip.trinket);
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
  itemDrops.push({ id: base.id, map: party.map, x: party.x, y: party.y, dropType: 'loot' });
  log(`Inventory full, ${base.name} was dropped.`);
  if (typeof toast === 'function') toast(`Inventory full, ${base.name} was dropped.`);
}

/**
 * Attempt to automatically collect a loot drop near the party.
 * @param {ItemDrop} drop
 * @returns {boolean}
 */
function tryAutoPickup(drop) {
  if (!drop || drop.dropType !== 'loot') return false;
  if (!player || !Array.isArray(player.inv)) return false;
  if (!party) return false;
  const mapId = typeof drop.map === 'string' ? drop.map : 'world';
  if (mapId !== party.map) return false;
  const dx = typeof drop.x === 'number' ? drop.x - party.x : 0;
  const dy = typeof drop.y === 'number' ? drop.y - party.y : 0;
  const distance = Math.abs(dx) + Math.abs(dy);
  const sameTile = distance === 0;
  const vacuumActive = !sameTile && distance === 1 && leaderHasLootVacuum();
  if (!sameTile && !vacuumActive) return false;
  let took = false;
  const messages = [];
  if (Array.isArray(drop.items) && drop.items.length) {
    took = pickupCache(drop);
    if (took) messages.push(`Took ${drop.items.length} items.`);
  } else if (drop.id) {
    const item = getItem(drop.id);
    if (!item) return false;
    took = addToInv(item);
  }
  if (!took) return false;
  const idx = itemDrops.indexOf(drop);
  if (idx > -1) itemDrops.splice(idx, 1);
  if (vacuumActive) {
    globalThis.pickupVacuum?.(drop.x, drop.y, party.x, party.y);
  } else if (typeof pickupSparkle === 'function') {
    pickupSparkle(drop.x, drop.y);
  }
  messages.forEach(msg => { if (typeof log === 'function') log(msg); });
  if (typeof updateHUD === 'function') updateHUD();
  globalThis.EventBus?.emit?.('sfx', 'pickup');
  return true;
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
  const capacity = getPartyInventoryCapacity();
  const stackable = isStackable(base);
  let quantity = Math.max(1, Number.isFinite(base.count) ? base.count : 1);
  if (stackable) {
    let remaining = quantity;
    const stackPlan = [];
    player.inv.forEach((invItem, idx) => {
      if (!invItem || invItem.id !== base.id || !isStackable(invItem)) return;
      const space = getStackLimit(invItem) - getStackCount(invItem);
      if (space <= 0) return;
      const add = Math.min(space, remaining);
      if (add > 0) {
        stackPlan.push({ idx, add });
        remaining -= add;
      }
    });
    const limit = getStackLimit(base);
    const slotsNeeded = Math.ceil(Math.max(0, remaining) / Math.max(1, limit));
    if (player.inv.length + slotsNeeded > capacity) {
      return false;
    }
    stackPlan.forEach(({ idx, add }) => {
      const target = player.inv[idx];
      setStackCount(target, getStackCount(target) + add);
      quantity -= add;
    });
    let leftover = quantity;
    let usedBase = false;
    while (leftover > 0) {
      const toAdd = Math.min(getStackLimit(base), leftover);
      const entry = !usedBase ? base : cloneItem(base);
      setStackCount(entry, toAdd);
      player.inv.push(entry);
      leftover -= toAdd;
      usedBase = true;
    }
  } else {
    if (player.inv.length >= capacity) {
      return false;
    }
    setStackCount(base, 1);
    player.inv.push(base);
  }
  emit('item:picked', base);
  if(base.narrative){
    emit('item:narrative', { itemId: base.id, narrative: base.narrative });
  }
  notifyInventoryChanged();
  return true;
}

function removeFromInv(invIndex, quantity) {
  if (invIndex < 0 || invIndex >= player.inv.length) return;
  const it = player.inv[invIndex];
  if (!it) return;
  const stackable = isStackable(it);
  const current = getStackCount(it);
  const amt = stackable
    ? (Number.isFinite(quantity) ? Math.max(1, quantity | 0) : 1)
    : 1;
  if (stackable && current > amt) {
    setStackCount(it, current - amt);
    notifyInventoryChanged();
    return;
  }
  player.inv.splice(invIndex, 1);
  notifyInventoryChanged();
}

function maybeConsumeItem(it, invIndex) {
  if (it?.use?.consume === false) return;
  removeFromInv(invIndex);
}

// Drop multiple items from inventory as a single cache on the ground
/**
 * @param {number[]} indices
 * @returns {number}
 */
function dropItems(indices) {
  if (!Array.isArray(indices) || indices.length === 0) return 0;
  const drops = [];
  const counts = new Map();
  indices.forEach(i => {
    const it = player.inv[i];
    if (!it || !it.id) return;
    const qty = getStackCount(it);
    counts.set(i, qty);
    for (let n = 0; n < qty; n++) drops.push(it.id);
  });
  const sorted = Array.from(counts.keys()).sort((a, b) => b - a);
  for (const idx of sorted) {
    removeFromInv(idx, counts.get(idx));
  }
  if (drops.length) {
    itemDrops.push({ items: drops, map: party.map, x: party.x, y: party.y, dropType: 'loot' });
  }
  return drops.length;
}

// Add all items from a cache drop into inventory
/**
 * @param {ItemDrop} drop
 * @returns {boolean}
 */
function pickupCache(drop) {
  const ids = Array.isArray(drop?.items) ? drop.items : (drop?.id ? [drop.id] : []);
  if (!ids.length) return true;
  const capacity = getPartyInventoryCapacity();
  const tempStacks = player.inv.map(it => ({ id: it.id, count: getStackCount(it), limit: getStackLimit(it), stackable: isStackable(it) }));
  let needed = 0;
  ids.forEach(id => {
    const item = getItem(id);
    if (!item) {
      needed++;
      return;
    }
    if (!isStackable(item)) {
      needed++;
      tempStacks.push({ id: item.id, count: 1, limit: 1, stackable: false });
      return;
    }
    const stack = tempStacks.find(entry => entry.id === item.id && entry.stackable && entry.count < entry.limit);
    if (stack) {
      stack.count++;
      return;
    }
    needed++;
    tempStacks.push({ id: item.id, count: 1, limit: getStackLimit(item), stackable: true });
  });
  if (player.inv.length + needed > capacity) {
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
  const restrictions = getEquipRestrictions(m, it);
  if(!restrictions.allowed){
    const msg = restrictions.reasons.length
      ? `${it.name}: ${restrictions.reasons.join(' ')}`
      : `${m.name} cannot equip ${it.name}.`;
    log(msg);
    if(typeof toast==='function') toast(msg);
    return;
  }
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
    setStackCount(prevEq, 1);
    if(!addExistingItemToInventory(prevEq)){
      player.inv.push(prevEq);
    }
  }
  const stackable = isStackable(it);
  const count = getStackCount(it);
  const removeEntry = !stackable || count <= 1;
  let equipped = it;
  if(stackable && count > 1){
    equipped = cloneItem(it);
    setStackCount(equipped, 1);
    setStackCount(it, count - 1);
  }
  if(removeEntry){
    player.inv.splice(invIndex,1);
  }
  m.equip[slot]=equipped;
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
  setStackCount(it, 1);
  const added = addExistingItemToInventory(it);
  if(!added){
    player.inv.push(it);
  }
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
  const baseId = typeof it.baseId === 'string' && it.baseId ? it.baseId : undefined;
  return {
    id: it.id || '',
    name: it.name || 'Unknown',
    type,
    baseId,
    rank: it.rank,
    tags: Array.isArray(it.tags) ? it.tags.map(t=>t.toLowerCase()) : [],
    mods: it.mods ? { ...it.mods } : {},
    use: it.use || null,
    equip: cloneData(it.equip),
    unequip: cloneData(it.unequip),
    cursed: !!it.cursed,
    cursedKnown: !!it.cursedKnown,
    rarity: typeof it.rarity === 'string' ? it.rarity.toLowerCase() : 'common',
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
      return count + getStackCount(it);
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
    if (it.id === 'wand'){
      const label = it.use?.label || it.name;
      const defeated = globalThis.defeatEnemiesByRequirement?.('wand', {
        attacker: who,
        label,
        itemLabel: label
      }) || [];
      if (defeated.length){
        emit('sfx','damage');
      }
    }
    maybeConsumeItem(it, invIndex);
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
    maybeConsumeItem(it, invIndex);
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
    maybeConsumeItem(it, invIndex);
    emit(`used:${it.id}`, { item: it });
    return true;
  }
  if(it.use.type==='grenade'){
    const combatState = globalThis.__combatState;
    const enemies = Array.isArray(combatState?.enemies) ? combatState.enemies : [];
    if(enemies.length === 0){ log('You can only use that in combat.'); return false; }
    const who = (party[selectedMember]||party[0]);
    if(!who){ log('No party member to throw that.'); return false; }
    const dmg = Math.max(0, it.use.amount | 0);
    const msg = it.use.text || `${who.name} hurls ${it.name}!`;
    log(msg);
    if(typeof toast==='function') toast(msg);
    const label = it.use.label || it.name;
    const ignoreDefense = !!it.use.ignoreDefense;
    const aoe = globalThis.playerItemAOEDamage;
    if (typeof aoe === 'function') {
      aoe(who, dmg, { label, ignoreDefense });
    } else {
      for (const target of enemies){
        const dealt = ignoreDefense ? dmg : Math.max(0, dmg - (target.DEF || 0));
        target.hp -= dealt;
        if (dealt > 0) log?.(`${who.name}'s ${label} hits ${target.name} for ${dealt} damage.`);
        if (target.hp <= 0) target.hp = 0;
      }
      globalThis.renderCombat?.();
    }
    emit('sfx','damage');
    maybeConsumeItem(it, invIndex);
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
    maybeConsumeItem(it, invIndex);
    emit(`used:${it.id}`, { item: it });
    return true;
  }
  const effectList = [];
  if (Array.isArray(it.use.effects)) {
    for (const entry of it.use.effects) {
      if (!entry) continue;
      if (typeof entry === 'string') effectList.push({ effect: entry });
      else if (typeof entry === 'object') effectList.push({ ...entry });
    }
  }
  if (it.use.effect) {
    if (typeof it.use.effect === 'string') {
      const extra = {};
      for (const [key, value] of Object.entries(it.use)) {
        if (key === 'effect' || key === 'effects' || key === 'consume' || key === 'text' || key === 'toast') continue;
        extra[key] = value;
      }
      effectList.push({ effect: it.use.effect, ...extra });
    } else if (typeof it.use.effect === 'object') {
      effectList.push({ ...it.use.effect });
    }
  }
  if (effectList.length) {
    globalThis.Dustland?.effects?.apply?.(effectList, { player, party, item: it });
    maybeConsumeItem(it, invIndex);
    const msg = it.use.text || `Used ${it.name}`;
    log(msg);
    if (typeof toast === 'function') toast(it.use.toast || msg);
    emit('sfx','tick');
    emit(`used:${it.id}`, { item: it });
    return true;
  }
  if(typeof it.use.onUse === 'function'){
    const ok = it.use.onUse({player, party, log, toast});
    if(ok!==false){
        maybeConsumeItem(it, invIndex);
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

const inventoryExports = { ITEMS, itemDrops, registerItem, getItem, resolveItem, addToInv, removeFromInv, equipItem, unequipItem, normalizeItem, findItemIndex, useItem, hasItem, countItems, uncurseItem, getPartyInventoryCapacity, dropItemNearParty, dropItems, pickupCache, tryAutoPickup, loadStarterItems, canEquip, describeRequiredRoles, getEquipMinLevel, getEquipRestrictions, getCampChest, isCampChestUnlocked, unlockCampChest, storeCampChestItem, withdrawCampChestItem, leaderHasLootVacuum, isLootVacuumItem };
globalThis.Dustland.inventory = inventoryExports;
Object.assign(globalThis, inventoryExports);
