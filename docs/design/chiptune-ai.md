# Procedural Chiptune: Synth Trails

*By Alex "Echo" Johnson*

> **Echo:** The wastes need a soundtrack that evolves like our story—glitchy, hopeful, and always ready to modulate.

## Goals
- **Generative Score:** Use Magenta.js to spin out endless melodies seeded by the player's run.
- **Retro Timbres:** Lean on Tone.js to render square waves, noise bursts, and crunchy envelopes.
- **Lightweight Looping:** Keep CPU and memory low so music hums along even on dusty browsers.
- **Mod Hooks:** Expose seed and instrument params so modders can remix the vibe.

## Architecture Sketch
1. **Seeded Melody:** Pull a deterministic seed from save data and feed it into Magenta's `melody_rnn` model.
2. **Pattern Carving:** Truncate or extend phrases to 8- and 16-bar loops, quantized to our 120 BPM wasteland tempo.
3. **Tone Wiring:** Route generated notes into Tone.js synth voices—`Tone.Synth` for leads, `Tone.NoiseSynth` for drums.
4. **Transport Sync:** Tie playback to `Tone.Transport`, allowing pause/resume with game state.
5. **Cache & Replay:** Store final note arrays so replays and cutscenes keep their tunes.

> **Gizmo:** Keep data flat: `[ {time:0, note:"C4", dur:0.5}, ... ]`. Easy to serialize, easy to audit.

## Integration Points
- Boot strapper loads Magenta and Tone lazily after main UI settles.
- `scripts/event-bus.js` broadcasts `music:seed` when a run starts; music module listens and spins up a new track.
- Future: combat or weather events can tweak filters or switch instruments.

## Risks
- Magenta's bundle is heavy; consider a stripped model or CDN caching.
- Procedural jams can drift dissonant—add scale clamps and sanity checks.
- Mobile browsers throttle audio timers; may desync from gameplay.

## Prototype
```html
<script src="https://cdn.jsdelivr.net/npm/@magenta/music@^1.23.1"></script>
<script src="https://cdn.jsdelivr.net/npm/tone@^14"></script>
<script>
const seed = 42;
const rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv');
Tone.start().then(() => rnn.initialize()).then(async () => {
  const seq = await rnn.continueSequence(mm.sequences.quantizeNoteSequence(mm.sequences.createQuantizedSequence([60]), 4), 32, seed);
  const synth = new Tone.Synth().toDestination();
  seq.notes.forEach(n => synth.triggerAttackRelease(mm.noteNumberToPitch(n.pitch), n.duration, n.startTime));
});
</script>
```
Runs standalone in a browser tab and should chirp out a tiny wasteland riff.

## Open Questions
- How many concurrent voices before we spike frame time?
- Do we need per-biome instrument palettes?
- Should seeds tie to NPC names for thematic callbacks?
