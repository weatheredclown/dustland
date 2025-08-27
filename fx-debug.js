(function(){
  const panel = document.getElementById('fxPanel');
  const openBtn = document.getElementById('fxBtn');
  const closeBtn = document.getElementById('fxClose');
  const prevAlpha = document.getElementById('fxPrevAlpha');
  const sceneAlpha = document.getElementById('fxSceneAlpha');
  const offsetX = document.getElementById('fxOffsetX');
  const offsetY = document.getElementById('fxOffsetY');
  const enabled = document.getElementById('fxEnabled');
  const dmgFlash = document.getElementById('fxDamageFlash');

  function sync(){
    if(!globalThis.fxConfig) return;
    prevAlpha.value = globalThis.fxConfig.prevAlpha;
    sceneAlpha.value = globalThis.fxConfig.sceneAlpha;
    offsetX.value = globalThis.fxConfig.offsetX;
    offsetY.value = globalThis.fxConfig.offsetY;
    enabled.checked = globalThis.fxConfig.enabled !== false;
    dmgFlash.checked = globalThis.fxConfig.damageFlash !== false;
  }

  function show(){
    sync();
    if(panel) panel.style.display = 'flex';
  }

  function hide(){
    if(panel) panel.style.display = 'none';
  }

  openBtn?.addEventListener('click', show);
  closeBtn?.addEventListener('click', hide);

  prevAlpha?.addEventListener('input', e => globalThis.fxConfig.prevAlpha = parseFloat(e.target.value));
  sceneAlpha?.addEventListener('input', e => globalThis.fxConfig.sceneAlpha = parseFloat(e.target.value));
  offsetX?.addEventListener('input', e => globalThis.fxConfig.offsetX = parseInt(e.target.value, 10) || 0);
  offsetY?.addEventListener('input', e => globalThis.fxConfig.offsetY = parseInt(e.target.value, 10) || 0);
  enabled?.addEventListener('input', e => globalThis.fxConfig.enabled = e.target.checked);
  dmgFlash?.addEventListener('input', e => {
    globalThis.fxConfig.damageFlash = e.target.checked;
    if(!e.target.checked) document.getElementById('hpBar')?.classList.remove('hurt');
  });
})();
