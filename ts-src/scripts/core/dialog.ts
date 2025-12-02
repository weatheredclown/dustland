// ===== Dialog =====
const overlay = document.getElementById('overlay');
const choicesEl = document.getElementById('choices');
const textEl = document.getElementById('dialogText');
const nameEl = document.getElementById('npcName');
const titleEl = document.getElementById('npcTitle');
const portEl = document.getElementById('port');
const persistBtn = document.getElementById('persistLLM');

type DialogGlobals = DustlandGlobals & {
  Dustland?: DustlandNamespace;
  player?: PlayerState;
  party?: Party;
  state?: DustlandGameRuntimeState;
  dialogState?: DialogState | null;
  joinParty?: (member: PartyMember) => boolean;
  removeNPC?: (npc: DustlandNpc | null | undefined) => void;
  makeMember?: (
    id?: string,
    name?: string,
    role?: string,
    options?: Record<string, any>
  ) => PartyMember;
  countItems?: (idOrTag: string) => number;
  findItemIndex?: (idOrTag: string) => number;
  removeFromInv?: (index: number, quantity?: number) => void;
  applyModule?: (moduleData: any, options?: { fullReset?: boolean }) => void;
  setPartyPos?: (x: number, y: number) => void;
  setMap?: (mapId: string) => void;
  centerCamera?: (x: number, y: number, mapId?: string) => void;
  updateHUD?: () => void;
  NPCS?: DustlandNpc[];
  makeNPC?: (
    id: string,
    mapId: string,
    x: number,
    y: number,
    color?: string,
    name?: string,
    title?: string,
    desc?: string,
    tree?: Record<string, any> | null,
    quest?: DustlandNpcQuest | null,
    dialog?: any,
    extra?: any,
    options?: Record<string, any>
  ) => DustlandNpc;
  setFlag?: (flag: string, value: any) => void;
  incFlag?: (flag: string, value?: number) => void;
  flagValue?: (flag: string) => any;
  hasItem?: (idOrTag: string) => boolean;
  setGameState?: (next: any) => void;
  trackQuestDialogNode?: (npcId: string, nodeId: string) => void;
  checkFlagCondition?: (condition: any) => boolean;
  defaultQuestProcessor?: (
    npc: DustlandNpc | null | undefined,
    action: string
  ) => DustlandQuestProcessorResult | null | undefined;
  npcTemplates?: DustlandNpcTemplate[];
  world?: DustlandMap[];
  persistLlmNodes?: (tree: DustlandDialogTree | null | undefined) => void;
  EventBus?: DustlandEventBus | DustlandEventBusApi;
  setPortraitDiv?: (element: HTMLElement, npc: DustlandNpc) => void;
};

const dialogGlobals = globalThis as unknown as DialogGlobals;

type NormalizedDialogChoice = DustlandDialogChoice & {
  label?: string;
  id?: string;
};

interface NormalizedDialogNode {
  text: string;
  checks: any[];
  effects: any[];
  next: NormalizedDialogChoice[];
  jump?: DustlandDialogJumpTarget[];
  noLeave?: boolean;
  [key: string]: any;
}

type NormalizedDialogTree = Record<string, NormalizedDialogNode> & {
  locked?: NormalizedDialogNode;
};

interface DialogState {
  tree: NormalizedDialogTree | null;
  node: string | null;
}

interface QuestDialogStage {
  text: string;
  choice?: DustlandDialogChoiceConfig & { label?: string };
}

interface QuestDialogConfigNormalized {
  offer: QuestDialogStage;
  accept: QuestDialogStage;
  turnIn: QuestDialogStage;
  active: QuestDialogStage;
  completed: QuestDialogStage;
}

type DialogNpc = DustlandNpc & {
  quest?: DustlandNpcQuest | (Quest & Record<string, any>);
  processNode?: (nodeId: string | null) => void;
};

let currentNPC: DialogNpc | null = null;
Object.defineProperty(globalThis, 'currentNPC', {
  get: () => currentNPC,
  set: v => {
    currentNPC = v as DialogNpc | null;
  }
});

const dialogState: DialogState = { tree: null, node: null };
dialogGlobals.dialogState = dialogState;
let selectedChoice = 0;
const DustlandNamespace = dialogGlobals.Dustland;

if (persistBtn && typeof persistBtn === 'object' && 'onclick' in persistBtn) {
  (persistBtn as { onclick: ((this: any, ev: MouseEvent) => any) | null }).onclick = () => {
    dialogGlobals.persistLlmNodes?.(dialogState.tree as unknown as DustlandDialogTree);
    renderDialog();
  };
}

function dlgHighlightChoice(): void {
  const container = choicesEl;
  if (!container) return;
  Array.from(container.children).forEach((child, index) => {
    child.classList?.toggle?.('sel', index === selectedChoice);
  });
}

