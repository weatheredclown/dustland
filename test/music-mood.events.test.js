import assert from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const GAME_STATE = { DIALOG: 'dialog', WORLD: 'world', INTERIOR: 'interior' };

test('dialog and combat emit music mood events', async () => {
  {
    const dom = new JSDOM(`<!doctype html><body>
      <div id="overlay"></div>
      <div id="choices"></div>
      <div id="dialogText"></div>
      <div id="npcName"></div>
      <div id="npcTitle"></div>
      <div id="port"></div>
      <button id="persistLLM"></button>
    </body>`);
    global.window = dom.window;
    global.document = dom.window.document;
    global.Dustland = global.Dustland || {};
    global.state = { map: 'world' };
    global.party = { map: 'world' };
    global.GAME_STATE = GAME_STATE;
    global.setGameState = () => {};
    global.setPortraitDiv = () => {};
    await import('../scripts/event-bus.js');
    const moodEvents = [];
    const dialogHandler = (payload) => moodEvents.push(payload);
    Dustland.eventBus.on('music:mood', dialogHandler);
    await import('../scripts/core/dialog.js');
    const npc = { id: 'npc', name: 'NPC', title: '', tree: { start: { text: 'Hello', choices: [] } } };
    openDialog(npc);
    assert.strictEqual(moodEvents.at(-1)?.id, 'dialog');
    closeDialog();
    assert.strictEqual(moodEvents.at(-1)?.id, null);
    Dustland.eventBus.off('music:mood', dialogHandler);
  }

  {
    const dom = new JSDOM(`<div id="combatOverlay"></div><div id="combatEnemies"></div><div id="combatParty"></div><div id="combatCmd"></div><div id="turnIndicator"></div>`);
    global.window = dom.window;
    global.document = dom.window.document;
    const moodEvents = [];
    const combatHandler = (payload) => moodEvents.push(payload);
    Dustland.eventBus.on('music:mood', combatHandler);
    await import('../scripts/core/party.js');
    await import('../scripts/core/combat.js');
    global.updateHUD = () => {};
    global.renderCombat = () => {};
    global.toast = () => {};
    global.log = () => {};
    global.player = { hp: 10, inv: [] };
    party.length = 0;
    const member = makeMember('hero', 'Hero', 'Leader');
    party.push(member);
    const combatPromise = openCombat([{ id: 'rat', name: 'Rat', hp: 3 }]);
    assert.strictEqual(moodEvents.at(-1)?.id, 'combat');
    closeCombat('flee');
    await combatPromise;
    assert.strictEqual(moodEvents.at(-1)?.id, null);
    Dustland.eventBus.off('music:mood', combatHandler);
  }
});
