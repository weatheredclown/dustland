import assert from 'assert';
import { summarize } from '../scripts/supporting/module-summary.js';

const mod = {
  seed: 'demo',
  items: [
    { id: 'a', name: 'Alpha' },
    { id: 'b' }
  ],
  quests: [
    { id: 'q1', title: 'Quest One' }
  ],
  npcs: [
    { name: 'Guide', tree: { start: {}, end: {} } }
  ]
};

const lines = summarize(mod).split('\n');
assert(lines.includes('items: 2'));
assert(lines.includes('  Alpha, b'));
assert(lines.includes('quests: 1'));
assert(lines.includes('  Quest One'));
assert(lines.includes('npcs: 1'));
assert(lines.includes('  Guide (2)'));

