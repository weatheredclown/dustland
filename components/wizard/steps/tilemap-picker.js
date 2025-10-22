// @ts-nocheck
(function () {
    function tilemapPickerStep(label, options, key) {
        return {
            render(container, state) {
                var labelEl = document.createElement('label');
                labelEl.textContent = label;
                var select = document.createElement('select');
                var placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = 'Select ' + label.toLowerCase();
                if (!state[key])
                    placeholder.selected = true;
                select.appendChild(placeholder);
                (options || []).forEach(function (name) {
                    var opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    if (state[key] === name)
                        opt.selected = true;
                    select.appendChild(opt);
                });
                container.appendChild(labelEl);
                container.appendChild(select);
                this.select = select;
            },
            validate() {
                return this.select && this.select.value;
            },
            onComplete(state) {
                state[key] = this.select.value;
            }
        };
    }
    globalThis.Dustland = globalThis.Dustland || {};
    globalThis.Dustland.WizardSteps = globalThis.Dustland.WizardSteps || {};
    globalThis.Dustland.WizardSteps.tilemapPicker = tilemapPickerStep;
})();
