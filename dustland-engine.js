
// ===== Rendering & Utilities =====

// Logging
const logEl = document.getElementById('log');
const hpEl = document.getElementById('hp');
const apEl = document.getElementById('ap');
const scrEl = document.getElementById('scrap');

function log(msg){
  if (logEl) {
    const p=document.createElement('div');
    p.textContent=msg;
    logEl.prepend(p);
  } else {
    console.log("Log: " + msg);
  }
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
    party.flags = party.flags || {};
    party.flags.demoComplete = true;
    if(typeof save === 'function') save();
  }
}

// tiny sfx and hud feedback
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioEnabled = true;
function setAudio(on){
  audioEnabled = on;
  const btn=document.getElementById('audioToggle');
  if(btn) btn.textContent = `Audio: ${on ? 'On' : 'Off'}`;
  if(on) audioCtx.resume?.(); else audioCtx.suspend?.();
}
function toggleAudio(){ setAudio(!audioEnabled); }
globalThis.toggleAudio = toggleAudio;
const isMobileUA = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let mobileControlsEnabled = isMobileUA;
let mobilePad = null, mobileAB = null;
function setMobileControls(on){
  mobileControlsEnabled = on;
  const btn=document.getElementById('mobileToggle');
  if(btn) btn.textContent = `Mobile Controls: ${on ? 'On' : 'Off'}`;
  if(on){
    if(!mobilePad){
      mobilePad=document.createElement('div');
      mobilePad.style.cssText='position:fixed;bottom:20px;left:20px;display:grid;grid-template-columns:repeat(3,48px);grid-template-rows:repeat(3,48px);gap:6px;z-index:1000;user-select:none;';
      const mk=(t,fn)=>{
        const b=document.createElement('button');
        b.textContent=t;
        b.style.cssText='width:48px;height:48px;border:2px solid #0f0;border-radius:8px;background:#000;color:#0f0;font-size:20px;user-select:none;outline:none;';
        b.onclick=fn;
        b.onpointerdown=()=>{
          b.style.background='#0f0';
          b.style.color='#000';
          b.style.boxShadow='0 0 8px #0f0';
        };
        const up=()=>{
          b.style.background='#000';
          b.style.color='#0f0';
          b.style.boxShadow='none';
        };
        b.onpointerup=up;
        b.onpointerleave=up;
        return b;
      };
      const mobileMove=(dx,dy,key)=>{
        if(overlay?.classList?.contains('shown')){
          handleDialogKey?.({ key });
        }else{
          move(dx,dy);
        }
      };
      const cells=[
        document.createElement('div'),
        mk("↑",()=>mobileMove(0,-1,'ArrowUp')),
        document.createElement('div'),
        mk("←",()=>mobileMove(-1,0,'ArrowLeft')),
        document.createElement('div'),
        mk("→",()=>mobileMove(1,0,'ArrowRight')),
        document.createElement('div'),
        mk("↓",()=>mobileMove(0,1,'ArrowDown')),
        document.createElement('div')
      ];
      cells.forEach(c=>mobilePad.appendChild(c));
      document.body.appendChild(mobilePad);
      mobileAB=document.createElement('div');
      mobileAB.style.cssText='position:fixed;bottom:20px;right:20px;display:flex;gap:10px;z-index:1000;user-select:none;';
      mobileAB.appendChild(mk('A',()=>{
        if(overlay?.classList?.contains('shown')) handleDialogKey?.({ key:'Enter' }); else interact();
      }));
      mobileAB.appendChild(mk('B',takeNearestItem));
      document.body.appendChild(mobileAB);
    }
  } else {
    if(mobilePad) { mobilePad.remove(); mobilePad=null; }
    if(mobileAB) { mobileAB.remove(); mobileAB=null; }
  }
}
function toggleMobileControls(){ setMobileControls(!mobileControlsEnabled); }
function sfxTick(){
  if(!audioEnabled) return;
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
const sfxSpriteData = [
  { id:'step', start:0.00, dur:0.05 },
  { id:'pickup', start:0.05, dur:0.08 },
  { id:'confirm', start:0.13, dur:0.08 },
  { id:'denied', start:0.21, dur:0.08 }
];
const sfxSpriteSrc = 'data:audio/wav;base64,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';
const sfxBase = new Audio(sfxSpriteSrc);
function playSfx(id){
  if(!audioEnabled) return;
  if(id==='tick') return sfxTick();
  const meta=sfxSpriteData.find(s=>s.id===id);
  if(!meta) return;
  const a=sfxBase.cloneNode();
  a.volume=0.2;
  a.currentTime=meta.start;
  // Ignore playback aborts from rapid movement to avoid console noise
  a.play().catch(()=>{});
  setTimeout(()=>a.pause(), meta.dur*1000);
}
EventBus.on('sfx', playSfx);
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
const colors = {0:'#1e271d',1:'#313831',2:'#1573ff',3:'#203320',4:'#777777',5:'#304326',6:'#4d5f4d',7:'#233223',8:'#8bd98d',9:'#000000'};
// Alternate floor colors used in office interiors for subtle variation
const officeFloorColors = ['#233223','#243424','#222a22'];
const officeMaps = new Set(['floor1','floor2','floor3']);

// ===== Camera & CRT draw with ghosting =====
const disp = document.getElementById('game');
const dctx = disp.getContext('2d');
const scene = document.createElement('canvas'); scene.width=disp.width; scene.height=disp.height; const sctx=scene.getContext('2d');
const prev = document.createElement('canvas'); prev.width=disp.width; prev.height=disp.height; const pctx=prev.getContext('2d');

// Font init (prevents invisible glyphs on some canvases)
sctx.font = '12px system-ui, sans-serif';

let camX=0, camY=0, showMini=true;
let _lastTime=0;
let bumpX=0, bumpY=0, bumpEnd=0;
const sparkles=[];

function footstepBump(){
  bumpX = (Math.random()-0.5)*2;
  bumpY = (Math.random()-0.5)*2;
  bumpEnd = performance.now() + 50;
}

function pickupSparkle(x,y){
  sparkles.push({x,y});
}

function draw(t){
  if (disp.width < 16) {
    return;
  }
  const dt=(t-_lastTime)||0; _lastTime=t;
  render(state, dt/1000);
  const bx = bumpEnd > performance.now() ? bumpX : 0;
  const by = bumpEnd > performance.now() ? bumpY : 0;
  dctx.globalAlpha=0.20; dctx.drawImage(prev, 1 + bx, by);
  dctx.globalAlpha=0.2; dctx.drawImage(scene, bx, by);
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
  const pos = gameState.party || party;

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
          let col = colors[t];
          if(t===TILE.FLOOR && officeMaps.has(activeMap)){
            col = officeFloorColors[(gx+gy)%officeFloorColors.length];
          }
          ctx.fillStyle = col; ctx.fillRect(vx*TS,vy*TS,TS,TS);
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
      const px=(pos.x-camX+offX)*TS, py=(pos.y-camY+offY)*TS;
      ctx.fillStyle='#d9ffbe'; ctx.fillRect(px,py,TS,TS);
      ctx.fillStyle='#000'; ctx.fillText('@',px+4,py+12);
    }
    else if(layer==='entitiesAbove'){ drawEntities(ctx, above, offX, offY); }
  }

  if(sparkles.length){
    for(const s of sparkles){
      const sx = (s.x - camX + offX) * TS;
      const sy = (s.y - camY + offY) * TS;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(sx, sy, TS, TS);
    }
    sparkles.length = 0;
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
  if (inv) {
    inv.style.display=(which==='inv'?'grid':'none');
    partyEl.style.display=(which==='party'?'grid':'none');
    q.style.display=(which==='quests'?'grid':'none');
    for(const el of [tInv,tP,tQ]) el.classList.remove('active');
    if(which==='inv') tInv.classList.add('active');
    if(which==='party') tP.classList.add('active');
    if(which==='quests') tQ.classList.add('active');
  } else {
    console.error("showTab failed. Adventure Kit?");
  }
}

