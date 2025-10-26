const isMapPlacementPoint = (value) => {
    if (!value || typeof value !== 'object')
        return false;
    const candidate = value;
    return typeof candidate.x === 'number' && typeof candidate.y === 'number';
};
const mapPlacementStep = (key) => {
    let currentState;
    return {
        render(container, state) {
            currentState = state;
            const message = document.createElement('p');
            message.textContent = 'Click to select a location.';
            const canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 160;
            canvas.style.border = '1px solid #444';
            container.appendChild(message);
            container.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            const tileSize = 10;
            const draw = () => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const pos = state[key];
                if (isMapPlacementPoint(pos)) {
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
        },
        validate() {
            if (!currentState)
                return false;
            if (!isMapPlacementPoint(currentState[key]))
                return;
            return true;
        },
        onComplete() { }
    };
};
const dustlandMapPlacement = (globalThis.Dustland ?? (globalThis.Dustland = {}));
const wizardStepsMapPlacement = (dustlandMapPlacement.WizardSteps ?? (dustlandMapPlacement.WizardSteps = {}));
wizardStepsMapPlacement.mapPlacement = mapPlacementStep;
