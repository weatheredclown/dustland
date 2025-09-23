
// ===== Rendering & Utilities =====

const ENGINE_VERSION = '0.186.3';


const logEl = document.getElementById('log');
const hpEl = document.getElementById('hp');
const scrEl = document.getElementById('scrap');
const hpBar = document.getElementById('hpBar');
const hpFill = document.getElementById('hpFill');
const hpGhost = document.getElementById('hpGhost');
const hydEl = document.getElementById('hydrationMeter');
const adrBar = document.getElementById('adrBar');
const adrFill = document.getElementById('adrFill');
const statusIcons = document.getElementById('statusIcons');
const weatherBanner = document.getElementById('weatherBanner');
const musicBus = globalThis.Dustland?.eventBus || globalThis.EventBus;
let hudAdrMood = null;

function log(msg, type){
  if (logEl) {
    const p = document.createElement('div');
    p.textContent = msg;
    if (type === 'warn') p.style.color = '#fc0';
    else if (type === 'error') p.style.color = '#f33';
    logEl.prepend(p);
  } else {
    console.log("Log: " + msg);
  }
}

const origWarn = console.warn;
console.warn = function(...args) {
  origWarn.apply(console, args);
  log('⚠️ ' + args.join(' '), 'warn');
};
const origError = console.error;
console.error = function(...args) {
  origError.apply(console, args);
  log('🛑 ' + args.join(' '), 'error');
};

