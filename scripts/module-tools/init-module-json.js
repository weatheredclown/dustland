#!/usr/bin/env node
// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import { parseValue } from './utils.js';
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
    if (key in defaults) {
        defaults[key] = value;
    }
    else {
        console.error(`Unknown option: ${key}`);
        process.exit(1);
    }
}
const start = {
    map: defaults.map,
    x: Number.isFinite(defaults.x) ? defaults.x : Number(defaults.x) || 0,
    y: Number.isFinite(defaults.y) ? defaults.y : Number(defaults.y) || 0
};
const moduleData = {
    seed: defaults.seed,
    name: defaults.name,
    start,
    items: [],
    quests: [],
    npcs: [],
    events: [],
    portals: [],
    interiors: [],
    buildings: [],
    zones: [],
    templates: []
};
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(moduleData, null, 2) + '\n');
function createDefaults(filePath) {
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
