type NpcWizardPosition = { x: number; y: number };
type NpcWizardQuestType = 'fetch' | 'kill' | 'explore';

interface NpcWizardState extends WizardState {
  name?: string;
  portrait?: string;
  prompt?: string;
  dialogue?: string;
  questType?: NpcWizardQuestType;
  questItem?: string;
  questItemName?: string;
  goalCount?: number;
  killTemplate?: string;
  killTemplateName?: string;
  exploreX?: number;
  exploreY?: number;
  scrapReward?: number;
  rewardItem?: string;
  xpReward?: number;
  pos?: NpcWizardPosition;
}

(() => {
  const toSlug = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '_');

  const dustlandNpcWizard = (globalThis.Dustland ??= {});
  const wizardStepsNpc = (dustlandNpcWizard.WizardSteps ??= {});
  const { text, assetPicker, mapPlacement, confirm } = wizardStepsNpc;

  if (!text || !assetPicker || !mapPlacement || !confirm) {
    console.warn('NPC wizard skipped initialization because required steps are missing.');
    return;
  }

  const moduleData = (): any => (globalThis as any).ackGetModuleData?.() ?? {};

  const portraitOptions = (): string[] => {
    const fromEditor = (globalThis as any).ackPortraits;
    const list = Array.isArray(fromEditor)
      ? fromEditor.filter((p: unknown): p is string => typeof p === 'string' && p !== '')
      : [];
    if (list.length) return list;
    return ['assets/portraits/portrait_1000.png', 'assets/portraits/portrait_1001.png'];
  };

  const itemOptions = (): { id: string; name: string }[] =>
    (moduleData().items ?? [])
      .filter((it: any) => it?.id)
      .map((it: any) => ({ id: it.id, name: it.name || it.id }));

  const templateOptions = (): { id: string; name: string }[] =>
    (moduleData().templates ?? [])
      .filter((t: any) => t?.id)
      .map((t: any) => ({ id: t.id, name: t.name || t.id }));

  const field = (container: HTMLElement, label: string): HTMLInputElement => {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    const input = document.createElement('input');
    container.appendChild(labelEl);
    container.appendChild(input);
    return input;
  };

  const selectField = (
    container: HTMLElement,
    label: string,
    opts: { id: string; name: string }[],
    current: string,
    placeholderText: string
  ): HTMLSelectElement => {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
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
    container.appendChild(labelEl);
    container.appendChild(select);
    return select;
  };

  const questTypeStep = (): WizardStep<NpcWizardState> => {
    let selectEl: HTMLSelectElement | null = null;
    return {
      render(container, state) {
        selectEl = selectField(
          container,
          'Quest Type',
          [
            { id: 'fetch', name: 'Fetch — bring back an item' },
            { id: 'kill', name: 'Kill — cull dangerous enemies' },
            { id: 'explore', name: 'Explore — reach a location' }
          ],
          state.questType ?? 'fetch',
          'Select quest type'
        );
        if (!state.questType) selectEl.value = 'fetch';
      },
      validate() {
        return Boolean(selectEl && selectEl.value);
      },
      onComplete(state) {
        if (selectEl) state.questType = selectEl.value as NpcWizardQuestType;
      }
    };
  };

  const questGoalStep = (): WizardStep<NpcWizardState> => {
    let type: NpcWizardQuestType = 'fetch';
    let pickEl: HTMLSelectElement | null = null;
    let customEl: HTMLInputElement | null = null;
    let countEl: HTMLInputElement | null = null;
    let xEl: HTMLInputElement | null = null;
    let yEl: HTMLInputElement | null = null;
    return {
      render(container, state) {
        type = state.questType ?? 'fetch';
        pickEl = null;
        customEl = null;
        countEl = null;
        xEl = null;
        yEl = null;
        if (type === 'fetch') {
          pickEl = selectField(container, 'Fetch Item', itemOptions(), state.questItem ?? '', 'Select an existing item');
          customEl = field(container, 'Or a new item name');
          if (state.questItemName) customEl.value = state.questItemName;
          countEl = field(container, 'How many?');
          countEl.type = 'number';
          countEl.min = '1';
          countEl.value = String(state.goalCount ?? 1);
        } else if (type === 'kill') {
          pickEl = selectField(container, 'Enemy', templateOptions(), state.killTemplate ?? '', 'Select an existing enemy');
          customEl = field(container, 'Or a new enemy name');
          if (state.killTemplateName) customEl.value = state.killTemplateName;
          countEl = field(container, 'How many kills?');
          countEl.type = 'number';
          countEl.min = '1';
          countEl.value = String(state.goalCount ?? 3);
        } else {
          const note = document.createElement('p');
          note.textContent = 'Pick the world tile the party must reach.';
          container.appendChild(note);
          xEl = field(container, 'Target X');
          xEl.type = 'number';
          xEl.min = '0';
          if (typeof state.exploreX === 'number') xEl.value = String(state.exploreX);
          yEl = field(container, 'Target Y');
          yEl.type = 'number';
          yEl.min = '0';
          if (typeof state.exploreY === 'number') yEl.value = String(state.exploreY);
        }
      },
      validate() {
        if (type === 'explore') {
          return Boolean(xEl && yEl && xEl.value !== '' && yEl.value !== '');
        }
        return Boolean((pickEl && pickEl.value) || (customEl && customEl.value.trim() !== ''));
      },
      onComplete(state) {
        if (type === 'explore') {
          state.exploreX = parseInt(xEl?.value ?? '0', 10) || 0;
          state.exploreY = parseInt(yEl?.value ?? '0', 10) || 0;
          return;
        }
        const count = Math.max(1, parseInt(countEl?.value ?? '1', 10) || 1);
        state.goalCount = count;
        const custom = customEl?.value.trim() ?? '';
        if (type === 'fetch') {
          state.questItem = custom ? '' : pickEl?.value ?? '';
          state.questItemName = custom;
        } else {
          state.killTemplate = custom ? '' : pickEl?.value ?? '';
          state.killTemplateName = custom;
        }
      }
    };
  };

  const rewardStep = (): WizardStep<NpcWizardState> => {
    let scrapEl: HTMLInputElement | null = null;
    let itemEl: HTMLSelectElement | null = null;
    let xpEl: HTMLInputElement | null = null;
    return {
      render(container, state) {
        scrapEl = field(container, 'Scrap Reward');
        scrapEl.type = 'number';
        scrapEl.min = '0';
        scrapEl.value = String(state.scrapReward ?? 10);
        itemEl = selectField(container, 'Reward Item (optional)', itemOptions(), state.rewardItem ?? '', 'No item reward');
        xpEl = field(container, 'XP (optional)');
        xpEl.type = 'number';
        xpEl.min = '0';
        if (typeof state.xpReward === 'number') xpEl.value = String(state.xpReward);
      },
      validate() {
        return true;
      },
      onComplete(state) {
        state.scrapReward = Math.max(0, parseInt(scrapEl?.value ?? '0', 10) || 0);
        state.rewardItem = itemEl?.value ?? '';
        const xp = parseInt(xpEl?.value ?? '', 10);
        state.xpReward = Number.isFinite(xp) && xp > 0 ? xp : 0;
      }
    };
  };

  const npcWizard: WizardDefinition<NpcWizardState> = {
    title: 'NPC & Quest Wizard',
    steps: [
      text('Name', 'name'),
      assetPicker('Portrait', portraitOptions, 'portrait', { allowCustom: true, customLabel: 'Custom portrait path' }),
      text('Portrait Prompt', 'prompt'),
      text('Dialogue', 'dialogue'),
      questTypeStep(),
      questGoalStep(),
      rewardStep(),
      mapPlacement('pos'),
      confirm('Done')
    ],
    commit(state) {
      const nameValue = state.name ?? '';
      const id = toSlug(nameValue);
      const questId = `${id}_quest`;
      const type: NpcWizardQuestType = state.questType ?? 'fetch';
      const count = Math.max(1, state.goalCount ?? 1);

      const items: any[] = [];
      const templates: any[] = [];
      const events: any[] = [];
      const quest: any = { id: questId, giver: id };

      let goalNoun = '';
      if (type === 'fetch') {
        let itemId = state.questItem || '';
        const customName = state.questItemName?.trim() ?? '';
        if (!itemId && customName) {
          itemId = toSlug(customName);
          items.push({ id: itemId, name: customName, type: 'quest' });
        }
        const known = moduleData().items?.find?.((it: any) => it?.id === itemId);
        goalNoun = customName || known?.name || itemId;
        quest.item = itemId;
        if (count > 1) quest.count = count;
        quest.title = `Bring back ${goalNoun}`;
      } else if (type === 'kill') {
        let templateId = state.killTemplate || '';
        const customName = state.killTemplateName?.trim() ?? '';
        const trophyId = `${questId}_trophy`;
        if (!templateId && customName) {
          templateId = toSlug(customName);
          templates.push({
            id: templateId,
            name: customName,
            combat: { HP: 8, ATK: 2, DEF: 0, lootTable: [{ item: trophyId, chance: 1 }] }
          });
        } else if (templateId) {
          // Attach the trophy drop to the existing template in place; the
          // editor snapshots before commit, so this stays undoable.
          const existing = moduleData().templates?.find?.((t: any) => t?.id === templateId);
          if (existing) {
            existing.combat = existing.combat || {};
            const table = Array.isArray(existing.combat.lootTable) ? existing.combat.lootTable : [];
            if (!table.some((row: any) => row?.item === trophyId)) {
              table.push({ item: trophyId, chance: 1 });
            }
            existing.combat.lootTable = table;
          }
        }
        const known = moduleData().templates?.find?.((t: any) => t?.id === templateId);
        goalNoun = customName || known?.name || templateId;
        items.push({ id: trophyId, name: `${goalNoun} Trophy`, type: 'quest' });
        quest.item = trophyId;
        quest.count = count;
        quest.title = `Cull ${count} ${goalNoun}`;
      } else {
        const flag = `${questId}_reached`;
        const x = state.exploreX ?? 0;
        const y = state.exploreY ?? 0;
        events.push({
          map: 'world',
          x,
          y,
          events: [
            { when: 'enter', effect: 'addFlag', flag },
            { when: 'enter', effect: 'toast', msg: `This is the spot ${nameValue} described.` }
          ]
        });
        quest.reqFlag = flag;
        quest.title = `Scout the spot at (${x}, ${y})`;
        goalNoun = `the spot at (${x}, ${y})`;
      }

      quest.reward = state.rewardItem || `SCRAP ${String(state.scrapReward ?? 0)}`;
      if (state.xpReward) quest.xp = state.xpReward;

      const pitch = {
        fetch: `I need ${goalNoun}${count > 1 ? ` — ${count} of them` : ''}. Bring ${count > 1 ? 'them' : 'it'} back and I'll make it worth your while.`,
        kill: `${goalNoun} out there ${count > 1 ? 'are' : 'is'} making life short. Thin ${count > 1 ? 'them' : 'it'} out — bring proof.`,
        explore: `Nobody's come back from ${goalNoun}. Go take a look and tell me what you find.`
      }[type];
      const acceptLine = {
        fetch: 'Good. It should be somewhere in the waste. Don\'t come back empty-handed.',
        kill: 'Good hunting. I\'ll pay when I see the proof.',
        explore: 'Watch the horizon out there. Come back once you\'ve seen it.'
      }[type];

      const npc = {
        id,
        name: state.name,
        portrait: state.portrait,
        prompt: state.prompt,
        tree: {
          start: {
            text: state.dialogue,
            choices: [
              { label: '(Ask about work)', to: 'job' },
              { label: '(Leave)', to: 'bye' }
            ]
          },
          job: {
            text: pitch,
            choices: [
              { label: '(Accept the job)', to: 'accept', q: 'accept' },
              { label: '(Turn in)', to: 'do_turnin', q: 'turnin' },
              { label: '(Leave)', to: 'bye' }
            ]
          },
          accept: { text: acceptLine, choices: [{ label: '(Leave)', to: 'bye' }] },
          do_turnin: { text: 'You came through. Here\'s your cut.', choices: [{ label: '(Leave)', to: 'bye' }] }
        },
        map: 'world',
        x: state.pos?.x,
        y: state.pos?.y
      };

      const result: any = { npcs: [npc], quests: [quest] };
      if (items.length) result.items = items;
      if (templates.length) result.templates = templates;
      if (events.length) result.events = events;
      return result;
    }
  };

  dustlandNpcWizard.NpcWizard = npcWizard;
  const dustlandWizards = (dustlandNpcWizard.wizards ??= {});
  dustlandWizards.npc = npcWizard;
})();
