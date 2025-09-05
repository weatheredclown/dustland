
// ===== Rendering & Utilities =====

// Logging

const ENGINE_VERSION = '0.60.0';

const logEl = document.getElementById('log');
const hpEl = document.getElementById('hp');
const apEl = document.getElementById('ap');
const scrEl = document.getElementById('scrap');
const hpBar = document.getElementById('hpBar');
const hpFill = document.getElementById('hpFill');
const hpGhost = document.getElementById('hpGhost');
const adrBar = document.getElementById('adrBar');
const adrFill = document.getElementById('adrFill');
const statusIcons = document.getElementById('statusIcons');
const weatherBanner = document.getElementById('weatherBanner');

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
let mobileWrap = null, mobilePad = null, mobileAB = null, mobileButtons = {};
let panelToggle = null, panel = null;
function closePanel(){
  if(panel && panelToggle){
    panel.classList.remove('show');
    panelToggle.textContent='☰';
    globalThis.localStorage?.setItem('panel_open','0');
  }
}
function setMobileControls(on){
  mobileControlsEnabled = on;
  const btn=document.getElementById('mobileToggle');
  if(btn) btn.textContent = `Mobile Controls: ${on ? 'On' : 'Off'}`;
  document.body.classList.toggle('mobile-on', on);
  if(on){
    if(!mobileWrap){
      mobileButtons = {};
      mobileWrap=document.createElement('div');
      mobileWrap.id='mobileControls';
      mobileWrap.style.cssText='position:fixed;left:0;right:0;bottom:0;height:180px;display:flex;justify-content:space-between;padding:20px;z-index:1000;touch-action:manipulation;';
      document.body.appendChild(mobileWrap);
      const mk=(name,t,fn)=>{
        const b=document.createElement('button');
        b.textContent=t;
        b.style.cssText='width:48px;height:48px;border:2px solid #0f0;border-radius:8px;background:#000;color:#0f0;font-size:20px;user-select:none;outline:none;touch-action:manipulation;';
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
        mobileButtons[name]=b;
        return b;
      };
      const mobileMove=(dx,dy,key)=>{
        if(overlay?.classList?.contains('shown')){
          handleDialogKey?.({ key });
        }else if(document.getElementById('combatOverlay')?.classList?.contains('shown')){
          handleCombatKey?.({ key });
        }else{
          move(dx,dy);
        }
      };
      mobilePad=document.createElement('div');
      mobilePad.style.cssText='display:grid;grid-template-columns:repeat(3,48px);grid-template-rows:repeat(3,48px);gap:6px;user-select:none;';
      const cells=[
        document.createElement('div'),
        mk('up','↑',()=>mobileMove(0,-1,'ArrowUp')),
        document.createElement('div'),
        mk('left','←',()=>mobileMove(-1,0,'ArrowLeft')),
        document.createElement('div'),
        mk('right','→',()=>mobileMove(1,0,'ArrowRight')),
        document.createElement('div'),
        mk('down','↓',()=>mobileMove(0,1,'ArrowDown')),
        document.createElement('div')
      ];
      cells.forEach(c=>mobilePad.appendChild(c));
      mobileWrap.appendChild(mobilePad);
      mobileAB=document.createElement('div');
      mobileAB.style.cssText='display:flex;gap:10px;user-select:none;';
      mobileAB.appendChild(mk('A','A',()=>{
        if(overlay?.classList?.contains('shown')){
          handleDialogKey?.({ key:'Enter' });
        } else if(document.getElementById('combatOverlay')?.classList?.contains('shown')){
          handleCombatKey?.({ key:'Enter' });
        } else {
          interact();
        }
      }));
      mobileAB.appendChild(mk('B','B',()=>{
        const shop = document.getElementById('shopOverlay');
        if(overlay?.classList?.contains('shown')){
          closeDialog?.();
        } else if(document.getElementById('combatOverlay')?.classList?.contains('shown')){
          handleCombatKey?.({ key:'Escape' });
        } else if(shop?.classList?.contains('shown')){
          shop.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape' }));
        } else {
          if(panel?.classList?.contains('show')){
            closePanel();
          } else {
            window.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape' }));
          }
        }
      }));
      mobileWrap.appendChild(mobileAB);
    }
  } else {
    if(mobileWrap){ mobileWrap.remove(); mobileWrap=null; }
    mobilePad=null; mobileAB=null; mobileButtons={};
  }
  return mobileButtons;
}
function toggleMobileControls(){ setMobileControls(!mobileControlsEnabled); }
let tileCharsEnabled = true;
function setTileChars(on){
  tileCharsEnabled = on;
  const btn=document.getElementById('tileCharToggle');
  if(btn) btn.textContent = `ASCII Tiles: ${on ? 'On' : 'Off'}`;
}
function toggleTileChars(){ setTileChars(!tileCharsEnabled); }
globalThis.toggleTileChars = toggleTileChars;
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
function sfxCrunch(){
  if(!audioEnabled || typeof audioCtx?.createOscillator!=='function') return;
  const o=audioCtx.createOscillator();
  const g=audioCtx.createGain();
  o.type='square';
  o.frequency.setValueAtTime(200,audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(40,audioCtx.currentTime+0.2);
  o.connect(g); g.connect(audioCtx.destination);
  g.gain.value=0.3;
  o.start();
  g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.2);
  o.stop(audioCtx.currentTime+0.2);
}
const sfxSpriteData = [
  { id:'step', start:0.00, dur:0.05 },
  { id:'pickup', start:0.05, dur:0.08 },
  { id:'confirm', start:0.13, dur:0.08 },
  { id:'denied', start:0.21, dur:0.08 }
];
const sfxSpriteSrc = 'data:audio/wav;base64,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';
const sfxBase = new Audio(sfxSpriteSrc);
const sfxPool = Array.from({ length: 5 }, () => sfxBase.cloneNode());
const sfxTimers = new Array(sfxPool.length).fill(0);
let sfxIndex = 0;
function playSfx(id){
  const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  if(!audioEnabled) return;
  if(id==='tick') return sfxTick();
  if(id==='damage') return sfxCrunch();
  const meta=sfxSpriteData.find(s=>s.id===id);
  if(!meta) return;
  const slot=sfxIndex++%sfxPool.length;
  const a=sfxPool[slot];
  clearTimeout(sfxTimers[slot]);
  a.pause();
  a.volume=0.2;
  a.currentTime=meta.start;
  // Ignore playback aborts from rapid movement to avoid console noise
  a.play().catch(()=>{});
  sfxTimers[slot]=setTimeout(()=>a.pause(), meta.dur*1000);
  if(globalThis.perfStats) globalThis.perfStats.sfx += ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
}
EventBus.on('sfx', playSfx);
EventBus.on('weather:change', w => {
  if(!weatherBanner) return;
  const txt = (w.icon ? w.icon + ' ' : '') + (w.desc || w.state);
  weatherBanner.textContent = txt;
  weatherBanner.hidden = false;
});
EventBus.on('persona:equip', () => { renderParty(); updateHUD?.(); });
EventBus.on('persona:unequip', () => { renderParty(); updateHUD?.(); });
if(weatherBanner && globalThis.Dustland?.weather){
  const w = globalThis.Dustland.weather.getWeather();
  weatherBanner.textContent = (w.icon ? w.icon + ' ' : '') + (w.desc || w.state);
  weatherBanner.hidden = false;
}
const fxOverlay = document.createElement('div');
fxOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;opacity:0;transition:opacity .2s;z-index:200;';
document.body.appendChild(fxOverlay);
function playFX(type){
  if(audioEnabled && typeof audioCtx?.createOscillator==='function'){
    const o=audioCtx.createOscillator();
    const g=audioCtx.createGain();
    o.type='triangle';
    o.frequency.value= type==='adrenaline'?600: type==='special'?900:300;
    o.connect(g); g.connect(audioCtx.destination);
    g.gain.value=0.2;
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.3);
    o.stop(audioCtx.currentTime+0.3);
  }
  const color = type==='adrenaline'? 'rgba(255,0,0,0.3)': type==='special'? 'rgba(0,255,255,0.3)': 'rgba(255,255,0,0.3)';
  fxOverlay.style.background=color;
  fxOverlay.style.opacity='1';
  clearTimeout(playFX._t);
  playFX._t=setTimeout(()=>{ fxOverlay.style.opacity='0'; },200);
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
const colors = {0:'#1e271d',1:'#313831',2:'#1573ff',3:'#203320',4:'#777777',5:'#304326',6:'#4d5f4d',7:'#233223',8:'#8bd98d',9:'#000000'};
// Alternate floor colors used in office interiors for subtle variation
const officeFloorColors = ['#233223','#243424','#222a22'];
const officeMaps = new Set(['floor1','floor2','floor3']);

