const baseStats = () => ({STR:4, AGI:4, INT:4, PER:4, LCK:4, CHA:4});

const xpCurve = [0,100,200,300,400,500,700,900,1100,1300,1500,1900,2300,2700,3100,3500,4300,5100,5900,6700];

var bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;

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
    this.ap=2;
    this.maxAdr=100;
    this.adr=0;
    this._bonus={ATK:0, DEF:0, LCK:0};
    this.special = Array.isArray(opts.special) ? [...opts.special] : [];
    this.adrGenMod = 1;
    this.adrDmgMod = 1;
    this.cooldowns = {};
    this.guard = false;
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
    this._bonus = {ATK:0, DEF:0, LCK:0};
    for(const k of ['weapon','armor','trinket']){
      const it=this.equip[k];
      if(it&&it.mods){
        for(const stat in it.mods){
          this._bonus[stat]=(this._bonus[stat]||0)+it.mods[stat];
        }
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
  addMember(member){
    if(this.length >= 6){
      log('Party is full.');
      return false;
    }
    if(this.includes(member)) return false;
    super.push(member);
    member.applyEquipmentStats();
    if(typeof renderParty === 'function') renderParty();
    if(typeof updateHUD === 'function') updateHUD();
    log(member.name+" joins the party.");
    return true;
  }
  removeMember(member){
    const idx=this.indexOf(member);
    if(idx===-1) return false;
    if(member.permanent){
      log(member.name+" refuses to leave.");
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
  leader(){ return this[selectedMember] || this[0]; }
}

const party = new Party();
let selectedMember = 0;

function makeMember(id, name, role, opts){ return new Character(id, name, role, opts); }
function addPartyMember(member){ return party.addMember(member); }
function removePartyMember(member){ return party.removeMember(member); }
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
      const candidates = player.inv.filter(it => it.slot === slot);
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

function respec(memberIndex=selectedMember){
  const m = party[memberIndex];
  if(!m) return false;
  const tokenIdx = typeof findItemIndex==='function' ? findItemIndex('memory_worm') : -1;
  if(tokenIdx===-1){
    log('Need a Memory Worm token.');
    return false;
  }
  removeFromInv(tokenIdx);
  m.stats = baseStats();
  m.skillPoints = m.lvl - 1;
  m.applyEquipmentStats();
  renderParty(); updateHUD();
  log(`${m.name} respecs their skills.`);
  return true;
}

function trainStat(stat, memberIndex = selectedMember){
  const m = party[memberIndex];
  if(!m) return false;
  if(m.skillPoints <= 0){
    log('No skill points to spend.');
    return false;
  }
  m.skillPoints -= 1;
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

function healParty(){
  (party||[]).forEach(m=>{ m.hp = m.maxHp; m.adr = 0; });
  player.hp = party[0] ? party[0].hp : player.hp;
  renderParty?.(); updateHUD?.();
}

const partyExports = { baseStats, Character, Party, party, makeMember, addPartyMember, removePartyMember, statLine, xpToNext, awardXP, applyEquipmentStats, applyCombatMods, leader, setLeader, respec, trainStat, healParty, selectedMember, xpCurve };
Object.assign(globalThis, partyExports);
