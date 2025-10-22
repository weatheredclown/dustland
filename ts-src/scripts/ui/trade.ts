// @ts-nocheck
(function(){
  const timerEl = typeof document !== 'undefined' ? document.getElementById('shopTimer') : null;
  const grudgeEl = typeof document !== 'undefined' ? document.getElementById('shopGrudge') : null;
  function updateTradeUI(trader){
    if(timerEl){
      const hrs = trader?.refresh ?? 0;
      timerEl.textContent = hrs > 0 ? `Refresh in ${hrs}h` : '';
    }
    if(grudgeEl){
      const g = trader?.grudge ?? 0;
      grudgeEl.textContent = g > 0 ? `Grudge: ${g}` : '';
      grudgeEl.style.color = g >= 3 ? '#c33' : '';
    }
  }
  globalThis.Dustland = globalThis.Dustland ?? {};
  globalThis.Dustland.updateTradeUI = updateTradeUI;
})();