const tileChars = {0:'.',1:'^',2:'~',3:',',4:'=',5:'%',6:'#',7:'.',8:'+',9:'B'};
const tileCharColors = {
  0: lightenColor('#1e271d', 0.2),
  1: lightenColor('#313831', 0.2),
  2: lightenColor('#1573ff', 0.2),
  3: lightenColor('#203320', 0.2),
  4: lightenColor('#777777', 0.2),
  5: lightenColor('#304326', 0.2),
  6: lightenColor('#4d5f4d', 0.2),
  7: lightenColor('#233223', 0.2),
  8: lightenColor('#8bd98d', 0.2),
  9: lightenColor('#000000', 0.2)
};
function jitterColor(hex, x, y) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const hash = (x * 73856093 ^ y * 19349663) & 255;
  const factor = 0.9 + (hash / 255) * 0.2;
  const adj = v => Math.max(0, Math.min(255, Math.floor(v * factor)));
  return `rgb(${adj(r)},${adj(g)},${adj(b)})`;
}
function lightenColor(hex, amt = 0.2) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * amt));
  const lg = Math.min(255, Math.round(g + (255 - g) * amt));
  const lb = Math.min(255, Math.round(b + (255 - b) * amt));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}
globalThis.tileChars = tileChars;
globalThis.jitterColor = jitterColor;

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
const soundSources = [];
let lastChimeTime = 0;

