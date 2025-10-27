/// <reference types="node" />
// Simple arena fight to observe adrenaline gain pacing.
const adrenalineGlobal = globalThis as typeof globalThis & Record<string, any>;

type PartyRosterLike = {
  length: number;
  push(...members: any[]): number;
};

if (typeof window === 'undefined') {
  (async () => {
    const { JSDOM } = await import('jsdom');
    const fs = await import('node:fs');
    const path = await import('node:path');

    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printUsage();
      return;
    }

    const html = `<!DOCTYPE html><body>
      <div id="combatOverlay" class="overlay">
        <div id="combatEnemies"></div>
        <div id="combatParty"></div>
        <div id="combatCmd"></div>
        <div id="turnIndicator"></div>
      </div>
      <div id="log" aria-live="polite"></div>
    </body>`;

    const dom = new JSDOM(html, {
      url: 'https://dustland.local/arena',
      pretendToBeVisual: true
    });
    const { window: w } = dom;

    bootstrapGlobals(w, options.seed);

    const baseDir = process.cwd();
    const scripts = [
      'scripts/core/party.js',
      'scripts/core/abilities.js',
      'scripts/core/combat.js'
    ];
    for (const file of scripts) {
      const code = fs.readFileSync(path.join(baseDir, file), 'utf8');
      w.eval(code);
    }

    const hero = prepareHero(options);
    const enemy = prepareEnemy(options);
    const arenaLog = [];

    adrenalineGlobal.log = (msg) => {
      const line = String(msg ?? '').trim();
      if (!line) return;
      arenaLog.push(line);
      console.log(line);
    };

    const result = await runArena(hero, enemy, options);

    summarizeRun({
      options,
      hero,
      enemy,
      arenaLog,
      result
    });
  })().catch((err) => {
    console.error('Adrenaline prototype error:', err);
    process.exit(1);
  });
}

function parseArgs(argv) {
  const opts = {
    heroName: 'Hero',
    heroRole: 'Wanderer',
    heroHp: 100,
    heroAdrMod: 25,
    heroAdrGenMod: 1,
    heroAdrDmgMod: 1,
    heroStr: 4,
    heroAgi: 4,
    heroLuck: 4,
    enemyName: 'Target Dummy',
    enemyHp: 60,
    enemyAtk: 1,
    enemyChallenge: 1,
    turnDelay: 40,
    seed: 'prototype',
    showLog: false,
    help: false
  };

  for (const raw of argv) {
    if (!raw) continue;
    if (raw === '--help' || raw === '-h') {
      opts.help = true;
      return opts;
    }
    if (!raw.startsWith('--')) continue;
    const [key, value = ''] = raw.slice(2).split('=');
    switch (key) {
      case 'hero-name': opts.heroName = value || opts.heroName; break;
      case 'hero-role': opts.heroRole = value || opts.heroRole; break;
      case 'hero-hp': opts.heroHp = toNumber(value, opts.heroHp); break;
      case 'hero-adr':
      case 'adr':
        opts.heroAdrMod = toNumber(value, opts.heroAdrMod);
        break;
      case 'hero-adr-gen': opts.heroAdrGenMod = toNumber(value, opts.heroAdrGenMod); break;
      case 'hero-adr-dmg': opts.heroAdrDmgMod = toNumber(value, opts.heroAdrDmgMod); break;
      case 'hero-str': opts.heroStr = toNumber(value, opts.heroStr); break;
      case 'hero-agi': opts.heroAgi = toNumber(value, opts.heroAgi); break;
      case 'hero-luck': opts.heroLuck = toNumber(value, opts.heroLuck); break;
      case 'enemy-name': opts.enemyName = value || opts.enemyName; break;
      case 'enemy-hp': opts.enemyHp = toNumber(value, opts.enemyHp); break;
      case 'enemy-atk': opts.enemyAtk = toNumber(value, opts.enemyAtk); break;
      case 'enemy-challenge': opts.enemyChallenge = toNumber(value, opts.enemyChallenge); break;
      case 'delay': opts.turnDelay = toNumber(value, opts.turnDelay); break;
      case 'seed': opts.seed = value || opts.seed; break;
      case 'show-log': opts.showLog = true; break;
    }
  }

  opts.heroHp = Math.max(1, opts.heroHp | 0);
  opts.enemyHp = Math.max(1, opts.enemyHp | 0);
  opts.turnDelay = Math.max(0, opts.turnDelay | 0);
  return opts;
}

