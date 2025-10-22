// @ts-nocheck
(function () {
    function itemPickerStep(label, options, key, rewardKey) {
        return {
            render(container, state) {
                const labelEl = document.createElement('label');
                labelEl.textContent = label;
                const select = document.createElement('select');
                const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = 'Select ' + label.toLowerCase();
                if (!state[key])
                    placeholder.selected = true;
                select.appendChild(placeholder);
                (options || []).forEach(opt => {
                    const o = document.createElement('option');
                    if (typeof opt === 'string') {
                        o.value = opt;
                        o.textContent = opt;
                    }
                    else {
                        o.value = opt.id;
                        o.textContent = opt.name;
                    }
                    if (state[key] === o.value)
                        o.selected = true;
                    select.appendChild(o);
                });
                container.appendChild(labelEl);
                container.appendChild(select);
                this.select = select;
                if (rewardKey) {
                    const rewardLabel = document.createElement('label');
                    rewardLabel.textContent = 'Scrap Reward';
                    const rewardInput = document.createElement('input');
                    rewardInput.type = 'number';
                    rewardInput.min = '0';
                    rewardInput.value = state[rewardKey] || '';
                    container.appendChild(rewardLabel);
                    container.appendChild(rewardInput);
                    this.rewardInput = rewardInput;
                }
            },
            validate() {
                if (!this.select || !this.select.value)
                    return false;
                if (rewardKey)
                    return this.rewardInput && this.rewardInput.value;
                return true;
            },
            onComplete(state) {
                state[key] = this.select.value;
                if (rewardKey)
                    state[rewardKey] = parseInt(this.rewardInput.value, 10);
            }
        };
    }
    globalThis.Dustland = globalThis.Dustland || {};
    globalThis.Dustland.WizardSteps = globalThis.Dustland.WizardSteps || {};
    globalThis.Dustland.WizardSteps.itemPicker = itemPickerStep;
})();
