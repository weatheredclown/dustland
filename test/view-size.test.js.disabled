import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  return {
    style:{},
    classList:{ add(){}, remove(){}, toggle(){}, contains(){return false;} },
    textContent:'',
    appendChild(){},
    prepend(){},
    children:[],
    parentElement:{ appendChild(){} },
    getContext: () => ({ fillRect(){}, strokeRect(){}, fillText(){}, clearRect(){}, font:'' })
  };
}

test('getViewSize reflects window bounds', async () => {
  const document = {
    body: stubEl(),
    getElementById: () => stubEl(),
    createElement: () => stubEl(),
    querySelector: () => stubEl()
  };
  const context = {
    window: { innerWidth:320, innerHeight:480, document },
    document,
    EventBus:{ on:()=>{}, emit:()=>{} },
    registerItem:()=>{},
    centerCamera:()=>{},
    setGameState:()=>{},
    incFlag:()=>{},
    renderInv:()=>{},
    renderParty:()=>{},
    renderQuests:()=>{},
    updateHUD:()=>{},
    Audio: function(){},
    console
  };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/dustland-core.js', import.meta.url), 'utf8');
  vm.runInContext(code, context);
  const small = context.getViewSize();
  assert.strictEqual(small.w, 20);
  assert.strictEqual(small.h, 30);
  context.window.innerWidth = 2000;
  context.window.innerHeight = 2000;
  const big = context.getViewSize();
  assert.strictEqual(big.w, 40);
  assert.strictEqual(big.h, 30);
});
