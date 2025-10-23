(function(){
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

  function confirmStep(message = 'Review your choices.'): WizardStep {
    return {
      render(container) {
        const paragraph = document.createElement('p');
        paragraph.textContent = message;
        container.appendChild(paragraph);
      }
    };
  }

  const dustland = ensureDustland();
  const wizardSteps = ensureWizardSteps(dustland);
  wizardSteps.confirm = confirmStep;
})();
