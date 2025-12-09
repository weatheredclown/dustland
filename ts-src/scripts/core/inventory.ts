// ===== Inventory / equipment =====

globalThis.Dustland = globalThis.Dustland || {};

type _EquipType = 'weapon' | 'armor' | 'trinket';

interface _ItemDrop {
  map: string;
  x: number;
  y: number;
  id?: string;
  items?: string[];
  dropType?: 'world' | 'loot';
}

const _inventoryEventBus: DustlandEventBus | undefined =
  globalThis.Dustland?.eventBus ?? globalThis.EventBus;

const _emit = (event: string, payload?: any): void => {
  _inventoryEventBus?.emit(event, payload);
};

type _InventoryGlobals = DustlandGlobals & {
  player?: PlayerState;
  party?: Party;
  leader?: () => PartyMember | undefined;
  applyEquipmentStats?: (member: PartyMember) => void;
  playerItemAOEDamage?: (
    member: PartyMember,
    damage: number,
    options: { label?: string; ignoreDefense?: boolean }
  ) => void;
  __combatState?: {
    enemies?: Array<{ name?: string; DEF?: number; hp: number;[key: string]: unknown }>;
    phase?: string;
    mode?: string;
    turns?: number;
    [key: string]: unknown;
  };
};

const _globals = globalThis as unknown as _InventoryGlobals;
const _getPlayer = (): PlayerState => {
  const current = _globals.player ?? (_globals.player = { inv: [] as PartyItem[], campChest: [] as PartyItem[], campChestUnlocked: false } as PlayerState);
  if (!Array.isArray(current.inv)) {
    current.inv = [] as PartyItem[];
  }
  return current;
};
const _getParty = (): Party => _globals.party as Party;
const _getPartyState = (): Party & { map: string; x: number; y: number } =>
  (_getParty() as Party & { map: string; x: number; y: number });
const _ensureInventory = (): PartyItem[] => {
  const current = _getPlayer();
  if (!Array.isArray(current.inv)) {
    current.inv = [] as PartyItem[];
  }
  return current.inv as PartyItem[];
};


const _ITEMS: Record<string, GameItem> = {};
const _itemDrops: _ItemDrop[] = [];
const _EQUIP_TYPES: _EquipType[] = ['weapon', 'armor', 'trinket'];
const _isEquipType = (value: string | undefined): value is _EquipType =>
  value === 'weapon' || value === 'armor' || value === 'trinket';
const _MAX_INV_STACK = 64;
const _CAMP_CHEST_EVENT = 'campChest:changed';
const _LOOT_VACUUM_TAG = 'loot_vacuum';
const _LOOT_VACUUM_IDS = new Set(['suction_relay']);

function _cloneData<T>(obj: T): T {
  if (!obj) return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    if (Array.isArray(obj)) {
      return obj.map(entry => (entry && typeof entry === 'object') ? _cloneData(entry) : entry) as unknown as T;
    }
    const copy = {} as T;
    for (const key in obj) {
      copy[key] = obj[key];
    }
    return copy;
  }
}

function _listRequiredRoles(it: GameItem | null | undefined): string[] {
  const roles: string[] = [];
  const seen = new Set<string>();
  const req = it?.equip?.requires;
  if (!req) return roles;
  const addRole = (value: unknown) => {
    if (typeof value !== 'string') return;
    const name = value.trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    roles.push(name);
  };
  addRole(req.role);
  if (Array.isArray(req.roles)) req.roles.forEach(addRole);
  return roles;
}

function _describeRequiredRoles(it: GameItem | null | undefined): string {
  const roles = _listRequiredRoles(it);
  if (roles.length === 0) return '';
  if (roles.length === 1) return roles[0];
  if (roles.length === 2) return roles.join(' or ');
  return roles.slice(0, roles.length - 1).join(', ') + ', or ' + roles[roles.length - 1];
}

function _inferMinLevelFromStats(it: GameItem | null | undefined): number {
  if (!it || it.type !== 'weapon') return 1;
  const atk = Number.isFinite(it.mods?.ATK) ? it.mods!.ATK! : 0;
  if (atk >= 13) return 7;
  if (atk >= 11) return 6;
  if (atk >= 9) return 5;
  if (atk >= 7) return 4;
  if (atk >= 5) return 3;
  return 1;
}

function _getEquipMinLevel(item: GameItem | null | undefined): number {
  if (!item || !_isEquipType(item.type)) return 1;
  const raw = item.equip?.minLevel;
  if (Number.isFinite(raw)) {
    return Math.max(1, Math.floor(raw!));
  }
  return _inferMinLevelFromStats(item);
}

