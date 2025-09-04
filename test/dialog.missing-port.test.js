import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const dialogCode = await fs.readFile(new URL('../scripts/core/dialog.js', import.meta.url), 'utf8');

test('openDialog tolerates missing portrait element', () => {
  const html = `<body><div id="overlay"></div><div id="choices"></div><div id="dialogText"></div><div id="npcName"></div><div id="npcTitle"></div></body>`;
  const dom = new JSDOM(html);
  const context = {
    window: dom.window,
    document: dom.window.document,
    runEffects: () => {},
    checkFlagCondition: () => true,
    setGameState: () => {},
    GAME_STATE: {},
  };
  vm.createContext(context);
  vm.runInContext(dialogCode, context);
  const npc = { name: 'NPC', title: '', color: '#000', tree: { start: { text: 'hi', choices: [] } } };
  assert.doesNotThrow(() => context.openDialog(npc, 'start'));
});
