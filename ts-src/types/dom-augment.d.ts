// Shared DOM helpers to make legacy DOM access patterns type-safe enough for our codebase.
declare global {
  type DustlandGlobals = DustlandGlobalHelpers;

  interface DustlandGlobalHelpers {
    EventBus?: DustlandEventBus;
    Dustland?: DustlandNamespace & { eventBus?: DustlandEventBus };
    NPCS?: DustlandNpc[];
    enemyTurnStats?: Record<string, { quick?: number } | undefined>;
    leaderHasLootVacuum?: () => boolean;
    player?: { inv?: DustlandItem[] };
    removeFromInv?: (index: number) => void;
    notifyInventoryChanged?: () => void;
    ItemGen?: { generate?: (rank: string, rng?: () => number) => DustlandItem | null };
    addToInv?: (item: DustlandItem) => boolean;
    dropItemNearParty?: (item: DustlandItem) => void;
    log?: (message: string) => void;
  }

  interface HTMLElement {
    value?: any;
    checked?: boolean;
    disabled?: boolean;
    files?: FileList | null;
    options?: HTMLOptionsCollection;
    onclick?: (this: HTMLElement, ev: MouseEvent) => unknown;
    toDataURL?: (type?: string, quality?: unknown) => string;
    width?: number;
    height?: number;
    getContext?: (contextId: string, options?: any) => any;
    selectedOptions?: HTMLCollectionOf<HTMLOptionElement>;
    open?: boolean;
  }

  interface Element {
    style?: CSSStyleDeclaration;
    dataset?: DOMStringMap;
    onclick?: (this: Element, ev: MouseEvent) => unknown;
    title?: string;
    value?: any;
    checked?: boolean;
    disabled?: boolean;
    placeholder?: string;
    focus?: (options?: FocusOptions) => void;
    open?: boolean;
  }

  interface EventTarget {
    matches?: (selectors: string) => boolean;
    isContentEditable?: boolean;
    tagName?: string;
    value?: any;
    files?: FileList | null;
    id?: string;
  }

  interface Event {
    deltaY?: number;
  }

  interface Node {
    play?: () => Promise<void>;
    pause?: () => void;
    volume?: number;
    currentTime?: number;
  }
}

export { };
