(function(){
  const bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;
  if (!bus) return;
  const msgs = [
    'Trader caravan reroutes around the storms.',
    'Bandit jammers spark near the canyon.'
  ];
  function startRadioEvents(intervalMs = 60000){
    let i = 0;
    return setInterval(() => {
      const msg = msgs[i++ % msgs.length];
      bus.emit('radio:event', { msg });
    }, intervalMs);
  }
  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.startRadioEvents = startRadioEvents;
})();
