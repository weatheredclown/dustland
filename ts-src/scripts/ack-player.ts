(() => {
  type AckGlobals = typeof globalThis & {
    Dustland?: DustlandNamespace;
    params?: URLSearchParams;
    UI?: DustlandUiApi;
    WORLD_H?: number;
    postLoad?: (module: ModuleData) => void;
    [key: string]: unknown;
  };

  const globals = globalThis as AckGlobals;
  const dustland = globals.Dustland;
  type ModuleData = DustlandModuleInstance & {
    module?: string;
    moduleVar?: string;
    profiles?: Record<string, DustlandProfile>;
  };

  // ACK Module Player (ESM)
  // Loads a module JSON and starts the game using its data.

  // use globals from core and engine

  // Prevent the engine from auto-starting the creator or start menu
  window.showStart = () => {};
  let realOpenCreator: (() => void) | null = null;

  function captureOpenCreator(): void {
    if (typeof window.openCreator === 'function') {
      realOpenCreator = window.openCreator;
      window.openCreator = () => {};
    } else {
      setTimeout(captureOpenCreator, 0);
    }
  }

  captureOpenCreator();

  let moduleData: ModuleData | null = null;
  const PLAYTEST_KEY = 'ack_playtest';
  const loaderId = 'moduleLoader';
  const urlInput = document.getElementById('modUrl') as HTMLInputElement | null;
  const urlBtn = document.getElementById('modUrlBtn') as HTMLButtonElement | null;
  const fileInput = document.getElementById('modFile') as HTMLInputElement | null;
  const fileBtn = document.getElementById('modFileBtn') as HTMLButtonElement | null;

  const paramsSource = globals.params;
  const params = paramsSource instanceof URLSearchParams
    ? paramsSource
    : new URLSearchParams(location.search);

  const playData = localStorage.getItem(PLAYTEST_KEY);
  if (playData) {
    try {
      const parsed = JSON.parse(playData) as ModuleData;
      moduleData = parsed;
      if (parsed.profiles && dustland?.profiles?.set) {
        for (const id of Object.keys(parsed.profiles)) {
          const profile = parsed.profiles[id];
          if (profile) dustland.profiles.set(id, profile);
        }
      }
      localStorage.removeItem(PLAYTEST_KEY);
      globals.UI?.hide(loaderId);
      if (realOpenCreator) {
        window.openCreator = realOpenCreator;
        realOpenCreator();
      }
    } catch (e) {
      localStorage.removeItem(PLAYTEST_KEY);
    }
  }

  const autoUrl = params.get('module');
  if (!moduleData && autoUrl) {
    globals.UI?.setValue('modUrl', autoUrl);
    fetch(autoUrl)
      .then((response) => response.json())
      .then((data: ModuleData) => loadAckModule(data))
      .catch((err) => alert('Invalid module:' + err));
  }

  const loadAckModule = async (data: ModuleData): Promise<void> => {
    moduleData = data;
    const profiles = data.profiles;
    if (profiles && dustland?.profiles?.set) {
      for (const id of Object.keys(profiles)) {
        const profile = profiles[id];
        if (profile) dustland.profiles.set(id, profile);
      }
    }

    const scriptUrl = typeof moduleData?.module === 'string' ? moduleData.module : null;
    if (scriptUrl) {
      try {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = scriptUrl;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${scriptUrl}`));
          document.head.appendChild(script);
        });

        const base = scriptUrl.match(/([^/]+)\.module\.js$/)?.[1] ?? '';
        const guesses: string[] = [];
        if (moduleData?.moduleVar) guesses.push(moduleData.moduleVar);
        if (base) {
          const upper = base.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
          guesses.push(`${upper}_MODULE`, upper);
        }

        let modObj: unknown = null;
        for (const name of guesses) {
          const candidate = globals[name];
          if (candidate) {
            modObj = candidate;
            break;
          }
        }

        const hook =
          typeof modObj === 'object' && modObj !== null && 'postLoad' in modObj
            ? (modObj as { postLoad?: (module: ModuleData) => void }).postLoad
            : globals.postLoad;

        if (typeof hook === 'function' && moduleData) {
          try {
            hook(moduleData);
          } catch (err) {
            console.error('postLoad error', err);
          }
        }
      } catch (err) {
        console.error('module script error', err);
      }

      if (moduleData) {
        delete moduleData.module;
        delete moduleData.moduleVar;
      }
    }

    globals.UI?.hide(loaderId);
    if (realOpenCreator) {
      window.openCreator = realOpenCreator;
      realOpenCreator();
    }
  };

  globals.loadModule = loadAckModule;

  if (urlBtn && urlInput) {
    urlBtn.addEventListener('click', async () => {
      const url = urlInput.value.trim();
      if (!url) return;
      try {
        const res = await fetch(url);
        const data = (await res.json()) as ModuleData;
        await loadAckModule(data);
      } catch (err) {
        alert('Invalid module:' + err);
      }
    });
  }

  if (fileBtn && fileInput) {
    fileBtn.addEventListener('click', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = typeof reader.result === 'string' ? reader.result : '';
          if (!text) throw new Error('Empty file');
          const data = JSON.parse(text) as ModuleData;
          void loadAckModule(data);
        } catch (err) {
          alert('Invalid module:' + err);
        }
      };
      reader.readAsText(file);
    });
  }

  // After party creation, start the loaded module
  window.startGame = async function () {
    applyModule(moduleData ?? {});
    const worldHeight = typeof globals.WORLD_H === 'number' ? globals.WORLD_H : 0;
    const fallbackStart = { map: 'world', x: 2, y: Math.floor(worldHeight / 2) };
    const start = moduleData?.start ?? fallbackStart;
    setPartyPos(start.x, start.y);
    setMap(start.map || 'world', 'Module');
    log('Adventure begins.');
  };
})();
