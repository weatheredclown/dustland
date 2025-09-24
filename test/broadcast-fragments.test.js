import { strict as assert } from 'node:assert';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('dustland module embeds the broadcast fragment chain', async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const src = await fs.readFile(path.join(__dirname, '..', 'modules', 'dustland.module.js'), 'utf8');
  const json = src.match(/const DATA = `([\s\S]+?)`;/)[1];
  const data = JSON.parse(json);
  const rewardIds = ['signal_fragment_1', 'signal_fragment_2', 'signal_fragment_3'];
  rewardIds.forEach(id => {
    assert.ok(data.items.some(item => item.id === id));
    assert.ok(data.quests.some(q => q.reward === id));
  });
  const radio = data.interiors.find(i => i.id === 'radio_shack');
  const tower = data.interiors.find(i => i.id === 'comms_tower_base');
  const cave = data.interiors.find(i => i.id === 'resonant_cave');
  assert.ok(radio && tower && cave);
  const portalToTower = data.portals.find(p => p.map === 'radio_shack' && p.toMap === 'comms_tower_base');
  const portalToCave = data.portals.find(p => p.map === 'comms_tower_base' && p.toMap === 'resonant_cave');
  assert.ok(portalToTower && portalToCave);
  assert.ok(data.buildings.some(b => b.interiorId === 'radio_shack'));
});
