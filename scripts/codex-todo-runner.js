#!/usr/bin/env node

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

function installCodex() {
  try {
    execSync('codex --version', {stdio: 'ignore'});
  } catch (err) {
    console.log('Installing GitHub Codex CLI...');
    execSync('curl -fsSL https://developers.openai.com/codex/install.sh | sh', {stdio: 'inherit'});
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
    const todos = extractTodos(text);
    if (!todos.length) continue;
    for (const todo of todos) {
      console.log('Working on', todo.text);
      try {
        execSync(`codex commit "${todo.text}"`, {stdio: 'inherit'});
        text = markDone(text, todo.index);
        fs.writeFileSync(file, text);
        execSync(`git add ${file}`);
        execSync(`git commit -m "feat: ${todo.text}"`);
      } catch (err) {
        console.error('Codex failed for', todo.text);
      }
    }
  }
}

run();
