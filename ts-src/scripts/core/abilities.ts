type AbilityConfig = {
  type?: string;
  cost?: number;
  prereq?: {
    level?: number;
    abilities?: string[];
  };
  effect?: Record<string, unknown>;
};

type Ability = {
  id: string;
  type: string;
  cost: number;
  prereq: {
    level: number;
    abilities: string[];
  };
  effect: Record<string, unknown>;
};

type SpecialConfig = {
  adrenaline_cost?: number;
  target_type?: string;
  effect?: Record<string, unknown>;
  wind_up_time?: number;
};

type Special = {
  id: string;
  adrenaline_cost: number;
  target_type: string;
  effect: Record<string, unknown>;
  wind_up_time: number;
};

const Abilities: Record<string, Ability> = {};
const Specials: Record<string, Record<string, unknown>> = {};

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
    adrenaline_cost: data.adrenaline_cost ?? 0,
    target_type: data.target_type ?? 'single',
    effect: typeof effect === 'object' ? effect : {},
    wind_up_time: data.wind_up_time ?? 0
  };
  Specials[id] = special;
  return special;
}

Object.assign(globalThis, { Abilities, defineAbility, Specials, defineSpecial });

const STARTER_SPECIALS: Array<Record<string, unknown> & { id: string }> = [
  { id: 'POWER_STRIKE', label: 'Power Strike', dmg: 3, adrCost: 30, cooldown: 1 },
  { id: 'STUN_GRENADE', label: 'Stun Grenade', dmg: 1, stun: 1, adrCost: 40, cooldown: 3 },
  { id: 'FIRST_AID', label: 'First Aid', heal: 4, adrCost: 35, cooldown: 2 },
  { id: 'ADRENAL_SURGE', label: 'Adrenal Surge', adrGain: 50, adrCost: 0, cooldown: 4 },
  { id: 'GUARD_UP', label: 'Guard', guard: true, adrCost: 20, cooldown: 2 }
];

for (const special of STARTER_SPECIALS) {
  Specials[special.id] = special;
}
