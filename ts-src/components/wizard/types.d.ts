export {};

declare global {
  type DustlandWizardStepState = Record<string, unknown>;

  interface DustlandWizardStep {
    render(container: HTMLElement, state: DustlandWizardStepState): void;
    validate?(state: DustlandWizardStepState): boolean;
    onComplete?(state: DustlandWizardStepState): void;
  }

  type DustlandWizardStepFactory = (...args: unknown[]) => DustlandWizardStep;

  interface DustlandNamespace {
    WizardSteps?: Record<string, DustlandWizardStepFactory>;
  }
}