function dlgMoveChoice(dir: number): void {
  const container = choicesEl;
  if (!container) return;
  const total = container.children.length;
  if (total === 0) return;
  selectedChoice = (selectedChoice + dir + total) % total;
  dlgHighlightChoice();
}

function handleDialogKey(e: KeyboardEvent): boolean {
  if (!dialogState.tree || !choicesEl) return false;
  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'w':
    case 'W':
    case 'a':
    case 'A':
      dlgMoveChoice(-1);
      return true;
    case 'ArrowDown':
    case 'ArrowRight':
    case 's':
    case 'S':
    case 'd':
    case 'D':
      dlgMoveChoice(1);
      return true;
    case 'Enter':
    case ' ': // space
    case 'Spacebar': {
      const el = choicesEl.children[selectedChoice] as HTMLElement | undefined;
      if (el?.click) el.click();
      else el?.onclick?.(new MouseEvent('click'));
      return true;
    }
    case 'Escape':
      closeDialog();
      return true;
    default:
      return false;
  }
}

function ensureLeaveOption(node: NormalizedDialogNode | undefined): void {
  if (!node || node.noLeave) return;
  const choices = Array.isArray(node.next) ? node.next.filter(Boolean) : [];
  const hasExit = choices.some(opt => (opt?.to || opt?.id) === 'bye');
  if (!hasExit) {
    choices.push({ label: '(Leave)', to: 'bye', id: 'bye' });
  }
  node.next = choices;
}

function normalizeDialogTree(tree: any): NormalizedDialogTree {
  const source = (typeof tree === 'object' && tree) ? (tree as Record<string, any>) : {};
  const out: Record<string, NormalizedDialogNode> = {};

  for (const id in source) {
    if (!Object.prototype.hasOwnProperty.call(source, id) || id === 'imports') continue;
    const rawNode = source[id];
    if (!rawNode || typeof rawNode !== 'object') continue;
    const node = rawNode as DustlandDialogNode;
    const rawNext = Array.isArray(node.next)
      ? node.next
      : Array.isArray(node.choices)
        ? node.choices
        : [];
    const next = rawNext
      .map(entry => {
        if (typeof entry === 'string') {
          return { id: entry, label: entry } as NormalizedDialogChoice;
        }
        if (!entry || typeof entry !== 'object') return null;
        const choice = entry as DustlandDialogChoice;
        const {
          to,
          id: choiceId,
          label,
          text,
          checks = [],
          effects = [],
          ...rest
        } = choice;
        const normalized: NormalizedDialogChoice = {
          ...rest,
          to,
          id: typeof choiceId === 'string' ? choiceId : to,
          label: typeof label === 'string' ? label : typeof text === 'string' ? text : '(Continue)',
          checks: Array.isArray(checks) ? checks : [],
          effects: Array.isArray(effects) ? effects : []
        };
        if (!normalized.id && typeof to === 'string') normalized.id = to;
        return normalized;
      })
      .filter((choice): choice is NormalizedDialogChoice => Boolean(choice));

    const jumpList = node.jump;
    const jump = Array.isArray(jumpList)
      ? (jumpList
        .map(j => (typeof j === 'object' && j ? { to: j.to, if: j.if } : null))
        .filter(Boolean) as DustlandDialogJumpTarget[])
      : [];

    out[id] = {
      text: typeof node.text === 'string' ? node.text : '',
      checks: Array.isArray(node.checks) ? node.checks : [],
      effects: Array.isArray(node.effects) ? node.effects : [],
      next,
      jump,
      noLeave: !!node.noLeave
    };

    ensureLeaveOption(out[id]);
  }

  return out as NormalizedDialogTree;
}

function ensureNode(tree: NormalizedDialogTree, id: string): NormalizedDialogNode {
  if (!tree[id]) {
    tree[id] = { text: '', checks: [], effects: [], next: [] };
  }
  const node = tree[id];
  node.text = typeof node.text === 'string' ? node.text : '';
  node.checks = Array.isArray(node.checks) ? node.checks : [];
  node.effects = Array.isArray(node.effects) ? node.effects : [];
  node.next = Array.isArray(node.next) ? node.next.filter(Boolean) : [];
  return node;
}

function normalizeChoiceConfig(
  data: any,
  defaults: DustlandDialogChoiceConfig & { label?: string }
): DustlandDialogChoiceConfig & { label?: string } {
  if (!data) return { ...defaults };
  if (typeof data === 'string') return { ...defaults, label: data };
  if (typeof data === 'object') {
    const source = data as Record<string, any>;
    const result: DustlandDialogChoiceConfig & { label?: string } = {
      ...defaults,
      ...(source as DustlandDialogChoiceConfig)
    };
    if (typeof source.choice === 'string' && !result.label) result.label = source.choice;
    if (typeof source.text === 'string' && !result.label) result.label = source.text;
    if (typeof source.label !== 'string' && typeof source.name === 'string') result.label = source.name;
    delete result.choice;
    return result;
  }
  return { ...defaults };
}

