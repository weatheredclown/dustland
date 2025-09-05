import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const el = {
    style:{},
    classList:{ _set:new Set(), contains(){return false;}, add(){}, remove(){}, toggle(){} },
    textContent:'',
    onclick:null,
    value:'',
    _innerHTML:'',
    children:[],
    width:0,
    height:0,
    appendChild(child){ this.children.push(child); child.parentElement=this; },
    prepend(child){ this.children.unshift(child); child.parentElement=this; },
    querySelector(){ return stubEl(); },
    querySelectorAll(){ return []; },
    getContext(){ return { clearRect(){}, fillRect(){}, strokeRect(){}, drawImage(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, save(){}, restore(){}, translate(){}, font:'', fillText(){}, globalAlpha:1 }; },
    addEventListener(){},
    removeEventListener(){},
    parentElement:{ appendChild(){}, querySelectorAll(){ return []; } },
    setAttribute(){},
    click(){},
  };
  Object.defineProperty(el,'innerHTML',{ get(){return this._innerHTML;}, set(v){ this._innerHTML=v; this.children=[]; }});
  return el;
}

const elements = {};

global.requestAnimationFrame = () => {};
global.alert = () => {};
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window = global;
window.matchMedia = () => ({ matches:false, addEventListener(){}, removeEventListener(){} });

global.document = {
  body: stubEl(),
  getElementById(id){ if(!elements[id]) elements[id]=stubEl(); return elements[id]; },
  createElement: () => stubEl(),
  querySelector: () => stubEl(),
  querySelectorAll: () => []
};

