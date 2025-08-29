(function(){
  function loadTrainerData(){
    return globalThis.TRAINER_UPGRADES || {};
  }

  async function showTrainer(id, memberIndex = 0){
    const data = loadTrainerData();
    const upgrades = data[id] || [];
    const member = globalThis.party?.[memberIndex];
    let box = document.getElementById('trainer_ui');
    if(!box){
      box = document.createElement('div');
      box.id = 'trainer_ui';
      box.style.cssText = 'position:fixed;left:50%;bottom:12px;transform:translateX(-50%);display:flex;flex-direction:column;gap:6px;z-index:1000;';
    }
    box.innerHTML = '';
    upgrades.forEach(up => {
      const btn = document.createElement('button');
      if(member){
        const base = up.stat === 'HP' ? member.maxHp : (member.stats[up.stat] || 0);
        const after = base + (up.delta || 0);
        btn.textContent = `${up.label} (Cost:${up.cost}) ${base}\u2192${after}`;
      } else {
        btn.textContent = `${up.label} (Cost:${up.cost})`;
      }
      btn.addEventListener('click', () => {
        applyUpgrade(id, up.id, memberIndex);
      });
      box.appendChild(btn);
    });
    document.body.appendChild(box);
    return box;
  }

  function applyUpgrade(trainerId, upgradeId, memberIndex){
    const data = loadTrainerData();
    const up = (data?.[trainerId] || []).find(u => u.id === upgradeId);
    if(!up) return false;
    if(up.type === 'stat'){
      return trainStat(up.stat, memberIndex);
    }
    return false;
  }

  function hideTrainer(){
    const el = document.getElementById('trainer_ui');
    el?.remove();
  }

  globalThis.TrainerUI = { showTrainer, applyUpgrade, hideTrainer };
})();