function _getEquipRestrictions(member: PartyMember | null | undefined, item: GameItem | null | undefined) {
  const result = {
    allowed: false,
    levelRequired: 1,
    levelMet: true,
    roles: [] as string[],
    roleMet: true,
    reasons: [] as string[]
  };
  if (!item || !_isEquipType(item.type)) {
    result.allowed = false;
    result.reasons.push('Cannot equip that.');
    return result;
  }
  const roles = _listRequiredRoles(item);
  result.roles = roles;
  const minLevel = _getEquipMinLevel(item);
  result.levelRequired = minLevel;
  const hasMember = !!member;
  const level = hasMember && Number.isFinite(member?.lvl) ? member!.lvl : 1;
  const levelMet = !hasMember || level >= minLevel;
  result.levelMet = levelMet;
  if (!levelMet && minLevel > 1) {
    result.reasons.push(`Requires level ${minLevel}.`);
  }
  const memberRole = typeof member?.role === 'string' ? member.role.trim().toLowerCase() : '';
  const roleMet = !hasMember || roles.length === 0 || (memberRole && roles.some(role => role.toLowerCase() === memberRole));
  result.roleMet = roleMet;
  if (!roleMet && roles.length) {
    const reqText = _describeRequiredRoles(item);
    result.reasons.push(reqText ? `Only ${reqText} can equip.` : 'Cannot equip.');
  }
  result.allowed = hasMember ? (levelMet && roleMet) : false;
  return result;
}

function _canEquip(member: PartyMember | null | undefined, item: GameItem | null | undefined): boolean {
  if (!member || !item || !_isEquipType(item.type)) return false;
  return _getEquipRestrictions(member, item).allowed;
}

function _isStackable(it: GameItem | null | undefined): boolean {
  if (!it) return false;
  if (!_isEquipType(it.type)) return true;
  const rarity = (it as any).rarity;
  return typeof rarity === 'string' && rarity.toLowerCase() === 'common';
}

function _getStackCount(it: GameItem | null | undefined): number {
  return Math.max(1, Number.isFinite(it?.count) ? it!.count! : 1);
}

function _setStackCount(it: GameItem | null | undefined, count: number): void {
  if (!it) return;
  const next = Math.max(0, count | 0);
  if (next <= 1) {
    delete it.count;
  } else {
    it.count = next;
  }
}

