(function(){
  function confirmStep(message?: string): DustlandWizardStep {
    const text = message && message.trim() !== '' ? message : 'Review your choices.';

    return {
      render(container){
        const p = document.createElement('p');
        p.textContent = text;
        container.appendChild(p);
      }
    };
  }

  const dustland = (globalThis.Dustland as DustlandNamespace | undefined) ||
    (globalThis.Dustland = {} as DustlandNamespace);

  let wizardSteps = dustland.WizardSteps;
  if (!wizardSteps) {
    wizardSteps = {} as Record<string, DustlandWizardStepFactory>;
    dustland.WizardSteps = wizardSteps;
  }

  wizardSteps.confirm = confirmStep;
})();
