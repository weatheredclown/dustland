(function () {
    function textStep(label, key) {
        let input = null;
        return {
            render(container, state) {
                const labelEl = document.createElement('label');
                labelEl.textContent = label;
                input = document.createElement('input');
                const existing = state[key];
                if (typeof existing === 'string' && existing.trim() !== '') {
                    input.value = existing;
                }
                else {
                    input.value = '';
                    input.placeholder = 'Enter ' + label.toLowerCase();
                }
                container.appendChild(labelEl);
                container.appendChild(input);
            },
            validate() {
                return Boolean(input && input.value.trim() !== '');
            },
            onComplete(state) {
                if (input) {
                    state[key] = input.value;
                }
            }
        };
    }
    const dustland = globalThis.Dustland ||
        (globalThis.Dustland = {});
    let wizardSteps = dustland.WizardSteps;
    if (!wizardSteps) {
        wizardSteps = {};
        dustland.WizardSteps = wizardSteps;
    }
    wizardSteps.text = textStep;
})();
