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
  assert.ok(mod.items.some((i) => i.id === 'chest_key'), 'has chest key');
  assert.ok(mod.portals && mod.portals.length > 0, 'has portals');

  const chest = mod.npcs.find((n) => n.id === 'chest');
  assert.ok(chest.locked, 'chest starts locked');
  assert.ok(
    (chest.tree.locked.choices || []).some((c) => c.reqItem === 'crowbar'),
    'crowbar can open chest'
  );
  assert.ok(
    (chest.tree.locked.choices || []).some((c) => c.reqItem === 'chest_key'),
    'key can open chest'
  );
  assert.ok(
    (chest.tree.empty.choices || []).some((c) => c.effects?.some((e) => e.effect === 'lockNPC')),
    'chest can be relocked'
  );

  assert.strictEqual(chest.symbol, '?');

  const hut = mod.buildings.find((b) => b.interiorId === 'cabin');
  assert.strictEqual(hut.boarded, false, 'cabin is enterable');
  const w = hut.w || 6;
  const h = hut.h || 5;
  const overlaps = mod.npcs.some(
    (n) =>
      n.map === 'world' &&
      n.x >= hut.x &&
      n.x < hut.x + w &&
      n.y >= hut.y &&
      n.y < hut.y + h
  );
  assert.ok(!overlaps, 'npcs avoid building area');

  const startClear = !mod.npcs.some(
    (n) => n.map === mod.start.map && n.x === mod.start.x && n.y === mod.start.y
  );
  assert.ok(startClear, 'start tile is not occupied by NPC');

  const bandit = mod.npcs.find((n) => n.id === 'bandit');
  const dist = Math.abs(bandit.x - mod.start.x) + Math.abs(bandit.y - mod.start.y);
  assert.ok(dist > 2, 'bandit is spaced away from start');
});
