// @ts-nocheck
(function(){
  const Actions = {
    applyQuestReward(reward){
      if(!reward) return;
      if(typeof reward==='string' && /^xp\s*\d+/i.test(reward)){
        const amt = parseInt(reward.replace(/[^0-9]/g,''),10)||0;
        if(typeof leader==='function' && typeof awardXP==='function'){
          awardXP(leader(), amt);
        }
        if(typeof toast==='function') toast(`+${amt} XP`);
      } else if (typeof reward==='string' && /^scrap\s*\d+/i.test(reward)) {
        const amt = parseInt(reward.replace(/[^0-9]/g,''),10)||0;
        if (typeof player === 'object') {
          player.scrap = (player.scrap || 0) + amt;
        }
        if(typeof updateHUD==='function') updateHUD();
        if(typeof toast==='function') toast(`+${amt} ${CURRENCY||'Scrap'}`);
      } else {
        const item = typeof resolveItem === 'function' ? resolveItem(reward) : null;
        if (item) {
          if (typeof addToInv === 'function') {
            if (!addToInv(item)) {
              if (typeof dropItemNearParty === 'function') dropItemNearParty(item);
            } else {
              if (typeof toast === 'function') toast(`Received ${item.name}`);
            }
          }
        }
      }
    },
    startCombat(defender){
      if(typeof globalThis.startCombat==='function') return globalThis.startCombat(defender);
    }
  };
  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.actions = Actions;
  globalThis.Actions = Actions;
})();
