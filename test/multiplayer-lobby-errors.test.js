import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

const code = await fs.readFile(new URL('../scripts/supporting/multiplayer-lobby.js', import.meta.url), 'utf8');

function buildDom(){
  const document = makeDocument();
  const body = document.body;
  const config = {
    startHost: 'button',
    newInvite: 'button',
    linkPlayer: 'button',
    copyHost: 'button',
    hostCode: 'textarea',
    answerInput: 'textarea',
    hostStatus: 'div',
    peerList: 'div',
    joinCode: 'textarea',
    connectBtn: 'button',
    answerCode: 'textarea',
    copyAnswer: 'button',
    joinStatus: 'div'
  };
  Object.entries(config).forEach(([id, tag]) => {
    const el = document.createElement(tag);
    if (tag === 'textarea') el.value = '';
    el.id = id;
    if (id === 'hostCode' || id === 'answerCode') el.readOnly = true;
    body.appendChild(el);
  });
  return document;
}

test('start host surfaces errors and re-enables button', async () => {
  const document = buildDom();
  const context = {
    document,
    navigator: {},
    Dustland: { multiplayer: { startHost: async () => { throw new Error('no rtc'); } } }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  await document.getElementById('startHost').onclick();
  assert.equal(document.getElementById('startHost').disabled, false);
  assert.ok(document.getElementById('hostStatus').textContent.includes('no rtc'));
});

test('generate answer handles invalid host code', async () => {
  const document = buildDom();
  const context = {
    document,
    navigator: {},
    Dustland: { multiplayer: { connect: async () => { throw new Error('bad code'); } } }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  document.getElementById('joinCode').value = 'foo';
  await document.getElementById('connectBtn').onclick();
  assert.ok(document.getElementById('joinStatus').textContent.includes('bad code'));
});
