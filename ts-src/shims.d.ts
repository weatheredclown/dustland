// TypeScript shim to ensure global Dustland symbols are visible during builds.
// This file provides loose ambient declarations and supplements the richer
// definitions in global.d.ts without changing runtime behavior.
declare global {
  interface DustlandNamespace {
    [key: string]: unknown;
  }

  interface GlobalThis {
    Dustland?: DustlandNamespace;
    EventBus?: unknown;
    log?: (...args: unknown[]) => unknown;
    startGame?: (...args: unknown[]) => unknown;
    hasItem?: (...args: unknown[]) => boolean;
    clampMidiToScale?: (...args: unknown[]) => unknown;
    TILE?: unknown;
  }

  type DustlandProfile = Record<string, unknown>;
  type ProfiledEntity = Record<string, unknown>;
  type DustlandQuestProcessorResult = Record<string, unknown>;
  type PlayerState = Record<string, unknown>;
  type Party = Record<string, unknown>;
  type DustlandEventBus = Record<string, unknown>;
  type DustlandNpcQuest = Record<string, unknown>;
  type DustlandNpc = Record<string, unknown>;
  type DustlandQuestDialogConfig = Record<string, unknown>;
}

export {};