function updateTabsLayout(){
  const wide = window.innerWidth >= TAB_BREAKPOINT;
  const tabs = document.querySelector('.tabs');
  const inv=document.getElementById('inv'), partyEl=document.getElementById('party'), q=document.getElementById('quests');
  if(wide){
    if(tabs) tabs.style.display='none';
    if (inv) {
      inv.style.display='grid';
      partyEl.style.display='grid';
      q.style.display='grid';
    }
  } else {
    if(tabs) tabs.style.display='flex';
    showTab(activeTab);
  }
}
window.addEventListener('resize', updateTabsLayout);
updateTabsLayout();

if (document.getElementById('tabInv')) {
  document.getElementById('tabInv').onclick=()=>showTab('inv');
  document.getElementById('tabParty').onclick=()=>showTab('party');
  document.getElementById('tabQuests').onclick=()=>showTab('quests');
} else {
  console.error("showTab setup failed. Adventure Kit?");
}
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
    row.onclick=e=>{ if(e.target.tagName==='BUTTON') return; if(it.slot) equipItem(selectedMember, idx); };
    inv.appendChild(row);
  });
}
function renderQuests(){
  const q=document.getElementById('quests');
  q.innerHTML='';
  const shown=Object.values(quests).filter(v=> v.status!=='available');
  if(shown.length===0){
    q.innerHTML='<div class="q muted">(no quests)</div>';
    return;
  }
  shown.forEach(v=>{
    const div=document.createElement('div');
    div.className='q';
    div.innerHTML=`<div><b>${v.title}</b></div><div class="small">${v.desc}</div><div class="status">${v.status}</div>`;
    q.appendChild(div);
  });
}
function renderParty(){
  const p=document.getElementById('party');
  p.innerHTML='';
  if(party.length===0){
    p.innerHTML='<div class="pcard muted">(no party members yet)</div>';
    return;
  }
  party.forEach((m,i)=>{
    const c=document.createElement('div');
    c.className='pcard'+(i===selectedMember?' selected':'');
    const bonus=m._bonus||{};
    const fmt=v=> (v>0? '+'+v : v);
    const wLabel=m.equip.weapon?(m.equip.weapon.cursed&&m.equip.weapon.cursedKnown?m.equip.weapon.name+' (cursed)':m.equip.weapon.name):'—';
    const aLabel=m.equip.armor?(m.equip.armor.cursed&&m.equip.armor.cursedKnown?m.equip.armor.name+' (cursed)':m.equip.armor.name):'—';
    const tLabel=m.equip.trinket?(m.equip.trinket.cursed&&m.equip.trinket.cursedKnown?m.equip.trinket.name+' (cursed)':m.equip.trinket.name):'—';
    const nextXP=xpToNext(m.lvl);
    const pct=Math.min(100,(m.xp/nextXP)*100);
    c.innerHTML = `<div class='row'><b>${m.name}</b> — ${m.role} (Lv ${m.lvl})</div>
<div class='row small'>${statLine(m.stats)}</div>
<div class='row'>HP ${m.hp}/${m.maxHp}  AP ${m.ap}  ATK ${fmt(bonus.ATK||0)}  DEF ${fmt(bonus.DEF||0)}  LCK ${fmt(bonus.LCK||0)}</div>
<div class='row'><div class='xpbar' data-xp='${m.xp}/${nextXP}'><div class='fill' style='width:${pct}%'></div></div></div>
<div class='row small'>WPN: ${wLabel}${m.equip.weapon?` <button class="btn" data-a="unequip" data-slot="weapon">Unequip</button>`:''}  ARM: ${aLabel}${m.equip.armor?` <button class="btn" data-a="unequip" data-slot="armor">Unequip</button>`:''}  TRK: ${tLabel}${m.equip.trinket?` <button class="btn" data-a="unequip" data-slot="trinket">Unequip</button>`:''}</div>
<div class='row'><label><input type='radio' name='selMember' ${i===selectedMember?'checked':''}> Selected</label></div>`;
    c.querySelector('input').onchange=()=>{ selectedMember=i; };
    c.querySelectorAll('button[data-a="unequip"]').forEach(b=>{
      const sl=b.dataset.slot;
      b.onclick=()=> unequipItem(i,sl);
    });
    p.appendChild(c);
  });
}

