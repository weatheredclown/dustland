// @ts-nocheck
(function () {
    const bus = globalThis.Dustland?.eventBus ?? globalThis.EventBus;
    if (!bus)
        return;
    function show(id, display = '') {
        bus.emit('ui:show', { id, display });
    }
    function hide(id) {
        bus.emit('ui:hide', id);
    }
    function setText(id, text) {
        bus.emit('ui:text', { id, text });
    }
    function setValue(id, value) {
        bus.emit('ui:value', { id, value });
    }
    function remove(id) {
        bus.emit('ui:remove', id);
    }
    bus.on('ui:show', ({ id, display }) => {
        const el = document.getElementById(id);
        if (el)
            el.style.display = display;
    });
    bus.on('ui:hide', id => {
        const el = document.getElementById(id);
        if (el)
            el.style.display = 'none';
    });
    bus.on('ui:text', ({ id, text }) => {
        const el = document.getElementById(id);
        if (el)
            el.textContent = text;
    });
    bus.on('ui:value', ({ id, value }) => {
        const el = document.getElementById(id);
        if (el)
            el.value = value;
    });
    bus.on('ui:remove', id => {
        const el = document.getElementById(id);
        el?.remove();
    });
    const api = { show, hide, setText, setValue, remove };
    globalThis.Dustland = globalThis.Dustland ?? {};
    globalThis.Dustland.ui = api;
    globalThis.UI = api;
})();
