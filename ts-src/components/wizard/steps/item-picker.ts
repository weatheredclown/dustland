type ItemPickerOption = string | { id: string; name: string };

const itemPickerStep: WizardStepFactory = (
  label: string,
  options: ItemPickerOption[] | undefined,
  key: string,
  rewardKey?: string,
) => {
  let selectEl: HTMLSelectElement | null = null;
  let rewardInputEl: HTMLInputElement | null = null;

  return {
    render(container, state) {
      const labelEl = document.createElement('label');
      labelEl.textContent = label;

      const select = document.createElement('select');
      selectEl = select;

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = `Select ${label.toLowerCase()}`;

      const currentValue = typeof state[key] === 'string' ? (state[key] as string) : '';
      if (!currentValue) placeholder.selected = true;
      select.appendChild(placeholder);

      (options ?? []).forEach(opt => {
        const optionEl = document.createElement('option');
        if (typeof opt === 'string') {
          optionEl.value = opt;
          optionEl.textContent = opt;
        } else {
          optionEl.value = opt.id;
          optionEl.textContent = opt.name;
        }
        if (currentValue === optionEl.value) optionEl.selected = true;
        select.appendChild(optionEl);
      });

      container.appendChild(labelEl);
      container.appendChild(select);

      if (rewardKey) {
        const rewardLabel = document.createElement('label');
        rewardLabel.textContent = 'Scrap Reward';
        const rewardInput = document.createElement('input');
        rewardInput.type = 'number';
        rewardInput.min = '0';
        const rewardValue = state[rewardKey];
        rewardInput.value = typeof rewardValue === 'number' ? String(rewardValue) : '';
        container.appendChild(rewardLabel);
        container.appendChild(rewardInput);
        rewardInputEl = rewardInput;
      }
    },
    validate() {
      if (!selectEl || !selectEl.value) return false;
      if (rewardKey && rewardInputEl && rewardInputEl.value === '') return;
      return true;
    },
    onComplete(state) {
      if (!selectEl) return;
      state[key] = selectEl.value;
      if (rewardKey && rewardInputEl && rewardInputEl.value !== '') {
        state[rewardKey] = parseInt(rewardInputEl.value, 10);
      }
    }
  };
};

const dustlandItemPicker = ((globalThis as any).Dustland ??= {});
const wizardStepsItemPicker = (dustlandItemPicker.WizardSteps ??= {});
wizardStepsItemPicker.itemPicker = itemPickerStep;

