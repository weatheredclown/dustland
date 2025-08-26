// Simple arena fight to observe adrenaline gain pacing.
if (typeof window === 'undefined') {
  (async () => {
    const { JSDOM } = await import('jsdom');
    const fs = await import('node:fs');
    const path = await import('node:path');
    const baseDir = process.cwd();
    const html = `<!DOCTYPE html><body>
      <div id="combatOverlay">
        <div id="combatEnemies"></div>
        <div id="combatParty"></div>
        <div id="combatCmd"></div>
        <div id="turnIndicator"></div>
      </div>
      <div id="log"></div>
    </body>`;
    const dom = new JSDOM(html);
    const { window: w } = dom;
    global.window = w;
    global.document = w.document;
    w.requestAnimationFrame = () => {};
    global.requestAnimationFrame = w.requestAnimationFrame;
    global.EventBus = { emit: () => {}, on: () => {} };
    global.log = (msg) => console.log(msg);
    global.renderParty = () => {};
    global.updateHUD = () => {};
    global.player = { inv: [] };
    global.itemDrops = [];
    global.addToInv = () => {};
    global.SpoilsCache = { rollDrop: () => null };
    global.registerItem = (x) => x;
    global.removeNPC = () => {};
    const scripts = [
      'core/party.js',
      'core/abilities.js',
      'core/combat.js'
    ];
    for (const file of scripts) {
      w.eval(fs.readFileSync(path.join(baseDir, file), 'utf8'));
    }
    const hero = makeMember('hero', 'Hero', 'Wanderer');
    hero.equip.weapon = { mods: { ADR: 25 } };
    hero.maxHp = hero.hp = 100;
    party.push(hero);
    const enemy = { name: 'Target Dummy', hp: 40 };
    const resultPromise = openCombat([enemy]);
    let lastAdr = hero.adr;
    const interval = setInterval(() => {
      handleCombatKey({ key: 'Enter' });
      if (hero.adr !== lastAdr) {
        lastAdr = hero.adr;
        console.log(`Adrenaline: ${hero.adr}`);
      }
    }, 0);
    const result = await resultPromise;
    clearInterval(interval);
    console.log('Combat result:', result);
  })().catch(err => {
    console.error('Adrenaline prototype error:', err);
    process.exit(1);
  });
}
