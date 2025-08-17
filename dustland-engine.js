// ===== Rendering & Utilities =====

// Logging
const logEl = document.getElementById('log');
const hpEl = document.getElementById('hp');
const apEl = document.getElementById('ap');
const scrEl = document.getElementById('scrap');

function log(msg){
  const p=document.createElement('div');
  p.textContent=msg;
  logEl.prepend(p);
}

// --- Toasts (lightweight) ---
const toastHost = document.createElement('div');
toastHost.style.cssText = 'position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:9999;pointer-events:none';
document.body.appendChild(toastHost);

function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'margin:6px 0;padding:8px 12px;background:#101910;border:1px solid #2b3b2b;border-radius:8px;color:#c8f7c9;box-shadow:0 8px 20px rgba(0,0,0,.4);opacity:0;transition:opacity .15s, transform .15s; transform: translateY(-6px)';
  toastHost.appendChild(t);
  requestAnimationFrame(()=>{ t.style.opacity = '1'; t.style.transform='translateY(0)'; });
  setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(-6px)'; setTimeout(()=> t.remove(), 180); }, 1600);
  if(/end of demo/i.test(msg) || /demo complete/i.test(msg)){
    player.flags = player.flags || {};
    player.flags.demoComplete = true;
    if(typeof save === 'function') save();
  }
}

// tiny sfx and hud feedback
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function sfxTick(){
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.type='square';
  o.frequency.value=800;
  o.connect(g); g.connect(audioCtx.destination);
  g.gain.value=0.1;
  o.start();
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.1);
  o.stop(audioCtx.currentTime+0.1);
}
function hudBadge(msg){
  const ap=document.getElementById('ap');
  if(!ap) return;
  const span=document.createElement('span');
  span.className='hudBadge';
  span.textContent=msg;
  ap.parentElement.appendChild(span);
  setTimeout(()=>span.remove(),1000);
}

// Tile colors for rendering
const colors = {0:'#1e271d',1:'#2c342c',2:'#1573ff',3:'#203320',4:'#394b39',5:'#304326',6:'#4d5f4d',7:'#233223',8:'#8bd98d',9:'#000000'};

// ===== Camera & CRT draw with ghosting =====
const disp = document.getElementById('game');
const dctx = disp.getContext('2d');
const scene = document.createElement('canvas'); scene.width=disp.width; scene.height=disp.height; const sctx=scene.getContext('2d');
const prev = document.createElement('canvas'); prev.width=disp.width; prev.height=disp.height; const pctx=prev.getContext('2d');

// Font init (prevents invisible glyphs on some canvases)
sctx.font = '12px ui-monospace';

let camX=0, camY=0, showMini=true;
let _lastTime=0;

function draw(t){
  const dt=(t-_lastTime)||0; _lastTime=t;
  render(state, dt/1000);
  dctx.globalAlpha=0.10; dctx.drawImage(prev, 1, 0);
  dctx.globalAlpha=1.0; dctx.drawImage(scene, 0, 0);
  pctx.clearRect(0,0,prev.width,prev.height); pctx.drawImage(scene,0,0);
  requestAnimationFrame(draw);
}

// ===== Camera =====
function centerCamera(x,y,map){
  let W,H;
  if(map==='world'){ W=WORLD_W; H=WORLD_H; }
  else if(interiors[map]){ const I=interiors[map]; W=(I&&I.w)||VIEW_W; H=(I&&I.h)||VIEW_H; }
  else { W=VIEW_W; H=VIEW_H; }
  camX = clamp(x - Math.floor(VIEW_W/2), 0, Math.max(0, (W||VIEW_W) - VIEW_W));
  camY = clamp(y - Math.floor(VIEW_H/2), 0, Math.max(0, (H||VIEW_H) - VIEW_H));
}

// ===== Drawing Pipeline =====
const renderOrder = ['tiles', 'items', 'entitiesBelow', 'player', 'entitiesAbove'];

