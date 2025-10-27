(function () {
    const fxGlobals = globalThis;
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
    const footstepBump = document.getElementById('fxFootstepBump');
    const grayscale = document.getElementById('fxGrayscale');
    const adrTint = document.getElementById('fxAdrTint');
    const canvas = document.getElementById('game');
    let shearTimer = null;
    function unrefTimer(timer) {
        if (timer == null)
            return;
        const handle = timer;
        handle.unref?.();
    }
    function stopShear() {
        if (shearTimer != null) {
            clearTimeout(shearTimer);
        }
        shearTimer = null;
        canvas?.classList.remove('shear');
    }
    function startShear() {
        if (shearTimer || !canvas)
            return;
        function warp() {
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
    function applyFx() {
        const fx = fxGlobals.fxConfig;
        if (!canvas || !fx)
            return;
        canvas.classList.toggle('scanlines', !!fx.scanlines);
        canvas.classList.toggle('color-bleed', !!fx.colorBleed);
        if (fx.crtShear) {
            startShear();
        }
        else {
            stopShear();
        }
        fxGlobals.updateHUD?.();
    }
    function sync() {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        if (prevAlpha)
            prevAlpha.value = String(fx.prevAlpha ?? '');
        if (sceneAlpha)
            sceneAlpha.value = String(fx.sceneAlpha ?? '');
        if (offsetX)
            offsetX.value = String(fx.offsetX ?? '');
        if (offsetY)
            offsetY.value = String(fx.offsetY ?? '');
        if (enabled)
            enabled.checked = fx.enabled !== false;
        if (dmgFlash)
            dmgFlash.checked = fx.damageFlash !== false;
        if (scanlines)
            scanlines.checked = !!fx.scanlines;
        if (shear)
            shear.checked = !!fx.crtShear;
        if (colorBleed)
            colorBleed.checked = !!fx.colorBleed;
        if (footstepBump)
            footstepBump.checked = !!fx.footstepBump;
        if (grayscale)
            grayscale.checked = !!fx.grayscale;
        if (adrTint)
            adrTint.checked = fx.adrenalineTint !== false;
        applyFx();
    }
    function show() {
        sync();
        if (panel)
            panel.style.display = 'block';
    }
    function hide() {
        if (panel)
            panel.style.display = 'none';
    }
    openBtn?.addEventListener('click', show);
    closeBtn?.addEventListener('click', hide);
    prevAlpha?.addEventListener('input', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.prevAlpha = Number.parseFloat(target.value);
    });
    sceneAlpha?.addEventListener('input', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.sceneAlpha = Number.parseFloat(target.value);
    });
    offsetX?.addEventListener('input', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.offsetX = Number.parseInt(target.value, 10) || 0;
    });
    offsetY?.addEventListener('input', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.offsetY = Number.parseInt(target.value, 10) || 0;
    });
    enabled?.addEventListener('change', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.enabled = target.checked;
    });
    dmgFlash?.addEventListener('change', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.damageFlash = target.checked;
        if (!target.checked)
            document.getElementById('hpBar')?.classList.remove('hurt');
    });
    scanlines?.addEventListener('change', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.scanlines = target.checked;
        applyFx();
    });
    shear?.addEventListener('change', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.crtShear = target.checked;
        applyFx();
    });
    colorBleed?.addEventListener('change', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.colorBleed = target.checked;
        applyFx();
    });
    footstepBump?.addEventListener('change', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.footstepBump = target.checked;
    });
    grayscale?.addEventListener('change', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.grayscale = target.checked;
        fxGlobals.updateHUD?.();
    });
    adrTint?.addEventListener('change', e => {
        const fx = fxGlobals.fxConfig;
        if (!fx)
            return;
        const target = e.currentTarget;
        fx.adrenalineTint = target.checked;
        fxGlobals.updateHUD?.();
    });
    const dragHandle = panel?.querySelector('header');
    let dragX = 0;
    let dragY = 0;
    function startDrag(e) {
        if (!panel)
            return;
        dragX = e.clientX - panel.offsetLeft;
        dragY = e.clientY - panel.offsetTop;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
        e.preventDefault();
    }
    function onDrag(e) {
        if (!panel)
            return;
        panel.style.left = (e.clientX - dragX) + 'px';
        panel.style.top = (e.clientY - dragY) + 'px';
    }
    function endDrag() {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
    }
    dragHandle?.addEventListener('mousedown', startDrag);
    applyFx();
})();
