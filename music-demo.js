/*
  Chiptune Dynamic Music Lab
  - Plain JS, globals only, no bundlers
  - Generates simple chip-style tracks with mood switching
  - Transitions apply at bar boundaries with short fills
*/

(function () {
  'use strict';

  // --- DOM ---
  var startBtn = document.getElementById('startBtn');
  var stopBtn = document.getElementById('stopBtn');
  var nextBtn = document.getElementById('nextBtn');
  var tempoEl = document.getElementById('tempo');
  var tempoLabel = document.getElementById('tempoLabel');
  var seedEl = document.getElementById('seed');
  var keyEl = document.getElementById('key');
  var moodList = document.getElementById('moodList');
  var moodInfo = document.getElementById('moodInfo');
  var nowStat = document.getElementById('nowStat');
  var barBeat = document.getElementById('barBeat');
  var scaleLabel = document.getElementById('scaleLabel');
  var mgBtn = document.getElementById('mgBtn');
  var mgStatus = document.getElementById('mgStatus');
  var harmonyInput = document.getElementById('harmonyInput');
  var saveHarmonyBtn = document.getElementById('saveHarmonyBtn');
  var seedRows = document.getElementById('seedRows');
  var addSeedBtn = document.getElementById('addSeedBtn');
  var clearSeedBtn = document.getElementById('clearSeedBtn');
  var saveSeedBtn = document.getElementById('saveSeedBtn');
  var jsonOut = document.getElementById('jsonOut');

  // --- Globals & Engine ---
  var ac = null; // AudioContext
  var master = null; // GainNode
  var delay = null; // DelayNode
  var delayGain = null; // GainNode
  var playing = false;
  var scheduleTimer = 0;
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
    harmony: [0, 3, 4, 3], // chord degrees per bar
    barCount: 0
  };

  // Moods definition (adjectives) with per-mood bpm and key
  var MOODS = [
    { id: 'somber', name: 'Somber', info: 'Low energy, minor tones, rests create space.', key: 'G', bpm: 92, scale: 'minor', swing: 0.02, density: 0.45, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 3, 5, 3] },
    { id: 'angry', name: 'Angry', info: 'Aggressive, tight rhythm, phrygian bite.', key: 'G', bpm: 160, scale: 'phrygian', swing: 0.01, density: 0.95, leadWave: 'square', bassWave: 'square', harmony: [0, 1, 2, 1] },
    { id: 'endangered', name: 'Endangered', info: 'Urgent minor pulse, snare fills.', key: 'G', bpm: 140, scale: 'minor', swing: 0.02, density: 0.85, leadWave: 'square', bassWave: 'square', harmony: [0, 2, 4, 2] },
    { id: 'stealth', name: 'Stealthy', info: 'Sparse, dorian color, hushed hats.', key: 'G', bpm: 100, scale: 'dorian', swing: 0.03, density: 0.35, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 0, 3, 5] },
    { id: 'hopeful', name: 'Hopeful', info: 'Major lift, echoing arps.', key: 'G', bpm: 124, scale: 'major', swing: 0.04, density: 0.7, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 4, 5, 7] },
    { id: 'triumphant', name: 'Triumphant', info: 'Bright cadence, driving hats.', key: 'G', bpm: 132, scale: 'major', swing: 0.05, density: 0.85, leadWave: 'square', bassWave: 'triangle', harmony: [0, 4, 5, 0] },
    { id: 'melancholic', name: 'Melancholic', info: 'Bittersweet minor, wide intervals.', key: 'G', bpm: 110, scale: 'minor', swing: 0.02, density: 0.55, leadWave: 'triangle', bassWave: 'triangle', harmony: [0, 5, 3, 2] },
    { id: 'mystery', name: 'Mystery', info: 'Shadowy dorian feel, syncopation.', key: 'G', bpm: 96, scale: 'dorian', swing: 0.0, density: 0.4, leadWave: 'triangle', bassWave: 'square', harmony: [0, 2, 6, 2] }
  ];

  // Universal seed for JSON config and Magenta basis (shared across moods)
  var globalSeed = [];

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
    var nodes = moodList.children;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
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

  function mkOsc(type, freq, time) {
    var o = ac.createOscillator();
    o.type = type;
    if (freq) o.frequency.setValueAtTime(freq, time || ac.currentTime);
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
  function playKick(t) {
    var o = mkOsc('sine');
    var e = envGate(t, 0.001, 0.05, 0.0001, 0.08, 0.12);
    var g = e.gain;
    var k = ac.createGain(); k.gain.setValueAtTime(1.2, t);
    o.connect(g).connect(k).connect(master);
    // pitch drop
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(35, t + 0.1);
    o.start(t);
    o.stop(t + 0.25);
    e.scheduleRelease(t + 0.12);
  }

  function playSnare(t, tight) {
    var s = mkNoise();
    var e = envGate(t, 0.001, 0.05, 0.0001, 0.1, tight ? 0.03 : 0.08);
    var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.setValueAtTime(1200, t);
    var g = ac.createGain(); g.gain.setValueAtTime(tight ? 0.3 : 0.45, t);
    s.connect(hp).connect(e.gain).connect(g).connect(master);
    s.start(t);
    s.stop(t + 0.2);
    e.scheduleRelease(t + (tight ? 0.04 : 0.1));
  }

  function playHat(t, open) {
    var s = mkNoise();
    var e = envGate(t, 0.001, 0.02, 0.0001, 0.05, open ? 0.06 : 0.02);
    var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.setValueAtTime(6000, t);
    var g = ac.createGain(); g.gain.setValueAtTime(open ? 0.18 : 0.12, t);
    s.connect(hp).connect(e.gain).connect(g).connect(master);
    s.start(t);
    s.stop(t + 0.15);
    e.scheduleRelease(t + (open ? 0.08 : 0.03));
  }

  // Instruments
  function playBassNote(midi, t, dur) {
    var f = hzFromMidi(midi);
    var o = mkOsc(music.bassWave, f, t);
    var e = envGate(t, 0.003, 0.06, 0.2, 0.06, dur * 0.9);
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1800, t);
    var g = ac.createGain(); g.gain.setValueAtTime(0.25, t);
    o.connect(e.gain).connect(lp).connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.1);
    e.scheduleRelease(t + dur * 0.9);
  }

  function playLeadNote(midi, t, dur) {
    var f = hzFromMidi(midi);
    var o = mkOsc(music.leadWave, f, t);
    var e = envGate(t, 0.004, 0.05, 0.3, 0.1, dur * 0.85);
    var g = ac.createGain(); g.gain.setValueAtTime(0.18, t);
    o.connect(e.gain).connect(g).connect(delay).connect(delayGain).connect(master);
    o.start(t);
    o.stop(t + dur + 0.12);
    e.scheduleRelease(t + dur * 0.85);
  }

  // Timing helpers
  function secondsPerBeat() { return 60.0 / music.bpm; }
  function secondsPer16th() { return secondsPerBeat() / 4.0; }

  function scheduleNote(step, t) {
    // Swing on off-16ths (every second 16th inside an 8th)
    var swing = music.swing;
    if (swing > 0 && (step % 2 === 1)) t += secondsPer16th() * swing;

    var beatInBar = step % stepsPerBar;
    var isKick = (beatInBar % 4 === 0);
    var isSnare = (beatInBar % 8 === 4);
    var isHat = (beatInBar % 2 === 0);

    // Density affects extra hits
    if (isKick) playKick(t);
    if (isSnare) playSnare(t, false);
    if (isHat) playHat(t, (music.density > 0.8) && (beatInBar % 4 === 2));

    // Bass pattern: root or fifth of current chord degree
    var bar = Math.floor(step / stepsPerBar);
    var deg = (music.harmony[bar % music.harmony.length] || 0);
    var root = midiFromDegree(music.key, music.scale, deg, -2);
    var fifth = midiFromDegree(music.key, music.scale, deg + 4, -2);
    var bassNote = (beatInBar % 8 === 0) ? root : (rnd() < 0.3 ? fifth : root);
    playBassNote(bassNote, t, secondsPer16th() * 2);

    // Lead: prefer Magenta override for this bar; otherwise procedural
    var stepInBar = beatInBar;
    var barIndex = Math.floor(step / stepsPerBar);
    var override = mg.leadOverride[barIndex];
    if (override && override.length) {
      for (var i = 0; i < override.length; i++) {
        var ev = override[i];
        if (ev.step === stepInBar) playLeadNote(ev.midi, t, secondsPer16th() * (ev.durSteps || 2));
      }
    } else {
      if (rnd() < music.density) {
        var pickDeg = deg + [0, 2, 4, 5, 7][randi(0, 4)] + (rnd() < 0.25 ? 7 : 0);
        var leadMidi = midiFromDegree(music.key, music.scale, pickDeg, 0);
        playLeadNote(leadMidi, t, secondsPer16th() * (rnd() < 0.3 ? 3 : 2));
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
    music.harmony = m.harmony.slice();
    setActiveMoodBtn(m.id);
    var sc = scaleOf(music.key, music.scale).join(',');
    scaleLabel.textContent = music.key + ' ' + music.scale + ' [' + sc + ']';
    moodInfo.textContent = m.name + ': ' + m.info;
    // Reflect UI: per-mood bpm/key and harmony
    if (tempoEl) { tempoEl.value = music.bpm; tempoLabel.textContent = music.bpm + ' BPM'; }
    if (keyEl) { keyEl.value = music.key; }
    if (harmonyInput) harmonyInput.value = (m.harmony || []).join(',');
    loadSeedRows();
    renderConfig();
  }

  // Optional Magenta VAE integration for lead interpolation
  var mg = { enabled: false, loading: false, ready: false, vae: null, leadOverride: {} };
  function setMgStatus(text) { if (mgStatus) mgStatus.textContent = 'Magenta: ' + text; }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script'); s.async = true; s.crossOrigin = 'anonymous'; s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function loadMagenta() {
    if (mg.loading || mg.ready) { if (!mg.loading) setMgStatus('ready'); return; }
    mg.loading = true; setMgStatus('loading libs…');
    loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.13.0/dist/tf.min.js')
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
    return [ { step: 0, degree: deg, dur: 2 }, { step: 4, degree: deg, dur: 2 }, { step: 8, degree: deg + 2, dur: 2 }, { step: 12, degree: deg, dur: 2 } ];
  }

  function seedToNoteSequenceDegrees(key, scaleName, degForFallback) {
    var seed = (globalSeed && globalSeed.length) ? globalSeed.slice() : degreesSeedFallback(degForFallback || 0);
    var ns = { ticksPerQuarter: 220, totalTime: 0, tempos: [{ qpm: music.bpm }], notes: [], totalQuantizedSteps: stepsPerBar, quantizationInfo: { stepsPerQuarter: 4 } };
    for (var i = 0; i < seed.length; i++) {
      var n = seed[i];
      var midi = midiFromDegree(key, scaleName, n.degree, 0);
      var start = Math.max(0, Math.min(stepsPerBar - 1, (n.step|0)));
      var end = Math.max(start + 1, Math.min(stepsPerBar, start + Math.max(1, (n.dur|0) || 2)));
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
        var st = (q.quantizedStartStep|0);
        var en = (q.quantizedEndStep|0);
        var step = Math.max(0, Math.min(stepsPerBar - 1, st));
        var dur = Math.max(1, Math.min(stepsPerBar - step, en - st));
        arr.push({ step: step, midi: q.pitch|0, durSteps: dur });
      }
    } else if (window.mm && window.mm.sequences && ns.tempos && ns.notes) {
      try {
        var qns = window.mm.sequences.quantizeNoteSequence(ns, 4);
        return eventsFromNoteSequence(qns);
      } catch (e) {}
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
    setMgStatus('interpolating…');
    mg.vae.interpolate([a, b], 3)
      .then(function (out) {
        var mid = out && out[1] ? out[1] : out[0];
        if (!mid) throw new Error('no sequence');
        if (!mid.quantizationInfo && window.mm && window.mm.sequences) {
          try { mid = window.mm.sequences.quantizeNoteSequence(mid, 4); } catch (e) {}
        }
        mg.leadOverride[barIndex + 1] = eventsFromNoteSequence(mid);
        setMgStatus('transition ready');
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
    nowStat.textContent = music.mood + ' @ ' + music.bpm + ' BPM';
    var bar = Math.floor(current16th / stepsPerBar);
    var beat = (current16th % 16) / 4 + 1;
    barBeat.textContent = (bar + 1) + ' / ' + Math.floor(beat);
  }

  function start() {
    if (playing) return;
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
      delay = ac.createDelay(0.5); delay.delayTime.value = 0.22;
      delayGain = ac.createGain(); delayGain.gain.value = 0.25;
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
    clearInterval(scheduleTimer);
  }

  // UI wiring
  startBtn.onclick = function () {
    if (!ac) setSeed(parseInt(seedEl.value || '1', 10));
    start();
  };
  stopBtn.onclick = function () { stop(); };
  nextBtn.onclick = function () { if (playing) music.nextMood = music.nextMood || music.mood; };

  tempoEl.oninput = function () {
    var v = parseInt(tempoEl.value, 10);
    tempoLabel.textContent = v + ' BPM';
    music.bpm = v;
    // persist per-mood tempo
    var idx = MOODS.findIndex(function (x) { return x.id === music.mood; });
    if (idx >= 0) MOODS[idx].bpm = v;
    renderConfig();
  };
  keyEl.onchange = function () {
    music.key = keyEl.value;
    var idx = MOODS.findIndex(function (x) { return x.id === music.mood; });
    if (idx >= 0) MOODS[idx].key = music.key;
    scaleLabel.textContent = music.key + ' ' + music.scale;
    renderConfig();
  };
  seedEl.onchange = function () { setSeed(parseInt(seedEl.value || '1', 10)); };
  if (mgBtn) mgBtn.onclick = function () { loadMagenta(); };

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
    del.onclick = function () { seedRows.removeChild(row); };
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
  function loadSeedRows() {
    if (!seedRows) return;
    while (seedRows.firstChild) seedRows.removeChild(seedRows.firstChild);
    var seed = globalSeed || [];
    for (var i = 0; i < seed.length; i++) addSeedRow(seed[i].step, seed[i].degree, seed[i].dur);
  }
  if (addSeedBtn) addSeedBtn.onclick = function () { addSeedRow('', '', ''); };
  if (clearSeedBtn) clearSeedBtn.onclick = function () { while (seedRows.firstChild) seedRows.removeChild(seedRows.firstChild); };
  if (saveSeedBtn) saveSeedBtn.onclick = function () { globalSeed = readSeedRows(); renderConfig(); };
  if (saveHarmonyBtn) saveHarmonyBtn.onclick = function () {
    var txt = (harmonyInput.value || '').split(',');
    var arr = [];
    for (var i = 0; i < txt.length; i++) {
      var v = parseInt(txt[i], 10);
      if (!isNaN(v)) arr.push(v);
    }
    // save into MOODS entry and active state
    var idx = MOODS.findIndex(function (x) { return x.id === music.mood; });
    if (idx >= 0) MOODS[idx].harmony = arr.slice();
    music.harmony = arr.slice();
    renderConfig();
  };

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
        harmony: m.harmony.slice()
      };
    }
    var cfg = { seedNotes: globalSeed.slice(), moods: moodsObj };
    try { jsonOut.textContent = JSON.stringify(cfg, null, 2); }
    catch (e) { jsonOut.textContent = '{ /* error building config: ' + e.message + ' */ }'; }
  }

  // Defaults
  applyMood('somber');
  tempoEl.value = music.bpm;
  tempoLabel.textContent = music.bpm + ' BPM';
  keyEl.value = music.key;

  // HUD ticker
  setInterval(updateHud, 100);
})();

