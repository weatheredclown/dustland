// Simple chiptune seed listener

globalThis.Dustland = globalThis.Dustland || {};
(function(){
  let currentSeed = null;
  const bus = globalThis.Dustland.eventBus;
  function handleSeed(seed){
    currentSeed = seed;
    console.log(`Music seed: ${seed}`);
  }
  bus?.on('music:seed', handleSeed);
  globalThis.Dustland.music = {
    getSeed(){ return currentSeed; }
  };
})();
