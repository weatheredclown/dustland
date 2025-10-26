// ===== Profiles =====
(function () {
    if (!globalThis.Dustland)
        globalThis.Dustland = {};
    const dustland = globalThis.Dustland;
    const registry = {};
    function set(id, data = {}) {
        if (!id)
            return;
        registry[id] = data;
    }
    function get(id) {
        if (!id)
            return undefined;
        return registry[id];
    }
    function apply(target, id) {
        if (!target)
            return;
        const profile = get(id);
        if (!profile)
            return;
        if (profile.mods) {
            if (!target._bonus)
                target._bonus = {};
            const bonus = target._bonus;
            for (const [stat, delta] of Object.entries(profile.mods)) {
                if (typeof delta !== 'number')
                    continue;
                bonus[stat] = (bonus[stat] ?? 0) + delta;
                if (target.stats)
                    target.stats[stat] = (target.stats[stat] ?? 0) + delta;
            }
        }
        if (profile.effects && dustland.effects?.apply) {
            dustland.effects.apply(profile.effects, { actor: target });
        }
    }
    function remove(target, id) {
        if (!target)
            return;
        const profile = get(id);
        if (!profile?.mods)
            return;
        for (const [stat, delta] of Object.entries(profile.mods)) {
            if (typeof delta !== 'number')
                continue;
            if (target.stats)
                target.stats[stat] = (target.stats[stat] ?? 0) - delta;
            if (target._bonus)
                target._bonus[stat] = (target._bonus[stat] ?? 0) - delta;
        }
    }
    dustland.profiles = { set, get, apply, remove };
})();
