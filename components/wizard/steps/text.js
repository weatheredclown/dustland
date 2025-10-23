(function () {
    const textStep = (label, key) => {
        let input = null;
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
    const dustland = (globalThis.Dustland ?? (globalThis.Dustland = {}));
    const steps = (dustland.WizardSteps ?? (dustland.WizardSteps = {}));
    steps.text = textStep;
})();
