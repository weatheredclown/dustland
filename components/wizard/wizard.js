(function () {
    function ensureDustland() {
        if (!globalThis.Dustland) {
            globalThis.Dustland = {};
        }
        return globalThis.Dustland;
    }
    function createWizard(container, steps, opts = {}) {
        let index = 0;
        const state = (opts.initialState ?? {});
        const onComplete = opts.onComplete ?? (() => undefined);
        const render = () => {
            container.innerHTML = '';
            const step = steps[index];
            step?.render(container, state);
        };
        const next = () => {
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
        const prev = () => {
            if (index === 0) {
                return false;
            }
            index -= 1;
            render();
            return true;
        };
        const goTo = (i) => {
            if (i < 0 || i >= steps.length) {
                return false;
            }
            index = i;
            render();
            return true;
        };
        const getState = () => state;
        const current = () => index;
        render();
        return { next, prev, goTo, getState, current };
    }
    const dustland = ensureDustland();
    dustland.Wizard = createWizard;
})();