function normalizeDialogStage(data: any): QuestDialogStage {
  if (!data) return { text: '' };
  if (typeof data === 'string') return { text: data };
  if (typeof data === 'object') {
    const source = data as Record<string, any>;
    const stage: QuestDialogStage = { text: '' };
    if (typeof source.text === 'string') stage.text = source.text;
    else if (typeof source.dialog === 'string') stage.text = source.dialog;
    else if (typeof source.description === 'string') stage.text = source.description;
    if (source.choice !== undefined) stage.choice = normalizeChoiceConfig(source.choice, {});
    else if (typeof source.label === 'string') stage.choice = normalizeChoiceConfig({ label: source.label }, {});
    return stage;
  }
  return { text: '' };
}

function normalizeQuestDialogConfig(dialog: any): QuestDialogConfigNormalized {
  const src = typeof dialog === 'string' ? { offer: dialog } : dialog;
  const offer = normalizeDialogStage((src as Record<string, any> | undefined)?.offer ?? (src as Record<string, any> | undefined)?.offerText ?? (src as Record<string, any> | undefined)?.start ?? (src as Record<string, any> | undefined)?.available ?? null);
  if (!offer.choice) {
    const raw = (src as Record<string, any> | undefined)?.acceptLabel ?? (src as Record<string, any> | undefined)?.offerChoice ?? null;
    if (raw) offer.choice = normalizeChoiceConfig(raw, {});
  }
  const accept = normalizeDialogStage((src as Record<string, any> | undefined)?.accept ?? (src as Record<string, any> | undefined)?.acceptText ?? null);
  if (!accept.choice) {
    const raw = (src as Record<string, any> | undefined)?.acceptChoice ?? null;
    if (raw) accept.choice = normalizeChoiceConfig(raw, {});
  }
  const turnIn = normalizeDialogStage((src as Record<string, any> | undefined)?.turnIn ?? (src as Record<string, any> | undefined)?.turnin ?? (src as Record<string, any> | undefined)?.turnInText ?? (src as Record<string, any> | undefined)?.turninText ?? null);
  if (!turnIn.choice) {
    const raw =
      (src as Record<string, any> | undefined)?.turnInChoice ??
      (src as Record<string, any> | undefined)?.turnInLabel ??
      (src as Record<string, any> | undefined)?.turninChoice ??
      (src as Record<string, any> | undefined)?.turninLabel ??
      null;
    if (raw) turnIn.choice = normalizeChoiceConfig(raw, {});
  }
  const active = normalizeDialogStage((src as Record<string, any> | undefined)?.active ?? (src as Record<string, any> | undefined)?.activeText ?? (src as Record<string, any> | undefined)?.progress ?? null);
  const completed = normalizeDialogStage(
    (src as Record<string, any> | undefined)?.completed ??
    (src as Record<string, any> | undefined)?.completedText ??
    (src as Record<string, any> | undefined)?.complete ??
    (src as Record<string, any> | undefined)?.completeText ??
    null
  );
  return {
    offer,
    accept,
    turnIn,
    active,
    completed
  };
}

function getDialogQuest(npc: DialogNpc | null): DustlandNpcQuest | null {
  const quest = npc?.quest;
  if (!quest || typeof quest !== 'object') return null;
  return quest as DustlandNpcQuest;
}

