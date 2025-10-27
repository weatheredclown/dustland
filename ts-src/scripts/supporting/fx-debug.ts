(function(){
  type FxConfig = {
    enabled?: boolean;
    prevAlpha: number;
    sceneAlpha: number;
    offsetX: number;
    offsetY: number;
    damageFlash?: boolean;
    scanlines?: boolean;
    crtShear?: boolean;
    colorBleed?: boolean;
    footstepBump?: boolean;
    grayscale?: boolean;
    adrenalineTint?: boolean;
  };

  type FxGlobals = typeof globalThis & {
    fxConfig?: FxConfig;
    updateHUD?: () => void;
  };

  const fxGlobals = globalThis as FxGlobals;

  const panel = document.getElementById('fxPanel') as HTMLElement | null;
  const openBtn = document.getElementById('fxBtn') as HTMLButtonElement | null;
  const closeBtn = document.getElementById('fxClose') as HTMLButtonElement | null;
  const prevAlpha = document.getElementById('fxPrevAlpha') as HTMLInputElement | null;
  const sceneAlpha = document.getElementById('fxSceneAlpha') as HTMLInputElement | null;
  const offsetX = document.getElementById('fxOffsetX') as HTMLInputElement | null;
  const offsetY = document.getElementById('fxOffsetY') as HTMLInputElement | null;
  const enabled = document.getElementById('fxEnabled') as HTMLInputElement | null;
  const dmgFlash = document.getElementById('fxDamageFlash') as HTMLInputElement | null;
  const scanlines = document.getElementById('fxScanlines') as HTMLInputElement | null;
  const shear = document.getElementById('fxCrtShear') as HTMLInputElement | null;
  const colorBleed = document.getElementById('fxColorBleed') as HTMLInputElement | null;
  const footstepBump = document.getElementById('fxFootstepBump') as HTMLInputElement | null;
  const grayscale = document.getElementById('fxGrayscale') as HTMLInputElement | null;
  const adrTint = document.getElementById('fxAdrTint') as HTMLInputElement | null;
  const canvas = document.getElementById('game') as HTMLCanvasElement | null;

  let shearTimer: ReturnType<typeof setTimeout> | null = null;

  function unrefTimer(timer: ReturnType<typeof setTimeout> | null){
    if (timer == null) return;
    const handle = timer as unknown as { unref?: () => void };
    handle.unref?.();
  }

  function stopShear(){
    if (shearTimer != null) {
      clearTimeout(shearTimer);
    }
    shearTimer = null;
    canvas?.classList.remove('shear');
  }

  function startShear(){
    if(shearTimer || !canvas) return;
    function warp(){
      canvas.classList.add('shear');
      const startTimer = setTimeout(() => {
        canvas.classList.remove('shear');
        const delay = 2000 + Math.random() * 3000;
        shearTimer = setTimeout(warp, delay);
        unrefTimer(shearTimer);
      }, 100);
      unrefTimer(startTimer);
    }
    warp();
  }

  function applyFx(){
    const fx = fxGlobals.fxConfig;
    if(!canvas || !fx) return;
    canvas.classList.toggle('scanlines', !!fx.scanlines);
    canvas.classList.toggle('color-bleed', !!fx.colorBleed);
    if(fx.crtShear){
      startShear();
    }else{
      stopShear();
    }
    fxGlobals.updateHUD?.();
  }

  function sync(){
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    if(prevAlpha) prevAlpha.value = String(fx.prevAlpha ?? '');
    if(sceneAlpha) sceneAlpha.value = String(fx.sceneAlpha ?? '');
    if(offsetX) offsetX.value = String(fx.offsetX ?? '');
    if(offsetY) offsetY.value = String(fx.offsetY ?? '');
    if(enabled) enabled.checked = fx.enabled !== false;
    if(dmgFlash) dmgFlash.checked = fx.damageFlash !== false;
    if(scanlines) scanlines.checked = !!fx.scanlines;
    if(shear) shear.checked = !!fx.crtShear;
    if(colorBleed) colorBleed.checked = !!fx.colorBleed;
    if(footstepBump) footstepBump.checked = !!fx.footstepBump;
    if(grayscale) grayscale.checked = !!fx.grayscale;
    if(adrTint) adrTint.checked = fx.adrenalineTint !== false;
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

  prevAlpha?.addEventListener('input', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.prevAlpha = Number.parseFloat(target.value);
  });
  sceneAlpha?.addEventListener('input', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.sceneAlpha = Number.parseFloat(target.value);
  });
  offsetX?.addEventListener('input', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.offsetX = Number.parseInt(target.value, 10) || 0;
  });
  offsetY?.addEventListener('input', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.offsetY = Number.parseInt(target.value, 10) || 0;
  });
  enabled?.addEventListener('change', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.enabled = target.checked;
  });
  dmgFlash?.addEventListener('change', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.damageFlash = target.checked;
    if(!target.checked) document.getElementById('hpBar')?.classList.remove('hurt');
  });
  scanlines?.addEventListener('change', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.scanlines = target.checked;
    applyFx();
  });
  shear?.addEventListener('change', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.crtShear = target.checked;
    applyFx();
  });
  colorBleed?.addEventListener('change', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.colorBleed = target.checked;
    applyFx();
  });
  footstepBump?.addEventListener('change', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.footstepBump = target.checked;
  });
  grayscale?.addEventListener('change', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.grayscale = target.checked;
    fxGlobals.updateHUD?.();
  });
  adrTint?.addEventListener('change', e => {
    const fx = fxGlobals.fxConfig;
    if(!fx) return;
    const target = e.currentTarget as HTMLInputElement;
    fx.adrenalineTint = target.checked;
    fxGlobals.updateHUD?.();
  });

  const dragHandle = panel?.querySelector('header') as HTMLElement | null;
  let dragX = 0;
  let dragY = 0;
  function startDrag(e: MouseEvent){
    if(!panel) return;
    dragX = e.clientX - panel.offsetLeft;
    dragY = e.clientY - panel.offsetTop;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    e.preventDefault();
  }
  function onDrag(e: MouseEvent){
    if(!panel) return;
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
