(function(){
  const confirmStep: NonNullable<WizardStepsRegistry['confirm']> = (message = 'Review your choices.') => ({
    render(container: HTMLElement, _state: WizardState) {
      const paragraph = document.createElement('p');
      paragraph.textContent = message;
      container.appendChild(paragraph);
    }
  });

  const dustland = (globalThis.Dustland ??= {} as DustlandNamespace);
  const steps = (dustland.WizardSteps ??= {} as WizardStepsRegistry);
  steps.confirm = confirmStep;
})();
