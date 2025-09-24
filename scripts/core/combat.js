// ===== Combat =====
const combatOverlay = typeof document !== 'undefined' ? document.getElementById('combatOverlay') : null;
const enemyRow      = typeof document !== 'undefined' ? document.getElementById('combatEnemies') : null;
const partyRow      = typeof document !== 'undefined' ? document.getElementById('combatParty') : null;
const cmdMenu       = typeof document !== 'undefined' ? document.getElementById('combatCmd') : null;
const turnIndicator = typeof document !== 'undefined' ? document.getElementById('turnIndicator') : null;
const combatKeys    = {};
// Track how many turns it takes to defeat each enemy type
const enemyTurnStats = globalThis.enemyTurnStats || (globalThis.enemyTurnStats = {});

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('keyup', (e) => { combatKeys[e.key] = false; });
}

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
  log: [],
  startTime: 0,
  afterEnemy: null,
  turns: 0
};

function partyHasQuirk(name){
  return Array.isArray(party) && party.some(m => m?.quirk === name);
}

function recordCombatEvent(ev, relay = true){
  combatState.log.push(ev);
  if(relay) globalThis.EventBus?.emit('combat:event', ev);
}
globalThis.EventBus?.on?.('combat:event', ev => recordCombatEvent(ev, false));

function hasStatusImmunity(target, type){
  if(!target || !type) return false;
  const key = `${type}_immune`;
  if((target._bonus?.[key] || 0) > 0) return true;
  if(target.equip){
    const slots = ['weapon', 'armor', 'trinket'];
    for(const slot of slots){
      const it = target.equip[slot];
      if(!it) continue;
      const tags = Array.isArray(it.tags) ? it.tags : [];
      if(tags.some(t => typeof t === 'string' && t.toLowerCase() === key)) return true;
      const mods = it.mods || {};
      if(mods[key] || mods[`${type}Immune`]) return true;
    }
  }
  return false;
}

function addStatus(target, status){
  if(!target || !status) return;
  target.statusEffects = target.statusEffects || [];
  if(status.type === 'poison'){
    if(hasStatusImmunity(target, 'poison')){
      log?.(`${target.name || 'Target'} resists the poison.`);
      return;
    }
    const rawStrength = status.strength ?? status.dmg ?? 0;
    const rawDuration = status.duration ?? status.turns ?? status.remaining ?? 0;
    const strength = Math.max(0, rawStrength | 0);
    const duration = Math.max(0, rawDuration | 0);
    const existing = target.statusEffects.find(s => s.type === 'poison');
    if(existing){
      existing.strength = Math.max(existing.strength | 0, strength);
      existing.remaining = (existing.remaining | 0) + duration;
      log?.(`${target.name || 'Target'} is further poisoned!`);
      return;
    }
    target.statusEffects.push({ type:'poison', strength, remaining: duration });
    log?.(`${target.name || 'Target'} is poisoned!`);
  }
}