const multiplayerBus = globalThis.Dustland?.eventBus || globalThis.EventBus;
if (multiplayerBus?.on) {
  (function(){
    let peerSnapshot = [];
    let peerHash = '';

    function normalizePeers(list){
      if (!Array.isArray(list)) return [];
      return list.map((peer, idx) => {
        const id = peer?.id ?? `peer-${idx + 1}`;
        const status = peer?.status ?? 'open';
        const label = (typeof peer?.id === 'string' && peer.id) ? peer.id : `Player ${idx + 1}`;
        return { id, status, label };
      });
    }

    multiplayerBus.on('multiplayer:presence', info => {
      if (!info || !info.status) return;
      const fromNet = !!info.__fromNet;
      switch (info.status) {
        case 'started':
          if (info.role === 'host') {
            log(fromNet ? 'Multiplayer: Host is online.' : 'Multiplayer: Hosting session active. Share the host code to invite players.');
            if (!fromNet) {
              peerSnapshot = [];
              peerHash = '';
            }
          } else if (info.role === 'client') {
            log(fromNet ? 'Multiplayer: A player is preparing to link.' : 'Multiplayer: Preparing link to host…');
          }
          break;
        case 'linking':
          if (info.role === 'client') {
            log(fromNet ? 'Multiplayer: Player submitted an answer code.' : 'Multiplayer: Waiting for host to accept your answer.');
          }
          break;
        case 'linked':
          if (info.role === 'client') {
            log(fromNet ? 'Multiplayer: Player link confirmed.' : 'Multiplayer: Link confirmed.');
          }
          break;
        case 'peers':
          if (info.role === 'host') {
            const peers = normalizePeers(info.peers);
            const hash = JSON.stringify(peers.map(p => `${p.id}:${p.status}`));
            if (hash === peerHash) break;
            const prevById = new Map(peerSnapshot.map(p => [p.id, p]));
            const nextById = new Map(peers.map(p => [p.id, p]));
            peers.forEach(peer => {
              if (!prevById.has(peer.id)) log(`Multiplayer: ${peer.label} linked.`);
            });
            peerSnapshot.forEach(peer => {
              if (!nextById.has(peer.id)) log(`Multiplayer: ${peer.label} disconnected.`);
            });
            const remoteCount = peers.length;
            const total = remoteCount + 1;
            const label = total === 1 ? 'player' : 'players';
            log(`Multiplayer: ${total} ${label} in session (host + ${remoteCount}).`);
            peerSnapshot = peers;
            peerHash = hash;
          }
          break;
        case 'closed':
          if (info.role === 'host') {
            log(fromNet ? 'Multiplayer: Host disconnected.' : 'Multiplayer: Hosting stopped.');
            peerSnapshot = [];
            peerHash = '';
          } else if (info.role === 'client') {
            log(fromNet ? 'Multiplayer: Player connection closed.' : 'Multiplayer: Disconnected from host.');
          } else {
            log('Multiplayer: Connection closed.');
          }
          break;
        case 'error': {
          const reason = info.reason ?? info.message;
          let detail = 'Unknown error';
          if (reason !== undefined) {
            if (typeof reason === 'string') detail = reason;
            else {
              try {
                detail = JSON.stringify(reason);
              } catch (err) {
                detail = String(reason);
              }
            }
          }
          log(`Multiplayer error: ${detail}`);
          break;
        }
      }
    });
  })();
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
      const tryCreatorNav = (btnId) => {
        const creatorEl=document.getElementById('creator');
        if(creatorEl?.style?.display==='flex'){
          const btn=document.getElementById(btnId);
          if(btn && !btn.disabled){
            if(typeof btn.click==='function') btn.click(); else btn.onclick?.();
          }
          return true;
        }
        return false;
      };
      const mk=(name,t,fn)=>{
        const b=document.createElement('button');
        b.textContent=t;
        b.style.cssText='width:48px;height:48px;border:2px solid #0f0;border-radius:8px;background:#000;color:#0f0;font-size:1.25rem;user-select:none;outline:none;touch-action:manipulation;';
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
        if(tryCreatorNav('ccNext')){
          return;
        }
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
        if(tryCreatorNav('ccBack')){
          return;
        }
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
  updateCanvasStretch();
  return mobileButtons;
}
function toggleMobileControls(){ setMobileControls(!mobileControlsEnabled); }
const PLAYER_ICON_STORAGE_KEY = 'playerIconIndex';
const playerIcons = [
  { id:'saber-vanguard', label:'Saber Vanguard', path:'assets/player-icons/player-icon-01.svg' },
  { id:'aegis-sentinel', label:'Aegis Sentinel', path:'assets/player-icons/player-icon-02.svg' },
  { id:'iron-marauder', label:'Iron Marauder', path:'assets/player-icons/player-icon-03.svg' },
  { id:'cobalt-mystic', label:'Cobalt Mystic', path:'assets/player-icons/player-icon-04.svg' },
  { id:'verdant-scout', label:'Verdant Scout', path:'assets/player-icons/player-icon-05.svg' },
  { id:'circuit-mechanist', label:'Circuit Mechanist', path:'assets/player-icons/player-icon-06.svg' },
  { id:'gilded-gunslinger', label:'Gilded Gunslinger', path:'assets/player-icons/player-icon-07.svg' },
  { id:'dust-nomad', label:'Dust Nomad', path:'assets/player-icons/player-icon-08.svg' },
  { id:'veil-oracle', label:'Veil Oracle', path:'assets/player-icons/player-icon-09.svg' },
  { id:'nightshade', label:'Nightshade', path:'assets/player-icons/player-icon-10.svg' },
  { id:'glyph-weaver', label:'Glyph Weaver', path:'assets/player-icons/player-icon-11.svg' },
  { id:'trailblazer', label:'Trailblazer', path:'assets/player-icons/player-icon-12.svg' }
];
let playerIconIndex = 0;
let tileCharsEnabled = true;
let retroNpcArtEnabled = false;
const retroNpcArtCache = new Map();
let retroPlayerSprite = null;
let retroPlayerSpriteIndex = -1;
let retroItemSprite = null;
let retroItemCacheSprite = null;
const DEFAULT_NPC_COLOR = '#9ef7a0';
const xmlEscapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
xmlEscapeMap['"'] = '&quot;';
xmlEscapeMap["'"] = '&#39;';
function setTileChars(on){
  tileCharsEnabled = on;
  const btn=document.getElementById('tileCharToggle');
  if(btn) btn.textContent = `ASCII Tiles: ${on ? 'On' : 'Off'}`;
}
function toggleTileChars(){ setTileChars(!tileCharsEnabled); }
globalThis.toggleTileChars = toggleTileChars;
const FONT_SCALE_STORAGE_KEY = 'fontScale';
const FONT_SCALE_MIN = 1;
const FONT_SCALE_MAX = 1.75;
const FONT_SCALE_DEFAULT = 1;
let fontScale = FONT_SCALE_DEFAULT;
function clampFontScale(value){
  const num = Number.parseFloat(value);
  if(!Number.isFinite(num)) return fontScale;
  const snapped = Math.round(num * 100) / 100;
  if(snapped < FONT_SCALE_MIN) return FONT_SCALE_MIN;
  if(snapped > FONT_SCALE_MAX) return FONT_SCALE_MAX;
  return snapped;
}
function formatFontScale(value){
  const str = value.toFixed(2);
  return str.replace(/(\.\d*?)0+$/, '$1').replace(/\.0$/, '').replace(/\.$/, '');
}
function getFontScaleRootStyle(){
  if(typeof document === 'undefined') return null;
  return document.documentElement?.style || document.body?.style || null;
}
function updateFontScaleUI(scale){
  if(typeof document === 'undefined') return;
  const slider = document.getElementById('fontScale');
  if(slider){
    slider.value = formatFontScale(scale);
  }
  const readout = document.getElementById('fontScaleValue');
  if(readout){
    readout.textContent = `${Math.round(scale * 100)}%`;
  }
}
function applyFontScale(scale){
  fontScale = scale;
  const rootStyle = getFontScaleRootStyle();
  const value = formatFontScale(scale);
  rootStyle?.setProperty('--font-scale', value);
  if(typeof document !== 'undefined'){
    const bodyStyle = document.body?.style;
    if(bodyStyle && bodyStyle !== rootStyle){
      bodyStyle.setProperty('--font-scale', value);
    }
  }
  updateFontScaleUI(scale);
}
function setFontScale(scale, opts = {}){
  const next = clampFontScale(scale);
  applyFontScale(next);
  if(!opts.skipStorage){
    globalThis.localStorage?.setItem(FONT_SCALE_STORAGE_KEY, formatFontScale(next));
  }
}
const savedFontScale = Number.parseFloat(globalThis.localStorage?.getItem(FONT_SCALE_STORAGE_KEY));
if(Number.isFinite(savedFontScale)){
  setFontScale(savedFontScale, { skipStorage: true });
} else {
  applyFontScale(fontScale);
}
function setRetroNpcArt(on, skipStorage){
  retroNpcArtEnabled = !!on;
  const cb = document.getElementById('retroNpcToggle');
  if(cb) cb.checked = retroNpcArtEnabled;
  if(typeof document !== 'undefined'){
    document.body?.classList?.toggle('retro-npc-art', retroNpcArtEnabled);
  }
  if(!skipStorage){
    globalThis.localStorage?.setItem('retroNpcArt', retroNpcArtEnabled ? '1' : '0');
  }
  retroPlayerSprite = null;
  retroPlayerSpriteIndex = -1;
  retroItemSprite = null;
  retroItemCacheSprite = null;
  if(!retroNpcArtEnabled){
    retroNpcArtCache.clear();
  }
}

function clampPlayerIconIndex(idx){
  if(!playerIcons.length) return 0;
  const total = playerIcons.length;
  const raw = Number.isFinite(idx) ? Math.trunc(idx) : 0;
  let next = raw % total;
  if(next < 0) next += total;
  return next;
}

function updatePlayerIconPreview(){
  if(!playerIcons.length) return;
  playerIconIndex = clampPlayerIconIndex(playerIconIndex);
  const meta = playerIcons[playerIconIndex];
  const preview = document.getElementById('playerIconPreview');
  const nameEl = document.getElementById('playerIconName');
  if(nameEl && meta){
    nameEl.textContent = meta.label;
  }
  if(preview && meta){
    if(typeof preview.setAttribute === 'function') preview.setAttribute('data-icon-id', meta.id);
    else if(preview.dataset) preview.dataset.iconId = meta.id;
    if(typeof preview.setAttribute === 'function') preview.setAttribute('aria-label', meta.label);
    preview.title = meta.label;
    const img = preview.querySelector('img');
    if(img){
      img.src = meta.path;
      img.alt = '';
    }
  }
}

function setPlayerIcon(idx, opts = {}){
  if(!playerIcons.length) return;
  const next = clampPlayerIconIndex(idx);
  const changed = next !== playerIconIndex;
  playerIconIndex = next;
  if(changed){
    retroPlayerSprite = null;
    retroPlayerSpriteIndex = -1;
  }
  if(!opts.skipStorage){
    globalThis.localStorage?.setItem(PLAYER_ICON_STORAGE_KEY, String(playerIconIndex));
  }
  updatePlayerIconPreview();
}

function sanitizeRetroText(value, fallback){
  const base = (value ?? '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const txt = base.slice(0, 7);
  if(txt) return txt;
  return (fallback ?? 'NPC').toString().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7) || 'NPC';
}

function normalizeColor(hex){
  if(typeof hex !== 'string') return DEFAULT_NPC_COLOR;
  let col = hex.trim();
  if(col.startsWith('#')) col = col.slice(1);
  if(col.length === 3){
    col = col.split('').map(c=>c+c).join('');
  }
  if(col.length !== 6 || /[^0-9a-f]/i.test(col)) return DEFAULT_NPC_COLOR;
  return '#' + col.toLowerCase();
}

function adjustColor(hex, pct){
  const base = normalizeColor(hex);
  const raw = base.slice(1);
  const ratio = Math.max(-1, Math.min(1, pct));
  const adjust = (channel)=>{
    if(ratio >= 0){
      return Math.round(channel + (255 - channel) * ratio);
    }
    return Math.round(channel + channel * ratio);
  };
  const r = parseInt(raw.slice(0,2),16);
  const g = parseInt(raw.slice(2,4),16);
  const b = parseInt(raw.slice(4,6),16);
  const toHex = (v)=>Math.max(0, Math.min(255, v)).toString(16).padStart(2,'0');
  return '#' + toHex(adjust(r)) + toHex(adjust(g)) + toHex(adjust(b));
}

function escapeXml(str){
  const txt = (str ?? '').toString();
  return txt.replace(/[&<>"']/g, ch => xmlEscapeMap[ch] || ch);
}

function svgToDataUrl(svg){
  try{
    if(typeof TextEncoder !== 'undefined' && typeof globalThis.btoa === 'function'){
      const bytes = new TextEncoder().encode(svg);
      let binary='';
      for(let i=0;i<bytes.length;i++) binary += String.fromCharCode(bytes[i]);
      return 'data:image/svg+xml;base64,' + globalThis.btoa(binary);
    }
  }catch(err){/* ignore encoding errors */}
  if(typeof globalThis.btoa === 'function'){
    try{ return 'data:image/svg+xml;base64,' + globalThis.btoa(svg); }
    catch(err){/* ignore and fallback */}
  }
  if(typeof Buffer !== 'undefined'){
    return 'data:image/svg+xml;base64,' + Buffer.from(svg,'utf8').toString('base64');
  }
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function getRetroNpcArchetype(n){
  const hasQuest = !!(n?.questId || (Array.isArray(n?.quests) && n.quests.length));
  if(n?.inanimate) return 'object';
  if(n?.combat?.auto) return 'automaton';
  if(n?.attackOnSight) return 'feral';
  if(n?.combat && !n?.tree) return 'warrior';
  if(n?.trainer) return 'trainer';
  if(n?.shop) return 'merchant';
  if(hasQuest) return 'quest';
  return 'wanderer';
}

const retroSilhouettes = {
  wanderer(colors, faceSymbol){
    const { base, highlight, shadow, accent, edge } = colors;
    return `<g>
      <path d="M8.5 23l3.8-9 3.7-3 3.7 3 3.8 9H8.5z" fill="${base}" stroke="${edge}" stroke-width="0.85" stroke-linejoin="round"/>
      <path d="M19.5 10.5L15 20.8l-3.5 2.2h8.6z" fill="${accent}" stroke="${edge}" stroke-width="0.75" stroke-linejoin="round"/>
      <path d="M23.5 6.5l2.2-1 0.8 1.4-0.6 17.6" fill="none" stroke="${edge}" stroke-width="1" stroke-linecap="round"/>
      <path d="M24.3 7.5l-0.6 15.5" stroke="${highlight}" stroke-width="0.9" stroke-linecap="round" opacity="0.6"/>
      <circle cx="15.8" cy="10.2" r="3.6" fill="${highlight}" stroke="${edge}" stroke-width="1"/>
      <path d="M11.3 19.8l-1.6 3.2h5.2z" fill="${shadow}" opacity="0.55"/>
      <text x="15" y="18.8" text-anchor="middle" font-family="Pixelify Sans, 'VT323', 'Courier New', monospace" font-size="6.8" fill="#050805" opacity="0.45">${faceSymbol}</text>
    </g>`;
  },
  merchant(colors, faceSymbol){
    const { base, highlight, shadow, accent, edge } = colors;
    return `<g>
      <rect x="6.5" y="12" width="8" height="11.5" rx="2" fill="${shadow}" stroke="${edge}" stroke-width="0.9"/>
      <path d="M11 16l6.5-4 5 4 1.5 7.5H9.5z" fill="${base}" stroke="${edge}" stroke-width="0.85" stroke-linejoin="round"/>
      <path d="M18 16.2l-2.4 5.5h6.8z" fill="${accent}" stroke="${edge}" stroke-width="0.75" stroke-linejoin="round"/>
      <circle cx="17" cy="10.8" r="3.4" fill="${highlight}" stroke="${edge}" stroke-width="0.95"/>
      <path d="M24 18.2l3 1.8-2 5-3.2-2.1z" fill="${highlight}" stroke="${edge}" stroke-width="0.85" stroke-linejoin="round"/>
      <circle cx="25.7" cy="20.2" r="0.9" fill="${shadow}"/>
      <text x="13.8" y="23.5" text-anchor="middle" font-family="Pixelify Sans, 'VT323', 'Courier New', monospace" font-size="6.2" fill="#050805" opacity="0.45">${faceSymbol}</text>
    </g>`;
  },
  trainer(colors, faceSymbol){
    const { base, highlight, shadow, accent, edge } = colors;
    return `<g>
      <path d="M8 20l2.5-7 5.5-2.5 5.5 2.5L24 20l-2.5 6.5h-11z" fill="${base}" stroke="${edge}" stroke-width="0.9" stroke-linejoin="round"/>
      <path d="M9.5 15.5L6 12l3.5-2 4 4.2" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M22.5 15.5L26 12l-3.5-2-4 4.2" fill="none" stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M15.5 21h5.3l1.1 3.5h-7.5z" fill="${shadow}" opacity="0.55"/>
      <circle cx="16" cy="9.8" r="3.3" fill="${highlight}" stroke="${edge}" stroke-width="0.95"/>
      <path d="M16 7.2l1.8-2.2h1.6l-1.2 2.7" fill="${highlight}" stroke="${edge}" stroke-width="0.7" stroke-linejoin="round"/>
      <text x="16" y="18.8" text-anchor="middle" font-family="Pixelify Sans, 'VT323', 'Courier New', monospace" font-size="6.3" fill="#050805" opacity="0.52">${faceSymbol}</text>
    </g>`;
  },
  warrior(colors, faceSymbol){
    const { base, highlight, shadow, accent, edge } = colors;
    return `<g>
      <path d="M9.5 19.5l3.2-8.2L16 8l3.3 3.3 3.2 8.2-2 7.5h-8z" fill="${base}" stroke="${edge}" stroke-width="0.95" stroke-linejoin="round"/>
      <path d="M12.5 21h7l0.8 4.5h-8.6z" fill="${accent}" stroke="${edge}" stroke-width="0.8" stroke-linejoin="round"/>
      <circle cx="16" cy="10" r="3.4" fill="${highlight}" stroke="${edge}" stroke-width="1"/>
      <path d="M23.5 9l4-0.5-1.2 13-3.6-2.2z" fill="${highlight}" stroke="${edge}" stroke-width="0.8" stroke-linejoin="round"/>
      <path d="M25.7 9.2l-0.9 9" stroke="${shadow}" stroke-width="1" stroke-linecap="round"/>
      <path d="M10.2 18.5l-4.2 2.5 4 4.2 3-2.1z" fill="${shadow}" stroke="${edge}" stroke-width="0.85" stroke-linejoin="round"/>
      <text x="16" y="18.5" text-anchor="middle" font-family="Pixelify Sans, 'VT323', 'Courier New', monospace" font-size="6.5" fill="#050805" opacity="0.45">${faceSymbol}</text>
    </g>`;
  },
  feral(colors){
    const { base, highlight, shadow, accent, edge } = colors;
    return `<g>
      <path d="M9 13l4-5h6l4 5-1 3 2 5-3.5 4-3.5-2-3.5 2-3.5-4 2-5z" fill="${base}" stroke="${edge}" stroke-width="0.9" stroke-linejoin="round"/>
      <path d="M11 11l5-2.5L21 11" fill="none" stroke="${highlight}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M12 20l-1.5 2.5L13 25l3-1 3 1 2.5-2.5L21 20" fill="${accent}" stroke="${edge}" stroke-width="0.9" stroke-linejoin="round"/>
      <circle cx="14" cy="16" r="1.1" fill="#050805"/>
      <circle cx="18" cy="16" r="1.1" fill="#050805"/>
      <path d="M14 19h4l-2 1.8z" fill="${shadow}" opacity="0.6"/>
    </g>`;
  },
  automaton(colors, faceSymbol){
    const { base, highlight, shadow, accent, edge } = colors;
    return `<g>
      <rect x="11" y="9" width="10" height="9" rx="2" fill="${base}" stroke="${edge}" stroke-width="1"/>
      <rect x="12" y="18" width="8" height="6" rx="1.5" fill="${accent}" stroke="${edge}" stroke-width="0.9"/>
      <rect x="13.5" y="5.5" width="5" height="4" rx="1" fill="${highlight}" stroke="${edge}" stroke-width="0.9"/>
      <circle cx="14.5" cy="13" r="1.2" fill="#050805"/>
      <circle cx="17.5" cy="13" r="1.2" fill="#050805"/>
      <rect x="9" y="12.5" width="2.5" height="6.5" rx="1" fill="${accent}" stroke="${edge}" stroke-width="0.8"/>
      <rect x="20.5" y="12.5" width="2.5" height="6.5" rx="1" fill="${accent}" stroke="${edge}" stroke-width="0.8"/>
      <text x="16" y="21.5" text-anchor="middle" font-family="Pixelify Sans, 'VT323', 'Courier New', monospace" font-size="6" fill="#050805" opacity="0.45">${faceSymbol}</text>
    </g>`;
  },
  object(colors, faceSymbol){
    const { base, highlight, shadow, edge } = colors;
    return `<g>
      <rect x="8" y="11" width="16" height="14" rx="2" fill="${base}" stroke="${edge}" stroke-width="1"/>
      <path d="M8 17h16" stroke="${shadow}" stroke-width="1"/>
      <path d="M14 11v14" stroke="${shadow}" stroke-width="1"/>
      <path d="M8 12.5l6 4.5" stroke="${highlight}" stroke-width="0.8"/>
      <path d="M24 12.5l-6 4.5" stroke="${highlight}" stroke-width="0.8"/>
      <text x="16" y="25" text-anchor="middle" font-family="Pixelify Sans, 'VT323', 'Courier New', monospace" font-size="7" fill="#050805" opacity="0.5">${faceSymbol}</text>
    </g>`;
  },
  quest(colors, faceSymbol){
    const { highlight, accent, edge } = colors;
    const symbol = faceSymbol || '★';
    return `<g>
      <path d="M16 7l2.6 5.8 6.4 0.5-4.9 4 1.6 6.3-5.7-3.2-5.7 3.2 1.6-6.3-4.9-4 6.4-0.5z" fill="${highlight}" stroke="${edge}" stroke-width="1" stroke-linejoin="round"/>
      <path d="M16 9.8l-1.8 3.9-4.3 0.3 3.3 2.7-1.1 4.3 3.9-2.2 3.9 2.2-1.1-4.3 3.3-2.7-4.3-0.3z" fill="${accent}" opacity="0.85"/>
      <text x="16" y="19.5" text-anchor="middle" font-family="Pixelify Sans, 'VT323', 'Courier New', monospace" font-size="7" fill="#050805" opacity="0.55">${symbol}</text>
    </g>`;
  }
};

function renderRetroNpcSilhouette(type, colors, faceSymbol){
  const factory = retroSilhouettes[type] || retroSilhouettes.wanderer;
  return factory(colors, faceSymbol);
}

function buildRetroNpcSvg(n){
  const base = normalizeColor(getNpcColor(n));
  const glow = adjustColor(base, 0.2);
  const highlight = adjustColor(base, 0.4);
  const shadow = adjustColor(base, -0.45);
  const accent = adjustColor(base, -0.2);
  const edge = adjustColor(base, -0.65);
  const symbol = (getNpcSymbol(n) || '!').trim() || '!';
  const label = sanitizeRetroText(n.shortName || n.title || n.name, symbol);
  const faceSymbol = escapeXml(symbol);
  const archetype = getRetroNpcArchetype(n);
  const silhouette = renderRetroNpcSilhouette(archetype, { base, glow, highlight, shadow, accent, edge }, faceSymbol);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
  <defs>
    <linearGradient id="retroGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${highlight}" stop-opacity="0.9"/>
      <stop offset="0.6" stop-color="${base}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${shadow}" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" ry="6" fill="#050805"/>
  <rect x="1.5" y="1.5" width="29" height="29" rx="6" ry="6" fill="#101810" stroke="${glow}" stroke-width="1.5"/>
  <rect x="3.5" y="5" width="25" height="18" rx="5" ry="5" fill="url(#retroGlow)" stroke="${shadow}" stroke-width="1"/>
  ${silhouette}
  <text x="16" y="28" text-anchor="middle" font-family="Pixelify Sans, 'VT323', 'Courier New', monospace" font-size="7" fill="${highlight}" letter-spacing="1">${label}</text>
</svg>`;
}

function getRetroNpcSprite(n){
  const Img = globalThis.Image;
  if(typeof Img !== 'function') return null;
  const keyParts = [
    n.id ?? n.npcId ?? n.slug ?? n.key ?? n.name ?? n.title ?? `${n.map ?? ''}:${n.x ?? ''},${n.y ?? ''}`,
    getNpcColor(n) ?? DEFAULT_NPC_COLOR,
    getNpcSymbol(n) ?? '!',
    n.map ?? ''
  ];
  const key = keyParts.join('|');
  const cached = retroNpcArtCache.get(key);
  if(cached) return cached;
  const svg = buildRetroNpcSvg(n);
  const url = svgToDataUrl(svg);
  const sprite = new Img();
  sprite.decoding = 'sync';
  sprite.src = url;
  retroNpcArtCache.set(key, sprite);
  return sprite;
}

function buildRetroItemGlyphSvg(){
  const inner = '#111b12';
  const glowA = '#c8ffbf';
  const glowB = '#64f0ff';
  const accent = '#ffe59a';
  const shrink = 'translate(16 16) scale(0.75) translate(-16 -16)';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="geometricPrecision">
  <defs>
    <radialGradient id="retroItemGlyphAura" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="${glowA}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${inner}" stop-opacity="0.1"/>
    </radialGradient>
    <linearGradient id="retroItemGlyphBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${glowA}" stop-opacity="0.95"/>
      <stop offset="0.55" stop-color="${glowA}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="${glowB}" stop-opacity="0.65"/>
    </linearGradient>
  </defs>
  <g transform="${shrink}">
    <circle cx="16" cy="14.5" r="10.5" fill="url(#retroItemGlyphAura)" opacity="0.85"/>
    <path d="M11 12.5l2.8-4.2h4.4l2.8 4.2" fill="none" stroke="${glowB}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M9.5 14h13l-1 11.2c-0.2 1.9-1.7 3.3-3.6 3.3h-3.8c-1.9 0-3.4-1.4-3.6-3.3z" fill="url(#retroItemGlyphBody)" stroke="${glowB}" stroke-width="1" stroke-linejoin="round"/>
    <path d="M12.2 18.3h7.6" stroke="${accent}" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
    <circle cx="16" cy="21" r="1.5" fill="${accent}" stroke="${glowB}" stroke-width="0.7"/>
    <path d="M12.7 22.8l-1 2.6" stroke="${accent}" stroke-width="0.9" stroke-linecap="round" opacity="0.9"/>
    <path d="M19.3 22.8l1 2.6" stroke="${accent}" stroke-width="0.9" stroke-linecap="round" opacity="0.9"/>
  </g>
</svg>`;
}

function buildRetroItemCacheSvg(){
  const inner = '#1a130a';
  const glowA = '#ffcd7a';
  const glowB = '#ff7f6a';
  const accent = '#fff4cc';
  const edge = '#7f3b16';
  const shrink = 'translate(16 16) scale(0.75) translate(-16 -16)';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="geometricPrecision">
  <defs>
    <radialGradient id="retroItemCacheAura" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="${glowA}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${inner}" stop-opacity="0.05"/>
    </radialGradient>
    <linearGradient id="retroItemCacheLid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${glowA}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${glowB}" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="retroItemCacheFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${glowA}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${glowB}" stop-opacity="0.75"/>
    </linearGradient>
  </defs>
  <g transform="${shrink}">
    <circle cx="16" cy="15" r="11.5" fill="url(#retroItemCacheAura)" opacity="0.82"/>
    <rect x="8" y="9.5" width="16" height="7.5" rx="2.5" fill="url(#retroItemCacheLid)" stroke="${edge}" stroke-width="1"/>
    <rect x="9.5" y="14" width="13" height="9.5" rx="2.5" fill="url(#retroItemCacheFront)" stroke="${edge}" stroke-width="1"/>
    <path d="M9.5 16.5h13" stroke="${edge}" stroke-width="1.1" stroke-linecap="round" opacity="0.85"/>
    <path d="M14.5 9.5l-2 3" stroke="${edge}" stroke-width="1.1" stroke-linecap="round" opacity="0.75"/>
    <path d="M17.5 9.5l2 3" stroke="${edge}" stroke-width="1.1" stroke-linecap="round" opacity="0.75"/>
    <circle cx="16" cy="18.8" r="1.6" fill="${accent}" stroke="${edge}" stroke-width="0.8"/>
    <path d="M12.2 20.8l-1.4 3" stroke="${accent}" stroke-width="1" stroke-linecap="round" opacity="0.8"/>
    <path d="M19.8 20.8l1.4 3" stroke="${accent}" stroke-width="1" stroke-linecap="round" opacity="0.8"/>
  </g>
</svg>`;
}

function buildRetroPlayerSvg(){
  const base = '#0b141a';
  const innerField = '#09121a';
  const glowA = '#64f0ff';
  const glowB = '#b78dff';
  const blade = '#f6f3d7';
  const accent = '#ff9d76';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="geometricPrecision">
  <defs>
    <radialGradient id="playerAura" cx="50%" cy="50%" r="60%">
      <stop offset="0" stop-color="${glowA}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${innerField}" stop-opacity="0.05"/>
    </radialGradient>
    <linearGradient id="playerBlade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${blade}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
    <linearGradient id="playerCloak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${glowA}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${glowB}" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="${base}"/>
  <rect x="1.5" y="1.5" width="29" height="29" rx="6" fill="${innerField}" stroke="${glowA}" stroke-width="1.5" opacity="0.85"/>
  <circle cx="16" cy="16" r="12" fill="url(#playerAura)"/>
  <path d="M16 6l4.5 7.5-4.5 3.8-4.5-3.8z" fill="url(#playerCloak)" stroke="${glowA}" stroke-width="0.9" stroke-linejoin="round"/>
  <path d="M11.2 14.5l-2.2 8.5 6.5 3 6.5-3-2.2-8.5" fill="none" stroke="${glowB}" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M15.2 14.5l1.6-6.2 3.2 2.4-3.3 9.8" fill="url(#playerBlade)" stroke="${blade}" stroke-width="0.8" stroke-linejoin="round"/>
  <path d="M16 21.5l4.8 2.2-4.8 2.8-4.8-2.8z" fill="#13263a" stroke="${glowA}" stroke-width="0.8"/>
  <circle cx="16" cy="16" r="3.2" fill="#06111a" stroke="${blade}" stroke-width="0.8"/>
  <circle cx="16" cy="16" r="1.2" fill="${glowA}"/>
  <path d="M10 23.5l-1.8 1.2L8.6 27l3.2-1.3z" fill="${accent}" opacity="0.7"/>
  <path d="M22 23.5l1.8 1.2-1.2 2.3-3.2-1.3z" fill="${accent}" opacity="0.7"/>
</svg>`;
}

function getRetroPlayerSprite(){
  const Img = globalThis.Image;
  if(typeof Img !== 'function') return null;
  const meta = playerIcons[clampPlayerIconIndex(playerIconIndex)];
  if(meta){
    if(retroPlayerSprite && retroPlayerSpriteIndex === playerIconIndex){
      return retroPlayerSprite;
    }
    const sprite = new Img();
    sprite.decoding = 'sync';
    sprite.src = meta.path;
    retroPlayerSprite = sprite;
    retroPlayerSpriteIndex = playerIconIndex;
    return sprite;
  }
  if(retroPlayerSprite && retroPlayerSpriteIndex === -2){
    return retroPlayerSprite;
  }
  const svg = buildRetroPlayerSvg();
  const url = svgToDataUrl(svg);
  const sprite = new Img();
  sprite.decoding = 'sync';
  sprite.src = url;
  retroPlayerSprite = sprite;
  retroPlayerSpriteIndex = -2;
  return sprite;
}

function getRetroItemSprite(){
  const Img = globalThis.Image;
  if(typeof Img !== 'function') return null;
  if(retroItemSprite) return retroItemSprite;
  const svg = buildRetroItemGlyphSvg();
  const url = svgToDataUrl(svg);
  const sprite = new Img();
  sprite.decoding = 'sync';
  sprite.src = url;
  retroItemSprite = sprite;
  return sprite;
}

function getRetroItemCacheSprite(){
  const Img = globalThis.Image;
  if(typeof Img !== 'function') return null;
  if(retroItemCacheSprite) return retroItemCacheSprite;
  const svg = buildRetroItemCacheSvg();
  const url = svgToDataUrl(svg);
  const sprite = new Img();
  sprite.decoding = 'sync';
  sprite.src = url;
  retroItemCacheSprite = sprite;
  return sprite;
}
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
const sfxSpriteSrc = 'data:audio/wav;base64,UklGRjQJAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAJAACAnbnS5/X9//ns2sKnimxPNR8OBAAEDh81T2yKp8La7Pn//fXn0rmdgGJGLRgKAgAGEyU9WHWTsMrg8fv/+/HgyrCTdVg9JRMGAAIKGC1GYn+dudLn9f3/+ezawqeKbE81Hw4EAAQOHzVPbIqnwtrs+f/99efSuZ2AYkYtGAoCAAYTJT1YdZOwyuDx+//78eDKsJN1WD0lEwYAAgoYLUZif5250uf1/f/57NrCp4psTzUfDgQABA4fNU9siqfC2uz5//3159K5nX9iRi0YCgIABhMlPVh1k7DK4PH7//vx4Mqwk3VYPSUTBgACChgtRmJ/nbnS5/X9//ns2sKnimxPNR8OBAAEDh81T2yKp8La7Pn//fXn0rmdf2JGLRgKAgAGEyU9WHWTsMrg8fv/+/HgyrCTdVg9JRMGAAIKGC1GYn+dudLn9f3/+ezawqeKbE81Hw4EAAQOHzVPbIqnwtrs+f/99efSuZ2AYkYtGAoCAAYTJT1YdZOwyuDx+//78eDKsJN1WD0lEwYAAgoYLUZigNL97KdPDgQ1itr/551GCgY9k+D/4JM9BgpGnef/2oo1BA5Pp+z90oAtAhNYsPH7ynUlABhiufX5wmwfAB9swvn1uWIYACV1yvvxsFgTAi1/0v3sp08OBDWK2v/nnUYKBj2T4P/gkz0GCkad5//aijUEDk+n7P3SgC0CE1iw8fvKdSUAGGK59fnCbB8AH2zC+fW5YhgAJXXK+/GwWBMCLX/S/eynTw4ENYra/+edRgoGPZPg/+CTPQYKRp3n/9qKNQQOT6fs/dKALQITWLDx+8p1JQAYYrn1+cJsHwAfbML59bliGAAldcr78bBYEwItf9L97KdPDgQ1itr/551GCgY9k+D/4JM9BgpGnef/2oo1BA5Pp+z90n8tAhNYsPH7ynUlABhiufX5wmwfAB9swvn1uWIYACV1yvvxsFgTAi1/0v3sp08OBDWK2v/nnUYKBj2T4P/gkz0GCkad5//aijUEDk+n7P3SgC0CE1iw8fvKdSUAGGK59fnCbB8AH2zC+fW5YhgAJXXK+/GwWBMCLX/S/eynTw4ENYra/+edRgoGPZPg/+CTPQYKRp3n/9qKNQQOT6fs/dJ/LQITWLDx+8p1JQAYYrn1+cJsHwAfbML59bliGAAldcr78bBYEwItf9L97KdPDgQ1itr/551GCgY9k+D/4JM9BgpGnef/2oo1BA5Pp+z90oAtAhNYsPH7ynUlABhiufX5wmwfAB9swvn1uWIYACV1yvvxsFgTAi2A0v3sp08OBDWK2v/nnUYKBj2T4P/gkz0GCkad5//aijUEDk+n7P3SgC0CE1iw8fvKdSUAGGK59fnCbB8AH2zC+fW5YhgAJXXK+/GwWBMCLYC55/352qdsNQ4ADjVsp9r5/ee5gEYYAgYlWJPK8f/xypNYJQYCGEZ/uef9+dqnbDUOAA41bKfa+f3nuYBGGAIGJViTyvH/8cqTWCUGAhhGf7nn/fnap2w1DgAONWyn2vn957l/RhgCBiVYk8rx//HKk1glBgIYRn+55/352qdsNQ4ADjVsp9r5/ee5f0YYAgYlWJPK8f/xypNYJQYCGEZ/uef9+dqnbDUOAA41bKfa+f3nuYBGGAIGJViTyvH/8cqTWCUGAhhGgLnn/fnap2w1DgAONWyn2vn957mARhgCBiVYk8rx//HKk1glBgIYRn+55/352qdsNQ4ADjVsp9r5/ee5gEYYAgYlWJPK8f/xypNYJQYCGEaAuef9+dqnbDUOAA41bKfa+f3nuYBGGAIGJViTyvH/8cqTWCUGAhhGf7nn/fnap2w1DgAONWyn2vn957mARhgCBiVYk8rx//HKk1glBgIYRn+55/352qdsNQ4ADjVsp9r5/ee5gEYYAgYlWJPK8f/xypNYJQYCGEaAuef9+dqnbDUOAA41bKfa+f3nuYBGGAIGJViTyvH/8cqTWCUGAhhGf7nn/fnap2w1DgAONWyn2vn957mARhgCBiVYk8rx//HKk1glBgIYRn+55/352qdsNQ4ADjVsp9r5/ee5gEYYAgYlWJPK8f/xypNYJQYCGEZ/uef9+dqnbDUOAA41bKfa+f3nuX9GGAIGJViTyvH/8cqTWCUGAhhGgLnn/fnap2w1DgAONWyn2vn957mARhgCBiVYk8rx//HKk1glBgIYRn+55/352qdsNQ4ADjVsp9r5/ee5gEYYAgYlWJPK8f/xypNYJQYCGEaAk6e5ytrn8fn9//358efayrmnk4BsWEY1JRgOBgIAAgYOGCU1Rlhsf5Onucra5/H5/f/9+fHn2sq5p5OAbFhGNSUYDgYCAAIGDhglNUZYbH+Tp7nK2ufx+f3//fnx59rKuaeTf2xYRjUlGA4GAgACBg4YJTVGWGx/k6e5ytrn8fn9//358efayrmnk39sWEY1JRgOBgIAAgYOGCU1Rlhsf5Onucra5/H5/f/9+fHn2sq5p5OAbFhGNSUYDgYCAAIGDhglNUZYbICTp7nK2ufx+f3//fnx59rKuaeTf2xYRjUlGA4GAgACBg4YJTVGWGx/k6e5ytrn8fn9//358efayrmnk39sWEY1JRgOBgIAAgYOGCU1RlhsgJOnucra5/H5/f/9+fHn2sq5p5N/bFhGNSUYDgYCAAIGDhglNUZYbH+Tp7nK2ufx+f3//fnx59rKuaeTf2xYRjUlGA4GAgACBg4YJTVGWGx/k6e5ytrn8fn9//358efayrmnk39sWEY1JRgOBgIAAgYOGCU1RlhsgJOnucra5/H5/f/9+fHn2sq5p5N/bFhGNSUYDgYCAAIGDhglNUZYbICTp7nK2ufx+f3//fnx59rKuaeTf2xYRjUlGA4GAgACBg4YJTVGWGx/k6e5ytrn8fn9//358efayrmnk39sWEY1JRgOBgIAAgYOGCU1RlhsgJOnucra5/H5/f/9+fHn2sq5p5N/bFhGNSUYDgYCAAIGDhglNUZYbICTp7nK2ufx+f3//fnx59rKuaeTgGxYRjUlGA4GAgACBg4YJTVGWGyAk6e5ytrn8fn9//358efayrmnk39sWEY1JRgOBgIAAgYOGCU1Rlhs';
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
EventBus.on('movement:player', updateQuestCompassTargets);
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
  const target = hpEl;
  if(!target) return;
  const span=document.createElement('span');
  span.className='hudBadge';
  span.textContent=msg;
  target.parentElement.appendChild(span);
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
const rawAttrWidth = (disp && typeof disp.getAttribute === 'function') ? Number(disp.getAttribute('width')) : NaN;
const rawAttrHeight = (disp && typeof disp.getAttribute === 'function') ? Number(disp.getAttribute('height')) : NaN;
const BASE_CANVAS_WIDTH = Number.isFinite(rawAttrWidth) && rawAttrWidth > 0 ? rawAttrWidth : (disp?.width && disp.width > 0 ? disp.width : 640);
const BASE_CANVAS_HEIGHT = Number.isFinite(rawAttrHeight) && rawAttrHeight > 0 ? rawAttrHeight : (disp?.height && disp.height > 0 ? disp.height : 480);
const RENDER_SCALE = 2;
if(disp){
  disp.width = Math.round(BASE_CANVAS_WIDTH * RENDER_SCALE);
  disp.height = Math.round(BASE_CANVAS_HEIGHT * RENDER_SCALE);
}
const dctx = disp ? disp.getContext('2d') : null;
const scene = document.createElement('canvas');
scene.width = disp?.width || Math.round(BASE_CANVAS_WIDTH * RENDER_SCALE);
scene.height = disp?.height || Math.round(BASE_CANVAS_HEIGHT * RENDER_SCALE);
const sctx = scene.getContext('2d');
const prev = document.createElement('canvas');
prev.width = scene.width;
prev.height = scene.height;
const pctx = prev.getContext('2d');
if(dctx){
  dctx.imageSmoothingEnabled = false;
}
if(sctx){
  sctx.imageSmoothingEnabled = false;
}
if(pctx){
  pctx.imageSmoothingEnabled = false;
}

const CRT_CANVAS_MAX_SCALE = 3;
const CRT_DESKTOP_BREAKPOINT = 900;
const crtTube = disp ? disp.parentElement : null;

function setCanvasDimensions(width, height){
  if(!disp) return;
  const widthPx = `${Math.floor(width)}px`;
  const heightPx = `${Math.floor(height)}px`;
  disp.style.width = widthPx;
  disp.style.height = heightPx;
  if(crtTube){
    crtTube.style.width = widthPx;
    crtTube.style.height = heightPx;
  }
}

function updateCanvasStretch(){
  if(!disp) return;
  const baseWidth = BASE_CANVAS_WIDTH || disp.clientWidth || 0;
  const baseHeight = BASE_CANVAS_HEIGHT || disp.clientHeight || 0;
  if(!baseWidth || !baseHeight){
    if(crtTube){
      crtTube.style.width = '';
      crtTube.style.height = '';
    }
    disp.style.width = '';
    disp.style.height = '';
    return;
  }
  const viewportWidth = (typeof window !== 'undefined' && typeof window.innerWidth === 'number') ? window.innerWidth : Number.POSITIVE_INFINITY;
  if(viewportWidth < CRT_DESKTOP_BREAKPOINT){
    setCanvasDimensions(baseWidth, baseHeight);
    return;
  }
  const crtWrapCandidate = crtTube ? crtTube.parentElement : null;
  const crtWrap = (crtWrapCandidate && crtWrapCandidate.classList?.contains('crt-wrap')) ? crtWrapCandidate : document.querySelector('.crt-wrap');
  if(!crtWrap){
    setCanvasDimensions(baseWidth, baseHeight);
    return;
  }
  const wrapParent = crtWrap.parentElement;
  const wrap = (wrapParent && wrapParent.classList?.contains('wrap')) ? wrapParent : document.querySelector('.wrap');
  const availableWidth = Math.max(0, crtWrap.clientWidth || 0);
  const availableHeight = Math.max(0, (wrap?.clientHeight || crtWrap.clientHeight || (typeof window !== 'undefined' && typeof window.innerHeight === 'number' ? window.innerHeight : baseHeight)));
  if(!availableWidth || !availableHeight){
    setCanvasDimensions(baseWidth, baseHeight);
    return;
  }
  const maxWidth = baseWidth * CRT_CANVAS_MAX_SCALE;
  const maxHeight = baseHeight * CRT_CANVAS_MAX_SCALE;
  let targetWidth = Math.min(availableWidth, maxWidth);
  let targetHeight = targetWidth * (baseHeight / baseWidth);
  const heightLimit = Math.min(availableHeight, maxHeight);
  if(targetHeight > heightLimit){
    targetHeight = heightLimit;
    targetWidth = targetHeight * (baseWidth / baseHeight);
  }
  if(!Number.isFinite(targetWidth) || !Number.isFinite(targetHeight) || targetWidth <= baseWidth || targetHeight <= baseHeight){
    setCanvasDimensions(baseWidth, baseHeight);
    return;
  }
  setCanvasDimensions(targetWidth, targetHeight);
}

if(typeof window !== 'undefined' && window.addEventListener){
  window.addEventListener('resize', updateCanvasStretch);
}
updateCanvasStretch();

// Font init (prevents invisible glyphs on some canvases)
sctx.font = `${(12 * fontScale) / RENDER_SCALE}px system-ui, sans-serif`;

let camX=0, camY=0, showMini=true;
let _lastTime=0;
let bumpX=0, bumpY=0, bumpEnd=0;
const FOOTSTEP_BUMP_RANGE = 0.6;
const FOOTSTEP_BUMP_DURATION_MS = 35;
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
  const fx = globalThis.fxConfig;
  if(!fx || !fx.footstepBump) return;
  const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  bumpX = (Math.random()-0.5) * FOOTSTEP_BUMP_RANGE;
  bumpY = (Math.random()-0.5) * FOOTSTEP_BUMP_RANGE;
  bumpEnd = now + FOOTSTEP_BUMP_DURATION_MS;
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
const renderOrder = ['tiles', 'items', 'portals', 'entitiesBelow', 'player', 'entitiesAbove'];

function render(gameState=state, dt){
  const ctx = sctx;
  if(!ctx) return;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,scene.width,scene.height);
  ctx.save();
  ctx.scale(RENDER_SCALE, RENDER_SCALE);
  ctx.imageSmoothingEnabled = false;
  ctx.font = `${(12 * fontScale) / RENDER_SCALE}px system-ui, sans-serif`;
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,BASE_CANVAS_WIDTH,BASE_CANVAS_HEIGHT);

  const activeMap = gameState.map || mapIdForState();
  const { W, H } = mapWH(activeMap);
  const { w:vW, h:vH } = getViewSize();
  const offX = Math.max(0, Math.floor((vW - W) / 2));
  const offY = Math.max(0, Math.floor((vH - H) / 2));

  const items = gameState.itemDrops || itemDrops;
  const ps = gameState.portals || portals;
  const entities = gameState.entities || (typeof NPCS !== 'undefined' ? NPCS : []);
  const pos = gameState.party || party;
  const remoteParties = globalThis.Dustland?.multiplayerParties?.list?.() || globalThis.Dustland?.multiplayerState?.remoteParties || [];

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
          const multi = Array.isArray(it.items) && it.items.length>1;
          if(retroNpcArtEnabled){
            const sprite = multi ? getRetroItemCacheSprite() : getRetroItemSprite();
            if(sprite?.complete){
              if(multi){
                const a=0.7+0.3*Math.sin(Date.now()/300);
                ctx.globalAlpha=a;
              }
              ctx.drawImage(sprite, vx, vy, TS, TS);
              ctx.globalAlpha=1;
              continue;
            }
          }
          ctx.globalAlpha = 1;
          if(multi){
            const a=0.7+0.3*Math.sin(Date.now()/300);
            ctx.fillStyle='#ffb347';
            ctx.globalAlpha=a;
            ctx.fillRect(vx+4,vy+4,TS-8,TS-8);
            ctx.globalAlpha=1;
          }else{
            ctx.fillStyle='#c8ffbf';
            ctx.fillRect(vx+4,vy+4,TS-8,TS-8);
          }
        }
      }
    }
    else if(layer==='portals'){
      for(const p of ps){
        if(p.map!==activeMap) continue;
        if(p.x>=camX&&p.y>=camY&&p.x<camX+vW&&p.y<camY+vH){
          const vx=(p.x-camX+offX)*TS, vy=(p.y-camY+offY)*TS;
          ctx.strokeStyle='#f0f';
          ctx.strokeRect(vx+2,vy+2,TS-4,TS-4);
        }
      }
    }
    else if(layer==='entitiesBelow'){ drawEntities(ctx, below, offX, offY); }
    else if(layer==='player'){
      if(Array.isArray(remoteParties) && remoteParties.length){
        const now = Date.now();
        for(const info of remoteParties){
          if(!info || info.map !== activeMap) continue;
          if(!Number.isFinite(info.x) || !Number.isFinite(info.y)) continue;
          const rx=(info.x-camX+offX)*TS;
          const ry=(info.y-camY+offY)*TS;
          const age = info.updated ? Math.max(0, Math.min(8000, now - info.updated)) : 0;
          const alpha = 0.35 + (Math.max(0, 8000 - age) / 8000) * 0.45;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle='#64f0ff';
          ctx.fillRect(rx+3,ry+3,TS-6,TS-6);
          ctx.strokeStyle='#102c30';
          ctx.lineWidth = 1;
          ctx.strokeRect(rx+3,ry+3,TS-6,TS-6);
          ctx.restore();
        }
      }
      const px=(pos.x-camX+offX)*TS, py=(pos.y-camY+offY)*TS;
      if(retroNpcArtEnabled){
        const sprite = getRetroPlayerSprite();
        if(sprite?.complete){
          ctx.drawImage(sprite, px, py, TS, TS);
        }else{
          ctx.fillStyle='#64f0ff';
          ctx.fillRect(px+4,py+4,TS-8,TS-8);
        }
      }else{
        ctx.fillStyle='#f0f';
        ctx.fillRect(px+4,py+4,TS-8,TS-8);
      }
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
  ctx.restore();
}

