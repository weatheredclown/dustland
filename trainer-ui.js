(function(){
  function loadTrainerData(){
    return globalThis.TRAINER_UPGRADES || {};
  }

  async function showTrainer(id, memberIndex){
    const data = loadTrainerData();
    const upgrades = data[id] || [];
    let box = document.getElementById('trainer_ui');
    if(!box){
      box = document.createElement('div');
      box.id = 'trainer_ui';
    }
    box.innerHTML = '';
    upgrades.forEach(up => {
      const btn = document.createElement('button');
      btn.textContent = `${up.label} (Cost:${up.cost})`;
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
