(function(){
  function confirmStep(message){
    return {
      render(container){
        const p = document.createElement('p');
        p.textContent = message;
        container.appendChild(p);
      }
    };
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.WizardSteps = globalThis.Dustland.WizardSteps || {};
  globalThis.Dustland.WizardSteps.confirm = confirmStep;
})();
