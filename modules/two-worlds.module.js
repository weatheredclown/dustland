// Entry module that loads World One.
(function(){
  const script = document.createElement('script');
  script.src = 'modules/world-one.module.js';
  script.onload = () => startGame();
  document.head.appendChild(script);
})();
