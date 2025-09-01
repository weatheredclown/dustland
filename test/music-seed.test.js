import assert from 'node:assert';
import { test } from 'node:test';
import '../scripts/event-bus.js';
import '../scripts/chiptune.js';

test('music seed updates via event bus', () => {
  Dustland.eventBus.emit('music:seed', 42);
  assert.equal(Dustland.music.getSeed(), 42);
});

test('setSeed and instrument hooks', () => {
  Dustland.music.setSeed(7);
  assert.equal(Dustland.music.getSeed(), 7);
  Dustland.music.setInstruments({ lead: 'saw', bass: 'triangle' });
  assert.deepEqual(Dustland.music.getInstruments(), { lead: 'saw', bass: 'triangle' });
});
