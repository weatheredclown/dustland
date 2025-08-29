import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');

function setup(){
  const party=[];
  const { context, document } = createGameProxy(party);
  const ids=['log','hp','ap','scrap','inv','party','quests','tabInv','tabParty','tabQuests','game'];
  ids.forEach(id=>document.body.appendChild(document.getElementById(id)));
  document.body.appendChild(document.querySelector('.tabs'));
  vm.runInContext(partyCode, context);
  return { context, document };
}

test('renders skill point badge when points available', () => {
  const { context, document } = setup();
  const m = context.makeMember('id','Name','Role');
  m.skillPoints = 2;
  context.party.push(m);
  context.renderParty();
  const badge = document.querySelector('.spbadge');
  assert.ok(badge, 'badge exists');
  assert.strictEqual(String(badge.textContent), '2');
});

test('no badge when no skill points', () => {
  const { context, document } = setup();
  const m = context.makeMember('id','Name','Role');
  context.party.push(m);
  context.renderParty();
  const badge = document.querySelector('.spbadge');
  assert.strictEqual(badge, null);
});

test('badge updates without duplication on re-render', () => {
  const { context, document } = setup();
  const m = context.makeMember('id','Name','Role');
  m.skillPoints = 1;
  context.party.push(m);
  context.renderParty();
  m.skillPoints = 3;
  context.renderParty();
  const badges = document.querySelectorAll('.spbadge');
  assert.strictEqual(badges.length, 1);
  assert.strictEqual(String(badges[0].textContent), '3');
});
