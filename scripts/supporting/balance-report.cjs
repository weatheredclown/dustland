#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function parseArgs(argv) {
  const args = Array.isArray(argv) ? [...argv] : [];
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    if (key === 'help') {
      opts.help = true;
      continue;
    }
    const next = args[i + 1];
    if (next && !next.startsWith('--')) {
      opts[key] = next;
      i++;
    } else {
      opts[key] = true;
    }
  }
  return opts;
}

function showHelp() {
  const msg = `Usage: node scripts/supporting/balance-report.cjs [options]\n\n` +
    `Options:\n` +
    `  --module <id>       Module slug in data/modules (default: dustland)\n` +
    `  --output <path>     Output markdown path (default: docs/balance/<module>-balance-report.md)\n` +
    `  --levels <list>     Comma-separated party levels to evaluate (default: 1,4,7)\n` +
    `  --adrenaline <list> Comma-separated adrenaline fill percentages (default: 0,0.5,1)\n` +
    `  --stdout            Write report to stdout instead of file\n` +
    `  --help              Show this message\n`;
  process.stdout.write(msg);
}

function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function loadModuleData(moduleId) {
  const modPath = path.join(__dirname, '..', '..', 'data', 'modules', `${moduleId}.json`);
  if (!fs.existsSync(modPath)) {
    throw new Error(`Module data not found: ${modPath}`);
  }
  const mod = readJSON(modPath);
  mod.__file = modPath;
  return mod;
}

function loadEnemyTemplates() {
  const dir = path.join(__dirname, '..', '..', 'data', 'enemies');
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  return entries.map(file => {
    const full = path.join(dir, file);
    const data = readJSON(full);
    data.__file = full;
    return data;
  });
}

function captureEquipmentItems() {
  const file = path.join(__dirname, '..', 'core', 'equipment.js');
  if (!fs.existsSync(file)) return [];
  const code = fs.readFileSync(file, 'utf8');
  const captured = [];
  const sandbox = {
    registerItem(item) {
      if (item && typeof item === 'object') captured.push(item);
      return item;
    },
    globalThis: {},
    console
  };
  sandbox.globalThis = sandbox;
  try {
    vm.runInNewContext(code, sandbox, { filename: file });
  } catch (err) {
    throw new Error(`Failed to evaluate equipment.js: ${err.message}`);
  }
  return captured;
}

function normalizeItem(entry, source) {
  if (!entry || typeof entry !== 'object') return null;
  const mods = typeof entry.mods === 'object' ? { ...entry.mods } : {};
  const tags = Array.isArray(entry.tags) ? [...new Set(entry.tags.filter(t => typeof t === 'string'))] : [];
  const slot = entry.slot || entry.type || 'misc';
  return {
    id: entry.id || null,
    name: entry.name || entry.id || 'Unknown Item',
    type: entry.type || entry.slot || 'misc',
    slot,
    mods,
    tags,
    source
  };
}

function collectModuleItems(moduleData) {
  const items = Array.isArray(moduleData.items) ? moduleData.items : [];
  return items.map(it => normalizeItem(it, moduleData.__file)).filter(Boolean);
}

function mergeItems(lists) {
  const all = [];
  const byId = new Map();
  for (const list of lists) {
    for (const item of list) {
      if (!item) continue;
      if (item.id) {
        if (!byId.has(item.id)) {
          byId.set(item.id, item);
          all.push(item);
        }
      } else {
        all.push(item);
      }
    }
  }
  return all;
}

function weaponRangeType(item) {
  const tags = item.tags || [];
  if (tags.some(tag => /ranged|rifle|gun|bow|pistol/i.test(tag))) return 'ranged';
  const id = item.id || '';
  const name = item.name || '';
  if (/rifle|bow|gun|pistol/i.test(id) || /rifle|bow|gun|pistol/i.test(name)) return 'ranged';
  return 'melee';
}

