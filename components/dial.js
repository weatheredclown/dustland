(function () {
    var _a;
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    function DialWidget(container, opts = {}) {
        const min = opts.min ?? 0;
        const max = opts.max ?? 10;
        const state = { value: clamp(opts.value ?? min, min, max) };
        const display = document.createElement('div');
        display.className = 'dial';
        container.appendChild(display);
        const onChange = typeof opts.onChange === 'function' ? opts.onChange : null;
        function render() {
            display.textContent = String(state.value);
            if (onChange)
                onChange(state.value);
        }
        function changeBy(delta) {
            state.value = clamp(state.value + delta, min, max);
            render();
        }
        display.addEventListener('click', () => changeBy(1));
        render();
        return {
            value() {
                return state.value;
            },
            set(value) {
                state.value = clamp(value, min, max);
                render();
            },
            inc() {
                changeBy(1);
            },
            dec() {
                changeBy(-1);
            }
        };
    }
    const dustland = ((_a = globalThis).Dustland ?? (_a.Dustland = {}));
    dustland.DialWidget = DialWidget;
})();
