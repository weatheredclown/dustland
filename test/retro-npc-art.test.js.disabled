import assert from 'node:assert';
import { test } from 'node:test';
import { createGameProxy } from './test-harness.js';

test('retro NPC art checkbox toggles SVG rendering', async () => {
  const { context, document } = createGameProxy([]);
  const toggle = document.getElementById('retroNpcToggle');
  assert.ok(toggle, 'settings checkbox exists');
  assert.strictEqual(toggle.checked, false, 'checkbox starts unchecked');

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
  context.TS = 16;
  context.camX = 0;
  context.camY = 0;
  context.getViewSize = () => ({ w: 40, h: 30 });

  const npc = { id: 'retro_test', map: 'world', x: 1, y: 1, name: 'Guide' };
  const calls = [];
  const ctx = {
    drawImage(image){ calls.push(image); },
    fillStyle: '#000',
    fillRect(){ calls.push('rect'); },
    fillText(){ calls.push('text'); }
  };

  context.Dustland.retroNpcArt.setEnabled(false);
  toggle.checked = false;
  toggle.dispatchEvent(new context.window.Event('change'));
  calls.length = 0;
  context.drawEntities(ctx, [npc], 0, 0);
  assert.strictEqual(calls[0], 'rect', 'fallback rendering draws rectangles when disabled');

  context.Dustland.retroNpcArt.setEnabled(true);
  toggle.checked = true;
  toggle.dispatchEvent(new context.window.Event('change'));
  calls.length = 0;
  context.drawEntities(ctx, [npc], 0, 0);
  assert.ok(calls[0] instanceof RetroImage, 'retro art mode uses SVG sprite');
  assert.ok(document.body.classList.contains('retro-npc-art'), 'body flagged when retro art enabled');
});
