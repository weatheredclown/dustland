#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const SOURCE_ROOT = 'ts-src';
const SUPPORTED_ROOTS = new Set(['scripts', 'components', 'modules', 'data']);
function toPosix(value) {
    return value.replace(/\\/g, '/');
}
function listTypeScriptFiles(dir, base) {
    const out = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules')
            continue;
        const resolved = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...listTypeScriptFiles(resolved, base));
        }
        else if (entry.isFile() && entry.name.endsWith('.ts')) {
            const rel = path.relative(base, resolved);
            out.push(toPosix(rel));
        }
    }
    return out;
}
export function collectSources(projectRoot) {
    const srcRoot = path.join(projectRoot, SOURCE_ROOT);
    if (!fs.existsSync(srcRoot))
        return [];
    return listTypeScriptFiles(srcRoot, srcRoot);
}
function mapRootFor(relative) {
    if (relative === 'music-demo.ts') {
        return 'music-demo.js';
    }
    const first = relative.split('/')[0];
    if (SUPPORTED_ROOTS.has(first)) {
        return `${relative.replace(/\.ts$/, '.js')}`;
    }
    if (relative.endsWith('.d.ts')) {
        return null;
    }
    return null;
}
export function mapOutputPath(projectRoot, relativeSource) {
    if (relativeSource.endsWith('.d.ts'))
        return null;
    const normalized = toPosix(relativeSource);
    if (normalized === '')
        return null;
    const mapped = mapRootFor(normalized);
    if (!mapped)
        return null;
    return path.join(projectRoot, mapped);
}
function toRelative(projectRoot, absolute) {
    return toPosix(path.relative(projectRoot, absolute));
}
const MTIME_EPSILON = 1;
export function analyzeBuild(projectRoot) {
    const sources = collectSources(projectRoot).filter(rel => !rel.endsWith('.d.ts'));
    const missing = [];
    const stale = [];
    const unmatched = [];
    const srcRoot = path.join(projectRoot, SOURCE_ROOT);
    for (const rel of sources) {
        const dest = mapOutputPath(projectRoot, rel);
        if (!dest) {
            unmatched.push(rel);
            continue;
        }
        const srcPath = path.join(srcRoot, rel);
        if (!fs.existsSync(dest)) {
            missing.push({ src: toPosix(path.join(SOURCE_ROOT, rel)), dest: toRelative(projectRoot, dest) });
            continue;
        }
        const srcStat = fs.statSync(srcPath);
        const destStat = fs.statSync(dest);
        if (destStat.mtimeMs + MTIME_EPSILON < srcStat.mtimeMs) {
            stale.push({ src: toPosix(path.join(SOURCE_ROOT, rel)), dest: toRelative(projectRoot, dest) });
        }
    }
    const checked = sources.length - unmatched.length;
    return { missing, stale, unmatched, total: sources.length, checked };
}
function runCli() {
    const projectRoot = process.cwd();
    const analysis = analyzeBuild(projectRoot);
    if (analysis.missing.length || analysis.stale.length || analysis.unmatched.length) {
        if (analysis.missing.length) {
            console.error('Missing compiled outputs:');
            for (const issue of analysis.missing) {
                console.error(`  - ${issue.src} -> ${issue.dest}`);
            }
        }
        if (analysis.stale.length) {
            console.error('Stale compiled outputs:');
            for (const issue of analysis.stale) {
                console.error(`  - ${issue.src} -> ${issue.dest}`);
            }
        }
        if (analysis.unmatched.length) {
            console.error('Unmapped TypeScript sources:');
            for (const item of analysis.unmatched) {
                console.error(`  - ${item}`);
            }
        }
        const parts = [];
        if (analysis.missing.length)
            parts.push(`${analysis.missing.length} missing`);
        if (analysis.stale.length)
            parts.push(`${analysis.stale.length} stale`);
        if (analysis.unmatched.length)
            parts.push(`${analysis.unmatched.length} unmapped`);
        console.error(`Build health failed (${parts.join(', ')}).`);
        process.exit(1);
    }
    console.log(`Build health passed: ${analysis.checked}/${analysis.total} sources are current.`);
}
const invokedAsScript = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (invokedAsScript) {
    runCli();
}
