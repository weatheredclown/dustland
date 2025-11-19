function isValueElement(el) {
    return 'value' in el;
}
(function () {
    const globalScope = globalThis;
    const dustlandNamespace = (globalScope.Dustland ?? (globalScope.Dustland = {}));
    const bus = dustlandNamespace.eventBus ?? globalScope.EventBus;
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
    bus.on('ui:show', payload => {
        const { id, display = '' } = payload;
        const el = document.getElementById(id);
        if (el)
            el.style.display = display;
    });
    bus.on('ui:hide', payload => {
        const id = payload;
        const el = document.getElementById(id);
        if (el)
            el.style.display = 'none';
    });
    bus.on('ui:text', payload => {
        const { id, text } = payload;
        const el = document.getElementById(id);
        if (el)
            el.textContent = text;
    });
    bus.on('ui:value', payload => {
        const { id, value } = payload;
        const el = document.getElementById(id);
        if (el && isValueElement(el))
            el.value = value;
    });
    bus.on('ui:remove', payload => {
        const id = payload;
        const el = document.getElementById(id);
        el?.remove();
    });
    const api = { show, hide, setText, setValue, remove };
    const uiNamespace = (dustlandNamespace.ui ?? (dustlandNamespace.ui = {}));
    Object.assign(uiNamespace, api);
    globalScope.UI = api;
})();
