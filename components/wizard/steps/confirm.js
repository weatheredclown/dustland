(function () {
    const confirmStep = (message = 'Review your choices.') => ({
        render(container, _state) {
            const paragraph = document.createElement('p');
            paragraph.textContent = message;
            container.appendChild(paragraph);
        }
    });
    const dustland = (globalThis.Dustland ?? (globalThis.Dustland = {}));
    const steps = (dustland.WizardSteps ?? (dustland.WizardSteps = {}));
    steps.confirm = confirmStep;
})();