function applyQuestDialog(tree: NormalizedDialogTree, npc: DialogNpc | null): void {
  const quest = getDialogQuest(npc);
  if (!quest) return;

  const qConfig = normalizeQuestDialogConfig(quest.dialog);
  const offer = qConfig.offer || { text: '' };
  const acceptCfg = qConfig.accept || { text: '' };
  const turnCfg = qConfig.turnIn || { text: '' };
  const activeCfg = qConfig.active || { text: '' };
  const completedCfg = qConfig.completed || { text: '' };
  const status = typeof quest.status === 'string' ? quest.status : 'available';

  const startNode = ensureNode(tree, 'start');
  const acceptNode = ensureNode(tree, 'accept');
  const turnNode = ensureNode(tree, 'do_turnin');

  const acceptChoiceDefaults: DustlandDialogChoiceConfig & { label?: string } = { label: '(Accept quest)' };
  const turnChoiceDefaults: DustlandDialogChoiceConfig & { label?: string } = { label: '(Turn in quest)' };
  const acceptChoiceConfig = acceptCfg.choice || offer.choice;
  const turnChoiceConfig = turnCfg.choice;
  const acceptChoice = normalizeChoiceConfig(acceptChoiceConfig, acceptChoiceDefaults);
  const turnChoice = normalizeChoiceConfig(turnChoiceConfig, turnChoiceDefaults);

  acceptNode.text = typeof acceptCfg.text === 'string' && acceptCfg.text ? acceptCfg.text : acceptNode.text || 'Good luck.';
  turnNode.text = typeof turnCfg.text === 'string' && turnCfg.text ? turnCfg.text : turnNode.text || 'Thanks for helping.';

  let stageText = '';
  if (status === 'available') stageText = offer.text || '';
  else if (status === 'active') stageText = activeCfg.text || offer.text || '';
  else stageText = completedCfg.text || activeCfg.text || offer.text || '';
  if (stageText) startNode.text = stageText;

  const others = (startNode.next || []).filter(opt => opt && opt.q !== 'accept' && opt.q !== 'turnin');
  const questChoices: NormalizedDialogChoice[] = [];
  if (status === 'available') {
    questChoices.push({ ...acceptChoice, to: 'accept', q: 'accept' });
  }
  if (Object.keys(turnChoice).length) {
    questChoices.push({ ...turnChoice, to: 'do_turnin', q: 'turnin' });
  }
  startNode.next = [...questChoices, ...others];

  ensureLeaveOption(startNode);
  ensureLeaveOption(acceptNode);
  ensureLeaveOption(turnNode);
}

function runEffects(effects: any[]): void {
  for (const eff of effects || []) {
    if (typeof eff === 'function') {
      (eff as (ctx: Record<string, any>) => void)({
        player: dialogGlobals.player,
        party: dialogGlobals.party,
        state: dialogGlobals.state
      });
    } else if (eff && typeof eff === 'object' && DustlandNamespace?.effects?.apply) {
      DustlandNamespace.effects.apply([eff], {
        player: dialogGlobals.player,
        party: dialogGlobals.party,
        state: dialogGlobals.state
      });
    }
  }
}

interface DialogCheckConfig {
  stat?: string;
  dc?: number;
  onSuccess?: any;
  onFail?: any;
  [key: string]: any;
}

function resolveCheck(
  check: DialogCheckConfig,
  actorParam?: PartyMember,
  rng: () => number = Math.random
): { success: boolean; roll: number; dc: number; stat?: string } {
  const stat = typeof check.stat === 'string' ? check.stat : '';
  const leader = dialogGlobals.party?.leader?.();
  const fallbackMember = dialogGlobals.party?.[0];
  const effectiveActor =
    actorParam ??
    (leader as unknown as PartyMember | undefined) ??
    (fallbackMember as unknown as PartyMember | undefined);
  if (!effectiveActor) {
    return { success: true, roll: 0, dc: 0, stat };
  }
  const roll = Dice.skill(effectiveActor, stat, 0, ROLL_SIDES, rng);
  const dc = typeof check.dc === 'number' ? check.dc : 0;
  const success = roll >= dc;
  log?.(`Check ${stat} rolled ${roll} vs DC ${dc}: ${success ? 'success' : 'fail'}`);
  runEffects(success ? (Array.isArray(check.onSuccess) ? check.onSuccess : []) : Array.isArray(check.onFail) ? check.onFail : []);
  return { success, roll, dc, stat };
}

function processQuestFlag(choice: NormalizedDialogChoice): DustlandQuestProcessorResult | null {
  if (!currentNPC?.quest || !choice?.q) return null;
  if (choice.q === 'accept') return dialogGlobals.defaultQuestProcessor?.(currentNPC, 'accept') ?? null;
  if (choice.q === 'turnin') return dialogGlobals.defaultQuestProcessor?.(currentNPC, 'do_turnin') ?? null;
  return null;
}

function dialogJoinParty(join: Record<string, any> | undefined): void {
  if (!join) return;
  const opts: Record<string, any> = {};
  const joinData = join as { id?: string; name?: string; role?: string; portraitSheet?: string };
  if (joinData.portraitSheet) {
    opts.portraitSheet = joinData.portraitSheet;
  } else if (currentNPC?.portraitSheet) {
    opts.portraitSheet = currentNPC.portraitSheet;
  }
  const makeMemberFn = dialogGlobals.makeMember;
  const joinPartyFn = dialogGlobals.joinParty;
  const removeNpcFn = dialogGlobals.removeNPC;
  if (!makeMemberFn || !joinPartyFn) return;
  const member = makeMemberFn(joinData.id, joinData.name, joinData.role, opts);
  if (joinPartyFn(member)) {
    removeNpcFn?.(currentNPC);
  }
}

