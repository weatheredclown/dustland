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
      EventBus?: CoreEventBus;
      eventBus?: CoreEventBus;
    };
}

export type { DustlandCoreGlobals };
export {};
