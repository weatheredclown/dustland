export {};

declare global {
  type DustlandWizardStepState = WizardState;

  interface DustlandWizardStep {
    render(container: HTMLElement, state: DustlandWizardStepState): void;
    validate?(state: DustlandWizardStepState): boolean;
    onComplete?(state: DustlandWizardStepState): void;
  }

  type DustlandWizardStepFactory = WizardStepFactory;

  interface DustlandNamespace {
    WizardSteps?: Record<string, DustlandWizardStepFactory>;
  }
}
