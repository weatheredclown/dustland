(function () {
  type EndCredit = string | { name?: string; title?: string; role?: string; [key: string]: unknown };
  type EndSequenceConfig = {
    messages?: string[];
    credits?: EndCredit[];
    title?: string;
    subtitle?: string;
    fadeMs?: number;
    messageMs?: number;
    creditMs?: number;
    includeGameCredits?: boolean;
    [key: string]: unknown;
  };

  const GAME_CREDITS: EndCredit[] = [
    { name: 'Riley "Clown" Morgan', title: 'Hacker-Artist / Mod-Friendly Coding' },
    { name: 'Alex "Echo" Johnson', title: 'World-Building / Story and Dialogue' },
    { name: 'Priya "Gizmo" Sharma', title: 'Tools Engineering / Editor Automation' },
    { name: 'Mateo "Wing" Alvarez', title: 'Combat Tuning / User Testing' }
  ];

  const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));

  function normalizeCredit(credit: EndCredit): { name: string; title: string } | null {
    if (typeof credit === 'string') return { name: credit, title: '' };
    if (!credit || typeof credit !== 'object') return null;
    const name = String(credit.name ?? '').trim();
    const title = String(credit.title ?? credit.role ?? '').trim();
    if (!name && !title) return null;
    return { name, title };
  }

  function activeModuleCredits(): EndCredit[] {
    const dl = globalThis.Dustland ?? {};
    const current = dl.currentModule;
    const moduleData = current && dl.loadedModules ? dl.loadedModules[current] : null;
    const credits = moduleData?.credits;
    return Array.isArray(credits) ? credits : [];
  }

  function ensureEndOverlay(): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    let overlay = document.getElementById('dustlandEndSequence');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'dustlandEndSequence';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#000;color:#9f9;display:flex;align-items:center;justify-content:center;text-align:center;font-family:monospace;letter-spacing:.08em;opacity:0;transition:opacity 1200ms ease;pointer-events:auto;padding:32px;box-sizing:border-box;';
    document.body.appendChild(overlay);
    return overlay;
  }

  function escapeHtml(value: string): string {
    return value.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch] ?? ch));
  }

  function setEndOverlayText(overlay: HTMLElement, html: string): void {
    overlay.innerHTML = `<div style="max-width:760px;line-height:1.7;text-shadow:0 0 12px #0f0;">${html}</div>`;
  }

  const Actions = {
    applyQuestReward(reward) {
      if (!reward) return;
      const globals = globalThis as {
        leader?: () => PartyMember | undefined;
        awardXP?: (target: PartyMember, amount: number) => void;
        toast?: (message: string) => void;
        player?: PlayerState;
        CURRENCY?: string;
        resolveItem?: (reward: string | Record<string, unknown>) => GameItem | null;
        addToInv?: (item: GameItem) => boolean;
        dropItemNearParty?: (item: GameItem) => void;
      };
      if (typeof reward === 'string' && /^xp\s*\d+/i.test(reward)) {
        const amt = parseInt(reward.replace(/[^0-9]/g, ''), 10) || 0;
        if (typeof globals.leader === 'function' && typeof globals.awardXP === 'function') {
          globals.awardXP(globals.leader(), amt);
        }
        if (typeof globals.toast === 'function') globals.toast(`+${amt} XP`);
      } else if (typeof reward === 'string' && /^scrap\s*\d+/i.test(reward)) {
        const amt = parseInt(reward.replace(/[^0-9]/g, ''), 10) || 0;
        if (typeof globalThis === 'object' && globals.player) {
          globals.player.scrap = (globals.player.scrap || 0) + amt;
        }
        if (typeof updateHUD === 'function') updateHUD();
        if (typeof globals.toast === 'function') globals.toast(`+${amt} ${globals.CURRENCY || 'Scrap'}`);
      } else {
        const item = typeof globals.resolveItem === 'function' ? globals.resolveItem(reward) : null;
        if (item) {
          if (typeof globals.addToInv === 'function') {
            if (!globals.addToInv(item)) {
              if (typeof globals.dropItemNearParty === 'function') globals.dropItemNearParty(item);
            } else {
              if (typeof globals.toast === 'function') globals.toast(`Received ${item.name}`);
            }
          }
        }
      }
    },
    startCombat(defender) {
      if (typeof globalThis.startCombat === 'function') return globalThis.startCombat(defender);
    },
    async playEndSequence(config: EndSequenceConfig = {}) {
      const overlay = ensureEndOverlay();
      const messages = Array.isArray(config.messages) && config.messages.length
        ? config.messages.map(String)
        : ['GAME OVER'];
      const fadeMs = Number.isFinite(config.fadeMs) ? Number(config.fadeMs) : 1200;
      const messageMs = Number.isFinite(config.messageMs) ? Number(config.messageMs) : 1800;
      const creditMs = Number.isFinite(config.creditMs) ? Number(config.creditMs) : 900;
      if (overlay) {
        overlay.style.transition = `opacity ${fadeMs}ms ease`;
        setEndOverlayText(overlay, '');
        requestAnimationFrame(() => { overlay.style.opacity = '1'; });
      }
      await sleep(fadeMs);
      for (const message of messages) {
        if (typeof globalThis.log === 'function') globalThis.log(message);
        if (overlay) setEndOverlayText(overlay, `<p>${escapeHtml(message)}</p>`);
        await sleep(messageMs);
      }
      const title = String(config.title ?? 'THE END');
      const safeTitle = escapeHtml(title);
      const subtitle = config.subtitle ? `<p style="font-size:.9rem;color:#6f6;">${escapeHtml(String(config.subtitle))}</p>` : '';
      if (overlay) setEndOverlayText(overlay, `<h1 style="margin:0 0 12px;">${safeTitle}</h1>${subtitle}`);
      if (typeof globalThis.log === 'function') globalThis.log(title);
      await sleep(messageMs);
      const includeGameCredits = config.includeGameCredits !== false;
      const credits = [
        ...(Array.isArray(config.credits) ? config.credits : activeModuleCredits()),
        ...(includeGameCredits ? GAME_CREDITS : [])
      ].map(normalizeCredit).filter(Boolean) as { name: string; title: string }[];
      for (const credit of credits) {
        const line = credit.title ? `${credit.name} — ${credit.title}` : credit.name;
        if (typeof globalThis.log === 'function') globalThis.log(line);
        if (overlay) setEndOverlayText(overlay, `<p style="font-size:1.2rem;margin:0;">${escapeHtml(credit.name)}</p>${credit.title ? `<p style="color:#6f6;margin:.4rem 0 0;">${escapeHtml(credit.title)}</p>` : ''}`);
        await sleep(creditMs);
      }
    }
  };
  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.actions = Actions;
  globalThis.Actions = Actions;
})();
