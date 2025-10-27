class Wizard {
    constructor(config) {
        this.title = config.title ?? 'Wizard';
        this.steps = config.steps ?? [];
        this.state = (config.initialState ?? {});
        this.current = 0;
        this.onComplete = config.onComplete ?? null;
        this.stepEl = null;
    }
    render(container) {
        const wrap = document.createElement('div');
        wrap.className = 'wizard';
        const titleEl = document.createElement('h2');
        titleEl.textContent = this.title;
        wrap.appendChild(titleEl);
        const stepEl = document.createElement('div');
        wrap.appendChild(stepEl);
        const nav = document.createElement('div');
        const back = document.createElement('button');
        back.textContent = 'Back';
        const next = document.createElement('button');
        next.textContent = 'Next';
        nav.appendChild(back);
        nav.appendChild(next);
        wrap.appendChild(nav);
        back.onclick = () => {
            if (this.current > 0) {
                this.current--;
                this.showStep();
            }
        };
        next.onclick = () => {
            if (this.current < this.steps.length - 1) {
                this.current++;
                this.showStep();
            }
            else {
                this.onComplete?.(this.state);
            }
        };
        (container ?? document.body).appendChild(wrap);
        this.stepEl = stepEl;
        this.showStep();
    }
    showStep() {
        if (!this.stepEl)
            return;
        const step = this.steps[this.current];
        this.stepEl.innerHTML = '';
        step?.render(this.stepEl, this.state);
    }
    getState() {
        return this.state;
    }
    setState(part) {
        if (!part)
            return;
        Object.assign(this.state, part);
    }
}
class TextInputStep {
    constructor(opts) {
        this.id = opts.id;
        this.label = opts.label ?? opts.id;
    }
    render(container, state) {
        const label = document.createElement('label');
        label.textContent = this.label;
        const input = document.createElement('input');
        input.type = 'text';
        const existing = state[this.id];
        input.value = typeof existing === 'string' ? existing : '';
        input.oninput = () => {
            state[this.id] = input.value;
        };
        label.appendChild(input);
        container.appendChild(label);
    }
}
class AssetPickerStep {
    constructor(opts) {
        this.id = opts.id;
        this.label = opts.label ?? opts.id;
        this.assets = opts.assets ?? [];
    }
    render(container, state) {
        const label = document.createElement('label');
        label.textContent = this.label;
        const select = document.createElement('select');
        for (const asset of this.assets) {
            const option = document.createElement('option');
            option.value = asset;
            option.textContent = asset;
            select.appendChild(option);
        }
        select.onchange = () => {
            state[this.id] = select.value;
        };
        label.appendChild(select);
        container.appendChild(label);
    }
}
const wizardGlobal = globalThis;
wizardGlobal.Wizard = Wizard;
wizardGlobal.TextInputStep = TextInputStep;
wizardGlobal.AssetPickerStep = AssetPickerStep;
