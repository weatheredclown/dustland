#!/usr/bin/env node
// Run with `node scripts/codex-todo-runner.js` from the repo root.

import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function installCodex() {
  try {
    execSync('codex --version', {stdio: 'ignore'});
  } catch {
    console.log('Installing GitHub Codex CLI...');
    execSync('npm install -g @openai/codex', {stdio: 'inherit'});
  }
}

function findDesignDocs() {
  const dir = path.join(__dirname, '..', 'docs', 'design');
  return fs.readdirSync(dir).map(f => path.join(dir, f)).filter(f => fs.statSync(f).isFile());
}

function extractTodos(content) {
  const todoRegex = /^\s*- \[ \] (.*)$/gm;
  const items = [];
  let match;
  while ((match = todoRegex.exec(content)) !== null) {
    items.push({text: match[1], index: match.index});
  }
  return items;
}

function markDone(content, index) {
  return content.slice(0, index + 3) + 'x' + content.slice(index + 4);
}

function run() {
  installCodex();
  const files = findDesignDocs();
  for (const file of files) {
    let text = fs.readFileSync(file, 'utf8');
    let todos = extractTodos(text);
    while (todos.length) {
      const todo = todos[0];
      console.log('Working on', todo.text);
      try {
        execSync(`codex commit "${todo.text}"`, {stdio: 'inherit'});
        text = markDone(text, todo.index);
        fs.writeFileSync(file, text);
        execSync(`git add ${file}`);
        execSync(`git commit -m "feat: ${todo.text}"`);
      } catch {
        console.error('Codex failed for', todo.text);
        break;
      }
      todos = extractTodos(text);
    }
  }
}

run();
