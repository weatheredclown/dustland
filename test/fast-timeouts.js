const realTimeout = globalThis.setTimeout;
const realClearTimeout = globalThis.clearTimeout;

globalThis.setTimeout = (fn) => { queueMicrotask(fn); return 0; };
globalThis.clearTimeout = () => {};

export function restoreTimeouts(){
  globalThis.setTimeout = realTimeout;
  globalThis.clearTimeout = realClearTimeout;
}
