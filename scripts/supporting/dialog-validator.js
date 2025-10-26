// Basic dialog tree validator
globalThis.Dustland = globalThis.Dustland || {};
(function () {
    function validateDialogTree(tree) {
        const errors = [];
        for (const [nodeId, node] of Object.entries(tree || {})) {
            (node.choices || []).forEach(ch => {
                if (ch.to && !tree[ch.to])
                    errors.push(`Missing target '${ch.to}' from '${nodeId}'`);
            });
        }
        return errors;
    }
    globalThis.Dustland.validateDialogTree = validateDialogTree;
})();
