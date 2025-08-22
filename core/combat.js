// ===== Combat =====
const combatOverlay = typeof document !== 'undefined' ? document.getElementById('combatOverlay') : null;
const enemyRow = typeof document !== 'undefined' ? document.getElementById('combatEnemies') : null;
const partyRow = typeof document !== 'undefined' ? document.getElementById('combatParty') : null;
const cmdMenu = typeof document !== 'undefined' ? document.getElementById('combatCmd') : null;

if(cmdMenu){
  cmdMenu.addEventListener('click', (e) => {
    const opts = [...cmdMenu.children];
    const idx = opts.indexOf(e.target);
    if(idx >= 0){
      combatState.choice = idx;
      chooseOption();
    }
  });
}

const combatState = { enemies: [], phase: 'party', active: 0, choice: 0, mode:'command', onComplete:null, fallen:[] };

function setPortraitDiv(el, obj){
  if(!el) return;
  if(obj && obj.portraitSheet){
    el.style.background = 'transparent';
    if(/_4\.[a-z]+$/i.test(obj.portraitSheet)){
      const frame = Math.floor(Math.random() * 4);
      const col = frame % 2;
      const row = Math.floor(frame/2);
      const posX = col === 0 ? '0%' : '100%';
      const posY = row === 0 ? '0%' : '100%';
      el.style.backgroundImage = `url(${obj.portraitSheet})`;
      el.style.backgroundSize = '200% 200%';
      el.style.backgroundPosition = `${posX} ${posY}`;
    } else {
      el.style.backgroundImage = `url(${obj.portraitSheet})`;
      el.style.backgroundSize = '100% 100%';
      el.style.backgroundPosition = 'center';
    }
  } else {
    el.textContent = obj && obj.portrait ? obj.portrait : '@';
  }
}

function renderCombat(){
  if(!enemyRow || !partyRow) return;
  enemyRow.innerHTML='';
  for(const e of combatState.enemies){
    const wrap=document.createElement('div');
    wrap.className='enemy';
    const p=document.createElement('div'); p.className='portrait';
    setPortraitDiv(p,e);
    wrap.appendChild(p);
    const lab=document.createElement('div'); lab.className='label'; lab.textContent=e.name||'';
    wrap.appendChild(lab);
    enemyRow.appendChild(wrap);
  }
  partyRow.innerHTML='';
  (party||[]).forEach((m)=>{
    const wrap=document.createElement('div');
    wrap.className='member';
    const p=document.createElement('div'); p.className='portrait';
    setPortraitDiv(p,m);
    wrap.appendChild(p);
    const lab=document.createElement('div'); lab.className='label'; lab.textContent=m.name||'';
    wrap.appendChild(lab);
    partyRow.appendChild(wrap);
  });
  highlightActive();
}

function openCombat(enemies){
  if(!combatOverlay) return Promise.resolve({ result:'flee' });
  return new Promise((resolve)=>{
    combatState.enemies = enemies.map(e=>({...e}));
    combatState.phase='party';
    combatState.active=0;
    combatState.choice=0;
    combatState.onComplete=resolve;
    combatState.fallen = [];
    renderCombat();
    combatOverlay.classList.add('shown');
    openCommand();
  });
}

function closeCombat(result='flee'){
  if(!combatOverlay) return;
  combatOverlay.classList.remove('shown');
  if(cmdMenu) cmdMenu.style.display='none';
  combatState.fallen.forEach(m=>{ m.hp = Math.max(1, m.hp||0); party.push(m); });
  combatState.fallen.length = 0;
  combatState.onComplete?.({ result });
  combatState.onComplete=null;
}

function highlightActive(){
  if(!enemyRow || !partyRow) return;
  [...partyRow.children].forEach((el,i)=>{
    el.classList.toggle('active', combatState.phase==='party' && i===combatState.active);
  });
  [...enemyRow.children].forEach((el,i)=>{
    el.classList.toggle('active', combatState.phase==='enemy' && i===combatState.active);
  });
}

function openCommand(){
  if(combatState.phase!=='party' || !cmdMenu) return;
  cmdMenu.innerHTML='';
  combatState.mode='command';
  const m = party[combatState.active];
  ['Attack','Special','Item','Flee'].forEach((opt)=>{
    const d=document.createElement('div');
    d.textContent=opt;
    if(opt==='Special' && !m?.special) d.classList.add('disabled');
    if(opt==='Item' && (!(player?.inv?.length>0))) d.classList.add('disabled');
    cmdMenu.appendChild(d);
  });
  const opts=[...cmdMenu.children];
  let idx=opts.findIndex(c=>!c.classList.contains('disabled'));
  combatState.choice = idx>=0?idx:0;
  updateChoice();
  cmdMenu.style.display='block';
}

