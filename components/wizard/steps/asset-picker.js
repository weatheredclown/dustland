const assetPickerStep = (label, options, key) => {
    let selectEl = null;
    return {
        render(container, state) {
            const labelEl = document.createElement('label');
            labelEl.textContent = label;
            const select = document.createElement('select');
            selectEl = select;
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = `Select ${label.toLowerCase()}`;
            const currentValue = typeof state[key] === 'string' ? state[key] : '';
            if (!currentValue)
                placeholder.selected = true;
            select.appendChild(placeholder);
            (options ?? []).forEach(name => {
                const optionEl = document.createElement('option');
                optionEl.value = name;
                optionEl.textContent = name;
                if (currentValue === name)
                    optionEl.selected = true;
                select.appendChild(optionEl);
            });
            container.appendChild(labelEl);
            container.appendChild(select);
        },
        validate() {
            if (!selectEl || selectEl.value === '')
                return;
            return true;
        },
        onComplete(state) {
            if (!selectEl)
                return;
            state[key] = selectEl.value;
        }
    };
};
const dustlandAssetPicker = (globalThis.Dustland ?? (globalThis.Dustland = {}));
const wizardStepsAssetPicker = (dustlandAssetPicker.WizardSteps ?? (dustlandAssetPicker.WizardSteps = {}));
wizardStepsAssetPicker.assetPicker = assetPickerStep;
