import { FloorModuleStyle } from '../types';
import { EnvironmentManager, EnvironmentRegionId } from './environmentManager';

/**
 * Lightweight category/tag system for floor modules.
 * A module may belong to multiple categories to allow rich, flexible,
 * cross-biome architectural stacking.
 */
export type ModuleCategory =
  | 'CITY'
  | 'MOUNTAIN'
  | 'CLOUD'
  | 'ATMOSPHERE'
  | 'TECH'
  | 'SPACE'
  | 'ORBITAL'
  | 'LUNAR'
  | 'UNIVERSAL'
  | 'SPECIAL';

/**
 * Metadata descriptor for each registered floor module archetype.
 * Supports future progression gates (minFloor, maxFloor) and custom base weights.
 */
export interface FloorModuleMetadata {
  style: FloorModuleStyle;
  categories: ModuleCategory[];
  /** Optional base weight for rarity balancing (default: 1.0) */
  baseWeight?: number;
  /** Optional minimum floor required for this module to begin appearing */
  minFloor?: number;
  /** Optional maximum floor after which this module ceases to appear */
  maxFloor?: number;
}

/**
 * Registry of active playable floor modules and their associated category tags.
 * Rich multi-tag descriptors ensure cross-biome visual variety while preserving environment theme.
 */
