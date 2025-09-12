import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const el = {
    style:{ _props:{}, setProperty(k,v){ this._props[k]=v; }, getPropertyValue(k){ return this._props[k]||''; } },
    classList:{ add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    textContent:'',
    onclick:null,
    children:[],
    dataset:{},
    appendChild(child){ this.children.push(child); child.parentElement=this; },
    prepend(child){ this.children.unshift(child); child.parentElement=this; },
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    getContext: () => ({
      clearRect(){}, drawImage(){}, fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){},
      save(){}, restore(){}, translate(){}, font:'', fillText(){}, globalAlpha:1
    }),
    addEventListener(){},
    remove(){},
    parentElement:{ appendChild(){}, querySelectorAll(){ return []; } }
  };
  return el;
}

test('slot machine works after save and load', async () => {
  const ctx = {
    requestAnimationFrame: () => {},
    addEventListener(){},
    innerWidth:800,
    innerHeight:600,
    localStorage: { getItem: () => null, setItem(){}, removeItem(){} },
    location: { href: '' },
    document: {
      body: stubEl(),
      head: stubEl(),
      createElement: () => stubEl(),
      getElementById: () => stubEl(),
      querySelector: () => stubEl()
    },
    log: () => {},
    toast: () => {},
    renderInv: () => {},
    renderParty: () => {},
    renderQuests: () => {},
    updateHUD: () => {},
    centerCamera: () => {},
    globalThis: null
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);

  const files = [
    '../scripts/event-bus.js',
    '../scripts/core/actions.js',
    '../scripts/core/effects.js',
    '../scripts/core/spoils-cache.js',
    '../scripts/core/abilities.js',
    '../scripts/core/party.js',
    '../scripts/core/inventory.js',
    '../scripts/core/movement.js',
    '../scripts/core/dialog.js',
    '../scripts/core/combat.js',
    '../scripts/core/quests.js',
    '../scripts/core/npc.js',
    '../scripts/game-state.js',
    '../scripts/dustland-core.js'
  ];
  for (const f of files) {
    const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
    vm.runInContext(code, ctx, { filename: f });
  }

  ctx.WORLD_H = 10;
  ctx.WORLD_W = 10;
  ctx.TILE = { WALL: 1, FLOOR: 0, DOOR: 2 };
  ctx.DC = { TALK: 10, REPAIR: 10 };
  ctx.CURRENCY = 'scrap';
  ctx.player.scrap = 5;
  ctx.leader = () => null;
  vm.runInContext('rng = () => 0.9;', ctx);

  const moduleSrc = await fs.readFile(new URL('../modules/dustland.module.js', import.meta.url), 'utf8');
  vm.runInContext(moduleSrc, ctx, { filename: 'dustland.module.js' });
  ctx.moduleData = ctx.DUSTLAND_MODULE;
  ctx.moduleData.postLoad(ctx.moduleData);
  ctx.applyModule(ctx.moduleData);
  ctx.player.scrap = 5;

  let saved = '';
  ctx.localStorage.setItem = (k, v) => { if (k === 'dustland_crt') saved = v; };
  ctx.save();
  ctx.NPCS.length = 0;
  ctx.player.scrap = 5;
  ctx.localStorage.getItem = k => saved;
  await ctx.load();
  vm.runInContext('rng = () => 0.9;', ctx);

  const slotNpc = ctx.NPCS.find(n => n.id === 'slots');
  assert.ok(slotNpc, 'slot npc missing');
  const play = slotNpc.tree.start.choices[0].effects[0];
  const before = ctx.player.scrap;
  play();
  const cost = 1;
  const reward = 2;
  assert.strictEqual(ctx.player.scrap, before - cost + reward);
});
