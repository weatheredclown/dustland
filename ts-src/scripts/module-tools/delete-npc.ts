import process from 'process';

import { readModule, getByPath, findIndexById, removeIndex } from './utils.js';

const [file, id] = process.argv.slice(2);
if (!file || !id) {
  console.error('Usage: node scripts/module-tools/delete-npc.js <moduleFile> <npcId>');
  process.exit(1);
}
const mod = readModule(file);
const data = mod.data as Record<string, unknown>;
const npcsValue = getByPath<Record<string, unknown>>(data, 'npcs');
if (!Array.isArray(npcsValue)) {
  console.error('NPC not found');
  process.exit(1);
}
type NpcRecord = { id?: string; [key: string]: unknown };
const npcs = npcsValue as NpcRecord[];
const idx = findIndexById(npcs, id);
if (idx === -1) {
  console.error('NPC not found');
  process.exit(1);
}
removeIndex(npcs, idx);
mod.write(data);
