// Tiny event bus for pub/sub communication
(function () {
    const globalScope = globalThis;
    const dustlandNamespace = (globalScope.Dustland ?? {});
    globalScope.Dustland = dustlandNamespace;
    const listeners = new Map();
    function on(evt, handler) {
        if (!listeners.has(evt))
            listeners.set(evt, new Set());
        listeners.get(evt)?.add(handler);
    }
    function off(evt, handler) {
        listeners.get(evt)?.delete(handler);
    }
    function emit(evt, payload) {
        listeners.get(evt)?.forEach(fn => fn(payload));
    }
    const bus = { on, off, emit };
    // Expose under Dustland namespace and keep a legacy shim
    dustlandNamespace.eventBus = bus;
    globalScope.EventBus = bus;
})();
