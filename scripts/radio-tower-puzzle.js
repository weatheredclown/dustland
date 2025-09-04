(function(){
  function openRadioPuzzle(){
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const win = document.createElement('div');
    win.className = 'win';
    overlay.appendChild(win);
    const dials = [];
    for (let i = 0; i < 3; i++) {
      const dial = Dustland.DialWidget(win, { min: 0, max: 9 });
      dials.push(dial);
    }
    const alignBtn = document.createElement('button');
    alignBtn.className = 'btn';
    alignBtn.textContent = 'Align';
    alignBtn.onclick = () => {
      if (dials.every((d, i) => d.value() === i + 1)) {
        log('Broadcast locks in.');
        document.body.removeChild(overlay);
      } else {
        log('Static crackles.');
      }
    };
    win.appendChild(alignBtn);
    document.body.appendChild(overlay);
    overlay.tabIndex = -1;
    overlay.focus();
    return { overlay, dials, alignBtn };
  }
  globalThis.openRadioPuzzle = openRadioPuzzle;
})();
