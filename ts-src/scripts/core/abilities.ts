type AbilityEffect = Record<string, any>;

type AbilityConfig = {
  type?: string;
  cost?: number;
  prereq?: {
    level?: number;
    abilities?: string[];
  };
  effect?: AbilityEffect;
};

type Ability = {
  id: string;
  type: string;
  cost: number;
  prereq: {
    level: number;
    abilities: string[];
  };
  effect: AbilityEffect;
};

type SpecialConfig = {
  label?: string;
  adrenaline_cost?: number;
  adrCost?: number;
  cooldown?: number;
  target_type?: string;
  effect?: AbilityEffect;
  wind_up_time?: number;
  dmg?: number;
  heal?: number;
  stun?: number;
  adrGain?: number;
  guard?: boolean;
  ignoreDefense?: boolean;
  [key: string]: any;
};

type Special = {
  id: string;
  label?: string;
  adrenaline_cost: number;
  adrCost?: number;
  cooldown?: number;
  target_type: string;
  effect: AbilityEffect;
  wind_up_time: number;
  dmg?: number;
  heal?: number;
  stun?: number;
  adrGain?: number;
  guard?: boolean;
  ignoreDefense?: boolean;
  [key: string]: any;
};

const Abilities: Record<string, Ability> = {};
const Specials: Record<string, Special> = {};

function defineAbility(id: string, data: AbilityConfig = {}): Ability {
  const effect = data.effect ?? {};
  const ability: Ability = {
    id,
    type: data.type ?? 'active',
    cost: data.cost ?? 0,
    prereq: {
      level: data.prereq?.level ?? 0,
      abilities: data.prereq?.abilities ?? []
    },
    effect: typeof effect === 'object' ? effect : {}
  };
  Abilities[id] = ability;
  return ability;
}

function defineSpecial(id: string, data: SpecialConfig = {}): Special {
  const effect = data.effect ?? {};
  const special: Special = {
    id,
    label: data.label,
    adrenaline_cost: data.adrenaline_cost ?? data.adrCost ?? 0,
    adrCost: data.adrCost,
    cooldown: data.cooldown,
    target_type: data.target_type ?? 'single',
    effect: typeof effect === 'object' ? effect : {},
    wind_up_time: data.wind_up_time ?? 0,
    dmg: data.dmg,
    heal: data.heal,
    stun: data.stun,
    adrGain: data.adrGain,
    guard: data.guard,
    ignoreDefense: data.ignoreDefense,
    ...data
  };
  Specials[id] = special;
  return special;
}

Object.assign(globalThis, { Abilities, defineAbility, Specials, defineSpecial });

const STARTER_SPECIALS: Special[] = [
  { id: 'POWER_STRIKE', label: 'Power Strike', dmg: 3, adrCost: 30, adrenaline_cost: 30, cooldown: 1, target_type: 'single', effect: {}, wind_up_time: 0 },
  { id: 'STUN_GRENADE', label: 'Stun Grenade', dmg: 1, stun: 1, adrCost: 40, adrenaline_cost: 40, cooldown: 3, target_type: 'single', effect: {}, wind_up_time: 0 },
  { id: 'FIRST_AID', label: 'First Aid', heal: 4, adrCost: 35, adrenaline_cost: 35, cooldown: 2, target_type: 'single', effect: {}, wind_up_time: 0 },
  { id: 'ADRENAL_SURGE', label: 'Adrenal Surge', adrGain: 50, adrCost: 0, adrenaline_cost: 0, cooldown: 4, target_type: 'self', effect: {}, wind_up_time: 0 },
  { id: 'GUARD_UP', label: 'Guard', guard: true, adrCost: 20, adrenaline_cost: 20, cooldown: 2, target_type: 'self', effect: {}, wind_up_time: 0 }
];

for (const special of STARTER_SPECIALS) {
  Specials[special.id] = special;
}
