globalThis.applyModule = function(){};
globalThis.state = {};
globalThis.renderWorld = function(){};

function load(p){
  const resolved = require.resolve(p);
  delete require.cache[resolved];
  require(p);
  if(typeof globalThis.startGame === 'function'){
    globalThis.startGame();
  }
}

['../modules/graffiti-puzzle.module.js','../modules/mara-puzzle.module.js'].forEach(p => {
  load(p);
  load(p);
});

console.log('Puzzles load and reset without crashing.');
