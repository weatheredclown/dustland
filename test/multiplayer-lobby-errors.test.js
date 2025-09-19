import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

const code = await fs.readFile(new URL('../scripts/supporting/multiplayer-lobby.js', import.meta.url), 'utf8');

function buildDom(){
  const document = makeDocument();
  const body = document.body;
  const sections = {};
  ['modeSection', 'hostSection', 'joinSection'].forEach(id => {
    const section = document.getElementById(id);
    sections[id] = section;
    body.appendChild(section);
  });

  const hostSection = sections.hostSection;
  const joinSection = sections.joinSection;

  const startHost = document.getElementById('startHost');
  body.appendChild(startHost);

  const newInvite = document.getElementById('newInvite');
  newInvite.disabled = true;
  hostSection.appendChild(newInvite);

  const inviteDeck = document.getElementById('inviteDeck');
  inviteDeck.classList.add('hidden');
  hostSection.appendChild(inviteDeck);

  const inviteEmpty = document.getElementById('inviteEmpty');
  inviteDeck.appendChild(inviteEmpty);

  const inviteTemplate = document.getElementById('inviteTemplate');
  function buildInviteTemplate(){
    const card = document.createElement('div');
    card.classList.add('invite-card');
    const hostField = document.createElement('textarea');
    hostField.classList.add('host-code');
    card.appendChild(hostField);
    const copyBtn = document.createElement('button');
    copyBtn.classList.add('copy-host');
    card.appendChild(copyBtn);
    const answerField = document.createElement('textarea');
    answerField.classList.add('answer-input');
    card.appendChild(answerField);
    const linkBtn = document.createElement('button');
    linkBtn.classList.add('link-player');
    card.appendChild(linkBtn);
    const status = document.createElement('div');
    status.classList.add('invite-status');
    card.appendChild(status);
    return card;
  }
  function cloneTree(node){
    const clone = document.createElement(node.tagName.toLowerCase());
    clone.className = node.className;
    clone.value = node.value;
    clone.textContent = node.textContent;
    node.children.forEach(child => clone.appendChild(cloneTree(child)));
    return clone;
  }
  const templateCard = buildInviteTemplate();
  templateCard.cloneNode = () => cloneTree(templateCard);
  inviteTemplate.content = { firstElementChild: templateCard };
  hostSection.appendChild(inviteTemplate);

  const hostStatus = document.getElementById('hostStatus');
  hostSection.appendChild(hostStatus);

  const peerList = document.getElementById('peerList');
  hostSection.appendChild(peerList);

  const joinAnswerGroup = document.getElementById('joinAnswerGroup');
  joinAnswerGroup.classList.add('hidden');
  joinSection.appendChild(joinAnswerGroup);

  const joinCode = document.getElementById('joinCode');
  joinCode.value = '';
  joinSection.appendChild(joinCode);

  const connectBtn = document.getElementById('connectBtn');
  connectBtn.disabled = true;
  joinSection.appendChild(connectBtn);

  const answerCode = document.getElementById('answerCode');
  answerCode.value = '';
  answerCode.readOnly = true;
  joinSection.appendChild(answerCode);

  const copyAnswer = document.getElementById('copyAnswer');
  copyAnswer.disabled = true;
  joinSection.appendChild(copyAnswer);

  const joinStatus = document.getElementById('joinStatus');
  joinSection.appendChild(joinStatus);

  const chooseHost = document.getElementById('chooseHost');
  body.appendChild(chooseHost);

  const chooseJoin = document.getElementById('chooseJoin');
  body.appendChild(chooseJoin);

  return document;
}

test('start host surfaces errors and re-enables button', async () => {
  const document = buildDom();
  const context = {
    document,
    navigator: {},
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
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
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    Dustland: { multiplayer: { connect: async () => { throw new Error('bad code'); } } }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  document.getElementById('joinCode').value = 'foo';
  await document.getElementById('connectBtn').onclick();
  assert.ok(document.getElementById('joinStatus').textContent.includes('bad code'));
});

test('host can juggle multiple invites', async () => {
  const document = buildDom();
  const created = [];
  const accepted = [];
  const room = {
    async createOffer(){
      const ticket = { id: `t${created.length}`, code: `CODE-${created.length}` };
      created.push(ticket);
      return ticket;
    },
    async acceptAnswer(id, answer){
      accepted.push({ id, answer });
    },
    onPeers(fn){ fn([]); return () => {}; },
    close(){}
  };
  const context = {
    document,
    navigator: {},
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    Dustland: { multiplayer: { startHost: async () => room } }
  };
  vm.createContext(context);
  vm.runInContext(code, context);

  await document.getElementById('startHost').onclick();
  await document.getElementById('newInvite').onclick();
  await document.getElementById('newInvite').onclick();

  const invitesBefore = document.querySelectorAll('.invite-card');
  assert.equal(invitesBefore.length, 2);

  const first = invitesBefore[0];
  first.querySelector('.answer-input').value = 'ANSWER-1';
  await first.querySelector('.link-player').onclick();

  assert.equal(accepted.length, 1);
  assert.deepEqual(accepted[0], { id: 't0', answer: 'ANSWER-1' });
  assert.equal(document.querySelectorAll('.invite-card').length, 1);
});
