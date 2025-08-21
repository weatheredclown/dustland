// Splash screen allowing the player to pick a module.
// Displays a pulsing title and drifting dust background.
const MODULES = [
  { id: 'dustland', name: 'Dustland', file: 'modules/dustland.module.js' },
  { id: 'echoes', name: 'Echoes', file: 'modules/echoes.module.js' },
  { id: 'office', name: 'Office', file: 'modules/office.module.js' },
  { id: 'golden', name: 'Golden Sample', file: 'modules/golden.module.json' }
];

const realOpenCreator = window.openCreator;
const realShowStart = window.showStart;
window.openCreator = () => {};
window.showStart = () => {};

function startDust(canvas){
  const ctx = canvas.getContext('2d');
  const particles = [];
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  for(let i=0;i<60;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      size: Math.random()*2+1,
      speed: Math.random()*0.5+0.2
    });
  }
  function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    particles.forEach(p => {
      ctx.fillRect(p.x,p.y,p.size,p.size);
      p.x -= p.speed;
      if(p.x < -p.size){
        p.x = canvas.width + p.size;
        p.y = Math.random()*canvas.height;
      }
    });
    requestAnimationFrame(update);
  }
  update();
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
    const savedGame = localStorage.getItem('dustland_crt');
    if(savedGame){
      showStart();
    } else {
      openCreator();
    }
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

  const canvas = document.createElement('canvas');
  canvas.id = 'dustParticles';
  canvas.style = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  overlay.appendChild(canvas);
  startDust(canvas);

  const title = document.createElement('div');
  title.id = 'gameTitle';
  title.textContent = 'Dustland CRT';
  title.style = 'color:#0f0;text-shadow:0 0 10px #0f0;font-size:32px;margin-bottom:20px;animation:pulse 2s infinite';
  overlay.appendChild(title);

  const win = document.createElement('div');
  win.className = 'win';
  win.style = 'width:min(420px,92vw);background:#0b0d0b;border:1px solid #2a382a;border-radius:12px;box-shadow:0 20px 80px rgba(0,0,0,.7);overflow:hidden';
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