function handleGoto(gotoConfig: DustlandDialogGoto | undefined): void {
  if (!gotoConfig) return;
  const tgtNPC = gotoConfig.target === 'npc' ? currentNPC : null;
  const partyRoster = dialogGlobals.party;
  const runtimeState = dialogGlobals.state;
  const worldMaps = dialogGlobals.world ?? [];
  const applyModuleFn = dialogGlobals.applyModule;
  const setPartyPosFn = dialogGlobals.setPartyPos;
  const setMapFn = dialogGlobals.setMap;
  const centerCameraFn = dialogGlobals.centerCamera;
  const updateHudFn = dialogGlobals.updateHUD;
  const base = tgtNPC || partyRoster;
  if (!base) return;
  const baseX = (base as { x?: number }).x ?? 0;
  const baseY = (base as { y?: number }).y ?? 0;
  const x = gotoConfig.rel ? baseX + (gotoConfig.x || 0) : gotoConfig.x != null ? gotoConfig.x : baseX;
  const y = gotoConfig.rel ? baseY + (gotoConfig.y || 0) : gotoConfig.y != null ? gotoConfig.y : baseY;
  if (tgtNPC) {
    if (gotoConfig.map) tgtNPC.map = gotoConfig.map;
    tgtNPC.x = x;
    tgtNPC.y = y;
    if (tgtNPC._loop) {
      tgtNPC._loop.path = [];
      tgtNPC._loop.job = null;
    }
  } else {
    if (gotoConfig.map === 'world') {
      if (!worldMaps.length) applyModuleFn?.({});
      setPartyPosFn?.(x, y);
      setMapFn?.('world');
    } else {
      setPartyPosFn?.(x, y);
      if (gotoConfig.map) setMapFn?.(gotoConfig.map);
      else centerCameraFn?.(partyRoster?.x ?? x, partyRoster?.y ?? y, runtimeState?.map);
    }
  }
  updateHudFn?.();
}

function calcCombatXP(npc: DialogNpc): number {
  const enemies: Array<DialogNpc['combat']> = [npc.combat || {}];
  const partyRoster = dialogGlobals.party;
  const runtimeState = dialogGlobals.state;
  const px = partyRoster?.x ?? 0;
  const py = partyRoster?.y ?? 0;
  const map = partyRoster?.map || runtimeState?.map;
  const npcList = dialogGlobals.NPCS ?? [];
  for (const n of npcList) {
    if (n === npc || !n.combat) continue;
    if (n.map !== map) continue;
    const dist = Math.abs((n.x || 0) - px) + Math.abs((n.y || 0) - py);
    if (dist <= 2) enemies.push(n.combat);
  }
  const partyMembers = partyRoster ?? ([] as unknown as Party);
  const avgLvl = Math.max(
    1,
    partyMembers.reduce((sum, member) => sum + (member.lvl || 1), 0) /
    (partyMembers.length || 1)
  );
  let xp = 0;
  for (const combat of enemies) {
    if (!combat) continue;
    const override = Number.isFinite(combat.xp) ? (combat.xp as number) : null;
    if (override != null) {
      xp += override;
      continue;
    }
    const count = Math.max(1, (combat.count as number | undefined) || 1);
    const str = (combat.challenge as number | undefined) || (combat.hp as number | undefined) || (combat.HP as number | undefined) || 1;
    xp += count * Math.max(1, Math.ceil(str / avgLvl));
  }
  return xp;
}

function getNextId(prefix: string, arr: Array<{ id?: string }>): string {
  let i = 1;
  while (arr.some(o => o.id === `${prefix}${i}`)) i++;
  return `${prefix}${i}`;
}

interface AdvanceResult {
  next: string | null;
  text: string | null;
  close: boolean;
  success: boolean;
  retriable: boolean;
}

