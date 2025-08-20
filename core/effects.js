export const Effects = {
  apply(list = [], ctx = {}) {
    for (const eff of list || []) {
      if (!eff) continue;
      const type = eff.effect || eff.type;
      switch (type) {
        case 'toast':
          if (typeof toast === 'function') toast(eff.msg || '');
          else if (typeof log === 'function') log(eff.msg || '');
          break;
        case 'log':
          if (typeof log === 'function') log(eff.msg || '');
          break;
        case 'addFlag': {
          const p = ctx.party || globalThis.party;
          if (p) {
            p.flags = p.flags || {};
            p.flags[eff.flag] = true;
            if (typeof revealHiddenNPCs === 'function') revealHiddenNPCs();
          }
          break; }
        case 'modStat': {
          const target = ctx.actor || ctx.player;
          if (target && target.stats && eff.stat) {
            const delta = eff.delta || 0;
            target.stats[eff.stat] = (target.stats[eff.stat] || 0) + delta;
            if (eff.duration) {
              ctx.buffs = ctx.buffs || [];
              ctx.buffs.push({ target, stat: eff.stat, delta, remaining: eff.duration });
            }
          }
          break; }
      }
    }
  },
  tick(ctx = {}) {
    const list = ctx.buffs || [];
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      if (--b.remaining <= 0) {
        if (b.target && b.target.stats) {
          b.target.stats[b.stat] = (b.target.stats[b.stat] || 0) - b.delta;
        }
        list.splice(i, 1);
      }
    }
  }
};

export default Effects;
