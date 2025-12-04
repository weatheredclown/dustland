type GraffitiPuzzleModule = DustlandModuleInstance & {
  start: { map: string; x: number; y: number };
  postLoad?: (moduleData: DustlandModuleInstance) => void;
};

type RuntimeState = {
  map?: string;
  x?: number;
  y?: number;
  [key: string]: unknown;
};

type GraffitiPuzzleGlobals = typeof globalThis & {
  seedWorldContent?: () => void;
  GRAFFITI_PUZZLE?: GraffitiPuzzleModule;
  state?: RuntimeState;
  renderWorld?: () => void;
  applyModule?: (moduleData: DustlandModuleInstance) => void;
  setPartyPos?: (x: number, y: number) => void;
  setMap?: (map: string, label?: string) => void;
};

declare global {
  interface GlobalThis {
    GRAFFITI_PUZZLE?: GraffitiPuzzleModule;
  }
}

function seedWorldContent(): void {}
const globals = globalThis as GraffitiPuzzleGlobals;
globals.seedWorldContent = seedWorldContent;

const DATA = `{
  "seed": "graffiti-puzzle",
  "name": "graffiti-puzzle",
  "items": [],
  "quests": [],
  "npcs": [
    {
      "id": "graffiti_wall",
      "map": "graffiti",
      "x": 3,
      "y": 3,
      "color": "#f5e79f",
      "name": "Graffiti Wall",
      "prompt": "Wall layered with faded graffiti and hidden marks",
      "tree": {
        "start": {
          "text": "Layers of paint hide a message.",
          "choices": [
            { "label": "(Scrape)", "to": "scrape" },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "scrape": {
          "text": "A route symbol emerges.",
          "effects": [ { "effect": "addFlag", "flag": "graffiti_puzzle_complete" } ],
          "choices": [
            { "label": "(Continue)", "applyModule": "MARA_PUZZLE", "to": "bye" }
          ]
        }
      }
    }
  ],
  "interiors": [
    {
      "id": "graffiti",
      "w": 7,
      "h": 7,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🎨🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 3,
      "entryY": 5
    }
  ],
  "events": [],
  "portals": [],
  "buildings": [],
  "start": { "map": "graffiti", "x": 3, "y": 5 }
}`;

function postLoad(_module: DustlandModuleInstance): void {}

const moduleData = JSON.parse(DATA) as GraffitiPuzzleModule;
moduleData.postLoad = postLoad;
globals.GRAFFITI_PUZZLE = moduleData;

globals.startGame = function startGame(): void {
  const graffitiModule = globals.GRAFFITI_PUZZLE;
  if (!graffitiModule) return;

  graffitiModule.postLoad?.(graffitiModule);
  globals.applyModule?.(graffitiModule);

  const start = graffitiModule.start;
  if (!start) return;

  globals.setPartyPos?.(start.x, start.y);
  globals.setMap?.(start.map, 'Graffiti Puzzle');

  const fallbackState: DustlandCoreState & RuntimeState = {
    map: start.map,
    mapFlags: {},
    fog: {},
    x: start.x,
    y: start.y
  };
  globals.state = { ...(globals.state ?? fallbackState), map: start.map, x: start.x, y: start.y };

  globals.renderWorld?.();
};

export {};
