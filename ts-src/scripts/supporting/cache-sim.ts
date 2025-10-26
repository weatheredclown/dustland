#!/usr/bin/env node
/// <reference types="node" />
import './core/item-generator.js';

type GeneratedItem = { stats: { power: number } };

const itemGen = (globalThis as {
  ItemGen?: {
    statRanges: Record<string, { min: number; max: number }>;
    generate(rank: string): GeneratedItem;
  };
}).ItemGen;
if (!itemGen) {
  throw new Error('Item generator not available');
}

const ranges = itemGen.statRanges;
for (const rank of Object.keys(ranges)) {
  let min = Infinity;
  let max = -Infinity;
  const { min: expectedMin, max: expectedMax } = ranges[rank];
  for (let i = 0; i < 1000; i++) {
    const item = itemGen.generate(rank) as GeneratedItem;
    const power = item.stats.power;
    if (power < min) min = power;
    if (power > max) max = power;
    if (power < expectedMin || power > expectedMax) {
      console.error(`${rank} power ${power} out of range ${expectedMin}-${expectedMax}`);
      process.exit(1);
    }
  }
  console.log(`${rank}: min=${min} max=${max}`);
}