function tickStatuses(target){
  if(!target || !Array.isArray(target.statusEffects)) return false;
  for(let i=target.statusEffects.length-1;i>=0;i--){
    const s = target.statusEffects[i];
    if(s.type === 'poison'){
      const dmg = Math.max(0, s.strength|0);
      target.hp -= dmg;
      log?.(`${target.name} takes ${dmg} poison damage.`);
    }
    s.remaining--;
    if(s.remaining<=0){
      target.statusEffects.splice(i,1);
      if(s.type==='poison') log?.(`${target.name} is no longer poisoned.`);
    }
  }
  return target.hp <= 0;
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
        if (typeof obj.portraitFrame !== 'number'){
          obj.portraitFrame = Math.floor(Math.random() * 4);
        }
        frame = obj.portraitFrame;
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
    if (obj && obj.prompt) {
      el.textContent = obj.prompt;
    } else if (obj && obj.portrait) {
      el.textContent = obj.portrait;
    } else {
      el.textContent = '@';
    }
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
    if (typeof hp.setAttribute === 'function') {
      hp.setAttribute('role','progressbar');
      hp.setAttribute('aria-label','Health');
      hp.setAttribute('aria-valuemin','0');
      hp.setAttribute('aria-valuemax', e.maxHp || 1);
      hp.setAttribute('aria-valuenow', e.hp | 0);
    }
    const hpf = document.createElement('div'); hpf.className = 'fill';
    hpf.style.width = Math.max(0, Math.min(100, (e.hp / (e.maxHp || 1)) * 100)) + '%';
    hp.appendChild(hpf); wrap.appendChild(hp);

    const adr  = document.createElement('div'); adr.className  = 'hudbar adr'; adr.style.width = '48px';
    if (typeof adr.setAttribute === 'function') {
      adr.setAttribute('role','progressbar');
      adr.setAttribute('aria-label','Adrenaline');
      adr.setAttribute('aria-valuemin','0');
      adr.setAttribute('aria-valuemax', e.maxAdr || 1);
      adr.setAttribute('aria-valuenow', e.adr | 0);
    }
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
    if (typeof hp.setAttribute === 'function') {
      hp.setAttribute('role','progressbar');
      hp.setAttribute('aria-label','Health');
      hp.setAttribute('aria-valuemin','0');
      hp.setAttribute('aria-valuemax', m.maxHp || 1);
      hp.setAttribute('aria-valuenow', m.hp | 0);
    }
    const hpf = document.createElement('div'); hpf.className = 'fill';
    hpf.style.width = Math.max(0, Math.min(100, (m.hp / (m.maxHp || 1)) * 100)) + '%';
    hp.appendChild(hpf); wrap.appendChild(hp);

    const adr  = document.createElement('div'); adr.className  = 'hudbar adr'; adr.style.width = '48px';
    if (typeof adr.setAttribute === 'function') {
      adr.setAttribute('role','progressbar');
      adr.setAttribute('aria-label','Adrenaline');
      adr.setAttribute('aria-valuemin','0');
      adr.setAttribute('aria-valuemax', m.maxAdr || 1);
      adr.setAttribute('aria-valuenow', m.adr || 0);
    }
    const adrf = document.createElement('div'); adrf.className = 'fill';
    adrf.style.width = Math.max(0, Math.min(100, ((m.adr || 0) / (m.maxAdr || 1)) * 100)) + '%';
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
    for (const k in combatKeys) combatKeys[k] = false;
    combatState.turns = 1;
    combatState.enemies = enemies.map(e => ({
      ...e,
      maxHp: e.maxHp || e.hp,
      maxAdr: e.maxAdr || 100,
      adr: e.adr ?? 0,
      spawnTurn: combatState.turns
    }));
    combatState.phase = 'party';
    combatState.active = 0;
    combatState.choice = 0;
    combatState.onComplete = resolve;
    combatState.log = [];
    combatState.startTime = Date.now();
    recordCombatEvent({ type: 'system', action: 'start', time: combatState.startTime });
    party.fallen = [];
    party._roster = Array.from(party);

    (party || []).forEach(m => {
      m.maxAdr = m.maxAdr || 100;
      m.applyCombatMods?.();
      m.guard = false;
      m.cooldowns = m.cooldowns || {};
    });

    renderCombat();
    updateHUD?.();
    combatOverlay.classList.add('shown');

    const enemyNames = combatState.enemies.map(e => e.name || 'foe');
    if (enemyNames.length) {
      let msg;
      if (enemyNames.length === 1) {
        const name = enemyNames[0];
        const article = /^[aeiou]/i.test(name) ? 'an' : 'a';
        msg = `You encounter ${article} ${name}.`;
      } else {
        const last = enemyNames.pop();
        msg = `You encounter ${enemyNames.join(', ')} and ${last}.`;
      }
      log?.(msg);
    }

    globalThis.EventBus?.emit?.('combat:started');
    globalThis.EventBus?.emit?.('music:mood', { id: 'combat', source: 'combat', priority: 90 });
    openCommand();
  });
}

