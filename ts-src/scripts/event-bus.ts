// Tiny event bus for pub/sub communication

// Global namespace for game modules
globalThis.Dustland = globalThis.Dustland || {};

type EventHandler = (payload: unknown) => void;

(function(){
  const listeners = new Map<string, Set<EventHandler>>();

  function on(evt: string, handler: EventHandler){
    if(!listeners.has(evt)) listeners.set(evt, new Set());
    listeners.get(evt)?.add(handler);
  }

  function off(evt: string, handler: EventHandler){
    listeners.get(evt)?.delete(handler);
  }

  function emit(evt: string, payload?: unknown){
    listeners.get(evt)?.forEach(fn => fn(payload));
  }

  const bus = { on, off, emit };
  // Expose under Dustland namespace and keep a legacy shim
  globalThis.Dustland.eventBus = bus;
  (globalThis as Record<string, unknown>).EventBus = bus;
})();