const engineExports = { log, updateHUD, renderInv, renderQuests, renderParty, footstepBump, pickupSparkle };
Object.assign(globalThis, engineExports);

// ===== Minimal Unit Tests (#test) =====
function assert(name, cond){ const msg = (cond? '✅ ':'❌ ') + name; log(msg); if(!cond) console.error('Test failed:', name); }
function runTests(){
  openCreator(); assert('Creator visible', creator.style.display==='flex');
  step=2; renderStep(); assert('Stat + buttons exist', ccRight.querySelectorAll('button[data-d="1"]').length>0);

  genWorld(); const hutsOK = buildings.length>0 && buildings.every(b=> b.interiorId && interiors[b.interiorId] && interiors[b.interiorId].grid); assert('Huts have interiors', hutsOK);

  if(typeof moduleTests === 'function') moduleTests(assert);
}

// ===== Input =====
if (document.getElementById('saveBtn')) {
  document.getElementById('saveBtn').onclick=()=>save();
  document.getElementById('loadBtn').onclick=()=>{ load(); };
  document.getElementById('resetBtn').onclick=()=>resetAll();
  const nanoBtn=document.getElementById('nanoToggle');
  if(nanoBtn){
    const updateNano=()=>{ nanoBtn.textContent = `Nano Dialog: ${window.NanoDialog?.enabled ? 'On' : 'Off'}`; };
    nanoBtn.onclick=()=>{
      if(window.NanoDialog){
        NanoDialog.enabled=!NanoDialog.enabled;
        if (typeof toast === 'function') toast(`Dynamic dialog ${NanoDialog.enabled ? 'enabled' : 'disabled'}`);
        if (NanoDialog.refreshIndicator) NanoDialog.refreshIndicator();
      }
      updateNano();
    };
    updateNano();
  }
  const audioBtn=document.getElementById('audioToggle');
  if(audioBtn) audioBtn.onclick=()=>toggleAudio();
  const mobileBtn=document.getElementById('mobileToggle');
  if(mobileBtn) mobileBtn.onclick=()=>toggleMobileControls();
  setAudio(audioEnabled);
  setMobileControls(mobileControlsEnabled);
  const settingsBtn=document.getElementById('settingsBtn');
  const settings=document.getElementById('settings');
  if(settingsBtn && settings){
    settingsBtn.onclick=()=>{ settings.style.display='flex'; };
    const closeBtn=document.getElementById('settingsClose');
    if(closeBtn) closeBtn.onclick=()=>{ settings.style.display='none'; };
  }
  const panelToggle=document.getElementById('panelToggle');
  const panel=document.querySelector('.panel');
  if(panelToggle && panel){
    panelToggle.onclick=()=>{
      const open=panel.classList.toggle('show');
      panelToggle.textContent=open?'×':'☰';
    };
  }

  window.addEventListener('keydown',(e)=>{
    if(overlay?.classList.contains('shown')){
      if(e.key==='Escape') closeDialog();
      else if(handleDialogKey?.(e)) e.preventDefault();
      return;
    }
    const combat = document.getElementById('combatOverlay');
    if(combat?.classList?.contains('shown')){
      if(handleCombatKey?.(e)) e.preventDefault();
      return;
    }
    switch(e.key){
      case 'ArrowUp': case 'w': case 'W': move(0,-1); break;
      case 'ArrowDown': case 's': case 'S': move(0,1); break;
      case 'ArrowLeft': case 'a': case 'A': move(-1,0); break;
      case 'ArrowRight': case 'd': case 'D': move(1,0); break;
      case 'e': case 'E': case ' ': interact(); break;
      case 't': case 'T': case 'g': case 'G': takeNearestItem(); break;
      case 'o': case 'O': toggleAudio(); break;
      case 'c': case 'C': toggleMobileControls(); break;
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
              && Math.abs(n.x - party.x) + Math.abs(n.y - party.y) < 10);
            near.forEach(n => NanoDialog.queueForNPC(n, 'start', 'leader change'));
          }
        }
        break;
      case 'm': case 'M': showMini=!showMini; break;
    }
  });

} else {
  console.error("No save/load btns. Adventure Kit?");
  NanoDialog.enabled = false;
}

