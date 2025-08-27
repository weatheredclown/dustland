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
    appendChild(child){ this.children.push(child); child.parentElement=this; },
    querySelector(){ return stubEl(); },
    querySelectorAll(){ return []; },
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
  '../scripts/dustland-core.js',
  '../scripts/core/npc.js',
  '../scripts/core/dialog.js'
];
for(const f of files){
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

global.setPortrait = () => {};
global.setGameState = () => {};
global.updateHUD = () => {};
global.centerCamera = () => {};
global.refreshUI = () => {};
global.log = () => {};
global.player = { inv: [] };
global.party = {};
global.state = { map: 'world' };

test('dialog jump redirects based on flags', () => {
  const tree = {
    start:{ jump:[ { if:{ flag:'a', op:'>=', value:1 }, to:'one' }, { to:'zero' } ] },
    zero:{ text:'zero', choices:[ { label:'(Leave)', to:'bye' } ] },
    one:{ text:'one', choices:[ { label:'(Leave)', to:'bye' } ] }
  };
  const npc = makeNPC('npc1','world',0,0,'#fff','NPC','', '', tree, null, null, null, {});

  setFlag('a',0);
  openDialog(npc, 'start');
  assert.equal(elements.dialogText.textContent, 'zero');
  closeDialog();

  setFlag('a',1);
  openDialog(npc, 'start');
  assert.equal(elements.dialogText.textContent, 'one');
});
