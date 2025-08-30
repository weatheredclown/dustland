(function(){
  function createSignalCompass(parent){
    const el = document.createElement('div');
    el.className = 'signal-compass';
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    el.appendChild(arrow);
    (parent || document.body).appendChild(el);
    return {
      update(pos, target){
        const dx = (target.x || 0) - (pos.x || 0);
        const dy = (target.y || 0) - (pos.y || 0);
        const ang = Math.atan2(dy, dx);
        arrow.style.transform = `rotate(${ang}rad)`;
      }
    };
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.createSignalCompass = createSignalCompass;
})();

