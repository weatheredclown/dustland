import assert from 'node:assert';
import test from 'node:test';

global.WORLD_W = 100;
global.WORLD_H = 100;
global.clamp = (v,a,b)=>{ if(a>b) [a,b]=[b,a]; return Math.max(a, Math.min(b, v)); };

await import('../core/loop.js');

test('nextLoopPoint defaults to NPC position when no previous', () => {
  const npc = { x: 5, y: 7 };
  const pt = nextLoopPoint(null, npc);
  assert.deepStrictEqual(pt, { x: 5, y: 7 });
});

test('nextLoopPoint stays within 10 squares of previous', () => {
  const npc = { x: 5, y: 5 };
  const prev = { x: 5, y: 5 };
  const pt = nextLoopPoint(prev, npc);
  const dx = Math.abs(pt.x - prev.x);
  const dy = Math.abs(pt.y - prev.y);
  assert.ok(dx <= 10 && dy <= 10);
});
