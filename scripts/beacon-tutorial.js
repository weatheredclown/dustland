(function(){
  const bus = globalThis.EventBus;
  if (!bus || typeof bus.on !== 'function') return;
  let shown = false;
  bus.on('craft:signal-beacon', () => {
    if (shown) return;
    shown = true;
    try {
      if (globalThis.localStorage) globalThis.localStorage.setItem('tutorial:beacon','1');
    } catch (err) { /* ignore */ }
    const msg = 'Craft a signal beacon with scrap and a power cell at a workbench.';
    if (typeof alert === 'function') alert(msg);
    else if (typeof toast === 'function') toast(msg);
  });
})();
