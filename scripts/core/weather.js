// @ts-nocheck
// Basic weather manager broadcasting changes via the event bus.
var bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;
var current = { state: 'clear', icon: '☀️', desc: 'Clear skies', speedMod: 1, encounterBias: null };
function setWeather(next) {
    current = Object.assign({}, current, next);
    bus.emit('weather:change', current);
    return current;
}
function getWeather() {
    return current;
}
if (!globalThis.Dustland)
    globalThis.Dustland = {};
globalThis.Dustland.weather = { getWeather, setWeather };
