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
  function lcg(seed){
    let s = seed >>> 0;
    return function(){
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
  }
  function generateMelody(seed, length = 8){
    const rand = lcg(seed);
    const scale = ['C4', 'D4', 'E4', 'G4', 'A4'];
    const notes = [];
    for (let i = 0; i < length; i++){
      const n = scale[Math.floor(rand() * scale.length)];
      notes.push({ time: i * 0.5, note: n, dur: 0.5 });
    }
    return notes;
  }
  bus?.on('music:seed', handleSeed);
  globalThis.Dustland.music = {
    getSeed(){ return currentSeed; },
    setSeed,
    setInstruments,
    getInstruments(){ return { ...instruments }; },
    generateMelody
  };
})();
