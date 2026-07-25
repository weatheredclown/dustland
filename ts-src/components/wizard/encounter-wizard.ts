interface EncounterWizardState extends WizardState {
  map?: string;
  zoneTag?: string;
  minDist?: number;
  maxDist?: number;
  template?: string;
  templateName?: string;
  hp?: number;
  atk?: number;
  def?: number;
  lootItem?: string;
  lootItemName?: string;
  lootChance?: number;
}

(() => {
  const toSlug = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '_');

  const dustlandEnc = (globalThis.Dustland ??= {});
  const wizardStepsEnc = dustlandEnc.WizardSteps ?? {};
  const { confirm } = wizardStepsEnc;

  if (!confirm) {
    console.warn('Encounter wizard skipped initialization because required steps are missing.');
    return;
  }

  const moduleData = (): any => (globalThis as any).ackGetModuleData?.() ?? {};

  const labeled = (container: HTMLElement, label: string, el: HTMLElement): void => {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    container.appendChild(labelEl);
    container.appendChild(el);
  };

  const numberInput = (container: HTMLElement, label: string, value: string): HTMLInputElement => {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.value = value;
    labeled(container, label, input);
    return input;
  };

  const optionSelect = (
    container: HTMLElement,
    label: string,
    opts: { id: string; name: string }[],
    current: string,
    placeholderText: string
  ): HTMLSelectElement => {
    const select = document.createElement('select');
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = placeholderText;
    if (!current) placeholder.selected = true;
    select.appendChild(placeholder);
    opts.forEach(opt => {
      const optionEl = document.createElement('option');
      optionEl.value = opt.id;
      optionEl.textContent = opt.name;
      if (current === opt.id) optionEl.selected = true;
      select.appendChild(optionEl);
    });
    labeled(container, label, select);
    return select;
  };

  const whereStep = (): WizardStep<EncounterWizardState> => {
    let mapEl: HTMLSelectElement | null = null;
    let zoneEl: HTMLInputElement | null = null;
    let minEl: HTMLInputElement | null = null;
    let maxEl: HTMLInputElement | null = null;
    return {
      render(container, state) {
        const maps = [{ id: 'world', name: 'world' }]
          .concat((moduleData().interiors ?? [])
            .filter((i: any) => i?.id)
            .map((i: any) => ({ id: i.id, name: i.id })));
        mapEl = optionSelect(container, 'Map', maps, state.map ?? 'world', 'Select map');
        if (!state.map) mapEl.value = 'world';
        zoneEl = document.createElement('input');
        zoneEl.placeholder = 'Leave empty to spawn by road distance';
        if (state.zoneTag) zoneEl.value = state.zoneTag;
        labeled(container, 'Zone Tag (optional)', zoneEl);
        minEl = numberInput(container, 'Min Distance From Road', String(state.minDist ?? 0));
        maxEl = numberInput(container, 'Max Distance From Road', typeof state.maxDist === 'number' ? String(state.maxDist) : '');
      },
      validate() {
        return Boolean(mapEl && mapEl.value);
      },
      onComplete(state) {
        state.map = mapEl?.value || 'world';
        state.zoneTag = zoneEl?.value.trim() ?? '';
        const min = parseInt(minEl?.value ?? '', 10);
        const max = parseInt(maxEl?.value ?? '', 10);
        state.minDist = Number.isFinite(min) ? min : 0;
        state.maxDist = Number.isFinite(max) ? max : undefined;
      }
    };
  };

  const enemyStep = (): WizardStep<EncounterWizardState> => {
    let pickEl: HTMLSelectElement | null = null;
    let nameEl: HTMLInputElement | null = null;
    let hpEl: HTMLInputElement | null = null;
    let atkEl: HTMLInputElement | null = null;
    let defEl: HTMLInputElement | null = null;
    return {
      render(container, state) {
        const templates = (moduleData().templates ?? [])
          .filter((t: any) => t?.id)
          .map((t: any) => ({ id: t.id, name: t.name || t.id }));
        pickEl = optionSelect(container, 'Enemy Template', templates, state.template ?? '', 'Create a new enemy…');
        nameEl = document.createElement('input');
        nameEl.placeholder = 'Name for a new enemy';
        if (state.templateName) nameEl.value = state.templateName;
        labeled(container, 'New Enemy Name', nameEl);
        hpEl = numberInput(container, 'HP (new enemy)', String(state.hp ?? 8));
        atkEl = numberInput(container, 'ATK (new enemy)', String(state.atk ?? 2));
        defEl = numberInput(container, 'DEF (new enemy)', String(state.def ?? 0));
      },
      validate() {
        return Boolean((pickEl && pickEl.value) || (nameEl && nameEl.value.trim() !== ''));
      },
      onComplete(state) {
        const customName = nameEl?.value.trim() ?? '';
        state.template = pickEl?.value || '';
        state.templateName = state.template ? '' : customName;
        state.hp = Math.max(1, parseInt(hpEl?.value ?? '8', 10) || 8);
        state.atk = Math.max(0, parseInt(atkEl?.value ?? '2', 10) || 0);
        state.def = Math.max(0, parseInt(defEl?.value ?? '0', 10) || 0);
      }
    };
  };

  const lootStep = (): WizardStep<EncounterWizardState> => {
    let pickEl: HTMLSelectElement | null = null;
    let nameEl: HTMLInputElement | null = null;
    let chanceEl: HTMLInputElement | null = null;
    return {
      render(container, state) {
        const items = (moduleData().items ?? [])
          .filter((it: any) => it?.id)
          .map((it: any) => ({ id: it.id, name: it.name || it.id }));
        pickEl = optionSelect(container, 'Loot Drop (optional)', items, state.lootItem ?? '', 'No loot');
        nameEl = document.createElement('input');
        nameEl.placeholder = 'Or a new item name';
        if (state.lootItemName) nameEl.value = state.lootItemName;
        labeled(container, 'New Loot Item', nameEl);
        chanceEl = numberInput(container, 'Drop Chance %', String(state.lootChance ?? 100));
        chanceEl.max = '100';
      },
      validate() {
        return true;
      },
      onComplete(state) {
        const customName = nameEl?.value.trim() ?? '';
        state.lootItem = pickEl?.value || '';
        state.lootItemName = state.lootItem ? '' : customName;
        const pct = parseInt(chanceEl?.value ?? '100', 10);
        state.lootChance = Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 100;
      }
    };
  };

  const encounterWizard: WizardDefinition<EncounterWizardState> = {
    title: 'Encounter Wizard',
    steps: [
      whereStep(),
      enemyStep(),
      lootStep(),
      confirm('The enemy will start roaming once you save or playtest.')
    ],
    commit(state) {
      const items: any[] = [];
      const templates: any[] = [];

      let templateId = state.template || '';
      const newName = state.templateName?.trim() ?? '';
      const isNew = !templateId && newName !== '';
      if (isNew) templateId = toSlug(newName);

      let lootId = state.lootItem || '';
      const lootName = state.lootItemName?.trim() ?? '';
      if (!lootId && lootName) {
        lootId = toSlug(lootName);
        items.push({ id: lootId, name: lootName, type: 'quest' });
      }
      const chance = Math.min(100, Math.max(0, state.lootChance ?? 100)) / 100;
      const lootTable = lootId ? [{ item: lootId, chance }] : [];

      if (isNew) {
        const combat: any = { HP: state.hp ?? 8, ATK: state.atk ?? 2, DEF: state.def ?? 0 };
        if (lootTable.length) combat.lootTable = lootTable;
        templates.push({ id: templateId, name: newName, combat });
      }

      const entry: any = { map: state.map || 'world', templateId };
      if (state.zoneTag) {
        entry.mode = 'zone';
        entry.zoneTag = state.zoneTag;
      } else {
        entry.mode = 'distance';
        entry.minDist = state.minDist ?? 0;
        if (typeof state.maxDist === 'number') entry.maxDist = state.maxDist;
      }
      if (!isNew && lootTable.length) entry.lootTable = lootTable;

      const result: any = { encounters: [entry] };
      if (templates.length) result.templates = templates;
      if (items.length) result.items = items;
      return result;
    }
  };

  dustlandEnc.EncounterWizard = encounterWizard;
  const dustlandWizards = (dustlandEnc.wizards ??= {});
  dustlandWizards.encounter = encounterWizard;
})();
