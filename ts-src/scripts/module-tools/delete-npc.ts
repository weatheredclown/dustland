// @ts-nocheck
import { readModule, getByPath, findIndexById, removeIndex } from './utils.js';

const [file, id] = process.argv.slice(2);
if (!file || !id) {
  console.error('Usage: node scripts/module-tools/delete-npc.js <moduleFile> <npcId>');
  process.exit(1);
}
const mod = readModule(file);
const npcs = getByPath(mod.data, 'npcs') || [];
const idx = findIndexById(npcs, id);
if (idx === -1) {
  console.error('NPC not found');
  process.exit(1);
}
removeIndex(npcs, idx);
mod.write(mod.data);
