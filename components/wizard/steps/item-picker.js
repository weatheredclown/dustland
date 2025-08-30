(function(){
  function itemPickerStep(label, options, key){
    return {
      render(container, state){
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        const select = document.createElement('select');
        (options || []).forEach(opt => {
          const o = document.createElement('option');
          if (typeof opt === 'string') {
            o.value = opt;
            o.textContent = opt;
          } else {
            o.value = opt.id;
            o.textContent = opt.name;
          }
          if (state[key] === o.value) o.selected = true;
          select.appendChild(o);
        });
        container.appendChild(labelEl);
        container.appendChild(select);
        this.select = select;
      },
      validate(){
        return this.select && this.select.value;
      },
      onComplete(state){
        state[key] = this.select.value;
      }
    };
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.WizardSteps = globalThis.Dustland.WizardSteps || {};
  globalThis.Dustland.WizardSteps.itemPicker = itemPickerStep;
})();
