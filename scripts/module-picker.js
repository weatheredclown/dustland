// Splash screen allowing the player to pick a module.
// Displays a pulsing title and swirling dust background with drifting particles.
const MODULES = [
  { id: 'dustland', name: 'Dustland', file: 'modules/dustland.module.js' },
  { id: 'office', name: 'Office', file: 'modules/office.module.js' },
  { id: 'lootbox-demo', name: 'Loot Box Demo', file: 'modules/lootbox-demo.module.js' },
  { id: 'broadcast', name: 'Broadcast Story', file: 'modules/broadcast-fragment-1.module.js' },
  { id: 'pit', name: 'PIT.BAS', file: 'modules/pit-bas.module.js' },
  { id: 'other', name: 'OTHER.BAS', file: 'modules/other-bas.module.js' },
  { id: 'two-worlds', name: 'Two Worlds', file: 'modules/two-worlds.module.js' },
  { id: 'true-dust', name: 'True Dust', file: 'modules/true-dust.module.js' },
  { id: 'golden', name: 'Golden Sample', file: 'modules/golden.module.json' },
  { id: 'edge', name: 'bunker-trainer-workshop', file: 'modules/edge.module.js' },
  { id: 'cli-demo', name: 'CLI Demo Adventure', file: 'modules/cli-demo.module.js' },
];

const NET_FLAG = '__fromNet';
const pickerBus = globalThis.EventBus;
const mpBridge = globalThis.Dustland?.multiplayerBridge;
let sessionRole = null;
try {
  sessionRole = globalThis.sessionStorage?.getItem?.('dustland.multiplayerRole') || null;
} catch (err) {
  sessionRole = null;
}
const isClient = sessionRole === 'client';

function disconnectClient(){
  try {
    globalThis.Dustland?.multiplayer?.disconnect?.('client');
  } catch (err) {
    /* ignore */
  }
  try {
    globalThis.sessionStorage?.removeItem?.('dustland.multiplayerRole');
  } catch (err) {
    /* ignore */
  }
  try {
    window.location.href = 'dustland.html';
  } catch (err) {
    /* ignore */
  }
}

const realOpenCreator = window.openCreator;
const realShowStart = window.showStart;
const realResetAll = window.resetAll;
window.openCreator = () => {};
window.showStart = () => {};
window.resetAll = () => {};
const loadBtn = document.getElementById('loadBtn');
if (loadBtn) UI.hide('loadBtn');

function startDust(canvas, getScale = () => 1){
  const ctx = canvas.getContext('2d');
  const particles = [];
  const attractors = [{ angle: 0 }, { angle: Math.PI }];
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  // Reset a particle with a new lifetime and entry point at the screen edge.
  function spawn(p){
    p.life = Math.random()*100 + 200;
    p.size = Math.random()*2 + 1;
    p.speed = Math.random()*0.5 + 0.2;
    const side = Math.floor(Math.random()*4);
    if(side === 0){
      p.x = 0;
      p.y = Math.random()*canvas.height;
      p.vx = Math.random()*1 + 0.5;
      p.vy = (Math.random()*2 - 1)*0.5;
    } else if(side === 1){
      p.x = canvas.width;
      p.y = Math.random()*canvas.height;
      p.vx = -(Math.random()*1 + 0.5);
      p.vy = (Math.random()*2 - 1)*0.5;
    } else if(side === 2){
      p.x = Math.random()*canvas.width;
      p.y = 0;
      p.vx = (Math.random()*2 - 1)*0.5;
      p.vy = Math.random()*1 + 0.5;
    } else {
      p.x = Math.random()*canvas.width;
      p.y = canvas.height;
      p.vx = (Math.random()*2 - 1)*0.5;
      p.vy = -(Math.random()*1 + 0.5);
    }
  }
  for(let i=0;i<60;i++){
    const p = { x: 0, y: 0, vx: 0, vy: 0 };
    spawn(p);
    particles.push(p);
  }
  function update(){
    const cx = canvas.width/2;
    const cy = canvas.height/2;
    const radius = Math.min(canvas.width,canvas.height)/3;
    attractors.forEach((a,i) => {
      a.angle += 0.01 + i*0.005;
      a.x = cx + Math.cos(a.angle)*radius;
      a.y = cy + Math.sin(a.angle)*radius;
    });
    const scale = getScale();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    particles.forEach(p => {
      p.life--;
      if(p.life <= 0 || p.x < -p.size*scale || p.x > canvas.width + p.size*scale || p.y < -p.size*scale || p.y > canvas.height + p.size*scale){
        spawn(p);
        ctx.fillRect(p.x,p.y,p.size*scale,p.size*scale);
        return;
      }
      attractors.forEach(a => {
        const dx = a.x - p.x;
        const dy = a.y - p.y;
        const dist = Math.hypot(dx,dy) || 1;
        const force = 0.05;
        p.vx += (dx/dist)*force + (-dy/dist)*force*0.5;
        p.vy += (dy/dist)*force + (dx/dist)*force*0.5;
      });
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx - p.speed;
      p.y += p.vy;
      ctx.fillRect(p.x,p.y,p.size*scale,p.size*scale);
    });
    requestAnimationFrame(update);
  }
  update();
  return { particles, update };
}

