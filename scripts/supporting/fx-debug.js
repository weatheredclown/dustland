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
  const scanlines = document.getElementById('fxScanlines');
  const shear = document.getElementById('fxCrtShear');
  const colorBleed = document.getElementById('fxColorBleed');
  const grayscale = document.getElementById('fxGrayscale');
  const adrTint = document.getElementById('fxAdrTint');
  const canvas = document.getElementById('game');

  let shearTimer;

  function stopShear(){
    clearTimeout(shearTimer);
    shearTimer = null;
    canvas?.classList.remove('shear');
  }

  function startShear(){
    if(shearTimer || !canvas) return;
    function warp(){
      canvas.classList.add('shear');
      setTimeout(() => {
        canvas.classList.remove('shear');
        const delay = 2000 + Math.random() * 3000;
        shearTimer = setTimeout(warp, delay);
        shearTimer.unref?.();
      }, 100).unref?.();
    }
    warp();
  }

  function applyFx(){
    if(!canvas || !globalThis.fxConfig) return;
    canvas.classList.toggle('scanlines', !!globalThis.fxConfig.scanlines);
    canvas.classList.toggle('color-bleed', !!globalThis.fxConfig.colorBleed);
    if(globalThis.fxConfig.crtShear){
      startShear();
    }else{
      stopShear();
    }
    globalThis.updateHUD?.();
  }

  function sync(){
    if(!globalThis.fxConfig) return;
    prevAlpha.value = globalThis.fxConfig.prevAlpha;
    sceneAlpha.value = globalThis.fxConfig.sceneAlpha;
    offsetX.value = globalThis.fxConfig.offsetX;
    offsetY.value = globalThis.fxConfig.offsetY;
    enabled.checked = globalThis.fxConfig.enabled !== false;
    dmgFlash.checked = globalThis.fxConfig.damageFlash !== false;
    if(scanlines) scanlines.checked = !!globalThis.fxConfig.scanlines;
    if(shear) shear.checked = !!globalThis.fxConfig.crtShear;
    if(colorBleed) colorBleed.checked = !!globalThis.fxConfig.colorBleed;
    if(grayscale) grayscale.checked = !!globalThis.fxConfig.grayscale;
    if(adrTint) adrTint.checked = globalThis.fxConfig.adrenalineTint !== false;
    applyFx();
  }

  function show(){
    sync();
    if(panel) panel.style.display = 'block';
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
  enabled?.addEventListener('change', e => globalThis.fxConfig.enabled = e.target.checked);
  dmgFlash?.addEventListener('change', e => {
    globalThis.fxConfig.damageFlash = e.target.checked;
    if(!e.target.checked) document.getElementById('hpBar')?.classList.remove('hurt');
  });
  scanlines?.addEventListener('change', e => { globalThis.fxConfig.scanlines = e.target.checked; applyFx(); });
  shear?.addEventListener('change', e => { globalThis.fxConfig.crtShear = e.target.checked; applyFx(); });
  colorBleed?.addEventListener('change', e => { globalThis.fxConfig.colorBleed = e.target.checked; applyFx(); });
  grayscale?.addEventListener('change', e => { globalThis.fxConfig.grayscale = e.target.checked; globalThis.updateHUD?.(); });
  adrTint?.addEventListener('change', e => { globalThis.fxConfig.adrenalineTint = e.target.checked; globalThis.updateHUD?.(); });

  const dragHandle = panel?.querySelector('header');
  let dragX = 0;
  let dragY = 0;
  function startDrag(e){
    dragX = e.clientX - panel.offsetLeft;
    dragY = e.clientY - panel.offsetTop;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    e.preventDefault();
  }
  function onDrag(e){
    panel.style.left = (e.clientX - dragX) + 'px';
    panel.style.top = (e.clientY - dragY) + 'px';
  }
  function endDrag(){
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
  }
  dragHandle?.addEventListener('mousedown', startDrag);
  applyFx();
})();