function playWindChime(x, y) {
  if (!audioEnabled || Date.now() - lastChimeTime < 500) return;
  lastChimeTime = Date.now();
  const dx = party.x - x;
  const dy = party.y - y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 10) return;

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = 1200 + Math.random() * 200;
  o.connect(g);
  g.connect(audioCtx.destination);
  g.gain.value = (1 - dist / 10) * 0.2;
  o.start();
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  o.stop(audioCtx.currentTime + 0.5);
}

function footstepBump(){
  bumpX = (Math.random()-0.5)*2;
  bumpY = (Math.random()-0.5)*2;
  bumpEnd = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) + 50;
}

function pickupSparkle(x,y){
  sparkles.push({x,y});
}

function draw(t){
  if (disp.width < 16) {
    return;
  }
  pulseAdrenaline(t);
  const dt=(t-_lastTime)||0; _lastTime=t;
  render(state, dt/1000);
  const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const bx = bumpEnd > now ? bumpX : 0;
  const by = bumpEnd > now ? bumpY : 0;
  const fx = globalThis.fxConfig || {};
  if(fx.enabled === false){
    dctx.globalAlpha = 1;
    dctx.drawImage(scene, bx, by);
  }else{
    dctx.globalAlpha = fx.prevAlpha;
    dctx.drawImage(prev, (fx.offsetX || 0) + bx, (fx.offsetY || 0) + by);
    dctx.globalAlpha = fx.sceneAlpha;
    dctx.drawImage(scene, bx, by);
  }
  pctx.clearRect(0,0,prev.width,prev.height); pctx.drawImage(scene,0,0);

  for (const source of soundSources) {
    if (source.map === state.map) {
      playWindChime(source.x, source.y);
    }
  }

  requestAnimationFrame(draw);
}

// ===== Camera =====
function centerCamera(x,y,map){
  let W,H;
  if(map==='world'){ W=WORLD_W; H=WORLD_H; }
  else if(interiors[map]){ const I=interiors[map]; W=(I&&I.w)||VIEW_W; H=(I&&I.h)||VIEW_H; }
  else { W=VIEW_W; H=VIEW_H; }
  const { w:vW, h:vH } = getViewSize();
  camX = clamp(x - Math.floor(vW/2), 0, Math.max(0, (W||vW) - vW));
  camY = clamp(y - Math.floor(vH/2), 0, Math.max(0, (H||vH) - vH));
}

// ===== Drawing Pipeline =====
const renderOrder = ['tiles', 'items', 'entitiesBelow', 'player', 'entitiesAbove'];

function render(gameState=state, dt){
  const ctx = sctx;
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,disp.width,disp.height);

  const activeMap = gameState.map || mapIdForState();
  const { W, H } = mapWH(activeMap);
  const { w:vW, h:vH } = getViewSize();
  const offX = Math.max(0, Math.floor((vW - W) / 2));
  const offY = Math.max(0, Math.floor((vH - H) / 2));

  const items = gameState.itemDrops || itemDrops;
  const entities = gameState.entities || (typeof NPCS !== 'undefined' ? NPCS : []);
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
          ctx.fillStyle = jitterColor(col, gx, gy);
          ctx.fillRect(vx*TS,vy*TS,TS,TS);
          if(tileCharsEnabled){
            const ch = tileChars[t];
            if(ch){
              ctx.fillStyle = tileCharColors[t];
              ctx.fillText(ch, vx*TS+4, vy*TS+12);
            }
          }
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
        if(it.x>=camX&&it.y>=camY&&it.x<camX+vW&&it.y<camY+vH){
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
  ctx.strokeRect(0.5,0.5,vW*TS-1,vH*TS-1);
}

