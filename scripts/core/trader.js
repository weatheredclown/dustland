const bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;

class Trader {
  constructor(id, opts = {}){
    this.id = id;
    this.inventory = Array.isArray(opts.inventory) ? [...opts.inventory] : [];
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
    bus?.emit('trader:refresh', { trader: this });
  }
}

globalThis.Dustland = globalThis.Dustland || {};
globalThis.Dustland.Trader = Trader;
