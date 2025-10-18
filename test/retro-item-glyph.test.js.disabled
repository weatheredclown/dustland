import assert from 'node:assert';
import { test } from 'node:test';
import { createGameProxy } from './test-harness.js';

test('retro art exposes item glyph sprites', () => {
  const { context } = createGameProxy([]);

  class RetroImage {
    constructor(){
      this.complete = false;
      this._src = '';
    }
    set src(value){
      this._src = value;
      this.complete = true;
    }
    get src(){
      return this._src;
    }
  }

  context.Image = RetroImage;
  context.window.Image = RetroImage;

  const glyph = context.Dustland.retroNpcArt.getItemGlyph();
  assert.ok(glyph instanceof RetroImage, 'single item glyph uses Image sprite');
  assert.ok(glyph.src.includes('retroItemGlyph'), 'single item glyph uses custom SVG data');

  const lootGlyph = context.Dustland.retroNpcArt.getLootGlyph();
  assert.ok(lootGlyph instanceof RetroImage, 'enemy loot glyph uses Image sprite');
  assert.ok(lootGlyph.src.includes('retroLootGlyph'), 'enemy loot glyph uses loot SVG data');

  const cacheGlyph = context.Dustland.retroNpcArt.getItemCacheGlyph();
  assert.ok(cacheGlyph instanceof RetroImage, 'cache glyph uses Image sprite');
  assert.ok(cacheGlyph.src.includes('retroItemCache'), 'cache glyph uses cache SVG data');

  assert.strictEqual(context.Dustland.retroNpcArt.getItemGlyph(), glyph, 'single glyph cached instance reused');
  assert.strictEqual(context.Dustland.retroNpcArt.getLootGlyph(), lootGlyph, 'loot glyph cached instance reused');
  assert.strictEqual(context.Dustland.retroNpcArt.getItemCacheGlyph(), cacheGlyph, 'cache glyph cached instance reused');
});
