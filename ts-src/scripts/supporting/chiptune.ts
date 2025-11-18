type ChiptuneEventBus = {
  emit?(event: string, ...args: any[]): void;
  on?(event: string, handler: (...args: any[]) => void): void;
  off?(event: string, handler: (...args: any[]) => void): void;
  once?(event: string, handler: (...args: any[]) => void): void;
};

type ChiptuneGlobals = typeof globalThis & {
  Dustland?: {
    eventBus?: ChiptuneEventBus;
    music?: unknown;
  };
  clampMidiToScale?: (midi: number, key: string, scale: string) => number;
};

const chiptuneGlobal = globalThis as ChiptuneGlobals;

// Dynamic chiptune engine powered by Tone.js synths.
// Mirrors the music-demo page moods while integrating with the Dustland event bus.

chiptuneGlobal.Dustland = chiptuneGlobal.Dustland || {};
(function(){
  'use strict';

  const bus = chiptuneGlobal.Dustland?.eventBus;
  const isBrowser = typeof window !== 'undefined';
  const hasDocument = typeof document !== 'undefined';
  type ExtendedWindow = Window & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext; Tone?: typeof Tone };
  const toneWindow: ExtendedWindow | null = isBrowser ? (window as ExtendedWindow) : null;
  const AC = toneWindow ? (toneWindow.AudioContext ?? toneWindow.webkitAudioContext ?? null) : null;
  const clampMidiToScaleFn = chiptuneGlobal.clampMidiToScale;

  const moodPriority = Object.freeze({
    silence: -1,
    explore: 10,
    somber: 10,
    chill: 10,
    mystery: 15,
    dialog: 60,
    melancholic: 60,
    adr_low: 30,
    endangered: 30,
    adr_high: 40,
    angry: 40,
    combat: 90,
    triumphant: 90,
    hopeful: 25,
    stealth: 20
  });

  const MOOD_PRESETS = Object.freeze({
    somber: { id: 'somber', bpm: 92, key: 'G', scale: 'minor', swing: 0.02, density: 0.45, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 3, 5, 3], barStart: 'stab' },
    angry: { id: 'angry', bpm: 160, key: 'G', scale: 'phrygian', swing: 0.01, density: 0.95, leadWave: 'square', bassWave: 'square', harmony: [0, 1, 2, 1], barStart: 'stab' },
    endangered: { id: 'endangered', bpm: 140, key: 'G', scale: 'minor', swing: 0.02, density: 0.85, leadWave: 'square', bassWave: 'square', harmony: [0, 2, 4, 2], barStart: 'stab' },
    stealth: { id: 'stealth', bpm: 100, key: 'G', scale: 'dorian', swing: 0.03, density: 0.35, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 0, 3, 5], barStart: 'stab' },
    hopeful: { id: 'hopeful', bpm: 124, key: 'G', scale: 'major', swing: 0.04, density: 0.7, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 4, 5, 7], barStart: 'stab' },
    triumphant: { id: 'triumphant', bpm: 132, key: 'G', scale: 'major', swing: 0.05, density: 0.85, leadWave: 'square', bassWave: 'triangle', harmony: [0, 4, 5, 0], barStart: 'stab' },
    melancholic: { id: 'melancholic', bpm: 110, key: 'G', scale: 'minor', swing: 0.02, density: 0.55, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 5, 3, 2], barStart: 'stab' },
    mystery: { id: 'mystery', bpm: 96, key: 'G', scale: 'dorian', swing: 0.0, density: 0.4, leadWave: 'triangle', bassWave: 'square', harmony: [0, 2, 6, 2], barStart: 'stab' },
    chill: { id: 'chill', bpm: 88, key: 'G', scale: 'major', swing: 0.03, density: 0.4, leadWave: 'square', bassWave: 'triangle', harmony: [0, 4, 5, 4], barStart: 'stab' }
  });

  const MOOD_ALIASES = Object.freeze({
    explore: 'somber',
    dialog: 'melancholic',
    adr_low: 'endangered',
    adr_high: 'angry',
    combat: 'triumphant'
  });

  const BASES = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 };
  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10]
  };

  const lookahead = 0.05;
  const scheduleAheadTime = 0.2;
  const stepsPerBar = 16;

  type ToneSynths = { lead: any; bass: any; kick: any; snare: any; hat: any };
  type ToneFx = Record<string, any> | null;
  const tone: { enabled: boolean; loading: boolean; ready: boolean; synths: ToneSynths | null; fx: ToneFx } = {
    enabled: true,
    loading: false,
    ready: false,
    synths: null,
    fx: null,
  };
  let tonePromise: Promise<void> | null = null;

  let audioCtx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let delayNode: DelayNode | null = null;
  let delayGain: GainNode | null = null;
  let scheduleTimer: ReturnType<typeof setInterval> | null = null;
  let playing = false;
  let enabled = false;
  let nextNoteTime = 0;
  let current16th = 0;

  const instruments = { lead: 'square', bass: 'square' };

  const moodSources = new Map<string, { id: string; priority: number }>();
  const defaultSource = 'base';

  let activeMood = 'explore';
  let currentPresetId = 'somber';
  let currentSeed = 1;
  let rngState = 1;

  const music = {
    bpm: 120,
    key: 'G',
    scale: 'minor',
    swing: 0,
    density: 0.6,
    leadWave: 'square',
    bassWave: 'square',
    barStart: 'stab',
    harmony: [0, 3, 4, 3],
    barCount: 0,
    nextMood: null
  };

  const DEFAULT_LEAD_PATTERN = [0, 4, 7, 12, 7, 4, 0, 7];

  function ensureAudio(){
    if(audioCtx || !AC) return audioCtx;
    try {
      audioCtx = new AC();
    } catch (err) {
      audioCtx = null;
      return audioCtx;
    }
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(audioCtx.destination);
    delayNode = audioCtx.createDelay(0.5);
    delayNode.delayTime.value = 0.22;
    delayGain = audioCtx.createGain();
    delayGain.gain.value = 0.25;
    delayNode.connect(delayGain).connect(masterGain);
    return audioCtx;
  }

  function loadScript(src: string){
    return new Promise<void>((resolve, reject) => {
      if(!hasDocument){
        reject(new Error('no document'));
        return;
      }
      const s = document.createElement('script');
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('load ' + src));
      document.head.appendChild(s);
    });
  }

  function loadTone(){
    if(!isBrowser || !hasDocument) return Promise.reject(new Error('no browser'));
    if(tone.ready) return Promise.resolve();
    if(tone.loading && tonePromise) return tonePromise;
    tone.loading = true;
    tonePromise = loadScript('https://cdn.jsdelivr.net/npm/tone/build/Tone.js')
      .then(() => {
        if(!toneWindow?.Tone) throw new Error('Tone unavailable');
        const masterHP = new Tone.Filter(60, 'highpass');
        masterHP.toDestination();
        const limiter = new Tone.Limiter(-1);
        limiter.connect(masterHP);

        const leadPre = new Tone.Filter(10000, 'lowpass');
        const leadDelay = new Tone.FeedbackDelay(0.22, 0.3);
        leadDelay.wet.value = 0.1;
        const crusher = new Tone.BitCrusher(5);
        const ping = new Tone.PingPongDelay(0.22, 0.25);
        ping.wet.value = 0.1;

        const lead = new Tone.Synth({
          oscillator: { type: 'pulse', width: 0.25 },
          envelope: { attack: 0.002, decay: 0.05, sustain: 0.2, release: 0.08 }
        }).connect(leadPre).connect(leadDelay).connect(crusher).connect(ping).connect(limiter);

        try {
          const pwm = new Tone.LFO({ frequency: 0.8, min: 0.12, max: 0.5 }).start();
          pwm.connect(lead.oscillator.width);
        } catch (err) {
          void err;
        }

        const bass = new Tone.MonoSynth({
          oscillator: { type: 'square' },
          filter: { type: 'lowpass', Q: 0 },
          filterEnvelope: { attack: 0.001, decay: 0.01, sustain: 1.0, release: 0.01, baseFrequency: 18000, octaves: 0 },
          envelope: { attack: 0.002, decay: 0.06, sustain: 0.22, release: 0.06 }
        }).connect(limiter);

        const kick = new Tone.MembraneSynth({ pitchDecay: 0.02, octaves: 5, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0.0, release: 0.06 } }).connect(limiter);
        const snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0 } }).connect(limiter);
        const hat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 } }).connect(limiter);

        tone.synths = { lead, bass, kick, snare, hat };
        tone.fx = { crusher, color: leadPre, ping, delay: leadDelay, limiter, hp: masterHP };
        tone.ready = true;
        tone.loading = false;
      })
      .catch(err => {
        tone.loading = false;
        tone.ready = false;
        throw err;
      });
    return tonePromise;
  }

  function toneWhen(t: number){
    if(!audioCtx || !toneWindow?.Tone || typeof Tone.now !== 'function') return undefined;
    return Tone.now() + Math.max(0, t - audioCtx.currentTime);
  }

  function setSeed(seed){
    currentSeed = (seed >>> 0) || 1;
    rngState = currentSeed;
  }

  function rnd(){
    rngState = (rngState + 0x6D2B79F5) >>> 0;
    let t = rngState;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  function midiFromDegree(key, scaleName, degree, octaveOffset){
    const base = BASES[key] || 60;
    const scale = SCALES[scaleName] || SCALES.minor;
    const len = scale.length;
    const idx = ((degree % len) + len) % len;
    const oct = Math.floor(degree / len) + (octaveOffset || 0);
    return base + scale[idx] + (12 * oct);
  }

  function hzFromMidi(m){
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  function velocityForStep(step){
    const beatInBar = step % stepsPerBar;
    if(beatInBar % 4 === 0) return 0.9;
    if(beatInBar % 4 === 2) return 0.7;
    if(beatInBar % 2 === 0) return 0.5;
    return 0.35;
  }

  function microtime(step){
    const beatInBar = step % stepsPerBar;
    if(beatInBar % 4 === 0) return 0;
    const s = ((step * 1103515245 + rngState) >>> 0) / 4294967296;
    return (s - 0.5) * 0.003;
  }

  function euclid(steps, pulses, rot){
    steps = Math.max(1, steps | 0);
    pulses = Math.max(0, Math.min(steps, pulses | 0));
    const pattern = [];
    if(pulses === 0){ for(let i = 0; i < steps; i++) pattern.push(0); return pattern; }
    if(pulses === steps){ for(let i = 0; i < steps; i++) pattern.push(1); return pattern; }
    const counts = [];
    const remainders = [];
    let divisor = steps - pulses;
    remainders[0] = pulses;
    let level = 0;
    while(remainders[level] > 1){
      counts[level] = Math.floor(divisor / remainders[level]);
      remainders[level + 1] = divisor % remainders[level];
      divisor = remainders[level];
      level++;
    }
    counts[level] = divisor;
    const build = (l) => {
      if(l === -1){ pattern.push(0); }
      else if(l === -2){ pattern.push(1); }
      else {
        for(let i = 0; i < counts[l]; i++) build(l - 1);
        if(remainders[l] !== 0) build(l - 2);
      }
    };
    build(level);
    const rotN = ((rot || 0) % steps + steps) % steps;
    return pattern.slice(rotN).concat(pattern.slice(0, rotN));
  }

  let cachedNoise = null;
  function noiseBuffer(){
    if(!audioCtx) return null;
    const len = audioCtx.sampleRate * 1.0;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function mkNoise(){
    if(!audioCtx) return null;
    if(!cachedNoise) cachedNoise = noiseBuffer();
    if(!cachedNoise) return null;
    const src = audioCtx.createBufferSource();
    src.buffer = cachedNoise;
    src.loop = true;
    return src;
  }

  function envGate(time, attack, decay, sustain, release, duration){
    const gate = audioCtx.createGain();
    gate.gain.cancelScheduledValues(time);
    gate.gain.setValueAtTime(0.0001, time);
    gate.gain.exponentialRampToValueAtTime(1.0, time + attack);
    gate.gain.exponentialRampToValueAtTime(sustain, time + attack + decay);
    const relAt = time + (duration || 0);
    function scheduleRelease(t){
      const rt = Math.max(t || relAt, audioCtx.currentTime);
      gate.gain.cancelScheduledValues(rt);
      gate.gain.setValueAtTime(Math.max(0.0001, gate.gain.value || sustain), rt);
      gate.gain.exponentialRampToValueAtTime(0.0001, rt + release);
    }
    return { gain: gate, scheduleRelease };
  }

  function mkOsc(type: OscillatorType, freq?: number, time?: number){
    if(!audioCtx) throw new Error('Audio context unavailable');
    const osc = audioCtx.createOscillator();
    osc.type = type;
    if(freq != null) osc.frequency.setValueAtTime(freq, time ?? audioCtx.currentTime);
    return osc;
  }

  function scheduleTone(frequency: number, duration?: number, gainValue?: number, wave?: OscillatorType, when?: number){
    if(!audioCtx || !masterGain) return;
    const osc = mkOsc((wave || 'square') as OscillatorType);
    const gain = audioCtx.createGain();
    osc.frequency.value = frequency;
    osc.connect(gain).connect(masterGain);
    const start = Math.max(audioCtx.currentTime, when ?? audioCtx.currentTime);
    const dur = Math.max(0.05, duration ?? 0.2);
    gain.gain.value = Math.max(0.0001, gainValue ?? 0.1);
    gain.gain.setValueAtTime(gain.gain.value, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  function playKick(t: number, vel?: number){
    if(!audioCtx || !masterGain) return;
    if(tone.enabled && tone.ready && tone.synths){
      const when = toneWhen(t);
      try {
        tone.synths.kick.triggerAttackRelease('C2', 0.12, when, vel ?? 0.9);
        return;
      } catch (err) {
        void err;
      }
    }
    const osc = mkOsc('sine');
    const env = envGate(t, 0.001, 0.05, 0.0001, 0.08, 0.12);
    const g = env.gain;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(((vel ?? 1) * 1.2), t);
    osc.connect(g).connect(gain).connect(masterGain);
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.25);
    env.scheduleRelease(t + 0.12);
  }

  function playSnare(t: number, tight = false, vel = 1){
    if(!audioCtx || !masterGain) return;
    if(tone.enabled && tone.ready && tone.synths){
      const when = toneWhen(t);
      try {
        tone.synths.snare.noise.type = 'white';
        tone.synths.snare.envelope.decay = tight ? 0.05 : 0.12;
        tone.synths.snare.triggerAttackRelease(tight ? 0.06 : 0.12, when, vel ?? 0.7);
        return;
      } catch (err) {
        void err;
      }
    }
    const noise = mkNoise();
    if(!noise) return;
    const env = envGate(t, 0.001, 0.05, 0.0001, 0.1, tight ? 0.03 : 0.08);
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1200, t);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(((tight ? 0.3 : 0.45) * (vel ?? 1)), t);
    noise.connect(hp).connect(env.gain).connect(gain).connect(masterGain);
    noise.start(t);
    noise.stop(t + 0.2);
    env.scheduleRelease(t + (tight ? 0.04 : 0.1));
  }

  function playHat(t: number, open: boolean, vel?: number){
    if(!audioCtx || !masterGain) return;
    if(tone.enabled && tone.ready && tone.synths){
      const when = toneWhen(t);
      try {
        tone.synths.hat.envelope.decay = open ? 0.08 : 0.03;
        tone.synths.hat.triggerAttackRelease(open ? 0.06 : 0.03, when, vel ?? 0.5);
        return;
      } catch (err) {
        void err;
      }
    }
    const noise = mkNoise();
    if(!noise) return;
    const env = envGate(t, 0.001, 0.02, 0.0001, 0.05, open ? 0.06 : 0.02);
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(6000, t);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(((open ? 0.18 : 0.12) * (vel ?? 1)), t);
    noise.connect(hp).connect(env.gain).connect(gain).connect(masterGain);
    noise.start(t);
    noise.stop(t + 0.15);
    env.scheduleRelease(t + (open ? 0.08 : 0.03));
  }

  function playBassNote(midi: number, t: number, dur: number, vel?: number){
    if(!audioCtx || !masterGain) return;
    const freq = hzFromMidi(midi);
    if(tone.enabled && tone.ready && tone.synths){
      const when = toneWhen(t);
      try {
        if(typeof tone.synths.bass.frequency?.setValueAtTime === 'function' && when != null){
          tone.synths.bass.frequency.setValueAtTime(freq, when);
        }
        tone.synths.bass.triggerAttackRelease(freq, dur, when, vel != null ? vel * 0.9 : 0.9);
        return;
      } catch (err) {
        void err;
      }
    }
    const osc = mkOsc((instruments.bass || music.bassWave) as OscillatorType, freq, t);
    const env = envGate(t, 0.003, 0.06, 0.2, 0.06, dur * 0.9);
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1800, t);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3 * (vel ?? 1), t);
    osc.connect(env.gain).connect(lp).connect(gain).connect(masterGain);
    osc.start(t);
    osc.stop(t + dur + 0.1);
    env.scheduleRelease(t + dur * 0.9);
  }

  function playLeadNote(midi: number, t: number, dur: number, vel?: number){
    if(!audioCtx || !masterGain) return;
    if(typeof clampMidiToScaleFn === 'function'){
      try {
        const clamped = clampMidiToScaleFn(midi, music.key, music.scale);
        if (typeof clamped === 'number') {
          midi = clamped;
        }
      }
      catch (err) { void err; }
    }
    if(tone.enabled && tone.ready && tone.synths){
      const when = toneWhen(t);
      const freq = hzFromMidi(midi);
      try {
        tone.synths.lead.triggerAttackRelease(freq, dur, when, vel ?? 0.7);
        return;
      } catch (err) {
        void err;
      }
    }
    const freq = hzFromMidi(midi);
    const osc = mkOsc((instruments.lead || music.leadWave) as OscillatorType, freq, t);
    const env = envGate(t, 0.004, 0.05, 0.3, 0.1, dur * 0.85);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.18 * (vel ?? 1), t);
    osc.connect(env.gain).connect(gain).connect(delayNode).connect(delayGain).connect(masterGain);
    osc.start(t);
    osc.stop(t + dur + 0.12);
    env.scheduleRelease(t + dur * 0.85);
  }

  function playChordStab(degree, t){
    if(!audioCtx || !masterGain) return;
    const root = midiFromDegree(music.key, music.scale, degree, -1);
    const third = midiFromDegree(music.key, music.scale, degree + 2, -1);
    const fifth = midiFromDegree(music.key, music.scale, degree + 4, -1);
    const dur = secondsPer16th() * 3;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.005);
    gain.gain.linearRampToValueAtTime(0.0, t + dur);
    const o1 = mkOsc('square', hzFromMidi(root), t);
    const o2 = mkOsc('square', hzFromMidi(third), t);
    const o3 = mkOsc('square', hzFromMidi(fifth), t);
    o1.connect(gain);
    o2.connect(gain);
    o3.connect(gain);
    gain.connect(masterGain);
    o1.start(t); o2.start(t); o3.start(t);
    const stopAt = t + dur + 0.02;
    o1.stop(stopAt); o2.stop(stopAt); o3.stop(stopAt);
  }

  function playChordArp(degree, t){
    if(!audioCtx || !masterGain) return;
    const root = midiFromDegree(music.key, music.scale, degree, -1);
    const third = midiFromDegree(music.key, music.scale, degree + 2, -1);
    const fifth = midiFromDegree(music.key, music.scale, degree + 4, -1);
    const notes = [root, third, fifth];
    const step = secondsPer16th() * 0.5;
    for(let i = 0; i < notes.length; i++){
      const nt = t + i * step;
      const osc = mkOsc('square', hzFromMidi(notes[i]), nt);
      const env = envGate(nt, 0.004, 0.05, 0.3, 0.1, step * 0.85);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.18, nt);
      osc.connect(env.gain).connect(gain).connect(masterGain);
      osc.start(nt);
      osc.stop(nt + step + 0.02);
      env.scheduleRelease(nt + step * 0.85);
    }
  }

  function playBarIntro(degree, t){
    if(music.barStart === 'arp') playChordArp(degree, t);
    else if(music.barStart === 'stab') playChordStab(degree, t);
  }

  function secondsPerBeat(){
    return 60.0 / Math.max(1, music.bpm || 120);
  }

  function secondsPer16th(){
    return secondsPerBeat() / 4.0;
  }

  function scheduleTransitionFill(barStartTime){
    if(!audioCtx || !masterGain) return;
    const halfBar = secondsPerBeat() * 2;
    const t0 = barStartTime + halfBar + secondsPer16th();
    for(let i = 0; i < 8; i++) playSnare(t0 + i * secondsPer16th() * 0.5, true);
    const noise = mkNoise();
    if(!noise) return;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.2, t0 + halfBar - 0.05);
    const bp = audioCtx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(800, t0);
    noise.connect(bp).connect(gain).connect(masterGain);
    noise.start(t0);
    noise.stop(t0 + halfBar);
  }

  function scheduleNote(step, t){
    if(!audioCtx || !masterGain) return;
    const swing = music.swing;
    if(swing > 0 && (step % 2 === 1)) t += secondsPer16th() * swing;
    const t2 = t + microtime(step);
    const vel = velocityForStep(step);
    const beatInBar = step % stepsPerBar;
    const bar = Math.floor(step / stepsPerBar);

    if(beatInBar % 4 === 0) playKick(t2, vel);
    if(beatInBar % 8 === 4) playSnare(t2, false, vel);

    const hatPulses = Math.max(4, Math.round(music.density * 10));
    const hatPattern = euclid(stepsPerBar, hatPulses, bar % stepsPerBar);
    if(hatPattern[beatInBar]) playHat(t2, (music.density > 0.8) && (beatInBar % 4 === 2), vel);

    if(beatInBar === 0){
      const introDeg = music.harmony[bar % music.harmony.length] || 0;
      playBarIntro(introDeg, t2);
    }

    const deg = music.harmony[bar % music.harmony.length] || 0;
    const root = midiFromDegree(music.key, music.scale, deg, -2);
    const fifth = midiFromDegree(music.key, music.scale, deg + 4, -2);
    const bassNote = (beatInBar % 8 === 0) ? root : ((beatInBar % 4 === 2) ? fifth : root);
    playBassNote(bassNote, t2, secondsPer16th() * 2, vel);

    const stepInBar = beatInBar;
    if(stepInBar % 2 === 0){
      const idx = Math.floor(stepInBar / 2) % DEFAULT_LEAD_PATTERN.length;
      const patternDeg = DEFAULT_LEAD_PATTERN[idx];
      const leadDeg = deg + patternDeg;
      const mainMidi = midiFromDegree(music.key, music.scale, leadDeg, 0);
      const upperMidi = midiFromDegree(music.key, music.scale, leadDeg, 1);
      const duration = secondsPer16th() * 2;
      const mainVel = Math.min(1, vel + 0.2);
      playLeadNote(mainMidi, t, duration, mainVel);
      playLeadNote(upperMidi, t, duration, mainVel * 0.6);
    }
  }

  function nextNote(){
    if(!audioCtx) return;
    nextNoteTime += secondsPer16th();
    current16th++;
    if(current16th % stepsPerBar === 0){
      music.barCount++;
      if(music.nextMood && music.nextMood !== activeMood){
        applyMood(music.nextMood);
        music.nextMood = null;
      }
    }
  }

  function scheduler(){
    if(!audioCtx) return;
    while(playing && nextNoteTime < audioCtx.currentTime + scheduleAheadTime){
      if(current16th % stepsPerBar === 0 && music.nextMood && music.nextMood !== activeMood){
        scheduleTransitionFill(nextNoteTime);
      }
      scheduleNote(current16th, nextNoteTime);
      nextNote();
    }
  }

  function startPlayback(){
    if(playing) return;
    const ctx = ensureAudio();
    if(!ctx || !masterGain) return;
    nextNoteTime = ctx.currentTime + 0.05;
    current16th = 0;
    music.barCount = 0;
    playing = true;
    scheduleTimer = setInterval(scheduler, lookahead * 1000);
  }

  function stopPlayback(){
    if(!playing) return;
    playing = false;
    if(scheduleTimer){
      clearInterval(scheduleTimer);
      scheduleTimer = null;
    }
  }

  function fadeMaster(target, time){
    if(!masterGain || !audioCtx) return;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(Math.max(0.0001, target), now, Math.max(0.05, time || 0.2));
  }

  function resolvePresetId(id){
    const alias = id && MOOD_ALIASES[id];
    if(id && MOOD_PRESETS[id]) return id;
    if(alias && MOOD_PRESETS[alias]) return alias;
    return 'somber';
  }

  function applyMood(apiId){
    const presetId = resolvePresetId(apiId);
    const preset = MOOD_PRESETS[presetId] || MOOD_PRESETS.somber;
    currentPresetId = presetId;
    activeMood = apiId || 'explore';
    music.bpm = preset.bpm;
    music.key = preset.key || music.key;
    music.scale = preset.scale;
    music.swing = preset.swing;
    music.density = preset.density;
    music.leadWave = preset.leadWave;
    music.bassWave = preset.bassWave;
    music.barStart = preset.barStart || 'stab';
    music.harmony = Array.isArray(preset.harmony) ? preset.harmony.slice() : [0, 3, 4, 3];
    if(playing){
      // ensure next bar picks up new harmony immediately
      current16th = Math.floor(current16th / stepsPerBar) * stepsPerBar;
    }
  }

  function queueMood(apiId){
    const nextId = apiId || 'explore';
    if(!playing){
      applyMood(nextId);
      music.nextMood = null;
      return;
    }
    if(nextId === activeMood){
      music.nextMood = null;
      return;
    }
    music.nextMood = nextId;
  }

  function chooseMood(){
    let bestId = activeMood;
    let bestPriority = -Infinity;
    for(const info of moodSources.values()){
      if(!info) continue;
      const pri = info.priority ?? (moodPriority[info.id] ?? 0);
      if(pri > bestPriority){
        bestPriority = pri;
        bestId = info.id;
      }
    }
    queueMood(bestId || 'explore');
  }

  function setSourceMood(source: string | null | undefined, id: string | null | undefined, priority?: number){
    const key = source || 'global';
    if(id == null){
      moodSources.delete(key);
    } else {
      const moodId = String(id);
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

  function setEnabled(on){
    enabled = !!on;
    const ctx = ensureAudio();
    if(!enabled){
      stopPlayback();
      fadeMaster(0.0001, 0.2);
      bus?.emit?.('music:state', { enabled });
      return enabled;
    }
    if(!ctx){
      bus?.emit?.('music:state', { enabled });
      return enabled;
    }
    ctx.resume?.();
    fadeMaster(0.25, 0.25);
    startPlayback();
    if(isBrowser){
      loadTone().then(() => {
        try { Tone.start?.(); }
        catch (err) { void err; }
      }).catch(() => {});
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

  function setInstruments(opts){
    if(!opts) return;
    if(opts.lead) instruments.lead = opts.lead;
    if(opts.bass) instruments.bass = opts.bass;
  }

  function getInstruments(){
    return { ...instruments };
  }

  function generateMelody(seed, length){
    const rand = lcg(seed);
    const scale = ['C4', 'D4', 'E4', 'G4', 'A4'];
    const notes = [];
    const len = Math.max(1, length || 8);
    for(let i = 0; i < len; i++){
      const n = scale[Math.floor(rand() * scale.length) % scale.length];
      notes.push({ time: i * 0.5, note: n, dur: 0.5 });
    }
    return notes;
  }

  function lcg(seed){
    let s = (seed >>> 0) || 1;
    return function(){
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
  }

  setSeed(currentSeed);
  applyMood(activeMood);
  moodSources.set(defaultSource, { id: 'explore', priority: moodPriority.explore });

  bus?.on?.('music:seed', (seed) => setSeed(seed));
  bus?.on?.('music:mood', handleMoodEvent);
  bus?.on?.('music:toggle', (on) => setEnabled(on ?? !enabled));

  chiptuneGlobal.Dustland.music = {
    getSeed(){ return currentSeed; },
    setSeed(seed){ setSeed(seed); bus?.emit?.('music:seed', seed); },
    setInstruments,
    getInstruments,
    generateMelody,
    setEnabled,
    toggleEnabled,
    isEnabled,
    getCurrentMood,
    setMood(id, opts){ setSourceMood(opts?.source || 'manual', id, opts?.priority); }
  };
})();
