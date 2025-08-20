// Tiny event bus for pub/sub communication
/**
 * Simple pub/sub bus.
 * @typedef {(payload:any)=>void} EventHandler
 */
const listeners = new Map();

/**
 * Subscribe to an event.
 * @param {string} evt
 * @param {EventHandler} handler
 */
export function on(evt, handler){
  if(!listeners.has(evt)) listeners.set(evt, new Set());
  listeners.get(evt).add(handler);
}

/**
 * Unsubscribe from an event.
 * @param {string} evt
 * @param {EventHandler} handler
 */
export function off(evt, handler){
  listeners.get(evt)?.delete(handler);
}

/**
 * Emit an event to listeners.
 * @param {string} evt
 * @param {any} payload
 */
export function emit(evt, payload){
  listeners.get(evt)?.forEach(fn => fn(payload));
}

export default { on, off, emit };
