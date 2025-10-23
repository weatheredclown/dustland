(function () {
    function confirmStep(message) {
        const text = message && message.trim() !== '' ? message : 'Review your choices.';
        return {
            render(container) {
                const p = document.createElement('p');
                p.textContent = text;
                container.appendChild(p);
            }
        };
    }
    const dustland = globalThis.Dustland ||
        (globalThis.Dustland = {});
    let wizardSteps = dustland.WizardSteps;
    if (!wizardSteps) {
        wizardSteps = {};
        dustland.WizardSteps = wizardSteps;
    }
    wizardSteps.confirm = confirmStep;
})();
