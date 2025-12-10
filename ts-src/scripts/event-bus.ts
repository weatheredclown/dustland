// Tiny event bus for pub/sub communication

type EventName = Extract<keyof DustlandEventPayloads, string>;

type EventHandler<E extends EventName = EventName> = (
  payload: DustlandEventPayloads[E]
) => void;

type EventBusApi = {
  on<E extends EventName>(event: E, handler: EventHandler<E>): void;
  off<E extends EventName>(event: E, handler: EventHandler<E>): void;
  emit<E extends EventName>(event: E, payload?: DustlandEventPayloads[E]): void;
};

type DustlandGlobal = DustlandNamespace & {
  eventBus?: EventBusApi;
  [key: string]: unknown;
};

(function(){
  const globalScope = globalThis as typeof globalThis & {
    Dustland?: DustlandGlobal;
    EventBus?: EventBusApi;
  };

  const dustlandNamespace = (globalScope.Dustland ?? {}) as DustlandGlobal;
  globalScope.Dustland = dustlandNamespace;

  const listeners = new Map<EventName, Set<EventHandler>>();

  function on<E extends EventName>(evt: E, handler: EventHandler<E>): void {
    if(!listeners.has(evt)) listeners.set(evt, new Set<EventHandler>());
    listeners.get(evt)?.add(handler as EventHandler);
  }

  function off<E extends EventName>(evt: E, handler: EventHandler<E>): void {
    listeners.get(evt)?.delete(handler as EventHandler);
  }

  function emit<E extends EventName>(evt: E, payload?: DustlandEventPayloads[E]): void {
    const handlers = listeners.get(evt);
    if(!handlers) return;
    handlers.forEach(fn => {
      (fn as EventHandler<E>)(payload as DustlandEventPayloads[E]);
    });
  }

  const bus: EventBusApi = { on, off, emit };
  // Expose under Dustland namespace and keep a legacy shim
  dustlandNamespace.eventBus = bus;
  globalScope.EventBus = bus;
})();
