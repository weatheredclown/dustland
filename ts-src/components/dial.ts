// @ts-nocheck
(function(){
  function DialWidget(container, opts = {}){
    const min = opts.min ?? 0;
    const max = opts.max ?? 10;
    const state = { value: Math.max(min, Math.min(max, opts.value ?? min)) };
    const display = document.createElement('div');
    display.className = 'dial';
    container.appendChild(display);
    const onChange = typeof opts.onChange === 'function' ? opts.onChange : null;
    function render(){
      display.textContent = state.value;
      if (onChange) onChange(state.value);
    }
    function clamp(v){ return Math.max(min, Math.min(max, v)); }
    function inc(delta){ state.value = clamp(state.value + delta); render(); }
    display.addEventListener('click', () => inc(1));
    render();
    return {
      value(){ return state.value; },
      set(v){ state.value = clamp(v); render(); },
      inc(){ inc(1); },
      dec(){ inc(-1); }
    };
  }
  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.DialWidget = DialWidget;
})();
