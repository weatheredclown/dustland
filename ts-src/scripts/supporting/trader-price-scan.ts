/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_MODULES = [
  'modules/dustland.module.js',
  'modules/golden.module.json',
  'modules/other-bas.module.js',
  'modules/pit-bas.module.js'
];

type TraderPriceOptions = {
  entry?: TraderInventoryEntry | null;
  markup?: number;
  grudge?: number;
  tierMultiplier?: number;
  scarcityMultiplier?: number;
};

type TraderInventoryEntry = {
  id?: string;
  count?: number;
  maxStack?: number;
  value?: number;
  tier?: number;
  rarity?: string | number;
  rank?: string;
  scarcity?: string | number;
};

type TraderStatic = {
  calculatePrice: (valueOrItem: number | ModuleItem, opts?: TraderPriceOptions) => number;
};

let cachedTrader: TraderStatic | null = null;

function loadTraderClass(repoRoot){
  if (cachedTrader) return cachedTrader;
  const traderPath = path.resolve(repoRoot, 'scripts', 'core', 'trader.js');
  const code = fs.readFileSync(traderPath, 'utf8');
  const context: Record<string, unknown> & { Dustland?: { Trader?: TraderStatic } } = {
    console,
    Math,
    JSON,
    globalThis: {},
    EventBus: { emit: () => {} }
  };
  context.globalThis = context;
  context.Dustland = context.Dustland || {};
  vm.createContext(context);
  vm.runInContext(code, context, { filename: traderPath });
  cachedTrader = context.Dustland?.Trader;
  if (!cachedTrader) throw new Error('Unable to load Trader class');
  return cachedTrader;
}

function resolveModulePath(candidate){
  if(!candidate) return null;
  const abs = path.isAbsolute(candidate) ? candidate : path.resolve(REPO_ROOT, candidate);
  if(fs.existsSync(abs)) return abs;
  if(path.isAbsolute(candidate)) return null;
  const nested = path.resolve(REPO_ROOT, 'modules', candidate);
  if(fs.existsSync(nested)) return nested;
  return null;
}

