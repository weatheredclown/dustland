import fs from 'node:fs';
import path from 'node:path';

function usage(){
  console.log('Usage: node scripts/module-json.js <export|import> <moduleFile>');
  process.exit(1);
}

const [cmd, file] = process.argv.slice(2);
if (!cmd || !file) usage();

const modulePath = path.resolve(file);
const baseName = path.basename(modulePath).replace(/\.module\.js$/, '');
const jsonPath = path.join('data', 'modules', `${baseName}.json`);

function extractData(str){
  const match = str.match(/const DATA = `([\s\S]*?)`;/);
  return match ? match[1] : null;
}

if (cmd === 'export') {
  const text = fs.readFileSync(modulePath, 'utf8');
  const dataStr = extractData(text);
  if (!dataStr) {
    console.error('DATA block not found.');
    process.exit(1);
  }
  const obj = JSON.parse(dataStr);
  obj.module = file;
  obj.name = obj.name || `${baseName}-module`;
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(obj, null, 2));
  console.log(`Exported ${jsonPath}`);
} else if (cmd === 'import') {
  const jsonText = fs.readFileSync(jsonPath, 'utf8');
  const obj = JSON.parse(jsonText);
  delete obj.module;
  const cleanText = JSON.stringify(obj, null, 2);
  const text = fs.readFileSync(modulePath, 'utf8');
  const newText = text.replace(/const DATA = `[\s\S]*?`;/, `const DATA = \`\n${cleanText}\n\`;`);
  fs.writeFileSync(modulePath, newText);
  console.log(`Updated ${modulePath}`);
} else {
  usage();
}