function render(gameState=state, dt){
  const ctx = sctx;
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,disp.width,disp.height);
  
  const activeMap = gameState.map || mapIdForState();
  const { W, H } = mapWH(activeMap);
  const offX = Math.max(0, Math.floor((VIEW_W - W) / 2));
  const offY = Math.max(0, Math.floor((VIEW_H - H) / 2));

  const items = gameState.itemDrops || itemDrops;
  const entities = gameState.entities || NPCS;
  const ply = gameState.player || player;

  // split entities into below/above
  const below = [], above = [];
  for(const n of entities){
    if(n.map !== activeMap) continue;
    (n.drawAbovePlayer ? above : below).push(n);
  }

  for(const layer of renderOrder){
    if(layer==='tiles'){
      for(let vy=0; vy<VIEW_H; vy++){
        for(let vx=0; vx<VIEW_W; vx++){
          const gx = camX + vx - offX, gy = camY + vy - offY;
          if(gx<0||gy<0||gx>=W||gy>=H) continue;
          const t = getTile(activeMap,gx,gy); if(t===null) continue;
          ctx.fillStyle = colors[t]; ctx.fillRect(vx*TS,vy*TS,TS,TS);
          if(t===TILE.DOOR){
            ctx.strokeStyle='#9ef7a0';
            ctx.strokeRect(vx*TS+5,vy*TS+5,TS-10,TS-10);
            if(doorPulseUntil && Date.now()<doorPulseUntil){
              const a=0.3+0.2*Math.sin(Date.now()/200);
              ctx.globalAlpha=a;
              ctx.strokeRect(vx*TS+3,vy*TS+3,TS-6,TS-6);
              ctx.globalAlpha=1;
            }
          }
        }
      }
    }
    else if(layer==='items'){
      for(const it of items){
        if(it.map!==activeMap) continue;
        if(it.x>=camX&&it.y>=camY&&it.x<camX+VIEW_W&&it.y<camY+VIEW_H){
          const vx=(it.x-camX+offX)*TS, vy=(it.y-camY+offY)*TS;
          ctx.fillStyle='#c8ffbf'; ctx.fillRect(vx+4,vy+4,TS-8,TS-8);
        }
      }
    }
    else if(layer==='entitiesBelow'){ drawEntities(ctx, below, offX, offY); }
    else if(layer==='player'){
      const px=(ply.x-camX+offX)*TS, py=(ply.y-camY+offY)*TS;
      ctx.fillStyle='#d9ffbe'; ctx.fillRect(px,py,TS,TS);
      ctx.fillStyle='#000'; ctx.fillText('@',px+4,py+12);
    }
    else if(layer==='entitiesAbove'){ drawEntities(ctx, above, offX, offY); }
  }

  // UI border
  ctx.strokeStyle='#2a3b2a';
  ctx.strokeRect(0.5,0.5,VIEW_W*TS-1,VIEW_H*TS-1);
}

function drawEntities(ctx, list, offX, offY){
  for(const n of list){
    if(n.x>=camX&&n.y>=camY&&n.x<camX+VIEW_W&&n.y<camY+VIEW_H){
      const vx=(n.x-camX+offX)*TS, vy=(n.y-camY+offY)*TS;
      ctx.fillStyle=n.color; ctx.fillRect(vx,vy,TS,TS);
      ctx.fillStyle='#000'; ctx.fillText('!',vx+5,vy+12);
    }
  }
}

Object.assign(window, { renderOrderSystem: { order: renderOrder, render } });

// ===== HUD & Tabs =====
const TAB_BREAKPOINT = 1600;
let activeTab = 'inv';

function updateHUD(){
  hpEl.textContent=player.hp;
  apEl.textContent=player.ap;
  if(scrEl) scrEl.textContent = player.scrap;
}

function showTab(which){
  activeTab = which;
  if(window.innerWidth >= TAB_BREAKPOINT) return;
  const inv=document.getElementById('inv'), partyEl=document.getElementById('party'), q=document.getElementById('quests');
  const tInv=document.getElementById('tabInv'), tP=document.getElementById('tabParty'), tQ=document.getElementById('tabQuests');
  inv.style.display=(which==='inv'?'grid':'none');
  partyEl.style.display=(which==='party'?'grid':'none');
  q.style.display=(which==='quests'?'grid':'none');
  for(const el of [tInv,tP,tQ]) el.classList.remove('active');
  if(which==='inv') tInv.classList.add('active');
  if(which==='party') tP.classList.add('active');
  if(which==='quests') tQ.classList.add('active');
}

function updateTabsLayout(){
  const wide = window.innerWidth >= TAB_BREAKPOINT;
  const tabs = document.querySelector('.tabs');
  const inv=document.getElementById('inv'), partyEl=document.getElementById('party'), q=document.getElementById('quests');
  if(wide){
    if(tabs) tabs.style.display='none';
    inv.style.display='grid';
    partyEl.style.display='grid';
    q.style.display='grid';
  } else {
    if(tabs) tabs.style.display='flex';
    showTab(activeTab);
  }
}
window.addEventListener('resize', updateTabsLayout);
updateTabsLayout();

