import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const invCode = await fs.readFile(new URL('../scripts/core/inventory.js', import.meta.url), 'utf8');

const zoneEffects = [];
function registerZoneEffects(list){
  (list||[]).forEach(z => {
    zoneEffects.push(z);
    const id = z.useItem?.id;
    if(id){
      EventBus.on(`used:${id}`, () => {
        const map = z.map || 'world';
        if(party.map !== map) return;
        const { x, y } = party;
        if(x < z.x || y < z.y || x >= z.x + (z.w || 0) || y >= z.y + (z.h || 0)) return;
        if(z.useItem.once && z.useItem._used) return;
        if(z.useItem.reward){
          Dustland.actions.applyQuestReward(z.useItem.reward);
        }
        if(z.useItem.once) z.useItem._used = true;
      });
    }
  });
}

const logs = [];
const bus = { listeners:{}, on(evt,fn){ (bus.listeners[evt]=bus.listeners[evt]||[]).push(fn); }, emit(evt,p){ (bus.listeners[evt]||[]).forEach(f=>f(p)); } };

global.EventBus = bus;
global.Dustland = { actions:{ applyQuestReward(r){ if(/^scrap\s+/i.test(r)) player.scrap += parseInt(r.replace(/[^0-9]/g,''),10); } } };
const party = [];
party.x = 0; party.y = 0; party.map = 'world';
party.push({ name:'Hero', hp:1, maxHp:1, stats:{}, _bonus:{} });
global.party = party;
global.player = { inv:[], scrap:0, hp:1 };
global.log = m => logs.push(m);
global.toast = () => {};
global.selectedMember = 0;
global.updateHUD = () => {};

vm.runInThisContext(invCode, { filename: 'core/inventory.js' });

registerItem({ id:'mystic_key', name:'Mystic Key', type:'consumable', use:{ type:'heal', amount:0, text:'The key glows.' } });
registerZoneEffects([{ map:'world', x:0, y:0, w:1, h:1, useItem:{ id:'mystic_key', reward:'scrap 5', once:true } }]);

registerItem({ id:'wand', name:'Wand', type:'consumable', use:{ type:'heal', amount:0, text:'You wave the wand.', consume:false } });
registerZoneEffects([{ map:'world', x:1, y:0, w:1, h:1, useItem:{ id:'wand', reward:'scrap 5', once:true } }]);

test('zone rewards on item use and only once', () => {
  player.inv = [getItem('mystic_key')];
  useItem(0);
  assert.strictEqual(player.scrap, 5);
  assert.ok(logs.includes('The key glows.'));
  player.inv = [getItem('mystic_key')];
  useItem(0);
  assert.strictEqual(player.scrap, 5);
  zoneEffects[0].useItem._used = false;
  party.x = 2; party.y = 2;
  player.inv = [getItem('mystic_key')];
  useItem(0);
  assert.strictEqual(player.scrap, 5);
});

test('wand triggers zone reward and logs use', () => {
  logs.length = 0;
  player.scrap = 0;
  party.x = 1; party.y = 0;
  player.inv = [getItem('wand')];
  useItem(0);
  assert.strictEqual(player.scrap, 5);
  assert.ok(logs.includes('You wave the wand.'));
  assert.strictEqual(player.inv.length, 1);
  assert.strictEqual(player.inv[0].id, 'wand');
});
