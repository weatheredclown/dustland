(function(){
  function init(member){
    if(typeof member.hydration !== 'number') member.hydration = 2;
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.status = { init };
})();
