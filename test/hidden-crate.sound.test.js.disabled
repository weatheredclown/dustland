import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
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

test('hidden crate registers sound source', () => {
  const sandbox = {
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
    soundSources: [],
    addQuest: () => {},
    console
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  const scripts = [
    '../scripts/event-bus.js',
    '../scripts/core/actions.js',
    '../scripts/core/effects.js',
    '../scripts/core/module-behaviors.js',
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
  for (const rel of scripts) {
    const code = fs.readFileSync(new URL(rel, import.meta.url), 'utf8');
    vm.runInContext(code, sandbox, { filename: rel });
  }

  sandbox.WORLD_H = 10;
  sandbox.WORLD_W = 10;
  sandbox.TILE = { WALL: 1, FLOOR: 0, DOOR: 2 };
  sandbox.DC = { TALK: 10, REPAIR: 10 };
  sandbox.CURRENCY = 'scrap';
  sandbox.player = sandbox.player || { scrap: 0 };
  sandbox.player.scrap = 5;
  sandbox.leader = () => null;

  const moduleSrc = fs.readFileSync(new URL('../modules/dustland.module.js', import.meta.url), 'utf8');
  vm.runInContext(moduleSrc, sandbox, { filename: 'dustland.module.js' });
  sandbox.applyModule(sandbox.DUSTLAND_MODULE);
  assert.ok(sandbox.soundSources.some(s => s.id === 'hidden_crate'));
});
