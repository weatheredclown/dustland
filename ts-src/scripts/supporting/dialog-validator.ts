// @ts-nocheck
// Basic dialog tree validator

globalThis.Dustland = globalThis.Dustland || {};
(function(){
  type DialogChoice = { to?: string };
  type DialogNode = { choices?: DialogChoice[] };

  function validateDialogTree(tree: Record<string, DialogNode> | undefined){
    const errors = [];
    for (const [nodeId, node] of Object.entries(tree || {})){
      (node.choices || []).forEach(ch => {
        if (ch.to && !tree[ch.to]) errors.push(`Missing target '${ch.to}' from '${nodeId}'`);
      });
    }
    return errors;
  }
  globalThis.Dustland.validateDialogTree = validateDialogTree;
})();
