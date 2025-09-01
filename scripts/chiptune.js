// Simple chiptune seed listener

globalThis.Dustland = globalThis.Dustland || {};
(function(){
  let currentSeed = null;
  let instruments = { lead: 'square', bass: 'square' };
  const bus = globalThis.Dustland.eventBus;
  function handleSeed(seed){
    currentSeed = seed;
    console.log(`Music seed: ${seed}`);
  }
  function setSeed(seed){
    handleSeed(seed);
    bus?.emit('music:seed', seed);
  }
  function setInstruments(opts){
    instruments.lead = opts.lead || instruments.lead;
    instruments.bass = opts.bass || instruments.bass;
    console.log('Music instruments:', instruments);
  }
  bus?.on('music:seed', handleSeed);
  globalThis.Dustland.music = {
    getSeed(){ return currentSeed; },
    setSeed,
    setInstruments,
    getInstruments(){ return { ...instruments }; }
  };
})();