function advanceDialog(stateObj: DialogState, choiceIdx: number): AdvanceResult {
  const prevNode = stateObj.node;
  if (!stateObj.tree || !prevNode) {
    stateObj.node = null;
    return { next: null, text: null, close: true, success: false, retriable: false };
  }
  const node = stateObj.tree[prevNode];
  if (!node) {
    stateObj.node = null;
    return { next: null, text: null, close: true, success: false, retriable: false };
  }
  const choice = node.next[choiceIdx];
  if (!choice) {
    stateObj.node = null;
    return { next: null, text: null, close: true, success: false, retriable: false };
  }

  const playerState = dialogGlobals.player;
  const playerInv = Array.isArray(playerState?.inv) ? playerState!.inv : [];
  const countItemsFn = dialogGlobals.countItems;
  const findItemIndexFn = dialogGlobals.findItemIndex;
  const removeFromInvFn = dialogGlobals.removeFromInv;
  const runtimeState = dialogGlobals.state;
  const npcList = dialogGlobals.NPCS;
  const npcTemplates = dialogGlobals.npcTemplates ?? [];

  const getCount = (key: string | undefined, fallback = 0) =>
    key ? countItemsFn?.(key) ?? fallback : fallback;

  runEffects(choice.checks ?? []);

  const finalize = (
    text: string | null,
    ok: boolean,
    retriable = false
  ): AdvanceResult => {
    const result: AdvanceResult = {
      next: null,
      text,
      close: true,
      success: !!ok,
      retriable: !!retriable
    };
    stateObj.node = null;
    return result;
  };

  if (choice.reqItem || choice.reqSlot || choice.reqTag) {
    const requiredCount = choice.reqCount || 1;
    const hasEnough = choice.reqItem
      ? getCount(choice.reqItem) >= requiredCount
      : choice.reqSlot
        ? playerInv.some(it => it.type === choice.reqSlot)
        : getCount(choice.reqTag) >= requiredCount;

    if (!hasEnough) {
      return finalize(choice.failure || 'You lack the required item.', false, true);
    }
    DustlandNamespace?.actions?.applyQuestReward?.(choice.reward);
    dialogJoinParty(choice.join);
    processQuestFlag(choice);
    runEffects(choice.effects ?? []);
    if (choice.goto) {
      handleGoto(choice.goto);
      return { next: null, text: null, close: true, success: true, retriable: false };
    }
    const nextId = choice.to || choice.id;
    if (nextId) {
      stateObj.node = nextId;
      return { next: nextId, text: null, close: false, success: true, retriable: false };
    }
    return finalize(choice.success || '', true);
  }

  if (choice.costItem || choice.costSlot || choice.costTag) {
    const costCount = choice.costCount || 1;
    const hasEnough = choice.costItem
      ? getCount(choice.costItem) >= costCount
      : choice.costSlot
        ? playerInv.some(it => it.type === choice.costSlot)
        : getCount(choice.costTag) >= costCount;

    if (!hasEnough) {
      return finalize(choice.failure || 'You lack the required item.', false, true);
    }

    if (choice.costItem) {
      for (let i = 0; i < costCount; i++) {
        const itemIdx = findItemIndexFn?.(choice.costItem ?? '') ?? -1;
        if (itemIdx > -1) removeFromInvFn?.(itemIdx);
      }
    } else if (choice.costSlot) {
      const itemIdx = playerInv.findIndex(it => it.type === choice.costSlot);
      if (itemIdx > -1) removeFromInvFn?.(itemIdx);
    } else if (choice.costTag) {
      for (let i = 0; i < costCount; i++) {
        const itemIdx = findItemIndexFn?.(choice.costTag ?? '') ?? -1;
        if (itemIdx > -1) removeFromInvFn?.(itemIdx);
      }
    }

    DustlandNamespace?.actions?.applyQuestReward?.(choice.reward);
    dialogJoinParty(choice.join);
    processQuestFlag(choice);
    runEffects(choice.effects ?? []);
    if (choice.goto) {
      handleGoto(choice.goto);
      return { next: null, text: null, close: true, success: true, retriable: false };
    }
    const nextId = choice.to || choice.id;
    if (nextId) {
      stateObj.node = nextId;
      return { next: nextId, text: null, close: false, success: true, retriable: false };
    }
    return finalize(choice.success || '', true);
  }

  if (choice.check) {
    const { success, roll, dc } = resolveCheck(choice.check);
    log?.(`Dialog check ${choice.check.stat}: ${roll} vs ${dc}`);
    if (!success) {
      return finalize(choice.failure || 'Failed.', false);
    }
  }

  DustlandNamespace?.actions?.applyQuestReward?.(choice.reward);
  dialogJoinParty(choice.join);
  const questResult = processQuestFlag(choice);
  if (questResult?.blocked) {
    const msg = typeof questResult.message === 'string' && questResult.message
      ? questResult.message
      : 'You’re not done yet.';
    stateObj.node = prevNode;
    return {
      next: prevNode,
      text: msg,
      close: false,
      success: false,
      retriable: true
    };
  }
  runEffects(choice.effects ?? []);

  if (choice.setFlag) {
    const { flag, op, value } = choice.setFlag;
    if (op === 'set') {
      dialogGlobals.setFlag?.(flag, value);
    } else if (op === 'add') {
      dialogGlobals.incFlag?.(flag, value as number | undefined);
    } else if (op === 'clear') {
      DustlandNamespace?.eventFlags?.clear?.(flag);
    }
  }

  if (choice.spawn) {
    const template = npcTemplates.find(t => t.id === choice.spawn?.templateId);
    if (template && runtimeState?.map && dialogGlobals.makeNPC) {
      const id = getNextId(template.id, npcList ?? []);
      const x = choice.spawn.x;
      const y = choice.spawn.y;
      const combat = template.combat ? { ...template.combat } : {};
      if (choice.spawn.challenge) {
        combat.HP = choice.spawn.challenge;
        combat.challenge = choice.spawn.challenge;
      }
      const npc = dialogGlobals.makeNPC(
        id,
        runtimeState.map,
        x,
        y,
        template.color,
        template.name,
        '',
        template.desc,
        {},
        null,
        null,
        null,
        {
          combat,
          portraitSheet: template.portraitSheet,
          portraitLock: template.portraitLock
        }
      );
      npcList?.push(npc);
    }
  }

  if (choice.q === 'accept' && currentNPC?.quest) {
    const meta = currentNPC.quest as DustlandNpcQuest;
    const requiredCount = meta.count || 1;
    const itemKey = meta.itemTag || meta.item;
    const hasItems = !itemKey || getCount(itemKey) >= requiredCount;
    const flagValueFn = dialogGlobals.flagValue;
    const hasFlag = !meta.reqFlag || (typeof flagValueFn === 'function' && flagValueFn(meta.reqFlag));
    if (meta.status === 'active' && hasItems && hasFlag) {
      stateObj.node = prevNode;
      return { next: prevNode, text: null, close: false, success: true, retriable: false };
    }
  }

  if (choice.applyModule) {
    const moduleData = (dialogGlobals as Record<string, any>)[choice.applyModule];
    if (moduleData) {
      dialogGlobals.applyModule?.(moduleData, { fullReset: false });
    } else {
      console.error(`Module ${choice.applyModule} not found in global scope.`);
    }
  }

  if (choice.goto) {
    handleGoto(choice.goto);
    return { next: null, text: null, close: true, success: true, retriable: false };
  }

  const nextId = choice.to || choice.id;
  if (nextId) {
    stateObj.node = nextId;
    return { next: nextId, text: null, close: false, success: true, retriable: false };
  }

  return finalize(choice.text || '', true);
}

