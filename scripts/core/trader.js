const bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;
const SHOP_STACK_LIMIT = 256;

class Trader {
  constructor(id, opts = {}){
    this.id = id;
    this.waves = Array.isArray(opts.waves) ? opts.waves.map(w => [...w]) : null;
    this.waveIndex = 0;
    this.inventory = [];
    const seed = Array.isArray(opts.inventory) ? opts.inventory : (this.waves ? this.waves[0] : []);
    if (Array.isArray(seed)) {
      seed.forEach(entry => this.addItem(entry));
    }
    this.grudge = opts.grudge || 0;
    this.markup = opts.markup || 1;
    this.refreshHours = typeof opts.refresh === 'number' ? opts.refresh : 0;
  }

  addItem(item){
    if (!item) return;
    const entry = typeof item === 'string' ? { id: item } : { ...item };
    const id = entry.id;
    if (!id) return;
    const max = Number.isFinite(entry.maxStack) ? entry.maxStack : SHOP_STACK_LIMIT;
    let remaining = Math.max(1, Number.isFinite(entry.count) ? entry.count : 1);
    for (const invItem of this.inventory){
      if (!invItem || invItem.id !== id) continue;
      const limit = Math.min(SHOP_STACK_LIMIT, Number.isFinite(invItem.maxStack) ? invItem.maxStack : max);
      const current = Math.max(1, Number.isFinite(invItem.count) ? invItem.count : 1);
      const space = limit - current;
      if (space <= 0) continue;
      const add = Math.min(space, remaining);
      invItem.count = current + add;
      remaining -= add;
      if (!remaining) break;
    }
    while (remaining > 0){
      const add = Math.min(SHOP_STACK_LIMIT, Number.isFinite(entry.maxStack) ? entry.maxStack : SHOP_STACK_LIMIT, remaining);
      const next = { ...entry, count: add };
      this.inventory.push(next);
      remaining -= add;
    }
  }

  clearGrudge(){
    this.grudge = 0;
  }

  recordCancel(){
    this.grudge++;
  }

  price(value){
    const m = this.markup * (this.grudge >= 3 ? 1.1 : 1);
    return Math.ceil(value * m);
  }

  recordPurchase(){
    this.grudge = 0;
  }

  refresh(){
    this.grudge = 0;
    if (this.waves && this.waveIndex < this.waves.length - 1) {
      this.waveIndex++;
      this.inventory = [];
      const nextWave = this.waves[this.waveIndex] || [];
      nextWave.forEach(entry => this.addItem(entry));
    }
    bus?.emit('trader:refresh', { trader: this });
  }
}

globalThis.Dustland = globalThis.Dustland || {};
globalThis.Dustland.Trader = Trader;
