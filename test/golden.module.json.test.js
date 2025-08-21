import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('golden module json exposes core features', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'golden.module.json');
  const mod = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.ok(mod.quests.some((q) => q.id === 'q_fetch'));
  assert.ok(mod.npcs.some((n) => n.combat), 'has combat npc');
  assert.ok(
    mod.npcs.some((n) => n.id === 'bandit' && n.combat),
    'has bandit combat NPC'
  );
  assert.ok(
    mod.npcs.some((n) =>
      Object.values(n.tree || {}).some((s) =>
        (s.choices || []).some((c) => c.join)
      )
    ),
    'has joinable npc'
  );
  assert.ok(
    mod.npcs.some((n) =>
      Object.values(n.tree || {}).some((s) =>
        (s.choices || []).some((c) => c.check)
      )
    ),
    'has stat gated dialog'
  );
  assert.ok(mod.interiors.some((i) => i.id === 'cabin'));
  assert.ok(mod.buildings.some((b) => b.interiorId === 'cabin'));
  assert.ok(
    mod.events?.some((e) => (e.events || []).some((ev) => ev.effect === 'toast')),
    'has toast event'
  );
  assert.ok(
    mod.npcs.some((n) => n.hidden && n.reveal),
    'has hidden npc reveal'
  );
  assert.ok(mod.items.some((i) => i.use?.type === 'heal'), 'has healing item');
  assert.ok(mod.portals && mod.portals.length > 0, 'has portals');
});