function extractModuleData(filePath: string): ModuleData {
  const ext = path.extname(filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  if(ext === '.json'){
    return JSON.parse(raw) as ModuleData;
  }
  if(ext === '.js'){
    const match = raw.match(/const DATA = `([\s\S]*?)`;/);
    if(!match) throw new Error(`Unable to locate DATA export in ${filePath}`);
    return JSON.parse(match[1]) as ModuleData;
  }
  throw new Error(`Unsupported module format for ${filePath}`);
}

type ModuleItem = {
  id: string;
  mods?: Record<string, unknown>;
  tags?: string[];
  value?: number;
  use?: unknown;
  [key: string]: unknown;
};

function normalizeItemList(list: Array<ModuleItem | null | undefined> | null | undefined){
  const map = new Map<string, ModuleItem>();
  (list || []).forEach(item => {
    if(!item || !item.id) return;
    const existing: ModuleItem = map.get(item.id) ?? { id: item.id, mods: {}, tags: [] };
    const merged: ModuleItem = {
      ...existing,
      ...item,
      mods: { ...existing.mods, ...(item.mods || {}) },
      tags: Array.isArray(existing.tags) || Array.isArray(item.tags)
        ? Array.from(new Set([...(existing.tags || []), ...(Array.isArray(item.tags) ? item.tags : [])]))
        : existing.tags
    };
    if(existing.value == null && item.value != null){
      merged.value = item.value;
    }
    if(existing.use == null && item.use != null){
      merged.use = item.use;
    }
    map.set(item.id, merged);
  });
  return map;
}

function calcModScore(item: { mods?: Record<string, unknown> } | null | undefined){
  const mods = item?.mods;
  if (!mods) return 0;
  return Object.values(mods).reduce<number>((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
}

function extractHealValue(item: ModuleItem | undefined | null){
  if(!item || !item.use) return null;
  const use = item.use;
  if(use && typeof use === 'object' && 'amount' in use){
    const amount = (use as { amount?: unknown }).amount;
    if (typeof amount === 'number') return amount;
  }
  return null;
}

function summarizeScrap(sources){
  if(!sources.length) return { min: null, max: null, avg: null, count: 0 };
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let avgTotal = 0;
  sources.forEach(src => {
    if(typeof src.min === 'number') min = Math.min(min, src.min);
    if(typeof src.max === 'number') max = Math.max(max, src.max);
    avgTotal += src.avg;
  });
  return {
    min,
    max,
    avg: avgTotal / sources.length,
    count: sources.length
  };
}

function summarizePrices(items){
  if(!items.length) return { min: null, max: null, avg: null, count: 0 };
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let total = 0;
  items.forEach(it => {
    if(typeof it.price === 'number'){
      min = Math.min(min, it.price);
      max = Math.max(max, it.price);
      total += it.price;
    }
  });
  return {
    min,
    max,
    avg: total / items.length,
    count: items.length
  };
}

function formatNumber(value){
  if(value == null) return 'n/a';
  if(Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

type CombatReward = number | { min?: number; max?: number } | null | undefined;

type ModuleCombat = {
  scrap?: CombatReward;
  challenge?: number | null;
};

type ModuleNpcShop = {
  inv?: Array<(TraderInventoryEntry & { id?: string }) | null> | null;
  markup?: number;
  grudge?: number;
};

type ModuleData = {
  name?: string;
  seed?: string;
  items?: Array<ModuleItem | null | undefined> | null;
  templates?: Array<{ id?: string; name?: string; combat?: ModuleCombat }>;
  npcs?: Array<{ id?: string; name?: string; combat?: ModuleCombat; shop?: ModuleNpcShop | boolean | null; vending?: boolean }>;
  enemies?: Array<{ id?: string; name?: string; combat?: ModuleCombat }>;
};

function collectScrapSources(data: ModuleData, threshold: number){
  const sources: Array<{ kind: string; id: string; min: number; max: number; avg: number; challenge: number | null }> = [];
  const consider = (kind: string, ref: string, combat: ModuleCombat | null | undefined) => {
    if(!combat || !combat.scrap) return;
    const scrap = combat.scrap;
    let min;
    let max;
    if(typeof scrap === 'number'){
      min = scrap;
      max = scrap;
    } else {
      if(typeof scrap.min === 'number') min = scrap.min;
      if(typeof scrap.max === 'number') max = scrap.max;
    }
    if(min == null && max == null) return;
    if(min == null) min = max ?? 0;
    if(max == null) max = min ?? 0;
    const challenge = typeof combat.challenge === 'number' ? combat.challenge : null;
    if(challenge != null && challenge > threshold) return;
    sources.push({
      kind,
      id: ref,
      min,
      max,
      avg: (min + max) / 2,
      challenge
    });
  };
  (data.templates || []).forEach(t => consider('template', t.id || t.name || 'unknown', t.combat));
  (data.npcs || []).forEach(n => consider('npc', n.id || n.name || 'unknown', n.combat));
  (data.enemies || []).forEach(e => consider('enemy', e.id || e.name || 'unknown', e.combat));
  return sources;
}

export function collectPricingData(modulePaths: string[], opts: { challengeThreshold?: number; repoRoot?: string } = {}){
  const threshold = typeof opts.challengeThreshold === 'number' ? opts.challengeThreshold : 10;
  const repoRoot = opts.repoRoot || REPO_ROOT;
  const Trader = loadTraderClass(repoRoot);
  const modules = [];
  const allScrap = [];
  const allPrices = [];
  const allFlags = [];

  modulePaths.forEach(filePath => {
    if(!filePath) return;
    const data = extractModuleData(filePath);
    const items = normalizeItemList(data.items);
    const moduleName = data.name || data.seed || path.basename(filePath, path.extname(filePath));
    const scrapSources = collectScrapSources(data, threshold);
    const scrapSummary = summarizeScrap(scrapSources);
    const vendors = [];
    const moduleFlags = [];

    (data.npcs || []).forEach(npc => {
      const shop = npc?.shop;
      if(!shop || shop === true) return;
      const inv = Array.isArray(shop.inv) ? shop.inv : [];
      if(!inv.length) return;
      const baseMarkup = npc.vending ? 1 : (typeof shop.markup === 'number' ? shop.markup : 2);
      const vendorItems = [];
      inv.forEach(entry => {
        if(!entry || !entry.id) return;
        const itemData = items.get(entry.id);
        const baseValue = typeof itemData?.value === 'number' ? itemData.value : 0;
        let price = 0;
        if (itemData) {
          price = Trader.calculatePrice(itemData, {
            entry,
            markup: baseMarkup,
            grudge: shop?.grudge ?? 0
          });
        }
        const modScore = calcModScore(itemData);
        const healValue = extractHealValue(itemData);
        const needsValue = !itemData ? true : (baseValue === 0 && (modScore !== 0 || (healValue ?? 0) > 0));
        const note = !itemData ? 'missing item definition'
          : needsValue ? 'missing base value'
            : '';
        const reportItem = {
          id: entry.id,
          baseValue,
          markup: baseMarkup,
          price,
          modScore,
          healValue,
          needsValue,
          missing: !itemData,
          note
        };
        vendorItems.push(reportItem);
        allPrices.push({ ...reportItem, module: moduleName, vendor: npc.name || npc.id || 'unknown' });
        if(note){
          const flag = {
            module: moduleName,
            vendor: npc.name || npc.id || 'unknown',
            itemId: entry.id,
            note
          };
          moduleFlags.push(flag);
          allFlags.push(flag);
        }
      });
      if(vendorItems.length){
        vendors.push({
          id: npc.id || npc.name || 'vendor',
          name: npc.name || npc.id || 'vendor',
          markup: baseMarkup,
          items: vendorItems
        });
      }
    });

    const vendorSummary = summarizePrices(vendors.flatMap(v => v.items));
    const moduleReport = {
      name: moduleName,
      file: path.relative(repoRoot, filePath),
      scrapSources,
      scrapSummary,
      vendors,
      vendorSummary,
      flagged: moduleFlags
    };
    modules.push(moduleReport);
    scrapSources.forEach(s => allScrap.push({ ...s, module: moduleName }));
  });

  const totals = {
    scrap: summarizeScrap(allScrap),
    vendor: summarizePrices(allPrices),
    flagged: allFlags
  };

  return { modules, totals };
}

function formatModule(module){
  const lines = [];
  lines.push(`=== ${module.name} (${module.file}) ===`);
  if(module.scrapSources.length){
    lines.push('Early scrap sources:');
    module.scrapSources.forEach(src => {
      const challenge = src.challenge == null ? '' : `, challenge ${src.challenge}`;
      lines.push(`  - ${src.kind}:${src.id} -> ${formatNumber(src.min)}-${formatNumber(src.max)} (avg ${formatNumber(src.avg)}${challenge})`);
    });
    const summary = module.scrapSummary;
    lines.push(`  Summary: min ${formatNumber(summary.min)}, max ${formatNumber(summary.max)}, avg ${formatNumber(summary.avg)} across ${summary.count} sources.`);
  } else {
    lines.push('No early scrap sources within threshold.');
  }
  if(module.vendors.length){
    lines.push('Vendors:');
    module.vendors.forEach(vendor => {
      lines.push(`  - ${vendor.name} (markup ×${formatNumber(vendor.markup)})`);
      vendor.items.forEach(item => {
        const details = [`price ${formatNumber(item.price)}`, `base ${formatNumber(item.baseValue)}`];
        if(item.modScore) details.push(`mods ${formatNumber(item.modScore)}`);
        if(item.healValue) details.push(`heal ${formatNumber(item.healValue)}`);
        const note = item.note ? ` [${item.note}]` : '';
        lines.push(`      • ${item.id}: ${details.join(', ')}${note}`);
      });
    });
    const summary = module.vendorSummary;
    lines.push(`  Inventory summary: min ${formatNumber(summary.min)}, max ${formatNumber(summary.max)}, avg ${formatNumber(summary.avg)} across ${summary.count} items.`);
  } else {
    lines.push('No vendors with inventory.');
  }
  if(module.flagged.length){
    lines.push('  Flags:');
    module.flagged.forEach(flag => {
      lines.push(`    - ${flag.vendor}: ${flag.itemId} (${flag.note})`);
    });
  }
  return lines.join('\n');
}

export function formatReport(report){
  const sections = report.modules.map(formatModule);
  const totals = report.totals;
  sections.push('=== Aggregate summary ===');
  if(totals.scrap.count){
    sections.push(`Scrap: min ${formatNumber(totals.scrap.min)}, max ${formatNumber(totals.scrap.max)}, avg ${formatNumber(totals.scrap.avg)} across ${totals.scrap.count} sources.`);
  } else {
    sections.push('Scrap: no sources.');
  }
  if(totals.vendor.count){
    sections.push(`Vendor prices: min ${formatNumber(totals.vendor.min)}, max ${formatNumber(totals.vendor.max)}, avg ${formatNumber(totals.vendor.avg)} across ${totals.vendor.count} items.`);
  } else {
    sections.push('Vendor prices: no items.');
  }
  if(totals.flagged.length){
    sections.push('Flagged items:');
    totals.flagged.forEach(flag => {
      sections.push(`  - ${flag.module} / ${flag.vendor} -> ${flag.itemId} (${flag.note})`);
    });
  }
  return sections.join('\n');
}

async function main(){
  const args = process.argv.slice(2);
  const candidates = args.length ? args : DEFAULT_MODULES;
  const modules = candidates
    .map(resolveModulePath)
    .filter(Boolean);
  const skipped = candidates.length - modules.length;
  if(skipped){
    console.warn(`Skipped ${skipped} module(s); file not found.`);
  }
  if(!modules.length){
    console.error('No module data found.');
    process.exitCode = 1;
    return;
  }
  const report = collectPricingData(modules, { repoRoot: REPO_ROOT });
  console.log(formatReport(report));
}

if(import.meta.url === pathToFileURL(process.argv[1]).href){
  main().catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
}
