type UIShowPayload = { id: string; display?: string };
type UITextPayload = { id: string; text: string };
type UIValuePayload = { id: string; value: string };

function isValueElement(el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return 'value' in el;
}

(function(){
  const globalScope = globalThis as typeof globalThis & {
    Dustland?: DustlandNamespace;
    EventBus?: DustlandEventBus;
    UI?: DustlandUiApi;
  };

  const dustlandNamespace = (globalScope.Dustland ??= {} as DustlandNamespace);

  const bus = dustlandNamespace.eventBus ?? globalScope.EventBus;
  if(!bus) return;

  function show(id: string, display = ''): void {
    bus.emit('ui:show', { id, display });
  }

  function hide(id: string): void {
    bus.emit('ui:hide', id);
  }

  function setText(id: string, text: string): void {
    bus.emit('ui:text', { id, text });
  }

  function setValue(id: string, value: string): void {
    bus.emit('ui:value', { id, value });
  }

  function remove(id: string): void {
    bus.emit('ui:remove', id);
  }

  bus.on('ui:show', payload => {
    const { id, display = '' } = payload as UIShowPayload;
    const el = document.getElementById(id);
    if(el) el.style.display = display;
  });

  bus.on('ui:hide', payload => {
    const id = payload as string;
    const el = document.getElementById(id);
    if(el) el.style.display = 'none';
  });

  bus.on('ui:text', payload => {
    const { id, text } = payload as UITextPayload;
    const el = document.getElementById(id);
    if(el) el.textContent = text;
  });

  bus.on('ui:value', payload => {
    const { id, value } = payload as UIValuePayload;
    const el = document.getElementById(id);
    if(el && isValueElement(el)) el.value = value;
  });

  bus.on('ui:remove', payload => {
    const id = payload as string;
    const el = document.getElementById(id);
    el?.remove();
  });

  const api: DustlandUiApi = { show, hide, setText, setValue, remove };
  const uiNamespace = (dustlandNamespace.ui ??= {} as Record<string, unknown>);
  Object.assign(uiNamespace, api);
  globalScope.UI = api;
})();