export const FLOOR_MODULE_REGISTRY: Record<string, FloorModuleMetadata> = {
  MODERN_APARTMENT_V1: {
    style: 'MODERN_APARTMENT_V1',
    categories: ['CITY', 'ATMOSPHERE', 'SPACE', 'ORBITAL', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  BRICK_APARTMENT: {
    style: 'BRICK_APARTMENT',
    categories: ['CITY', 'MOUNTAIN', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  GLASS_OFFICE: {
    style: 'GLASS_OFFICE',
    categories: ['CITY', 'CLOUD', 'ATMOSPHERE', 'TECH', 'SPACE', 'ORBITAL', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  CONCRETE_CANTILEVER: {
    style: 'CONCRETE_CANTILEVER',
    categories: ['CITY', 'MOUNTAIN', 'TECH', 'ORBITAL', 'LUNAR', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  INDUSTRIAL_FRAME: {
    style: 'INDUSTRIAL_FRAME',
    categories: ['CITY', 'MOUNTAIN', 'CLOUD', 'ATMOSPHERE', 'TECH', 'SPACE', 'ORBITAL', 'LUNAR', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  SKY_GARDEN: {
    style: 'SKY_GARDEN',
    categories: ['CITY', 'MOUNTAIN', 'CLOUD', 'ATMOSPHERE', 'LUNAR', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
};

/**
 * Environment Region -> Preferred Module Categories Mapping.
 * Maps each existing environment region directly to the module tags that best suit its atmosphere.
 */
export const REGION_PREFERRED_CATEGORIES: Record<EnvironmentRegionId, ModuleCategory[]> = {
  CITY: ['CITY'],
  HIGH_MOUNTAINS: ['MOUNTAIN', 'CITY'],
  CLOUD_WORLD: ['CLOUD', 'TECH'],
  ABOVE_THE_CLOUDS: ['CLOUD', 'ATMOSPHERE', 'TECH'],
  HIGH_ATMOSPHERE: ['ATMOSPHERE', 'TECH'],
  EDGE_OF_SPACE: ['SPACE', 'TECH', 'ATMOSPHERE'],
  SPACE_EARTH_BELOW: ['SPACE', 'TECH'],
  ORBITAL_REGION: ['ORBITAL', 'SPACE', 'TECH'],
  MOON_APPROACH: ['ORBITAL', 'LUNAR', 'SPACE'],
  MOON_REGION: ['LUNAR', 'SPACE'],
  ENDLESS_SPACE: ['SPACE', 'ORBITAL', 'LUNAR', 'SPECIAL'],
};

/**
 * Configurable weights and anti-repetition rules for module selection.
 */
export const MODULE_SELECTION_CONFIG = {
  /** Target probability (~70%, within 65–75%) for environment-preferred/compatible modules */
  ENVIRONMENT_COMPATIBLE_WEIGHT: 0.70,
  /** Target probability (~30%, within 25–35%) for other valid normal modules to ensure visual variety */
  OTHER_MODULES_WEIGHT: 0.30,
  /** Maximum consecutive identical module archetypes before anti-repetition strictly forbids a 3rd */
  MAX_CONSECUTIVE_IDENTICAL: 2,
  /** Damping factor applied to previous-previous module to prevent repetitive ABABAB alternation */
  ANTI_ALTERNATION_FACTOR: 0.30,
};

export interface ModuleSelectionResult {
  style: FloorModuleStyle;
  metadata: FloorModuleMetadata;
  poolSource: 'ENVIRONMENT_PREFERRED' | 'GENERAL_VARIETY';
  regionId: EnvironmentRegionId;
  floorNumber: number;
}

/**
 * Weighted random picker from an array of module metadata.
 * Safe against empty pools and zero-weight items.
 */
function pickWeighted(pool: FloorModuleMetadata[]): FloorModuleMetadata {
  if (pool.length === 0) {
    return FLOOR_MODULE_REGISTRY.MODERN_APARTMENT_V1;
  }
  if (pool.length === 1) {
    return pool[0];
  }

  const totalWeight = pool.reduce((sum, m) => sum + Math.max(0.01, m.baseWeight ?? 1.0), 0);
  let randomVal = Math.random() * totalWeight;

  for (const item of pool) {
    const weight = Math.max(0.01, item.baseWeight ?? 1.0);
    if (randomVal <= weight) {
      return item;
    }
    randomVal -= weight;
  }

  return pool[pool.length - 1];
}

/**
 * Environment-aware module selector with balanced visual variety and anti-repetition.
 * 
 * Flow:
 * 1. Queries the current environment region from EnvironmentManager (Single Source of Truth).
 * 2. Retrieves preferred module categories for that environment.
 * 3. Partitions all playable candidate modules into Preferred (~70%) vs Other Valid (~30%).
 * 4. Strictly prevents 3-in-a-row repetition (sets weight to 0 if last 2 were identical).
 * 5. Dampens immediate ABABAB alternation (penalizes last-last style) to prevent 2-module loops.
 * 6. Performs weighted random selection and returns style and metadata.
 */
export function selectFloorModule(
  floorNumber: number,
  history: FloorModuleStyle[],
  explicitRegionId?: EnvironmentRegionId
): ModuleSelectionResult {
  // STEP 1: Determine current environment region (single source of truth)
  const regionState = EnvironmentManager.getRegionState(floorNumber);
  const envRegion = explicitRegionId ?? regionState.regionId;

  // STEP 2: Preferred module categories for this environment
  const preferredCategories = REGION_PREFERRED_CATEGORIES[envRegion] ?? ['CITY'];

  // STEP 3: Filter registered modules by floor requirements (all 6 core archetypes active)
  const allRegistered = Object.values(FLOOR_MODULE_REGISTRY);
  const activeModules = allRegistered.filter((m) => {
    if (m.minFloor !== undefined && floorNumber < m.minFloor) return false;
    if (m.maxFloor !== undefined && floorNumber > m.maxFloor) return false;
    return true;
  });

  const candidates = activeModules.length > 0 ? activeModules : allRegistered;

  // STEP 4: Partition into Environment-Preferred vs Other Valid Normal Modules
  const preferredModules = candidates.filter((m) =>
    m.categories.some((cat) => preferredCategories.includes(cat))
  );
  const otherModules = candidates.filter(
    (m) => !m.categories.some((cat) => preferredCategories.includes(cat))
  );

  // STEP 5: Assign baseline weights ensuring ~65–75% for preferred and ~25–35% for other
  const candidateWeights: Map<FloorModuleMetadata, number> = new Map();
  const targetPref = MODULE_SELECTION_CONFIG.ENVIRONMENT_COMPATIBLE_WEIGHT; // 0.70
  const targetOther = MODULE_SELECTION_CONFIG.OTHER_MODULES_WEIGHT;         // 0.30

  if (preferredModules.length > 0 && otherModules.length > 0) {
    const pWeightEach = targetPref / preferredModules.length;
    const oWeightEach = targetOther / otherModules.length;

    for (const m of preferredModules) {
      candidateWeights.set(m, pWeightEach * (m.baseWeight ?? 1.0));
    }
    for (const m of otherModules) {
      candidateWeights.set(m, oWeightEach * (m.baseWeight ?? 1.0));
    }
  } else {
    for (const m of candidates) {
      candidateWeights.set(m, (1.0 / candidates.length) * (m.baseWeight ?? 1.0));
    }
  }

  // STEP 6: Anti-repetition Rules
  const historyLen = history.length;

  // Rule A: Strictly prevent 3-in-a-row repetition (same archetype 3 times in a row)
  if (
    historyLen >= MODULE_SELECTION_CONFIG.MAX_CONSECUTIVE_IDENTICAL &&
    history[historyLen - 1] === history[historyLen - 2]
  ) {
    const forbiddenStyle = history[historyLen - 1];
    for (const [m] of candidateWeights) {
      if (m.style === forbiddenStyle) {
        candidateWeights.set(m, 0);
      }
    }
  }

  // Rule B: Discourage immediate ABABAB alternation (ping-pong trap between two modules)
  // If history has [..., A, B] with A !== B, picking A again would produce [A, B, A].
  // We apply a damping factor to A so other alternatives (C, D, E, F) are prioritized.
  if (historyLen >= 2 && history[historyLen - 1] !== history[historyLen - 2]) {
    const prevPrevStyle = history[historyLen - 2];
    for (const [m, w] of candidateWeights) {
      if (m.style === prevPrevStyle) {
        candidateWeights.set(m, w * MODULE_SELECTION_CONFIG.ANTI_ALTERNATION_FACTOR);
      }
    }
  }

  // STEP 7: Weighted random roll
  let totalWeight = 0;
  for (const w of candidateWeights.values()) {
    totalWeight += Math.max(0, w);
  }

  let selectedMetadata: FloorModuleMetadata;
  if (totalWeight <= 0) {
    selectedMetadata = candidates[Math.floor(Math.random() * candidates.length)];
  } else {
    let roll = Math.random() * totalWeight;
    let chosen: FloorModuleMetadata = candidates[0];
    for (const [m, w] of candidateWeights.entries()) {
      if (w <= 0) continue;
      if (roll <= w) {
        chosen = m;
        break;
      }
      roll -= w;
    }
    selectedMetadata = chosen;
  }

  const isPreferred = preferredModules.some((m) => m.style === selectedMetadata.style);
  const poolSource: 'ENVIRONMENT_PREFERRED' | 'GENERAL_VARIETY' = isPreferred
    ? 'ENVIRONMENT_PREFERRED'
    : 'GENERAL_VARIETY';

  // STEP 8: Concise development log
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.debug(
      `[ModuleSelector] Floor: ${floorNumber} | Env: ${envRegion} | Style: ${selectedMetadata.style} | Pool: ${poolSource}`
    );
  }

  return {
    style: selectedMetadata.style,
    metadata: selectedMetadata,
    poolSource,
    regionId: envRegion,
    floorNumber,
  };
}
