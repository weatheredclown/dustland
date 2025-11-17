interface DialOptions {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
}

interface DialWidget {
  el: HTMLDivElement;
  set(value: number): void;
}


function createDial(options: DialOptions = {}): DialWidget {
  const opts = options;
  const dial = document.createElement('div');
  dial.style.position = 'relative';
  dial.style.width = '40px';
  dial.style.height = '40px';
  dial.style.border = '2px solid #999';
  dial.style.borderRadius = '50%';

  const knob = document.createElement('div');
  knob.style.position = 'absolute';
  knob.style.left = '50%';
  knob.style.top = '50%';
  knob.style.width = '6px';
  knob.style.height = '20px';
  knob.style.background = '#c33';
  knob.style.transformOrigin = '50% 100%';
  dial.appendChild(knob);

  const min = opts.min ?? 0;
  const max = opts.max ?? 100;
  let value = opts.value ?? min;

  function set(val: number): void {
    const clamped = Math.max(min, Math.min(max, val));
    value = clamped;
    const span = max - min || 1;
    const ratio = (value - min) / span;
    const angle = ratio * 270 - 135;
    knob.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
    opts.onChange?.(value);
  }

  dial.addEventListener('click', (event: MouseEvent) => {
    const rect = dial.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 180;
    const val = min + (angle / 360) * (max - min);
    set(val);
  });

  set(value);
  return { el: dial, set };
}

const dustland = (globalThis.Dustland ??= {});
const uiNamespace = (dustland.ui = dustland.ui ?? {});
uiNamespace.createDial = createDial;
