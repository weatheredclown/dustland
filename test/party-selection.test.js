import assert from 'node:assert';
import { test } from 'node:test';
import { createGameProxy } from './test-harness.js';

test('party panels handle click and focus selection', async () => {
  const party = [
    { name:'A', role:'Hero', lvl:1, hp:5, maxHp:5, skillPoints:0, stats:{}, equip:{ weapon:null, armor:null, trinket:null}, _bonus:{}, portraitSheet:null, xp:0 },
    { name:'B', role:'Mage', lvl:1, hp:5, maxHp:5, skillPoints:0, stats:{}, equip:{ weapon:null, armor:null, trinket:null}, _bonus:{}, portraitSheet:null, xp:0 }
  ];
  const { context, document } = createGameProxy(party);
  let selectedEvt = -1;
  context.EventBus.on('party:selected', idx => { selectedEvt = idx; });

  context.renderParty();
  const partyDiv = document.getElementById('party');
  assert.strictEqual(partyDiv.querySelectorAll('.pcard').length, 2);

  partyDiv.children[1].onclick();
  assert.strictEqual(context.selectedMember, 1);
  assert.strictEqual(selectedEvt, 1);
  assert(partyDiv.children[1].classList.contains('selected'));

  partyDiv.children[0].focus();
  assert.strictEqual(context.selectedMember, 0);
  assert.strictEqual(selectedEvt, 0);
  assert(partyDiv.children[0].classList.contains('selected'));
});

test('renderParty shows single frame from sprite sheet', () => {
  const party = [
    { name:'Grin', role:'NPC', lvl:1, hp:5, maxHp:5, skillPoints:0, stats:{}, equip:{ weapon:null, armor:null, trinket:null}, _bonus:{}, portraitSheet:'assets/portraits/grin_4.png', xp:0 }
  ];
  const { context, document } = createGameProxy(party);
  context.renderParty();
  const portrait = document.getElementById('party').children[0].children[0];
  assert.ok(portrait.style.backgroundImage.includes('grin_4.png'));
  assert.strictEqual(portrait.style.backgroundSize, '200% 200%');
  assert.strictEqual(portrait.style.backgroundPosition, '0% 0%');
});
