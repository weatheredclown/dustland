type CoreEventBus = DustlandEventBus | undefined;

type CoreEventHooks = {
  toast?: (message: string, type?: string) => void;
  log?: (message: string, type?: string) => void;
  renderInv?: () => void;
  renderQuests?: () => void;
  renderParty?: () => void;
  updateHUD?: () => void;
};

type CoreParties = {
  party?: Party;
  player?: PlayerState;
  state?: DustlandCoreState;
  NPCS?: DustlandNpc[];
};

type CoreModules = {
  moduleData?: unknown;
  gridFor?: (id: string) => number[][] | undefined | null;
};

declare global {
  type DustlandCoreGlobals = GlobalThis &
    CoreEventHooks &
    CoreParties &
    CoreModules & {
      ENGINE_VERSION?: string;
      clamp?: (value: number, min: number, max: number) => number;
      tileEmoji?: Record<string, number>;
      emojiTile?: Record<string, number>;
      moduleData?: unknown;
      EventBus?: CoreEventBus;
      eventBus?: CoreEventBus;
    };
}

export type { DustlandCoreGlobals };
export {};
