// Basic dialog tree validator

(globalThis as any).Dustland = (globalThis as any).Dustland || {};
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
  (globalThis as any).Dustland.validateDialogTree = validateDialogTree;
})();
