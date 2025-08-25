import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const code = await fs.readFile(new URL('../core/spoils-cache.js', import.meta.url), 'utf8');
vm.runInThisContext(code, { filename: 'core/spoils-cache.js' });

test('spoils cache ranks are defined', () => {
  const ranks = Object.keys(SpoilsCache.ranks);
  assert.deepStrictEqual(ranks, ['rusted','sealed','armored','vaulted']);
});

test('create returns cache item', () => {
  const cache = SpoilsCache.create('rusted');
  assert.strictEqual(cache.type, 'spoils-cache');
  assert.strictEqual(cache.rank, 'rusted');
  assert.strictEqual(cache.name, 'Rusted Cache');
});

  test('drop roll tied to challenge rating', () => {
    SpoilsCache.baseRate = 0.1;
    const fail = SpoilsCache.rollDrop(1, () => 0.2);
    assert.strictEqual(fail, null);
    const hit = SpoilsCache.rollDrop(5, () => 0.2);
    assert.ok(hit);
    assert.strictEqual(hit.type, 'spoils-cache');
  });

  test('renderIcon creates element with rank class', () => {
    global.document = {
      createElement(tag){
        const el = {
          tagName: tag.toUpperCase(),
          className: '',
          classList: {
            add(cls){ el.className += (el.className ? ' ' : '') + cls; }
          },
          addEventListener(){},
          remove(){}
        };
        return el;
      }
    };
    const el = SpoilsCache.renderIcon('sealed');
    assert.ok(el.className.includes('cache-icon'));
    assert.ok(el.className.includes('sealed'));
    delete global.document;
  });

test('openAll removes caches of specified rank', () => {
  global.player = { inv: [SpoilsCache.create('sealed'), SpoilsCache.create('sealed'), {id:'x',type:'misc'}] };
  let notified = 0;
  global.notifyInventoryChanged = () => { notified++; };
  const logs = [];
  global.log = (msg) => logs.push(msg);
  const opened = SpoilsCache.openAll('sealed');
  assert.strictEqual(opened, 2);
  assert.strictEqual(player.inv.length, 1);
  assert.strictEqual(notified, 1);
  assert.ok(logs[0].includes('Opened 2'));
  delete global.player;
  delete global.notifyInventoryChanged;
  delete global.log;
});
