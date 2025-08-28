// ===== Combat =====
const combatOverlay = typeof document !== 'undefined' ? document.getElementById('combatOverlay') : null;
const enemyRow      = typeof document !== 'undefined' ? document.getElementById('combatEnemies') : null;
const partyRow      = typeof document !== 'undefined' ? document.getElementById('combatParty') : null;
const cmdMenu       = typeof document !== 'undefined' ? document.getElementById('combatCmd') : null;
const turnIndicator = typeof document !== 'undefined' ? document.getElementById('turnIndicator') : null;

window.bossTelegraphFX = window.bossTelegraphFX || { intensity: 1, duration: 1000 };
window.setBossTelegraphFX = (opts = {}) => {
  if (typeof opts.intensity === 'number') window.bossTelegraphFX.intensity = opts.intensity;
  if (typeof opts.duration  === 'number') window.bossTelegraphFX.duration  = opts.duration;
};

if (cmdMenu) {
  cmdMenu.addEventListener('click', (e) => {
    const opts = [...cmdMenu.children];
    const idx = opts.indexOf(e.target);
    if (idx >= 0) {
      combatState.choice = idx;
      chooseOption();
    }
  });
}

const combatState = {
  enemies: [],
  phase: 'party',
  active: 0,
  choice: 0,
  mode: 'command',
  onComplete: null,
  fallen: [],
  log: []
};

function recordCombatEvent(ev){
  // Store structured events for post-combat analysis.
  combatState.log.push(ev);
}

