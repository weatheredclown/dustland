(function(){
  function doorLinkerStep(entryKey, exitKey, entryLabel, exitLabel){
    entryKey = entryKey || 'entry';
    exitKey = exitKey || 'exit';
    entryLabel = entryLabel || 'World Entry';
    exitLabel = exitLabel || 'Interior Exit';
    return {
      render(container, state){
        this.state = state;
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.gap = '20px';
        function makePane(label, key){
          const pane = document.createElement('div');
          const p = document.createElement('p');
          p.textContent = label + ' - click to select a location.';
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 160;
          canvas.style.border = '1px solid #444';
          pane.appendChild(p);
          pane.appendChild(canvas);
          const ctx = canvas.getContext('2d');
          const size = 10;
          const draw = () => {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const pos = state[key];
            if (pos){
              ctx.fillStyle = '#9ef7a0';
              ctx.fillRect(pos.x * size, pos.y * size, size, size);
            }
          };
          draw();
          canvas.addEventListener('click', e => {
            const r = canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - r.left) / size);
            const y = Math.floor((e.clientY - r.top) / size);
            state[key] = { x, y };
            draw();
          });
          return pane;
        }
        wrap.appendChild(makePane(entryLabel, entryKey));
        wrap.appendChild(makePane(exitLabel, exitKey));
        container.appendChild(wrap);
      },
      validate(){
        return this.state && this.state[entryKey] && this.state[exitKey];
      },
      onComplete(){ }
    };
  }
  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.WizardSteps = globalThis.Dustland.WizardSteps || {};
  globalThis.Dustland.WizardSteps.doorLinker = doorLinkerStep;
})();
