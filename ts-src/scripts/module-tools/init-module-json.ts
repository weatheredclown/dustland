#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseValue, type ModuleDocument, type ModuleEntity } from './utils.js';

type Defaults = {
  seed: string;
  name: string;
  map: string;
  x: number | string;
  y: number | string;
};

type ModuleStart = {
  map: string;
  x: number;
  y: number;
};

const [file, ...args] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/module-tools/init-module-json.js <moduleFile> [seed=...] [name=...] [map=...] [x=...] [y=...]');
  process.exit(1);
}

const defaults = createDefaults(file);
for (const arg of args) {
  const eq = arg.indexOf('=');
  if (eq === -1) {
    console.error(`Invalid argument: ${arg}`);
    process.exit(1);
  }
  const key = arg.slice(0, eq);
  const value = parseValue(arg.slice(eq + 1));
  if (key === 'x' || key === 'y') {
    if (typeof value === 'number' || typeof value === 'string') {
      defaults[key] = value;
    } else {
      console.error(`${key} must be a number`);
      process.exit(1);
    }
  } else if (key === 'seed' || key === 'name' || key === 'map') {
    if (typeof value === 'string' || typeof value === 'number') {
      defaults[key] = String(value);
    } else {
      console.error(`${key} must be a string`);
      process.exit(1);
    }
  } else {
    console.error(`Unknown option: ${key}`);
    process.exit(1);
  }
}

const parsedX = typeof defaults.x === 'number' ? defaults.x : Number(defaults.x);
const parsedY = typeof defaults.y === 'number' ? defaults.y : Number(defaults.y);

const start: ModuleStart = {
  map: defaults.map,
  x: Number.isFinite(parsedX) ? parsedX : 0,
  y: Number.isFinite(parsedY) ? parsedY : 0
};

const moduleData: ModuleDocument = {
  seed: defaults.seed,
  name: defaults.name,
  start,
  items: [] as ModuleEntity[],
  quests: [] as ModuleEntity[],
  npcs: [] as ModuleEntity[],
  events: [] as ModuleEntity[],
  portals: [] as ModuleEntity[],
  interiors: [] as ModuleEntity[],
  buildings: [] as ModuleEntity[],
  zones: [] as ModuleEntity[],
  templates: [] as ModuleEntity[]
};

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(moduleData, null, 2) + '\n');

function createDefaults(filePath: string): Defaults {
  const basename = path.basename(filePath, path.extname(filePath));
  const displayName = basename
    .split(/[-_]/g)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return {
    seed: `${basename}-seed`,
    name: displayName || 'New Adventure',
    map: 'world',
    x: 0,
    y: 0
  };
}
