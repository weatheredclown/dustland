// @ts-nocheck
(function(){
  globalThis.Dustland = globalThis.Dustland ?? {};
  const state = { party: [], world: {}, inventory: [], flags: {}, clock: 0, quests: [], difficulty: 'normal', personas: {}, effectPacks: {}, npcMemory: {} };
  function getState(){ return state; }
  function updateState(fn){
    if (typeof fn === 'function') fn(state);
    globalThis.EventBus?.emit('state:changed', state);
  }
  function getDifficulty(){ return state.difficulty; }
  function setDifficulty(mode){ state.difficulty = mode; }
  function setPersona(id, persona){
    state.personas[id] = persona;
    globalThis.Dustland?.profiles?.set?.(id, persona);
  }
  function getPersona(id){ return state.personas[id]; }
  function addEffectPack(evt, list){
    if(!evt || !Array.isArray(list)) return;
    state.effectPacks[evt] = list;
    globalThis.EventBus?.on(evt, payload => {
      globalThis.Dustland?.effects?.apply(list, payload ?? {});
    });
  }
  function loadEffectPacks(packs){
    if(packs) Object.entries(packs).forEach(([evt, list]) => addEffectPack(evt, list));
  }
  function rememberNPC(id, key, value){
    if(!id || !key) return;
    const m = state.npcMemory[id] ?? (state.npcMemory[id] = {});
    m[key] = value;
  }
  function recallNPC(id, key){
    return state.npcMemory[id] ? state.npcMemory[id][key] : undefined;
  }
  function forgetNPC(id, key){
    if(!id) return;
    if(key){
      if(state.npcMemory[id]) delete state.npcMemory[id][key];
    }else{
      delete state.npcMemory[id];
    }
  }
  function applyPersona(memberId, personaId){
    const persona = state.personas[personaId];
    if (!persona) return;
    const member = state.party.find(m => m.id === memberId);
    if (!member) return;
    const prev = member.persona;
    if (prev === personaId) return; // no change
    if (prev) {
      globalThis.Dustland?.profiles?.remove?.(member, prev);
      globalThis.EventBus?.emit('persona:unequip', { memberId, personaId: prev });
    }
    member.persona = personaId;
    globalThis.Dustland?.profiles?.apply?.(member, personaId);
    if (typeof member.applyEquipmentStats === 'function') member.applyEquipmentStats();
    if (typeof member.applyCombatMods === 'function') member.applyCombatMods();
    globalThis.EventBus?.emit('persona:equip', { memberId, personaId });
    if (typeof renderParty === 'function') renderParty();
    if (typeof updateHUD === 'function') updateHUD();
  }
  function clearPersona(memberId){
    const member = state.party.find(m => m.id === memberId);
    if (!member) return;
    const prev = member.persona;
    if (!prev) return;
    globalThis.Dustland?.profiles?.remove?.(member, prev);
    member.persona = undefined;
    if (typeof member.applyEquipmentStats === 'function') member.applyEquipmentStats();
    if (typeof member.applyCombatMods === 'function') member.applyCombatMods();
    globalThis.EventBus?.emit('persona:unequip', { memberId, personaId: prev });
    if (typeof renderParty === 'function') renderParty();
    if (typeof updateHUD === 'function') updateHUD();
  }
  Dustland.gameState = { getState, updateState, getDifficulty, setDifficulty, setPersona, getPersona, applyPersona, clearPersona, addEffectPack, loadEffectPacks, rememberNPC, recallNPC, forgetNPC };
})();
