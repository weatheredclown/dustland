// ===== NPCs =====
type NpcDialogChoice = DustlandDialogChoice & { sellIndex?: number };

interface NpcDialogNode extends DustlandDialogNode {
  choices?: NpcDialogChoice[];
}

type NpcDialogTree = Record<string, NpcDialogNode>;

interface ShopInventoryEntry {
  id?: string;
  count?: number;
  [key: string]: any;
}

type ShopConfig =
  | true
  | {
    inv?: ShopInventoryEntry[];
    [key: string]: any;
  };

type NpcProcessNode = (this: NpcEntity, node: string | null) => void;
type NpcProcessChoice = (this: NpcEntity, choice: NpcDialogChoice) => void;

interface CombatNpc extends DustlandNpc {
  stats?: Record<string, number>;
  maxHp?: number;
  hp?: number;
  lvl?: number;
}

interface NpcConstructorOptions extends DustlandNpc {
  id: string;
  map: string;
  x: number;
  y: number;
  tree?: NpcDialogTree | null;
  quest?: DustlandNpcQuest | Quest | null;
  quests?: Array<DustlandNpcQuest | Quest | null | undefined> | null;
  questDialogs?: string[] | null;
  processNode?: NpcProcessNode | null;
  processChoice?: NpcProcessChoice | null;
  combat?: DustlandNpc['combat'] | null;
  shop?: ShopConfig | false | null;
  workbench?: boolean;
  portraitSheet?: string | null;
  portraitLock?: boolean;
  symbol?: string;
  door?: boolean;
  locked?: boolean;
  prompt?: string | null;
  unlockTime?: number | null;
  questIdx?: number;
  trainer?: string | null;
  overrideColor?: boolean;
}

interface NanoDialogApi {
  queueForNPC: (npc: DustlandNpc, nodeId?: string, reason?: string) => void;
}

type QuestRegistry = Record<string, Quest | DustlandNpcQuest | null | undefined>;

type BaseStatsFactory = () => Record<string, number>;

type EnemyPresetRegistry = Record<string, string[] | undefined>;

type NpcGlobals = DustlandGlobals & {
  Dustland?: DustlandNamespace & {
    actions?: DustlandActionsApi;
    openShop?: (npc: DustlandNpc) => void;
    openWorkbench?: () => void;
    gameState?: DustlandGameState;
  };
  player?: PlayerState;
  removeFromInv?: (index: number, quantity?: number) => void;
  renderInv?: () => void;
  updateHUD?: () => void;
  textEl?: HTMLElement | null;
  CURRENCY?: string;
  dialogState?: { node: string | null } & Record<string, any>;
  renderDialog?: () => void;
  closeDialog?: () => void;
  defaultQuestProcessor?: (npc: DustlandNpc | null | undefined, node: string | null) => void;
  state?: (DustlandCoreState & { map: string }) | null;
  NanoDialog?: NanoDialogApi | null;
  quests?: QuestRegistry;
  baseStats?: BaseStatsFactory;
  enemyPresets?: EnemyPresetRegistry;
};

const npcGlobals = globalThis as unknown as NpcGlobals;
const NPC_COLOR = '#9ef7a0';
const OBJECT_COLOR = '#225a20';

class NpcEntity implements DustlandNpc {
  id: string;
  map: string;
  x: number;
  y: number;
  color?: string;
  name?: string;
  title?: string;
  desc?: string;
  tree: NpcDialogTree;
  quest: DustlandNpcQuest | Quest | null;
  quests?: Array<DustlandNpcQuest | Quest | null> | null;
  questDialogs?: string[] | null;
  processNode?: NpcProcessNode;
  processChoice?: NpcProcessChoice;
  combat?: DustlandNpc['combat'] | null;
  shop?: ShopConfig | false | null;
  workbench?: boolean;
  portraitSheet?: string | null;
  portraitLock?: boolean;
  symbol?: string;
  door?: boolean;
  locked?: boolean;
  prompt?: string | null;
  unlockTime?: number | null;
  questIdx: number;
  trainer?: string | null;
  overrideColor?: boolean;
  [key: string]: any;

