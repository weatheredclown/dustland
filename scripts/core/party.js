/** @typedef {import('./inventory.js').GameItem} GameItem */

/**
 * @typedef {object} PartyMember
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {boolean} permanent
 * @property {string|null} portraitSheet
 * @property {number} lvl
 * @property {number} xp
 * @property {number} skillPoints
 * @property {Record<string, number>} stats
 * @property {{weapon:GameItem|null, armor:GameItem|null, trinket:GameItem|null}} equip
 * @property {number} maxHp
 * @property {number} hp
 * @property {number} ap
 * @property {number} maxAdr
 * @property {number} adr
 * @property {Record<string, number>} _bonus
 * @property {Array<string|object>} special
 * @property {number} adrGenMod
 * @property {number} adrDmgMod
 * @property {{[key:string]: number}} cooldowns
 * @property {boolean} guard
 * @property {object[]} statusEffects
 * @property {string} [persona]
 */

const baseStats = () => ({STR:4, AGI:4, INT:4, PER:4, LCK:4, CHA:4});

const xpCurve = [0,100,200,300,400,500,700,900,1100,1300,1500,1900,2300,2700,3100,3500,4300,5100,5900,6700];

var bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;

/** @implements {PartyMember} */
class Character {
  constructor(id, name, role, opts={}){
    this.id=id; this.name=name; this.role=role;
    this.permanent=!!opts.permanent;
    this.portraitSheet = opts.portraitSheet || null;
    this.lvl=1; this.xp=0; this.skillPoints=0;
    this.stats=baseStats();
    this.equip={weapon:null, armor:null, trinket:null};
    this.maxHp=10;
    this.hp=this.maxHp;
    this.maxAdr=100;
    this.adr=0;
    this._bonus={ATK:0, DEF:0, LCK:0};
    this.special = Array.isArray(opts.special) ? [...opts.special] : [];
    this.adrGenMod = 1;
    this.adrDmgMod = 1;
    this.cooldowns = {};
    this.guard = false;
    this.statusEffects = [];
    if(globalThis.Dustland?.status?.init){
      globalThis.Dustland.status.init(this);
    }
  }
  xpToNext(){ return xpToNext(this.lvl); }
  awardXP(amt){
    this.xp += amt;
    log(`${this.name} gains ${amt} XP.`);
    if(typeof toast==='function') toast(`${this.name} +${amt} XP`);
    bus.emit('xp:gained', { character: this, amount: amt });
    bus.emit('sfx','tick');
    while(this.xp >= this.xpToNext()){
      this.xp -= this.xpToNext();
      this.lvl++;
      this.levelUp();
    }
    renderParty(); updateHUD();
  }
  levelUp(){
    this.maxHp += 10;
    this.hp = this.maxHp;
    this.skillPoints += 1;
    if(typeof hudBadge==='function') hudBadge('+1 Skill Point');
    bus.emit('character:leveled-up', { character: this });
    bus.emit('sfx','tick');
    log(`${this.name} leveled up to ${this.lvl}! (+10 HP, +1 SP)`);
    if((party.flags && party.flags.mentor) || (typeof hasItem==='function' && hasItem('mentor_token'))){
      bus.emit('mentor:bark', { text:'Another scar, another lesson learned.', sound:'mentor' });
    }
  }
  applyEquipmentStats(){
    this._bonus = {};
    for(const k of ['weapon','armor','trinket']){
      const it=this.equip[k];
      if(it&&it.mods){
        for(const stat in it.mods){
          this._bonus[stat]=(this._bonus[stat]||0)+it.mods[stat];
        }
      }
    }
    const persona = globalThis.Dustland?.gameState?.getPersona?.(this.persona);
    if(persona && persona.mods){
      for(const stat in persona.mods){
        this._bonus[stat]=(this._bonus[stat]||0)+persona.mods[stat];
      }
    }
  }
  applyCombatMods(){
    this.adrGenMod = 1;
    this.adrDmgMod = 1;
    if(!Array.isArray(this._baseSpecial)){
      this._baseSpecial = [...this.special];
    }
    this.special = [...(this._baseSpecial||[])];
    for(const k of ['weapon','armor','trinket']){
      const it=this.equip[k];
      if(it&&it.mods){
        if(typeof it.mods.adrenaline_gen_mod === 'number'){
          this.adrGenMod *= it.mods.adrenaline_gen_mod;
        }
        if(typeof it.mods.adrenaline_dmg_mod === 'number'){
          this.adrDmgMod *= it.mods.adrenaline_dmg_mod;
        }
        const grant = it.mods.granted_special;
        if(grant){
          if(Array.isArray(grant)) this.special.push(...grant);
          else this.special.push(grant);
        }
      }
    }

    // Resolve special IDs to inline objects for combat
    this.special = this.special.map((raw, idx) => {
      if(typeof raw === 'string'){
        const base = globalThis.Specials?.[raw];
        return base ? { ...base } : { id: raw };
      }
      if(raw && typeof raw === 'object'){
        if(!raw.id) raw.id = raw.name || raw.label || `special_${idx}`;
        return raw;
      }
      return raw;
    });
  }
}

