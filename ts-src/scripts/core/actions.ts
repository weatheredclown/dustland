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

  // The credit window is sized to show 3-4 entries at a time.
  const CREDIT_WINDOW = '12em';

  function ensureEndSequenceStyles(): void {
    if (typeof document === 'undefined') return;
    if (document.getElementById('dustlandEndSequenceStyles')) return;
    const style = document.createElement('style');
    style.id = 'dustlandEndSequenceStyles';
    style.textContent = [
      `@keyframes dustlandCreditScroll { from { transform: translateY(0); } to { transform: translateY(calc(-100% - ${CREDIT_WINDOW})); } }`,
      '@keyframes dustlandCreditPulse {',
      '  0%, 100% { opacity: .35; box-shadow: 0 0 4px rgba(110,255,140,.25); }',
      '  50% { opacity: .95; box-shadow: 0 0 12px rgba(110,255,140,.7); }',
      '}'
    ].join('\n');
    document.body.appendChild(style);
  }

  function renderCreditScroll(
    overlay: HTMLElement,
    credits: { name: string; title: string }[],
    durationMs: number
  ): void {
    ensureEndSequenceStyles();
    const entries = credits.map(credit =>
      `<div style="padding:.65em 0;">` +
      `<p style="font-size:1.2rem;margin:0;">${escapeHtml(credit.name)}</p>` +
      (credit.title ? `<p style="color:#6f6;font-size:.85rem;margin:.3rem 0 0;">${escapeHtml(credit.title)}</p>` : '') +
      `</div>`
    ).join('');
    const rule = (side: string): string =>
      `<div style="height:2px;${side};background:linear-gradient(90deg,transparent,#5f5 20%,#5f5 80%,transparent);animation:dustlandCreditPulse 2.2s ease-in-out infinite;"></div>`;
    setEndOverlayText(overlay,
      `<div style="width:min(420px,80vw);margin:0 auto;">` +
      rule('margin-bottom:.4em') +
      `<div style="position:relative;height:${CREDIT_WINDOW};overflow:hidden;` +
      `-webkit-mask-image:linear-gradient(transparent,#000 14%,#000 86%,transparent);` +
      `mask-image:linear-gradient(transparent,#000 14%,#000 86%,transparent);">` +
      `<div style="position:absolute;left:0;right:0;top:100%;animation:dustlandCreditScroll ${Math.max(1, durationMs)}ms linear forwards;">${entries}</div>` +
      `</div>` +
      rule('margin-top:.4em') +
      `</div>`
    );
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
      if (credits.length) {
        for (const credit of credits) {
          const line = credit.title ? `${credit.name} — ${credit.title}` : credit.name;
          if (typeof globalThis.log === 'function') globalThis.log(line);
        }
        // The extra beats cover the scroll's lead-in from below the window
        // and its run-out past the top delimiter.
        const scrollMs = (credits.length + 3) * creditMs;
        if (overlay) renderCreditScroll(overlay, credits, scrollMs);
        await sleep(scrollMs);
        if (overlay) setEndOverlayText(overlay, `<h1 style="margin:0 0 12px;">${safeTitle}</h1>${subtitle}`);
      }
    }
  };
  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.actions = Actions;
  globalThis.Actions = Actions;
})();