  constructor({
    id,
    map,
    x,
    y,
    color,
    name,
    title,
    desc,
    tree,
    quest = null,
    quests = null,
    questDialogs = null,
    processNode = null,
    processChoice = null,
    combat = null,
    shop = false,
    workbench = false,
    portraitSheet = null,
    portraitLock = true,
    symbol = '!',
    door = false,
    locked = false,
    prompt = null,
    unlockTime = null,
    questIdx = 0,
    trainer = null,
    overrideColor = false
  }: NpcConstructorOptions) {
    this.id = id;
    this.map = map;
    this.x = x;
    this.y = y;
    this.color = color;
    this.name = name;
    this.title = title;
    this.desc = desc;
    this.tree = tree ?? { start: { text: '', choices: [{ label: '(Leave)', to: 'bye' }] } };
    this.quest = quest;
    this.quests = quests;
    this.questDialogs = questDialogs;
    this.processNode = undefined;
    this.processChoice = undefined;
    this.combat = combat;
    this.shop = shop;
    this.workbench = workbench;
    this.portraitSheet = portraitSheet;
    this.portraitLock = portraitLock ?? true;
    this.symbol = symbol;
    this.door = door;
    this.locked = locked;
    this.prompt = prompt;
    this.unlockTime = unlockTime;
    this.questIdx = questIdx ?? 0;
    this.trainer = trainer;
    this.overrideColor = overrideColor;

    if (Array.isArray(this.quests) && !this.quest) {
      this.quest = this.quests[this.questIdx] ?? null;
    }
    if (Array.isArray(this.questDialogs) && this.questDialogs.length) {
      const startNode = this.tree.start ?? (this.tree.start = { text: '', choices: [] });
      startNode.text = this.questDialogs[this.questIdx] ?? startNode.text;
    }
    const questData = this.quest;
    if (questData && typeof questData === 'object' && 'status' in questData && questData.status === undefined) {
      questData.status = 'available';
    }
    const capNode = (node: string | null): void => {
      if (this.combat && node === 'do_fight') {
        npcGlobals.closeDialog?.();
        const combatSource = this.combat ?? {};
        const combatant = {
          ...combatSource,
          npc: this as DustlandNpc,
          name: this.name ?? 'Opponent',
          hp: Math.max(
            0,
            Number((combatSource as { hp?: number }).hp ?? (combatSource as { HP?: number }).HP ?? 0)
          )
        };
        Dustland?.actions?.startCombat?.(combatant as CombatParticipant);
      } else if (this.shop && node === 'sell') {
        const player = npcGlobals.player;
        const inventory = Array.isArray(player?.inv) ? player.inv : [];
        const currency = npcGlobals.CURRENCY ?? 'scrap';
        const items: NpcDialogChoice[] = inventory.map((it, idx): NpcDialogChoice => {
          const price = typeof it.scrap === 'number' ? it.scrap : Math.max(1, it.value ?? 0);
          const qty = Math.max(1, Number.isFinite(it?.count) ? (it.count as number) : 1);
          const itemName = qty > 1 ? `${it.name} x${qty}` : it.name;
          return { label: `Sell ${itemName} (${price} ${currency})`, to: 'sell', sellIndex: idx };
        });
        const sellNode = (this.tree.sell ??= { text: '', choices: [] });
        sellNode.text = items.length ? 'What are you selling?' : 'Nothing to sell.';
        items.push({ label: '(Back)', to: 'start' });
        sellNode.choices = items;
      } else if (this.shop && node === 'buy') {
        npcGlobals.closeDialog?.();
        const openShop = npcGlobals.Dustland?.openShop;
        if (typeof openShop === 'function') {
          openShop(this);
        }
        return;
      } else if (this.workbench && node === 'start') {
        npcGlobals.closeDialog?.();
        Dustland?.openWorkbench?.();
        return;
      }
    };
    const capChoice = (choice: NpcDialogChoice): boolean => {
      if (this.shop && typeof choice.sellIndex === 'number') {
        const player = npcGlobals.player;
        if (!player) return false;
        const item = player.inv[choice.sellIndex];
        if (!item) return false;
        const value = typeof item.scrap === 'number' ? item.scrap : Math.max(1, item.value ?? 0);
        player.scrap = (player.scrap ?? 0) + value;
        npcGlobals.removeFromInv?.(choice.sellIndex);
        const shopData = this.shop;
        if (shopData && typeof shopData === 'object' && Array.isArray(shopData.inv)) {
          const existing = shopData.inv.find(
            entry => entry?.id === item.id && Math.max(1, Number.isFinite(entry?.count) ? Number(entry?.count) : 1) < 256
          );
          if (existing) {
            const current = Math.max(1, Number.isFinite(existing.count) ? Number(existing.count) : 1);
            existing.count = Math.min(256, current + 1);
          } else {
            shopData.inv.push({ id: item.id, count: 1 });
          }
        }
        npcGlobals.renderInv?.();
        npcGlobals.updateHUD?.();
        const textElement = npcGlobals.textEl;
        if (textElement) {
          textElement.textContent = `Sold ${item.name} for ${value} ${npcGlobals.CURRENCY ?? 'scrap'}.`;
        }
        if (npcGlobals.dialogState) {
          npcGlobals.dialogState.node = 'sell';
        }
        npcGlobals.renderDialog?.();
        return true;
      }
      return false;
    };
    const userPN = processNode ?? null;
    this.processNode = (node: string | null) => {
      if (this.quest) {
        npcGlobals.defaultQuestProcessor?.(this, node);
      }
      capNode(node);
      userPN?.call(this, node);
    };
    const userPC = processChoice ?? null;
    if (userPC) {
      this.processChoice = (choice: NpcDialogChoice) => {
        if (capChoice(choice)) return;
        userPC.call(this, choice);
      };
    } else {
      this.processChoice = (choice: NpcDialogChoice) => {
        capChoice(choice);
      };
    }
  }