const onceChoiceStore = globalThis as typeof globalThis & { usedOnceChoices?: Set<string> };
const onceChoices = onceChoiceStore.usedOnceChoices ?? new Set<string>();
if (!onceChoiceStore.usedOnceChoices) {
  onceChoiceStore.usedOnceChoices = onceChoices;
}

function setPortrait(portElement: HTMLElement | null, npc: DialogNpc): void {
  if (!portElement) return;
  if (!npc.portraitSheet) {
    portElement.style.backgroundImage = '';
    portElement.style.background = npc.color || '#274227';
    return;
  }
  dialogGlobals.setPortraitDiv?.(portElement, npc);
}

function openDialog(npc: DialogNpc, node = 'start'): void {
  currentNPC = npc;
  const rawTree = typeof npc.tree === 'function' ? npc.tree() : npc.tree;
  dialogState.tree = normalizeDialogTree(rawTree || {});
  applyQuestDialog(dialogState.tree, npc);
  dialogState.node = node;
  if (npc.unlockTime && Date.now() >= npc.unlockTime) {
    npc.locked = false;
    npc.unlockTime = null;
  }
  if (npc.locked && dialogState.tree.locked) {
    dialogState.node = 'locked';
  }
  if (nameEl) nameEl.textContent = npc.name || '';
  if (titleEl) titleEl.textContent = npc.title || '';

  setPortrait(portEl, npc);

  const desc = npc.desc;
  if (desc && titleEl) {
    const small = document.createElement('div');
    small.className = 'small npcdesc';
    small.textContent = desc;
    const header = titleEl.parentElement;
    if (header) {
      Array.from(header.querySelectorAll('.small.npcdesc')).forEach(n => n.remove());
      header.appendChild(small);
    }
  }

  renderDialog();
  dialogGlobals.EventBus?.emit?.('music:mood', { id: 'dialog', source: 'dialog', priority: 60 });
  overlay?.classList.add('shown');
  dialogGlobals.setGameState?.(GAME_STATE.DIALOG);
}

function closeDialog(): void {
  dialogGlobals.EventBus?.emit?.('music:mood', { id: null, source: 'dialog' });
  overlay?.classList.remove('shown');
  currentNPC = null;
  dialogState.tree = null;
  dialogState.node = null;
  if (choicesEl) choicesEl.innerHTML = '';
  const mapId = dialogGlobals.state?.map;
  const back = mapId === 'world' ? GAME_STATE.WORLD : GAME_STATE.INTERIOR;
  dialogGlobals.setGameState?.(back);
}

