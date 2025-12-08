// @ts-nocheck
(function () {
    globalThis.Dustland = globalThis.Dustland || {};
    const bus = globalThis.EventBus;
    let packs = {};
    function load(text) {
        try {
            packs = JSON.parse(text) || {};
        }
        catch (e) {
            globalThis.log?.('Invalid effect pack', undefined);
            packs = {};
        }
    }
    function fire(evt) {
        const list = packs[evt];
        if (list) {
            Dustland.effects?.apply(list);
            bus?.emit('effect-pack:fire', { evt });
        }
    }
    Dustland.effectPackInspector = { load, fire };
})();