document.getElementById('tabInv').onclick=()=>showTab('inv');
document.getElementById('tabParty').onclick=()=>showTab('party');
document.getElementById('tabQuests').onclick=()=>showTab('quests');

// ===== Renderers =====
function renderInv(){
  const inv=document.getElementById('inv');
  inv.innerHTML='';
  if(player.inv.length===0){
    inv.innerHTML='<div class="slot muted">(empty)</div>';
    return;
  }
  player.inv.forEach((it,idx)=>{
    const row=document.createElement('div');
    row.className='slot';
    const baseLabel = it.name + (it.slot?` [${it.slot}]`:'');
    const label = (it.cursed && it.cursedKnown)? `${baseLabel} (cursed)` : baseLabel;
    row.innerHTML = `<div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
        <span>${label}</span>
        <span style="display:flex;gap:6px">
          ${it.slot? `<button class="btn" data-a="equip">Equip</button>`:''}
          ${it.use?  `<button class="btn" data-a="use">Use</button>`:''}
        </span>
      </div>`;
    // Build tooltip (name/slot + desc + mods + use + rarity + value [+ currency])
    const mods = Object.entries(it.mods || {})
      .map(([k, v]) => `${k} ${v >= 0 ? '+' : ''}${v}`)
      .join(' ');

    const use = it.use ? `${it.use.type}${it.use.amount ? ` ${it.use.amount}` : ''}` : '';

    const valueStr = (() => {
      const v = it.value ?? 0;
      // Show currency if defined (shopkeeper branch), else just the number (main)
      return (typeof CURRENCY !== 'undefined' && CURRENCY)
        ? `${v} ${CURRENCY}`
        : String(v);
    })();

    const nameLine = baseLabel + ((it.cursed && it.cursedKnown)? ' (cursed)' : '');
    const tip = [
      nameLine, // from main
      it.desc || '',
      mods ? `Mods: ${mods}` : '',
      use  ? `Use: ${use}`   : '',
      `Rarity: ${it.rarity}`,
      `Value: ${valueStr}`                         // from shopkeeper branch (currency-aware)
    ].filter(Boolean).join('\n');

    row.title = tip;    
    const equipBtn = row.querySelector('button[data-a="equip"]');
    if(equipBtn) equipBtn.onclick=()=> equipItem(selectedMember, idx);
    const useBtn = row.querySelector('button[data-a="use"]');
    if(useBtn) useBtn.onclick=()=> useItem(idx);
    inv.appendChild(row);
  });
}
function renderQuests(){ const q=document.getElementById('quests'); q.innerHTML=''; const ids=Object.keys(quests); if(ids.length===0){ q.innerHTML='<div class="q muted">(no quests)</div>'; return; } ids.forEach(id=>{ const v=quests[id]; const div=document.createElement('div'); div.className='q'; div.innerHTML=`<div><b>${v.title}</b></div><div class="small">${v.desc}</div><div class="status">${v.status}</div>`; q.appendChild(div); }); }
function renderParty(){ const p=document.getElementById('party'); p.innerHTML=''; if(party.length===0){ p.innerHTML='<div class="pcard muted">(no party members yet)</div>'; return; } party.forEach((m,i)=>{ const c=document.createElement('div'); c.className='pcard'; const bonus=m._bonus||{}; const fmt=v=> (v>0? '+'+v : v); const wLabel=m.equip.weapon?(m.equip.weapon.cursed&&m.equip.weapon.cursedKnown?m.equip.weapon.name+' (cursed)':m.equip.weapon.name):'—'; const aLabel=m.equip.armor?(m.equip.armor.cursed&&m.equip.armor.cursedKnown?m.equip.armor.name+' (cursed)':m.equip.armor.name):'—'; const tLabel=m.equip.trinket?(m.equip.trinket.cursed&&m.equip.trinket.cursedKnown?m.equip.trinket.name+' (cursed)':m.equip.trinket.name):'—'; c.innerHTML = `<div class='row'><b>${m.name}</b> — ${m.role} (Lv ${m.lvl})</div><div class='row small'>${statLine(m.stats)}</div><div class='row'>HP ${m.hp}/${m.maxHp}  AP ${m.ap}  ATK ${fmt(bonus.ATK||0)}  DEF ${fmt(bonus.DEF||0)}  LCK ${fmt(bonus.LCK||0)}</div><div class='row small'>WPN: ${wLabel}${m.equip.weapon?` <button class="btn" data-a="unequip" data-slot="weapon">Unequip</button>`:''}  ARM: ${aLabel}${m.equip.armor?` <button class="btn" data-a="unequip" data-slot="armor">Unequip</button>`:''}  TRK: ${tLabel}${m.equip.trinket?` <button class="btn" data-a="unequip" data-slot="trinket">Unequip</button>`:''}</div><div class='row small'>XP ${m.xp}/${xpToNext(m.lvl)}</div><div class='row'><label><input type='radio' name='selMember' ${i===selectedMember?'checked':''}> Selected</label></div>`; c.querySelector('input').onchange=()=>{ selectedMember=i; }; c.querySelectorAll('button[data-a="unequip"]').forEach(b=>{ const sl=b.dataset.slot; b.onclick=()=> unequipItem(i,sl); }); p.appendChild(c); }); }