function broadcastModuleSelection(moduleInfo){
  if (!moduleInfo || !pickerBus?.emit) return;
  const payload = {
    moduleId: moduleInfo.id,
    moduleName: moduleInfo.name,
    moduleFile: moduleInfo.file
  };
  try {
    pickerBus.emit('module-picker:select', payload);
  } catch (err) {
    /* ignore */
  }
  try {
    mpBridge?.publish?.('module-picker:select', payload);
  } catch (err) {
    /* ignore */
  }
}

function loadModule(moduleInfo){
  const existingScript = document.getElementById('activeModuleScript');
  if (existingScript) existingScript.remove();
  window.seedWorldContent = () => {};
  window.startGame = () => {};
  if (moduleInfo.file.endsWith('.json')) {
    window.location.href = `dustland.html?ack-player=1&module=${encodeURIComponent(moduleInfo.file)}`;
    return;
  }
  const script = document.createElement('script');
  script.id = 'activeModuleScript';
  script.src = `${moduleInfo.file}?_=${Date.now()}`;
  script.onload = () => {
    UI.remove('modulePicker');
    window.openCreator = realOpenCreator;
    window.showStart = realShowStart;
    window.resetAll = () => {
      // Prevent stale modules from launching before the new one loads
      window.openCreator = () => {};
      realResetAll();
      loadModule(moduleInfo);
    };
    if (loadBtn) UI.show('loadBtn');
    globalThis.modulePickerPending = false;
    if (typeof warnOnUnload === 'function') warnOnUnload();
    openCreator();
  };
  document.body.appendChild(script);
}