  remember(key: string, value: any): void {
    Dustland?.gameState?.rememberNPC?.(this.id, key, value);
  }

  recall(key: string): any {
    return Dustland?.gameState?.recallNPC?.(this.id, key);
  }
}

function cloneShopData(shop: ShopConfig | false | null | undefined): ShopConfig | null {
  if (shop === true) return true;
  if (!shop || typeof shop !== 'object') return null;
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(shop) as ShopConfig;
    } catch (err) {
      // fall back to JSON copy
    }
  }
  try {
    return JSON.parse(JSON.stringify(shop)) as ShopConfig;
  } catch (err) {
    const clone: ShopConfig = { ...shop };
    if (Array.isArray(shop.inv)) {
      clone.inv = shop.inv.map(entry => (entry && typeof entry === 'object' ? { ...entry } : entry)) as ShopInventoryEntry[];
    }
    return clone;
  }
}

function makeNPC(
  id: string,
  map: string,
  x: number,
  y: number,
  color: string | undefined,
  name: string | undefined,
  title: string | undefined,
  desc: string | undefined,
  tree: NpcDialogTree | null | undefined,
  quest: DustlandNpcQuest | Quest | null | undefined,
  processNode: NpcProcessNode | null | undefined,
  processChoice: NpcProcessChoice | null | undefined,
  opts: Partial<NpcConstructorOptions> | null | undefined
): NpcEntity {
  let nextTree = tree ?? null;
  if (opts?.combat) {
    nextTree = nextTree ?? {};
    const start = (nextTree.start ??= { text: '', choices: [] });
    start.choices = start.choices ?? [];
    let fightChoice = start.choices.find(choice => choice.label === '(Fight)' || choice.to === 'do_fight');
    if (fightChoice) {
      fightChoice.label = '(Fight)';
      fightChoice.to = 'do_fight';
    } else {
      fightChoice = { label: '(Fight)', to: 'do_fight' };
      start.choices.unshift(fightChoice);
    }
    start.choices = start.choices.filter(choice => choice === fightChoice || choice.label !== '(Fight)');
    nextTree.do_fight = nextTree.do_fight ?? { text: '', choices: [{ label: '(Continue)', to: 'bye' }] };
  }
  if (opts?.shop) {
    nextTree = nextTree ?? {};
    const start = (nextTree.start ??= { text: '', choices: [] });
    start.choices = start.choices ?? [];
    if (!start.choices.some(choice => choice.to === 'sell')) {
      start.choices.push({ label: '(Sell items)', to: 'sell' });
    }
    nextTree.sell = nextTree.sell ?? { text: 'What are you selling?', choices: [] };
  }
  if (opts?.trainer) {
    nextTree = nextTree ?? {};
    const start = (nextTree.start ??= { text: '', choices: [] });
    start.choices = start.choices ?? [];
    if (!start.choices.some(choice => choice.to === 'train')) {
      start.choices.unshift({
        label: '(Upgrade Skills)',
        to: 'train',
        effects: [{ effect: 'showTrainer', trainer: opts.trainer }]
      });
    }
    const trainNode = (nextTree.train ??= { text: '', choices: [{ label: '(Back)', to: 'start' }] });
    if (!trainNode.choices?.length) trainNode.choices = [{ label: '(Back)', to: 'start' }];
  }
  const nextQuest = quest ?? (opts?.quests ? opts.quests[0] ?? null : null);
  const nextColor = color ?? (opts?.symbol && opts.symbol !== '!' ? OBJECT_COLOR : NPC_COLOR);
  return new NpcEntity({
    id,
    map,
    x,
    y,
    color: nextColor,
    name,
    title,
    desc,
    tree: nextTree,
    quest: nextQuest,
    processNode: processNode ?? null,
    processChoice: processChoice ?? null,
    ...(opts ?? {})
  });
}