function printUsage() {
  console.log(`Dustland Adrenaline Prototype\n` +
    `Usage: node scripts/supporting/adrenaline-prototype.js [options]\n\n` +
    `Options:\n` +
    `  --hero-name=NAME        Set the hero name (default: Hero)\n` +
    `  --hero-role=ROLE        Set the hero role (default: Wanderer)\n` +
    `  --hero-hp=NUMBER        Hero max HP (default: 100)\n` +
    `  --hero-adr=NUMBER       Weapon ADR mod per attack (default: 25)\n` +
    `  --hero-adr-gen=NUMBER   Multiplier for adrenaline generation (default: 1)\n` +
    `  --hero-adr-dmg=NUMBER   Multiplier for adrenaline damage bonus (default: 1)\n` +
    `  --hero-str=NUMBER       Hero STR stat (default: 4)\n` +
    `  --hero-agi=NUMBER       Hero AGI stat (default: 4)\n` +
    `  --hero-luck=NUMBER      Hero LCK stat (default: 4)\n` +
    `  --enemy-name=NAME       Enemy name (default: Target Dummy)\n` +
    `  --enemy-hp=NUMBER       Enemy HP (default: 60)\n` +
    `  --enemy-atk=NUMBER      Enemy ATK stat (default: 1)\n` +
    `  --enemy-challenge=NUM   Enemy challenge rating (default: 1)\n` +
    `  --delay=MS              Delay between hero attacks in ms (default: 40)\n` +
    `  --seed=VALUE            Seed the RNG for repeatable runs (default: prototype)\n` +
    `  --show-log              Print the recorded combat log after the summary\n` +
    `  --help                  Show this message\n`);
}

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function bootstrapGlobals(w, seed) {
  const arenaSeed = seed || 'prototype';
  const rng = seededRandom(arenaSeed);
  const originalRandom = Math.random;

  Object.assign(globalThis, {
    window: w,
    document: w.document,
    navigator: w.navigator,
    location: w.location,
    performance: w.performance,
    localStorage: w.localStorage,
    requestAnimationFrame: w.requestAnimationFrame?.bind(w) || ((cb) => setTimeout(() => cb(Date.now()), 16)),
    cancelAnimationFrame: w.cancelAnimationFrame?.bind(w) || ((id) => clearTimeout(id))
  });

  Math.random = rng;

  const listeners = new Map();
  const bus = {
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => bus.off(event, handler);
    },
    off(event, handler) {
      const set = listeners.get(event);
      if (set) set.delete(handler);
    },
    emit(event, payload) {
      const set = listeners.get(event);
      if (!set) return;
      for (const handler of [...set]) {
        try {
          handler(payload);
        } catch (err) {
          console.error('Event handler error:', err);
        }
      }
    }
  };

  adrenalineGlobal.EventBus = bus;
  adrenalineGlobal.Dustland = { eventBus: bus, combatTelemetry: [] };
  adrenalineGlobal.updateHUD = () => {};
  adrenalineGlobal.renderParty = () => {};
  adrenalineGlobal.renderWorld = () => {};
  adrenalineGlobal.tryAutoPickup = () => false;
  adrenalineGlobal.toast = () => {};
  adrenalineGlobal.setMap = () => {};
  adrenalineGlobal.setPartyPos = () => {};
  adrenalineGlobal.removeNPC = () => {};
  adrenalineGlobal.playFX = () => {};
  adrenalineGlobal.addToInv = () => false;
  adrenalineGlobal.registerItem = (x) => x;
  adrenalineGlobal.SpoilsCache = { rollDrop: () => null };
  adrenalineGlobal.player = { inv: [], scrap: 0, hp: 0 };
  adrenalineGlobal.itemDrops = [];
  adrenalineGlobal.worldSeed = 1337;

  adrenalineGlobal.__restoreRandom = () => {
    Math.random = originalRandom;
  };
}

function seededRandom(seed) {
  let state = 0;
  const source = String(seed || '').trim() || 'dustland';
  for (let i = 0; i < source.length; i++) {
    state = (state * 31 + source.charCodeAt(i)) >>> 0;
  }
  if (!state) state = 0x12345678;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return (state >>> 0) / 0x100000000;
  };
}

