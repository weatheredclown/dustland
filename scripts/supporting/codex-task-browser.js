#!/usr/bin/env node
// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const defaultTasksPath = path.join(repoRoot, 'docs', 'design', 'codex-tasks.json');
export function loadCodexTasks(filePath = defaultTasksPath) {
    const resolvedPath = path.resolve(filePath);
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    const payload = JSON.parse(raw);
    if (!Array.isArray(payload?.tasks)) {
        throw new Error('Invalid codex task payload: expected tasks array');
    }
    return { payload, resolvedPath };
}
export function normalizeTasks(tasks) {
    return tasks.map(task => ({
        id: task.id ?? '',
        title: task.title ?? '',
        codexCommand: Array.isArray(task.codexCommand) ? task.codexCommand : [],
        source: {
            file: task.source?.file ?? '',
            line: task.source?.line ?? null,
            headings: Array.isArray(task.source?.headings) ? task.source.headings : [],
            ancestors: Array.isArray(task.source?.ancestors) ? task.source.ancestors : [],
        },
    }));
}
export function filterTasks(tasks, query) {
    if (!query)
        return tasks;
    const needle = query.toLowerCase();
    return tasks.filter(task => {
        const haystack = [
            task.title,
            task.id,
            task.source?.file,
            ...(task.source?.headings ?? []),
            ...(task.source?.ancestors ?? []),
            ...(Array.isArray(task.codexCommand) ? task.codexCommand : []),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return haystack.includes(needle);
    });
}
export function pickTask(tasks, identifier) {
    if (!identifier)
        return null;
    const index = Number.parseInt(identifier, 10);
    if (!Number.isNaN(index)) {
        const task = tasks[index - 1];
        return task ?? null;
    }
    return tasks.find(task => task.id === identifier) ?? null;
}
export function formatTask(task, index) {
    if (!task)
        return '';
    const prefix = typeof index === 'number' ? `${index + 1}.` : '-';
    const lines = [`${prefix} ${task.title}`];
    const metadata = [];
    if (task.source?.file) {
        const location = task.source.line ? `${task.source.file}:${task.source.line}` : task.source.file;
        metadata.push(location);
    }
    if (task.id)
        metadata.push(task.id);
    if (metadata.length) {
        lines.push(`   ${metadata.join(' | ')}`);
    }
    if (task.codexCommand?.length) {
        lines.push(`   Command: ${task.codexCommand.join(' ')}`);
    }
    if (task.source?.headings?.length) {
        lines.push(`   Headings: ${task.source.headings.join(' > ')}`);
    }
    if (task.source?.ancestors?.length) {
        lines.push(`   Ancestors: ${task.source.ancestors.join(' > ')}`);
    }
    return lines.join('\n');
}
function printUsage() {
    console.log(`Usage: node scripts/supporting/codex-task-browser.js [options] [command]

Commands:
  list [query]      List tasks, optionally filtered by a search query.
  show <id|index>  Show the full details for a single task by id or 1-based index.

Options:
  -f, --file <path>  Path to a codex-tasks.json file (defaults to docs/design/codex-tasks.json).
  -h, --help         Show this message.
`);
}
export function runCli(argv = process.argv.slice(2)) {
    const options = { file: defaultTasksPath };
    const positional = [];
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        if (arg === '--file' || arg === '-f') {
            index++;
            if (index >= argv.length) {
                throw new Error('Missing value after --file');
            }
            options.file = argv[index];
            continue;
        }
        if (arg === '--help' || arg === '-h') {
            printUsage();
            return 0;
        }
        positional.push(arg);
    }
    const command = positional.shift() ?? 'list';
    const { payload, resolvedPath } = loadCodexTasks(options.file);
    const tasks = normalizeTasks(payload.tasks);
    if (command === 'list') {
        const query = positional.shift() ?? '';
        const filtered = filterTasks(tasks, query);
        if (!filtered.length) {
            console.log(`No codex tasks matched the query in ${path.relative(repoRoot, resolvedPath)}`);
            return 0;
        }
        filtered.forEach((task, index) => {
            console.log(formatTask(task, index));
            if (index < filtered.length - 1)
                console.log('');
        });
        return 0;
    }
    if (command === 'show') {
        const identifier = positional.shift();
        if (!identifier) {
            throw new Error('Missing task id or index for show command');
        }
        const task = pickTask(tasks, identifier);
        if (!task) {
            throw new Error(`Unable to find task '${identifier}' in ${path.relative(repoRoot, resolvedPath)}`);
        }
        console.log(formatTask(task));
        return 0;
    }
    throw new Error(`Unknown command: ${command}`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        const exitCode = runCli();
        process.exit(exitCode);
    }
    catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