function closeCombat(result = 'flee'){
  if (combatOverlay) combatOverlay.classList.remove('shown');
  if (cmdMenu) cmdMenu.style.display = 'none';
  if (turnIndicator) turnIndicator.textContent = '';

  party.restore();

  if(result === 'bruise'){
    if(state.mapEntry){
      const entry = state.mapEntry;
      log?.('You wake up at the entrance.');
      if(typeof toast==='function') toast('You wake up at the entrance.');
      if(typeof setMap==='function') setMap(entry.map);
      setPartyPos?.(entry.x, entry.y);
    }
    party.healAll?.();
  }

  const duration = Date.now() - combatState.startTime;
  recordCombatEvent({ type: 'system', action: 'end', result, duration });
  globalThis.EventBus?.emit?.('music:mood', { id: null, source: 'combat' });
  globalThis.EventBus?.emit?.('combat:ended', { result });
  const tele = { duration, log: combatState.log.slice() };
  globalThis.EventBus?.emit?.('combat:telemetry', tele);
  if(globalThis.Dustland){
    const arr = globalThis.Dustland.combatTelemetry || (globalThis.Dustland.combatTelemetry = []);
    arr.push(tele);
  }
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

  const m = party[combatState.active];

  if (m && tickStatuses(m)){
    log?.(`${m.name} falls to poison.`);
    party.fall(m);
    renderCombat();
    if ((party?.length || 0) === 0){
      log?.('The party has fallen...');
      closeCombat('bruise');
      return;
    }
    nextCombatant();
    return;
  }

  cmdMenu.innerHTML = '';
  combatState.mode = 'command';

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

function attemptFlee(){
  const partyPower = (party || []).reduce((s, m) => s + (m.lvl || 1), 0);
  const enemyPower = (combatState.enemies || []).reduce((s, e) => s + (e.challenge || e.hp || 1), 0);
  const chance = partyPower / (partyPower + enemyPower);
  if (Math.random() < chance){
    log?.('You fled the battle.');
    closeCombat('flee');
    return;
  }
  log?.("Couldn't escape!");
  const nextIdx = combatState.active + 1;
  combatState.afterEnemy = () => {
    if (nextIdx >= (party?.length || 0)){
      startPartyTurn();
    } else {
      combatState.phase = 'party';
      combatState.active = nextIdx;
      highlightActive();
      openCommand();
    }
  };
  combatState.phase = 'enemy';
  combatState.active = 0;
  highlightActive();
  enemyAttack();
}

function handleCombatKey(e){
  if (!combatOverlay || !combatOverlay.classList.contains('shown')) return false;
  if (e.repeat && !combatKeys[e.key]) return false;
  combatKeys[e.key] = true;
  if ((e.key === 'Enter' || e.key === ' ') && e.repeat) return false;
  switch (e.key){
    case 'ArrowUp':    moveChoice(-1); return true;
    case 'ArrowDown':  moveChoice(1);  return true;
    case 'Enter':
    case ' ':          chooseOption(); return true;
    case 'Escape':     attemptFlee(); return true;
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
    if (choice === 'flee'){ attemptFlee(); return; }
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
      if (used){
        const overlayActive = combatOverlay?.classList?.contains('shown');
        if (!overlayActive || (combatState.enemies?.length ?? 0) === 0){
          return;
        }
        nextCombatant();
      } else {
        openCommand();
      }
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

function humanizeRequirementId(id){
  if(!id) return '';
  return String(id).replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function labelRequirement(entry){
  if(!entry) return '';
  if(typeof entry === 'string'){
    if(entry.startsWith('tag:')){
      const tag = entry.slice(4);
      return `${tag.replace(/[_-]+/g, ' ')} weapon`.trim();
    }
    const items = (typeof ITEMS === 'object' && ITEMS) ? ITEMS : null;
    const def = items ? items[entry] : null;
    if(def?.name) return def.name;
    return humanizeRequirementId(entry);
  }
  if(entry && typeof entry === 'object'){
    if(entry.name) return entry.name;
    if(entry.id) return labelRequirement(entry.id);
  }
  return humanizeRequirementId(entry);
}

function doAttack(dmg, type = 'basic'){
  const attacker = party[combatState.active];
  const weapon   = attacker?.equip?.weapon;
  // Spread attacks hit all enemies for a percentage of base damage.
  const spread   = weapon?.mods?.spread;
  const targets  = spread ? [...combatState.enemies] : [combatState.enemies[0]];
  if (!attacker || targets.length === 0){ nextCombatant?.(); return; }

  const isRanged = weapon && /rifle|gun|bow|pistol/i.test(weapon.id || weapon.name || '');
  const statName = isRanged ? 'AGI' : 'STR';
  const statVal  = (attacker.stats?.[statName] || 0) + (attacker._bonus?.[statName] || 0);
  const statBonus = Math.max(0, statVal - 4);
  const atkBonus  = attacker._bonus?.ATK || 0;
  const base      = dmg + atkBonus + statBonus;
  let minBase = base > 3
    ? Math.max(1, base - 3)
    : Math.max(1, base - 3 + statBonus);
  minBase     = Math.min(base, minBase);
  let dealt   = Math.floor(Math.random() * (base - minBase + 1)) + minBase;

  const adrPct = Math.max(0, Math.min(1, (attacker.adr ?? 0) / (attacker.maxAdr || 100)));
  const mult  = 1 + adrPct * (attacker.adrDmgMod || 1);
  dealt = Math.round(dealt * mult);

  // Adrenaline gain (based on weapon mods & generator mod)
  const baseGain = (weapon?.mods?.ADR ?? 10) / 4;
  const gain     = Math.round(baseGain * (attacker.adrGenMod || 1));
  attacker.adr   = Math.min(attacker.maxAdr || 100, (attacker.adr ?? 0) + Math.max(0, gain));
  if (gain > 0 && typeof playFX === 'function') playFX('adrenaline');

  updateHUD?.();

  const perTarget = spread ? Math.max(0, Math.round(dealt * spread / 100)) : dealt;
  const defeated = [];
  for (const target of targets){
    let tDmg = perTarget;

    // Required weapon gate
    const req = target.requires;
    if (req){
      const reqList = Array.isArray(req) ? req : [req];
      const weaponId = weapon?.id;
      const weaponTags = Array.isArray(weapon?.tags) ? weapon.tags : [];
      let meetsRequirement = false;
      for (const entry of reqList){
        if (typeof entry === 'string' && entry.startsWith('tag:')){
          const tag = entry.slice(4);
          if (weaponTags.includes(tag)){ meetsRequirement = true; break; }
        } else if (entry && weaponId === entry){
          meetsRequirement = true;
          break;
        }
      }
      if (!meetsRequirement){
        const label = reqList
          .map(labelRequirement)
          .filter(Boolean)
          .join(' or ') || 'the required weapon';
        tDmg = 0;
        log?.(`${attacker.name}'s attacks can't harm ${target.name}. Equip ${label}.`);
      }
    }

    // Immunity to basic attacks
    if (type === 'basic' && Array.isArray(target.immune) && target.immune.includes('basic')){
      tDmg = 0;
      log?.(`${target.name} shrugs off the attack.`);
    }

    // Target defense
    const preDef = tDmg;
    tDmg = Math.max(0, tDmg - (target.DEF || 0));
    if (preDef > 0 && tDmg === 0) {
      log?.(`${attacker.name}'s attack bounces off ${target.name} harmlessly.`);
    }

    const luck = (attacker.stats?.LCK || 0) + (attacker._bonus?.LCK || 0);
    const eff  = Math.max(0, luck - 4);
    if (Math.random() < eff * 0.05){
      tDmg += 1;
      log?.('Lucky strike!');
    }

    const instantKillChance = Math.min(0.25, Math.max(0, eff - 12) * 0.01);
    if (tDmg > 0 && target.hp > 0 && instantKillChance > 0 && Math.random() < instantKillChance){
      tDmg = Math.max(tDmg, target.hp);
      log?.(`${attacker.name}'s incredible luck fells ${target.name} instantly!`);
    }

    target.hp -= tDmg;

    recordCombatEvent?.({
      type: 'player',
      actor: attacker.name,
      action: 'attack',
      target: target.name,
      damage: tDmg,
      targetHp: target.hp
    });

    if (tDmg > 0) log?.(`${attacker.name} hits ${target.name} for ${tDmg} damage.`);

    // Enemy counter against basic attacks
    if (type === 'basic' && target.counterBasic){
      const cd = target.counterBasic.dmg || 1;
      attacker.hp -= cd;
      log?.(`${target.name} counters for ${cd} damage.`);
    }

    if (target.hp <= 0 && handleEnemyDefeat(attacker, target, attacker?.name)){
      defeated.push(target);
    }
  }

  if (defeated.length){
    combatState.enemies = combatState.enemies.filter(e => !defeated.includes(e));
  }

  renderCombat();
  if (combatState.enemies.length === 0){
    log?.('Victory!');
    closeCombat('loot');
    return;
  }

  nextCombatant();
}


function normalizeLootDrop(entry) {
  if (!entry) return null;
  const rawItem = entry.item ?? entry.loot ?? entry.reward ?? entry.id;
  if (!rawItem) return null;
  let chance = entry.chance;
  if (!Number.isFinite(chance)) chance = entry.lootChance;
  if (!Number.isFinite(chance)) chance = entry.probability;
  chance = Math.max(0, Math.min(Number(chance ?? 1), 1));
  if (chance <= 0) return null;
  return { item: rawItem, chance };
}

function rollEnemyLoot(target) {
  const table = Array.isArray(target?.lootTable) ? target.lootTable : null;
  if (table && table.length) {
    const drops = table.map(normalizeLootDrop).filter(Boolean);
    if (drops.length) {
      const roll = Math.random();
      let cumulative = 0;
      for (const entry of drops) {
        cumulative = Math.min(1, cumulative + entry.chance);
        if (roll < cumulative) {
          addToInv?.(entry.item);
          return true;
        }
      }
      return false;
    }
  }
  if (target?.loot && Math.random() < (target.lootChance ?? 1)) {
    addToInv?.(target.loot);
    return true;
  }
  return false;
}

function handleEnemyDefeat(attacker, target, sourceLabel){
  if (!target) return false;
  const killer = sourceLabel || attacker?.name || 'You';
  log?.(`${target.name} is defeated!`);
  recordCombatEvent?.({ type: 'enemy', actor: target.name, action: 'defeated', by: killer });
  globalThis.EventBus?.emit?.('enemy:defeated', { target });
  const luckyLint = partyHasQuirk('Lucky Lint');
  const desertProphet = partyHasQuirk('Desert Prophet');
  const killerHasBrutalPast = !!(attacker && attacker.quirk === 'Brutal Past');
  const eid = target.id || target.name;
  if (eid){
    const turnsTaken = combatState.turns - (target.spawnTurn || 1) + 1;
    const stats = enemyTurnStats[eid] || (enemyTurnStats[eid] = { total: 0, count: 0, quick: 0 });
    stats.total += Math.max(1, turnsTaken);
    stats.count += 1;
    if (turnsTaken <= 1) stats.quick += 1;
  }
  rollEnemyLoot(target);

  if (typeof target.scrap === 'object' && Math.random() < (target.scrap.chance ?? 1)) {
    const min = target.scrap.min ?? 1;
    const max = target.scrap.max ?? min;
    let amt = Math.floor(Math.random() * (max - min + 1)) + min;
    if (luckyLint) {
      const bonus = Math.max(1, Math.round(amt * 0.5));
      amt += bonus;
    }
    if (amt > 0) {
      player.scrap = (player.scrap || 0) + amt;
      updateHUD?.();
      const who = target.name || target.id || 'foe';
      log?.(`You find ${amt} scrap on the ${who}.`);
      if (luckyLint) log?.('Lucky Lint shakes loose extra scrap.');
    }
  } else if (/bandit/i.test(target.id) && Math.random() < 0.5){
    let amt = 1;
    if (luckyLint) amt += 1;
    player.scrap = (player.scrap || 0) + amt;
    updateHUD?.();
    log?.(`You find ${amt} scrap on the bandit.`);
    if (luckyLint && amt > 1) log?.('Lucky Lint shakes loose extra scrap.');
  }

  if (target.boss && Math.random() < 0.1){ addToInv?.('memory_worm'); }

  if (typeof SpoilsCache !== 'undefined'){
    const challenge = target.challenge ?? 1;
    const cache = SpoilsCache.rollDrop?.(desertProphet ? challenge + 1 : challenge);
    if (cache){
      const registered = typeof registerItem === 'function' ? registerItem(cache) : cache;
      itemDrops?.push?.({ id: registered.id, map: party.map, x: party.x, y: party.y });
      log?.(`The ground coughs up a ${registered.name}.`);
      if (desertProphet) log?.('A prophetic vision hinted at this cache.');
      globalThis.EventBus?.emit?.('spoils:drop', { cache: registered, target });
    }
  }

  if (killerHasBrutalPast){
    let healed = 0;
    let adrGain = 0;
    if (typeof attacker.maxHp === 'number' && typeof attacker.hp === 'number'){
      const healAmt = Math.max(1, Math.round((attacker.maxHp || 0) * 0.05));
      const before = attacker.hp;
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
      healed = attacker.hp - before;
    }
    if (typeof attacker.maxAdr === 'number' && typeof attacker.adr === 'number'){
      const beforeAdr = attacker.adr;
      const gainAmt = 15;
      attacker.adr = Math.min(attacker.maxAdr, attacker.adr + gainAmt);
      adrGain = attacker.adr - beforeAdr;
    }
    const notes = [];
    if (healed > 0) notes.push(`+${healed} HP`);
    if (adrGain > 0) notes.push(`+${adrGain} ADR`);
    if (notes.length){
      log?.(`${attacker.name} draws on a brutal past (${notes.join(', ')}).`);
      updateHUD?.();
      renderCombat?.();
    }
  }

  if (target.npc) removeNPC?.(target.npc);
  return true;
}

function playerItemAOEDamage(attacker, baseDamage, opts = {}){
  const amount = Math.max(0, baseDamage | 0);
  const enemies = combatState.enemies || [];
  if (!attacker || enemies.length === 0) return { defeated: [] };
  const label = opts.label || 'explosive';
  const ignoreDefense = !!opts.ignoreDefense;
  const defeated = [];

  for (const target of enemies){
    let dmg = amount;
    const beforeDef = dmg;
    if (!ignoreDefense){
      dmg = Math.max(0, dmg - (target.DEF || 0));
    }

    target.hp -= dmg;
    recordCombatEvent?.({
      type: 'player',
      actor: attacker.name,
      action: 'item',
      item: label,
      target: target.name,
      damage: dmg,
      targetHp: target.hp
    });

    if (dmg > 0){
      log?.(`${attacker.name}'s ${label} hits ${target.name} for ${dmg} damage.`);
    } else if (!ignoreDefense && beforeDef > 0){
      log?.(`${target.name} shrugs off the blast.`);
    } else {
      log?.(`${target.name} is unfazed.`);
    }

    if (target.hp <= 0 && handleEnemyDefeat(attacker, target, `${attacker.name}'s ${label}`)){
      defeated.push(target);
    }
  }

  if (defeated.length){
    combatState.enemies = combatState.enemies.filter(e => !defeated.includes(e));
  }

  renderCombat?.();

  if (combatState.enemies.length === 0){
    log?.('Victory!');
    closeCombat('loot');
  }

  return { defeated };
}

function testAttack(attacker, enemy, dmg = 1, type = 'basic'){
  combatState.enemies = [enemy];
  combatState.active = 0;
  party.length = 0;
  party.join(attacker);
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
    party.fall(target);
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

  if (combatState.afterEnemy){
    const cb = combatState.afterEnemy;
    combatState.afterEnemy = null;
    cb();
    return;
  }

  if (combatState.active < combatState.enemies.length){
    highlightActive();
    setTimeout(enemyAttack, 300);
  } else {
    startPartyTurn();
  }
}

function enemyAttack(){
  // Enemies focus the party member with the lowest HP.
  const enemy  = combatState.enemies[combatState.active];
  const target = (party || []).reduce((w, m) => w && w.hp <= m.hp ? w : m, null);

  if (!enemy || !target){ closeCombat('flee'); return; }

  if (tickStatuses(enemy)){
    log?.(`${enemy.name} is defeated!`);
    recordCombatEvent?.({ type:'enemy', actor: enemy.name, action:'defeated', by:'poison' });
    globalThis.EventBus?.emit?.('enemy:defeated', { target: enemy });
    const eid = enemy.id || enemy.name;
    if (eid){
      const turnsTaken = combatState.turns - (enemy.spawnTurn || 1) + 1;
      const stats = enemyTurnStats[eid] || (enemyTurnStats[eid] = { total: 0, count: 0, quick: 0 });
      stats.total += Math.max(1, turnsTaken);
      stats.count += 1;
      if (turnsTaken <= 1) stats.quick += 1;
    }
    // lootChance defaults to 1 (100%) if unspecified
    if (enemy.loot && Math.random() < (enemy.lootChance ?? 1)) addToInv?.(enemy.loot);
    if (/bandit/i.test(enemy.id) && Math.random() < 0.5){
      player.scrap = (player.scrap || 0) + 1;
      updateHUD?.();
      log?.('You find 1 scrap on the bandit.');
    }
    if (enemy.boss && Math.random() < 0.1){ addToInv?.('memory_worm'); }
    if (typeof SpoilsCache !== 'undefined'){
      const cache = SpoilsCache.rollDrop?.(enemy.challenge);
      if (cache){
        const registered = typeof registerItem === 'function' ? registerItem(cache) : cache;
        itemDrops?.push?.({ id: registered.id, map: party.map, x: party.x, y: party.y });
        log?.(`The ground coughs up a ${registered.name}.`);
        globalThis.EventBus?.emit?.('spoils:drop', { cache: registered, target: enemy });
      }
    }
    if (enemy.npc) removeNPC?.(enemy.npc);

    combatState.enemies.splice(combatState.active,1);
    renderCombat();
    if (combatState.enemies.length === 0){
      log?.('Victory!');
      closeCombat('loot');
      return;
    }
    if (combatState.active < combatState.enemies.length){
      highlightActive();
      setTimeout(enemyAttack,300);
    } else {
      startPartyTurn();
    }
    return;
  }

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

      const targets = enemy.special.spread
        ? [target, ...party.filter(m => m !== target)]
        : [target];

      for (const t of targets){
        let dmg = enemy.special.dmg || 5;
        dmg = Math.max(0, dmg - (t._bonus?.DEF || 0));
        const luck = (t.stats?.LCK || 0) + (t._bonus?.LCK || 0);
        const eff  = Math.max(0, luck - 4);
        if (Math.random() < eff * 0.05 && dmg > 0){
          dmg = Math.max(0, dmg - 1);
          log?.('Lucky break!');
        }
        t.hp -= dmg;
        if (enemy.special.stun){
          t.stun = (t.stun || 0) + (enemy.special.stun | 0);
        }
        if (enemy.special.poison){
          const p = enemy.special.poison;
          addStatus?.(t, {
            type: 'poison',
            strength: p.strength || p.dmg || 1,
            duration: p.duration || p.turns || 3
          });
        }
        recordCombatEvent?.({ type: 'enemy', actor: enemy.name, action: 'special', target: t.name, damage: dmg, targetHp: t.hp });
        log?.(`${enemy.name} hits ${t.name} for ${dmg} damage.`);
        if (t !== target && t.hp <= 0){
          log?.(`${t.name} falls!`);
          recordCombatEvent?.({ type: 'player', actor: t.name, action: 'fall', by: enemy.name });
          t.adr = 0;
          party.fall(t);
        }
      }

      if (party.length === 0){
        log?.('The party has fallen...');
        closeCombat('bruise');
        return;
      }

      renderCombat();
      finishEnemyAttack(enemy, target);
    }, delay);

    return;
  }

  // Basic enemy attack with guard mitigation + structured log
  const base = enemy.ATK || 1;
  const minB = Math.max(1, base - 3);
  let dmg = Math.floor(Math.random() * (base - minB + 1)) + minB;
  if (target.guard){
    target.guard = false;
    dmg = Math.max(0, dmg - 1);
    log?.(`${target.name} guards against the attack.`);
  }
  dmg = Math.max(0, dmg - (target._bonus?.DEF || 0));
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
  combatState.turns++;
  highlightActive();
  openCommand();
}

function getCombatLog(){
  return combatState.log.slice();
}

const combatExports = { openCombat, closeCombat, handleCombatKey, getCombatLog, addStatus, tickStatuses, __testAttack: testAttack, __combatState: combatState, playerItemAOEDamage };
Object.assign(globalThis, combatExports);
