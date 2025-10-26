(function(){
  const Actions = {
    applyQuestReward(reward){
      if(!reward) return;
      const globals = globalThis as {
          leader?: () => unknown;
          awardXP?: (target: unknown, amount: number) => void;
          toast?: (message: string) => void;
          player?: { scrap?: number };
          CURRENCY?: string;
          resolveItem?: (reward: unknown) => { name?: string } | null;
          addToInv?: (item: unknown) => boolean;
          dropItemNearParty?: (item: unknown) => void;
        };
      if(typeof reward==='string' && /^xp\s*\d+/i.test(reward)){
        const amt = parseInt(reward.replace(/[^0-9]/g,''),10)||0;
        if(typeof globals.leader==='function' && typeof globals.awardXP==='function'){
          globals.awardXP(globals.leader(), amt);
        }
        if(typeof globals.toast==='function') globals.toast(`+${amt} XP`);
      } else if (typeof reward==='string' && /^scrap\s*\d+/i.test(reward)) {
        const amt = parseInt(reward.replace(/[^0-9]/g,''),10)||0;
        if (typeof globalThis === 'object' && globals.player) {
          globals.player.scrap = (globals.player.scrap || 0) + amt;
        }
        if(typeof updateHUD==='function') updateHUD();
        if(typeof globals.toast==='function') globals.toast(`+${amt} ${globals.CURRENCY||'Scrap'}`);
      } else {
        const item = typeof globals.resolveItem === 'function' ? globals.resolveItem(reward) : null;
        if (item) {
          if (typeof globals.addToInv === 'function') {
            if (!globals.addToInv(item)) {
              if (typeof globals.dropItemNearParty === 'function') globals.dropItemNearParty(item);
            } else {
              if (typeof globals.toast === 'function') globals.toast(`Received ${item.name}`);
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