const resolveNpcNode = (
  tree: NpcDialogTree | null | undefined,
  nodeId: string
): (NpcDialogNode & { choices: NpcDialogChoice[] }) | null => {
  if (!tree) return null;
  const node = tree[nodeId];
  if (!node) return null;
  const choices = (node.choices ?? []).filter(Boolean) as NpcDialogChoice[];
  return { ...node, choices };
};

const NPC = NpcEntity;
const NPCS: NpcEntity[] = [];

function npcsOnMap(map = npcGlobals.state?.map ?? 'world'): NpcEntity[] {
  return NPCS.filter(n => n.map === map);
}

function queueNanoDialogForNPCs(
  nodeId = 'start',
  reason = 'inventory change',
  map = npcGlobals.state?.map ?? 'world'
): void {
  const nanoDialog = npcGlobals.NanoDialog;
  if (!nanoDialog) return;
  npcsOnMap(map).forEach(n => nanoDialog.queueForNPC(n, nodeId, reason));
}

function removeNPC(npc: DustlandNpc | null | undefined): void {
  if (!npc) return;
  const idx = NPCS.findIndex(existing => existing === npc || (npc.id && existing.id === npc.id));
  if (idx > -1) NPCS.splice(idx, 1);
}

type NpcFactoryDefinition =
  | (DustlandNpcTemplate &
    Record<string, any> & {
      dialogs?: string[];
      dialog?: string | string[];
      loop?: any;
      quests?: Array<string | DustlandNpcQuest | Quest | null | undefined>;
    })
  | (DustlandNpc & { id: string });

type NpcFactory = Record<string, (x?: number, y?: number) => NpcEntity>;