disp.addEventListener('click',e=>{
  const rect=disp.getBoundingClientRect();
  const x=Math.floor((e.clientX-rect.left)/TS)+camX;
  const y=Math.floor((e.clientY-rect.top)/TS)+camY;
  interactAt(x,y);
});
disp.addEventListener('touchstart',e=>{
  const t=e.touches[0];
  const rect=disp.getBoundingClientRect();
  const x=Math.floor((t.clientX-rect.left)/TS)+camX;
  const y=Math.floor((t.clientY-rect.top)/TS)+camY;
  interactAt(x,y);
  e.preventDefault();
});

// ===== Boot =====
if (typeof bootMap === 'function') bootMap(); // ensure a grid exists before first frame
requestAnimationFrame(draw);
log('v0.6.7 — Stable boot; items/NPCs visible; E/T to take; selected member rolls.');
if (window.NanoDialog) NanoDialog.init();

{ // skip normal boot flow in ACK player mode
  const params = new URLSearchParams(location.search);
  const isAck = params.get('ack-player') === '1';
  if (location.hash.includes('test')) {
    runTests();
  } else if (!isAck) {
    const saveStr = globalThis.localStorage?.getItem('dustland_crt');
    if (saveStr) {
      showStart();
    } else {
      openCreator();
    }
  }
}

