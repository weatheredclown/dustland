const baseStats = () => ({STR:4, AGI:4, INT:4, PER:4, LCK:4, CHA:4});

class Character {
  constructor(id, name, role, opts={}){
    this.id=id; this.name=name; this.role=role;
    this.permanent=!!opts.permanent;
    this.lvl=1; this.xp=0;
    this.stats=baseStats();
    this.equip={weapon:null, armor:null, trinket:null};
    this.maxHp=10;
    this.hp=this.maxHp;
    this.ap=2;
    this._bonus={ATK:0, DEF:0, LCK:0};
  }
  xpToNext(){ return 10*this.lvl; }
  awardXP(amt){
    this.xp += amt;
    log(`${this.name} gains ${amt} XP.`);
    if(typeof toast==='function') toast(`${this.name} +${amt} XP`);
    if(typeof sfxTick==='function') sfxTick();
    while(this.xp >= this.xpToNext()){
      this.xp -= this.xpToNext();
      this.lvl++;
      this.levelUp();
    }
    renderParty(); updateHUD();
  }
  levelUp(){
    const inc = {STR:0,AGI:0,INT:0,PER:0,LCK:0,CHA:0};
    if(/Gunslinger|Wanderer|Raider/.test(this.role)){ inc.STR++; inc.AGI++; }
    else if(/Scavenger|Cogwitch|Mechanic/.test(this.role)){ inc.INT++; inc.PER++; }
    else { inc.CHA++; inc.LCK++; }
    for(const k in inc){ this.stats[k]+=inc[k]; }
    this.maxHp += 2;
    this.hp = Math.min(this.hp + 2, this.maxHp);
    if(this.lvl%2===0){
      this.ap += 1;
      if(typeof hudBadge==='function') hudBadge('AP +1');
      if(typeof sfxTick==='function') sfxTick();
    }
    log(`${this.name} leveled up to ${this.lvl}! (+HP, stats)`);
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
}

  class Party extends Array {
    constructor(...args){
      super(...args);
      this.map = globalThis.state ? globalThis.state.map : 'world';
      this.x = 2;
      this.y = 2;
      this.flags = {};
    }
  addMember(member){
    if(this.length >= 6){
      log('Party is full.');
      return false;
    }
    this.push(member);
    member.applyEquipmentStats();
    renderParty(); updateHUD();
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
    renderParty(); updateHUD();
    if(typeof makeNPC==='function' && Array.isArray(NPCS)){
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
function xpToNext(lvl){ return 10*lvl; }
function awardXP(who, amt){ who.awardXP(amt); }
function applyEquipmentStats(m){ m.applyEquipmentStats(); }
function leader(){ return party.leader(); }
function setLeader(idx){ selectedMember = idx; }

const partyExports = { baseStats, Character, Party, party, makeMember, addPartyMember, removePartyMember, statLine, xpToNext, awardXP, applyEquipmentStats, leader, setLeader, selectedMember };
Object.assign(globalThis, partyExports);

export { baseStats, Character, Party, party, makeMember, addPartyMember, removePartyMember, statLine, xpToNext, awardXP, applyEquipmentStats, leader, setLeader, selectedMember };
