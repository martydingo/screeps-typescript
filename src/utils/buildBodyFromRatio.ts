// Screeps typings: BodyPartConstant is usually available globally.
// If not, you can replace BodyPartConstant with string union of part names.
type PartKey = BodyPartConstant;

const COST: Record<PartKey, number> = {
  tough: 10,
  move: 50,
  work: 100,
  carry: 50,
  attack: 80,
  // eslint-disable-next-line camelcase
  ranged_attack: 150,
  heal: 250,
  claim: 600
};



export type Ratio = Partial<Record<PartKey, number>>;
export type MaxBodyParts = Partial<Record<PartKey, number>>;

function sumRatioCost(ratio: Ratio): number {
  let total = 0;
  for (const [k, v] of Object.entries(ratio) as [PartKey, number][]) {
    if (v > 0) total += COST[k] * v;
  }
  return total;
}

function totalRatioCount(ratio: Ratio): number {
  let total = 0;
  for (const v of Object.values(ratio)) total += v ?? 0;
  return total;
}

/**
 * Build a body from a ratio (weights) under an energy budget.
 */
export function buildBodyFromRatio(opts: {
  ratio: Ratio;
  maxBodyParts: MaxBodyParts
  energyAvailable: number; // room.energyAvailable (or spawn energy)
  minSpend?: number; // default 300
  maxParts?: number; // default 50
  // Ordering:
  workFirst?: boolean; // default true
  alternateOrder?: PartKey[]; // default ["carry","move"]
}): PartKey[] {
  const {
    ratio,
    maxBodyParts = {
      tough: 50,
      move: 50,
      work: 50,
      carry: 50,
      attack: 50,
      // eslint-disable-next-line camelcase
      ranged_attack: 50,
      heal: 50,
      claim: 50
    },
    energyAvailable,
    minSpend = 300,
    maxParts = 50,
    workFirst = true,
    alternateOrder = ["carry", "move"]
  } = opts;

  // Budget: you can pick capacity-only if you prefer, but this is usually what you want at spawn time.
  const budget = energyAvailable;
  if (budget < 300) return []; // can't spawn anything

  // Keep only positive ratio entries
  const partsInRatio = (Object.keys(ratio) as PartKey[]).filter(p => (ratio[p] ?? 0) > 0);
  if (partsInRatio.length === 0) return [];

  // Cost of one "full ratio pack"
  const packCost = sumRatioCost(ratio);
  const packCount = totalRatioCount(ratio);
  if (packCost <= 0 || packCount <= 0) return [];

  // Scale ratio to budget (fractional)
  // This is the key that makes 550 work even when packCost is 600.
  const scale = budget / packCost;

  // Start with floors of fractional targets
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const counts: Record<PartKey, number> = Object.create(null);

  const remainders: { part: PartKey; rem: number }[] = [];

  for (const p of partsInRatio) {
    const target = (ratio[p] ?? 0) * scale;
    const base = Math.floor(target);
    counts[p] = base;
    remainders.push({ part: p, rem: target - base });
  }

  // Helper to compute current cost / size
  const currentCost = () => (Object.keys(counts) as PartKey[]).reduce((acc, p) => acc + (counts[p] ?? 0) * COST[p], 0);
  const currentSize = () => (Object.keys(counts) as PartKey[]).reduce((acc, p) => acc + (counts[p] ?? 0), 0);

  // Add parts by largest remainder while we can afford them (and stay <= maxParts)
  remainders.sort((a, b) => b.rem - a.rem);

  const tryAdd = (p: PartKey): boolean => {
    const size = currentSize();
    const cost = currentCost();
    if (size + 1 > maxParts) return false;
    if (cost + COST[p] > budget) return false;
    counts[p] = (counts[p] ?? 0) + 1;
    return true;
  };

  // First pass: largest remainder fill
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const { part } of remainders) {
      if (tryAdd(part)) progressed = true;
    }
  }

  // Enforce "minimum spend 300" if possible:
  // If we ended up with a tiny body due to ratios/costs, top up cheaply within ratio set.
  const minTarget = Math.min(minSpend, budget);
  const cheapestPart = partsInRatio.slice().sort((a, b) => COST[a] - COST[b])[0];

  while (currentCost() < minTarget) {
    if (!tryAdd(cheapestPart)) break;
  }

  // If still empty (can happen with weird ratios + maxParts), fall back to cheapest part
  if (currentSize() === 0) {
    // Add at least something affordable
    if (COST[cheapestPart] <= budget) counts[cheapestPart] = 1;
  }


  Object.keys(counts).forEach(bodyPartName => {
    if (counts[bodyPartName as BodyPartConstant] > maxBodyParts[bodyPartName as BodyPartConstant]!) {
      counts[bodyPartName as BodyPartConstant] = maxBodyParts[bodyPartName as BodyPartConstant]!;
    }
  });

  // --- Build ordered output array ---

  const out: PartKey[] = [];

  // 1) WORK at the front (if requested)
  if (workFirst && (counts.work ?? 0) > 0) {
    for (let i = 0; i < (counts.work ?? 0); i++) out.push("work");
    counts.work = 0;
  }

  // 2) Alternating the rest in the requested order (default: carry/move)
  const alt = alternateOrder.filter(p => (counts[p] ?? 0) > 0 || partsInRatio.includes(p));
  const remainingParts = partsInRatio.filter(p => p !== "work");

  // Ensure we include any non-work parts not listed in alternateOrder at the end of the cycle
  const cycle: PartKey[] = [...alt, ...remainingParts.filter(p => !alt.includes(p))];

  // Round-robin until exhausted
  let left = true;
  while (left) {
    left = false;
    for (const p of cycle) {
      if ((counts[p] ?? 0) > 0) {
        out.push(p);
        counts[p]!--;
        left = true;
      }
    }
  }

  return out;
}
