import assert from 'node:assert';
import { test } from 'node:test';
import '../scripts/event-bus.js';
import '../scripts/supporting/chiptune.js';

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

test('music exposes enable toggle and manual mood', () => {
  const states = [];
  const handler = (payload) => states.push(payload.enabled);
  Dustland.eventBus.on('music:state', handler);
  Dustland.music.setEnabled(true);
  assert.equal(Dustland.music.isEnabled(), true);
  Dustland.music.toggleEnabled();
  assert.equal(Dustland.music.isEnabled(), false);
  Dustland.eventBus.off('music:state', handler);
  assert.ok(states.includes(true));
  assert.ok(states.includes(false));
  const initialMood = Dustland.music.getCurrentMood();
  Dustland.music.setMood('combat', { source: 'test', priority: 99 });
  assert.equal(Dustland.music.getCurrentMood(), 'combat');
  Dustland.music.setMood(null, { source: 'test' });
  assert.equal(Dustland.music.getCurrentMood(), initialMood);
});
