(function(){
  // Compatibility shims for legacy globals during migration to Dustland.*
  const dl = globalThis.Dustland || {};

  // Event bus
  if (!globalThis.EventBus && dl.eventBus) {
    globalThis.EventBus = dl.eventBus;
  }

  // UI shim is provided by scripts/ui.js (exposes globalThis.UI)

  // Actions
  if (!globalThis.openShop && dl.actions && typeof dl.actions.openShop === 'function') {
    globalThis.openShop = function(npc){ dl.actions.openShop(npc); };
  }

  // Helpers
  if (!globalThis.eventFlags && dl.eventFlags) globalThis.eventFlags = dl.eventFlags;
  if (!globalThis.path && dl.path) globalThis.path = dl.path;
  if (!globalThis.movement && dl.movement) globalThis.movement = dl.movement;
  if (!globalThis.inventory && dl.inventory) globalThis.inventory = dl.inventory;
  if (!globalThis.effects && dl.effects) globalThis.effects = dl.effects;
})();

