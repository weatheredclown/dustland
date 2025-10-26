// Tiny event bus for pub/sub communication

type EventHandler = (payload: unknown) => void;

interface EventBus {
  on(evt: string, handler: EventHandler): void;
  off(evt: string, handler: EventHandler): void;
  emit(evt: string, payload: unknown): void;
}

type DustlandGlobal = {
  eventBus?: EventBus;
  [key: string]: unknown;
};

(function(){
  const globalScope = globalThis as typeof globalThis & {
    Dustland?: DustlandGlobal;
    EventBus?: EventBus;
  };

  const dustlandNamespace = (globalScope.Dustland ?? {}) as DustlandGlobal;
  globalScope.Dustland = dustlandNamespace;

  const listeners = new Map<string, Set<EventHandler>>();

  function on(evt: string, handler: EventHandler): void {
    if(!listeners.has(evt)) listeners.set(evt, new Set<EventHandler>());
    listeners.get(evt)?.add(handler);
  }

  function off(evt: string, handler: EventHandler): void {
    listeners.get(evt)?.delete(handler);
  }

  function emit(evt: string, payload: unknown): void {
    listeners.get(evt)?.forEach(fn => fn(payload));
  }

  const bus: EventBus = { on, off, emit };
  // Expose under Dustland namespace and keep a legacy shim
  dustlandNamespace.eventBus = bus;
  globalScope.EventBus = bus;
})();