function setPortraitDiv(el, obj){
  if (!el) return;
  if (obj && obj.portraitSheet){
    el.style.background = 'transparent';
    if (/_4\.[a-z]+$/i.test(obj.portraitSheet)){
      const generic = /portrait_\d+\.[a-z]+$/i.test(obj.portraitSheet);
      const locked = obj.portraitLock !== false && !generic && obj.id;
      let frame;
      if (locked){
        let h = 0;
        const s = String(worldSeed) + obj.id;
        for(let i=0;i<s.length;i++){ h = (h * 31 + s.charCodeAt(i)) | 0; }
        frame = Math.abs(h) % 4;
      }else{
        frame = Math.floor(Math.random() * 4);
      }
      const col = frame % 2;
      const row = Math.floor(frame / 2);
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
  if (!enemyRow || !partyRow) return;

  // Enemies
  enemyRow.innerHTML = '';
  for (const e of combatState.enemies){
    const wrap = document.createElement('div');
    wrap.className = 'enemy';

    const p = document.createElement('div'); p.className = 'portrait';
    setPortraitDiv(p, e);
    wrap.appendChild(p);

    const hp  = document.createElement('div'); hp.className  = 'hudbar'; hp.style.width = '48px';
    const hpf = document.createElement('div'); hpf.className = 'fill';
    hpf.style.width = Math.max(0, Math.min(100, (e.hp / (e.maxHp || 1)) * 100)) + '%';
    hp.appendChild(hpf); wrap.appendChild(hp);

    const adr  = document.createElement('div'); adr.className  = 'hudbar adr'; adr.style.width = '48px';
    const adrf = document.createElement('div'); adrf.className = 'fill';
    adrf.style.width = Math.max(0, Math.min(100, (e.adr / (e.maxAdr || 1)) * 100)) + '%';
    adr.appendChild(adrf); wrap.appendChild(adr);

    const lab = document.createElement('div'); lab.className = 'label'; lab.textContent = e.name || '';
    wrap.appendChild(lab);

    enemyRow.appendChild(wrap);
  }

  // Party
  partyRow.innerHTML = '';
  (party || []).forEach((m) => {
    const wrap = document.createElement('div');
    wrap.className = 'member';

    const p = document.createElement('div'); p.className = 'portrait';
    setPortraitDiv(p, m);
    wrap.appendChild(p);

    const hp  = document.createElement('div'); hp.className  = 'hudbar'; hp.style.width = '48px';
    const hpf = document.createElement('div'); hpf.className = 'fill';
    hpf.style.width = Math.max(0, Math.min(100, (m.hp / (m.maxHp || 1)) * 100)) + '%';
    hp.appendChild(hpf); wrap.appendChild(hp);

    const adr  = document.createElement('div'); adr.className  = 'hudbar adr'; adr.style.width = '48px';
    const adrf = document.createElement('div'); adrf.className = 'fill';
    adrf.style.width = Math.max(0, Math.min(100, (m.adr / (m.maxAdr || 1)) * 100)) + '%';
    adr.appendChild(adrf); wrap.appendChild(adr);

    const lab = document.createElement('div'); lab.className = 'label'; lab.textContent = m.name || '';
    wrap.appendChild(lab);

    partyRow.appendChild(wrap);
  });

  highlightActive();
}

function openCombat(enemies){
  if (!combatOverlay) return Promise.resolve({ result: 'flee' });

  return new Promise((resolve) => {
    combatState.enemies = enemies.map(e => ({
      ...e,
      maxHp: e.maxHp || e.hp,
      maxAdr: e.maxAdr || 100,
      adr: e.adr ?? 0
    }));
    combatState.phase = 'party';
    combatState.active = 0;
    combatState.choice = 0;
    combatState.onComplete = resolve;
    combatState.fallen = [];
    combatState.log = [];

    (party || []).forEach(m => {
      m.maxAdr = m.maxAdr || 100;
      m.applyCombatMods?.();
      m.guard = false;
      m.cooldowns = m.cooldowns || {};
    });

    renderCombat();
    updateHUD?.();
    combatOverlay.classList.add('shown');
    globalThis.EventBus?.emit?.('combat:started');
    openCommand();
  });
}

function closeCombat(result = 'flee'){
  if (!combatOverlay) return;
  combatOverlay.classList.remove('shown');
  if (cmdMenu) cmdMenu.style.display = 'none';
  if (turnIndicator) turnIndicator.textContent = '';

  // Restore fallen to party with at least 1 HP
  combatState.fallen.forEach(m => { m.hp = Math.max(1, m.hp || 0); party.push(m); });
  combatState.fallen.length = 0;

  if(result === 'bruise' && state.mapEntry){
    log?.('You wake up at the entrance.');
    if(typeof toast==='function') toast('You wake up at the entrance.');
    setPartyPos?.(state.mapEntry.x, state.mapEntry.y);
  }

  recordCombatEvent({ type: 'system', action: 'end', result });
  globalThis.EventBus?.emit?.('combat:ended', { result });
  combatState.onComplete?.({ result });
  combatState.onComplete = null;

  player.hp = party[0] ? party[0].hp : player.hp;
  updateHUD?.();
}

function highlightActive(){
  if (!enemyRow || !partyRow) return;

  [...partyRow.children].forEach((el, i) => {
    el.classList.toggle('active', combatState.phase === 'party' && i === combatState.active);
  });
  [...enemyRow.children].forEach((el, i) => {
    el.classList.toggle('active', combatState.phase === 'enemy' && i === combatState.active);
  });

  if (turnIndicator){
    if (combatState.phase === 'party'){
      const m = party[combatState.active];
      turnIndicator.textContent = m ? `${m.name}'s turn` : '';
    } else {
      const e = combatState.enemies[combatState.active];
      turnIndicator.textContent = e ? `${e.name}'s turn` : '';
    }
  }
}

function openCommand(){
  if (combatState.phase !== 'party' || !cmdMenu) return;

  cmdMenu.innerHTML = '';
  combatState.mode = 'command';

  const m = party[combatState.active];

  // Tick down cooldowns at the start of the actor's command phase
  if (m && m.cooldowns){
    for (const id in m.cooldowns){
      if (m.cooldowns[id] > 0) m.cooldowns[id]--;
    }
  }

  const hasSpecial = (m?.special || []).some((spec, idx) => {
    if(typeof spec !== 'object' || !spec) return false;
    const id   = spec.id ?? spec.key ?? spec.name ?? spec.label ?? `special_${idx}`;
    const cost = spec.adrCost ?? spec.adrenaline_cost ?? 0;
    const cd   = m.cooldowns?.[id] || 0;
    return cd <= 0 && (m.adr ?? 0) >= cost;
  });

  ['Attack', 'Special', 'Item', 'Flee'].forEach((opt) => {
    const d = document.createElement('div');
    d.textContent = opt;
    if (opt === 'Special' && !hasSpecial) d.classList.add('disabled');
    if (opt === 'Item' && (!(player?.inv?.length > 0))) d.classList.add('disabled');
    cmdMenu.appendChild(d);
  });

  const opts = [...cmdMenu.children];
  let idx = opts.findIndex(c => !c.classList.contains('disabled'));
  combatState.choice = idx >= 0 ? idx : 0;
  updateChoice();
  cmdMenu.style.display = 'block';
}

function openSpecialMenu(){
  if (combatState.phase !== 'party' || !cmdMenu) return;

  cmdMenu.innerHTML = '';
  combatState.mode = 'special';

  const m = party[combatState.active];
  (m.special || []).forEach((spec, idx) => {
    if(typeof spec !== 'object' || !spec) return;
    const id    = spec.id ?? spec.key ?? spec.name ?? spec.label ?? `special_${idx}`;
    const d     = document.createElement('div');
    const label = spec.label || spec.name || id;
    const cost  = spec.adrCost ?? spec.adrenaline_cost ?? 0;
    const cd    = m.cooldowns?.[id] || 0;
    d.textContent = label;
    if(cost > 0) d.textContent += ` (${cost})`;
    if(cd > 0) d.textContent += ` [CD ${cd}]`;
    d.dataset.action = idx;
    if ((m.adr ?? 0) < cost || cd > 0) d.classList.add('disabled');
    cmdMenu.appendChild(d);
  });

  const back = document.createElement('div');
  back.textContent = 'Back';
  back.dataset.action = 'back';
  cmdMenu.appendChild(back);

  const opts = [...cmdMenu.children];
  let idx = opts.findIndex(c => !c.classList.contains('disabled'));
  combatState.choice = idx >= 0 ? idx : 0;
  updateChoice();
  cmdMenu.style.display = 'block';
}

function openItemMenu(){
  if (combatState.phase !== 'party' || !cmdMenu) return;

  cmdMenu.innerHTML = '';
  combatState.mode = 'items';

  const usable = player?.inv?.map((it, idx) => ({ it, idx })).filter(x => x.it.use) || [];
  usable.forEach(({ it, idx }) => {
    const d = document.createElement('div');
    d.textContent = it.name;
    d.dataset.idx = idx;
    cmdMenu.appendChild(d);
  });

  if (usable.length === 0){
    const none = document.createElement('div');
    none.textContent = '(No usable items)';
    none.classList.add('disabled');
    cmdMenu.appendChild(none);
  }

  const back = document.createElement('div');
  back.textContent = '(Back)';
  back.dataset.action = 'back';
  cmdMenu.appendChild(back);

  const opts = [...cmdMenu.children];
  let idx = opts.findIndex(c => !c.classList.contains('disabled'));
  combatState.choice = idx >= 0 ? idx : 0;
  updateChoice();
  cmdMenu.style.display = 'block';
}

function updateChoice(){
  if (!cmdMenu) return;
  [...cmdMenu.children].forEach((c, i) => c.classList.toggle('sel', i === combatState.choice));
}

function moveChoice(dir){
  if (!cmdMenu) return;
  const opts = [...cmdMenu.children];
  const tot = opts.length;
  let idx = combatState.choice;
  do {
    idx = (idx + dir + tot) % tot;
  } while (opts[idx].classList.contains('disabled'));
  combatState.choice = idx;
  updateChoice();
}

function handleCombatKey(e){
  if (!combatOverlay || !combatOverlay.classList.contains('shown')) return false;
  if ((e.key === 'Enter' || e.key === ' ') && e.repeat) return false;
  switch (e.key){
    case 'ArrowUp':    moveChoice(-1); return true;
    case 'ArrowDown':  moveChoice(1);  return true;
    case 'Enter':
    case ' ':          chooseOption(); return true;
  }
  return false;
}

function chooseOption(){
  if (!cmdMenu) return;

  const opt = cmdMenu.children[combatState.choice];
  if (!opt || opt.classList.contains('disabled')) return;

  if (combatState.mode === 'command'){
    const choice = opt.textContent.toLowerCase();
    cmdMenu.style.display = 'none';
    if (choice === 'flee'){
      log?.('You fled the battle.');
      closeCombat('flee');
      return;
    }
    if (choice === 'attack') doAttack(1);
    else if (choice === 'special') openSpecialMenu();
    else if (choice === 'item') openItemMenu();
    return;
  }

  // submenu modes
  const action = opt.dataset.action;
  if (combatState.mode === 'items'){
    if (action === 'back'){
      openCommand();
      return;
    }
    const invIdx = parseInt(opt.dataset.idx, 10);
    if (Number.isInteger(invIdx)){
      const prevSel = selectedMember;
      selectedMember = combatState.active;
      const used = useItem?.(invIdx);
      selectedMember = prevSel;
      cmdMenu.style.display = 'none';
      combatState.mode = 'command';
      if (used) nextCombatant();
      else openCommand();
    }
  } else if (combatState.mode === 'special'){
    if (action === 'back'){
      openCommand();
      return;
    }
    const idx = parseInt(action, 10);
    doSpecial(idx);
  }
}

function doAttack(dmg, type = 'basic'){
  const attacker = party[combatState.active];
  const target = combatState.enemies[0];
  if (!attacker || !target){ nextCombatant?.(); return; }

  let dealt = dmg;
  const adrPct = Math.max(0, Math.min(1, (attacker.adr ?? 0) / (attacker.maxAdr || 100)));
  const mult  = 1 + adrPct * (attacker.adrDmgMod || 1);
  dealt = Math.round(dealt * mult);

  const weapon = attacker.equip?.weapon;
  const req = target.requires;
  if (req && (!weapon || weapon.id !== req)){
    dealt = 0;
    log?.(`${attacker.name}'s attacks can't harm ${target.name}. Equip ${req}.`);
  }

  // Immunity to basic
  if (type === 'basic' && Array.isArray(target.immune) && target.immune.includes('basic')){
    dealt = 0;
    log?.(`${target.name} shrugs off the attack.`);
  }

  const luck = (attacker.stats?.LCK || 0) + (attacker._bonus?.LCK || 0);
  const eff  = Math.max(0, luck - 4);
  if (Math.random() < eff * 0.05){
    dealt += 1;
    log?.('Lucky strike!');
  }

  target.hp -= dealt;

  recordCombatEvent?.({
    type: 'player',
    actor: attacker.name,
    action: 'attack',
    target: target.name,
    damage: dealt,
    targetHp: target.hp
  });

  // Adrenaline gain (based on weapon mods & generator mod)
  const baseGain = (weapon?.mods?.ADR ?? 10) / 4;
  const gain     = Math.round(baseGain * (attacker.adrGenMod || 1));
  attacker.adr   = Math.min(attacker.maxAdr || 100, (attacker.adr ?? 0) + Math.max(0, gain));
  if (gain > 0 && typeof playFX === 'function') playFX('adrenaline');

  updateHUD?.();
  if (dealt > 0) log?.(`${attacker.name} hits ${target.name} for ${dealt} damage.`);

  // Enemy counter against basic attacks
  if (type === 'basic' && target.counterBasic){
    const cd = target.counterBasic.dmg || 1;
    attacker.hp -= cd;
    log?.(`${target.name} counters for ${cd} damage.`);
  }

  // Death & loot
  if (target.hp <= 0){
    log?.(`${target.name} is defeated!`);
    recordCombatEvent?.({ type: 'enemy', actor: target.name, action: 'defeated', by: attacker.name });
    globalThis.EventBus?.emit?.('enemy:defeated', { target });
    if (target.loot) addToInv?.(target.loot);

    // Special boss drop chance
    if (target.boss && Math.random() < 0.1){ addToInv?.('memory_worm'); }

    // Spoils cache system (optional)
    if (typeof SpoilsCache !== 'undefined'){
      const cache = SpoilsCache.rollDrop?.(target.challenge);
      if (cache){
        const registered = typeof registerItem === 'function' ? registerItem(cache) : cache;
        itemDrops?.push?.({ id: registered.id, map: party.map, x: party.x, y: party.y });
        log?.(`The ground coughs up a ${registered.name}.`);
        globalThis.EventBus?.emit?.('spoils:drop', { cache: registered, target });
      }
    }

    if (target.npc) removeNPC?.(target.npc);

    combatState.enemies.shift();
    renderCombat();
    if (combatState.enemies.length === 0){
      log?.('Victory!');
      closeCombat('loot');
      return;
    }
  } else {
    renderCombat();
  }

  nextCombatant();
}

function testAttack(attacker, enemy, dmg = 1, type = 'basic'){
  combatState.enemies = [enemy];
  combatState.active = 0;
  party.length = 0;
  party.push(attacker);
  doAttack(dmg, type);
}

function doSpecial(idx){
  const m = party[combatState.active];
  if (!m){ openCommand?.(); return; }

  const spec = m.special?.[idx];
  if(typeof spec !== 'object' || !spec){ openCommand?.(); return; }

  const id    = spec.id ?? spec.key ?? spec.name ?? spec.label ?? `special_${idx}`;
  const label = spec.label || spec.name || id;

  // Cost & cooldown checks
  const cost = spec.adrCost ?? spec.adrenaline_cost ?? 0;
  if ((m.adr ?? 0) < cost){
    log?.('Not enough adrenaline.');
    openSpecialMenu?.();
    return;
  }
  const currentCd = id ? (m.cooldowns?.[id] ?? 0) : 0;
  if (currentCd > 0){
    log?.('Move on cooldown.');
    openSpecialMenu?.();
    return;
  }

  // Pay cost & set cooldown
  m.adr = (m.adr ?? 0) - cost;
  if (spec.cooldown && id){
    if (!m.cooldowns) m.cooldowns = {};
    m.cooldowns[id] = spec.cooldown;
  }

  if (typeof playFX === 'function') playFX('special');

  // Effects
  if (spec.heal){
    const maxHp = m.maxHp ?? m.hp ?? 0;
    const amt   = Math.max(0, spec.heal | 0);
    m.hp = Math.min(maxHp, (m.hp ?? 0) + amt);
    log?.(`${m.name} uses ${label} and heals ${amt} HP.`);
    renderCombat?.();
    nextCombatant?.();
    return;
  }

  if (spec.adrGain){
    const maxAdr = m.maxAdr ?? 100;
    const amt    = Math.max(0, spec.adrGain | 0);
    m.adr = Math.min(maxAdr, (m.adr ?? 0) + amt);
    log?.(`${m.name} uses ${label} and surges with adrenaline!`);
    updateHUD?.();
    nextCombatant?.();
    return;
  }

  if (spec.guard){
    m.guard = true;
    log?.(`${m.name} takes a defensive stance.`);
    nextCombatant?.();
    return;
  }

  if (spec.stun){
    const target = combatState.enemies?.[0];
    if (target){ target.stun = (target.stun ?? 0) + (spec.stun | 0); }
    if (spec.dmg){
      doAttack?.(spec.dmg, 'special');
      return;
    } else {
      log?.(`${m.name} uses ${label}!`);
      renderCombat?.();
      nextCombatant?.();
      return;
    }
  }

  if (spec.dmg){
    doAttack?.(spec.dmg, 'special');
    return;
  }

  // Fallback
  nextCombatant?.();
}

function nextCombatant(){
  combatState.active++;
  if (combatState.active >= (party?.length || 0)){
    enemyPhase();
    return;
  }
  highlightActive();
  openCommand();
}

function enemyPhase(){
  combatState.phase = 'enemy';
  combatState.active = 0;
  highlightActive();
  enemyAttack();
}

function finishEnemyAttack(enemy, target){
  if (target.hp <= 0){
    log?.(`${target.name} falls!`);
    recordCombatEvent?.({ type: 'player', actor: target.name, action: 'fall', by: enemy.name });
    target.adr = 0; // lose adrenaline on defeat
    combatState.fallen.push(target);
    const idx = party.indexOf?.(target);
    if (idx >= 0) party.splice(idx, 1); else party.splice(0, 1);
    renderCombat();
    if ((party?.length || 0) === 0){
      log?.('The party has fallen...');
      closeCombat('bruise');
      return;
    }
  } else {
    renderCombat();
  }

  player.hp = party[0] ? party[0].hp : player.hp;
  updateHUD?.();
  combatState.active++;

  if (combatState.active < combatState.enemies.length){
    highlightActive();
    setTimeout(enemyAttack, 300);
  } else {
    startPartyTurn();
  }
}

function enemyAttack(){
  // Enemies strike a random party member.
  const enemy  = combatState.enemies[combatState.active];
  const tgtIdx = Math.floor(Math.random() * ((party?.length) || 0));
  const target = party[tgtIdx];

  if (!enemy || !target){ closeCombat('flee'); return; }

  // Stun skip
  if (enemy.stun > 0){
    log?.(`${enemy.name} is stunned and cannot act!`);
    enemy.stun--;
    combatState.active++;
    if (combatState.active < combatState.enemies.length){
      highlightActive();
      setTimeout(enemyAttack, 300);
    } else {
      startPartyTurn();
    }
    return;
  }

  // Boss/special telegraph once
  if (enemy.special && !enemy._didSpecial){
    enemy._didSpecial = true;
    const fx     = window.bossTelegraphFX || {};
    const delay  = enemy.special.delay ?? fx.duration ?? 1000;
    const animDur = fx.duration ?? delay;

    combatOverlay?.style?.setProperty?.('--telegraphIntensity', fx.intensity ?? 1);
    combatOverlay?.style?.setProperty?.('--telegraphDuration', animDur + 'ms');
    combatOverlay?.classList.add('warning');

    log?.(`${enemy.name} ${enemy.special.cue || 'charges up!'}`);

    setTimeout(() => {
      combatOverlay?.classList.remove('warning');
      let dmg = enemy.special.dmg || 5;
      const luck = (target.stats?.LCK || 0) + (target._bonus?.LCK || 0);
      const eff  = Math.max(0, luck - 4);
      if (Math.random() < eff * 0.05 && dmg > 0){
        dmg = Math.max(0, dmg - 1);
        log?.('Lucky break!');
      }
      target.hp -= dmg;
      recordCombatEvent?.({ type: 'enemy', actor: enemy.name, action: 'special', target: target.name, damage: dmg, targetHp: target.hp });
      log?.(`${enemy.name} unleashes for ${dmg} damage.`);
      finishEnemyAttack(enemy, target);
    }, delay);

    return;
  }

  // Basic enemy attack with guard mitigation + structured log
  let dmg = 1;
  if (target.guard){
    target.guard = false;
    dmg = Math.max(0, dmg - 1);
    log?.(`${target.name} guards against the attack.`);
  }
  const luck = (target.stats?.LCK || 0) + (target._bonus?.LCK || 0);
  const eff  = Math.max(0, luck - 4);
  if (Math.random() < eff * 0.05 && dmg > 0){
    dmg = Math.max(0, dmg - 1);
    log?.('Lucky break!');
  }
  target.hp -= dmg;

  recordCombatEvent?.({ type: 'enemy', actor: enemy.name, action: 'attack', target: target.name, damage: dmg, targetHp: target.hp });
  log?.(`${enemy.name} strikes ${target.name} for ${dmg} damage.`);
  finishEnemyAttack(enemy, target);
}

function startPartyTurn(){
  combatState.phase = 'party';
  combatState.active = 0;
  highlightActive();
  openCommand();
}

function getCombatLog(){
  // Return a copy of combat events for external analysis.
  return combatState.log.slice();
}

const combatExports = { openCombat, closeCombat, handleCombatKey, getCombatLog, __testAttack: testAttack };
Object.assign(globalThis, combatExports);