function assignTiers(items, keySelector) {
  const values = [...new Set(items.map(item => keySelector(item)))].sort((a, b) => a - b);
  const tierNames = values.map((_, idx) => `T${idx + 1}`);
  return items.map(item => {
    const key = keySelector(item);
    const idx = values.indexOf(key);
    const tier = tierNames[idx] || 'T?';
    return { ...item, tier, tierIndex: idx, tierValue: key };
  });
}

function summarizeTierGroup(items, key) {
  const group = { items, key, count: items.length };
  const sum = {};
  const multiplierTotals = {};
  const multiplierCounts = {};
  const multiplierKeys = new Set(['adrenaline_gen_mod', 'adrenaline_dmg_mod']);
  const tagSet = new Set();
  for (const item of items) {
    const mods = item.mods || {};
    for (const modKey of Object.keys(mods)) {
      const val = mods[modKey];
      if (typeof val !== 'number') continue;
      if (multiplierKeys.has(modKey)) {
        multiplierTotals[modKey] = (multiplierTotals[modKey] || 0) + val;
        multiplierCounts[modKey] = (multiplierCounts[modKey] || 0) + 1;
      } else {
        sum[modKey] = (sum[modKey] || 0) + val;
      }
    }
    (item.tags || []).forEach(tag => tagSet.add(tag));
  }
  const avg = {};
  const totalItems = items.length || 1;
  for (const modKey of Object.keys(sum)) {
    avg[modKey] = sum[modKey] / totalItems;
  }
  for (const keyName of multiplierKeys) {
    const present = multiplierCounts[keyName] || 0;
    const total = multiplierTotals[keyName] || 0;
    const missing = totalItems - present;
    if (totalItems === 0) {
      avg[keyName] = 1;
    } else if (present === 0) {
      avg[keyName] = 1;
    } else {
      avg[keyName] = (total + missing * 1) / totalItems;
    }
  }
  group.avgMods = avg;
  group.tags = [...tagSet].sort();
  return group;
}

function buildTierGroups(items) {
  const byTier = new Map();
  for (const item of items) {
    const key = item.tier;
    if (!byTier.has(key)) byTier.set(key, []);
    byTier.get(key).push(item);
  }
  const groups = [];
  const tierKeys = [...byTier.keys()].sort((a, b) => {
    const ai = byTier.get(a)[0]?.tierIndex ?? 0;
    const bi = byTier.get(b)[0]?.tierIndex ?? 0;
    return ai - bi;
  });
  for (const key of tierKeys) {
    groups.push(summarizeTierGroup(byTier.get(key), key));
  }
  return groups;
}

function extractCombatants(moduleData) {
  const npcs = Array.isArray(moduleData.npcs) ? moduleData.npcs : [];
  const combats = [];
  for (const npc of npcs) {
    const combat = npc.combat;
    if (!combat) continue;
    const hp = combat.HP ?? combat.hp ?? null;
    const atk = combat.ATK ?? combat.atk ?? null;
    const def = combat.DEF ?? combat.def ?? 0;
    const xpOverride = Number.isFinite(combat.xp) ? combat.xp : null;
    const challenge = Number.isFinite(combat.challenge)
      ? combat.challenge
      : Number.isFinite(combat.HP)
        ? combat.HP
        : Number.isFinite(combat.hp)
          ? combat.hp
          : null;
    const count = Number.isFinite(combat.count) ? combat.count : null;
    const entry = {
      id: npc.id || npc.name || null,
      name: npc.name || npc.id || 'Unknown Enemy',
      hp: typeof hp === 'number' ? hp : null,
      atk: typeof atk === 'number' ? atk : null,
      def: typeof def === 'number' ? def : 0,
      counterBasic: combat.counterBasic || null,
      immune: combat.immune || combat.Immune || [],
      requires: combat.requires || null,
      special: combat.special || null,
      notes: combat.auto ? ['auto'] : [],
      source: moduleData.__file,
      xpOverride,
      challenge,
      count
    };
    combats.push(entry);
  }
  return combats;
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return '—';
  return parseFloat(value.toFixed(digits)).toString();
}

