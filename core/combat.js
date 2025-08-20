// ===== Combat =====
const combatOverlay = typeof document !== 'undefined' ? document.getElementById('combatOverlay') : null;
const enemyRow = typeof document !== 'undefined' ? document.getElementById('combatEnemies') : null;
const partyRow = typeof document !== 'undefined' ? document.getElementById('combatParty') : null;

const combatState = { enemies: [], phase: 'party', active: 0, choice: 0, onComplete:null };

function setPortraitDiv(el, obj){
  if(!el) return;
  if(obj && obj.portraitSheet){
    const frame = Math.floor(Math.random() * 4);
    const col = frame % 2;
    const row = Math.floor(frame/2);
    const posX = col === 0 ? '0%' : '100%';
    const posY = row === 0 ? '0%' : '100%';
    el.style.background = 'transparent';
    el.style.backgroundImage = `url(${obj.portraitSheet})`;
    el.style.backgroundSize = '200% 200%';
    el.style.backgroundPosition = `${posX} ${posY}`;
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
    const cmd=document.createElement('div');
    cmd.className='cmd';
    cmd.style.display='none';
    ['Attack','Special','Item','Flee'].forEach((opt,i)=>{
      const d=document.createElement('div');
      if(i===0) d.classList.add('sel');
      d.textContent=opt;
      cmd.appendChild(d);
    });
    wrap.appendChild(cmd);
    partyRow.appendChild(wrap);
  });
  highlightActive();
}

function openCombat(enemies){
  if(!combatOverlay) return Promise.resolve({ result:'flee', roll:0 });
  return new Promise((resolve)=>{
    combatState.enemies = enemies.map(e=>({...e}));
    combatState.phase='party';
    combatState.active=0;
    combatState.choice=0;
    combatState.onComplete=resolve;
    renderCombat();
    combatOverlay.classList.add('shown');
    openCommand();
  });
}

function closeCombat(result){
  if(!combatOverlay) return;
  combatOverlay.classList.remove('shown');
  const res = result || { result:'flee', roll:0 };
  combatState.onComplete?.(res);
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
  if(combatState.phase!=='party') return;
  const wrap=partyRow.children[combatState.active];
  if(!wrap) return;
  const cmd=wrap.querySelector('.cmd');
  cmd.style.display='block';
  combatState.choice=0;
  updateChoice(cmd);
}

function updateChoice(cmd){
  [...cmd.children].forEach((c,i)=> c.classList.toggle('sel', i===combatState.choice));
}

function moveChoice(dir){
  const wrap=partyRow.children[combatState.active];
  if(!wrap) return;
  const cmd=wrap.querySelector('.cmd');
  const tot=cmd.children.length;
  combatState.choice=(combatState.choice+dir+tot)%tot;
  updateChoice(cmd);
}

function handleCombatKey(e){
  if(!combatOverlay || !combatOverlay.classList.contains('shown')) return false;
  switch(e.key){
    case 'ArrowUp': moveChoice(-1); return true;
    case 'ArrowDown': moveChoice(1); return true;
    case 'Enter': chooseOption(); return true;
  }
  return false;
}

function chooseOption(){
  const wrap=partyRow.children[combatState.active];
  if(!wrap) return;
  const cmd=wrap.querySelector('.cmd');
  const choice=cmd.children[combatState.choice].textContent.toLowerCase();
  cmd.style.display='none';
  if(choice==='flee'){
    log?.('You fled the battle.');
    closeCombat({ result:'flee', roll:0 });
    return;
  }
  if(choice==='attack') doAttack(1);
  else if(choice==='special') doAttack(2);
  else if(choice==='item'){ log?.(`${party[combatState.active].name} fumbles for an item.`); nextCombatant(); }
}

function doAttack(dmg){
  const attacker=party[combatState.active];
  const target=combatState.enemies[0];
  target.hp-=dmg;
  log?.(`${attacker.name} hits ${target.name} for ${dmg} damage.`);
  if(target.hp<=0){
    log?.(`${target.name} is defeated!`);
    combatState.enemies.shift();
    renderCombat();
    if(combatState.enemies.length===0){ log?.('Victory!'); closeCombat({ result:'loot', roll:0 }); return; }
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
  if(!enemy || !target){ closeCombat({ result:'flee', roll:0 }); return; }
  target.hp-=1;
  log?.(`${enemy.name} strikes ${target.name} for 1 damage.`);
  if(target.hp<=0){
    log?.(`${target.name} falls!`);
    party.splice(0,1);
    renderCombat();
    if(party.length===0){ log?.('The party has fallen...'); closeCombat({ result:'bruise', roll:0 }); return; }
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

if(typeof document !== 'undefined'){
  document.addEventListener('keydown', e=>{ if(handleCombatKey(e)) e.preventDefault(); });
}

const combatExports = { openCombat, closeCombat, handleCombatKey };
Object.assign(globalThis, combatExports);
if (typeof module !== 'undefined' && module.exports){ module.exports = combatExports; }