function drawEntities(ctx, list, offX, offY){
  const { w:vW, h:vH } = getViewSize();
  for(const n of list){
    if(n.x>=camX&&n.y>=camY&&n.x<camX+vW&&n.y<camY+vH){
      const vx=(n.x-camX+offX)*TS, vy=(n.y-camY+offY)*TS;
      ctx.fillStyle=n.color; ctx.fillRect(vx,vy,TS,TS);
      ctx.fillStyle='#000'; ctx.fillText(n.symbol || '!',vx+5,vy+12);
    }
  }
}

Object.assign(window, { renderOrderSystem: { order: renderOrder, render } });

// ===== HUD & Tabs =====
const TAB_BREAKPOINT = 1600;
let activeTab = 'inv';

function updateHUD(){
  const prevHp = updateHUD._lastHpVal ?? player.hp;
  hpEl.textContent = player.hp;
  apEl.textContent = player.ap;
  if(scrEl) scrEl.textContent = player.scrap;
  const lead = typeof leader === 'function' ? leader() : null;
  const fx = globalThis.fxConfig;
  if(hpBar){
    if(player.hp < prevHp && fx?.damageFlash !== false){
      EventBus.emit('sfx','damage');
      hpBar.classList.add('hurt');
      clearTimeout(updateHUD._hurtTimer);
      updateHUD._hurtTimer = setTimeout(()=>hpBar.classList.remove('hurt'), 300);
    }else if(fx?.damageFlash === false){
      hpBar.classList.remove('hurt');
    }
  }
  if(hpFill && hpBar && lead){
    const pct = Math.max(0, Math.min(100, (player.hp / (lead.maxHp || 1)) * 100));
    hpFill.style.width = pct + '%';
    hpBar.setAttribute('aria-valuenow', player.hp);
    hpBar.setAttribute('aria-valuemax', lead.maxHp || 1);
    hpBar.setAttribute('aria-valuemin', 0);
    if(hpGhost){
      hpGhost.style.width = (updateHUD._lastHpPct ?? pct) + '%';
      requestAnimationFrame(()=>{ hpGhost.style.width = pct + '%'; });
    }
    updateHUD._lastHpPct = pct;
    if(lead){
      const crit = player.hp > 0 && player.hp <= (lead.maxHp || 1) * 0.25;
      document.body.classList.toggle('hp-critical', crit);
      document.body.classList.toggle('hp-out', player.hp <= 0);
    }
  }
  if(adrFill && adrBar && lead){
    const apct = Math.max(0, Math.min(100, (lead.adr / (lead.maxAdr || 1)) * 100));
    adrFill.style.width = apct + '%';
    adrBar.setAttribute('aria-valuenow', lead.adr);
    adrBar.setAttribute('aria-valuemax', lead.maxAdr || 1);
    adrBar.setAttribute('aria-valuemin', 0);
  }
  if(disp && fx){
    const filters = [];
    if(fx.grayscale) filters.push('grayscale(1)');
    if(fx.adrenalineTint && lead){
      const ratio = Math.max(0, Math.min(1, lead.adr / (lead.maxAdr || 1)));
      if(ratio > 0){
        const sat = 1 + ratio * 1.5;
        const hue = ratio * 90;
        filters.push(`saturate(${sat}) hue-rotate(${hue}deg)`);
      }
    }
    const fstr = filters.join(' ');
    if(fstr){
      disp.style.setProperty('--fxFilter', fstr);
    }else{
      disp.style.removeProperty('--fxFilter');
    }
  }
  if(statusIcons){
    statusIcons.innerHTML='';
    if(typeof buffs !== 'undefined' && lead){
      for(const b of buffs){
        if(b.target===lead){
          const s=document.createElement('span');
          statusIcons.appendChild(s);
        }
      }
    }
  }
  updateHUD._lastHpVal = player.hp;
}

function pulseAdrenaline(t){
  if(!disp || typeof leader !== 'function') return;
  const lead = leader();
  const fx = globalThis.fxConfig;
  if(!lead || fx?.adrenalineTint === false) return;
  const ratio = Math.max(0, Math.min(1, lead.adr / (lead.maxAdr || 1)));
  if(ratio <= 0){
    disp.style.removeProperty('--fxBloom');
    return;
  }
  const pulse = (Math.sin(t / 200) + 1) / 2;
  const intensity = ratio * pulse;
  const blur = intensity * 4;
  disp.style.setProperty('--fxBloom', `brightness(${1 + intensity}) blur(${blur}px)`);
}

