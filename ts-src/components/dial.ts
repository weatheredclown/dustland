interface DialWidgetOptions {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
}

interface DialWidgetHandle {
  value(): number;
  set(value: number): void;
  inc(): void;
  dec(): void;
}

(function(){
  function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  function DialWidget(container: HTMLElement, opts: DialWidgetOptions = {}): DialWidgetHandle {
    const min = opts.min ?? 0;
    const max = opts.max ?? 10;
    const state = { value: clamp(opts.value ?? min, min, max) };
    const display = document.createElement('div');
    display.className = 'dial';
    container.appendChild(display);
    const onChange: ((value: number) => void) | null =
      typeof opts.onChange === 'function' ? opts.onChange : null;

    function render(): void {
      display.textContent = String(state.value);
      if (onChange) onChange(state.value);
    }

    function changeBy(delta: number): void {
      state.value = clamp(state.value + delta, min, max);
      render();
    }

    display.addEventListener('click', () => changeBy(1));
    render();

    return {
      value(){
        return state.value;
      },
      set(value: number){
        state.value = clamp(value, min, max);
        render();
      },
      inc(){
        changeBy(1);
      },
      dec(){
        changeBy(-1);
      }
    };
  }

  const dustland = (globalThis.Dustland ??= {} as DustlandNamespace);
  (dustland as DustlandNamespace & { DialWidget: typeof DialWidget }).DialWidget = DialWidget;
})();
