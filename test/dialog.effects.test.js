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
  '../event-bus.js',
  '../core/movement.js',
  '../dustland-core.js',
  '../adventure-kit.js'
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
  const nodeEl = {
    querySelector(sel){
      switch(sel){
        case '.nodeId': return { value: 'start' };
        case '.nodeText': return { value: 'hi' };
        case '.nodeBoard': return boardSel;
        case '.nodeUnboard': return unboardSel;
        default: return { value: '' };
      }
    },
    querySelectorAll(sel){ return sel === '.choices > div' ? [] : []; },
    classList:{ contains(){ return false; } },
    style:{}
  };
  elements['treeEditor'] = {
    querySelectorAll(sel){ return sel === '.node' ? [nodeEl] : []; }
  };
  elements['npcTree'] = { value: '' };
  elements['treeWarning'] = { textContent: '' };

  updateTreeData();
  assert.deepStrictEqual(treeData.start.effects, [ { effect: 'boardDoor', interiorId: 'castle' } ]);

  boardSel.value = '';
  unboardSel.value = 'castle';
  updateTreeData();
  assert.deepStrictEqual(treeData.start.effects, [ { effect: 'unboardDoor', interiorId: 'castle' } ]);
});