function openItemMenu(){
  if(combatState.phase!=='party' || !cmdMenu) return;
  cmdMenu.innerHTML='';
  combatState.mode='items';
  const usable = player?.inv?.map((it,idx)=>({it,idx})).filter(x=>x.it.use) || [];
  usable.forEach(({it,idx})=>{
    const d=document.createElement('div');
    d.textContent=it.name;
    d.dataset.idx=idx;
    cmdMenu.appendChild(d);
  });
  if(usable.length===0){
    const none=document.createElement('div');
    none.textContent='(No usable items)';
    none.classList.add('disabled');
    cmdMenu.appendChild(none);
  }
  const back=document.createElement('div');
  back.textContent='(Back)';
  back.dataset.action='back';
  cmdMenu.appendChild(back);
  const opts=[...cmdMenu.children];
  let idx=opts.findIndex(c=>!c.classList.contains('disabled'));
  combatState.choice = idx>=0?idx:0;
  updateChoice();
  cmdMenu.style.display='block';
}

function updateChoice(){
  if(!cmdMenu) return;
  [...cmdMenu.children].forEach((c,i)=> c.classList.toggle('sel', i===combatState.choice));
}

function moveChoice(dir){
  if(!cmdMenu) return;
  const opts=[...cmdMenu.children];
  const tot=opts.length;
  let idx=combatState.choice;
  do {
    idx=(idx+dir+tot)%tot;
  } while(opts[idx].classList.contains('disabled'));
  combatState.choice=idx;
  updateChoice();
}

function handleCombatKey(e){
  if(!combatOverlay || !combatOverlay.classList.contains('shown')) return false;
  if(e.key==='Enter' && e.repeat) return false;
  switch(e.key){
    case 'ArrowUp': moveChoice(-1); return true;
    case 'ArrowDown': moveChoice(1); return true;
    case 'Enter': chooseOption(); return true;
  }
  return false;
}

function chooseOption(){
  if(!cmdMenu) return;
  const opt=cmdMenu.children[combatState.choice];
  if(!opt || opt.classList.contains('disabled')) return;
  if(combatState.mode==='command'){
    const choice=opt.textContent.toLowerCase();
    cmdMenu.style.display='none';
    if(choice==='flee'){
      log?.('You fled the battle.');
      closeCombat('flee');
      return;
    }
    if(choice==='attack') doAttack(1);
    else if(choice==='special') doAttack(2);
    else if(choice==='item') openItemMenu();
    return;
  }
  // item selection mode
  const action=opt.dataset.action;
  if(action==='back'){
    openCommand();
    return;
  }
  const invIdx=parseInt(opt.dataset.idx,10);
  if(Number.isInteger(invIdx)){
    const prevSel=selectedMember;
    selectedMember=combatState.active;
    const used=useItem(invIdx);
    selectedMember=prevSel;
    cmdMenu.style.display='none';
    combatState.mode='command';
    if(used) nextCombatant();
    else openCommand();
  }
}

function doAttack(dmg){
  const attacker=party[combatState.active];
  const target=combatState.enemies[0];
  target.hp-=dmg;
  log?.(`${attacker.name} hits ${target.name} for ${dmg} damage.`);
  if(target.hp<=0){
    log?.(`${target.name} is defeated!`);
    if(target.loot) addToInv?.(target.loot);
    if(target.npc) removeNPC(target.npc);
    combatState.enemies.shift();
    renderCombat();
    if(combatState.enemies.length===0){ log?.('Victory!'); closeCombat('loot'); return; }
  }
  nextCombatant();
}

function nextCombatant(){
  combatState.active++;
  if(combatState.active>=party.length){ enemyPhase(); return; }
  highlightActive();
  openCommand();
}

function enemyPhase(){
  combatState.phase='enemy';
  combatState.active=0;
  highlightActive();
  enemyAttack();
}

function enemyAttack(){
  const enemy=combatState.enemies[combatState.active];
  const target=party[0];
  if(!enemy || !target){ closeCombat('flee'); return; }
  target.hp-=1;
  log?.(`${enemy.name} strikes ${target.name} for 1 damage.`);
  if(target.hp<=0){
    log?.(`${target.name} falls!`);
    combatState.fallen.push(target);
    party.splice(0,1);
    renderCombat();
    if(party.length===0){ log?.('The party has fallen...'); closeCombat('bruise'); return; }
  }
  combatState.active++;
  if(combatState.active<combatState.enemies.length){
    highlightActive();
    setTimeout(enemyAttack,300);
  } else {
    startPartyTurn();
  }
}

function startPartyTurn(){
  combatState.phase='party';
  combatState.active=0;
  highlightActive();
  openCommand();
}


const combatExports = { openCombat, closeCombat, handleCombatKey };
Object.assign(globalThis, combatExports);
