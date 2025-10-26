import process from 'node:process';

import { readModule, getByPath, findIndexById, removeIndex, type ModuleDocument, type ModuleEntity } from './utils.js';

const [file, id] = process.argv.slice(2);
if (!file || !id) {
  console.error('Usage: node scripts/module-tools/delete-npc.js <moduleFile> <npcId>');
  process.exit(1);
}
const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const npcsValue = getByPath(data, 'npcs');
if (!Array.isArray(npcsValue)) {
  console.error('NPC not found');
  process.exit(1);
}
const npcs = npcsValue as ModuleEntity[];
const idx = findIndexById(npcs, id);
if (idx === -1) {
  console.error('NPC not found');
  process.exit(1);
}
removeIndex<ModuleEntity>(npcs, idx);
mod.write(data);