function expectedPlayerDamage({ baseDmg, statBonus, atkBonus, enemyDef = 0, adrPct = 0, adrDmgMod = 1, immuneBasic = false, requiresMet = true }) {
  if (immuneBasic || !requiresMet) return 0;
  const base = baseDmg + atkBonus + statBonus;
  if (base <= 0) return 0;
  let minBase;
  if (base > 3) {
    minBase = Math.max(1, base - 3);
  } else {
    minBase = Math.max(1, base - 3 + statBonus);
  }
  minBase = Math.min(base, minBase);
  const avgRoll = (minBase + base) / 2;
  const mult = 1 + Math.max(0, Math.min(1, adrPct)) * (adrDmgMod || 1);
  const dealt = avgRoll * mult;
  return Math.max(0, dealt - (enemyDef || 0));
}

function expectedEnemyDamage(enemy, playerDef = 0) {
  const atk = enemy.atk || 1;
  const min = Math.max(1, atk - 3);
  const avg = (min + atk) / 2;
  return Math.max(0, avg - (playerDef || 0));
}

function attacksToFillAdrenaline(weaponMods, adrGenMod) {
  const adr = (weaponMods?.ADR ?? 10);
  const gain = Math.max(0, adr / 4) * (adrGenMod || 1);
  if (gain <= 0) return Infinity;
  return Math.ceil(100 / gain);
}

function pickTierIndices(groups) {
  if (!groups.length) return [];
  if (groups.length === 1) return [0];
  if (groups.length === 2) return [0, 1];
  const mid = Math.floor((groups.length - 1) / 2);
  return [0, mid, groups.length - 1];
}

function clampIndex(list, idx) {
  if (!list.length) return -1;
  if (idx < 0) return 0;
  if (idx >= list.length) return list.length - 1;
  return idx;
}

function aggregateMods(items) {
  const total = {};
  for (const item of items) {
    const mods = item.mods || {};
    for (const key of Object.keys(mods)) {
      const val = mods[key];
      if (typeof val === 'number') {
        total[key] = (total[key] || 0) + val;
      }
    }
  }
  return total;
}

function combineGear(weaponGroup, armorGroup, trinkets = []) {
  const weaponMods = weaponGroup?.avgMods || {};
  const armorMods = armorGroup?.avgMods || {};
  const trinketMods = aggregateMods(trinkets);
  const combined = { weaponMods, armorMods, trinketMods };
  const all = [weaponMods, armorMods, trinketMods];
  const sumStats = {};
  let adrGenMod = 1;
  let adrDmgMod = 1;
  for (const mods of all) {
    for (const key of Object.keys(mods)) {
      const val = mods[key];
      if (key === 'adrenaline_gen_mod') {
        adrGenMod *= (typeof val === 'number' && val !== 0) ? val : 1;
      } else if (key === 'adrenaline_dmg_mod') {
        adrDmgMod *= (typeof val === 'number' && val !== 0) ? val : 1;
      } else {
        if (typeof val === 'number') {
          sumStats[key] = (sumStats[key] || 0) + val;
        }
      }
    }
  }
  combined.sumStats = sumStats;
  combined.adrGenMod = adrGenMod;
  combined.adrDmgMod = adrDmgMod;
  return combined;
}

function defaultStatProgression(level) {
  return 4 + Math.max(0, level - 1);
}

