import {execSync} from 'node:child_process';
import fs from 'node:fs';

function sh(cmd) {
  console.log("$ " + cmd);
  const out = execSync(cmd, {encoding: 'utf8'}).trim();
  console.log(out);
  return out;
}

function getMessages(tag) {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  const out = sh(`git log ${range} --pretty=%s`);
  return out ? out.split('\n').filter(Boolean) : [];
}

function bumpFrom(messages) {
  let level = 'patch';
  for (const raw of messages) {
    const msg = raw.toLowerCase();
    if (/^system(?:\(.+\))?!:/.test(msg) || msg.includes('breaking change')) {
      return 'major';
    }
    if (msg.startsWith('feat') && level === 'patch') {
      level = 'minor';
    }
  }
  return level;
}

function inc(v, level) {
  const parts = v.split('.').map(Number);
  if (level === 'major') return `${parts[0] + 1}.0.0`;
  if (level === 'minor') return `${parts[0]}.${parts[1] + 1}.0`;
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

function main() {
  let tag = '';
  try {
    tag = sh('git describe --tags --abbrev=0');
  } catch {
    // no tags yet
  }
  const messages = getMessages(tag);
  if (!messages.length) {
    console.log('No commits to release.');
    return;
  }

  const pkgPath = 'package.json';
  const enginePath = 'scripts/dustland-engine.js';
  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  const next = inc(pkg.version, bumpFrom(messages));

  pkg.version = next;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  const eng = fs.readFileSync(enginePath, 'utf8').replace(
    /ENGINE_VERSION = '[^']+'/, `ENGINE_VERSION = '${next}'`
  );
  fs.writeFileSync(enginePath, eng);

  sh('git config user.name "github-actions[bot]"');
  sh('git config user.email "github-actions[bot]@users.noreply.github.com"');
  sh(`git add ${pkgPath} ${enginePath}`);
  sh(`git commit -m "chore: bump version to ${next}"`);
  sh(`git tag v${next}`);
  // Discard incidental lockfile changes from install steps.
  // These would otherwise block the rebase pull below.
  sh('git checkout -- package-lock.json');
  sh('git pull --rebase');
  sh('git push');
  sh('git push --tags');
}

main();