function renderDialog(): void {
  if (!dialogState.tree || !choicesEl || !textEl) return;
  currentNPC?.processNode?.(dialogState.node);
  if (currentNPC?.id && dialogState.node) {
    dialogGlobals.trackQuestDialogNode?.(currentNPC.id, dialogState.node);
  }
  if (!dialogState.tree || !dialogState.node) return;
  const node = dialogState.tree[dialogState.node];
  if (!node) {
    closeDialog();
    return;
  }

  const checkCondition = dialogGlobals.checkFlagCondition;
  if (node.jump && node.jump.length) {
    const tgt = node.jump.find(j => {
      if (!j.if) return true;
      return checkCondition ? checkCondition(j.if) : true;
    });
    if (tgt?.to) {
      dialogState.node = tgt.to;
      renderDialog();
      return;
    }
  }

  runEffects(node.checks ?? []);
  runEffects(node.effects ?? []);

  textEl.textContent = node.text;
  choicesEl.innerHTML = '';

  if (!node.next || node.next.length === 0) {
    const cont = document.createElement('div');
    cont.className = 'choice';
    cont.textContent = '(Continue)';
    cont.onclick = () => closeDialog();
    choicesEl.appendChild(cont);
    selectedChoice = 0;
    dlgHighlightChoice();
    return;
  }

  let choices = node.next.map((opt, idx) => ({ opt, idx }));

  choices = choices.filter(({ opt }) => {
    if (!opt.if) return true;
    return checkCondition ? checkCondition(opt.if) : true;
  });

  choices = choices.filter(({ opt }) => {
    const cond = opt.ifOnce as { node?: string; label?: string; used?: boolean } | undefined;
    if (!cond) return true;
    const nodeId = cond.node;
    const label = cond.label;
    if (!nodeId || !label || !currentNPC) return true;
    const key = `${currentNPC.id}::${nodeId}::${label}`;
    const used = cond.used === true;
    const seen = onceChoices.has(key);
    return used ? seen : !seen;
  });

  const hasItemFn = dialogGlobals.hasItem;
  if (currentNPC?.quest) {
    const meta = currentNPC.quest as DustlandNpcQuest;
    const itemKey = meta.itemTag || meta.item;
    const hasDialogGoals = Array.isArray(meta.dialogNodes) && meta.dialogNodes.length > 0;
    const progress = typeof meta.progress === 'number' ? meta.progress : 0;
    const requiredCount = meta.count || (hasDialogGoals ? meta.dialogNodes.length || 1 : 1);
    choices = choices.filter(({ opt }) => {
      if (opt.q === 'accept' && meta.status !== 'available') return false;
      if (opt.q === 'turnin') {
        if (meta.status !== 'active') return false;
        if (itemKey && !hasItemFn?.(itemKey)) return false;
        if (!itemKey && hasDialogGoals && progress < requiredCount) return false;
      }
      return true;
    });
  }

  choices = choices.filter(({ opt }) => {
    if (!opt.once || !currentNPC || !dialogState.node) return true;
    const key = `${currentNPC.id}::${dialogState.node}::${opt.label}`;
    return !onceChoices.has(key);
  });

  const isExit = (opt: NormalizedDialogChoice) => opt.to === 'bye';
  choices.sort((a, b) => {
    const aExit = isExit(a.opt);
    const bExit = isExit(b.opt);
    return aExit === bExit ? 0 : aExit ? 1 : -1;
  });

  choices.forEach(({ opt, idx }) => {
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = opt.label || '(Continue)';
    if (opt.to === 'do_fight' && currentNPC?.combat) {
      const xp = calcCombatXP(currentNPC);
      div.textContent = `${opt.label} (${xp} XP)`;
    }
    div.onclick = () => {
      if (!currentNPC || !dialogState.node) return;
      const key = `${currentNPC.id}::${dialogState.node}::${opt.label}`;
      const result = advanceDialog(dialogState, idx);
      if (opt.once && !result.retriable) onceChoices.add(key);
      if (result && result.text !== null) {
        textEl.textContent = result.text;
        choicesEl.innerHTML = '';
        const cont = document.createElement('div');
        cont.className = 'choice';
        cont.textContent = '(Continue)';
        cont.onclick = () => {
          if (result.close) closeDialog();
          else {
            dialogState.node = result.next;
            renderDialog();
          }
        };
        choicesEl.appendChild(cont);
      } else {
        if (result && result.close) closeDialog();
        else renderDialog();
      }
    };
    choicesEl.appendChild(div);
  });
  selectedChoice = 0;
  dlgHighlightChoice();
}

const dialogExports = {
  overlay,
  choicesEl,
  textEl,
  nameEl,
  titleEl,
  portEl,
  openDialog,
  closeDialog,
  renderDialog,
  advanceDialog,
  resolveCheck,
  handleDialogKey,
  handleGoto
};

Object.assign(globalThis, dialogExports);