// ===== Minimal Unit Tests (#test) =====
function assert(name, cond){ const msg = (cond? '✅ ':'❌ ') + name; log(msg); if(!cond) console.error('Test failed:', name); }
function runTests(){
  openCreator(); assert('Creator visible', creator.style.display==='flex');
  step=2; renderStep(); assert('Stat + buttons exist', ccRight.querySelectorAll('button[data-d="1"]').length>0);

  genWorld(); const hutsOK = buildings.length>0 && buildings.every(b=> b.interiorId && interiors[b.interiorId] && interiors[b.interiorId].grid); assert('Huts have interiors', hutsOK);

  if(typeof moduleTests === 'function') moduleTests(assert);
}

// ===== Input =====
document.getElementById('saveBtn').onclick=()=>save();
document.getElementById('loadBtn').onclick=()=>{ load(); };
document.getElementById('resetBtn').onclick=()=>resetAll();

document.getElementById('nanoToggle').onclick=()=>{
  if(window.NanoDialog){
    NanoDialog.enabled = !NanoDialog.enabled;
    if (typeof toast === 'function') toast(`Dynamic dialog ${NanoDialog.enabled ? 'enabled' : 'disabled'}`);
    if (NanoDialog.refreshIndicator) NanoDialog.refreshIndicator();
  }
};

window.addEventListener('keydown',(e)=>{
  if(overlay.classList.contains('shown')){
    if(e.key==='Escape') closeDialog();
    return;
  }
  switch(e.key){
    case 'ArrowUp': case 'w': case 'W': move(0,-1); break;
    case 'ArrowDown': case 's': case 'S': move(0,1); break;
    case 'ArrowLeft': case 'a': case 'A': move(-1,0); break;
    case 'ArrowRight': case 'd': case 'D': move(1,0); break;
    case 'e': case 'E': case ' ': interact(); break;
    case 't': case 'T': takeNearestItem(); break;
    case 'i': case 'I': showTab('inv'); break;
    case 'p': case 'P': showTab('party'); break;
    case 'q': if(!e.ctrlKey && !e.metaKey){ showTab('quests'); e.preventDefault(); } break;
    case 'Tab':
      e.preventDefault();
      if (party.length>0){
        selectedMember = (selectedMember + 1) % party.length;
        renderParty();
        toast(`Leader: ${party[selectedMember].name}`);
        if(window.NanoDialog){
          const near = NPCS.filter(n => n.map === state.map
            && Math.abs(n.x - player.x) + Math.abs(n.y - player.y) < 10);
          near.forEach(n => NanoDialog.queueForNPC(n, 'start', 'leader change'));
        }
      }
      break;
    case 'm': case 'M': showMini=!showMini; break;
  }
});

// ===== Boot =====
if (typeof bootMap === 'function') bootMap(); // ensure a grid exists before first frame
requestAnimationFrame(draw);
log('v0.6.7 — Stable boot; items/NPCs visible; E/T to take; selected member rolls.');
if (window.NanoDialog) NanoDialog.init();

if(location.hash.includes('test')){ runTests(); }
else {
  const saveStr = localStorage.getItem('dustland_crt');
  if(saveStr){
    showStart();
  } else {
    openCreator();
  }
}