function showTab(which){
  activeTab = which;
  if(window.innerWidth >= TAB_BREAKPOINT) return;
  const inv=document.getElementById('inv'), partyEl=document.getElementById('party'), q=document.getElementById('quests');
  const tInv=document.getElementById('tabInv'), tP=document.getElementById('tabParty'), tQ=document.getElementById('tabQuests');
  if (!inv) return;
  inv.style.display=(which==='inv'?'grid':'none');
  partyEl.style.display=(which==='party'?'grid':'none');
  q.style.display=(which==='quests'?'grid':'none');
  for(const el of [tInv,tP,tQ]){
    el.classList.remove('active');
    if(el.setAttribute) el.setAttribute('aria-selected','false');
  }
  if(which==='inv'){ tInv.classList.add('active'); if(tInv.setAttribute) tInv.setAttribute('aria-selected','true'); }
  if(which==='party'){ tP.classList.add('active'); if(tP.setAttribute) tP.setAttribute('aria-selected','true'); }
  if(which==='quests'){ tQ.classList.add('active'); if(tQ.setAttribute) tQ.setAttribute('aria-selected','true'); }
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
  const keyHandler = which => e => {
    if(e.key==='Enter' || e.key===' '){ e.preventDefault(); showTab(which); }
  };
  const tabInv=document.getElementById('tabInv');
  const tabParty=document.getElementById('tabParty');
  const tabQuests=document.getElementById('tabQuests');
  tabInv.onclick=()=>showTab('inv');
  tabParty.onclick=()=>showTab('party');
  tabQuests.onclick=()=>showTab('quests');
  tabInv.onkeydown=keyHandler('inv');
  tabParty.onkeydown=keyHandler('party');
  tabQuests.onkeydown=keyHandler('quests');
}
// ===== Renderers =====
function calcItemValue(it){
  if(!it) return 0;
  let score=it.value??0;
  for(const v of Object.values(it.mods||{})){
    score+=v;
  }
  return score;
}
function renderInv(){
  const inv=document.getElementById('inv');
  inv.innerHTML='';
  if(player.inv.length===0){
    inv.innerHTML='<div class="slot muted">(empty)</div>';
    return;
  }
  const caches = {};
  const others = [];
  player.inv.forEach(it => {
    if(it.type === 'spoils-cache'){
      (caches[it.rank] ||= []).push(it);
    } else {
      others.push(it);
    }
  });
  const member=party[selectedMember]||party[0];
  const suggestions = {};
  if(member){
    for(const slot of ['weapon','armor','trinket']){
      const eq=member.equip[slot];
      const candidates = others.filter(it => it.type===slot && (!eq || calcItemValue(it)>calcItemValue(eq)));
      if(candidates.length){
        const max=Math.max(...candidates.map(it=>calcItemValue(it)));
        const best=candidates.filter(it=>calcItemValue(it)===max);
        suggestions[slot]=best[Math.floor(Math.random()*best.length)];
      }
    }
  }
  Object.entries(caches).forEach(([rank, items]) => {
    const row=document.createElement('div');
    row.className='slot cache-slot';
    const icon = SpoilsCache.renderIcon(rank, () => {
      SpoilsCache.open(rank);
    });
    if(icon){
      const wrap=document.createElement('div');
      wrap.style.display='flex';
      wrap.style.alignItems='center';
      wrap.style.gap='6px';
      wrap.appendChild(icon);
      const count=document.createElement('span');
      count.className='cache-count';
      count.textContent='x'+items.length;
      wrap.appendChild(count);
      row.appendChild(wrap);
    }
    if(items.length>1){
      const btn=document.createElement('button');
      btn.className='btn jitter';
      btn.textContent='Open All';
      btn.onclick=()=>{ SpoilsCache.openAll(rank); };
      row.appendChild(btn);
    }
    inv.appendChild(row);
  });
  others.forEach(it => {
    const row=document.createElement('div');
    row.className='slot';
    if(['weapon','armor','trinket'].includes(it.type) && suggestions[it.type]===it){
      row.classList.add('better');
    }
    const baseLabel = it.name + (['weapon','armor','trinket'].includes(it.type)?` [${it.type}]`:'');
    const label = (it.cursed && it.cursedKnown)? `${baseLabel} (cursed)` : baseLabel;
    row.innerHTML = `<div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
        <span>${label}</span>
        <span style="display:flex;gap:6px">
          ${['weapon','armor','trinket'].includes(it.type)? `<button class="btn" data-a="equip">Equip</button>`:''}
          ${it.use?  `<button class="btn" data-a="use">Use</button>`:''}
        </span>
      </div>`;
    const mods = Object.entries(it.mods || {})
      .map(([k, v]) => `${k} ${v >= 0 ? '+' : ''}${v}`)
      .join(' ');
    const use = it.use ? `${it.use.type}${it.use.amount ? ` ${it.use.amount}` : ''}` : '';
    const valueStr = (() => {
      const v = it.value ?? 0;
      return (typeof CURRENCY !== 'undefined' && CURRENCY)
        ? `${v} ${CURRENCY}`
        : String(v);
    })();
    const nameLine = baseLabel + ((it.cursed && it.cursedKnown)? ' (cursed)' : '');
    const tip = [
      nameLine,
      it.desc || '',
      mods ? `Mods: ${mods}` : '',
      use  ? `Use: ${use}`   : '',
      `Rarity: ${it.rarity}`,
      `Value: ${valueStr}`
    ].filter(Boolean).join('\n');
    row.title = tip;
    const equipBtn = row.querySelector('button[data-a="equip"]');
    if(equipBtn) equipBtn.onclick=()=> equipItem(selectedMember, player.inv.indexOf(it));
    const useBtn = row.querySelector('button[data-a="use"]');
    if(useBtn) useBtn.onclick=()=> useItem(player.inv.indexOf(it));
    row.onclick=e=>{ if(e.target.tagName==='BUTTON') return; if(['weapon','armor','trinket'].includes(it.type)) equipItem(selectedMember, player.inv.indexOf(it)); };
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
    const progress = (v.item && v.count) ? ` (${Math.min(countItems(v.item), v.count)}/${v.count})` : '';
    div.innerHTML=`<div><b>${v.title}${progress}</b></div><div class="small">${v.desc}</div><div class="status">${v.status}</div>`;
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
  const selectMember=idx=>{
    selectedMember=idx;
    EventBus?.emit('party:selected', selectedMember);
    p.querySelectorAll('.pcard').forEach((card,j)=>{
      card.classList.toggle('selected', j===selectedMember);
    });
    if(Array.isArray(player?.inv)) renderInv?.();
  };
  const labelEquip=eq=>{
    if(!eq) return '—';
    const base=eq.name||'Unnamed';
    return (eq.cursed&&eq.cursedKnown)? base+' (cursed)':base;
  };
party.forEach((m,i)=>{
  const c=document.createElement('div');
  c.className='pcard'+(i===selectedMember?' selected':'');
  c.tabIndex=0;
  const bonus=m._bonus||{};
  const fmt=v=> (v>0? '+'+v : v);
  const wEq=m.equip.weapon, aEq=m.equip.armor, tEq=m.equip.trinket;
  const wLabel=labelEquip(wEq);
  const aLabel=labelEquip(aEq);
  const tLabel=labelEquip(tEq);
  const nextXP=xpToNext(m.lvl);
  const pct=Math.min(100,(m.xp/nextXP)*100);
  const persona = globalThis.Dustland?.gameState?.getPersona?.(m.persona);
  const label = persona ? `${m.name} (${persona.label})` : m.name;
  const portraitSrc = persona?.portrait || m.portraitSheet;
  c.innerHTML = `<div class='row'><div class='portrait'></div><div><b>${label}</b> — ${m.role} (Lv ${m.lvl})</div></div>`+
`<div class='row small'>${statLine(m.stats)}</div>`+
`<div class='row stats'>HP ${m.hp}/${m.maxHp}  ADR ${m.adr}  AP ${m.ap}  ATK ${fmt(bonus.ATK||0)}  DEF ${fmt(bonus.DEF||0)}  LCK ${fmt(bonus.LCK||0)}</div>`+
`<div class='row'><div class='xpbar' data-xp='${m.xp}/${nextXP}'><div class='fill' style='width:${pct}%'></div></div></div>`+
`<div class='row small'>
  <span class='equip-line'>WPN: ${wLabel}${wEq?` <button class="btn" data-a="unequip" data-slot="weapon">Unequip</button>`:''}</span>
  <span class='equip-line'>ARM: ${aLabel}${aEq?` <button class="btn" data-a="unequip" data-slot="armor">Unequip</button>`:''}</span>
  <span class='equip-line'>TRK: ${tLabel}${tEq?` <button class="btn" data-a="unequip" data-slot="trinket">Unequip</button>`:''}</span>
</div>`;
  const portrait=c.querySelector('.portrait');
  if (typeof setPortraitDiv === 'function') {
    const temp = { ...m, portraitSheet: portraitSrc };
    setPortraitDiv(portrait, temp);
  } else if (portraitSrc) {
    portrait.style.backgroundImage=`url(${portraitSrc})`;
    if(/_4\.[a-z]+$/i.test(portraitSrc)){
      portrait.style.backgroundSize='200% 200%';
      portrait.style.backgroundPosition='0% 0%';
    }else{
      portrait.style.backgroundSize='100% 100%';
      portrait.style.backgroundPosition='center';
    }
  }
  const existingBadge = portrait.querySelector('.spbadge');
  if(m.skillPoints>0){
    if(existingBadge){
      existingBadge.textContent = m.skillPoints;
    }else{
      const badge=document.createElement('div');
      badge.className='spbadge';
      badge.textContent=m.skillPoints;
      portrait.appendChild(badge);
    }
  }else if(existingBadge){
    existingBadge.remove();
  }
  c.onclick=()=>selectMember(i);
  c.onfocus=()=>selectMember(i);
  c.querySelectorAll('button[data-a="unequip"]').forEach(b=>{
    const sl=b.dataset.slot;
    b.onclick=()=> unequipItem(i,sl);
  });
  p.appendChild(c);
});
}

function openShop(npc) {
  const shopOverlay = document.getElementById('shopOverlay');
  const shopName = document.getElementById('shopName');
  const closeShopBtn = document.getElementById('closeShopBtn');
  const shopBuy = document.getElementById('shopBuy');
  const shopSell = document.getElementById('shopSell');
  const shopScrap = document.getElementById('shopScrap');

  if (!npc.shop) return;
  if (npc.shop === true) npc.shop = {};
  npc.shop.inv = npc.shop.inv || [];
  npc.shop.markup = npc.shop.markup || 2;

  shopName.textContent = npc.name;

  let focusables = [];
  let focusIdx = 0;
  let madePurchase = false;
  function refreshFocusables() {
    focusables = Array.from(shopOverlay.querySelectorAll('button'));
    if (focusIdx >= focusables.length) focusIdx = 0;
  }
  function focusCurrent() {
    refreshFocusables();
    if (focusables.length) focusables[focusIdx].focus();
  }
  function renderScrap() {
    if (shopScrap) shopScrap.textContent = `${player.scrap} ${CURRENCY}`;
  }
  function renderShop() {
    renderScrap();
    shopBuy.innerHTML = '';
    shopSell.innerHTML = '';

    const shopInv = npc.shop.inv || [];
    const markup = npc.vending ? 1 : npc.shop.markup || 2;

    shopInv.forEach((it, idx) => {
      const item = getItem(it.id);
      if (!item) return;
      const row = document.createElement('div');
      row.className = 'slot';
      const price = Math.ceil(item.value * markup);
      row.innerHTML = `<span>${item.name} - ${price} ${CURRENCY}</span><button class="btn">Buy</button>`;
      row.querySelector('button').onclick = () => {
        if (player.scrap >= price) {
          if (addToInv(item)) {
            player.scrap -= price;
            if (!npc.vending) {
              npc.shop.inv.splice(idx, 1);
            }
            renderShop();
            updateHUD();
            madePurchase = true;
          } else {
            log('Inventory is full.');
            if (typeof toast === 'function') toast('Inventory is full.');
          }
        } else {
          log('Not enough scrap.');
          if (typeof toast === 'function') toast('Not enough scrap.');
        }
      };
      shopBuy.appendChild(row);
    });

    player.inv.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'slot';
      const price = typeof item.scrap === 'number' ? item.scrap : Math.floor(item.value / markup);
      row.innerHTML = `<span>${item.name} - ${price} ${CURRENCY}</span><button class="btn">Sell</button>`;
      row.querySelector('button').onclick = () => {
        player.scrap += price;
        npc.shop.inv.push({ id: item.id });
        removeFromInv(idx);
        renderShop();
        updateHUD();
        madePurchase = true;
      };
      shopSell.appendChild(row);
    });
    focusCurrent();
  }

  function close() {
    shopOverlay.classList.remove('shown');
    shopOverlay.removeEventListener('keydown', handleKey);
    if (!madePurchase && npc) {
      npc.cancelCount = (npc.cancelCount || 0) + 1;
      if (npc.cancelCount >= 2) {
        npc.tree.start.text = 'Buy or move on.';
        if (typeof toast === 'function') toast(`${npc.name} eyes you warily.`);
      }
    } else if (npc) {
      npc.cancelCount = 0;
      npc.tree.start.text = 'Got goods to sell? I pay in scrap.';
    }
  }
  function handleKey(e) {
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

  renderShop();
  shopOverlay.classList.add('shown');
  shopOverlay.tabIndex = -1;
  shopOverlay.addEventListener('keydown', handleKey);
  closeShopBtn.onclick = close;
  shopOverlay.focus();
}

globalThis.Dustland = globalThis.Dustland || {};
globalThis.Dustland.openShop = openShop;

const engineExports = { log, updateHUD, renderInv, renderQuests, renderParty, footstepBump, pickupSparkle, openShop, playFX };
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
  document.getElementById('resetBtn').onclick=()=>{
    if (confirm('Reset game and return to character creation?')) resetAll();
  };
  const nanoBtn=document.getElementById('nanoToggle');
  if(nanoBtn){
    const updateNano=()=>{
      nanoBtn.textContent = `Nano Dialog: ${window.NanoDialog?.enabled ? 'On' : 'Off'}`;
      const persist=document.getElementById('persistLLM');
      if(persist){
        const ready=window.NanoDialog?.isReady?.();
        persist.style.display = window.NanoDialog?.enabled && ready ? '' : 'none';
      }
    };
    nanoBtn.onclick=()=>{
      if(window.NanoDialog){
        NanoDialog.enabled=!NanoDialog.enabled;
        if (typeof toast === 'function') toast(`Dynamic dialog ${NanoDialog.enabled ? 'enabled' : 'disabled'}`);
        if (NanoDialog.refreshIndicator) NanoDialog.refreshIndicator();
      }
      updateNano();
    };
    updateNano();
    if(window.NanoDialog?.init) NanoDialog.init().then(updateNano);
  }
  const audioBtn=document.getElementById('audioToggle');
  if(audioBtn) audioBtn.onclick=()=>toggleAudio();
  const mobileBtn=document.getElementById('mobileToggle');
  if(mobileBtn) mobileBtn.onclick=()=>toggleMobileControls();
  const tileCharBtn=document.getElementById('tileCharToggle');
  if(tileCharBtn) tileCharBtn.onclick=()=>toggleTileChars();
  const shotBtn=document.getElementById('screenshotBtn');
  if(shotBtn) shotBtn.onclick=()=>{
    const canvas=document.getElementById('game');
    if(!canvas) return;
    const url=canvas.toDataURL('image/png');
    const a=document.createElement('a');
    a.href=url;
    a.download='dustland.png';
    a.click();
  };
  setAudio(audioEnabled);
  setMobileControls(mobileControlsEnabled);
  setTileChars(tileCharsEnabled);
  const settingsBtn=document.getElementById('settingsBtn');
  const settings=document.getElementById('settings');
  if(settingsBtn && settings){
    settingsBtn.onclick=()=>{ settings.style.display='flex'; };
    const closeBtn=document.getElementById('settingsClose');
    if(closeBtn) closeBtn.onclick=()=>{ settings.style.display='none'; };
  }
  panelToggle=document.getElementById('panelToggle');
  panel=document.querySelector('.panel');
  if(panelToggle && panel){
    const open=globalThis.localStorage?.getItem('panel_open')==='1';
    if(open){
      panel.classList.add('show');
      panelToggle.textContent='×';
    }
    panelToggle.onclick=()=>{
      const openState=panel.classList.toggle('show');
      panelToggle.textContent=openState?'×':'☰';
      globalThis.localStorage?.setItem('panel_open', openState?'1':'0');
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
    const shop = document.getElementById('shopOverlay');
    if (shop?.classList?.contains('shown')) {
      if (e.key === 'Escape') document.getElementById('closeShopBtn')?.click();
      return;
    }
    if((e.key==='b' || e.key==='B') && mobileControlsEnabled && panel?.classList?.contains('show')){
      closePanel();
      e.preventDefault();
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
      case 'j': case 'J': toggleTileChars(); break;
      case 'i': case 'I': showTab('inv'); break;
      case 'p': case 'P': showTab('party'); break;
      case 'q': if(!e.ctrlKey && !e.metaKey){ showTab('quests'); e.preventDefault(); } break;
      case 'Tab':
        e.preventDefault();
        e.stopImmediatePropagation();
        if (party.length>0){
          selectedMember = (selectedMember + 1) % party.length;
          renderParty();
          toast(`Leader: ${party[selectedMember].name}`);
        }
        break;
      case 'm': case 'M': showMini=!showMini; break;
    }
  });

} else {
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

