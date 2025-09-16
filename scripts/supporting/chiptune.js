// Simple chiptune seed listener with mood routing

globalThis.Dustland = globalThis.Dustland || {};
(function(){
  let currentSeed = null;
  let instruments = { lead: 'square', bass: 'square' };
  const bus = globalThis.Dustland.eventBus;
  const AC = (typeof window !== 'undefined') ? (window.AudioContext || window.webkitAudioContext) : null;
  let audioCtx = null;
  let masterGain = null;
  let enabled = false;
  let moodTimer = null;
  let activeMood = 'explore';
  let moodRand = lcg(1);
  let stepIndex = 0;
  let hatPhase = 0;
  const moodSources = new Map();
  const defaultSource = 'base';
  const moodPriority = Object.freeze({ silence: -1, explore: 10, adr_low: 30, adr_high: 40, dialog: 60, combat: 90 });

  const MOODS = Object.freeze({
    explore: {
      bpm: 96,
      root: 60,
      scale: [0, 2, 4, 5, 7, 9],
      leadChance: 0.65,
      leadGain: 0.14,
      leadOctave: 12,
      bassDegrees: [0, -5, -7, -10],
      bassGain: 0.12,
      bassEvery: 4,
      hatEvery: 4,
      hatGain: 0.05,
      stepsPerBeat: 2,
      loopSteps: 16
    },
    dialog: {
      bpm: 74,
      root: 57,
      scale: [0, 2, 5, 7, 9],
      leadChance: 0.5,
      leadGain: 0.1,
      leadOctave: 12,
      bassDegrees: [0, -7],
      bassGain: 0.08,
      bassEvery: 8,
      hatEvery: 8,
      hatGain: 0.04,
      stepsPerBeat: 2,
      loopSteps: 16
    },
    adr_low: {
      bpm: 80,
      root: 55,
      scale: [0, 3, 5, 7, 10],
      leadChance: 0.35,
      leadGain: 0.09,
      leadOctave: 12,
      bassDegrees: [0, -5],
      bassGain: 0.09,
      bassEvery: 6,
      hatEvery: 6,
      hatGain: 0.05,
      stepsPerBeat: 2,
      loopSteps: 18
    },
    adr_high: {
      bpm: 162,
      root: 62,
      scale: [0, 2, 4, 7, 9, 12],
      leadChance: 0.85,
      leadGain: 0.16,
      leadOctave: 12,
      bassDegrees: [0, -7, -2],
      bassGain: 0.13,
      bassEvery: 2,
      hatEvery: 2,
      hatGain: 0.06,
      stepsPerBeat: 2,
      loopSteps: 16
    },
    combat: {
      bpm: 144,
      root: 64,
      scale: [0, 3, 5, 7, 10],
      leadChance: 0.9,
      leadGain: 0.18,
      leadOctave: 12,
      bassDegrees: [0, -5, -12, -5],
      bassGain: 0.15,
      bassEvery: 2,
      hatEvery: 1,
      hatGain: 0.07,
      stepsPerBeat: 2,
      loopSteps: 16
    }
  });

  function ensureAudio(){
    if(audioCtx || !AC) return audioCtx;
    try {
      audioCtx = new AC();
    } catch (err) {
      audioCtx = null;
    }
    if(audioCtx){
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.0001;
      masterGain.connect(audioCtx.destination);
    }
    return audioCtx;
  }

  function hashMood(id){
    let h = 0;
    const str = String(id || '');
    for(let i = 0; i < str.length; i++){
      h = (h * 31 + str.charCodeAt(i)) | 0;
    }
    return h >>> 0;
  }

  function stopTimer(){
    if(moodTimer){
      clearTimeout(moodTimer);
      moodTimer = null;
    }
  }

  function midiToFreq(midi){
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function scheduleTone(freq, duration, gainValue, wave, when){
    const ctx = ensureAudio();
    if(!ctx || !masterGain || typeof ctx.createOscillator !== 'function') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave || 'square';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(masterGain);
    const start = Math.max(ctx.currentTime, when || ctx.currentTime);
    const dur = Math.max(0.05, duration || 0.2);
    gain.gain.value = Math.max(0.0001, gainValue || 0.1);
    gain.gain.setValueAtTime(gain.gain.value, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  function pick(arr){
    if(!Array.isArray(arr) || arr.length === 0) return 0;
    return arr[Math.floor(moodRand() * arr.length) % arr.length];
  }

  function getMood(id){
    return MOODS[id] || MOODS.explore;
  }

  function scheduleNext(seconds){
    stopTimer();
    if(!enabled) return;
    const delay = Math.max(0, seconds);
    moodTimer = setTimeout(tick, delay * 1000);
  }

  function tick(){
    if(!enabled) return;
    const ctx = ensureAudio();
    if(!ctx || !masterGain){
      stopTimer();
      return;
    }
    const mood = getMood(activeMood);
    const stepsPerBeat = Math.max(1, mood.stepsPerBeat || 2);
    const stepDur = 60 / Math.max(1, mood.bpm || 120) / stepsPerBeat;
    const now = ctx.currentTime + 0.02;

    const bassEvery = Math.max(1, mood.bassEvery || (stepsPerBeat * 2));
    if(stepIndex % bassEvery === 0){
      const idx = Math.floor(stepIndex / bassEvery) % (mood.bassDegrees?.length || 1);
      const deg = mood.bassDegrees ? mood.bassDegrees[idx] : 0;
      const midi = (mood.root || 60) + deg;
      scheduleTone(midiToFreq(midi), stepDur * 2.2, mood.bassGain || 0.12, instruments.bass, now);
    }

    const leadChance = Math.max(0, Math.min(1, mood.leadChance ?? 0.6));
    if(leadChance > 0 && moodRand() < leadChance){
      const deg = pick(mood.scale || [0, 2, 4, 7, 9]);
      const midi = (mood.root || 60) + (mood.leadOctave || 12) + deg;
      scheduleTone(midiToFreq(midi), stepDur * 1.1, mood.leadGain || 0.14, instruments.lead, now);
    }

    const hatEvery = Math.max(1, mood.hatEvery || 0);
    if(mood.hatEvery && stepIndex % hatEvery === 0){
      const hatFreq = midiToFreq((mood.root || 60) + 24 + (hatPhase % 2 ? 7 : 0));
      scheduleTone(hatFreq, Math.max(0.04, stepDur * 0.6), mood.hatGain || 0.05, 'square', now);
      hatPhase = (hatPhase + 1) % 8;
    }

    const loopSteps = Math.max(4, mood.loopSteps || 16);
    stepIndex = (stepIndex + 1) % loopSteps;
    scheduleNext(stepDur);
  }

  function chooseMood(){
    let bestId = 'explore';
    let bestPriority = -Infinity;
    for(const info of moodSources.values()){
      const pri = info?.priority ?? (moodPriority[info?.id] ?? 0);
      if(pri > bestPriority){
        bestPriority = pri;
        bestId = info?.id || 'explore';
      }
    }
    applyMood(bestId);
  }

  function applyMood(id){
    const next = MOODS[id] ? id : 'explore';
    if(next === activeMood) return;
    activeMood = next;
    moodRand = lcg(((currentSeed ?? 1) ^ hashMood(activeMood)) >>> 0);
    stepIndex = 0;
    hatPhase = 0;
    if(enabled) tick();
  }

  function setSourceMood(source, id, priority){
    const key = source || 'global';
    if(id == null){
      moodSources.delete(key);
    } else {
      const moodId = MOODS[id] ? id : 'explore';
      moodSources.set(key, { id: moodId, priority: priority ?? (moodPriority[moodId] ?? 0) });
    }
    if(!moodSources.has(defaultSource)){
      moodSources.set(defaultSource, { id: 'explore', priority: moodPriority.explore });
    }
    chooseMood();
  }

  function handleMoodEvent(payload){
    if(typeof payload === 'string'){
      setSourceMood('global', payload);
      return;
    }
    if(!payload) return;
    setSourceMood(payload.source, payload.id, payload.priority);
  }

  function fadeMaster(target, time){
    if(!masterGain || !audioCtx) return;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(Math.max(0.0001, target), now, Math.max(0.05, time || 0.2));
  }

  function setEnabled(on){
    enabled = !!on;
    const ctx = ensureAudio();
    if(!ctx){
      bus?.emit?.('music:state', { enabled });
      return enabled;
    }
    if(enabled){
      ctx.resume?.();
      fadeMaster(0.25, 0.25);
      tick();
    } else {
      fadeMaster(0.0001, 0.2);
      stopTimer();
    }
    bus?.emit?.('music:state', { enabled });
    return enabled;
  }

  function toggleEnabled(){
    return setEnabled(!enabled);
  }

  function isEnabled(){
    return enabled;
  }

  function getCurrentMood(){
    return activeMood;
  }

  function handleSeed(seed){
    currentSeed = seed >>> 0;
    moodRand = lcg(((currentSeed ?? 1) ^ hashMood(activeMood)) >>> 0);
  }

  function setSeed(seed){
    handleSeed(seed);
    bus?.emit?.('music:seed', seed);
  }

  function setInstruments(opts){
    if(!opts) return;
    if(opts.lead) instruments.lead = opts.lead;
    if(opts.bass) instruments.bass = opts.bass;
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
    for(let i = 0; i < length; i++){
      const n = scale[Math.floor(rand() * scale.length)];
      notes.push({ time: i * 0.5, note: n, dur: 0.5 });
    }
    return notes;
  }

  setSourceMood(defaultSource, 'explore', moodPriority.explore);
  bus?.on?.('music:seed', handleSeed);
  bus?.on?.('music:mood', handleMoodEvent);
  bus?.on?.('music:toggle', (on) => setEnabled(on ?? !enabled));

  globalThis.Dustland.music = {
    getSeed(){ return currentSeed; },
    setSeed,
    setInstruments,
    getInstruments(){ return { ...instruments }; },
    generateMelody,
    setEnabled,
    toggleEnabled,
    isEnabled,
    getCurrentMood,
    setMood(id, opts){ setSourceMood(opts?.source || 'manual', id, opts?.priority); }
  };
})();