class Party extends Array {
    constructor(...args){
      super(...args);
      this.map = globalThis.state ? globalThis.state.map : 'world';
      this.x = 2;
      this.y = 2;
      this.flags = {};
      this.fallen = [];
    }
  push(...members){
    const unique = members.filter(m => m && !this.includes(m));
    return super.push(...unique);
  }
  unshift(...members){
    const unique = members.filter(m => m && !this.includes(m));
    return super.unshift(...unique);
  }
  setMembers(members){
    const seen = new Set();
    const unique = [];
    (members||[]).forEach(m => {
      if(m && !seen.has(m)){
        seen.add(m);
        unique.push(m);
      }
    });
    super.splice(0, this.length, ...unique);
    return this.length;
  }
  join(member){
    if(this.length >= 6){
      log('Party is full.');
      return false;
    }
    if(this.includes(member)) return false;
    super.push(member);
    member.applyEquipmentStats();
    if(typeof renderParty === 'function') renderParty();
    if(typeof updateHUD === 'function') updateHUD();
    log(member.name + ' joins the party.');
    return true;
  }
  leave(member){
    const idx = this.indexOf(member);
    if(idx === -1) return false;
    if(member.permanent){
      log(member.name + ' refuses to leave.');
      return false;
    }
    this.splice(idx,1);
    if(typeof renderParty === 'function') renderParty();
    if(typeof updateHUD === 'function') updateHUD();
    if(typeof makeNPC==='function' && typeof NPCS !== 'undefined' && Array.isArray(NPCS)){
      const tree={ start:{ text:'', choices:[{label:'(Leave)', to:'bye'}] }, bye:{ text:'' } };
      const npc=makeNPC(member.id, this.map, this.x, this.y, '#fff', member.name, '', '', tree);
      NPCS.push(npc);
    }
    return true;
  }
  fall(member){
    const idx = this.indexOf(member);
    if(idx >= 0){
      this.fallen.push(member);
      this.splice(idx,1);
    }
  }
  restore(){
    if(Array.isArray(this._roster)){
      const fallenSet = new Set(this.fallen);
      this._roster.forEach(m => { if(fallenSet.has(m)) m.hp = Math.max(1, m.hp || 0); });
      this.setMembers(this._roster);
      this._roster = null;
    }
    this.fallen.length = 0;
    if(typeof renderParty === 'function') renderParty();
    if(typeof updateHUD === 'function') updateHUD();
  }
  healAll(){
    (this||[]).forEach(m=>{ m.hp = m.maxHp; m.adr = 0; });
    player.hp = this[0] ? this[0].hp : player.hp;
    renderParty?.(); updateHUD?.();
  }
  leader(){ return this[selectedMember] || this[0]; }
}

const party = new Party();
let selectedMember = 0;

function makeMember(id, name, role, opts){ return new Character(id, name, role, opts); }
function joinParty(member){ return party.join(member); }
function leaveParty(member){ return party.leave(member); }
function fall(member){ return party.fall(member); }
function restore(){ return party.restore(); }
function healAll(){ return party.healAll(); }
function statLine(s){ return `STR ${s.STR}  AGI ${s.AGI}  INT ${s.INT}  PER ${s.PER}  LCK ${s.LCK}  CHA ${s.CHA}`; }
function xpToNext(lvl){
  const prev = xpCurve[lvl-1] ?? 0;
  const next = xpCurve[lvl] ?? (prev + 10*lvl);
  return next - prev;
}
function awardXP(who, amt){ who.awardXP(amt); }
function applyEquipmentStats(m){ m.applyEquipmentStats(); }
function applyCombatMods(m){ m.applyCombatMods(); }
function leader(){ return party.leader(); }
function setLeader(idx){
  selectedMember = idx;
  const m = party[selectedMember];
  if(!m) return;
  for(const slot of ['weapon','armor','trinket']){
    if(!m.equip[slot] && Array.isArray(player?.inv)){
      const candidates = player.inv.filter(it => it.type === slot);
      if(candidates.length){
        const max = Math.max(...candidates.map(it => calcItemValue(it)));
        const best = candidates.filter(it => calcItemValue(it) === max);
        const choice = best[Math.floor(Math.random()*best.length)];
        const invIdx = player.inv.indexOf(choice);
        if(invIdx !== -1) equipItem(selectedMember, invIdx);
      }
    }
  }
  if(typeof renderInv === 'function') renderInv();
}

