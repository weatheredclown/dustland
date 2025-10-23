(function(){
  // Using the cleaner helper functions from the 'codex' branch
  function ensureDustland(): DustlandNamespace {
    if (!globalThis.Dustland) {
      globalThis.Dustland = {};
    }
    return globalThis.Dustland as DustlandNamespace;
  }

  function ensureWizardSteps(dustland: DustlandNamespace): WizardStepsRegistry {
    if (!dustland.WizardSteps) {
      dustland.WizardSteps = {} as WizardStepsRegistry;
    }
    return dustland.WizardSteps;
  }

  // Using the function signature from 'codex' but the logic from 'main'
  function confirmStep(message?: string): WizardStep {
    // This logic from 'main' is more robust than a simple default parameter.
    // It handles null, undefined, and empty/whitespace-only strings.
    const text = message && message.trim() !== '' ? message : 'Review your choices.';

    return {
      render(container) {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        container.appendChild(paragraph);
      }
    };
  }

  // Using the initialization style from the 'codex' branch
  const dustland = ensureDustland();
  const wizardSteps = ensureWizardSteps(dustland);

  // This line was outside the conflict and is kept
  wizardSteps.confirm = confirmStep;
})();