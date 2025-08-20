// ===== Inventory / equipment =====
import { emit } from '../event-bus.js';

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
function addToInv(item){
  if(!item || typeof item !== 'object' || !item.id){
    throw new Error('Unknown item');
  }
  const base = cloneItem(ITEMS[item.id] || registerItem(item));
  player.inv.push(base);
  emit('item:picked', base);
  notifyInventoryChanged();
}
function removeFromInv(invIndex){
  player.inv.splice(invIndex,1);
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
  if(typeof sfxTick==='function') sfxTick();
  if(it.equip && it.equip.teleport){
    const t=it.equip.teleport;
    setPartyPos(t.x, t.y);
    if(t.map) setMap(t.map);
    updateHUD();
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
  if(typeof sfxTick==='function') sfxTick();
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
    if (typeof sfxTick === 'function') sfxTick();
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
        if(typeof sfxTick==='function') sfxTick();
    }
    return !!ok;
  }
  log('Nothing happens...');
  return false;
}

const inventoryExports = { ITEMS, itemDrops, registerItem, getItem, resolveItem, addToInv, removeFromInv, equipItem, unequipItem, normalizeItem, findItemIndex, useItem, hasItem };
Object.assign(globalThis, inventoryExports);

export { ITEMS, itemDrops, registerItem, getItem, resolveItem, addToInv, removeFromInv, equipItem, unequipItem, normalizeItem, findItemIndex, useItem, hasItem };
