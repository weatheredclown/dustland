(function(){
  function ensureDustland(): DustlandNamespace {
    if (!(globalThis as any).Dustland) {
      (globalThis as any).Dustland = {};
    }
    return (globalThis as any).Dustland as DustlandNamespace;
  }

  function createWizard<S extends WizardState = WizardState>(
    container: HTMLElement,
    steps: WizardStep<S>[],
    opts: WizardOptions<S> = {}
  ): WizardInstance<S> {
    let index = 0;
    const state = (opts.initialState ?? {}) as S;
    const onComplete = opts.onComplete ?? (() => undefined);

    const render = (): void => {
      container.innerHTML = '';
      const step = steps[index];
      step?.render(container, state);
    };

    const next = (): boolean => {
      const step = steps[index];
      if (step?.validate && step.validate(state) === false) {
        return false;
      }
      step?.onComplete?.(state);
      index += 1;
      if (index >= steps.length) {
        onComplete(state);
        return true;
      }
      render();
      return true;
    };

    const prev = (): boolean => {
      if (index === 0) {
        return false;
      }
      index -= 1;
      render();
      return true;
    };

    const goTo = (i: number): boolean => {
      if (i < 0 || i >= steps.length) {
        return false;
      }
      index = i;
      render();
      return true;
    };

    const getState = (): S => state;

    const current = (): number => index;

    render();

    return { next, prev, goTo, getState, current };
  }

  const dustland = ensureDustland();
  dustland.Wizard = createWizard;
})();
