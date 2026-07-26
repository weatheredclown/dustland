import fs from 'node:fs';
import path from 'node:path';
import { extractModuleData, toPosixPath } from './module-data.js';

function usage(): never {
  console.log('Usage: node scripts/supporting/module-json.js <export|import> <moduleFile|all>');
  process.exit(1);
}

interface Portal {
  map: string;
  x: number;
  y: number;
  toMap: string;
  toX: number;
  toY: number;
}

interface ModuleJson {
  world?: number[][] | string[];
  module?: string;
  name?: string;
  interiors?: Array<{ id: string; grid: string[] }>;
  portals?: Portal[];
  [key: string]: unknown;
}

const args = process.argv.slice(2);
if (args.length < 2) usage();
const [cmd, target] = args as [string, string];

const tileEmoji = Object.freeze({
  0: '\u{1F3DD}',
  1: '\u{1FAA8}',
  2: '\u{1F30A}',
  3: '\u{1F33F}',
  4: '\u{1F6E3}',
  5: '\u{1F3DA}',
  6: '\u{1F9F1}',
  7: '\u{2B1C}',
  8: '\u{1F6AA}',
  9: '\u{1F3E0}',
} as const satisfies Record<number, string>);

const emojiTile = Object.freeze(
  Object.fromEntries(
    Object.entries(tileEmoji).map(([key, value]) => [value, Number(key)] as const),
  ) as Record<string, number>,
);

function gridFromEmoji(rows: string[]): number[][] {
  return rows.map(row => Array.from(row).map(ch => emojiTile[ch] ?? 0));
}

function gridToEmoji(grid: number[][]): string[] {
  return grid.map(row => row.map(tile => tileEmoji[tile] ?? '').join(''));
}

function worldIsNumeric(grid: unknown): grid is number[][] {
  if (!Array.isArray(grid) || grid.length === 0) return false;
  return grid.every(
    row => Array.isArray(row) && row.every(cell => typeof cell === 'number'),
  );
}

function worldIsEmoji(grid: unknown): grid is string[] {
  if (!Array.isArray(grid) || grid.length === 0) return false;
  return grid.every(row => typeof row === 'string');
}

const extractData = extractModuleData;

function exportSingleModule(file: string, silentIfMissing = false): boolean {
  const modulePath = path.resolve(file);
  const baseName = path.basename(modulePath).replace(/\.module\.js$/, '');
  const jsonPath = path.join('data', 'modules', `${baseName}.json`);

  const text = fs.readFileSync(modulePath, 'utf8');
  const dataStr = extractData(text);
  if (!dataStr) {
    if (!silentIfMissing) {
      console.error(`DATA block not found in ${file}.`);
    }
    return false;
  }
  const obj = JSON.parse(dataStr) as ModuleJson;
  if (worldIsNumeric(obj.world)) {
    obj.world = gridToEmoji(obj.world);
  }
  obj.module = toPosixPath(file);
  obj.name = obj.name || `${baseName}-module`;
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(obj, null, 2) + '\n');
  console.log(`Exported ${jsonPath}`);
  return true;
}

function importSingleModule(file: string): void {
  const modulePath = path.resolve(file);
  const baseName = path.basename(modulePath).replace(/\.module\.js$/, '');
  const jsonPath = path.join('data', 'modules', `${baseName}.json`);

  const jsonText = fs.readFileSync(jsonPath, 'utf8');
  const obj = JSON.parse(jsonText) as ModuleJson;
  if (worldIsEmoji(obj.world)) {
    obj.world = gridFromEmoji(obj.world);
  }
  delete obj.module;
  const cleanText = JSON.stringify(obj, null, 2);
  const text = fs.readFileSync(modulePath, 'utf8');
  const newText = text.replace(
    /const ((?:[A-Z0-9_]+_)?DATA) = `[\s\S]*?`;/,
    (_match, varName: string) => `const ${varName} = \`\n${cleanText}\n\`;`,
  );
  fs.writeFileSync(modulePath, newText);
  console.log(`Updated ${modulePath}`);
}

if (cmd === 'export') {
  if (target === 'all' || target === '--all') {
    const modulesDir = path.resolve('modules');
    const files = fs.readdirSync(modulesDir).filter(f => f.endsWith('.module.js'));
    let count = 0;
    for (const f of files) {
      const relPath = path.join('modules', f);
      if (exportSingleModule(relPath, true)) {
        count++;
      }
    }
    console.log(`Batch exported ${count} module JSON files to data/modules/`);
  } else {
    exportSingleModule(target);
  }
} else if (cmd === 'import') {
  if (target === 'all' || target === '--all') {
    const modulesDir = path.resolve('modules');
    const files = fs.readdirSync(modulesDir).filter(f => f.endsWith('.module.js'));
    for (const f of files) {
      const relPath = path.join('modules', f);
      const baseName = f.replace(/\.module\.js$/, '');
      const jsonPath = path.join('data', 'modules', `${baseName}.json`);
      if (fs.existsSync(jsonPath)) {
        importSingleModule(relPath);
      }
    }
  } else {
    importSingleModule(target);
  }
} else {
  usage();
}

