import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

test('office module boards castle and unboards via dialog', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(
    src,
    /placeHut\(WORLD_MID \+ 3, WORLD_MIDY - 2, {\s*\n\s*interiorId: 'castle',\s*\n\s*boarded: true\s*\n\s*}\)/
  );
  assert.match(src, /start: [\s\S]*?effect: 'unboardDoor',\s*interiorId: 'castle'[\s\S]*?unlock:/);
  assert.match(src, /label: '\(Fight\)'/);
});

test('startGame preserves generated world when applying module', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /applyModule\(OFFICE_MODULE\)/);
});

test('office module places Boots of Speed near forest entry', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /id: 'boots_of_speed'/);
  assert.match(src, /x: 3,\s*y: WORLD_MIDY/);
  assert.match(src, /mods: \{ AGI: 5, move_delay_mod: 0\.5 \}/);
});

test('office worker lends scrap when low and missing badge', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = fs.readFileSync(file, 'utf8');
  const worker1Regex = /\{\s*id: 'worker1',[\s\S]*?\r?\n\s*\},\r?\n\s*\{\s*id: 'worker2'/;
  const match = src.match(worker1Regex);
  assert(match);
  const objSrc = match[0].replace(/,\r?\n\s*\{\s*id: 'worker2'.*/, '');
  let hudCalled = false;
  global.flagValue = () => 0;
  global.player = { scrap: 1 };
  global.updateHUD = () => { hudCalled = true; };
  global.portraits = { worker: '' };
  global.hasItem = () => false;
  vm.runInThisContext(
    fs.readFileSync(path.join(__dirname, '..', 'scripts', 'core', 'actions.js'), 'utf8')
  );
  const worker = vm.runInThisContext('(' + objSrc + ')');
  const tree = worker.tree();
  const loanChoice = tree.start.choices.find((c) => c.label === 'Borrow 2 scrap');
  assert(loanChoice);
  globalThis.Dustland.actions.applyQuestReward(loanChoice.reward);
  assert.equal(player.scrap, 3);
  assert(hudCalled);
});

test('office worker hides loan if you have enough scrap', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = fs.readFileSync(file, 'utf8');
  const worker1Regex = /\{\s*id: 'worker1',[\s\S]*?\r?\n\s*\},\r?\n\s*\{\s*id: 'worker2'/;
  const match = src.match(worker1Regex);
  assert(match);
  const objSrc = match[0].replace(/,\r?\n\s*\{\s*id: 'worker2'.*/, '');
  global.flagValue = () => 0;
  global.player = { scrap: 5 };
  global.updateHUD = () => {};
  global.portraits = { worker: '' };
  global.hasItem = () => false;
  const worker = vm.runInThisContext('(' + objSrc + ')');
  const tree = worker.tree();
  assert(!tree.start.choices.some((c) => c.label === 'Borrow 2 scrap'));
});

test('office worker hides loan if you still have your badge', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = fs.readFileSync(file, 'utf8');
  const worker1Regex = /\{\s*id: 'worker1',[\s\S]*?\r?\n\s*\},\r?\n\s*\{\s*id: 'worker2'/;
  const match = src.match(worker1Regex);
  assert(match);
  const objSrc = match[0].replace(/,\r?\n\s*\{\s*id: 'worker2'.*/, '');
  global.flagValue = () => 0;
  global.player = { scrap: 1 };
  global.updateHUD = () => {};
  global.portraits = { worker: '' };
  global.hasItem = (id) => id === 'access_card';
  const worker = vm.runInThisContext('(' + objSrc + ')');
  const tree = worker.tree();
  assert(!tree.start.choices.some((c) => c.label === 'Borrow 2 scrap'));
});
