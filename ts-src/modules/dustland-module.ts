(function(){
  const globalScope = typeof globalThis !== 'undefined' ? globalThis : window;
  function dispatchReady(){
    const moduleData = globalScope.DUSTLAND_MODULE;
    if(!moduleData){
      globalScope.setTimeout(dispatchReady, 0);
      return;
    }
    try {
      const evt = new CustomEvent('dustland-module-ready', { detail: moduleData });
      globalScope.dispatchEvent(evt);
    } catch (err) {
      console.error('Dustland module ready event failed:', err);
    }
  }
  if(globalScope.DUSTLAND_MODULE){
    dispatchReady();
    return;
  }
  if(typeof document === 'undefined'){
    console.error('Dustland module loader requires a DOM environment.');
    return;
  }
  if(globalScope.__dustlandModuleLoading){
    globalScope.addEventListener('dustland-module-ready', () => {
      globalScope.__dustlandModuleReady = true;
    }, { once: true });
    return;
  }
  const script = document.createElement('script');
  script.src = 'modules/dustland.module.js';
  script.async = false;
  script.onload = () => {
    globalScope.__dustlandModuleReady = true;
    dispatchReady();
  };
  script.onerror = () => {
    console.error('Failed to load Dustland module data from modules/dustland.module.js.');
  };
  (document.head || document.documentElement).appendChild(script);
  globalScope.__dustlandModuleLoading = true;
})();
