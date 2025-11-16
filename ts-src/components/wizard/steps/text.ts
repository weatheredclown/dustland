(function(){
  function textStep(label: string, key: string): DustlandWizardStep {
    let input: HTMLInputElement | null = null;

    return {
      render(container, state){
        const labelEl = document.createElement('label');
        labelEl.textContent = label;

        input = document.createElement('input');
        const existing = state[key];
        if (typeof existing === 'string' && existing.trim() !== '') {
          input.value = existing;
        } else {
          input.value = '';
          input.placeholder = 'Enter ' + label.toLowerCase();
        }

        container.appendChild(labelEl);
        container.appendChild(input);
      },
      validate(){
        return Boolean(input && input.value.trim() !== '');
      },
      onComplete(state){
        if (input) {
          state[key] = input.value;
        }
      }
    };
  }

  const dustland = ((globalThis as any).Dustland as DustlandNamespace | undefined) ||
    ((globalThis as any).Dustland = {} as DustlandNamespace);

  let wizardSteps = dustland.WizardSteps;
  if (!wizardSteps) {
    wizardSteps = {} as Record<string, DustlandWizardStepFactory>;
    dustland.WizardSteps = wizardSteps;
  }

  wizardSteps.text = textStep;
})();