function createNpcFactory(defs: NpcFactoryDefinition[] | null | undefined): NpcFactory {
  const npcFactory: NpcFactory = {};
  (defs ?? []).forEach(n => {
    npcFactory[n.id] = (x?: number, y?: number) => {
      const spawnX = typeof x === 'number' ? x : (typeof n.x === 'number' ? (n.x as number) : 0);
      const spawnY = typeof y === 'number' ? y : (typeof n.y === 'number' ? (n.y as number) : 0);
      const treeSource = n.tree as NpcDialogTree | string | null | undefined;
      let treeData: NpcDialogTree | null | undefined;
      if (typeof treeSource === 'string') {
        try {
          treeData = JSON.parse(treeSource) as NpcDialogTree;
        } catch (e) {
          treeData = null;
        }
      } else {
        treeData = treeSource as NpcDialogTree | null | undefined;
      }
      const rawDialogs = 'dialogs' in n ? n.dialogs : undefined;
      const dialogsList = Array.isArray(rawDialogs) ? rawDialogs : null;
      const dialogProp = 'dialog' in n ? n.dialog : undefined;
      const dlgArr = dialogsList ?? (Array.isArray(dialogProp) ? dialogProp : null);
      if (!treeData || !Object.keys(treeData).length) {
        const txt = dlgArr && dlgArr.length ? dlgArr[0] : (typeof dialogProp === 'string' ? dialogProp : '');
        treeData = { start: { text: txt, choices: [{ label: '(Leave)', to: 'bye' }] } };
      }
      const opts: Partial<NpcConstructorOptions> = {};
      if (n.combat) opts.combat = n.combat;
      const shopSetting = (n as { shop?: ShopConfig | boolean | null | undefined }).shop;
      if (shopSetting) opts.shop = cloneShopData(shopSetting as ShopConfig | null | undefined) ?? true;
      if (n.workbench) opts.workbench = true;
      if (typeof n.portraitSheet === 'string') opts.portraitSheet = n.portraitSheet;
      if (n.portraitLock === false) opts.portraitLock = false;
      if (typeof n.prompt === 'string') opts.prompt = n.prompt;
      if (typeof n.symbol === 'string') opts.symbol = n.symbol;
      if (typeof n.door === 'boolean') opts.door = n.door;
      if (typeof n.locked === 'boolean') opts.locked = n.locked;
      if (typeof n.trainer === 'string') opts.trainer = n.trainer;
      else if (n.id && n.id.startsWith('trainer_')) opts.trainer = n.id.split('_')[1];
      if (typeof n.overrideColor === 'boolean') opts.overrideColor = n.overrideColor;
      if (Array.isArray(n.quests)) {
        const questRegistry = npcGlobals.quests ?? {};
        opts.quests = n.quests
          .map(q => (typeof q === 'string' ? questRegistry[q] ?? null : q))
          .filter((q): q is DustlandNpcQuest | Quest => Boolean(q));
      }
      if (dlgArr) opts.questDialogs = dlgArr;
      const npc = makeNPC(
        n.id,
        (n.map as string | undefined) ?? 'world',
        spawnX,
        spawnY,
        typeof n.color === 'string' ? n.color : undefined,
        (typeof n.name === 'string' ? n.name : undefined) ?? n.id,
        typeof n.title === 'string' ? n.title : '',
        typeof n.desc === 'string' ? n.desc : '',
        treeData ?? null,
        null,
        null,
        null,
        opts
      ) as NpcEntity;
      if (Array.isArray((n as DustlandNpc).loop)) npc.loop = (n as DustlandNpc).loop;
      return npc;
    };
  });
  return npcFactory;
}

function scaleEnemy(npc: CombatNpc, lvl = 1, build: string[] = []): void {
  const baseStatsFactory = npcGlobals.baseStats;
  const stats = (npc.stats = npc.stats ?? (typeof baseStatsFactory === 'function' ? baseStatsFactory() : {}));
  npc.maxHp = npc.maxHp ?? npc.hp ?? 10;
  npc.hp = npc.maxHp;
  for (let i = 1; i < lvl; i++) {
    npc.maxHp += 10;
    npc.hp = npc.maxHp;
    const stat = Array.isArray(build) && build.length ? build[(i - 1) % build.length] : null;
    if (stat) stats[stat] = (stats[stat] ?? 0) + 1;
  }
  npc.lvl = lvl;
}

function scaleEnemyWithPreset(npc: CombatNpc, lvl = 1, preset = ''): void {
  const presets = npcGlobals.enemyPresets ?? {};
  const build = presets[preset] ?? [];
  scaleEnemy(npc, lvl, build as string[]);
}

const npcExports = { NPC, makeNPC, resolveNode: resolveNpcNode, NPCS, npcsOnMap, queueNanoDialogForNPCs, removeNPC, createNpcFactory, scaleEnemy, scaleEnemyWithPreset };
Object.assign(globalThis, npcExports);
