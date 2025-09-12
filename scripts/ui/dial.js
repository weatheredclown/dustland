(function(){
  function createDial(opts){
    opts = opts || {};
    const dial = document.createElement('div');
    dial.style.position = 'relative';
    dial.style.width = '40px';
    dial.style.height = '40px';
    dial.style.border = '2px solid #999';
    dial.style.borderRadius = '50%';
    const knob = document.createElement('div');
    knob.style.position = 'absolute';
    knob.style.left = '50%';
    knob.style.top = '50%';
    knob.style.width = '6px';
    knob.style.height = '20px';
    knob.style.background = '#c33';
    knob.style.transformOrigin = '50% 100%';
    dial.appendChild(knob);
    const min = opts.min ?? 0;
    const max = opts.max ?? 100;
    let value = opts.value ?? min;
    function set(val){
      value = Math.max(min, Math.min(max, val));
      const ratio = (value - min) / (max - min);
      const angle = ratio * 270 - 135;
      knob.style.transform = 'translate(-50%, -100%) rotate(' + angle + 'deg)';
      if(opts.onChange) opts.onChange(value);
    }
    dial.addEventListener('click', e => {
      const rect = dial.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      let angle = Math.atan2(y, x) * 180 / Math.PI;
      angle += 180;
      const val = min + (angle / 360) * (max - min);
      set(val);
    });
    set(value);
    return { el: dial, set };
  }
  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.ui = globalThis.Dustland.ui || {};
  globalThis.Dustland.ui.createDial = createDial;
})();
