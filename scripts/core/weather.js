// Basic weather manager broadcasting changes via the event bus.
(function () {
    const globals = globalThis;
    const weatherBus = (globals.Dustland?.eventBus || globalThis.EventBus);
    let current = { state: 'clear', icon: '☀️', desc: 'Clear skies', speedMod: 1, encounterBias: null };
    function setWeather(next) {
        current = Object.assign({}, current, next);
        weatherBus?.emit?.('weather:change', current);
        return current;
    }
    function getWeather() {
        return current;
    }
    const dustlandGlobals = globalThis;
    if (!dustlandGlobals.Dustland)
        dustlandGlobals.Dustland = {};
    dustlandGlobals.Dustland.weather = { getWeather, setWeather };
})();
