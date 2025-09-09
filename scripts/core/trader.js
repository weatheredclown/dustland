const bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;

class Trader {
  constructor(id, opts = {}){
    this.id = id;
    this.inventory = Array.isArray(opts.inventory) ? [...opts.inventory] : [];
    this.grudge = opts.grudge || 0;
  }

  addItem(item){
    this.inventory.push(item);
  }

  clearGrudge(){
    this.grudge = 0;
  }

  refresh(){
    bus?.emit('trader:refresh', { trader: this });
  }
}

globalThis.Dustland = globalThis.Dustland || {};
globalThis.Dustland.Trader = Trader;
