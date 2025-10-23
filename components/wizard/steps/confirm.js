(function () {
    function ensureDustland() {
        if (!globalThis.Dustland) {
            globalThis.Dustland = {};
        }
        return globalThis.Dustland;
    }
    function ensureWizardSteps(dustland) {
        if (!dustland.WizardSteps) {
            dustland.WizardSteps = {};
        }
        return dustland.WizardSteps;
    }
    function confirmStep(message = 'Review your choices.') {
        return {
            render(container) {
                const paragraph = document.createElement('p');
                paragraph.textContent = message;
                container.appendChild(paragraph);
            }
        };
    }
    const dustland = ensureDustland();
    const wizardSteps = ensureWizardSteps(dustland);
    wizardSteps.confirm = confirmStep;
})();