function showModulePicker(){
  const overlay = document.createElement('div');
  overlay.id = 'modulePicker';
  overlay.style = 'position:fixed;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;z-index:40';
  const styleTag = document.createElement('style');
  styleTag.textContent = '@keyframes pulse{0%,100%{opacity:.8}50%{opacity:1}}.btn.selected{border-color:#4f6b4f;background:#151b15}';
  document.head.appendChild(styleTag);

  const ackBtn = document.createElement('div');
  ackBtn.id = 'ackGlyph';
  ackBtn.textContent = '✎';
  ackBtn.title = 'Adventure Kit';
  ackBtn.style = 'position:absolute;top:10px;right:10px;z-index:1;color:#0f0;font-size:1.5rem;cursor:pointer';
  ackBtn.onclick = () => { window.location.href = 'adventure-kit.html'; };
  overlay.appendChild(ackBtn);

  const mpBtn = document.createElement('div');
  mpBtn.id = 'mpGlyph';
  mpBtn.textContent = '⇆';
  mpBtn.title = 'Multiplayer';
  mpBtn.style = 'position:absolute;top:44px;right:10px;z-index:1;color:#0f0;font-size:1.5rem;cursor:pointer';
  mpBtn.onclick = () => { window.location.href = 'multiplayer.html'; };
  overlay.appendChild(mpBtn);

  const canvas = document.createElement('canvas');
  canvas.id = 'dustParticles';
  // Background dust layer; z-index keeps UI elements in front.
  canvas.style = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0';
  overlay.appendChild(canvas);

  const title = document.createElement('div');
  title.id = 'gameTitle';
  title.textContent = 'Dustland CRT';
  title.style = 'position:relative;z-index:1;color:#0f0;text-shadow:0 0 10px #0f0;font-size:2rem;margin-bottom:20px;animation:pulse 2s infinite';

  const win = document.createElement('div');
  win.className = 'win';
  win.style = 'position:relative;z-index:1;width:min(420px,92vw);background:#0b0d0b;border:1px solid #2a382a;border-radius:12px;box-shadow:0 20px 80px rgba(0,0,0,.7);overflow:hidden';
  win.innerHTML = '<header style="padding:10px 12px;border-bottom:1px solid #223022;font-weight:700">Select Module</header><main style="padding:12px" id="moduleButtons"></main>';

  const uiBox = document.createElement('div');
  uiBox.style = 'position:absolute;top:50%;left:50%;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%) scale(1);';
  uiBox.appendChild(title);
  uiBox.appendChild(win);
  overlay.appendChild(uiBox);
  document.body.appendChild(overlay);

  let uiScale = 1;
  function applyScale(){
    const small = Math.min(window.innerWidth, window.innerHeight);
    uiScale = Math.max(1, small/600);
    uiBox.style.transform = `translate(-50%,-50%) scale(${uiScale})`;
    title.style.marginBottom = `${20 * uiScale}px`;
  }
  applyScale();
  window.addEventListener('resize', applyScale);
  startDust(canvas, () => uiScale);

  const buttonContainer = overlay.querySelector('#moduleButtons');
  const buttons = [];
  let selectedIndex = isClient ? -1 : 0;

  function pickModule(moduleInfo){
    if (!moduleInfo) return;
    const idx = MODULES.indexOf(moduleInfo);
    if (idx >= 0) {
      selectedIndex = idx;
      updateSelected();
    }
    broadcastModuleSelection(moduleInfo);
    if (!isClient) loadModule(moduleInfo);
  }

  function updateSelected() {
    buttons.forEach((btn, i) => {
      if (i === selectedIndex) {
        btn.className = 'btn selected';
        if (btn.focus) btn.focus();
        btn.scrollIntoView?.({ block: 'nearest' });
      } else {
        btn.className = 'btn';
      }
    });
  }
  MODULES.forEach((moduleInfo, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = moduleInfo.name;
    btn.style.display = 'block';
    btn.style.margin = '4px 0';
    if (isClient) {
      btn.disabled = true;
      btn.style.cursor = 'not-allowed';
      btn.style.opacity = '0.65';
    } else {
      btn.onclick = () => pickModule(moduleInfo);
    }
    btn.onfocus = () => { selectedIndex = i; updateSelected(); };
    buttons.push(btn);
    buttonContainer.appendChild(btn);
  });
  const btnHeight = buttons[0]?.offsetHeight || 32;
  buttonContainer.style.maxHeight = `${(btnHeight + 8) * 5}px`;
  buttonContainer.style.overflowY = 'auto';
  updateSelected();

  overlay.tabIndex = 0;
  if (overlay.focus) overlay.focus();
  if (!isClient) {
    const keyHandler = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % buttons.length;
        updateSelected();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;
        updateSelected();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        pickModule(MODULES[selectedIndex]);
      }
    };
    if (overlay.addEventListener) overlay.addEventListener('keydown', keyHandler);
  }

  if (pickerBus?.on) {
    pickerBus.on('module-picker:select', payload => {
      if (!payload) return;
      const moduleInfo = MODULES.find(m => m.id === payload.moduleId) ||
        MODULES.find(m => m.file === payload.moduleFile);
      if (!moduleInfo) return;
      const idx = MODULES.indexOf(moduleInfo);
      if (idx >= 0) {
        selectedIndex = idx;
        updateSelected();
      }
      if (isClient && payload[NET_FLAG]) {
        loadModule(moduleInfo);
      }
    });
  }

  if (mpBridge?.subscribe && pickerBus?.emit) {
    mpBridge.subscribe('module-picker:select', payload => {
      let message = payload;
      if (payload && typeof payload === 'object') {
        message = { ...payload, [NET_FLAG]: true };
      }
      try {
        pickerBus.emit('module-picker:select', message);
      } catch (err) {
        /* ignore */
      }
    });
  }

  if (isClient) {
    const waitingNotice = document.createElement('div');
    waitingNotice.style = 'position:relative;z-index:1;margin-top:14px;text-align:center;color:#8fa48f;';
    waitingNotice.textContent = 'Waiting for the host to pick a module.';
    uiBox.appendChild(waitingNotice);

    const actionRow = document.createElement('div');
    actionRow.style = 'position:relative;z-index:1;margin-top:8px;text-align:center;';
    const leaveBtn = document.createElement('button');
    leaveBtn.id = 'leaveMultiplayer';
    leaveBtn.className = 'btn';
    leaveBtn.textContent = 'Leave Multiplayer';
    leaveBtn.onclick = disconnectClient;
    actionRow.appendChild(leaveBtn);
    uiBox.appendChild(actionRow);
  }
}

showModulePicker();
