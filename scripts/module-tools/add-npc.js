import process from 'process';
import { readModule, appendByPath, ensureArray, parseKeyValueArgs } from './utils.js';
import { validate } from './schema.js';
const [file, ...fields] = process.argv.slice(2);
if (!file || fields.length === 0) {
    console.error('Usage: node scripts/module-tools/add-npc.js <moduleFile> key=value [key=value ...]');
    process.exit(1);
}
const mod = readModule(file);
const data = mod.data;
const npc = parseKeyValueArgs(fields);
validate('npc', npc);
ensureArray(data, 'npcs');
appendByPath(data, 'npcs', npc);
mod.write(data);
