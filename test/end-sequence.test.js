import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function makeStubDocument() {
  const byId = {};
  function makeEl(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      style: {},
      textContent: '',
      _id: '',
      _innerHTML: '',
      htmlHistory: [],
      appendChild(child) { (this.children ??= []).push(child); if (child._id) byId[child._id] = child; }
    };
    Object.defineProperty(el, 'id', {
      get() { return this._id; },
      set(v) { this._id = v; byId[v] = el; }
    });
    Object.defineProperty(el, 'innerHTML', {
      get() { return this._innerHTML; },
      set(v) { this._innerHTML = v; this.htmlHistory.push(v); }
    });
    return el;
  }
  return {
    body: makeEl('body'),
    getElementById: id => byId[id] ?? null,
    createElement: makeEl
  };
}

test('playEndSequence scrolls credits inside a pulsing-delimiter window', async () => {
  const document = makeStubDocument();
  const logs = [];
  const context = {
    console,
    document,
    setTimeout,
    clearTimeout,
    requestAnimationFrame: fn => fn(),
    log: msg => logs.push(msg)
  };
  context.globalThis = context;
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/core/actions.js', import.meta.url), 'utf8');
  vm.runInContext(code, context);

  await context.Dustland.actions.playEndSequence({
    fadeMs: 0,
    messageMs: 0,
    creditMs: 1,
    messages: ['The dust settles.'],
    title: 'THE END',
    includeGameCredits: false,
    credits: [
      { name: 'Ada', title: 'Engineer' },
      { name: 'Grace', title: 'Admiral' }
    ]
  });

  const overlay = document.getElementById('dustlandEndSequence');
  assert.ok(overlay, 'overlay created');

  const scrollFrame = overlay.htmlHistory.find(h => h.includes('dustlandCreditScroll'));
  assert.ok(scrollFrame, 'credit scroll rendered');
  assert.ok(scrollFrame.includes('Ada'), 'first credit in scroll');
  assert.ok(scrollFrame.includes('Grace'), 'second credit in scroll');
  assert.ok(scrollFrame.includes('overflow:hidden'), 'fixed-height clipped window');
  assert.ok(scrollFrame.includes('height:12em'), 'window height fixed');
  const delimiters = scrollFrame.split('dustlandCreditPulse').length - 1;
  assert.strictEqual(delimiters, 2, 'top and bottom pulsing delimiters');

  const styles = document.getElementById('dustlandEndSequenceStyles');
  assert.ok(styles, 'keyframes injected once');
  assert.ok(styles.textContent.includes('@keyframes dustlandCreditScroll'));
  assert.ok(styles.textContent.includes('@keyframes dustlandCreditPulse'));

  const finale = overlay.htmlHistory[overlay.htmlHistory.length - 1];
  assert.ok(finale.includes('THE END'), 'lands back on the title card');

  assert.ok(logs.includes('Ada — Engineer'), 'credits still logged');
  assert.ok(logs.includes('Grace — Admiral'), 'credits still logged');
});
