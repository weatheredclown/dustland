// Basic weather manager broadcasting changes via the event bus.
(function () {
  type WeatherState = {
    state: string;
    icon: string;
    desc: string;
    speedMod: number;
    encounterBias?: number | Record<string, number>;
    [key: string]: unknown;
  };

  const globals = globalThis as { Dustland?: { eventBus?: { emit?: (event: string, payload?: unknown) => void } } };
  const weatherBus = (globals.Dustland?.eventBus || globalThis.EventBus) as {
    emit?: (event: string, payload?: unknown) => void;
  };

  let current: WeatherState = { state: 'clear', icon: '☀️', desc: 'Clear skies', speedMod: 1, encounterBias: null };
  function setWeather(next: Partial<WeatherState>): WeatherState {
    current = Object.assign({}, current, next);
    weatherBus?.emit?.('weather:change', current);
    return current;
  }
  function getWeather(): WeatherState {
    return current;
  }
  if (!globalThis.Dustland) globalThis.Dustland = {} as typeof globalThis.Dustland;
  globalThis.Dustland.weather = { getWeather, setWeather };
})();
