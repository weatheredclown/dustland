(function(){
  function textStep(label, key){
    return {
      render(container, state){
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        const input = document.createElement('input');
        input.value = state[key] || '';
        if (!state[key]) input.placeholder = 'Enter ' + label.toLowerCase();
        container.appendChild(labelEl);
        container.appendChild(input);
        this.input = input;
      },
      validate(){
        return this.input && this.input.value.trim() !== '';
      },
      onComplete(state){
        state[key] = this.input.value;
      }
    };
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.WizardSteps = globalThis.Dustland.WizardSteps || {};
  globalThis.Dustland.WizardSteps.text = textStep;
})();
