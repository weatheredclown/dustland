(function(){
  const textStep: NonNullable<WizardStepsRegistry['text']> = (label, key) => {
    let input: HTMLInputElement | null = null;

    return {
      render(container, state) {
        const labelEl = document.createElement('label');
        labelEl.textContent = label;

        input = document.createElement('input');
        const value = state[key];
        input.value = typeof value === 'string' ? value : value != null ? String(value) : '';
        if (value === undefined || value === null || value === '' || value === 0 || value === false) {
          input.placeholder = `Enter ${label.toLowerCase()}`;
        }

        container.appendChild(labelEl);
        container.appendChild(input);
      },
      validate() {
        return Boolean(input?.value.trim());
      },
      onComplete(state) {
        if (!input) {
          return;
        }
        state[key] = input.value;
      }
    };
  };

  const dustland = (globalThis.Dustland ??= {} as DustlandNamespace);
  const steps = (dustland.WizardSteps ??= {} as WizardStepsRegistry);
  steps.text = textStep;
})();
