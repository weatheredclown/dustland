const bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;

class Trader {
  constructor(id, opts = {}){
    this.id = id;
    this.waves = Array.isArray(opts.waves) ? opts.waves.map(w => [...w]) : null;
    this.waveIndex = 0;
    this.inventory = Array.isArray(opts.inventory) ? [...opts.inventory]
      : (this.waves ? [...this.waves[0]] : []);
    this.grudge = opts.grudge || 0;
    this.markup = opts.markup || 1;
    this.refreshHours = typeof opts.refresh === 'number' ? opts.refresh : 0;
  }

  addItem(item){
    this.inventory.push(item);
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
      this.inventory = [...this.waves[this.waveIndex]];
    }
    bus?.emit('trader:refresh', { trader: this });
  }
}

globalThis.Dustland = globalThis.Dustland || {};
globalThis.Dustland.Trader = Trader;
