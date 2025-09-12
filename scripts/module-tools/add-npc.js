import { readModule, getByPath, setByPath, appendByPath, ensureArray } from './utils.js';
import { validate } from './schema.js';

const [file, npcStr] = process.argv.slice(2);
if (!file || !npcStr) {
  console.error('Usage: node scripts/module-tools/add-npc.js <moduleFile> <npcJson>');
  process.exit(1);
}
const mod = readModule(file);
const npc = JSON.parse(npcStr);
validate('npc', npc);
ensureArray(mod.data, 'npcs');
appendByPath(mod.data, 'npcs', npc);
mod.write(mod.data);
