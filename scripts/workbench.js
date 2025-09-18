(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;

  function craftSignalBeacon(){
    const scrapCost = 5;
    const fuelCost = 50;
    if ((player.scrap || 0) < scrapCost){
      log('Need 5 scrap.');
      return;
    }
    if ((player.fuel || 0) < fuelCost){
      log('Need 50 fuel.');
      return;
    }
    player.scrap -= scrapCost;
    player.fuel -= fuelCost;
    addToInv('signal_beacon');
    bus?.emit('craft:signal-beacon');
    log('Crafted a signal beacon.');
  }

  function craftSolarTarp(){
    const scrapCost = 3;
    if ((player.scrap || 0) < scrapCost){
      log('Need 3 scrap.');
      return;
    }
    if (!hasItem('cloth')){
      log('Need cloth.');
      return;
    }
    player.scrap -= scrapCost;
    const idx = findItemIndex('cloth');
    if (idx >= 0) removeFromInv(idx);
    addToInv('solar_tarp');
    bus?.emit('craft:solar-tarp');
    log('Crafted a solar panel tarp.');
  }

  function craftBandage(){
    if (!hasItem('plant_fiber')){
      log('Need plant fiber.');
      return;
    }
    const idx = findItemIndex('plant_fiber');
    if (idx >= 0) removeFromInv(idx);
    addToInv('bandage');
    bus?.emit('craft:bandage');
    log('Crafted a bandage.');
  }

  function craftAntidote(){
    if (!hasItem('plant_fiber')){
      log('Need plant fiber.');
      return;
    }
    if (!hasItem('water_flask')){
      log('Need a water flask.');
      return;
    }
    let idx = findItemIndex('plant_fiber');
    if (idx >= 0) removeFromInv(idx);
    idx = findItemIndex('water_flask');
    if (idx >= 0) removeFromInv(idx);
    addToInv('antidote');
    bus?.emit('craft:antidote');
    log('Crafted an antidote.');
  }

  function openWorkbench(){
    const overlay = document.getElementById('workbenchOverlay');
    const list = document.getElementById('workbenchRecipes');
    const closeBtn = document.getElementById('closeWorkbenchBtn');
    if (!overlay || !list || !closeBtn) return;

    let focusables = [];
    let focusIdx = 0;

    function focusCurrent(){
      if (focusables.length) focusables[focusIdx].focus();
    }

    function renderRecipes(){
      list.innerHTML = '';
      focusables = [];
      const recipes = [
        {
          name: 'Signal Beacon',
          craft: craftSignalBeacon,
          requirements: [
            { label: 'Scrap', key: 'scrap', amount: 5, type: 'resource' },
            { label: 'Fuel', key: 'fuel', amount: 50, type: 'resource' }
          ]
        },
        {
          name: 'Solar Panel Tarp',
          craft: craftSolarTarp,
          requirements: [
            { label: 'Scrap', key: 'scrap', amount: 3, type: 'resource' },
            { label: 'Cloth', key: 'cloth', amount: 1, type: 'item' }
          ]
        },
        {
          name: 'Bandage',
          craft: craftBandage,
          requirements: [
            { label: 'Plant Fiber', key: 'plant_fiber', amount: 1, type: 'item' }
          ]
        },
        {
          name: 'Antidote',
          craft: craftAntidote,
          requirements: [
            { label: 'Plant Fiber', key: 'plant_fiber', amount: 1, type: 'item' },
            { label: 'Water Flask', key: 'water_flask', amount: 1, type: 'item' }
          ]
        }
      ];

      recipes.forEach(r => {
        const row = document.createElement('div');
        row.className = 'slot';
        const info = document.createElement('div');
        const title = document.createElement('span');
        title.textContent = r.name;
        info.appendChild(title);
        const reqList = document.createElement('ul');
        let craftable = true;
        r.requirements.forEach(req => {
          const have = req.type === 'resource' ? (player[req.key] || 0) : countItems(req.key);
          if (have < req.amount) craftable = false;
          const li = document.createElement('li');
          li.textContent = `${req.label}: ${have}/${req.amount}`;
          reqList.appendChild(li);
        });
        info.appendChild(reqList);
        row.appendChild(info);
        if (craftable){
          const btn = document.createElement('button');
          btn.className = 'btn';
          btn.textContent = 'Craft';
          btn.onclick = () => { r.craft(); renderRecipes(); };
          row.appendChild(btn);
          focusables.push(btn);
        }
        list.appendChild(row);
      });
      focusIdx = 0;
      focusCurrent();
    }

    function close(){
      overlay.classList.remove('shown');
      overlay.removeEventListener('keydown', handleKey);
    }

    function handleKey(e){
      e.stopPropagation();
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') {
        focusIdx = (focusIdx + 1) % focusables.length;
        focusCurrent();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        focusIdx = (focusIdx - 1 + focusables.length) % focusables.length;
        focusCurrent();
        e.preventDefault();
      }
    }

    closeBtn.onclick = close;
    overlay.classList.add('shown');
    overlay.tabIndex = -1;
    overlay.addEventListener('keydown', handleKey);
    renderRecipes();
    overlay.focus();
  }

  Dustland.workbench = { craftSignalBeacon, craftSolarTarp, craftBandage, craftAntidote };
  Dustland.openWorkbench = openWorkbench;
})();
