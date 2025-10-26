(function(){
  function persistLlmNodes(tree){
    if(!tree) return;
    for(var id in tree){
      var node = tree[id];
      if(node && typeof node === 'object'){
        if(node.generated) delete node.generated;
        if(Array.isArray(node.choices)){
          node.choices.forEach(function(c){
            if(c.generated) delete c.generated;
            if(c.volatile) delete c.volatile;
          });
        }
      }
    }
  }
  globalThis.persistLlmNodes = persistLlmNodes;
})();
