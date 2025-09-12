import { readModule, setByPath } from './utils.js';

const [file, path, value] = process.argv.slice(2);
if (!file || !path || value === undefined) {
  console.error('Usage: node scripts/module-tools/set.js <moduleFile> <path> <jsonValue>');
  process.exit(1);
}
const mod = readModule(file);
setByPath(mod.data, path, JSON.parse(value));
mod.write(mod.data);
