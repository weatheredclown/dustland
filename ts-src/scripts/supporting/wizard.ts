interface WizardConfig<S extends WizardState = WizardState> {
  title?: string;
  steps?: WizardStep<S>[];
  initialState?: S;
  onComplete?: (state: S) => void;
}

class Wizard<S extends WizardState = WizardState> {
  title: string;
  steps: WizardStep<S>[];
  state: S;
  current: number;
  onComplete: ((state: S) => void) | null;
  private stepEl: HTMLDivElement | null;

  constructor(config: WizardConfig<S>) {
    this.title = config.title ?? 'Wizard';
    this.steps = config.steps ?? [];
    this.state = (config.initialState ?? {}) as S;
    this.current = 0;
    this.onComplete = config.onComplete ?? null;
    this.stepEl = null;
  }

  render(container?: HTMLElement): void {
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
      } else {
        this.onComplete?.(this.state);
      }
    };

    (container ?? document.body).appendChild(wrap);
    this.stepEl = stepEl;
    this.showStep();
  }

  showStep(): void {
    if (!this.stepEl) return;
    const step = this.steps[this.current];
    this.stepEl.innerHTML = '';
    step?.render(this.stepEl, this.state);
  }

  getState(): S {
    return this.state;
  }

  setState(part?: Partial<S>): void {
    if (!part) return;
    Object.assign(this.state, part);
  }
}

interface TextInputStepOptions {
  id: string;
  label?: string;
}

class TextInputStep implements WizardStep {
  private readonly id: string;
  private readonly label: string;

  constructor(opts: TextInputStepOptions) {
    this.id = opts.id;
    this.label = opts.label ?? opts.id;
  }

  render(container: HTMLElement, state: WizardState): void {
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

interface AssetPickerStepOptions {
  id: string;
  label?: string;
  assets?: string[];
}

class AssetPickerStep implements WizardStep {
  private readonly id: string;
  private readonly label: string;
  private readonly assets: string[];

  constructor(opts: AssetPickerStepOptions) {
    this.id = opts.id;
    this.label = opts.label ?? opts.id;
    this.assets = opts.assets ?? [];
  }

  render(container: HTMLElement, state: WizardState): void {
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

const wizardGlobal = globalThis as typeof globalThis & {
  Wizard?: typeof Wizard;
  TextInputStep?: typeof TextInputStep;
  AssetPickerStep?: typeof AssetPickerStep;
};

wizardGlobal.Wizard = Wizard;
wizardGlobal.TextInputStep = TextInputStep;
wizardGlobal.AssetPickerStep = AssetPickerStep;