function _getStackLimit(it: GameItem | null | undefined): number {
  if (!_isStackable(it)) return 1;
  const raw = Number.isFinite(it?.maxStack) ? it!.maxStack : _MAX_INV_STACK;
  return Math.max(1, Math.min(_MAX_INV_STACK, raw!));
}
function _cloneItem(it: GameItem): GameItem {
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
function _registerItem(item: GameItem): GameItem {
  const norm = _normalizeItem(item);
  if (!norm || !norm.id) throw new Error('Item must have id');
  _ITEMS[norm.id] = norm;
  return norm;
}
/**
 * @param {string} id
 * @returns {GameItem|null}
 */
function _getItem(id: string): GameItem | null {
  const it = _ITEMS[id];
  return it ? _cloneItem(it) : null;
}
/**
 * @param {string|GameItem} def
 * @returns {GameItem|null}
 */
function _resolveItem(def: string | GameItem | null | undefined): GameItem | null {
  if (!def) return null;
  const id = typeof def === 'string' ? def : def.id;
  let it = id ? _getItem(id) : null;
  if (!it && typeof def === 'object') it = def as GameItem;
  return it;
}
function _notifyInventoryChanged() {
  _emit('inventory:changed');
}

function _ensureCampChest(): PartyItem[] {
  const player = _getPlayer();
  if (!Array.isArray(player.campChest)) {
    player.campChest = [];
  }
  return player.campChest as PartyItem[];
}

function _emitCampChestChanged() {
  const chest = _ensureCampChest();
  _emit(_CAMP_CHEST_EVENT, { chest: _cloneData(chest) });
}

function _isCampChestUnlocked() {
  return !!_getPlayer().campChestUnlocked;
}

function _unlockCampChest() {
  const player = _getPlayer();
  if (!player.campChestUnlocked) {
    player.campChestUnlocked = true;
    const chest = _ensureCampChest();
    if (Array.isArray(chest) && chest.length === 0) {
      const medkit = _getItem('medkit');
      if (medkit) {
        _setStackCount(medkit, 10);
        _mergeIntoCampChest(medkit);
      }
    }
    _emitCampChestChanged();
  }
  return true;
}

function _addExistingItemToInventory(item: GameItem): boolean {
  if (!item || !item.id) return false;
  const inventory = _ensureInventory();
  const capacity = _getPartyInventoryCapacity();
  if (_isStackable(item)) {
    const limit = _getStackLimit(item);
    const total = _getStackCount(item);
    let remaining = total;
    const stackPlan: { idx: number; add: number }[] = [];
    inventory.forEach((invItem, idx) => {
      if (!invItem || invItem.id !== item.id || !_isStackable(invItem as GameItem)) return;
      const space = _getStackLimit(invItem as GameItem) - _getStackCount(invItem as GameItem);
      if (space <= 0) return;
      const add = Math.min(space, remaining);
      if (add > 0) {
        stackPlan.push({ idx, add });
        remaining -= add;
      }
    });
    const neededSlots = Math.ceil(Math.max(0, remaining) / Math.max(1, limit));
    if (inventory.length + neededSlots > capacity) {
      return false;
    }
    let applied = 0;
    stackPlan.forEach(({ idx, add }) => {
      const target = inventory[idx];
      _setStackCount(target as GameItem, _getStackCount(target as GameItem) + add);
      applied += add;
    });
    let leftover = total - applied;
    if (leftover > 0) {
      const first = item;
      const firstAdd = Math.min(limit, leftover);
      _setStackCount(first, firstAdd);
      inventory.push(first as PartyItem);
      leftover -= firstAdd;
      while (leftover > 0) {
        const extra = _cloneItem(item);
        const add = Math.min(limit, leftover);
        _setStackCount(extra, add);
        inventory.push(extra as PartyItem);
        leftover -= add;
      }
    }
  } else {
    if (inventory.length >= capacity) {
      return false;
    }
    inventory.push(item as PartyItem);
  }
  _notifyInventoryChanged();
  return true;
}

function _mergeIntoCampChest(item: GameItem): void {
  if (!item || !item.id) return;
  const chest = _ensureCampChest();
  if (!_isStackable(item)) {
    chest.push(item as PartyItem);
    return;
  }
  const limit = _getStackLimit(item);
  let remaining = _getStackCount(item);
  for (const entry of chest) {
    if (!entry || entry.id !== item.id || !_isStackable(entry as GameItem)) continue;
    const space = _getStackLimit(entry as GameItem) - _getStackCount(entry as GameItem);
    if (space <= 0) continue;
    const add = Math.min(space, remaining);
    if (add > 0) {
      _setStackCount(entry as GameItem, _getStackCount(entry as GameItem) + add);
      remaining -= add;
    }
    if (remaining <= 0) break;
  }
  if (remaining > 0) {
    const first = item;
    const firstAdd = Math.min(limit, remaining);
    _setStackCount(first, firstAdd);
    chest.push(first as PartyItem);
    remaining -= firstAdd;
    while (remaining > 0) {
      const extra = _cloneItem(item);
      const add = Math.min(limit, remaining);
      _setStackCount(extra, add);
      chest.push(extra as PartyItem);
      remaining -= add;
    }
  }
}

function _storeCampChestItem(invIndex: number): boolean {
  if (!_isCampChestUnlocked()) return false;
  const inventory = _ensureInventory();
  if (invIndex < 0 || invIndex >= inventory.length) return false;
  const removed = inventory.splice(invIndex, 1)[0];
  if (!removed) return false;
  _mergeIntoCampChest(removed as GameItem);
  _notifyInventoryChanged();
  _emitCampChestChanged();
  return true;
}

function _withdrawCampChestItem(chestIndex: number): boolean {
  if (!_isCampChestUnlocked()) return false;
  const chest = _ensureCampChest();
  if (chestIndex < 0 || chestIndex >= chest.length) return false;
  const removed = chest[chestIndex];
  if (!removed) return false;
  const toAdd = _isStackable(removed as GameItem) ? _cloneItem(removed as GameItem) : removed;
  const added = _addExistingItemToInventory(toAdd as GameItem);
  if (!added) {
    if (typeof log === 'function') log('Inventory full.');
    return false;
  }
  chest.splice(chestIndex, 1);
  _emitCampChestChanged();
  return true;
}

function _getCampChest() {
  return _ensureCampChest();
}
function _getPartyInventoryCapacity() {
  const party = _getParty();
  const size = typeof party?.length === 'number' ? party.length : 0;
  return Math.max(20, size * 20);
}

function _getLeaderMember() {
  const leaderFn = _globals.leader;
  if (typeof leaderFn === 'function') {
    try {
      const member = leaderFn();
      if (member) return member;
    } catch (err) {
      // ignore leader lookup errors
    }
  }
  const party = _getParty();
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

function _isLootVacuumItem(it: GameItem | null | undefined): boolean {
  if (!it) return false;
  const tags = Array.isArray(it.tags) ? it.tags : [];
  if (tags.some(tag => typeof tag === 'string' && tag.toLowerCase() === _LOOT_VACUUM_TAG)) {
    return true;
  }
  const id = typeof it.id === 'string' ? it.id.toLowerCase() : '';
  if (id && _LOOT_VACUUM_IDS.has(id)) return true;
  const baseId = typeof it.baseId === 'string' ? it.baseId.toLowerCase() : '';
  if (baseId && _LOOT_VACUUM_IDS.has(baseId)) return true;
  return false;
}

function _leaderHasLootVacuum() {
  const lead = _getLeaderMember();
  if (!lead || !lead.equip) return false;
  return _isLootVacuumItem(lead.equip.trinket);
}

function _loadStarterItems() {
  try {
    const items = globalThis.Dustland && globalThis.Dustland.starterItems;
    if (Array.isArray(items)) {
      items.forEach(it => _addToInv(it as GameItem));
    }
  } catch (e) {
    // ignore load errors
  }
}

/**
 * @param {string|GameItem} item
 */
function _dropItemNearParty(item: string | GameItem): void {
  const it = _resolveItem(item);
  if (!it || !it.id) {
    throw new Error('Unknown item');
  }
  const base = _cloneItem(_ITEMS[it.id] || _registerItem(it));
  const partyInfo = _getPartyState();
  _itemDrops.push({ id: base.id, map: partyInfo.map, x: partyInfo.x, y: partyInfo.y, dropType: 'loot' });
  log(`Inventory full, ${base.name} was dropped.`);
  if (typeof toast === 'function') toast(`Inventory full, ${base.name} was dropped.`);
}

/**
 * Attempt to automatically collect a loot drop near the party.
 * @param {_ItemDrop} drop
 * @returns {boolean}
 */
function _tryAutoPickup(drop: _ItemDrop | null | undefined): boolean {
  if (!drop || drop.dropType !== 'loot') return false;
  const player = _globals.player ?? _getPlayer();
  const party = _globals.party ?? _getParty();
  if (!player) return false;
  if (!party) return false;
  _ensureInventory();
  const partyInfo = _getPartyState();
  const mapId = typeof drop.map === 'string' ? drop.map : 'world';
  if (mapId !== partyInfo.map) return false;
  const dx = typeof drop.x === 'number' ? drop.x - partyInfo.x : 0;
  const dy = typeof drop.y === 'number' ? drop.y - partyInfo.y : 0;
  const distance = Math.abs(dx) + Math.abs(dy);
  const sameTile = distance === 0;
  const vacuumActive = !sameTile && distance === 1 && _leaderHasLootVacuum();
  if (!sameTile && !vacuumActive) return false;
  let took = false;
  const messages: string[] = [];
  if (Array.isArray(drop.items) && drop.items.length) {
    took = _pickupCache(drop);
    if (took) messages.push(`Took ${drop.items.length} items.`);
  } else if (drop.id) {
    const item = _getItem(drop.id);
    if (!item) return false;
    took = _addToInv(item);
  }
  if (!took) return false;
  const idx = _itemDrops.indexOf(drop);
  if (idx > -1) _itemDrops.splice(idx, 1);
  if (vacuumActive) {
    globalThis.pickupVacuum?.(drop.x, drop.y, partyInfo.x, partyInfo.y);
  } else if (typeof globalThis.pickupSparkle === 'function') {
    globalThis.pickupSparkle(drop.x, drop.y);
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
function _addToInv(item: string | GameItem): boolean {
  const it = _resolveItem(item);
  if (!it || !it.id) {
    throw new Error('Unknown item');
  }
  const base = _cloneItem(_ITEMS[it.id] || _registerItem(it));
  const fuel = typeof base.fuel === 'number' ? base.fuel : (base.id === 'fuel_cell' ? 50 : 0);
  if (fuel > 0) {
    const player = _getPlayer();
    player.fuel = (player.fuel || 0) + fuel;
    _emit('item:picked', base);
    if (base.narrative) {
      _emit('item:narrative', { itemId: base.id, narrative: base.narrative });
    }
    _notifyInventoryChanged();
    if (typeof log === 'function') log('Fuel +' + fuel);
    return true;
  }
  const inventory = _ensureInventory();
  const capacity = _getPartyInventoryCapacity();
  const stackable = _isStackable(base);
  let quantity = Math.max(1, Number.isFinite(base.count) ? base.count! : 1);
  if (stackable) {
    let remaining = quantity;
    const stackPlan: { idx: number; add: number }[] = [];
    inventory.forEach((invItem, idx) => {
      if (!invItem || invItem.id !== base.id || !_isStackable(invItem as GameItem)) return;
      const space = _getStackLimit(invItem as GameItem) - _getStackCount(invItem as GameItem);
      if (space <= 0) return;
      const add = Math.min(space, remaining);
      if (add > 0) {
        stackPlan.push({ idx, add });
        remaining -= add;
      }
    });
    const limit = _getStackLimit(base);
    const slotsNeeded = Math.ceil(Math.max(0, remaining) / Math.max(1, limit));
    if (inventory.length + slotsNeeded > capacity) {
      return false;
    }
    stackPlan.forEach(({ idx, add }) => {
      const target = inventory[idx];
      _setStackCount(target as GameItem, _getStackCount(target as GameItem) + add);
      quantity -= add;
    });
    let leftover = quantity;
    let usedBase = false;
    while (leftover > 0) {
      const toAdd = Math.min(_getStackLimit(base), leftover);
      const entry = !usedBase ? base : _cloneItem(base);
      _setStackCount(entry, toAdd);
      inventory.push(entry as PartyItem);
      leftover -= toAdd;
      usedBase = true;
    }
  } else {
    if (inventory.length >= capacity) {
      return false;
    }
    _setStackCount(base, 1);
    inventory.push(base as PartyItem);
  }
  _emit('item:picked', base);
  if (base.narrative) {
    _emit('item:narrative', { itemId: base.id, narrative: base.narrative });
  }
  _notifyInventoryChanged();
  return true;
}

function _removeFromInv(invIndex, quantity?: number) {
  const inventory = _ensureInventory();
  if (invIndex < 0 || invIndex >= inventory.length) return;
  const it = inventory[invIndex];
  if (!it) return;
  const stackable = _isStackable(it as GameItem);
  const current = _getStackCount(it as GameItem);
  const amt = stackable
    ? (Number.isFinite(quantity) ? Math.max(1, quantity! | 0) : 1)
    : 1;
  if (stackable && current > amt) {
    _setStackCount(it as GameItem, current - amt);
    _notifyInventoryChanged();
    return;
  }
  inventory.splice(invIndex, 1);
  _notifyInventoryChanged();
}

function _maybeConsumeItem(it: GameItem, invIndex: number): void {
  if (it?.use?.consume === false) return;
  _removeFromInv(invIndex);
}

// Drop multiple items from inventory as a single cache on the ground
/**
 * @param {number[]} indices
 * @returns {number}
 */
function _dropItems(indices: number[]): number {
  if (!Array.isArray(indices) || indices.length === 0) return 0;
  const drops: string[] = [];
  const counts = new Map<number, number>();
  const inventory = _ensureInventory();
  indices.forEach(i => {
    const it = inventory[i];
    if (!it || !it.id) return;
    const qty = _getStackCount(it as GameItem);
    counts.set(i, qty);
    for (let n = 0; n < qty; n++) drops.push(it.id);
  });
  const sorted = Array.from(counts.keys()).sort((a, b) => b - a);
  for (const idx of sorted) {
    _removeFromInv(idx, counts.get(idx));
  }
  if (drops.length) {
    const partyInfo = _getPartyState();
    _itemDrops.push({ items: drops, map: partyInfo.map, x: partyInfo.x, y: partyInfo.y, dropType: 'loot' });
  }
  return drops.length;
}

// Add all items from a cache drop into inventory
/**
 * @param {_ItemDrop} drop
 * @returns {boolean}
 */
function _pickupCache(drop: _ItemDrop): boolean {
  const ids = Array.isArray(drop?.items) ? drop.items : (drop?.id ? [drop.id] : []);
  if (!ids.length) return true;
  const capacity = _getPartyInventoryCapacity();
  const inventory = _ensureInventory();
  const tempStacks = inventory.map(it => ({ id: it.id, count: _getStackCount(it as GameItem), limit: _getStackLimit(it as GameItem), stackable: _isStackable(it as GameItem) }));
  let needed = 0;
  ids.forEach(id => {
    const item = _getItem(id);
    if (!item) {
      needed++;
      return;
    }
    if (!_isStackable(item)) {
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
    tempStacks.push({ id: item.id, count: 1, limit: _getStackLimit(item), stackable: true });
  });
  if (inventory.length + needed > capacity) {
    log('Inventory is full.');
    if (typeof toast === 'function') toast('Inventory is full.');
    return false;
  }
  ids.forEach(id => {
    const item = _getItem(id);
    if (item) _addToInv(item);
  });
  return true;
}

/**
 * @param {number} memberIndex
 * @param {number} invIndex
 */
function _equipItem(memberIndex: number, invIndex: number): void {
  const inventory = _ensureInventory();
  const partyMembers = _getParty();
  const m = Array.isArray(partyMembers) ? partyMembers[memberIndex] : undefined;
  const it = inventory[invIndex];
  if (!m || !it || !_isEquipType(it.type)) { log('Cannot equip that.'); return; }
  const restrictions = _getEquipRestrictions(m, it as GameItem);
  if (!restrictions.allowed) {
    const msg = restrictions.reasons.length
      ? `${it.name}: ${restrictions.reasons.join(' ')}`
      : `${m.name} cannot equip ${it.name}.`;
    log(msg);
    if (typeof toast === 'function') toast(msg);
    return;
  }
  const slot: _EquipType = it.type as _EquipType;
  const prevEq = m.equip[slot];
  const before = { ...(m._bonus || {}) };
  if (prevEq) {
    if (prevEq.cursed) {
      prevEq.cursedKnown = true;
      _notifyInventoryChanged();
      log(`${prevEq.name} is cursed and cannot be removed.`);
      return;
    }
    _setStackCount(prevEq, 1);
    if (!_addExistingItemToInventory(prevEq)) {
      inventory.push(prevEq as PartyItem);
    }
  }
  const stackable = _isStackable(it as GameItem);
  const count = _getStackCount(it as GameItem);
  const removeEntry = !stackable || count <= 1;
  let equipped = it;
  if (stackable && count > 1) {
    equipped = _cloneItem(it as GameItem) as PartyItem;
    _setStackCount(equipped as GameItem, 1);
    _setStackCount(it as GameItem, count - 1);
  }
  if (removeEntry) {
    inventory.splice(invIndex, 1);
  }
  m.equip[slot] = equipped;
  m.applyEquipmentStats?.();
  m.applyCombatMods?.();
  const after = m._bonus || {};
  const deltas: string[] = [];
  const stats = new Set([...Object.keys(before), ...Object.keys(after)]);
  stats.forEach(stat => {
    const diff = (after[stat] || 0) - (before[stat] || 0);
    if (diff) deltas.push(`${diff > 0 ? '+' : ''}${diff} ${stat}`);
  });
  _notifyInventoryChanged();
  log(`${m.name} equips ${it.name}.`);
  if (typeof toast === 'function') { toast(`${m.name} equips ${it.name}`); if (deltas.length) toast(deltas.join(', ')); }
  _emit('sfx', 'tick');
  if (it.equip && it.equip.teleport) {
    const t = it.equip.teleport;
    setPartyPos(t.x, t.y);
    if (t.map) setMap(t.map);
    updateHUD();
  }
  if (it.equip && it.equip.flag) {
    incFlag(it.equip.flag);
  }
  if (it.equip && it.equip.msg) {
    log(it.equip.msg);
  }
}

/**
 * @param {number} memberIndex
 * @param {string} slot
 */
function _unequipItem(memberIndex: number, slot: _EquipType): void {
  const partyMembers = _getParty();
  const m = Array.isArray(partyMembers) ? partyMembers[memberIndex] : undefined;
  if (!m) return;
  const it = m.equip[slot];
  if (!it) { log('Nothing to unequip.'); return; }
  if (it.cursed) {
    it.cursedKnown = true;
    _notifyInventoryChanged();
    log(`${it.name} is cursed and won't come off!`);
    return;
  }
  m.equip[slot] = null;
  _setStackCount(it, 1);
  const added = _addExistingItemToInventory(it);
  if (!added) {
    _ensureInventory().push(it as PartyItem);
  }
  m.applyEquipmentStats?.();
  m.applyCombatMods?.();
  _notifyInventoryChanged();
  log(`${m.name} unequips ${it.name}.`);
  if (typeof toast === 'function') toast(`${m.name} unequips ${it.name}`);
  _emit('sfx', 'tick');
  if (it.unequip && it.unequip.teleport) {
    const t = it.unequip.teleport;
    setPartyPos(t.x, t.y);
    if (t.map) setMap(t.map);
    updateHUD();
  }
  if (it.unequip && it.unequip.msg) {
    log(it.unequip.msg);
  }
}

// Remove curse flag from item with given id in inventory or equipped slots
/**
 * @param {string} id
 * @returns {boolean}
 */
function _uncurseItem(id: string): boolean {
  if (!id) return false;
  let found = false;
  for (const it of _ensureInventory()) {
    if (it.id === id) { it.cursed = false; it.cursedKnown = false; found = true; }
  }
  const partyMembers = _getParty();
  if (Array.isArray(partyMembers)) {
    for (const m of partyMembers) {
      ['weapon', 'armor', 'trinket'].forEach(sl => {
        const eq = m.equip[sl as _EquipType];
        if (eq && eq.id === id) { eq.cursed = false; eq.cursedKnown = false; found = true; }
      });
    }
  }
  if (found) _notifyInventoryChanged();
  return found;
}

/**
 * @param {GameItem} it
 * @returns {number}
 */
function _estimateItemValue(it: GameItem): number {
  let val = 0;
  if (it.use) {
    if (it.use.type === 'heal') {
      val += it.use.amount || 0;
    }
    if (it.use.type === 'boost') {
      const amt = it.use.amount || 0;
      const dur = it.use.duration || 0;
      val += amt * (dur || 1);
    }
  }
  for (const value of Object.values(it.mods || {})) {
    if (typeof value === 'number' && value > 0) val += value * 10;
  }
  return val;
}

function _normalizeItem(it: Partial<GameItem> | null | undefined): GameItem | null {
  if (!it) return null;
  const baseValue = typeof it.value === 'number' ? it.value : 0;
  const val = baseValue > 0 ? baseValue : _estimateItemValue(it as GameItem);
  const type = it.type || it.slot || 'misc';
  const baseId = typeof it.baseId === 'string' && it.baseId ? it.baseId : undefined;
  return {
    id: it.id || '',
    name: it.name || 'Unknown',
    type,
    baseId,
    rank: it.rank,
    tags: Array.isArray(it.tags) ? it.tags.map(t => t.toLowerCase()) : [],
    mods: it.mods ? { ...it.mods } : {},
    use: it.use || null,
    equip: _cloneData(it.equip),
    unequip: _cloneData(it.unequip),
    cursed: !!it.cursed,
    cursedKnown: !!it.cursedKnown,
    rarity: typeof (it as any).rarity === 'string' ? (it as any).rarity.toLowerCase() : 'common',
    value: val,
    scrap: typeof it.scrap === 'number' ? it.scrap : undefined,
    fuel: typeof it.fuel === 'number' ? it.fuel : undefined,
    desc: it.desc || '',
    persona: it.persona,
    narrative: it.narrative ? { ...it.narrative } : null,
  } as GameItem;
}

function _findItemIndex(idOrTag: string): number {
  const tag = typeof idOrTag === 'string' ? idOrTag.toLowerCase() : '';
  const inventory = _ensureInventory();
  return inventory.findIndex(it => it.id === idOrTag || (Array.isArray(it.tags) && it.tags.map(t => t.toLowerCase()).includes(tag)));
}
function _hasItem(idOrTag: string): boolean { return _findItemIndex(idOrTag) !== -1; }
function _countItems(idOrTag: string): number {
  const tag = typeof idOrTag === 'string' ? idOrTag.toLowerCase() : '';
  const inventory = _ensureInventory();
  return inventory.reduce((count, it) => {
    const tags = Array.isArray(it.tags) ? it.tags.map(t => t.toLowerCase()) : [];
    if (it.id === idOrTag || tags.includes(tag)) {
      return count + _getStackCount(it as GameItem);
    }
    return count;
  }, 0);
}

function _useItem(invIndex: number): boolean {
  const inventory = _ensureInventory();
  const it = inventory[invIndex];
  if (!it || !it.use) {
    log('Cannot use that.');
    return false;
  }
  const partyMembers = _getParty();
  const playerState = _getPlayer();
  if (it.use.type === 'heal') {
    const who = (partyMembers[selectedMember] || partyMembers[0]);
    if (!who) { log('No party member to heal.'); return false; }
    const base = it.use.amount!;
    const luck = (who.stats?.LCK || 0) + (who._bonus?.LCK || 0);
    const eff = Math.max(0, luck - 4);
    const bonus = Math.floor(base * eff * 0.05);
    const before = who.hp;
    who.hp = Math.min(who.hp + base + bonus, who.maxHp);
    const healed = who.hp - before;
    const msg = it.use.text || `${who.name} drinks ${it.name} (+${healed} HP).`;
    log(msg);
    if (bonus > 0 && !it.use.text) log('Lucky boost!');
    if (typeof toast === 'function') toast(it.use.text || `${who.name} +${healed} HP`);
    _emit('sfx', 'tick');
    if (it.id === 'wand') {
      const label = it.use?.label || it.name;
      const defeated = globalThis.defeatEnemiesByRequirement?.('wand', {
        attacker: who,
        label,
        itemLabel: label
      }) || [];
      if (defeated.length) {
        _emit('sfx', 'damage');
      }
    }
    _maybeConsumeItem(it as GameItem, invIndex);
    playerState.hp = partyMembers[0] ? partyMembers[0].hp : playerState.hp;
    if (typeof updateHUD === 'function') updateHUD();
    _emit(`used:${it.id}`, { item: it });
    return true;
  }
  if (it.use.type === 'hydrate') {
    const who = (partyMembers[selectedMember] || partyMembers[0]);
    if (!who) { log('No party member to hydrate.'); return false; }
    if (typeof who.hydration !== 'number') who.hydration = 0;
    const before = who.hydration;
    const amt = it.use.amount || 1;
    const max = 2;
    who.hydration = Math.min(max, before + amt);
    const msg = it.use.text || `${who.name} drinks ${it.name}.`;
    log(msg);
    if (typeof toast === 'function') toast(it.use.text || `${who.name} +${who.hydration - before} HYD`);
    _maybeConsumeItem(it as GameItem, invIndex);
    globalThis.updateHUD?.();
    _emit('sfx', 'tick');
    _emit(`used:${it.id}`, { item: it });
    return true;
  }
  if (it.use.type === 'boost') {
    const who = (partyMembers[selectedMember] || partyMembers[0]);
    if (!who) { log('No party member to boost.'); return false; }
    const buffList = globalThis.Dustland?.movement?.buffs;
    globalThis.Dustland?.effects?.apply?.([{ effect: 'modStat', stat: it.use.stat, delta: it.use.amount, duration: it.use.duration }], { actor: who, buffs: buffList });
    const msg = it.use.text || `${who.name} feels different.`;
    log(msg);
    if (typeof toast === 'function') toast(msg);
    _emit('sfx', 'tick');
    _maybeConsumeItem(it as GameItem, invIndex);
    _emit(`used:${it.id}`, { item: it });
    return true;
  }
  if (it.use.type === 'grenade') {
    const combatState = _globals.__combatState;
    const enemies = Array.isArray(combatState?.enemies) ? combatState!.enemies! : [];
    if (enemies.length === 0) { log('You can only use that in combat.'); return false; }
    const who = (partyMembers[selectedMember] || partyMembers[0]);
    if (!who) { log('No party member to throw that.'); return false; }
    const dmg = Math.max(0, it.use.amount! | 0);
    const msg = it.use.text || `${who.name} hurls ${it.name}!`;
    log(msg);
    if (typeof toast === 'function') toast(msg);
    const label = it.use.label || it.name;
    const ignoreDefense = !!it.use.ignoreDefense;
    const aoe = _globals.playerItemAOEDamage;
    if (typeof aoe === 'function') {
      aoe(who, dmg, { label, ignoreDefense });
    } else {
      for (const target of enemies) {
        const dealt = ignoreDefense ? dmg : Math.max(0, dmg - (target.DEF || 0));
        target.hp -= dealt;
        if (dealt > 0) log?.(`${who.name}'s ${label} hits ${target.name} for ${dealt} damage.`);
        if (target.hp <= 0) target.hp = 0;
      }
      globalThis.renderCombat?.();
    }
    _emit('sfx', 'damage');
    _maybeConsumeItem(it as GameItem, invIndex);
    _emit(`used:${it.id}`, { item: it });
    return true;
  }
  if (it.use.type === 'cleanse') {
    const who = (partyMembers[selectedMember] || partyMembers[0]);
    if (!who) { log('No party member to cleanse.'); return false; }
    if (Array.isArray(who.statusEffects)) {
      who.statusEffects.length = 0;
    }
    const msg = it.use.text || `${who.name} feels purified.`;
    log(msg);
    if (typeof toast === 'function') toast(it.use.text || `${who.name} is cleansed`);
    _emit('sfx', 'tick');
    _maybeConsumeItem(it as GameItem, invIndex);
    _emit(`used:${it.id}`, { item: it });
    return true;
  }
  const effectList: any[] = [];
  if (Array.isArray(it.use.effects)) {
    for (const entry of it.use.effects) {
      if (!entry) continue;
      if (typeof entry === 'string') effectList.push({ effect: entry });
      else if (typeof entry === 'object') effectList.push({ ...entry });
    }
  }
  if (it.use.effect) {
    if (typeof it.use.effect === 'string') {
      const extra: Record<string, any> = {};
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
    globalThis.Dustland?.effects?.apply?.(effectList, { player: playerState, party: partyMembers, item: it });
    _maybeConsumeItem(it as GameItem, invIndex);
    const msg = it.use.text || `Used ${it.name}`;
    log(msg);
    if (typeof toast === 'function') toast(it.use.toast || msg);
    _emit('sfx', 'tick');
    _emit(`used:${it.id}`, { item: it });
    return true;
  }
  if (typeof it.use.onUse === 'function') {
    const ok = it.use.onUse({
      player: playerState as unknown as PlayerState,
      party: partyMembers,
      log,
      toast
    });
    if (ok !== false) {
      _maybeConsumeItem(it as GameItem, invIndex);
      const msg = it.use.text || `Used ${it.name}`;
      log(msg);
      if (typeof toast === 'function') toast(msg);
      _emit('sfx', 'tick');
      _emit(`used:${it.id}`, { item: it });
    }
    return !!ok;
  }
  log('Nothing happens...');
  return false;
}

const inventoryExports = { ITEMS: _ITEMS, itemDrops: _itemDrops, registerItem: _registerItem, getItem: _getItem, resolveItem: _resolveItem, addToInv: _addToInv, removeFromInv: _removeFromInv, equipItem: _equipItem, unequipItem: _unequipItem, normalizeItem: _normalizeItem, findItemIndex: _findItemIndex, useItem: _useItem, hasItem: _hasItem, countItems: _countItems, uncurseItem: _uncurseItem, getPartyInventoryCapacity: _getPartyInventoryCapacity, dropItemNearParty: _dropItemNearParty, dropItems: _dropItems, pickupCache: _pickupCache, tryAutoPickup: _tryAutoPickup, loadStarterItems: _loadStarterItems, canEquip: _canEquip, describeRequiredRoles: _describeRequiredRoles, getEquipMinLevel: _getEquipMinLevel, getEquipRestrictions: _getEquipRestrictions, getCampChest: _getCampChest, isCampChestUnlocked: _isCampChestUnlocked, unlockCampChest: _unlockCampChest, storeCampChestItem: _storeCampChestItem, withdrawCampChestItem: _withdrawCampChestItem, leaderHasLootVacuum: _leaderHasLootVacuum, isLootVacuumItem: _isLootVacuumItem };
globalThis.Dustland.inventory = inventoryExports;
Object.assign(globalThis, inventoryExports);
