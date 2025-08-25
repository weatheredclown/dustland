// Splash screen allowing the player to pick a module.
// Displays a pulsing title and swirling dust background with drifting particles.
const MODULES = [
  { id: 'dustland', name: 'Dustland', file: 'modules/dustland.module.js' },
  { id: 'echoes', name: 'Echoes', file: 'modules/echoes.module.js' },
  { id: 'office', name: 'Office', file: 'modules/office.module.js' },
  { id: 'broadcast1', name: 'Broadcast Fragment 1', file: 'modules/broadcast-fragment-1.module.js' },
  { id: 'broadcast2', name: 'Broadcast Fragment 2', file: 'modules/broadcast-fragment-2.module.js' },
  { id: 'broadcast3', name: 'Broadcast Fragment 3', file: 'modules/broadcast-fragment-3.module.js' },
  { id: 'mara', name: 'Mara Puzzle', file: 'modules/mara-puzzle.module.js' },
  { id: 'golden', name: 'Golden Sample', file: 'modules/golden.module.json' }
];

const realOpenCreator = window.openCreator;
const realShowStart = window.showStart;
const realResetAll = window.resetAll;
window.openCreator = () => {};
window.showStart = () => {};
window.resetAll = () => {};

function startDust(canvas){
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
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    particles.forEach(p => {
      p.life--;
      if(p.life <= 0 || p.x < -p.size || p.x > canvas.width + p.size || p.y < -p.size || p.y > canvas.height + p.size){
        spawn(p);
        ctx.fillRect(p.x,p.y,p.size,p.size);
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
      ctx.fillRect(p.x,p.y,p.size,p.size);
    });
    requestAnimationFrame(update);
  }
  update();
  return { particles, update };
}

function loadModule(moduleInfo){
  const existingScript = document.getElementById('activeModuleScript');
  if (existingScript) existingScript.remove();
  if (moduleInfo.file.endsWith('.json')) {
    window.location.href = `dustland.html?ack-player=1&module=${encodeURIComponent(moduleInfo.file)}`;
    return;
  }
  const script = document.createElement('script');
  script.id = 'activeModuleScript';
  script.src = `${moduleInfo.file}?_=${Date.now()}`;
  script.onload = () => {
    const picker = document.getElementById('modulePicker');
    if(picker) picker.remove();
    window.openCreator = realOpenCreator;
    window.showStart = realShowStart;
    window.resetAll = () => { realResetAll(); loadModule(moduleInfo); };
    localStorage.removeItem('dustland_crt');
    openCreator();
  };
  document.body.appendChild(script);
}

function showModulePicker(){
  const overlay = document.createElement('div');
  overlay.id = 'modulePicker';
  overlay.style = 'position:fixed;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;z-index:40';
  const styleTag = document.createElement('style');
  styleTag.textContent = '@keyframes pulse{0%,100%{opacity:.8}50%{opacity:1}}';
  document.head.appendChild(styleTag);

  const ackBtn = document.createElement('div');
  ackBtn.id = 'ackGlyph';
  ackBtn.textContent = '✎';
  ackBtn.title = 'Adventure Kit';
  ackBtn.style = 'position:absolute;top:10px;right:10px;z-index:1;color:#0f0;font-size:24px;cursor:pointer';
  ackBtn.onclick = () => { window.location.href = 'adventure-kit.html'; };
  overlay.appendChild(ackBtn);

  const canvas = document.createElement('canvas');
  canvas.id = 'dustParticles';
  // Background dust layer; z-index keeps UI elements in front.
  canvas.style = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0';
  overlay.appendChild(canvas);
  startDust(canvas);

  const title = document.createElement('div');
  title.id = 'gameTitle';
  title.textContent = 'Dustland CRT';
  title.style = 'position:relative;z-index:1;color:#0f0;text-shadow:0 0 10px #0f0;font-size:32px;margin-bottom:20px;animation:pulse 2s infinite';
  overlay.appendChild(title);

  const win = document.createElement('div');
  win.className = 'win';
  win.style = 'position:relative;z-index:1;width:min(420px,92vw);background:#0b0d0b;border:1px solid #2a382a;border-radius:12px;box-shadow:0 20px 80px rgba(0,0,0,.7);overflow:hidden';
  win.innerHTML = '<header style="padding:10px 12px;border-bottom:1px solid #223022;font-weight:700">Select Module</header><main style="padding:12px" id="moduleButtons"></main>';
  overlay.appendChild(win);
  document.body.appendChild(overlay);
  const buttonContainer = overlay.querySelector('#moduleButtons');
  MODULES.forEach(moduleInfo => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = moduleInfo.name;
    btn.style.display = 'block';
    btn.style.margin = '4px 0';
    btn.onclick = () => loadModule(moduleInfo);
    buttonContainer.appendChild(btn);
  });
}

showModulePicker();