const files = [
  '../scripts/event-bus.js',
  '../scripts/core/movement.js',
  '../scripts/dustland-core.js',
  '../scripts/adventure-kit.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

// stub heavy functions
global.renderDialogPreview = () => {};
global.refreshChoiceDropdowns = () => {};

// Provide interiors for dropdown
moduleData.interiors = [ { id: 'castle' } ];

test('updateTreeData captures door board/unboard effects', () => {
  const boardSel = { value: 'castle' };
  const unboardSel = { value: '' };
  const choiceEl = {
    querySelector(sel){
      switch(sel){
        case '.choiceLabel': return { value: 'open' };
        case '.choiceTo': return { value: '', style:{} };
        case '.choiceRewardType':
        case '.choiceRewardXP':
        case '.choiceRewardItem':
        case '.choiceStat':
        case '.choiceDC':
        case '.choiceSuccess':
        case '.choiceFailure':
        case '.choiceCostItem':
        case '.choiceCostSlot':
        case '.choiceCostTag':
        case '.choiceReqItem':
        case '.choiceReqSlot':
        case '.choiceReqTag':
        case '.choiceJoinId':
        case '.choiceJoinName':
        case '.choiceJoinRole':
        case '.choiceGotoMap':
        case '.choiceGotoX':
        case '.choiceGotoY':
        case '.choiceQ':
        case '.choiceFlag':
        case '.choiceOp':
        case '.choiceVal':
          return { value: '' };
        case '.choiceOnce':
          return { checked: false };
        case '.choiceBoard':
          return boardSel;
        case '.choiceUnboard':
          return unboardSel;
        default:
          return { value: '' };
      }
    }
  };
  const nodeEl = {
    querySelector(sel){
      switch(sel){
        case '.nodeId': return { value: 'start' };
        case '.nodeText': return { value: 'hi' };
        default: return { value: '' };
      }
    },
    querySelectorAll(sel){ return sel === '.choices > div' ? [choiceEl] : []; },
    classList:{ contains(){ return false; } },
    style:{},
  };
  elements['treeEditor'] = {
    querySelectorAll(sel){ return sel === '.node' ? [nodeEl] : []; }
  };
  elements['npcTree'] = { value: '' };
  elements['treeWarning'] = { textContent: '' };

  updateTreeData();
  assert.deepStrictEqual(treeData.start.choices[0].effects, [ { effect: 'boardDoor', interiorId: 'castle' } ]);

  boardSel.value = '';
  unboardSel.value = 'castle';
  updateTreeData();
  assert.deepStrictEqual(treeData.start.choices[0].effects, [ { effect: 'unboardDoor', interiorId: 'castle' } ]);
});

test('updateTreeData captures scrap reward', () => {
  treeData = {};
  const choiceEl = {
    querySelector(sel){
      switch(sel){
        case '.choiceLabel': return { value: 'borrow' };
        case '.choiceTo': return { value: 'bye', style:{} };
        case '.choiceRewardType': return { value: 'scrap' };
        case '.choiceRewardXP': return { value: '' };
        case '.choiceRewardScrap': return { value: '2' };
        case '.choiceRewardItem': return { value: '' };
        case '.choiceStat':
        case '.choiceDC':
        case '.choiceSuccess':
        case '.choiceFailure':
        case '.choiceCostItem':
        case '.choiceCostSlot':
        case '.choiceCostTag':
        case '.choiceReqItem':
        case '.choiceReqSlot':
        case '.choiceReqTag':
        case '.choiceJoinId':
        case '.choiceJoinName':
        case '.choiceJoinRole':
        case '.choiceGotoMap':
        case '.choiceGotoX':
        case '.choiceGotoY':
        case '.choiceQ':
        case '.choiceFlag':
        case '.choiceOp':
        case '.choiceVal':
          return { value: '' };
        case '.choiceOnce':
          return { checked: false };
        case '.choiceBoard':
        case '.choiceUnboard':
          return { value: '' };
        default:
          return { value: '' };
      }
    }
  };
  const nodeEl = {
    querySelector(sel){
      switch(sel){
        case '.nodeId': return { value: 'start' };
        case '.nodeText': return { value: 'hi' };
        default: return { value: '' };
      }
    },
    querySelectorAll(sel){ return sel === '.choices > div' ? [choiceEl] : []; },
    classList:{ contains(){ return false; } },
    style:{},
  };
  elements['treeEditor'] = {
    querySelectorAll(sel){ return sel === '.node' ? [nodeEl] : []; }
  };
  elements['npcTree'] = { value: '' };
  elements['treeWarning'] = { textContent: '' };

  updateTreeData();
  assert.strictEqual(treeData.start.choices[0].reward, 'SCRAP 2');
});

test('updateTreeData captures item reward without explicit type', () => {
  treeData = {};
  const choiceEl = {
    querySelector(sel){
      switch(sel){
        case '.choiceLabel': return { value: 'take items' };
        case '.choiceTo': return { value: 'bye', style:{} };
        case '.choiceRewardType': return { value: '' };
        case '.choiceRewardXP': return { value: '' };
        case '.choiceRewardScrap': return { value: '' };
        case '.choiceRewardItem': return { value: 'Reward' };
        case '.choiceStat':
        case '.choiceDC':
        case '.choiceSuccess':
        case '.choiceFailure':
        case '.choiceCostItem':
        case '.choiceCostSlot':
        case '.choiceCostTag':
        case '.choiceReqItem':
        case '.choiceReqSlot':
        case '.choiceReqTag':
        case '.choiceJoinId':
        case '.choiceJoinName':
        case '.choiceJoinRole':
        case '.choiceGotoMap':
        case '.choiceGotoX':
        case '.choiceGotoY':
        case '.choiceQ':
        case '.choiceFlag':
        case '.choiceOp':
        case '.choiceVal':
          return { value: '' };
        case '.choiceOnce':
          return { checked: true };
        case '.choiceBoard':
        case '.choiceUnboard':
          return { value: '' };
        default:
          return { value: '' };
      }
    }
  };
  const nodeEl = {
    querySelector(sel){
      switch(sel){
        case '.nodeId': return { value: 'start' };
        case '.nodeText': return { value: 'hi' };
        default: return { value: '' };
      }
    },
    querySelectorAll(sel){ return sel === '.choices > div' ? [choiceEl] : []; },
    classList:{ contains(){ return false; } },
    style:{},
  };
  elements['treeEditor'] = {
    querySelectorAll(sel){ return sel === '.node' ? [nodeEl] : []; }
  };
  elements['npcTree'] = { value: '' };
  elements['treeWarning'] = { textContent: '' };

  updateTreeData();
  assert.strictEqual(treeData.start.choices[0].reward, 'Reward');
});

test('updateTreeData removes deleted nodes', () => {
  treeData = { start: { text: '', choices: [] }, node1: { text: '', choices: [] } };
  const nodeEl = {
    querySelector(sel){
      switch(sel){
        case '.nodeId': return { value: 'start' };
        case '.nodeText': return { value: '' };
        default: return { value: '' };
      }
    },
    querySelectorAll(){ return []; },
    classList:{ contains(){ return false; } },
    style:{}
  };
  elements['treeEditor'] = {
    querySelectorAll(sel){ return sel === '.node' ? [nodeEl] : []; }
  };
  elements['npcTree'] = { value: '' };
  elements['treeWarning'] = { textContent: '' };
  updateTreeData();
  assert.deepStrictEqual(treeData, { start: { text: '', choices: [] } });
});
