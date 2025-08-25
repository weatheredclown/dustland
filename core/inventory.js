// ===== Inventory / equipment =====
const { emit } = globalThis.EventBus;

const ITEMS = {}; // item definitions by id
const itemDrops = []; // {map,x,y,id}
function cloneItem(it){
  return {
    ...it,
    mods: { ...it.mods },
    tags: Array.isArray(it.tags) ? [...it.tags] : [],
    use: it.use ? JSON.parse(JSON.stringify(it.use)) : null,
    equip: it.equip ? JSON.parse(JSON.stringify(it.equip)) : null
  };
}
function registerItem(item){
  const norm = normalizeItem(item);
  if(!norm.id) throw new Error('Item must have id');
  ITEMS[norm.id] = norm;
  return norm;
}
function getItem(id){
  const it = ITEMS[id];
  return it ? cloneItem(it) : null;
}
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

function addToInv(item) {
  if (player.inv.length >= getPartyInventoryCapacity()) {
    return false;
  }
  const it = resolveItem(item);
  if (!it || !it.id) {
    throw new Error('Unknown item');
  }
  const base = cloneItem(ITEMS[it.id] || registerItem(it));
  player.inv.push(base);
  emit('item:picked', base);
  notifyInventoryChanged();
  return true;
}

function removeFromInv(invIndex) {
  player.inv.splice(invIndex, 1);
  notifyInventoryChanged();
}

function equipItem(memberIndex, invIndex){
  const m=party[memberIndex]; const it=player.inv[invIndex];
  if(!m||!it||!it.slot){ log('Cannot equip that.'); return; }
  const slot = it.slot;
  const prevEq = m.equip[slot];
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
    notifyInventoryChanged();
    log(`${m.name} equips ${it.name}.`);
  if(typeof toast==='function') toast(`${m.name} equips ${it.name}`);
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

function normalizeItem(it){
  if(!it) return null;
  return {
    id: it.id || '',
    name: it.name || 'Unknown',
    type: it.type || 'misc',
    tags: Array.isArray(it.tags) ? it.tags.map(t=>t.toLowerCase()) : [],
    slot: it.slot || null,
    mods: it.mods ? { ...it.mods } : {},
    use: it.use || null,
    equip: it.equip || null,
    unequip: it.unequip || null,
    cursed: !!it.cursed,
    cursedKnown: !!it.cursedKnown,
    rarity: it.rarity || 'common',
    value: Math.max(1, it.value ?? 0),
    desc: it.desc || '',
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
    const before = who.hp;
    who.hp = Math.min(who.hp + it.use.amount, who.maxHp);
    const healed = who.hp - before;
    log(`${who.name} drinks ${it.name} (+${healed} HP).`);
    if (typeof toast === 'function') toast(`${who.name} +${healed} HP`);
    emit('sfx','tick');
    player.inv.splice(invIndex,1);
    notifyInventoryChanged();
    return true;
  }
  if(typeof it.use.onUse === 'function'){
    const ok = it.use.onUse({player, party, log, toast});
    if(ok!==false){
        player.inv.splice(invIndex,1);
        notifyInventoryChanged();
        if(typeof toast==='function') toast(`Used ${it.name}`);
        emit('sfx','tick');
    }
    return !!ok;
  }
  log('Nothing happens...');
  return false;
}

const inventoryExports = { ITEMS, itemDrops, registerItem, getItem, resolveItem, addToInv, removeFromInv, equipItem, unequipItem, normalizeItem, findItemIndex, useItem, hasItem, countItems, uncurseItem, getPartyInventoryCapacity, dropItemNearParty };
Object.assign(globalThis, inventoryExports);
