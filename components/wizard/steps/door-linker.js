const isDoorCoordinate = (value) => {
    if (!value || typeof value !== 'object')
        return false;
    const candidate = value;
    return (typeof candidate.x === 'number' &&
        typeof candidate.y === 'number' &&
        Number.isFinite(candidate.x) &&
        Number.isFinite(candidate.y));
};
const doorLinkerStep = (entryKey, exitKey, entryLabel, exitLabel) => {
    const entryKeyName = entryKey || 'entry';
    const exitKeyName = exitKey || 'exit';
    const entryLabelText = entryLabel || 'World Entry';
    const exitLabelText = exitLabel || 'Interior Exit';
    let currentState;
    return {
        render(container, state) {
            currentState = state;
            const wrap = document.createElement('div');
            wrap.style.display = 'flex';
            wrap.style.gap = '20px';
            const createPane = (label, key) => {
                const pane = document.createElement('div');
                const instructions = document.createElement('p');
                instructions.textContent = `${label} - click to select a location.`;
                const canvas = document.createElement('canvas');
                canvas.width = 160;
                canvas.height = 160;
                canvas.style.border = '1px solid #444';
                pane.appendChild(instructions);
                pane.appendChild(canvas);
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return pane;
                }
                const tileSize = 10;
                const draw = () => {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    const pos = state[key];
                    if (isDoorCoordinate(pos)) {
                        ctx.fillStyle = '#9ef7a0';
                        ctx.fillRect(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize);
                    }
                };
                draw();
                canvas.addEventListener('click', event => {
                    const rect = canvas.getBoundingClientRect();
                    const x = Math.floor((event.clientX - rect.left) / tileSize);
                    const y = Math.floor((event.clientY - rect.top) / tileSize);
                    state[key] = { x, y };
                    draw();
                });
                return pane;
            };
            wrap.appendChild(createPane(entryLabelText, entryKeyName));
            wrap.appendChild(createPane(exitLabelText, exitKeyName));
            container.appendChild(wrap);
        },
        validate() {
            if (!currentState)
                return false;
            if (!isDoorCoordinate(currentState[entryKeyName]))
                return;
            if (!isDoorCoordinate(currentState[exitKeyName]))
                return;
            return true;
        },
        onComplete() { }
    };
};
const dustlandDoorLinker = (globalThis.Dustland ?? (globalThis.Dustland = {}));
const wizardStepsDoorLinker = (dustlandDoorLinker.WizardSteps ?? (dustlandDoorLinker.WizardSteps = {}));
wizardStepsDoorLinker.doorLinker = doorLinkerStep;