function getNpcColor(n){
  if(n.overrideColor && n.color) return n.color;
  if(n.trainer) return '#ffcc99';
  if(n.shop) return '#ffee99';
  if(n.inanimate) return '#d4af37';
  if(n.questId || n.quests) return '#cc99ff';
  if(n.combat?.auto) return '#f00';
  if((n.combat && !n.tree) || n.attackOnSight) return '#f88';
  return '#9ef7a0';
}

function getNpcSymbol(n){
  if(n.symbol) return n.symbol;
  if(n.inanimate) return '?';
  if(n.questId || n.quests) return '★';
  return '!';
}

function drawEntities(ctx, list, offX, offY){
  const { w:vW, h:vH } = getViewSize();
  for(const n of list){
    if(n.x>=camX&&n.y>=camY&&n.x<camX+vW&&n.y<camY+vH){
      const vx=(n.x-camX+offX)*TS, vy=(n.y-camY+offY)*TS;
      if(retroNpcArtEnabled){
        const sprite = getRetroNpcSprite(n);
        if(sprite?.complete){
          ctx.drawImage(sprite, vx, vy, TS, TS);
          continue;
        }
      }
      ctx.fillStyle=getNpcColor(n); ctx.fillRect(vx,vy,TS,TS);
      ctx.fillStyle='#000'; ctx.fillText(getNpcSymbol(n),vx+5,vy+12);
    }
  }
}

