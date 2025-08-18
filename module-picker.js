const MODULES = [
  { id: 'dustland', name: 'Dustland', file: 'modules/dustland.module.js' },
  { id: 'echoes', name: 'Echoes', file: 'modules/echoes.module.js' },
  { id: 'office', name: 'Office', file: 'modules/office.module.js' }
];

function loadModule(mod){
  const s = document.createElement('script');
  s.src = mod.file;
  s.onload = () => {
    const picker = document.getElementById('modulePicker');
    if(picker) picker.remove();
    window.openCreator = window._realOpenCreator;
    window.showStart = window._realShowStart;
    const saveStr = localStorage.getItem('dustland_crt');
    if(saveStr){
      showStart();
    } else {
      openCreator();
    }
  };
  document.body.appendChild(s);
}

function showModulePicker(){
  const overlay = document.createElement('div');
  overlay.id = 'modulePicker';
  overlay.style = 'position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:40';
  overlay.innerHTML = `<div class="win" style="width:min(420px,92vw);background:#0b0d0b;border:1px solid #2a382a;border-radius:12px;box-shadow:0 20px 80px rgba(0,0,0,.7);overflow:hidden"><header style="padding:10px 12px;border-bottom:1px solid #223022;font-weight:700">Select Module</header><main style="padding:12px" id="moduleButtons"></main></div>`;
  document.body.appendChild(overlay);
  const btnWrap = overlay.querySelector('#moduleButtons');
  MODULES.forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = m.name;
    btn.style.display = 'block';
    btn.style.margin = '4px 0';
    btn.onclick = () => loadModule(m);
    btnWrap.appendChild(btn);
  });
}

showModulePicker();