function respec(memberIndex=selectedMember, options){
  const m = party[memberIndex];
  if(!m) return false;
  const tokenIdx = typeof findItemIndex==='function' ? findItemIndex('memory_worm') : -1;
  if(tokenIdx===-1){
    if(typeof log === 'function') log('Need a Memory Worm token.');
    return false;
  }
  removeFromInv(tokenIdx);
  const opts = (options && typeof options === 'object') ? options : {};
  const prevRole = m.role;
  const prevQuirk = m.quirk ?? null;
  const explicitSpec = typeof opts.specialization === 'string' ? opts.specialization : null;
  let specId = explicitSpec ?? (typeof m.role === 'string' ? m.role : null) ?? 'Wanderer';
  let specData = typeof getSpecialization === 'function' ? getSpecialization(specId) : null;
  if(explicitSpec && !specData && specId !== 'Wanderer'){
    specId = 'Wanderer';
    specData = typeof getSpecialization === 'function' ? getSpecialization(specId) : null;
  }
  const rawSpecials = typeof getClassSpecials === 'function' ? getClassSpecials(specId) : [];
  const specSpecials = Array.isArray(rawSpecials) ? rawSpecials : [];
  const applySpec = explicitSpec !== null || specData || specId === 'Wanderer';
  const quirkProvided = Object.prototype.hasOwnProperty.call(opts, 'quirk');
  let quirkId = quirkProvided ? (typeof opts.quirk === 'string' ? opts.quirk : null) : (typeof m.quirk === 'string' ? m.quirk : null);
  let quirkData = quirkId && typeof getQuirk === 'function' ? getQuirk(quirkId) : null;
  if(quirkProvided && quirkId && !quirkData){
    quirkId = null;
    quirkData = null;
  }
  m.stats = baseStats();
  if(applySpec && specData?.stats){
    for(const [stat, delta] of Object.entries(specData.stats)){
      m.stats[stat] = (m.stats[stat] || 0) + delta;
    }
  }
  if(quirkData?.stats){
    for(const [stat, delta] of Object.entries(quirkData.stats)){
      m.stats[stat] = (m.stats[stat] || 0) + delta;
    }
  }
  m.skillPoints = Math.max(0, (m.lvl|0) - 1);
  if(applySpec){
    m.role = specId;
    if(Array.isArray(specSpecials)){
      m.special = specSpecials;
      m._baseSpecial = [...specSpecials];
    }
  }
  if(quirkProvided || quirkData || (typeof m.quirk === 'string' && !quirkProvided)){
    m.quirk = quirkId || null;
  }
  m.applyEquipmentStats();
  renderParty?.();
  updateHUD?.();
  if(typeof log === 'function'){
    const changes = [];
    if(applySpec && prevRole !== m.role) changes.push(`now a ${m.role}`);
    if((quirkProvided || quirkData) && prevQuirk !== (m.quirk ?? null)){
      changes.push(m.quirk ? `took the ${m.quirk} perk` : 'shed their perk');
    }
    if(changes.length){
      log(`${m.name} respecs their skills and ${changes.join(' and ')}.`);
    }else{
      log(`${m.name} respecs their skills.`);
    }
  }
  return true;
}

function trainStat(stat, memberIndex = selectedMember){
  const m = party[memberIndex];
  if(!m) return false;
  const lead = leader();
  if(!lead || lead.skillPoints <= 0 || m.skillPoints <= 0){
    log('No skill points to spend.');
    return false;
  }
  lead.skillPoints -= 1;
  if(m !== lead) m.skillPoints -= 1;
  if(stat === 'HP'){
    m.maxHp += 5;
    m.hp = m.maxHp;
  }else{
    m.stats[stat] = (m.stats[stat] || 0) + 1;
  }
  renderParty(); updateHUD();
  log(`${m.name} trains ${stat}.`);
  return true;
}

const partyExports = { baseStats, Character, Party, party, makeMember, joinParty, leaveParty, fall, restore, healAll, statLine, xpToNext, awardXP, applyEquipmentStats, applyCombatMods, leader, setLeader, respec, trainStat, selectedMember, xpCurve };
Object.assign(globalThis, partyExports);
