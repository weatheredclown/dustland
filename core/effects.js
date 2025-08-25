// ===== Effects =====
(function(){
  let dustStormCanvas = null;
  let dustStormCtx = null;
  let dustParticles = [];

  function createDustStorm() {
    if (dustStormCanvas) return;
    dustStormCanvas = document.createElement('canvas');
    dustStormCanvas.id = 'dustStorm';
    dustStormCanvas.style.position = 'fixed';
    dustStormCanvas.style.top = '0';
    dustStormCanvas.style.left = '0';
    dustStormCanvas.style.width = '100%';
    dustStormCanvas.style.height = '100%';
    dustStormCanvas.style.pointerEvents = 'none';
    dustStormCanvas.style.zIndex = '100';
    document.body.appendChild(dustStormCanvas);
    dustStormCtx = dustStormCanvas.getContext('2d');
    dustStormCanvas.width = window.innerWidth;
    dustStormCanvas.height = window.innerHeight;

    for (let i = 0; i < 100; i++) {
      dustParticles.push({
        x: Math.random() * dustStormCanvas.width,
        y: Math.random() * dustStormCanvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 3 + 1,
      });
    }
    animateDustStorm();
  }

  function animateDustStorm() {
    if (!dustStormCanvas) return;
    dustStormCtx.clearRect(0, 0, dustStormCanvas.width, dustStormCanvas.height);
    dustStormCtx.fillStyle = 'rgba(210, 180, 140, 0.3)';
    for (const p of dustParticles) {
      p.x -= p.speed;
      if (p.x < 0) p.x = dustStormCanvas.width;
      dustStormCtx.fillRect(p.x, p.y, p.size, p.size);
    }
    requestAnimationFrame(animateDustStorm);
  }

  function removeDustStorm() {
    if (!dustStormCanvas) return;
    document.body.removeChild(dustStormCanvas);
    dustStormCanvas = null;
    dustStormCtx = null;
    dustParticles = [];
  }

  const Effects = {
    apply(list = [], ctx = {}) {
      for (const eff of list || []) {
        if (!eff) continue;
        const type = eff.effect || eff.type;
        switch (type) {
          case 'dustStorm':
            if (eff.active) createDustStorm();
            else removeDustStorm();
            break;
          case 'addSoundSource':
            if (eff.id && typeof eff.x === 'number' && typeof eff.y === 'number') {
              if (!soundSources.some(s => s.id === eff.id)) {
                soundSources.push({ id: eff.id, x: eff.x, y: eff.y, map: eff.map || state.map });
              }
            }
            break;
          case 'removeSoundSource':
            if (eff.id) {
              const index = soundSources.findIndex(s => s.id === eff.id);
              if (index > -1) soundSources.splice(index, 1);
            }
            break;
          case 'toast':
            if (typeof toast === 'function') toast(eff.msg || '');
            else if (typeof log === 'function') log(eff.msg || '');
            break;
          case 'log':
            if (typeof log === 'function') log(eff.msg || '');
            break;
          case 'addFlag': {
            const p = ctx.party || globalThis.party;
            if (p) {
              p.flags = p.flags || {};
              p.flags[eff.flag] = true;
              if (typeof revealHiddenNPCs === 'function') revealHiddenNPCs();
            }
            break; }
          case 'unboardDoor': {
            if (eff.interiorId && Array.isArray(globalThis.buildings)) {
              const b = globalThis.buildings.find(b => b.interiorId === eff.interiorId);
              if (b) b.boarded = false;
            }
            break; }
          case 'boardDoor': {
            if (eff.interiorId && Array.isArray(globalThis.buildings)) {
              const b = globalThis.buildings.find(b => b.interiorId === eff.interiorId);
              if (b) b.boarded = true;
            }
            break; }
          case 'modStat': {
            const target = ctx.actor || ctx.player;
            if (target && target.stats && eff.stat) {
              const delta = eff.delta || 0;
              target.stats[eff.stat] = (target.stats[eff.stat] || 0) + delta;
              if (eff.duration) {
                ctx.buffs = ctx.buffs || [];
                ctx.buffs.push({ target, stat: eff.stat, delta, remaining: eff.duration });
              }
            }
            break; }
        }
      }
    },
    tick(ctx = {}) {
      const list = ctx.buffs || [];
      for (let i = list.length - 1; i >= 0; i--) {
        const b = list[i];
        if (--b.remaining <= 0) {
          if (b.target && b.target.stats) {
            b.target.stats[b.stat] = (b.target.stats[b.stat] || 0) - b.delta;
          }
          list.splice(i, 1);
        }
      }
    }
  };

  globalThis.Effects = Effects;
})();

