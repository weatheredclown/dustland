// @ts-nocheck
// Tiny event bus for pub/sub communication
// Global namespace for game modules
globalThis.Dustland = globalThis.Dustland || {};
/**
 * Simple pub/sub bus.
 * @typedef {(payload:any)=>void} EventHandler
 */
(function () {
    const listeners = new Map();
    function on(evt, handler) {
        if (!listeners.has(evt))
            listeners.set(evt, new Set());
        listeners.get(evt).add(handler);
    }
    function off(evt, handler) {
        listeners.get(evt)?.delete(handler);
    }
    function emit(evt, payload) {
        listeners.get(evt)?.forEach(fn => fn(payload));
    }
    const bus = { on, off, emit };
    // Expose under Dustland namespace and keep a legacy shim
    globalThis.Dustland.eventBus = bus;
    globalThis.EventBus = bus;
})();
