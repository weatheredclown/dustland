const rosterState = new WeakMap();
function getRosterState(roster) {
    const state = rosterState.get(roster);
    if (!state) {
        throw new Error('Party state not initialized');
    }
    return state;
}
const baseStats = () => ({
    STR: 4,
    AGI: 4,
    INT: 4,
    PER: 4,
    LCK: 4,
    CHA: 4,
});
const xpCurve = [0, 100, 200, 300, 400, 500, 700, 900, 1100, 1300, 1500, 1900, 2300, 2700, 3100, 3500, 4300, 5100, 5900, 6700];
const eventBus = globalThis.Dustland?.eventBus ?? globalThis.EventBus ?? { emit() { } };
const safeLog = (message, type) => {
    if (typeof log === 'function')
        log(message, type);
};
const getNPCList = () => globalThis.NPCS;
class Character {
    constructor(id, name, role, opts = {}) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.permanent = !!opts.permanent;
        this.portraitSheet = opts.portraitSheet || null;
        this.lvl = 1;
        this.xp = 0;
        this.skillPoints = 0;
        this.stats = baseStats();
        this.equip = { weapon: null, armor: null, trinket: null };
        this.maxHp = 10;
        this.hp = this.maxHp;
        this.ap = 0;
        this.maxAdr = 100;
        this.adr = 0;
        this._bonus = { ATK: 0, DEF: 0, LCK: 0 };
        this.special = Array.isArray(opts.special) ? [...opts.special] : [];
        this.adrGenMod = 1;
        this.adrDmgMod = 1;
        this.cooldowns = {};
        this.guard = 0;
        this.statusEffects = [];
        if (globalThis.Dustland?.status?.init) {
            globalThis.Dustland.status.init(this);
        }
    }
    xpToNext() { return xpToNext(this.lvl); }
    awardXP(amt) {
        this.xp += amt;
        safeLog(`${this.name} gains ${amt} XP.`);
        if (typeof toast === 'function')
            toast(`${this.name} +${amt} XP`);
        eventBus.emit('xp:gained', { character: this, amount: amt });
        eventBus.emit('sfx', 'tick');
        while (this.xp >= this.xpToNext()) {
            this.xp -= this.xpToNext();
            this.lvl++;
            this.levelUp();
        }
        if (typeof renderParty === 'function')
            renderParty();
        if (typeof updateHUD === 'function')
            updateHUD();
    }
    levelUp() {
        this.maxHp += 10;
        this.hp = this.maxHp;
        this.skillPoints += 1;
        if (typeof hudBadge === 'function')
            hudBadge('+1 Skill Point');
        eventBus.emit('character:leveled-up', { character: this });
        eventBus.emit('sfx', 'tick');
        safeLog(`${this.name} leveled up to ${this.lvl}! (+10 HP, +1 SP)`);
        const partyState = getRosterState(party);
        if ((partyState.flags && partyState.flags.mentor) || (typeof hasItem === 'function' && hasItem('mentor_token'))) {
            eventBus.emit('mentor:bark', { text: 'Another scar, another lesson learned.', sound: 'mentor' });
        }
    }
    applyEquipmentStats() {
        this._bonus = {};
        const slots = ['weapon', 'armor', 'trinket'];
        for (const slot of slots) {
            const it = this.equip[slot];
            if (it && it.mods) {
                for (const stat in it.mods) {
                    const value = it.mods[stat];
                    if (typeof value === 'number') {
                        this._bonus[stat] = (this._bonus[stat] || 0) + value;
                    }
                }
            }
        }
        const persona = globalThis.Dustland?.gameState?.getPersona?.(this.persona ?? null);
        if (persona && persona.mods) {
            for (const stat in persona.mods) {
                const value = persona.mods[stat];
                if (typeof value === 'number') {
                    this._bonus[stat] = (this._bonus[stat] || 0) + value;
                }
            }
        }
    }
    applyCombatMods() {
        this.adrGenMod = 1;
        this.adrDmgMod = 1;
        if (!Array.isArray(this._baseSpecial)) {
            this._baseSpecial = [...this.special];
        }
        this.special = [...(this._baseSpecial || [])];
        const slots = ['weapon', 'armor', 'trinket'];
        for (const slot of slots) {
            const it = this.equip[slot];
            if (it && it.mods) {
                const gen = it.mods.adrenaline_gen_mod;
                if (typeof gen === 'number') {
                    this.adrGenMod *= gen;
                }
                const dmg = it.mods.adrenaline_dmg_mod;
                if (typeof dmg === 'number') {
                    this.adrDmgMod *= dmg;
                }
                const grantRaw = it.mods.granted_special;
                if (grantRaw) {
                    if (Array.isArray(grantRaw)) {
                        this.special.push(...grantRaw);
                    }
                    else if (typeof grantRaw === 'string' || typeof grantRaw === 'object') {
                        this.special.push(grantRaw);
                    }
                }
            }
        }
        // Resolve special IDs to inline objects for combat
        this.special = this.special.map((raw, idx) => {
            if (typeof raw === 'string') {
                const specials = globalThis.Specials;
                const base = specials?.[raw];
                return base ? { ...base } : { id: raw };
            }
            if (raw && typeof raw === 'object') {
                if (!raw.id)
                    raw.id = (raw.name ?? raw.label ?? `special_${idx}`);
                return raw;
            }
            return raw;
        });
    }
}
class PartyRoster extends Array {
    getState() {
        return getRosterState(this);
    }
    constructor(...args) {
        super(...args);
        const worldState = globalThis.state;
        rosterState.set(this, {
            map: worldState?.map ?? 'world',
            x: 2,
            y: 2,
            flags: {},
            fallen: [],
            _roster: null,
        });
    }
    push(...members) {
        const unique = members.filter(m => m && !this.includes(m));
        return super.push(...unique);
    }
    unshift(...members) {
        const unique = members.filter(m => m && !this.includes(m));
        return super.unshift(...unique);
    }
    setMembers(members) {
        const seen = new Set();
        const unique = [];
        (members || []).forEach(m => {
            if (m && !seen.has(m)) {
                seen.add(m);
                unique.push(m);
            }
        });
        super.splice(0, this.length, ...unique);
        return this.length;
    }
    addMember(member) {
        if (this.length >= 6) {
            safeLog('Party is full.');
            return false;
        }
        if (this.includes(member))
            return false;
        super.push(member);
        member.applyEquipmentStats();
        if (typeof renderParty === 'function')
            renderParty();
        if (typeof updateHUD === 'function')
            updateHUD();
        safeLog(member.name + ' joins the party.');
        return true;
    }
    leave(member) {
        const state = this.getState();
        const idx = this.indexOf(member);
        if (idx === -1)
            return false;
        if (member.permanent) {
            safeLog(member.name + ' refuses to leave.');
            return false;
        }
        this.splice(idx, 1);
        if (typeof renderParty === 'function')
            renderParty();
        if (typeof updateHUD === 'function')
            updateHUD();
        const npcs = getNPCList();
        if (typeof makeNPC === 'function' && Array.isArray(npcs)) {
            const tree = { start: { text: '', choices: [{ label: '(Leave)', to: 'bye' }] }, bye: { text: '' } };
            const npc = makeNPC(member.id, state.map, state.x, state.y, '#fff', member.name, '', '', tree, undefined, undefined, undefined, undefined);
            npcs.push(npc);
        }
        return true;
    }
    fall(member) {
        const state = this.getState();
        const idx = this.indexOf(member);
        if (idx >= 0) {
            state.fallen.push(member);
            this.splice(idx, 1);
        }
    }
    restore() {
        const state = this.getState();
        if (Array.isArray(state._roster)) {
            const fallenSet = new Set(state.fallen);
            state._roster.forEach(m => { if (fallenSet.has(m))
                m.hp = Math.max(1, m.hp || 0); });
            this.setMembers(state._roster);
            state._roster = null;
        }
        state.fallen.length = 0;
        if (typeof renderParty === 'function')
            renderParty();
        if (typeof updateHUD === 'function')
            updateHUD();
    }
    healAll() {
        this.forEach(m => { m.hp = m.maxHp; m.adr = 0; });
        const playerState = globalThis.player;
        if (this[0] && playerState) {
            playerState.hp = this[0].hp;
        }
        if (typeof renderParty === 'function')
            renderParty();
        if (typeof updateHUD === 'function')
            updateHUD();
    }
    leader() { return this[selectedMember] || this[0]; }
}
const makeStateAccessor = (key) => ({
    get() {
        return getRosterState(this)[key];
    },
    set(value) {
        getRosterState(this)[key] = value;
    },
    configurable: true,
});
Object.defineProperties(PartyRoster.prototype, {
    map: makeStateAccessor('map'),
    x: makeStateAccessor('x'),
    y: makeStateAccessor('y'),
    flags: makeStateAccessor('flags'),
    fallen: makeStateAccessor('fallen'),
    _roster: makeStateAccessor('_roster'),
});
const joinOverride = function (arg) {
    if (typeof arg === 'string' || typeof arg === 'undefined') {
        return Array.prototype.join.call(this, arg);
    }
    return this.addMember(arg);
};
Object.defineProperty(PartyRoster.prototype, 'join', {
    value: joinOverride,
    writable: true,
    configurable: true,
});
const party = new PartyRoster();
const globalSelection = globalThis.selectedMember;
let selectedMember = typeof globalSelection === 'number' ? globalSelection : 0;
try {
    Object.defineProperty(globalThis, 'selectedMember', {
        get: () => selectedMember,
        set: (value) => {
            if (typeof value === 'number' && Number.isFinite(value)) {
                selectedMember = value;
            }
        },
        configurable: true,
    });
}
catch {
    globalThis.selectedMember = selectedMember;
}
const makeMember = (id, name, role, opts) => new Character(id, name, role, opts);
const joinParty = (member) => party.addMember(member);
const leaveParty = (member) => party.leave(member);
const fall = (member) => { party.fall(member); };
const restore = () => { party.restore(); };
const healAll = () => { party.healAll(); };
const statLine = (s) => `STR ${s.STR}  AGI ${s.AGI}  INT ${s.INT}  PER ${s.PER}  LCK ${s.LCK}  CHA ${s.CHA}`;
function xpToNext(lvl) {
    const prev = xpCurve[lvl - 1] ?? 0;
    const next = xpCurve[lvl] ?? (prev + 10 * lvl);
    return next - prev;
}
const awardXP = (who, amt) => { who.awardXP(amt); };
const applyEquipmentStats = (m) => { m.applyEquipmentStats(); };
const applyCombatMods = (m) => { m.applyCombatMods(); };
const leader = () => party.leader();
function setLeader(idx) {
    selectedMember = idx;
    const m = party[selectedMember];
    if (!m)
        return;
    const slots = ['weapon', 'armor', 'trinket'];
    const playerState = globalThis.player;
    const inventory = Array.isArray(playerState?.inv) ? playerState.inv : null;
    if (!inventory) {
        if (typeof renderInv === 'function')
            renderInv();
        return;
    }
    for (const slot of slots) {
        if (!m.equip[slot]) {
            const candidates = inventory.filter(it => it.type === slot);
            if (candidates.length) {
                const max = Math.max(...candidates.map(it => calcItemValue(it, m)));
                const best = candidates.filter(it => calcItemValue(it, m) === max);
                const choice = best[Math.floor(Math.random() * best.length)];
                const invIdx = inventory.indexOf(choice);
                if (invIdx !== -1)
                    equipItem(selectedMember, invIdx);
            }
        }
    }
    if (typeof renderInv === 'function')
        renderInv();
}
function respec(memberIndex = selectedMember, options) {
    const m = party[memberIndex];
    if (!m)
        return false;
    const tokenIdx = typeof findItemIndex === 'function' ? findItemIndex('memory_worm') : -1;
    if (tokenIdx === -1) {
        safeLog('Need a Memory Worm token.');
        return false;
    }
    removeFromInv(tokenIdx, 1);
    const opts = (options && typeof options === 'object') ? options : {};
    const prevRole = m.role;
    const prevQuirk = m.quirk ?? null;
    const explicitSpec = typeof opts.specialization === 'string' ? opts.specialization : null;
    let specId = explicitSpec ?? m.role ?? 'Wanderer';
    let specData = typeof getSpecialization === 'function' ? getSpecialization(specId) : null;
    if (explicitSpec && !specData && specId !== 'Wanderer') {
        specId = 'Wanderer';
        specData = typeof getSpecialization === 'function' ? getSpecialization(specId) : null;
    }
    const rawSpecials = typeof getClassSpecials === 'function' ? getClassSpecials(specId) : [];
    const specSpecials = Array.isArray(rawSpecials) ? rawSpecials : [];
    const applySpec = explicitSpec !== null || !!specData || specId === 'Wanderer';
    const quirkProvided = Object.prototype.hasOwnProperty.call(opts, 'quirk');
    let quirkId = quirkProvided ? (typeof opts.quirk === 'string' ? opts.quirk : null) : (typeof m.quirk === 'string' ? m.quirk : null);
    let quirkData = quirkId && typeof getQuirk === 'function' ? getQuirk(quirkId) : null;
    if (quirkProvided && quirkId && !quirkData) {
        quirkId = null;
        quirkData = null;
    }
    m.stats = baseStats();
    if (applySpec && specData?.stats) {
        for (const [stat, delta] of Object.entries(specData.stats)) {
            if (typeof delta === 'number') {
                m.stats[stat] = (m.stats[stat] || 0) + delta;
            }
        }
    }
    if (quirkData?.stats) {
        for (const [stat, delta] of Object.entries(quirkData.stats)) {
            if (typeof delta === 'number') {
                m.stats[stat] = (m.stats[stat] || 0) + delta;
            }
        }
    }
    m.skillPoints = Math.max(0, (m.lvl | 0) - 1);
    if (applySpec) {
        m.role = specId;
        if (Array.isArray(specSpecials)) {
            m.special = specSpecials;
            m._baseSpecial = [...specSpecials];
        }
    }
    if (quirkProvided || quirkData || (typeof m.quirk === 'string' && !quirkProvided)) {
        m.quirk = quirkId || null;
    }
    m.applyEquipmentStats();
    if (typeof renderParty === 'function')
        renderParty();
    if (typeof updateHUD === 'function')
        updateHUD();
    const changes = [];
    if (applySpec && prevRole !== m.role)
        changes.push(`now a ${m.role}`);
    if ((quirkProvided || quirkData) && prevQuirk !== (m.quirk ?? null)) {
        changes.push(m.quirk ? `took the ${m.quirk} perk` : 'shed their perk');
    }
    if (changes.length) {
        safeLog(`${m.name} respecs their skills and ${changes.join(' and ')}.`);
    }
    else {
        safeLog(`${m.name} respecs their skills.`);
    }
    return true;
}
function trainStat(stat, memberIndex = selectedMember) {
    const m = party[memberIndex];
    if (!m)
        return false;
    const lead = leader();
    if (!lead || lead.skillPoints <= 0 || m.skillPoints <= 0) {
        safeLog('No skill points to spend.');
        return false;
    }
    lead.skillPoints -= 1;
    if (m !== lead)
        m.skillPoints -= 1;
    if (stat === 'HP') {
        m.maxHp += 5;
        m.hp = m.maxHp;
    }
    else {
        m.stats[stat] = (m.stats[stat] || 0) + 1;
    }
    if (typeof renderParty === 'function')
        renderParty();
    if (typeof updateHUD === 'function')
        updateHUD();
    safeLog(`${m.name} trains ${stat}.`);
    return true;
}
const partyExports = { baseStats, Character, Party: PartyRoster, party, makeMember, joinParty, leaveParty, fall, restore, healAll, statLine, xpToNext, awardXP, applyEquipmentStats, applyCombatMods, leader, setLeader, respec, trainStat, selectedMember, xpCurve };
Object.assign(globalThis, partyExports);
