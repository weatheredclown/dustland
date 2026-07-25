const assetPickerStep = (label, options, key, extras) => {
    let selectEl = null;
    let customEl = null;
    const resolveOptions = () => {
        const raw = typeof options === 'function' ? options() : options;
        if (!Array.isArray(raw))
            return [];
        return raw.filter((name) => typeof name === 'string' && name !== '');
    };
    return {
        render(container, state) {
            const labelEl = document.createElement('label');
            labelEl.textContent = label;
            const select = document.createElement('select');
            selectEl = select;
            const names = resolveOptions();
            const currentValue = typeof state[key] === 'string' ? state[key] : '';
            const currentInList = currentValue !== '' && names.includes(currentValue);
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = `Select ${label.toLowerCase()}`;
            if (!currentInList)
                placeholder.selected = true;
            select.appendChild(placeholder);
            names.forEach(name => {
                const optionEl = document.createElement('option');
                optionEl.value = name;
                optionEl.textContent = name;
                if (currentValue === name)
                    optionEl.selected = true;
                select.appendChild(optionEl);
            });
            container.appendChild(labelEl);
            container.appendChild(select);
            customEl = null;
            if (extras?.allowCustom) {
                const customLabelEl = document.createElement('label');
                customLabelEl.textContent = extras.customLabel ?? `Custom ${label.toLowerCase()}`;
                const input = document.createElement('input');
                input.placeholder = 'Or type your own';
                if (currentValue && !currentInList)
                    input.value = currentValue;
                container.appendChild(customLabelEl);
                container.appendChild(input);
                customEl = input;
            }
        },
        validate() {
            if (customEl && customEl.value.trim() !== '')
                return true;
            if (!selectEl || selectEl.value === '')
                return;
            return true;
        },
        onComplete(state) {
            const custom = customEl?.value.trim() ?? '';
            if (custom !== '') {
                state[key] = custom;
                return;
            }
            if (!selectEl)
                return;
            state[key] = selectEl.value;
        }
    };
};
const dustlandAssetPicker = (globalThis.Dustland ?? (globalThis.Dustland = {}));
const wizardStepsAssetPicker = (dustlandAssetPicker.WizardSteps ?? (dustlandAssetPicker.WizardSteps = {}));
wizardStepsAssetPicker.assetPicker = assetPickerStep;
