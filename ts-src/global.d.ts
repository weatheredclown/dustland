export {};

declare global {
  type WizardState = Record<string, unknown>;

  interface WizardStep<State extends WizardState = WizardState> {
    render(container: HTMLElement, state: State): void;
    validate?(state: State): boolean;
    onComplete?(state: State): void;
  }

  type WizardStepFactory = (...args: unknown[]) => WizardStep;

  interface WizardStepsRegistry {
    [name: string]: WizardStepFactory | undefined;
    text?: (label: string, key: string) => WizardStep;
    confirm?: (message?: string) => WizardStep;
  }

  interface StarterItemUse {
    type: string;
    amount?: number;
    text?: string;
    [key: string]: unknown;
  }

  interface StarterItem {
    id: string;
    name: string;
    type: string;
    use?: StarterItemUse;
    [key: string]: unknown;
  }

  interface DustlandNamespace {
    WizardSteps?: WizardStepsRegistry;
    starterItems?: StarterItem[];
    [key: string]: unknown;
  }

  interface AckNavigationConfig {
    enabled?: boolean;
    [key: string]: unknown;
  }

  interface AckConfig {
    navigation?: AckNavigationConfig;
    [key: string]: unknown;
  }

  interface AckGlobal {
    config?: AckConfig;
    [key: string]: unknown;
  }

  interface GlobalThis {
    Dustland?: DustlandNamespace;
    ACK?: AckGlobal;
  }
}