function prepareHero(options) {
  const hero = makeMember('hero', options.heroName, options.heroRole);
  hero.maxHp = options.heroHp;
  hero.hp = options.heroHp;
  hero.stats.STR = options.heroStr;
  hero.stats.AGI = options.heroAgi;
  hero.stats.LCK = options.heroLuck;
  hero.adrGenMod = options.heroAdrGenMod;
  hero.adrDmgMod = options.heroAdrDmgMod;
  hero.adr = 0;
  hero.maxAdr = hero.maxAdr || 100;
  hero.equip.weapon = {
    id: 'prototype_blade',
    name: 'Prototype Blade',
    type: 'weapon',
    mods: {
      ADR: options.heroAdrMod
    }
  };

  const party = adrenalineGlobal.party as PartyRosterLike | undefined;
  if (party) {
    party.length = 0;
    party.push(hero);
  }
  adrenalineGlobal.selectedMember = 0;
  return hero;
}

function prepareEnemy(options) {
  return {
    id: 'arena_dummy',
    name: options.enemyName,
    hp: options.enemyHp,
    maxHp: options.enemyHp,
    ATK: options.enemyAtk,
    challenge: options.enemyChallenge,
    lootChance: 0
  };
}

async function runArena(hero, enemy, options) {
  const state = adrenalineGlobal.__combatState;
  const adrEvents = [];
  let lastAdr = hero.adr ?? 0;
  let fullAttack = null;
  let resolved = false;

  const resultPromise = openCombat([enemy]);
  resultPromise.then(() => { resolved = true; }, () => { resolved = true; });

  let attacks = 0;
  while (!resolved) {
    if (state.phase === 'party' && state.mode === 'command') {
      const used = handleCombatKey({ key: 'Enter' });
      if (used) {
        attacks++;
      }
      if (used && hero.adr !== lastAdr) {
        const gain = hero.adr - lastAdr;
        lastAdr = hero.adr;
        adrEvents.push({ attack: attacks, value: hero.adr, gain });
        console.log(`Adrenaline: ${hero.adr}`);
        if (fullAttack === null && hero.adr >= (hero.maxAdr || 100)) {
          fullAttack = attacks;
          console.log(`Reached full adrenaline in ${attacks} attacks.`);
        }
      }
    }
    await delay(options.turnDelay);
  }

  try {
    const outcome = await resultPromise;
    return {
      attacks,
      adrEvents,
      fullAttack,
      outcome,
      turns: state.turns,
      telemetry: Array.isArray(adrenalineGlobal.Dustland?.combatTelemetry)
        ? adrenalineGlobal.Dustland.combatTelemetry.slice()
        : []
    };
  } finally {
    adrenalineGlobal.__restoreRandom?.();
  }
}

function delay(ms) {
  if (!ms) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summarizeRun(context) {
  const { options, hero, enemy, arenaLog, result } = context;
  const gains = result.adrEvents.map((e) => e.gain).filter((g) => g > 0);
  const minGain = gains.length ? Math.min(...gains) : 0;
  const maxGain = gains.length ? Math.max(...gains) : 0;
  const avgGain = gains.length ? gains.reduce((s, g) => s + g, 0) / gains.length : 0;

  console.log('\n--- Adrenaline Summary ---');
  console.log(`Hero: ${hero.name} (${hero.role})`);
  console.log(`Weapon ADR mod: ${options.heroAdrMod}`);
  console.log(`Enemy: ${enemy.name} (HP ${enemy.maxHp | 0}, ATK ${enemy.ATK | 0})`);
  console.log(`Seed: ${options.seed}`);
  console.log(`Total attacks issued: ${result.attacks}`);
  if (result.fullAttack) {
    console.log(`Reached full adrenaline in ${result.fullAttack} attacks.`);
    if (result.fullAttack < 16 || result.fullAttack > 24) {
      console.log('⚠️  Fill rate outside the 16–24 attack target window.');
    }
  } else {
    console.log('⚠️  Combat ended before reaching full adrenaline.');
  }

  if (gains.length) {
    console.log(`Adrenaline gain per tick — min: ${minGain}, max: ${maxGain}, avg: ${avgGain.toFixed(2)}`);
  }

  console.log(`Combat turns elapsed: ${result.turns}`);
  console.log(`Hero HP remaining: ${hero.hp}/${hero.maxHp}`);
  console.log(`Final adrenaline: ${hero.adr}/${hero.maxAdr || 100}`);
  console.log(`Outcome: ${result.outcome?.result || 'unknown'}`);

  if (options.showLog) {
    console.log('\n--- Combat Log ---');
    arenaLog.forEach((line) => console.log(line));
  }

  if (Array.isArray(result.telemetry) && result.telemetry.length) {
    console.log('\nTelemetry captured:', result.telemetry.length, 'event batch(es).');
  }
}