Object.assign(window, { renderOrderSystem: { order: renderOrder, render } });

// ===== HUD & Tabs =====
const TAB_BREAKPOINT = 1980;
let activeTab = 'inv';

function updateHUD(){
  const prevHp = updateHUD._lastHpVal ?? player.hp;
  hpEl.textContent = player.hp;
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
    if(musicBus){
      const ratio = Math.max(0, Math.min(1, (lead.adr || 0) / (lead.maxAdr || 1)));
      let nextMood = hudAdrMood;
      if(hudAdrMood === 'adr_high'){
        if(ratio < 0.6) nextMood = null;
      } else if(hudAdrMood === 'adr_low'){
        if(ratio > 0.35) nextMood = null;
      } else {
        if(ratio >= 0.75) nextMood = 'adr_high';
        else if(ratio <= 0.2) nextMood = 'adr_low';
        else nextMood = null;
      }
      if(nextMood !== hudAdrMood){
        if(nextMood){
          const priority = nextMood === 'adr_high' ? 50 : 35;
          musicBus.emit('music:mood', { id: nextMood, source: 'adrenaline', priority });
        } else {
          musicBus.emit('music:mood', { id: null, source: 'adrenaline' });
        }
        hudAdrMood = nextMood;
      }
    }
  } else if(musicBus && hudAdrMood){
    musicBus.emit('music:mood', { id: null, source: 'adrenaline' });
    hudAdrMood = null;
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
  if(hydEl){
    const h = player.hydration;
    const maxHyd = 2;
    if(typeof h === 'number' && h < maxHyd){
      hydEl.textContent = '💧'.repeat(h);
      hydEl.hidden = false;
    }else{
      hydEl.textContent = '';
      hydEl.hidden = true;
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
  const maxHp = lead.maxHp ?? lead.hp ?? 0;
  const cappedMaxHp = maxHp > 0 ? maxHp : 1;
  const hpVal = typeof lead.hp === 'number' ? Math.max(0, Math.min(cappedMaxHp, lead.hp)) : cappedMaxHp;
  const hpRatio = hpVal / cappedMaxHp;
  const lowHealthFactor = Math.max(0, 1 - Math.min(1, hpRatio / 0.5));
  const pulse = (Math.sin(t / 200) + 1) / 2;
  const intensity = ratio * pulse;
  const blur = intensity * 4 * lowHealthFactor;
  const bloom = [`brightness(${1 + intensity})`];
  if(blur > 0.1) bloom.push(`blur(${blur}px)`);
  disp.style.setProperty('--fxBloom', bloom.join(' '));
}

function showTab(which){
  activeTab = which;
  if(window.innerWidth >= TAB_BREAKPOINT) return;
  const inv=document.getElementById('inv'), partyEl=document.getElementById('party'), q=document.getElementById('quests');
  const tInv=document.getElementById('tabInv'), tP=document.getElementById('tabParty'), tQ=document.getElementById('tabQuests');
  if (!inv) return;
  inv.style.display=(which==='inv'?'grid':'none');
  if(partyEl) partyEl.style.display=(which==='party'?'grid':'none');
  if(q) q.style.display=(which==='quests'?'grid':'none');
  for(const el of [tInv,tP,tQ]){
    if(!el) continue;
    el.classList.remove('active');
    if(el.setAttribute) el.setAttribute('aria-selected','false');
  }
  if(which==='inv' && tInv){ tInv.classList.add('active'); if(tInv.setAttribute) tInv.setAttribute('aria-selected','true'); }
  if(which==='party' && tP){ tP.classList.add('active'); if(tP.setAttribute) tP.setAttribute('aria-selected','true'); }
  if(which==='quests' && tQ){ tQ.classList.add('active'); if(tQ.setAttribute) tQ.setAttribute('aria-selected','true'); }
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
  updateCanvasStretch();
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
function calcItemValue(it, member){
  if(!it) return 0;
  const m = member || party[selectedMember] || party[0];
  let score = it.value ?? 0;
  for(const v of Object.values(it.mods || {})){
    score += v;
  }
  if(it.type === 'weapon' && m && m.stats){
    const isRanged = Array.isArray(it.tags) && it.tags.includes('ranged');
    const stat = isRanged ? m.stats.AGI : m.stats.STR;
    score += (stat || 0) * 2;
  }
  return score;
}
let dropMode=false;
const dropSet=new Set();
function renderInv(){
  const inv=document.getElementById('inv');
  inv.innerHTML='';
  if(dropMode){
    const ctrl=document.createElement('div');
    ctrl.style.margin='4px 0';
    const ok=document.createElement('button');
    ok.className='btn';
    ok.textContent='Drop Selected';
    ok.onclick=()=>{ if(dropSet.size) dropItems(Array.from(dropSet)); dropMode=false; dropSet.clear(); renderInv(); updateHUD?.(); };
    const cancel=document.createElement('button');
    cancel.className='btn';
    cancel.textContent='Cancel';
    cancel.onclick=()=>{ dropMode=false; dropSet.clear(); renderInv(); };
    ctrl.appendChild(ok); ctrl.appendChild(cancel);
    inv.appendChild(ctrl);
    if(player.inv.length===0){ inv.appendChild(Object.assign(document.createElement('div'),{className:'slot muted',textContent:'(empty)'})); return; }
    const dropEntries = player.inv.map((it, index) => ({ it, index }));
    dropEntries.sort((a, b) => {
      const nameA = a.it?.name || '';
      const nameB = b.it?.name || '';
      const cmp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      if (cmp !== 0) return cmp;
      return a.index - b.index;
    });
    dropEntries.forEach(({ it, index }) => {
      const qty = Math.max(1, Number.isFinite(it?.count) ? it.count : 1);
      const row=document.createElement('div');
      row.className='slot';
      const cb=document.createElement('input');
      cb.type='checkbox';
      cb.checked = dropSet.has(index);
      cb.onchange=()=>{ if(cb.checked) dropSet.add(index); else dropSet.delete(index); };
      row.appendChild(cb);
      const span=document.createElement('span');
      span.textContent=qty>1?`${it.name} x${qty}`:it.name;
      row.appendChild(span);
      inv.appendChild(row);
    });
    return;
  }
  const ctrl=document.createElement('div');
  ctrl.style.margin='4px 0';
  const dropBtn=document.createElement('button');
  dropBtn.className='btn';
  dropBtn.textContent='Drop';
  dropBtn.onclick=()=>{ dropMode=true; dropSet.clear(); renderInv(); };
  ctrl.appendChild(dropBtn);
  inv.appendChild(ctrl);
  if(player.inv.length===0){
    inv.appendChild(Object.assign(document.createElement('div'),{className:'slot muted',textContent:'(empty)'}));
    return;
  }
  const caches = {};
  const others = [];
  player.inv.forEach(it => {
    const qty = Math.max(1, Number.isFinite(it?.count) ? it.count : 1);
    if(it.type === 'spoils-cache'){
      const bucket = caches[it.rank] || (caches[it.rank] = { items: [], total: 0 });
      bucket.items.push(it);
      bucket.total += qty;
    } else {
      others.push(it);
    }
  });
  const member=party[selectedMember]||party[0];
  const canEquipFn = typeof canEquip === 'function' ? canEquip : null;
  const describeRoles = typeof describeRequiredRoles === 'function' ? describeRequiredRoles : () => '';
  const suggestions = {};
  if(member){
    for(const slot of ['weapon','armor','trinket']){
      const eq=member.equip[slot];
      const candidates = others.filter(it => it.type===slot && (!eq || calcItemValue(it)>calcItemValue(eq)) && (!canEquipFn || canEquipFn(member, it)));
      if(candidates.length){
        const max=Math.max(...candidates.map(it=>calcItemValue(it)));
        const best=candidates.filter(it=>calcItemValue(it)===max);
        suggestions[slot]=best[Math.floor(Math.random()*best.length)];
      }
    }
  }
  Object.entries(caches).forEach(([rank, info]) => {
    const items = info.items;
    const total = info.total || items.length;
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
      count.textContent='x'+total;
      wrap.appendChild(count);
      row.appendChild(wrap);
    }
    if(total>1){
      const btn=document.createElement('button');
      btn.className='btn jitter';
      btn.textContent='Open All';
      btn.onclick=()=>{ SpoilsCache.openAll(rank); };
      row.appendChild(btn);
    }
    inv.appendChild(row);
  });
  others.forEach(it => {
    const qty = Math.max(1, Number.isFinite(it?.count) ? it.count : 1);
    const row=document.createElement('div');
    row.className='slot';
    row.style.display='flex';
    row.style.alignItems='center';
    row.style.justifyContent='flex-start';
    row.style.gap='8px';
    row.style.paddingRight='4px';
    if(['weapon','armor','trinket'].includes(it.type) && suggestions[it.type]===it){
      row.classList.add('better');
    }
    const baseLabel = it.name + (['weapon','armor','trinket'].includes(it.type)?` [${it.type}]`:'');
    const label = (it.cursed && it.cursedKnown)? `${baseLabel} (cursed)` : baseLabel;
    const labelSpan=document.createElement('span');
    labelSpan.textContent=label;
    const btnWrap=document.createElement('span');
    btnWrap.style.display='flex';
    btnWrap.style.gap='6px';
    btnWrap.style.marginLeft='auto';
    if(['weapon','armor','trinket'].includes(it.type)){
      const equipBtn=document.createElement('button');
      equipBtn.className='btn';
      equipBtn.dataset.a='equip';
      const allowed = !member || !canEquipFn || canEquipFn(member, it);
      const reqText = describeRoles(it);
      equipBtn.title = allowed ? 'Equip' : (reqText ? `Only ${reqText} can equip` : 'Cannot equip');
      equipBtn.setAttribute('aria-label', equipBtn.title);
      if(!allowed){
        equipBtn.disabled = true;
      }
      equipBtn.textContent='⚙';
      equipBtn.onclick=()=> equipItem(selectedMember, player.inv.indexOf(it));
      btnWrap.appendChild(equipBtn);
    }
    if(it.use){
      const useBtn=document.createElement('button');
      useBtn.className='btn';
      useBtn.dataset.a='use';
      useBtn.title='Use';
      useBtn.setAttribute('aria-label','Use');
      useBtn.textContent='⚡';
      useBtn.onclick=()=> useItem(player.inv.indexOf(it));
      btnWrap.appendChild(useBtn);
    }
    row.appendChild(labelSpan);
    if(qty>1){
      const countSpan=document.createElement('span');
      countSpan.className='stack-count';
      countSpan.textContent='x'+qty;
      row.appendChild(countSpan);
    }
    row.appendChild(btnWrap);
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
    row.onclick=e=>{ if(e.target.tagName==='BUTTON') return; if(['weapon','armor','trinket'].includes(it.type)) equipItem(selectedMember, player.inv.indexOf(it)); };
    inv.appendChild(row);
  });
}
function renderQuests(){
  const host=document.getElementById('quests');
  if(!host) return;
  host.innerHTML='';
  const list=quests?Object.values(quests).filter(v=> v && v.status!=='available'):[];
  if(list.length===0){
    host.innerHTML='<div class="q muted">(no quests)</div>';
    return;
  }
  const partyLoc=questPartyLocation();
  list.forEach(q=>{
    const progress=questProgressInfo(q);
    const target=questCompassTarget(q, partyLoc, progress);
    const card=document.createElement('div');
    card.className='q';
    card.dataset.questId=q.id || '';
    card.appendChild(renderQuestCompass(q, target, partyLoc));
    const info=document.createElement('div');
    info.className='quest-info';
    const header=document.createElement('div');
    header.className='quest-header';
    const title=document.createElement('b');
    title.className='quest-title';
    title.textContent=q.title || q.id;
    header.appendChild(title);
    if(progress.required>0){
      const prog=document.createElement('span');
      prog.className='quest-progress';
      prog.textContent=`${progress.total}/${progress.required}`;
      header.appendChild(prog);
    }
    info.appendChild(header);
    const desc=document.createElement('div');
    desc.className='small quest-desc';
    desc.textContent=questDescriptionText(q, progress, target);
    info.appendChild(desc);
    if(target && target.label && target.type!=='completed'){
      const targetRow=document.createElement('div');
      targetRow.className='small quest-target';
      targetRow.textContent=questTargetText(target, partyLoc);
      info.appendChild(targetRow);
    }
    const status=document.createElement('div');
    status.className='status';
    status.textContent=q.status || 'active';
    info.appendChild(status);
    card.appendChild(info);
    host.appendChild(card);
  });
}

function updateQuestCompassTargets(){
  const questData=globalThis.quests;
  if(!questData) return;
  const host=document.getElementById('quests');
  if(!host) return;
  const partyLoc=questPartyLocation();
  host.querySelectorAll('.q').forEach(card=>{
    const questId=card.dataset?.questId;
    if(!questId) return;
    const q=questData[questId];
    if(!q) return;
    const progress=questProgressInfo(q);
    const target=questCompassTarget(q, partyLoc, progress);
    const compass=card.querySelector('.quest-compass');
    if(compass){
      const canvas=compass.querySelector('canvas');
      if(canvas) drawQuestCompass(canvas, target, partyLoc);
      compass.title=questCompassTooltip(target, partyLoc);
    }
    const desc=card.querySelector('.quest-desc');
    if(desc) desc.textContent=questDescriptionText(q, progress, target);
    const targetRow=card.querySelector('.quest-target');
    if(target && target.label && target.type!=='completed'){
      if(targetRow){
        targetRow.textContent=questTargetText(target, partyLoc);
      }else{
        const info=card.querySelector('.quest-info');
        const status=card.querySelector('.status');
        if(info){
          const row=document.createElement('div');
          row.className='small quest-target';
          row.textContent=questTargetText(target, partyLoc);
          info.insertBefore(row, status || null);
        }
      }
    }else if(targetRow){
      targetRow.remove();
    }
  });
}

function questPartyLocation(){
  const loc={ map:'world', x:0, y:0 };
  const p=typeof party==='object' ? party : null;
  if(p && typeof p.map==='string') loc.map=p.map;
  else if(globalThis.state && typeof state.map==='string') loc.map=state.map;
  if(p && typeof p.x==='number') loc.x=p.x;
  else if(globalThis.state?.mapEntry && typeof state.mapEntry.x==='number') loc.x=state.mapEntry.x;
  if(p && typeof p.y==='number') loc.y=p.y;
  else if(globalThis.state?.mapEntry && typeof state.mapEntry.y==='number') loc.y=state.mapEntry.y;
  return loc;
}

function questProgressInfo(q){
  const required=Math.max(0, q.count || (q.item || q.itemTag ? 1 : 0));
  const turnedIn=typeof q.progress==='number'?q.progress:0;
  const countFn=typeof countItems==='function'?countItems:null;
  let carried=0;
  if(countFn){
    if(q.item) carried=countFn(q.item);
    else if(q.itemTag) carried=countFn(q.itemTag);
  }
  const total=Math.min(required, turnedIn + carried);
  const need=Math.max(0, required - turnedIn);
  const hasFlag=!q.reqFlag || (typeof flagValue==='function' ? !!flagValue(q.reqFlag) : true);
  const ready=q.status==='active' && required>0 && ((turnedIn>=required) || (carried>=need && hasFlag));
  return { required, turnedIn, carried, total, need, ready };
}

function questDescriptionText(q, progress, target){
  if(q.status==='completed'){
    if(q.outcome) return q.outcome;
    return typeof q.desc==='string'?q.desc:'';
  }
  if(progress.ready){
    const giver=Array.isArray(q.givers) && q.givers.length ? q.givers[0] : null;
    const giverName=giver ? (giver.name || humanizeQuestId(giver.id)) : '';
    const itemName=questItemName(q);
    if(giverName && itemName) return `Return the ${itemName} to ${giverName}.`;
    if(giverName) return `Return to ${giverName}.`;
    if(itemName) return `Return the ${itemName}.`;
  }
  if(target && target.type==='offmap' && target.map){
    return `Objective located in ${target.map}.`;
  }
  return typeof q.desc==='string'?q.desc:'';
}

function questTargetText(target, partyLoc){
  if(!target) return '';
  if(target.type==='npc'){
    const mapNote=target.map && partyLoc?.map && target.map!==partyLoc.map ? ` (${target.map})` : '';
    return `Return to ${target.label || 'the quest giver'}${mapNote}`;
  }
  if(target.type==='item'){
    const coords=(typeof target.x==='number' && typeof target.y==='number')?` (${target.x}, ${target.y})`:'';
    const mapNote=target.map && partyLoc?.map && target.map!==partyLoc.map ? ` — ${target.map}` : '';
    const label=target.label || 'the objective';
    return `Search near ${label}${coords}${mapNote}`;
  }
  if(target.type==='offmap'){
    return target.map ? `Objective located in ${target.map}` : 'Objective located elsewhere';
  }
  return '';
}

function questCompassTarget(q, partyLoc, progress){
  if(!q) return null;
  if(q.status==='completed') return { type:'completed', label:q.title };
  if(progress.ready){
    const giver=Array.isArray(q.givers) && q.givers.length ? q.givers[0] : null;
    if(giver){
      const label=giver.name || humanizeQuestId(giver.id);
      if(partyLoc && giver.map && partyLoc.map && giver.map!==partyLoc.map){
        return { type:'offmap', map:giver.map, label };
      }
      return { type:'npc', map:giver.map || partyLoc?.map || 'world', x:giver.x, y:giver.y, label };
    }
  }
  const itemTarget=findQuestItemTarget(q, partyLoc);
  if(!itemTarget) return null;
  if(partyLoc && itemTarget.map && partyLoc.map && itemTarget.map!==partyLoc.map){
    return { type:'offmap', map:itemTarget.map, label:itemTarget.label };
  }
  return itemTarget;
}

function findQuestItemTarget(q, partyLoc){
  const drops=Array.isArray(itemDrops)?itemDrops:[];
  const matches=[];
  if(q.item){
    drops.forEach(drop=>{
      if(!drop || drop.id!==q.item) return;
      matches.push({ type:'item', map:drop.map || 'world', x:drop.x, y:drop.y, label:questItemName(q) || humanizeQuestId(drop.id) });
    });
    if(!matches.length && q.itemLocation){
      matches.push({ type:'item', map:q.itemLocation.map || 'world', x:q.itemLocation.x, y:q.itemLocation.y, label:questItemName(q) });
    }
  } else if(q.itemTag){
    const tag=String(q.itemTag).toLowerCase();
    drops.forEach(drop=>{
      if(!drop || !drop.id) return;
      const def=(typeof ITEMS==='object' && ITEMS) ? ITEMS[drop.id] : null;
      const tags=Array.isArray(def?.tags)?def.tags.map(t=>String(t).toLowerCase()):[];
      if(tags.includes(tag) || drop.id===q.itemTag){
        const label=def?.name || questItemName(q) || humanizeQuestId(drop.id);
        matches.push({ type:'item', map:drop.map || 'world', x:drop.x, y:drop.y, label });
      }
    });
  }
  if(!matches.length) return null;
  const currentMap=partyLoc?.map;
  const sameMap=typeof currentMap==='string'?matches.filter(m=>!m.map || m.map===currentMap):matches;
  const pool=sameMap.length?sameMap:matches;
  if(typeof partyLoc?.x!=='number' || typeof partyLoc?.y!=='number') return pool[0];
  let best=null;
  let bestDist=Infinity;
  pool.forEach(loc=>{
    if(!loc) return;
    const dx=(loc.x ?? 0) - partyLoc.x;
    const dy=(loc.y ?? 0) - partyLoc.y;
    const dist=Math.abs(dx)+Math.abs(dy);
    if(dist<bestDist){ best=loc; bestDist=dist; }
  });
  return best || pool[0];
}

function questCompassTooltip(target, partyLoc){
  if(!target) return 'Explore to advance this quest.';
  if(target.type==='completed') return 'Quest completed';
  if(target.label){
    const mapNote=target.map && partyLoc?.map && target.map!==partyLoc.map ? ` (${target.map})` : '';
    const prefix=target.type==='npc' ? 'Return to ' : target.type==='item' ? 'Search near ' : '';
    const text=`${prefix}${target.label}${mapNote}`.trim();
    return text || 'Quest objective';
  }
  return 'Quest objective';
}

function renderQuestCompass(q, target, partyLoc){
  const wrap=document.createElement('div');
  wrap.className='quest-compass';
  if(q?.id) wrap.dataset.questId=q.id;
  const canvas=document.createElement('canvas');
  canvas.width=32;
  canvas.height=32;
  wrap.appendChild(canvas);
  drawQuestCompass(canvas, target, partyLoc);
  wrap.title=questCompassTooltip(target, partyLoc);
  return wrap;
}

function drawQuestCompass(canvas, target, partyLoc){
  const ctx=canvas.getContext && canvas.getContext('2d');
  if(!ctx) return;
  const size=canvas.width;
  ctx.imageSmoothingEnabled=false;
  ctx.clearRect(0,0,size,size);
  ctx.fillStyle='#040704';
  ctx.fillRect(0,0,size,size);
  ctx.strokeStyle='#152415';
  ctx.lineWidth=2;
  ctx.strokeRect(1,1,size-2,size-2);
  ctx.strokeStyle='#1f3a1f';
  ctx.strokeRect(2,2,size-4,size-4);
  ctx.beginPath();
  ctx.strokeStyle='#2c522c';
  ctx.lineWidth=3;
  ctx.arc(size/2,size/2,size/2-5,0,Math.PI*2);
  ctx.stroke();
  if(!target){
    ctx.fillStyle='#3f7b3f';
    ctx.fillRect(size/2-2,size/2-2,4,4);
    return;
  }
  if(target.type==='completed'){
    ctx.strokeStyle='#7cff7c';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(size/2-7,size/2+1);
    ctx.lineTo(size/2-1,size/2+6);
    ctx.lineTo(size/2+7,size/2-6);
    ctx.stroke();
    return;
  }
  if(target.type==='offmap'){
    ctx.strokeStyle='#6ad86a';
    ctx.lineWidth=3;
    ctx.strokeRect(size/2-6,size/2-6,12,12);
    ctx.beginPath();
    ctx.moveTo(size/2-4,size/2-4);
    ctx.lineTo(size/2+4,size/2+4);
    ctx.moveTo(size/2+4,size/2-4);
    ctx.lineTo(size/2-4,size/2+4);
    ctx.stroke();
    return;
  }
  const px=partyLoc?.x ?? 0;
  const py=partyLoc?.y ?? 0;
  if(typeof target.x!=='number' || typeof target.y!=='number'){
    ctx.fillStyle='#3f7b3f';
    ctx.fillRect(size/2-2,size/2-2,4,4);
    return;
  }
  const dx=target.x - px;
  const dy=target.y - py;
  if(dx===0 && dy===0){
    ctx.fillStyle=target.type==='npc' ? '#7cff7c' : '#56d856';
    ctx.fillRect(size/2-2,size/2-2,4,4);
    return;
  }
  const ang=Math.atan2(dx, -dy);
  const radius=size/2-7;
  ctx.save();
  ctx.translate(size/2,size/2);
  ctx.rotate(ang);
  ctx.strokeStyle=target.type==='npc' ? '#7cff7c' : '#56d856';
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(0,4);
  ctx.lineTo(0,-radius);
  ctx.stroke();
  ctx.fillStyle=ctx.strokeStyle;
  ctx.beginPath();
  ctx.moveTo(0,-radius-2);
  ctx.lineTo(3,-radius+3);
  ctx.lineTo(-3,-radius+3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function questItemName(q){
  if(!q) return '';
  if(q.item){
    const def=(typeof ITEMS==='object' && ITEMS) ? ITEMS[q.item] : null;
    if(def && def.name) return def.name;
    return humanizeQuestId(q.item);
  }
  if(q.itemTag){
    const tag=String(q.itemTag).toLowerCase();
    if(typeof ITEMS==='object' && ITEMS){
      const match=Object.values(ITEMS).find(it=>Array.isArray(it?.tags) && it.tags.map(t=>String(t).toLowerCase()).includes(tag));
      if(match && match.name) return match.name;
    }
    return humanizeQuestId(q.itemTag);
  }
  return '';
}

function humanizeQuestId(id){
  if(!id) return '';
  return String(id).replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
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
`<div class='row stats'>HP ${m.hp}/${m.maxHp}  ADR ${m.adr}  ATK ${fmt(bonus.ATK||0)}  DEF ${fmt(bonus.DEF||0)}  LCK ${fmt(bonus.LCK||0)}</div>`+
`<div class='row'><div class='xpbar' data-xp='${m.xp}/${nextXP}'><div class='fill' style='width:${pct}%'></div></div></div>`+
`<div class='row small'>
  <span class='equip-line'>WPN: ${wLabel}${wEq?` <button class="btn" data-a="unequip" data-slot="weapon" title="Unequip" aria-label="Unequip">🚫</button>`:''}</span>
  <span class='equip-line'>ARM: ${aLabel}${aEq?` <button class="btn" data-a="unequip" data-slot="armor" title="Unequip" aria-label="Unequip">🚫</button>`:''}</span>
  <span class='equip-line'>TRK: ${tLabel}${tEq?` <button class="btn" data-a="unequip" data-slot="trinket" title="Unequip" aria-label="Unequip">🚫</button>`:''}</span>
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
    globalThis.Dustland?.updateTradeUI?.(npc.shop);
    shopBuy.innerHTML = '';
    shopSell.innerHTML = '';

    const shopInv = npc.shop.inv || [];
    const baseMarkup = npc.vending ? 1 : npc.shop.markup || 2;
    const grudgeLevel = npc.shop.grudge ?? 0;
    const TraderClass = globalThis.Dustland?.Trader;

    const normalizeForKey = (value, omitCount) => {
      if (!value || typeof value !== 'object') {
        return typeof value === 'function' ? value.toString() : value;
      }
      if (Array.isArray(value)) {
        return value.map(v => normalizeForKey(v, false));
      }
      const out = {};
      Object.keys(value).sort().forEach(key => {
        if (omitCount && key === 'count') return;
        out[key] = normalizeForKey(value[key], false);
      });
      return out;
    };

    const shopStacks = [];
    const shopStackMap = new Map();
    shopInv.forEach(entry => {
      const item = getItem(entry.id);
      if (!item) return;
      const key = JSON.stringify({
        item: normalizeForKey(item, true),
        entry: normalizeForKey(entry, true)
      });
      let stack = shopStackMap.get(key);
      if (!stack) {
        stack = { item, qty: 0, entries: [] };
        shopStackMap.set(key, stack);
        shopStacks.push(stack);
      }
      const quantity = Math.max(1, Number.isFinite(entry?.count) ? entry.count : 1);
      stack.qty += quantity;
      stack.entries.push(entry);
    });

    const sellStacks = [];
    const sellStackMap = new Map();
    player.inv.forEach((item, idx) => {
      if (!item || !item.id) return;
      const key = JSON.stringify(normalizeForKey(item, true));
      let stack = sellStackMap.get(key);
      if (!stack) {
        stack = { item, qty: 0, entries: [] };
        sellStackMap.set(key, stack);
        sellStacks.push(stack);
      }
      const quantity = Math.max(1, Number.isFinite(item?.count) ? item.count : 1);
      stack.qty += quantity;
      stack.entries.push({ idx, item });
    });

    const compareStacks = (a, b) => {
      const typeA = (a?.item?.type || '').toString().toLowerCase();
      const typeB = (b?.item?.type || '').toString().toLowerCase();
      if (typeA !== typeB) return typeA.localeCompare(typeB);
      const nameA = (a?.item?.name || '').toString().toLowerCase();
      const nameB = (b?.item?.name || '').toString().toLowerCase();
      return nameA.localeCompare(nameB);
    };

    shopStacks.sort(compareStacks);
    sellStacks.sort(compareStacks);

    const takeFromShopStack = (stack) => {
      if (!stack) return;
      for (let i = 0; i < stack.entries.length; i++) {
        const entry = stack.entries[i];
        if (!entry) continue;
        const current = Math.max(1, Number.isFinite(entry?.count) ? entry.count : 1);
        if (current > 1) {
          entry.count = current - 1;
          return;
        }
        const idx = npc.shop.inv.indexOf(entry);
        if (idx !== -1) {
          npc.shop.inv.splice(idx, 1);
          return;
        }
      }
    };

    shopStacks.forEach(stack => {
      const { item, qty } = stack;
      const row = document.createElement('div');
      row.className = 'slot';
      const entry = stack.entries[0];
      let price;
      if (TraderClass?.calculatePrice) {
        price = TraderClass.calculatePrice(item, {
          entry,
          markup: baseMarkup,
          grudge: grudgeLevel
        });
      } else {
        const legacyMarkup = baseMarkup * (grudgeLevel >= 3 ? 1.1 : (grudgeLevel <= 0 ? 0.96 : 1));
        const baseValue = typeof item.value === 'number' ? item.value : 0;
        price = Math.max(1, Math.ceil(baseValue * legacyMarkup));
      }
      const name = `${item.name} x${qty}`;
      row.innerHTML = `<span>${name} - ${price} ${CURRENCY}</span><button class="btn">Buy</button>`;
      row.querySelector('button').onclick = () => {
        if (player.scrap >= price) {
          if (addToInv(item)) {
            player.scrap -= price;
            if (!npc.vending) {
              takeFromShopStack(stack);
            }
            npc.shop.grudge = 0;
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

    sellStacks.forEach(stack => {
      const { item, qty } = stack;
      const row = document.createElement('div');
      row.className = 'slot';
      let sellPrice;
      if (typeof item.scrap === 'number') {
        sellPrice = item.scrap;
      } else if (TraderClass?.resolveBaseValue && TraderClass?.basePriceFromValue) {
        const baseValue = TraderClass.resolveBaseValue(item);
        const basePrice = TraderClass.basePriceFromValue(baseValue);
        const grudgeMult = TraderClass.resolveGrudgeMultiplier ? TraderClass.resolveGrudgeMultiplier(grudgeLevel) : 1;
        const adjusted = basePrice * grudgeMult;
        sellPrice = Math.max(1, Math.round(adjusted / Math.max(1, baseMarkup * 2)));
      } else {
        const legacyMarkup = baseMarkup * (grudgeLevel >= 3 ? 1.1 : 1);
        sellPrice = Math.max(1, Math.floor((item.value || 0) / legacyMarkup));
      }
      const name = `${item.name} x${qty}`;
      row.innerHTML = `<span>${name} - ${sellPrice} ${CURRENCY}</span><button class="btn">Sell</button>`;
      row.querySelector('button').onclick = () => {
        const target = stack.entries.find(({ idx, item: invItem }) => player.inv[idx] === invItem);
        if (!target) return;
        player.scrap += sellPrice;
        const existing = npc.shop.inv.find(entry => entry?.id === item.id && Math.max(1, Number.isFinite(entry.count) ? entry.count : 1) < 256);
        if (existing) {
          const current = Math.max(1, Number.isFinite(existing.count) ? existing.count : 1);
          existing.count = Math.min(256, current + 1);
        } else {
          npc.shop.inv.push({ id: item.id, count: 1 });
        }
        removeFromInv(target.idx);
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
      npc.shop.grudge = (npc.shop.grudge || 0) + 1;
      globalThis.Dustland?.updateTradeUI?.(npc.shop);
      npc.cancelCount = (npc.cancelCount || 0) + 1;
      if (npc.cancelCount >= 2) {
        npc.tree.start.text = 'Buy or move on.';
        if (typeof toast === 'function') toast(`${npc.name} eyes you warily.`);
      }
    } else if (npc) {
      npc.cancelCount = 0;
      npc.shop.grudge = 0;
      npc.tree.start.text = 'Got goods to sell? I pay in scrap.';
      globalThis.Dustland?.updateTradeUI?.(npc.shop);
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
globalThis.Dustland.retroNpcArt = {
  isEnabled: () => retroNpcArtEnabled,
  setEnabled: setRetroNpcArt,
  getItemGlyph: () => getRetroItemSprite(),
  getItemCacheGlyph: () => getRetroItemCacheSprite()
};
globalThis.Dustland.font = {
  getScale: () => fontScale,
  setScale: (value, opts) => setFontScale(value, opts)
};

const engineExports = { log, updateHUD, renderInv, renderQuests, renderParty, footstepBump, pickupSparkle, openShop, playFX };
Object.assign(globalThis, engineExports);

// ===== Minimal Unit Tests (#test) =====
function assert(name, cond){
  if (cond) {
    log('✅ ' + name);
  } else {
    console.error('Test failed: ' + name);
  }
}
function runTests(){
  openCreator(); assert('Creator visible', creator.style.display==='flex');
  step=2; renderStep(); assert('Stat + buttons exist', ccRight.querySelectorAll('button[data-d="1"]').length>0);

  genWorld(); const hutsOK = buildings.length>0 && buildings.every(b=> b.interiorId && interiors[b.interiorId] && interiors[b.interiorId].grid); assert('Huts have interiors', hutsOK);

  if(typeof moduleTests === 'function') moduleTests(assert);
}

// ===== Input =====
  if (document.getElementById('saveBtn')) {
    const saveBtn=document.getElementById('saveBtn');
    if(saveBtn) saveBtn.onclick=()=>save();
    const loadBtn=document.getElementById('loadBtn');
    if(loadBtn) loadBtn.onclick=()=>{ load(); };
    const clearBtn=document.getElementById('clearBtn');
    if(clearBtn) clearBtn.onclick=()=>{
      if (confirm('Delete saved game?')) clearSave();
    };
    const resetBtn=document.getElementById('resetBtn');
    if(resetBtn) resetBtn.onclick=()=>{
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
  const musicBtn=document.getElementById('musicToggle');
  if(musicBtn){
    const updateMusicBtn=()=>{
      const enabled = !!globalThis.Dustland?.music?.isEnabled?.();
      musicBtn.textContent = `Music: ${enabled ? 'On' : 'Off'}`;
    };
    musicBtn.onclick=()=>{
      globalThis.Dustland?.music?.toggleEnabled?.();
      updateMusicBtn();
    };
    musicBus?.on?.('music:state', updateMusicBtn);
    updateMusicBtn();
  }
  const mobileBtn=document.getElementById('mobileToggle');
  if(mobileBtn) mobileBtn.onclick=()=>toggleMobileControls();
  const tileCharBtn=document.getElementById('tileCharToggle');
  if(tileCharBtn) tileCharBtn.onclick=()=>toggleTileChars();
  const fontScaleSlider=document.getElementById('fontScale');
  if(fontScaleSlider){
    fontScaleSlider.addEventListener('input', ()=>{
      const raw = Number.parseFloat(fontScaleSlider.value);
      setFontScale(raw);
    });
    updateFontScaleUI(fontScale);
  }
  const retroToggle=document.getElementById('retroNpcToggle');
  if(retroToggle){
    const saved = globalThis.localStorage?.getItem('retroNpcArt');
    const initial = saved === '1' || (saved !== '0' && retroToggle.checked);
    setRetroNpcArt(initial, true);
    retroToggle.checked = retroNpcArtEnabled;
    retroToggle.addEventListener('change', ()=>setRetroNpcArt(retroToggle.checked));
  } else {
    setRetroNpcArt(retroNpcArtEnabled, true);
  }
  const iconPrev=document.getElementById('playerIconPrev');
  const iconNext=document.getElementById('playerIconNext');
  const savedIcon = Number.parseInt(globalThis.localStorage?.getItem(PLAYER_ICON_STORAGE_KEY), 10);
  if(Number.isFinite(savedIcon)) setPlayerIcon(savedIcon, { skipStorage: true });
  else updatePlayerIconPreview();
  if(iconPrev) iconPrev.onclick=()=>setPlayerIcon(playerIconIndex-1);
  if(iconNext) iconNext.onclick=()=>setPlayerIcon(playerIconIndex+1);
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
  const debugBtn=document.getElementById('debugBtn');
  const debugMenu=document.getElementById('debugMenu');
  if(debugBtn && debugMenu){
    const debugClose=document.getElementById('debugClose');
    const hideDebug=()=>{ debugMenu.style.display='none'; };
    const showDebug=()=>{ debugMenu.style.display='flex'; };
    debugBtn.onclick=showDebug;
    debugClose?.addEventListener('click', hideDebug);
    const attachHide=(btn)=>{ btn?.addEventListener('click', hideDebug); };
    attachHide(document.getElementById('fxBtn'));
    attachHide(document.getElementById('perfBtn'));
    const exportBtn=document.getElementById('exportSaveBtn');
    if(exportBtn){
      exportBtn.addEventListener('click', ()=>{
        if(typeof save === 'function') save();
        const dataStr = globalThis.localStorage?.getItem('dustland_crt');
        if(!dataStr){
          const msg='No save data available to export.';
          console.warn(msg);
          globalThis.alert?.(msg);
          return;
        }
        if(typeof Blob === 'undefined' || !globalThis.URL?.createObjectURL){
          const msg='Export not supported in this environment.';
          console.warn(msg);
          globalThis.alert?.(msg);
          return;
        }
        try{
          const blob=new Blob([dataStr],{ type:'application/json' });
          const url=globalThis.URL.createObjectURL(blob);
          const link=document.createElement('a');
          const stamp=new Date().toISOString().replace(/[:]/g,'-');
          link.href=url;
          link.download=`dustland-save-${stamp}.json`;
          document.body.appendChild(link);
          if(typeof link.click==='function') link.click();
          else link.dispatchEvent?.({ type:'click' });
          link.remove();
          globalThis.URL.revokeObjectURL?.(url);
          hideDebug();
          log('Save exported.');
          if(typeof toast === 'function') toast('Save exported.');
        }catch(err){
          console.error('Failed to export save', err);
          const msg='Failed to export save.';
          globalThis.alert?.(msg);
        }
      });
    }
    const importBtn=document.getElementById('importSaveBtn');
    const importInput=document.getElementById('importSaveInput');
    if(importBtn && importInput){
      importBtn.addEventListener('click', ()=>{
        importInput.value='';
        if(typeof importInput.click==='function') importInput.click();
        else importInput.dispatchEvent?.({ type:'click' });
      });
      importInput.addEventListener('change', ()=>{
        const file=importInput.files?.[0];
        if(!file) return;
        if(typeof FileReader === 'undefined'){
          const msg='Import not supported in this environment.';
          console.warn(msg);
          globalThis.alert?.(msg);
          return;
        }
        const reader=new FileReader();
        reader.onerror=()=>{
          console.error('Failed to read save file', reader.error);
          const msg='Failed to read save file.';
          globalThis.alert?.(msg);
        };
        reader.onload=()=>{
          try{
            const text=typeof reader.result==='string'?reader.result:String(reader.result||'');
            const parsed=JSON.parse(text);
            if(typeof parsed!=='object' || !parsed){
              throw new Error('Invalid save payload');
            }
            globalThis.localStorage?.setItem('dustland_crt', JSON.stringify(parsed));
            hideDebug();
            if(typeof load === 'function') load();
            log('Save imported.');
            if(typeof toast === 'function') toast('Save imported.');
          }catch(err){
            console.error('Failed to import save', err);
            const msg='Failed to import save. Ensure the file is a valid Dustland save.';
            globalThis.alert?.(msg);
          }
        };
        reader.readAsText(file);
      });
    }
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
      case ' ': case 'Spacebar':
        e.preventDefault();
        interact();
        break;
      case 'e': case 'E':
        interact();
        break;
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
          if (typeof globalThis.renderInv === 'function') globalThis.renderInv();
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
  } else if (!isAck && !globalThis.modulePickerPending) {
    const saveStr = globalThis.localStorage?.getItem('dustland_crt');
    if (saveStr) {
      showStart();
    } else {
      openCreator();
    }
  }
}

