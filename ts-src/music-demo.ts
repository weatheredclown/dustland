/*
  Chiptune Dynamic Music Lab
  - Plain JS, globals only, no bundlers
  - Generates simple chip-style tracks with mood switching
  - Transitions apply at bar boundaries with short fills
*/

(function () {
  'use strict';

  function byId<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
  }

  // --- DOM ---
  var startBtn = byId<HTMLButtonElement>('startBtn');
  var stopBtn = byId<HTMLButtonElement>('stopBtn');
  var nextBtn = byId<HTMLButtonElement>('nextBtn');
  var tempoEl = byId<HTMLInputElement>('tempo');
  var tempoLabel = byId<HTMLElement>('tempoLabel');
  var seedEl = byId<HTMLInputElement>('seed');
  var keyEl = byId<HTMLSelectElement>('key');
  var moodList = byId<HTMLElement>('moodList');
  var moodInfo = byId<HTMLElement>('moodInfo');
  var nowStat = byId<HTMLElement>('nowStat');
  var barBeat = byId<HTMLElement>('barBeat');
  var scaleLabel = byId<HTMLElement>('scaleLabel');
  var mgBtn = byId<HTMLButtonElement>('mgBtn');
  var mgStatus = byId<HTMLElement>('mgStatus');
  var toneBtn = byId<HTMLButtonElement>('toneBtn');
  var toneStatus = byId<HTMLElement>('toneStatus');
  var fxPulse = byId<HTMLInputElement>('fxPulse');
  var fxPulseLabel = byId<HTMLElement>('fxPulseLabel');
  var fxBits = byId<HTMLInputElement>('fxBits');
  var fxBitsLabel = byId<HTMLElement>('fxBitsLabel');
  var fxDown = byId<HTMLInputElement>('fxDown');
  var fxDownLabel = byId<HTMLElement>('fxDownLabel');
  var fxEcho = byId<HTMLInputElement>('fxEcho');
  var fxEchoLabel = byId<HTMLElement>('fxEchoLabel');
  var downloadJsonBtn = byId<HTMLButtonElement>('downloadJsonBtn');
  var loadJsonBtn = byId<HTMLButtonElement>('loadJsonBtn');
  var loadJsonInput = byId<HTMLInputElement>('loadJsonInput');
  // Disable FX controls until Tone is ready
  [fxPulse, fxBits, fxDown, fxEcho]
    .forEach(function (el) { if (el) el.disabled = true; });
  var harmonyInput = byId<HTMLInputElement>('harmonyInput');
  var moodKeyEl = byId<HTMLSelectElement>('moodKey');
  var moodBpmEl = byId<HTMLInputElement>('moodBpm');
  var moodScaleEl = byId<HTMLSelectElement>('moodScale');
  var moodDensityEl = byId<HTMLInputElement>('moodDensity');
  var moodSwingEl = byId<HTMLInputElement>('moodSwing');
  var moodLeadWaveEl = byId<HTMLSelectElement>('moodLeadWave');
  var moodBassWaveEl = byId<HTMLSelectElement>('moodBassWave');
  var barStartEl = byId<HTMLSelectElement>('barStart');
  var saveMoodBtn = byId<HTMLButtonElement>('saveMoodBtn');
  var seedRows = byId<HTMLElement>('seedRows');
  var addSeedBtn = byId<HTMLButtonElement>('addSeedBtn');
  var clearSeedBtn = byId<HTMLButtonElement>('clearSeedBtn');
  // saveSeedBtn removed: motif edits auto-apply
  var motifList = byId<HTMLElement>('motifList');
  var motifModeEl = byId<HTMLSelectElement>('motifMode');
  var addMotifBtn = byId<HTMLButtonElement>('addMotifBtn');
  var dupMotifBtn = byId<HTMLButtonElement>('dupMotifBtn');
  var delMotifBtn = byId<HTMLButtonElement>('delMotifBtn');
  var jsonOut = byId<HTMLTextAreaElement>('jsonOut');

  // --- Globals & Engine ---
  var ac = null; // AudioContext
  var master = null; // GainNode
  var delay = null; // DelayNode
  var delayGain = null; // GainNode
  var tone = { enabled: false, loading: false, ready: false, synths: null, fx: null };
  var playing = false;
  var scheduleTimer: ReturnType<typeof setInterval> | null = null;
  var lookahead = 0.05; // seconds
  var scheduleAheadTime = 0.2; // seconds
  var current16th = 0; // step index in 16ths
  var nextNoteTime = 0; // when the next note is due
  var stepsPerBar = 16; // 16th notes in 4/4

  // PRNG with seed
  var rngState = 1;
  function setSeed(n) { rngState = (n >>> 0) || 1; }
  function rnd() { // Mulberry32
    var t = rngState += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function randi(a, b) { return (a + Math.floor(rnd() * (b - a + 1))); }

  // Music state
  var music = {
    bpm: 120,
    key: 'G',
    scale: 'minor',
    mood: 'explore',
    nextMood: null,
    swing: 0.0, // 0..0.5
    density: 0.7, // 0..1
    leadWave: 'square',
    bassWave: 'square',
    barStart: 'stab',
    harmony: [0, 3, 4, 3], // chord degrees per bar
    barCount: 0
  };

  // Moods definition (adjectives) with per-mood bpm and key
  var MOODS = [
    { id: 'somber', name: 'Somber', info: 'Low energy, minor tones, rests create space.', key: 'G', bpm: 92, scale: 'minor', swing: 0.02, density: 0.45, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 3, 5, 3], barStart: 'stab' },
    { id: 'angry', name: 'Angry', info: 'Aggressive, tight rhythm, phrygian bite.', key: 'G', bpm: 160, scale: 'phrygian', swing: 0.01, density: 0.95, leadWave: 'square', bassWave: 'square', harmony: [0, 1, 2, 1], barStart: 'stab' },
    { id: 'endangered', name: 'Endangered', info: 'Urgent minor pulse, snare fills.', key: 'G', bpm: 140, scale: 'minor', swing: 0.02, density: 0.85, leadWave: 'square', bassWave: 'square', harmony: [0, 2, 4, 2], barStart: 'stab' },
    { id: 'stealth', name: 'Stealthy', info: 'Sparse, dorian color, hushed hats.', key: 'G', bpm: 100, scale: 'dorian', swing: 0.03, density: 0.35, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 0, 3, 5], barStart: 'stab' },
    { id: 'hopeful', name: 'Hopeful', info: 'Major lift, echoing arps.', key: 'G', bpm: 124, scale: 'major', swing: 0.04, density: 0.7, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 4, 5, 7], barStart: 'stab' },
    { id: 'triumphant', name: 'Triumphant', info: 'Bright cadence, driving hats.', key: 'G', bpm: 132, scale: 'major', swing: 0.05, density: 0.85, leadWave: 'square', bassWave: 'triangle', harmony: [0, 4, 5, 0], barStart: 'stab' },
    { id: 'melancholic', name: 'Melancholic', info: 'Bittersweet minor, wide intervals.', key: 'G', bpm: 110, scale: 'minor', swing: 0.02, density: 0.55, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 5, 3, 2], barStart: 'stab' },
    { id: 'mystery', name: 'Mystery', info: 'Shadowy dorian feel, syncopation.', key: 'G', bpm: 96, scale: 'dorian', swing: 0.0, density: 0.4, leadWave: 'triangle', bassWave: 'square', harmony: [0, 2, 6, 2], barStart: 'stab' },
    { id: 'chill', name: 'Chill', info: 'Laid-back square leads with airy bass.', key: 'G', bpm: 88, scale: 'major', swing: 0.03, density: 0.4, leadWave: 'square', bassWave: 'triangle', harmony: [0, 4, 5, 4], barStart: 'stab' }
  ];

  // Universal seed for JSON config and Magenta basis (shared across moods)
  var globalSeed = [];
  // Global motif sets: each motif is an array of seed notes for one bar
  var motifs = [];
  var selectedMotifIndex = -1; // for editing
  var activeMotifIndex = -1;   // used in playback this bar
  var motifMode = 'improv';    // 'repeat' | 'improv'
  var motifBarMap = {};        // barIndex -> array of events (after variation)

  // Build mood UI
  MOODS.forEach(function (m) {
    var btn = document.createElement('div');
    btn.textContent = m.name;
    btn.className = 'mood-btn';
    btn.dataset.mood = m.id;
    btn.title = m.info;
    btn.onclick = function () { requestMood(m.id); };
    moodList.appendChild(btn);
  });

  function setActiveMoodBtn(id) {
    if (!moodList) return;
    var nodes = moodList.children;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i] as HTMLElement;
      if (n.dataset.mood === id) n.classList.add('active'); else n.classList.remove('active');
    }
  }

  // Scale helpers
  var BASES = { 'C': 60, 'D': 62, 'E': 64, 'F': 65, 'G': 67, 'A': 69, 'B': 71 };
  var SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10]
  };
  function scaleOf(key, name) { return SCALES[name] || SCALES.minor; }
  function midiFromDegree(key, scaleName, degree, octaveOffset) {
    var base = BASES[key] || 60;
    var sc = scaleOf(key, scaleName);
    var idx = ((degree % sc.length) + sc.length) % sc.length;
    var oct = Math.floor(degree / sc.length) + (octaveOffset || 0);
    return base + sc[idx] + (12 * oct);
  }
  function hzFromMidi(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // Groove helpers: dynamics, microtiming, and Euclidean distribution
  function velocityForStep(step) {
    var beatInBar = step % stepsPerBar;
    if (beatInBar % 4 === 0) return 0.9;   // strong
    if (beatInBar % 4 === 2) return 0.7;   // medium
    if (beatInBar % 2 === 0) return 0.5;   // light
    return 0.35;                            // off accents
  }

  function microtime(step) {
    // deterministic tiny wobble for non-strong steps (±3ms)
    var beatInBar = step % stepsPerBar;
    if (beatInBar % 4 === 0) return 0;
    var s = ((step * 1103515245 + rngState) >>> 0) / 4294967296;
    return (s - 0.5) * 0.003;
  }

  function euclid(steps, pulses, rot) {
    steps = Math.max(1, steps | 0);
    pulses = Math.max(0, Math.min(steps, pulses | 0));
    var pattern = [];
    if (pulses === 0) { for (var z = 0; z < steps; z++) pattern.push(0); return pattern; }
    if (pulses === steps) { for (var y = 0; y < steps; y++) pattern.push(1); return pattern; }
    var counts = [], remainders = [], divisor = steps - pulses;
    remainders[0] = pulses;
    var level = 0;
    while (remainders[level] > 1) {
      counts[level] = Math.floor(divisor / remainders[level]);
      remainders[level + 1] = divisor % remainders[level];
      divisor = remainders[level];
      level++;
    }
    counts[level] = divisor;
    var r = function (l) {
      if (l === -1) { pattern.push(0); }
      else if (l === -2) { pattern.push(1); }
      else { for (var i = 0; i < counts[l]; i++) r(l - 1); if (remainders[l] !== 0) r(l - 2); }
    };
    r(level);
    var rotN = ((rot || 0) % steps + steps) % steps; return pattern.slice(rotN).concat(pattern.slice(0, rotN));
  }

  // Audio node helpers
  function envGate(time, attack, decay, sustain, release, duration) {
    // Returns { gain, scheduleRelease }
    var g = ac.createGain();
    g.gain.cancelScheduledValues(time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(1.0, time + attack);
    g.gain.exponentialRampToValueAtTime(sustain, time + attack + decay);
    var relAt = time + (duration || 0);
    function scheduleRelease(t) {
      var rt = Math.max(t || relAt, ac.currentTime);
      g.gain.cancelScheduledValues(rt);
      g.gain.setValueAtTime(g.gain.value || sustain, rt);
      g.gain.exponentialRampToValueAtTime(0.0001, rt + release);
    }
    return { gain: g, scheduleRelease: scheduleRelease };
  }

  function mkOsc(type, freq?, time?) {
    var o = ac.createOscillator();
    o.type = type;
    if (freq != null) o.frequency.setValueAtTime(freq, time || ac.currentTime);
    return o;
  }

  function noiseBuffer() {
    var len = ac.sampleRate * 1.0;
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  var cachedNoise = null;
  function mkNoise() {
    if (!cachedNoise) cachedNoise = noiseBuffer();
    var s = ac.createBufferSource();
    s.buffer = cachedNoise;
    s.loop = true;
    return s;
  }

  // Drums
  function playKick(t, vel) {
    if (tone.enabled && tone.ready && tone.synths) {
      var when = (window.Tone && Tone.now) ? Tone.now() + Math.max(0, t - ac.currentTime) : undefined;
      tone.synths.kick.triggerAttackRelease('C2', 0.12, when, (vel != null ? vel : 0.9));
      return;
    }
    var o = mkOsc('sine');
    var e = envGate(t, 0.001, 0.05, 0.0001, 0.08, 0.12);
    var g = e.gain;
    var k = ac.createGain(); k.gain.setValueAtTime(((vel != null ? vel : 1) * 1.2), t);
    o.connect(g).connect(k).connect(master);
    // pitch drop
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.1);
    o.start(t);
    o.stop(t + 0.25);
    e.scheduleRelease(t + 0.12);
  }

  function playSnare(t, tight, vel?) {
    if (tone.enabled && tone.ready && tone.synths) {
      var when = (window.Tone && Tone.now) ? Tone.now() + Math.max(0, t - ac.currentTime) : undefined;
      tone.synths.snare.noise.type = 'white';
      tone.synths.snare.envelope.decay = tight ? 0.05 : 0.12;
      tone.synths.snare.triggerAttackRelease(tight ? 0.06 : 0.12, when, (vel != null ? vel : 0.7));
      return;
    }
    var s = mkNoise();
    var e = envGate(t, 0.001, 0.05, 0.0001, 0.1, tight ? 0.03 : 0.08);
    var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.setValueAtTime(1200, t);
    var g = ac.createGain(); g.gain.setValueAtTime(((tight ? 0.3 : 0.45) * (vel != null ? vel : 1)), t);
    s.connect(hp).connect(e.gain).connect(g).connect(master);
    s.start(t);
    s.stop(t + 0.2);
    e.scheduleRelease(t + (tight ? 0.04 : 0.1));
  }

  function playHat(t, open, vel) {
    if (tone.enabled && tone.ready && tone.synths) {
      var when = (window.Tone && Tone.now) ? Tone.now() + Math.max(0, t - ac.currentTime) : undefined;
      tone.synths.hat.envelope.decay = open ? 0.08 : 0.03;
      tone.synths.hat.triggerAttackRelease(open ? 0.06 : 0.03, when, (vel != null ? vel : 0.5));
      return;
    }
    var s = mkNoise();
    var e = envGate(t, 0.001, 0.02, 0.0001, 0.05, open ? 0.06 : 0.02);
    var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.setValueAtTime(6000, t);
    var g = ac.createGain(); g.gain.setValueAtTime(((open ? 0.18 : 0.12) * (vel != null ? vel : 1)), t);
    s.connect(hp).connect(e.gain).connect(g).connect(master);
    s.start(t);
    s.stop(t + 0.15);
    e.scheduleRelease(t + (open ? 0.08 : 0.03));
  }

  // Instruments
  function playBassNote(midi, t, dur, vel) {
    var f = hzFromMidi(midi);
    if (tone.enabled && tone.ready && tone.synths) {
      var when = (window.Tone && Tone.now) ? Tone.now() + Math.max(0, t - ac.currentTime) : undefined;
      tone.synths.bass.frequency.setValueAtTime(f, when);
      tone.synths.bass.triggerAttackRelease(f, dur, when, (vel != null ? vel * 0.9 : 0.9));
      return;
    }
    var o = mkOsc(music.bassWave, f, t);
    var e = envGate(t, 0.003, 0.06, 0.2, 0.06, dur * 0.9);
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1800, t);
    var g = ac.createGain(); g.gain.setValueAtTime(0.3 * (vel != null ? vel : 1), t);
    o.connect(e.gain).connect(lp).connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.1);
    e.scheduleRelease(t + dur * 0.9);
  }

  function playLeadNote(midi, t, dur, vel) {
    if (typeof clampMidiToScale === 'function') {
      midi = clampMidiToScale(midi, music.key, music.scale);
    }
    if (tone.enabled && tone.ready && tone.synths) {
      var note = (window.mm && window.mm.pitchToNote ? window.mm.pitchToNote(midi) : undefined);
      var when = (window.Tone && Tone.now) ? Tone.now() + Math.max(0, t - ac.currentTime) : undefined;
      var n = note || hzFromMidi(midi);
      tone.synths.lead.triggerAttackRelease(n, dur, when, (vel != null ? vel : 0.7));
      return;
    }
    var f = hzFromMidi(midi);
    var o = mkOsc(music.leadWave, f, t);
    var e = envGate(t, 0.004, 0.05, 0.3, 0.1, dur * 0.85);
    var g = ac.createGain(); g.gain.setValueAtTime(0.18 * (vel != null ? vel : 1), t);
    o.connect(e.gain).connect(g).connect(delay).connect(delayGain).connect(master);
    o.start(t);
    o.stop(t + dur + 0.12);
    e.scheduleRelease(t + dur * 0.85);
  }

  // Simple chord stab at bar start to expose harmony changes
  function playChordStab(degree, t) {
    var root = midiFromDegree(music.key, music.scale, degree, -1);
    var third = midiFromDegree(music.key, music.scale, degree + 2, -1);
    var fifth = midiFromDegree(music.key, music.scale, degree + 4, -1);
    var dur = secondsPer16th() * 3;
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.18, t + 0.005);
    g.gain.linearRampToValueAtTime(0.0, t + dur);
    var o1 = mkOsc('square', hzFromMidi(root), t);
    var o2 = mkOsc('square', hzFromMidi(third), t);
    var o3 = mkOsc('square', hzFromMidi(fifth), t);
    o1.connect(g); o2.connect(g); o3.connect(g);
    g.connect(master);
    o1.start(t); o2.start(t); o3.start(t);
    var stopAt = t + dur + 0.02;
    o1.stop(stopAt); o2.stop(stopAt); o3.stop(stopAt);
  }

  function playChordArp(degree, t) {
    var root = midiFromDegree(music.key, music.scale, degree, -1);
    var third = midiFromDegree(music.key, music.scale, degree + 2, -1);
    var fifth = midiFromDegree(music.key, music.scale, degree + 4, -1);
    var notes = [root, third, fifth];
    var step = secondsPer16th() * 0.5;
    for (var i = 0; i < notes.length; i++) {
      var nt = t + i * step;
      var o = mkOsc('square', hzFromMidi(notes[i]), nt);
      var e = envGate(nt, 0.004, 0.05, 0.3, 0.1, step * 0.85);
      var g = ac.createGain(); g.gain.setValueAtTime(0.18, nt);
      o.connect(e.gain).connect(g).connect(master);
      o.start(nt);
      o.stop(nt + step + 0.02);
      e.scheduleRelease(nt + step * 0.85);
    }
  }

  function playBarIntro(degree, t) {
    if (music.barStart === 'arp') playChordArp(degree, t);
    else if (music.barStart === 'stab') playChordStab(degree, t);
  }

  // Timing helpers
  function secondsPerBeat() { return 60.0 / music.bpm; }
  function secondsPer16th() { return secondsPerBeat() / 4.0; }

  function scheduleNote(step, t) {
    // Swing on off-16ths (every second 16th inside an 8th)
    var swing = music.swing;
    if (swing > 0 && (step % 2 === 1)) t += secondsPer16th() * swing;
    // Microtiming wobble
    var t2 = t + microtime(step);
    var vel = velocityForStep(step);

    var beatInBar = step % stepsPerBar;
    var isKick = (beatInBar % 4 === 0);
    var isSnare = (beatInBar % 8 === 4);
    // Euclidean hats per bar, rotated by bar index
    var bar = Math.floor(step / stepsPerBar);
    var hatPulses = Math.max(4, Math.round(music.density * 10));
    var hatPattern = euclid(stepsPerBar, hatPulses, bar % stepsPerBar);

    // Density affects extra hits
    if (isKick) playKick(t2, vel);
    if (isSnare) playSnare(t2, false, vel);
    if (hatPattern[beatInBar]) playHat(t2, (music.density > 0.8) && (beatInBar % 4 === 2), vel);

    // On bar start, play intro pattern per setting
    if (beatInBar === 0) {
      playBarIntro((music.harmony[Math.floor(step / stepsPerBar) % music.harmony.length] || 0), t2);
    }

    // Bass pattern: root or fifth of current chord degree (more deterministic)
    var deg = (music.harmony[bar % music.harmony.length] || 0);
    var root = midiFromDegree(music.key, music.scale, deg, -2);
    var fifth = midiFromDegree(music.key, music.scale, deg + 4, -2);
    var bassNote;
    if (beatInBar % 8 === 0) bassNote = root; // strong downbeats
    else if (beatInBar % 4 === 2) bassNote = fifth; // mid-beat accent
    else bassNote = root;
    playBassNote(bassNote, t2, secondsPer16th() * 2, vel);

    // Lead: prefer Magenta override for this bar; otherwise motif events for this bar; otherwise seed rows; fallback to procedural
    var stepInBar = beatInBar;
    var barIndex = Math.floor(step / stepsPerBar);
    var override = mg.leadOverride[barIndex];
    if (override && override.length) {
      for (var i = 0; i < override.length; i++) {
        var ev = override[i];
        if (ev.step === stepInBar) playLeadNote(ev.midi, t2, secondsPer16th() * (ev.durSteps || 2), vel);
      }
    } else if (motifBarMap[barIndex] && motifBarMap[barIndex].length) {
      var mev = motifBarMap[barIndex];
      for (var k = 0; k < mev.length; k++) {
        var evm = mev[k];
        if (evm.step === stepInBar) playLeadNote(evm.midi, t2, secondsPer16th() * (evm.durSteps || 2), vel);
      }
    } else if (globalSeed && globalSeed.length) {
      for (var j = 0; j < globalSeed.length; j++) {
        var s = globalSeed[j];
        if ((s.step | 0) === stepInBar) {
          var sd = (s.degree | 0) + deg; // transpose by harmony degree
          var lm = midiFromDegree(music.key, music.scale, sd, 0);
          var ld = secondsPer16th() * Math.max(1, (s.dur | 0) || 2);
          playLeadNote(lm, t2, ld, vel);
        }
      }
    } else {
      // Broader, two-octave arpeggio with an upper octave overlay
      var pattern = [0, 4, 7, 12, 7, 4, 0, 7];
      var idx = Math.floor(stepInBar / 2) % pattern.length;
      if (stepInBar % 2 === 0) {
        var pickDeg = deg + pattern[idx];
        var leadMidi = midiFromDegree(music.key, music.scale, pickDeg, 0);
        var dur = secondsPer16th() * 2;
        var mainVel = Math.min(1, vel + 0.2);
        playLeadNote(leadMidi, t, dur, mainVel);
        var upperMidi = midiFromDegree(music.key, music.scale, pickDeg, 1);
        playLeadNote(upperMidi, t, dur, mainVel * 0.6);
      }
    }
  }

  function scheduleTransitionFill(barStartTime) {
    // Simple riser and snare roll in last half bar
    var halfBar = secondsPerBeat() * 2;
    var t0 = barStartTime + halfBar + secondsPer16th();
    // Snare 16th roll
    for (var i = 0; i < 8; i++) playSnare(t0 + i * secondsPer16th() * 0.5, true);
    // Noise riser
    var s = mkNoise();
    var g = ac.createGain(); g.gain.setValueAtTime(0.001, t0);
    g.gain.exponentialRampToValueAtTime(0.2, t0 + halfBar - 0.05);
    var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(800, t0);
    s.connect(bp).connect(g).connect(master);
    s.start(t0);
    s.stop(t0 + halfBar);
  }

  function applyMood(id) {
    var m = MOODS.find(function (x) { return x.id === id; }) || MOODS[0];
    music.mood = m.id;
    music.bpm = m.bpm;
    music.key = m.key || music.key;
    music.scale = m.scale;
    music.swing = m.swing;
    music.density = m.density;
    music.leadWave = m.leadWave;
    music.bassWave = m.bassWave;
    music.barStart = m.barStart || 'stab';
    music.harmony = m.harmony.slice();
    setActiveMoodBtn(m.id);
    var sc = scaleOf(music.key, music.scale).join(',');
    scaleLabel.textContent = music.key + ' ' + music.scale + ' [' + sc + ']';
    moodInfo.textContent = m.name + ': ' + m.info;
    // Reflect UI: per-mood bpm/key and harmony
    if (tempoEl) { tempoEl.value = String(music.bpm); tempoLabel.textContent = music.bpm + ' BPM'; }
    if (keyEl) { keyEl.value = music.key; }
    if (harmonyInput) harmonyInput.value = (m.harmony || []).join(',');
    if (barStartEl) barStartEl.value = music.barStart;
    if (moodKeyEl) moodKeyEl.value = music.key;
    if (moodBpmEl) moodBpmEl.value = String(music.bpm);
    if (moodScaleEl) moodScaleEl.value = music.scale;
    if (moodDensityEl) moodDensityEl.value = String(music.density);
    if (moodSwingEl) moodSwingEl.value = String(music.swing);
    if (moodLeadWaveEl) moodLeadWaveEl.value = music.leadWave;
    if (moodBassWaveEl) moodBassWaveEl.value = music.bassWave;
    loadSeedRows();
    renderConfig();
  }

  // Optional Magenta VAE integration for lead interpolation
  type LeadOverrideEvent = { step: number; midi: number; durSteps?: number };
  type LeadOverrideMap = Record<number, LeadOverrideEvent[]>;

  interface Note {
    pitch: number;
    quantizedStartStep: number;
    quantizedEndStep: number;
    velocity: number;
    isDrum: boolean;
  }

  interface NoteSequence {
    ticksPerQuarter: number;
    totalTime?: number;
    tempos?: { qpm: number }[];
    notes: Note[];
    totalQuantizedSteps: number;
    quantizationInfo: { stepsPerQuarter: number };
  }

  var mg = {
    enabled: false,
    loading: false,
    ready: false,
    vae: null as {
      initialize: () => Promise<void>;
      interpolate: (inputs: NoteSequence[], count: number) => Promise<NoteSequence[]>;
    } | null,
    leadOverride: {} as LeadOverrideMap
  };
  function setMgStatus(text) { if (mgStatus) mgStatus.textContent = 'Magenta: ' + text; }
  function loadScript(src) {
    return new Promise<void>(function (resolve, reject) {
      var s = document.createElement('script'); s.async = true; s.crossOrigin = 'anonymous'; s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function loadMagenta() {
    if (mg.loading || mg.ready) { if (!mg.loading) setMgStatus('ready'); return; }
    mg.loading = true; setMgStatus('loading libs…');
    loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.8.6/dist/tf.min.js')
      .then(function () { return loadScript('https://cdn.jsdelivr.net/npm/@magenta/music@1.23.1/dist/magentamusic.js'); })
      .then(function () {
        setMgStatus('initializing model…');
        var ckpt = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small';
        mg.vae = new window.mm.MusicVAE(ckpt);
        return mg.vae.initialize();
      })
      .then(function () { mg.ready = true; mg.enabled = true; setMgStatus('ready'); })
      .catch(function (e) { mg.loading = false; setMgStatus('failed: ' + e.message); });
  }

  function degreesSeedFallback(deg) {
    return [{ step: 0, degree: deg, dur: 2 }, { step: 4, degree: deg, dur: 2 }, { step: 8, degree: deg + 2, dur: 2 }, { step: 12, degree: deg, dur: 2 }];
  }

  function seedToNoteSequenceDegrees(key, scaleName, degForFallback) {
    var seed = (globalSeed && globalSeed.length) ? globalSeed.slice() : degreesSeedFallback(degForFallback || 0);
    var ns = { ticksPerQuarter: 220, totalTime: 0, tempos: [{ qpm: music.bpm }], notes: [], totalQuantizedSteps: stepsPerBar, quantizationInfo: { stepsPerQuarter: 4 } };
    for (var i = 0; i < seed.length; i++) {
      var n = seed[i];
      var midi = midiFromDegree(key, scaleName, n.degree, 0);
      var start = Math.max(0, Math.min(stepsPerBar - 1, (n.step | 0)));
      var end = Math.max(start + 1, Math.min(stepsPerBar, start + Math.max(1, (n.dur | 0) || 2)));
      ns.notes.push({ pitch: midi, quantizedStartStep: start, quantizedEndStep: end, velocity: 100, isDrum: false });
    }
    return ns;
  }

  function eventsFromNoteSequence(ns) {
    var arr = [];
    if (ns.quantizationInfo || typeof ns.totalQuantizedSteps === 'number') {
      var notes = ns.notes || [];
      for (var i = 0; i < notes.length; i++) {
        var q = notes[i];
        var st = (q.quantizedStartStep | 0);
        var en = (q.quantizedEndStep | 0);
        var step = Math.max(0, Math.min(stepsPerBar - 1, st));
        var dur = Math.max(1, Math.min(stepsPerBar - step, en - st));
        arr.push({ step: step, midi: q.pitch | 0, durSteps: dur });
      }
    } else if (window.mm && window.mm.sequences && ns.tempos && ns.notes) {
      try {
        var qns = window.mm.sequences.quantizeNoteSequence(ns, 4);
        return eventsFromNoteSequence(qns);
      } catch (e) { /* ignore */ void e; }
    }
    arr.sort(function (a, b) { return a.step - b.step; });
    return arr;
  }

  function scheduleMagentaInterpolationForBar(barIndex, nextMoodId) {
    if (!mg.ready || !mg.vae) return;
    var currMood = MOODS.find(function (x) { return x.id === music.mood; });
    var nextMood = MOODS.find(function (x) { return x.id === nextMoodId; });
    var a = seedToNoteSequenceDegrees(music.key, music.scale, (currMood && currMood.harmony && currMood.harmony[0]) || 0);
    var b = seedToNoteSequenceDegrees((nextMood && nextMood.key) || music.key, (nextMood && nextMood.scale) || music.scale, (nextMood && nextMood.harmony && nextMood.harmony[0]) || 0);
    // Ensure inputs are quantized NoteSequences for the VAE
    try {
      if (window.mm && window.mm.sequences) {
        if (!a.quantizationInfo) a = window.mm.sequences.quantizeNoteSequence(a, 4);
        if (!b.quantizationInfo) b = window.mm.sequences.quantizeNoteSequence(b, 4);
      }
    } catch (e) { /* best-effort */ void e; }
    setMgStatus('interpolating…');
    mg.vae.interpolate([a, b], 5)
      .then(function (out) {
        if (!out || !out.length) throw new Error('no sequences');
        var barEvents = [];
        for (var i = 1; i < out.length - 1; i++) { // use interior sequences
          var seq = out[i] as any;
          if (!seq) continue;
          if (!seq.quantizationInfo && window.mm && window.mm.sequences) {
            try { seq = window.mm.sequences.quantizeNoteSequence(seq, 4); } catch (e) { /* ignore */ void e; }
          }
          // Split 2-bar sequence into two one-bar chunks
          for (var off = 0; off <= stepsPerBar; off += stepsPerBar) {
            var ns = { ticksPerQuarter: 220, totalQuantizedSteps: stepsPerBar, quantizationInfo: { stepsPerQuarter: 4 }, notes: [] };
            var notes = (seq as any).notes || [];
            for (var j = 0; j < notes.length; j++) {
              var q = notes[j];
              var st = (q.quantizedStartStep | 0) - off;
              var en = (q.quantizedEndStep | 0) - off;
              if (st < 0 || st >= stepsPerBar) continue;
              var adjEn = Math.max(st + 1, Math.min(stepsPerBar, en));
              ns.notes.push({ pitch: q.pitch | 0, quantizedStartStep: st, quantizedEndStep: adjEn, velocity: q.velocity || 100, isDrum: !!q.isDrum });
            }
            var ev = eventsFromNoteSequence(ns);
            if (ev && ev.length) barEvents.push(ev);
            if (barEvents.length >= 4) break; // cap to 4 bars
          }
          if (barEvents.length >= 4) break;
        }
        for (var k = 0; k < barEvents.length; k++) mg.leadOverride[barIndex + 1 + k] = barEvents[k];
        setMgStatus('transition ready (' + barEvents.length + ' bars)');
      })
      .catch(function (e) { setMgStatus('interpolate failed: ' + e.message); });
  }

  function requestMood(id) {
    if (!playing) { applyMood(id); return; }
    if (music.mood === id) return;
    music.nextMood = id;
    moodInfo.textContent = 'Queued "' + id + '" for next bar...';
  }

  function nextNote() {
    nextNoteTime += secondsPer16th();
    current16th++;
    if (current16th % stepsPerBar === 0) {
      music.barCount++;
      // At bar boundary, apply pending mood
      if (music.nextMood) {
        applyMood(music.nextMood);
        music.nextMood = null;
      } else {
        // No mood change: pull latest user-typed harmony from textbox and apply
        if (harmonyInput) {
          var txt = (harmonyInput.value || '').split(',');
          var arr = [];
          for (var i = 0; i < txt.length; i++) {
            var v = parseInt(txt[i], 10);
            if (!isNaN(v)) arr.push(v);
          }
          if (arr.length) {
            music.harmony = arr.slice();
            var idx = MOODS.findIndex(function (x) { return x.id === music.mood; });
            if (idx >= 0) MOODS[idx].harmony = arr.slice();
            renderConfig();
          }
        }
      }
      // Choose motif for this bar and prepare its events
      chooseActiveMotifForBar(Math.floor(current16th / stepsPerBar));
      // prune old Magenta overrides
      var old = music.barCount - 2; if (mg.leadOverride[old]) delete mg.leadOverride[old];
    }
  }

  function scheduler() {
    while (playing && nextNoteTime < ac.currentTime + scheduleAheadTime) {
      // When we hit a new bar, consider scheduling a transition fill if mood switch is pending
      if (current16th % stepsPerBar === 0 && music.nextMood) {
        scheduleTransitionFill(nextNoteTime);
        if (mg.ready) scheduleMagentaInterpolationForBar(Math.floor(current16th / stepsPerBar), music.nextMood);
      }
      scheduleNote(current16th, nextNoteTime);
      nextNote();
    }
  }

  function updateHud() {
    if (!playing) { nowStat.textContent = 'stopped'; return; }
    var bar = Math.floor(current16th / stepsPerBar);
    var currDeg = (music.harmony[bar % music.harmony.length] || 0);
    var motifName = (motifs[activeMotifIndex] && motifs[activeMotifIndex].name) || '';
    nowStat.textContent = music.mood + ' @ ' + music.bpm + ' BPM  |  chord deg ' + currDeg + (motifName ? ('  |  motif ' + motifName) : '');
    var beat = (current16th % 16) / 4 + 1;
    barBeat.textContent = (bar + 1) + ' / ' + Math.floor(beat);
  }

  function start() {
    if (playing) return;
    if (!ac) {
      var ContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!ContextCtor) return;
      ac = new ContextCtor();
      master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
      delay = ac.createDelay(0.5); delay.delayTime.value = 0.22;
      delayGain = ac.createGain(); delayGain.gain.value = 0.25;
    }
    if (tone.enabled && window.Tone && !tone.ready) {
      // ensure Tone audio context is started
      Tone.start().then(function () { /* started */ }).catch(function () { });
    }
    // Sync to next whole 16th to keep changes musical
    var t = ac.currentTime + 0.05;
    nextNoteTime = t;
    current16th = 0;
    music.barCount = 0;
    playing = true;
    scheduleTimer = setInterval(scheduler, lookahead * 1000);
  }

  function stop() {
    if (!playing) return;
    playing = false;
    if (scheduleTimer) {
      clearInterval(scheduleTimer);
      scheduleTimer = null;
    }
  }

  // UI wiring
  if (startBtn && seedEl) {
    startBtn.onclick = function () {
      if (!ac) setSeed(parseInt(seedEl.value || '1', 10));
      start();
    };
  }
  if (stopBtn) stopBtn.onclick = function () { stop(); };
  if (nextBtn) nextBtn.onclick = function () { if (playing) music.nextMood = music.nextMood || music.mood; };
  // Apply current harmony edits when switching moods via click
  if (moodList) {
    moodList.addEventListener('click', function (e) {
      var target = e.target as HTMLElement | null;
      if (target?.dataset?.mood) {
        persistHarmonyFromInput();
      }
    }, true);
  }

  if (tempoEl) tempoEl.oninput = function () {
    var v = parseInt(tempoEl.value, 10);
    if (tempoLabel) tempoLabel.textContent = v + ' BPM';
    music.bpm = v;
    // persist per-mood tempo
    var idx = MOODS.findIndex(function (x) { return x.id === music.mood; });
    if (idx >= 0) MOODS[idx].bpm = v;
    renderConfig();
  };
  if (keyEl) keyEl.onchange = function () {
    music.key = keyEl.value;
    var idx = MOODS.findIndex(function (x) { return x.id === music.mood; });
    if (idx >= 0) MOODS[idx].key = music.key;
    if (scaleLabel) scaleLabel.textContent = music.key + ' ' + music.scale;
    renderConfig();
  };
  seedEl.onchange = function () { setSeed(parseInt(seedEl.value || '1', 10)); };
  if (mgBtn) mgBtn.onclick = function () { loadMagenta(); };
  if (toneBtn) toneBtn.onclick = function () { loadTone(); };

  function loadTone() {
    if (tone.loading || tone.ready) { if (!tone.loading) toneStatus && (toneStatus.textContent = 'Tone: ready'); return; }
    tone.loading = true; if (toneStatus) toneStatus.textContent = 'Tone: loading…';
    loadScript('https://cdn.jsdelivr.net/npm/tone/build/Tone.js')
      .then(function () {
        // Build synth graph with master conditioning and subtle motion
        var masterHP = new Tone.Filter(60, 'highpass');
        masterHP.toDestination();
        var limiter = new Tone.Limiter(-1);
        limiter.connect(masterHP);

        // Keep tones bright and crisp; light echo only
        var leadPre = new Tone.Filter(10000, 'lowpass');
        var leadDelay = new Tone.FeedbackDelay(0.22, 0.3);
        leadDelay.wet.value = 0.1;
        var crusher = new Tone.BitCrusher(5);
        var ping = new Tone.PingPongDelay(0.22, 0.25);
        ping.wet.value = 0.1;

        var lead = new Tone.Synth({
          oscillator: { type: 'pulse', width: 0.25 },
          envelope: { attack: 0.002, decay: 0.05, sustain: 0.2, release: 0.08 }
        }).connect(leadPre).connect(leadDelay).connect(crusher).connect(ping).connect(limiter);

        // PWM + vibrato movement
        try {
          var pwm = new Tone.LFO({ frequency: 0.8, min: 0.12, max: 0.5 }).start();
          pwm.connect(lead.oscillator.width);
          // Vibrato removed to keep chip clarity; PWM provides motion
        } catch (e) { /* best-effort */ void e; }

        var bass = new Tone.MonoSynth({
          oscillator: { type: 'square' },
          filter: { type: 'lowpass', Q: 0 },
          filterEnvelope: { attack: 0.001, decay: 0.01, sustain: 1.0, release: 0.01, baseFrequency: 18000, octaves: 0 },
          envelope: { attack: 0.002, decay: 0.06, sustain: 0.22, release: 0.06 }
        }).connect(limiter);

        var kick = new Tone.MembraneSynth({ pitchDecay: 0.02, octaves: 5, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0.0, release: 0.06 } }).connect(limiter);
        var snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0 } }).connect(limiter);
        var hat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 } }).connect(limiter);

        tone.synths = { lead: lead, bass: bass, kick: kick, snare: snare, hat: hat };
        tone.fx = { crusher: crusher, color: leadPre, ping: ping, delay: leadDelay, limiter: limiter, hp: masterHP };
        tone.ready = true; tone.enabled = true; if (toneStatus) toneStatus.textContent = 'Tone: ready';
        bindFxControls();
      })
      .catch(function (e) { tone.loading = false; if (toneStatus) toneStatus.textContent = 'Tone: failed (' + e.message + ')'; });
  }

  function bindFxControls() {
    if (!tone.fx) return;
    // Ensure obvious defaults
    try {
      tone.fx.ping.wet.value = parseFloat(fxEcho && fxEcho.value || '0.10');
      tone.fx.crusher.bits = parseInt(fxBits && fxBits.value || '5', 10);
      var ds = parseFloat(fxDown && fxDown.value || '0.85');
      var freq = 2000 + ds * 12000; // brighter range for chip bite
      tone.fx.color.frequency.setValueAtTime(freq, Tone.now());
      if (tone.synths && tone.synths.lead.oscillator && tone.synths.lead.oscillator.width && fxPulse) {
        tone.synths.lead.oscillator.width.value = parseFloat(fxPulse.value || '0.25');
      }
    } catch (e) { /* ignore */ void e; }
    // Enable controls
    [fxPulse, fxBits, fxDown, fxEcho].forEach(function (el) { if (el) el.disabled = false; });
    if (fxPulse) fxPulse.oninput = function () {
      var v = parseFloat(fxPulse.value || '0.5'); if (fxPulseLabel) fxPulseLabel.textContent = v.toFixed(2);
      try { if (tone.synths && tone.synths.lead.oscillator && tone.synths.lead.oscillator.width) tone.synths.lead.oscillator.width.value = v; } catch (e) { /* ignore */ void e; }
    };
    if (fxBits) fxBits.oninput = function () {
      var bits = parseInt(fxBits.value || '5', 10); if (fxBitsLabel) fxBitsLabel.textContent = bits + ' bits';
      try { tone.fx.crusher.bits = bits; } catch (e) { /* ignore */ void e; }
    };
    if (fxDown) fxDown.oninput = function () {
      var v = parseFloat(fxDown.value || '0.85'); if (fxDownLabel) fxDownLabel.textContent = v.toFixed(2);
      try { var freq2 = 2000 + v * 12000; tone.fx.color.frequency.setValueAtTime(freq2, Tone.now()); } catch (e) { /* ignore */ void e; }
    };
    if (fxEcho) fxEcho.oninput = function () {
      var v = parseFloat(fxEcho.value || '0.10'); if (fxEchoLabel) fxEchoLabel.textContent = v.toFixed(2);
      try { tone.fx.ping.wet.value = v; } catch (e) { /* ignore */ void e; }
    };
  }

  if (downloadJsonBtn) downloadJsonBtn.onclick = function () {
    try {
      var text = jsonOut && jsonOut.textContent ? jsonOut.textContent : JSON.stringify({});
      var blob = new Blob([text], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'music-config.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) { console.error('download failed', e); }
  };
  if (loadJsonBtn && loadJsonInput) {
    loadJsonBtn.onclick = function () { loadJsonInput.click(); };
    loadJsonInput.onchange = function () {
      var file = loadJsonInput.files && loadJsonInput.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var cfg = JSON.parse(String(reader.result || '{}'));
          if (Array.isArray(cfg.seedNotes)) { globalSeed = cfg.seedNotes.slice(); }
          if (Array.isArray(cfg.motifs)) {
            motifs = [];
            for (var i = 0; i < cfg.motifs.length; i++) {
              var cm = cfg.motifs[i] || {};
              var name = cm.name ? String(cm.name) : ('Motif ' + (i + 1));
              var notes = Array.isArray(cm.notes) ? cm.notes.map(function (n) { return { step: (n.step | 0), degree: (n.degree | 0), dur: (n.dur | 0) || 2 }; }) : [];
              motifs.push({ id: 'motif' + (i + 1), name: name, notes: notes });
            }
            selectedMotifIndex = Math.min(Math.max(0, selectedMotifIndex), Math.max(0, motifs.length - 1));
          }
          if (cfg.motifMode === 'repeat' || cfg.motifMode === 'improv') motifMode = cfg.motifMode;
          if (cfg.moods) {
            MOODS.forEach(function (m) {
              var mm = cfg.moods[m.id];
              if (mm) {
                if (mm.key) m.key = mm.key;
                if (typeof mm.bpm === 'number') m.bpm = mm.bpm;
                if (mm.scale) m.scale = mm.scale;
                if (typeof mm.swing === 'number') m.swing = mm.swing;
                if (typeof mm.density === 'number') m.density = mm.density;
                if (mm.leadWave) m.leadWave = mm.leadWave;
                if (mm.bassWave) m.bassWave = mm.bassWave;
                if (mm.barStart) m.barStart = mm.barStart;
                if (Array.isArray(mm.harmony)) m.harmony = mm.harmony.slice();
              }
            });
          }
          // Refresh UI for current mood and seed rows
          applyMood(music.mood);
          ensureDefaultMotif();
          renderMotifList();
          loadSeedRows();
          if (motifModeEl) motifModeEl.value = motifMode;
          renderConfig();
        } catch (e) { console.error('load json failed', e); }
      };
      reader.readAsText(file);
    };
  }

  function persistMoodFromInputs() {
    var m = MOODS.find(function (x) { return x.id === music.mood; });
    if (!m) return;
    if (moodKeyEl) { m.key = music.key = moodKeyEl.value; if (keyEl) keyEl.value = music.key; }
    if (moodBpmEl) { m.bpm = music.bpm = parseInt(moodBpmEl.value, 10) || m.bpm; if (tempoEl) { tempoEl.value = String(music.bpm); tempoLabel.textContent = music.bpm + ' BPM'; } }
    if (moodScaleEl) { m.scale = music.scale = moodScaleEl.value; }
    if (moodDensityEl) { var d = parseFloat(moodDensityEl.value); if (!isNaN(d)) m.density = music.density = d; }
    if (moodSwingEl) { var s = parseFloat(moodSwingEl.value); if (!isNaN(s)) m.swing = music.swing = s; }
    if (moodLeadWaveEl) { m.leadWave = music.leadWave = moodLeadWaveEl.value; }
    if (moodBassWaveEl) { m.bassWave = music.bassWave = moodBassWaveEl.value; }
    if (barStartEl) { m.barStart = music.barStart = barStartEl.value; }
    var sc = scaleOf(music.key, music.scale).join(',');
    scaleLabel.textContent = music.key + ' ' + music.scale + ' [' + sc + ']';
    renderConfig();
    if (moodInfo) moodInfo.textContent = 'Mood updated.';
  }

  function persistHarmonyFromInput() {
    if (!harmonyInput) return;
    var txt = (harmonyInput.value || '').split(',');
    var arr = [];
    for (var i = 0; i < txt.length; i++) { var v = parseInt(txt[i], 10); if (!isNaN(v)) arr.push(v); }
    if (arr.length) {
      music.harmony = arr.slice();
      var idx = MOODS.findIndex(function (x) { return x.id === music.mood; });
      if (idx >= 0) MOODS[idx].harmony = arr.slice();
      renderConfig();
      if (moodInfo) moodInfo.textContent = 'Harmony set to [' + arr.join(',') + '] ' + (playing ? '(applies bar-by-bar)' : '');
    }
  }
  if (harmonyInput) {
    harmonyInput.addEventListener('blur', persistHarmonyFromInput);
    harmonyInput.addEventListener('change', persistHarmonyFromInput);
  }

  // --- Motif helpers ---
  function ensureDefaultMotif() {
    if (motifs.length === 0) {
      var base = (globalSeed && globalSeed.length) ? globalSeed.slice() : degreesSeedFallback(0);
      motifs.push({ id: 'motif1', name: 'Motif A', notes: base.slice() });
      selectedMotifIndex = 0;
    }
  }

  function renderMotifList() {
    if (!motifList) return;
    while (motifList.firstChild) motifList.removeChild(motifList.firstChild);
    for (var i = 0; i < motifs.length; i++) {
      var m = motifs[i];
      var btn = document.createElement('div');
      btn.textContent = m.name || ('Motif ' + (i + 1));
      btn.className = 'mood-btn' + (i === selectedMotifIndex ? ' active' : '');
      (function (idx) { btn.onclick = function () { selectedMotifIndex = idx; loadSeedRows(); renderMotifList(); if (moodInfo) moodInfo.textContent = 'Selected ' + (motifs[idx].name || ('Motif ' + (idx + 1))); }; })(i);
      // highlight currently playing motif
      if (i === activeMotifIndex) { btn.style.outline = '1px solid var(--accent)'; btn.style.boxShadow = '0 0 8px rgba(158,247,160,.3)'; }
      motifList.appendChild(btn);
    }
  }

  function setMotifMode(mode) {
    motifMode = (mode === 'repeat' || mode === 'improv') ? mode : 'improv';
    if (motifModeEl) motifModeEl.value = motifMode;
    if (moodInfo) moodInfo.textContent = (motifMode === 'repeat' ? 'Motif mode: Repeat selected' : 'Motif mode: Improvise between motifs');
  }

  function motifVariation(notes) {
    // Return a shallow-varied copy of notes within the bar
    var out = [];
    for (var i = 0; i < notes.length; i++) out.push({ step: (notes[i].step | 0), degree: (notes[i].degree | 0), dur: (notes[i].dur | 0) || 2 });
    if (out.length) {
      // 30%: nudge last note later by 1 step
      if (rnd() < 0.3) { out[out.length - 1].step = Math.min(stepsPerBar - 1, out[out.length - 1].step + 1); }
      // 25%: octave up last note
      if (rnd() < 0.25) { out[out.length - 1].degree += 7; }
    }
    return out;
  }

  function chooseActiveMotifForBar(barIndex) {
    ensureDefaultMotif();
    if (motifs.length === 0) { activeMotifIndex = -1; return; }
    if (motifMode === 'repeat') {
      activeMotifIndex = (selectedMotifIndex >= 0 ? selectedMotifIndex : 0);
    } else {
      // improv: 60% repeat, 40% switch
      if (activeMotifIndex < 0) activeMotifIndex = 0;
      else if (rnd() < 0.4) {
        var next = activeMotifIndex; var guard = 0;
        while (motifs.length > 1 && next === activeMotifIndex && guard++ < 8) next = randi(0, motifs.length - 1);
        activeMotifIndex = next;
      }
    }
    // Build events for this bar and cache
    var deg = (music.harmony[barIndex % music.harmony.length] || 0);
    var base = motifs[activeMotifIndex].notes || [];
    var varied = motifVariation(base);
    var ns = { ticksPerQuarter: 220, totalQuantizedSteps: stepsPerBar, quantizationInfo: { stepsPerQuarter: 4 }, notes: [] };
    for (var i = 0; i < varied.length; i++) {
      var n = varied[i];
      var midi = midiFromDegree(music.key, music.scale, n.degree + deg, 0);
      var st = Math.max(0, Math.min(stepsPerBar - 1, (n.step | 0)));
      var en = Math.max(st + 1, Math.min(stepsPerBar, st + Math.max(1, (n.dur | 0) || 2)));
      ns.notes.push({ pitch: midi, quantizedStartStep: st, quantizedEndStep: en });
    }
    motifBarMap[barIndex] = eventsFromNoteSequence(ns);
    renderMotifList();
  }

  // --- Preset editor wiring ---
  function addSeedRow(step, degree, dur) {
    var row = document.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr 1fr 1fr auto';
    row.style.gap = '4px';
    var s = document.createElement('input'); s.type = 'number'; s.placeholder = 'step'; s.value = (step != null ? step : '');
    var d = document.createElement('input'); d.type = 'number'; d.placeholder = 'degree'; d.value = (degree != null ? degree : '');
    var u = document.createElement('input'); u.type = 'number'; u.placeholder = 'dur'; u.value = (dur != null ? dur : '');
    var del = document.createElement('button'); del.className = 'btn'; del.textContent = '×';
    del.onclick = function () { seedRows.removeChild(row); autoPersistMotifFromRows(); };
    row.appendChild(s); row.appendChild(d); row.appendChild(u); row.appendChild(del);
    seedRows.appendChild(row);
  }
  function readSeedRows() {
    var out = [];
    var rows = seedRows.children;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i].querySelectorAll('input');
      if (r.length >= 3) {
        var st = parseInt(r[0].value, 10); var dg = parseInt(r[1].value, 10); var du = parseInt(r[2].value, 10);
        if (!isNaN(st) && !isNaN(dg)) out.push({ step: st, degree: dg, dur: isNaN(du) ? 2 : du });
      }
    }
    out.sort(function (a, b) { return a.step - b.step; });
    return out;
  }
  // Auto-apply motif edits without an explicit save button
  function autoPersistMotifFromRows() {
    try {
      var notes = readSeedRows();
      ensureDefaultMotif();
      if (selectedMotifIndex >= 0 && motifs[selectedMotifIndex]) motifs[selectedMotifIndex].notes = notes.slice();
      // keep globalSeed in sync for backward compatibility
      globalSeed = notes.slice();
      renderConfig();
      if (moodInfo) moodInfo.textContent = 'Motif updated (' + notes.length + ' notes).';
    } catch (e) { /* ignore */ void e; }
  }
  function loadSeedRows() {
    if (!seedRows) return;
    while (seedRows.firstChild) seedRows.removeChild(seedRows.firstChild);
    var seed;
    ensureDefaultMotif();
    if (selectedMotifIndex >= 0 && motifs[selectedMotifIndex]) seed = motifs[selectedMotifIndex].notes || [];
    else seed = globalSeed || [];
    for (var i = 0; i < seed.length; i++) addSeedRow(seed[i].step, seed[i].degree, seed[i].dur);
  }
  if (addSeedBtn) addSeedBtn.onclick = function () { addSeedRow('', '', ''); };
  if (clearSeedBtn) clearSeedBtn.onclick = function () { while (seedRows.firstChild) seedRows.removeChild(seedRows.firstChild); };
  // Auto-save hooks for motif edits
  if (seedRows) {
    try {
      seedRows.addEventListener('input', autoPersistMotifFromRows, true);
      seedRows.addEventListener('change', autoPersistMotifFromRows, true);
      var mo = new MutationObserver(function () { autoPersistMotifFromRows(); });
      mo.observe(seedRows, { childList: true });
    } catch (e) { /* ignore */ void e; }
  }
  // no save button handler; autoPersistMotifFromRows handles changes
  if (addMotifBtn) addMotifBtn.onclick = function () {
    var idx = motifs.length + 1;
    motifs.push({ id: 'motif' + idx, name: 'Motif ' + String.fromCharCode(64 + Math.min(26, idx)), notes: [] });
    selectedMotifIndex = motifs.length - 1;
    loadSeedRows(); renderMotifList(); renderConfig(); autoPersistMotifFromRows();
  };
  if (dupMotifBtn) dupMotifBtn.onclick = function () {
    ensureDefaultMotif();
    var src = (selectedMotifIndex >= 0 ? motifs[selectedMotifIndex] : motifs[0]);
    motifs.push({ id: 'motif' + (motifs.length + 1), name: (src.name || 'Motif') + ' *', notes: (src.notes || []).map(function (n) { return { step: n.step, degree: n.degree, dur: n.dur }; }) });
    selectedMotifIndex = motifs.length - 1;
    loadSeedRows(); renderMotifList(); renderConfig(); autoPersistMotifFromRows();
  };
  if (delMotifBtn) delMotifBtn.onclick = function () {
    if (motifs.length <= 1) return; // keep at least one
    if (selectedMotifIndex < 0) return;
    motifs.splice(selectedMotifIndex, 1);
    selectedMotifIndex = Math.max(0, selectedMotifIndex - 1);
    loadSeedRows(); renderMotifList(); renderConfig(); autoPersistMotifFromRows();
  };
  if (motifModeEl) motifModeEl.onchange = function () { setMotifMode(motifModeEl.value === 'repeat' ? 'repeat' : 'improv'); renderConfig(); };
  if (saveMoodBtn) saveMoodBtn.onclick = function () { persistMoodFromInputs(); persistHarmonyFromInput(); };

  function renderConfig() {
    if (!jsonOut) return;
    var moodsObj = {};
    for (var i = 0; i < MOODS.length; i++) {
      var m = MOODS[i];
      moodsObj[m.id] = {
        key: m.key || 'G',
        bpm: m.bpm,
        scale: m.scale,
        swing: m.swing,
        density: m.density,
        leadWave: m.leadWave,
        bassWave: m.bassWave,
        barStart: m.barStart || 'stab',
        harmony: m.harmony.slice()
      };
    }
    var motifsObj = [];
    for (var j = 0; j < motifs.length; j++) motifsObj.push({ name: motifs[j].name || ('Motif ' + (j + 1)), notes: (motifs[j].notes || []).slice() });
    var cfg = { seedNotes: globalSeed.slice(), motifs: motifsObj, motifMode: motifMode, moods: moodsObj };
    try { jsonOut.textContent = JSON.stringify(cfg, null, 2); }
    catch (e) { jsonOut.textContent = '{ /* error building config: ' + e.message + ' */ }'; }
  }

  // Defaults
  applyMood('somber');
  if (tempoEl) tempoEl.value = String(music.bpm);
  if (tempoLabel) tempoLabel.textContent = music.bpm + ' BPM';
  if (keyEl) keyEl.value = music.key;
  ensureDefaultMotif();
  setMotifMode('improv');
  renderMotifList();
  loadSeedRows();

  // HUD ticker
  setInterval(updateHud, 100);
})();