function buildScenario(archetype, level, weaponGroup, armorGroup, options) {
  const { adrLevels, statProgression } = options;
  const combined = combineGear(weaponGroup, armorGroup);
  const baseStat = statProgression(level);
  const statKey = archetype === 'ranged' ? 'AGI' : 'STR';
  const statBonus = Math.max(0, (baseStat + (combined.sumStats[statKey] || 0)) - 4);
  const atkBonus = (combined.sumStats.ATK || 0);
  const defBonus = (combined.sumStats.DEF || 0);
  const adrDmgMod = combined.adrDmgMod || 1;
  const weaponMods = combined.weaponMods || {};
  const adrGenMod = combined.adrGenMod || 1;
  const adrGain = (weaponMods.ADR ?? 10) / 4 * adrGenMod;
  const fillAttacks = attacksToFillAdrenaline(weaponMods, adrGenMod);
  const damageBenchmarks = adrLevels.map(pct => {
    const dmg = expectedPlayerDamage({
      baseDmg: 1,
      statBonus,
      atkBonus,
      enemyDef: 0,
      adrPct: pct,
      adrDmgMod
    });
    return { pct, dmg };
  });
  return {
    archetype,
    level,
    statKey,
    baseStat,
    statBonus,
    atkBonus,
    defBonus,
    adrGain,
    fillAttacks,
    adrDmgMod,
    adrLevels,
    damageBenchmarks,
    weaponTier: weaponGroup?.key || null,
    armorTier: armorGroup?.key || null,
    weaponGroup,
    armorGroup
  };
}

function analyzeScenarioAgainstEnemy(scenario, enemy, adrLevels) {
  const immuneBasic = Array.isArray(enemy.immune) && enemy.immune.includes('basic');
  const requires = enemy.requires;
  let requiresMet = true;
  if (requires) {
    const reqList = Array.isArray(requires) ? requires : [requires];
    const weaponItems = scenario.weaponGroup?.items || [];
    requiresMet = weaponItems.some(item => {
      const weaponId = item.id || '';
      const tags = item.tags || [];
      return reqList.some(req => {
        if (typeof req === 'string' && req.startsWith('tag:')) {
          const tag = req.slice(4);
          return tags.includes(tag);
        }
        return req && weaponId === req;
      });
    });
  }
  const results = adrLevels.map(pct => {
    const dmg = expectedPlayerDamage({
      baseDmg: 1,
      statBonus: scenario.statBonus,
      atkBonus: scenario.atkBonus,
      enemyDef: enemy.def || 0,
      adrPct: pct,
      adrDmgMod: scenario.adrDmgMod,
      immuneBasic,
      requiresMet
    });
    return { pct, dmg };
  });
  const best = Math.max(...results.map(r => r.dmg));
  const attacksToKill = best > 0 && enemy.hp ? Math.ceil(enemy.hp / best) : Infinity;
  const enemyDmg = expectedEnemyDamage(enemy, scenario.defBonus);
  const enemyAttacksToDown = enemyDmg > 0 ? Math.ceil((10 + (scenario.level - 1) * 10) / enemyDmg) : Infinity;
  const counter = enemy.counterBasic?.dmg || 0;
  return {
    damageByAdrenaline: results,
    attacksToKill,
    enemyDamage: enemyDmg,
    enemyAttacksToDown,
    counterDamage: counter,
    requiresMet,
    immuneBasic
  };
}

function markdownTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}`;
}

function formatAdrenalineLabel(pct) {
  if (!Number.isFinite(pct)) return '—';
  return `${Math.round(pct * 100)}%`;
}

function formatScenarioRow(scenario) {
  const bench = scenario.damageBenchmarks.map(b => `${formatAdrenalineLabel(b.pct)}: ${formatNumber(b.dmg, 2)}`).join('<br>');
  const fill = Number.isFinite(scenario.fillAttacks) ? `${scenario.fillAttacks}` : '—';
  const adrGain = Number.isFinite(scenario.adrGain) ? formatNumber(scenario.adrGain, 2) : '—';
  return [
    scenario.archetype === 'ranged' ? 'Ranged' : 'Melee',
    `${scenario.level}`,
    scenario.weaponTier || '—',
    scenario.armorTier || '—',
    `${scenario.statKey} ${scenario.baseStat}`,
    formatNumber(scenario.atkBonus, 2),
    formatNumber(scenario.defBonus, 2),
    adrGain,
    fill,
    bench
  ];
}

function formatEnemyXP(enemy, avgLevel = 1) {
  const override = Number.isFinite(enemy.xpOverride) ? enemy.xpOverride : null;
  if (override != null) return override;
  const level = Math.max(1, Math.round(avgLevel));
  const count = Math.max(1, Number.isFinite(enemy.count) ? enemy.count : 1);
  const strength = Number.isFinite(enemy.challenge)
    ? enemy.challenge
    : Number.isFinite(enemy.hp)
      ? enemy.hp
      : null;
  if (!Number.isFinite(strength)) return null;
  return count * Math.max(1, Math.ceil(strength / level));
}

function formatEnemyRow(enemy, adrLevels, avgLevel) {
  const special = enemy.special ? (enemy.special.dmg ? `dmg ${enemy.special.dmg}` : '—') : '—';
  const requires = enemy.requires ? (Array.isArray(enemy.requires) ? enemy.requires.join(', ') : enemy.requires) : '—';
  const counter = enemy.counterBasic?.dmg ? `${enemy.counterBasic.dmg}` : '—';
  const xp = formatEnemyXP(enemy, avgLevel);
  return [
    enemy.name,
    enemy.hp != null ? `${enemy.hp}` : '—',
    enemy.atk != null ? `${enemy.atk}` : '—',
    `${enemy.def || 0}`,
    counter,
    Number.isFinite(xp) ? `${xp}` : '—',
    requires,
    special
  ];
}

function formatMatchupSection(enemy, scenarios, adrLevels) {
  const headers = ['Archetype', 'Level', 'Weapon Tier', 'Armor Tier', ...adrLevels.map(formatAdrenalineLabel), 'Atk to Kill', 'Enemy Dmg', 'Enemy Atk to Down', 'Counter'];
  const rows = [];
  for (const scenario of scenarios) {
    const result = analyzeScenarioAgainstEnemy(scenario, enemy, adrLevels);
    const damageCells = result.damageByAdrenaline.map(entry => formatNumber(entry.dmg, 2));
    const atkCell = Number.isFinite(result.attacksToKill) ? `${result.attacksToKill}` : (result.requiresMet ? '—' : 'Immune');
    let counterLabel = result.counterDamage ? `${result.counterDamage}` : '—';
    if (!result.requiresMet) counterLabel = 'Gear mismatch';
    if (result.immuneBasic) counterLabel = 'Immune';
    const row = [
      scenario.archetype === 'ranged' ? 'Ranged' : 'Melee',
      `${scenario.level}`,
      scenario.weaponTier || '—',
      scenario.armorTier || '—',
      ...damageCells,
      atkCell,
      formatNumber(result.enemyDamage, 2),
      Number.isFinite(result.enemyAttacksToDown) ? `${result.enemyAttacksToDown}` : '—',
      counterLabel
    ];
    rows.push(row);
  }
  return markdownTable(headers, rows);
}

function sparkline(value, maxValue, width = 12) {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) return '—';
  const ratio = Math.max(0, Math.min(1, value / maxValue));
  const filled = Math.max(1, Math.round(ratio * width));
  const empty = Math.max(0, width - filled);
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function buildReport(data) {
  const { moduleData, weaponsByType, armorTiers, scenarios, enemies, enemyTemplates, adrLevels } = data;
  const lines = [];
  const moduleName = moduleData.name || moduleData.seed || 'Unknown Module';
  lines.push(`# Dustland Combat Balance Report: ${moduleName}`);
  const now = new Date().toISOString();
  lines.push(`_Generated ${now}_`);
  lines.push('');
  lines.push(`This report estimates how Dustland combatants perform using deterministic averages drawn from the current data files. It considers party builds at multiple levels and equipment tiers, then compares their expected output against enemies found in the module.`);
  lines.push('');
  lines.push('> Assumptions: Party members start with 10 HP and gain +10 HP per level. Each new level increases the primary combat stat (STR for melee, AGI for ranged) by 1. Damage values use the mean roll from in-game formulas and ignore luck, guard, and other transient effects.');
  lines.push('');

  lines.push('## Weapon Tiers');
  for (const [type, info] of Object.entries(weaponsByType)) {
    lines.push(`### ${type === 'ranged' ? 'Ranged' : 'Melee'} Weapons`);
    const headers = ['Tier', 'Items', 'Avg ATK', 'Avg ADR', 'Avg ADR Gain', 'ADR Dmg Mod', 'Notable Tags'];
    const rows = info.groups.map(group => {
      const avgAtk = formatNumber(group.avgMods.ATK || 0, 2);
      const avgAdr = formatNumber(group.avgMods.ADR || 10, 2);
      const adrGainValue = ((group.avgMods.ADR ?? 10) / 4) * (group.avgMods.adrenaline_gen_mod || 1);
      const adrGain = formatNumber(adrGainValue, 2);
      const dmgMod = formatNumber(group.avgMods.adrenaline_dmg_mod || 1, 2);
      const tags = group.tags.length ? group.tags.join(', ') : '—';
      return [group.key, `${group.count}`, avgAtk, avgAdr, adrGain, dmgMod, tags];
    });
    lines.push(markdownTable(headers, rows));
    lines.push('');
  }

  lines.push('## Armor Tiers');
  if (armorTiers.groups.length) {
    const headers = ['Tier', 'Items', 'Avg DEF', 'ADR Gen Mod', 'ADR Dmg Mod'];
    const rows = armorTiers.groups.map(group => {
      const avgDef = formatNumber(group.avgMods.DEF || 0, 2);
      const genMod = formatNumber(group.avgMods.adrenaline_gen_mod || 1, 2);
      const dmgMod = formatNumber(group.avgMods.adrenaline_dmg_mod || 1, 2);
      return [group.key, `${group.count}`, avgDef, genMod, dmgMod];
    });
    lines.push(markdownTable(headers, rows));
  } else {
    lines.push('No armor items detected in the module data.');
  }
  lines.push('');

  lines.push('## Party Damage Benchmarks');
  const headers = ['Archetype', 'Level', 'Weapon Tier', 'Armor Tier', 'Primary Stat', 'ATK Bonus', 'DEF Bonus', 'ADR Gain/Attack', 'Attacks to Fill ADR', 'Avg Damage (0/50/100%)'];
  const rows = scenarios.map(formatScenarioRow);
  lines.push(markdownTable(headers, rows));
  lines.push('');

  lines.push('## Enemy Overview');
  const avgPartyLevel = scenarios.length
    ? scenarios.reduce((sum, scenario) => sum + (scenario.level || 1), 0) / scenarios.length
    : 1;
  const enemyHeaders = ['Enemy', 'HP', 'ATK', 'DEF', 'Counter', 'XP', 'Requires', 'Special'];
  const enemyRows = enemies.map(enemy => formatEnemyRow(enemy, adrLevels, avgPartyLevel));
  lines.push(markdownTable(enemyHeaders, enemyRows));
  lines.push('');

  if (enemyTemplates.length) {
    lines.push('### Enemy Templates');
    const tmplRows = enemyTemplates.map(enemy => [
      enemy.name || enemy.id || 'Template',
      enemy.hp != null ? `${enemy.hp}` : '—',
      enemy.special?.dmg ? `${enemy.special.dmg}` : '—',
      enemy.immune?.join(', ') || '—'
    ]);
    const tmplHeaders = ['Template', 'HP', 'Special Dmg', 'Immune'];
    lines.push(markdownTable(tmplHeaders, tmplRows));
    lines.push('');
  }

  lines.push('## Matchup Details');
  for (const enemy of enemies) {
    lines.push(`### ${enemy.name}`);
    const scenarioTables = formatMatchupSection(enemy, scenarios, adrLevels);
    lines.push(scenarioTables);
    if (enemy.hp && Number.isFinite(enemy.hp)) {
      const maxHp = Math.max(...enemies.map(e => e.hp || 0));
      lines.push('');
      lines.push(`Effective HP bar: ${sparkline(enemy.hp, maxHp)}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('Regenerate this report after tuning stats by running `node scripts/supporting/balance-report.cjs`. Adjust `--levels` or `--adrenaline` to explore different breakpoints.');

  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    showHelp();
    return;
  }
  const moduleId = args.module || 'dustland';
  const moduleData = loadModuleData(moduleId);
  const moduleItems = collectModuleItems(moduleData);
  const equipmentItems = captureEquipmentItems().map(item => normalizeItem(item, 'scripts/core/equipment.js')).filter(Boolean);
  const allItems = mergeItems([moduleItems, equipmentItems]);

  const weapons = allItems.filter(item => item.type === 'weapon');
  const armors = allItems.filter(item => item.type === 'armor');

  const meleeWeapons = weapons.filter(item => weaponRangeType(item) === 'melee');
  const rangedWeapons = weapons.filter(item => weaponRangeType(item) === 'ranged');

  const leveled = (args.levels ? String(args.levels).split(',').map(v => parseInt(v, 10)).filter(n => Number.isFinite(n) && n > 0) : [1, 4, 7]).sort((a, b) => a - b);
  const adrLevels = (args.adrenaline ? String(args.adrenaline).split(',').map(v => parseFloat(v)).filter(v => Number.isFinite(v)) : [0, 0.5, 1]);

  const meleeWithTier = assignTiers(meleeWeapons, item => item.mods?.ATK ?? 0);
  const rangedWithTier = assignTiers(rangedWeapons, item => item.mods?.ATK ?? 0);
  const armorWithTier = assignTiers(armors, item => item.mods?.DEF ?? 0);

  const meleeGroups = buildTierGroups(meleeWithTier);
  const rangedGroups = buildTierGroups(rangedWithTier);
  const armorGroups = buildTierGroups(armorWithTier);

  const armorIndices = pickTierIndices(armorGroups);
  const meleeIndices = pickTierIndices(meleeGroups);
  const rangedIndices = pickTierIndices(rangedGroups);

  const statProgression = defaultStatProgression;
  const scenarioOptions = { adrLevels, statProgression };
  const scenarios = [];

  for (let i = 0; i < leveled.length; i++) {
    const level = leveled[i];
    const meleeIdx = clampIndex(meleeGroups, meleeIndices[i] ?? meleeIndices[meleeIndices.length - 1] ?? 0);
    const rangedIdx = clampIndex(rangedGroups, rangedIndices[i] ?? rangedIndices[rangedIndices.length - 1] ?? 0);
    const armorIdx = clampIndex(armorGroups, armorIndices[i] ?? armorIndices[armorIndices.length - 1] ?? 0);
    const armorGroup = armorIdx >= 0 ? armorGroups[armorIdx] : null;
    if (meleeIdx >= 0) {
      const scenario = buildScenario('melee', level, meleeGroups[meleeIdx], armorGroup, scenarioOptions);
      scenarios.push(scenario);
    }
    if (rangedIdx >= 0) {
      const scenario = buildScenario('ranged', level, rangedGroups[rangedIdx], armorGroup, scenarioOptions);
      scenarios.push(scenario);
    }
  }

  const enemies = extractCombatants(moduleData);
  const enemyTemplates = loadEnemyTemplates();
  const weaponsByType = {
    melee: { groups: meleeGroups },
    ranged: { groups: rangedGroups }
  };
  const armorTiers = { groups: armorGroups };
  const report = buildReport({ moduleData, weaponsByType, armorTiers, scenarios, enemies, enemyTemplates, adrLevels });

  if (args.stdout) {
    process.stdout.write(report + '\n');
    return;
  }

  const outputPath = args.output
    ? path.resolve(args.output)
    : path.join(__dirname, '..', '..', 'docs', 'balance', `${moduleId}-balance-report.md`);
  const outDir = path.dirname(outputPath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outputPath, report, 'utf8');
  process.stdout.write(`Balance report written to ${outputPath}\n`);
}

main();
