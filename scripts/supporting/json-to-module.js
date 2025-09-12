import fs from 'node:fs';
import path from 'node:path';

function usage(){
  console.log('Usage: node scripts/supporting/json-to-module.js <moduleJson>');
  process.exit(1);
}

const [jsonFile] = process.argv.slice(2);
if (!jsonFile) usage();

const jsonPath = path.resolve(jsonFile);
const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);
const pretty = JSON.stringify(data, null, 2);

const base = path.basename(jsonPath, '.json');
const varName = `${base.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_MODULE`;
const outPath = path.join('modules', `${base}.module.js`);

const js = `function seedWorldContent() {}

const DATA = \`\n${pretty}\n\`;

function postLoad(module) {}

globalThis.${varName} = JSON.parse(DATA);
globalThis.${varName}.postLoad = postLoad;

startGame = function () {
  ${varName}.postLoad?.(${varName});
  applyModule(${varName});
  const s = ${varName}.start;
  if (s) {
    setPartyPos(s.x, s.y);
    setMap(s.map, '${data.name || base}');
  }
};
`;

fs.writeFileSync(outPath, js);
console.log(`Created ${outPath}`);

const pickerPath = path.join('scripts', 'module-picker.js');
const lines = fs.readFileSync(pickerPath, 'utf8').split('\n');
const startIdx = lines.findIndex(l => l.includes('const MODULES = ['));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim() === '];');
const entry = `  { id: '${base}', name: '${data.name || base}', file: 'modules/${base}.module.js' },`;
const exists = lines.slice(startIdx, endIdx).some(l => l.includes(`file: 'modules/${base}.module.js'`));
if (!exists) {
  lines.splice(endIdx, 0, entry);
  fs.writeFileSync(pickerPath, lines.join('\n'));
  console.log(`Updated ${pickerPath}`);
}
