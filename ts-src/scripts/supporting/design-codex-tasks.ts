#!/usr/bin/env node
// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const designDir = path.join(repoRoot, 'docs', 'design');
const defaultOutput = path.join(designDir, 'codex-tasks.json');

function walkMarkdownFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function normalizeIndent(rawIndent) {
  if (!rawIndent) return 0;
  return rawIndent.replace(/\t/g, '    ').length;
}

function collectHeadings(lines) {
  const headingStack = [];
  const headingsByLine = new Array(lines.length).fill(null);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      const level = match[1].length;
      while (headingStack.length && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop();
      }
      headingStack.push({level, title: match[2].trim()});
    }
    headingsByLine[i] = headingStack.map(h => h.title);
  }
  return headingsByLine;
}

export function collectDesignTodos({root = repoRoot, designPath = designDir} = {}) {
  const todos = [];
  const files = walkMarkdownFiles(designPath);
  for (const file of files.sort()) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    const headingPathByLine = collectHeadings(lines);
    const listStack = [];
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const todoMatch = line.match(/^(\s*)- \[ \] (.*)$/);
      if (todoMatch) {
        const indent = normalizeIndent(todoMatch[1]);
        while (listStack.length && listStack[listStack.length - 1].indent >= indent) {
          listStack.pop();
        }
        const text = todoMatch[2].trim();
        const ancestors = listStack.map(item => item.text);
        todos.push({
          id: `${path.relative(root, file).replace(/\\/g, '/')}:${index + 1}`,
          text,
          file: path.relative(root, file).replace(/\\/g, '/'),
          line: index + 1,
          headings: headingPathByLine[index],
          ancestors,
        });
        listStack.push({indent, text});
        continue;
      }
      const bulletMatch = line.match(/^(\s*)- /);
      if (bulletMatch) {
        const indent = normalizeIndent(bulletMatch[1]);
        while (listStack.length && listStack[listStack.length - 1].indent >= indent) {
          listStack.pop();
        }
      }
    }
  }
  return todos;
}

export function buildCodexTasksPayload(todos) {
  const sorted = [...todos].sort((a, b) => {
    if (a.file === b.file) return a.line - b.line;
    return a.file.localeCompare(b.file);
  });
  return {
    generatedAt: new Date().toISOString(),
    taskCount: sorted.length,
    tasks: sorted.map(todo => ({
      id: todo.id,
      title: todo.text,
      codexCommand: ['codex', 'commit', todo.text],
      source: {
        file: todo.file,
        line: todo.line,
        headings: todo.headings,
        ancestors: todo.ancestors,
      },
    })),
  };
}

export function writeCodexTasksFile(outputPath = defaultOutput) {
  const todos = collectDesignTodos();
  const payload = buildCodexTasksPayload(todos);
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n');
  return payload;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultOutput;
  const payload = writeCodexTasksFile(targetPath);
  const rel = path.relative(repoRoot, targetPath) || path.basename(targetPath);
  console.log(`Wrote ${payload.taskCount} codex tasks to ${rel}`);
}
