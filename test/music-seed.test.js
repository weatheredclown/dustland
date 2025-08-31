import assert from 'node:assert';
import { test } from 'node:test';
import '../scripts/event-bus.js';
import '../scripts/chiptune.js';

test('music seed updates via event bus', () => {
  Dustland.eventBus.emit('music:seed', 42);
  assert.equal(Dustland.music.getSeed(), 42);
});
