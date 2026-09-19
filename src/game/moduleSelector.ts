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
 * The current six archetypes form the foundation.
 */
export const FLOOR_MODULE_REGISTRY: Record<string, FloorModuleMetadata> = {
  MODERN_APARTMENT_V1: {
    style: 'MODERN_APARTMENT_V1',
    categories: ['CITY', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  BRICK_APARTMENT: {
    style: 'BRICK_APARTMENT',
    categories: ['CITY', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  GLASS_OFFICE: {
    style: 'GLASS_OFFICE',
    categories: ['CITY', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  CONCRETE_CANTILEVER: {
    style: 'CONCRETE_CANTILEVER',
    categories: ['CITY', 'MOUNTAIN', 'TECH', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  INDUSTRIAL_FRAME: {
    style: 'INDUSTRIAL_FRAME',
    categories: ['CITY', 'MOUNTAIN', 'TECH', 'UNIVERSAL'],
    baseWeight: 1.0,
  },
  SKY_GARDEN: {
    style: 'SKY_GARDEN',
    categories: ['CITY', 'MOUNTAIN', 'CLOUD', 'UNIVERSAL'],
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
 * Configurable weights for module selection.
 */
export const MODULE_SELECTION_CONFIG = {
  /** Target probability (82%) of selecting an environment-compatible module when candidates exist */
  ENVIRONMENT_COMPATIBLE_WEIGHT: 0.82,
  /** Target probability (18%) of selecting a UNIVERSAL module for intentional variety */
  UNIVERSAL_FALLBACK_WEIGHT: 0.18,
  /** Maximum consecutive identical module archetypes before anti-repetition kicks in */
  MAX_CONSECUTIVE_IDENTICAL: 2,
};

export interface ModuleSelectionResult {
  style: FloorModuleStyle;
  metadata: FloorModuleMetadata;
  poolSource: 'ENVIRONMENT' | 'UNIVERSAL_FALLBACK';
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
 * Two-stage weighted module selector.
 * 
 * Flow:
 * 1. Queries the current environment region from EnvironmentManager (Single Source of Truth).
 * 2. Retrieves preferred module categories for that environment.
 * 3. Enforces the anti-3-in-a-row rule by excluding any archetype that appeared 2 times consecutively.
 * 4. Partitions eligible candidates into:
 *    - Compatible Candidates (matches preferred categories)
 *    - Universal Candidates (has 'UNIVERSAL' tag)
 * 5. Applies weighted roll (82% Environment-Compatible vs 18% Universal Variety).
 * 6. Gracefully falls back to Universal modules if an environment lacks specialized modules.
 * 7. Returns the selected style and metadata.
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

  // STEP 3: Anti-repetition rule (no archetype 3 times in a row)
  let forbiddenStyle: FloorModuleStyle | null = null;
  const historyLen = history.length;
  if (
    historyLen >= MODULE_SELECTION_CONFIG.MAX_CONSECUTIVE_IDENTICAL &&
    history[historyLen - 1] === history[historyLen - 2]
  ) {
    forbiddenStyle = history[historyLen - 1];
  }

  // STEP 4: Filter registered modules by floor requirements and anti-repetition
  const allRegistered = Object.values(FLOOR_MODULE_REGISTRY);
  const activeModules = allRegistered.filter((m) => {
    if (m.minFloor !== undefined && floorNumber < m.minFloor) return false;
    if (m.maxFloor !== undefined && floorNumber > m.maxFloor) return false;
    return true;
  });

  let eligibleCandidates = activeModules;
  if (forbiddenStyle) {
    const withoutRepeated = activeModules.filter((m) => m.style !== forbiddenStyle);
    if (withoutRepeated.length > 0) {
      eligibleCandidates = withoutRepeated;
    }
  }

  // STEP 5: Partition candidate pools
  const compatibleModules = eligibleCandidates.filter((m) =>
    m.categories.some((cat) => preferredCategories.includes(cat))
  );
  const universalModules = eligibleCandidates.filter((m) =>
    m.categories.includes('UNIVERSAL')
  );

  // STEP 6: Apply environment weighting vs Universal fallback
  let selectedPool: FloorModuleMetadata[];
  let poolSource: 'ENVIRONMENT' | 'UNIVERSAL_FALLBACK';

  if (compatibleModules.length > 0) {
    const roll = Math.random();
    if (roll < MODULE_SELECTION_CONFIG.ENVIRONMENT_COMPATIBLE_WEIGHT) {
      selectedPool = compatibleModules;
      poolSource = 'ENVIRONMENT';
    } else if (universalModules.length > 0) {
      selectedPool = universalModules;
      poolSource = 'UNIVERSAL_FALLBACK';
    } else {
      selectedPool = compatibleModules;
      poolSource = 'ENVIRONMENT';
    }
  } else {
    // Graceful fallback when no environment-specific module exists yet (e.g. Moon/Space before future expansion)
    selectedPool = universalModules.length > 0 ? universalModules : eligibleCandidates;
    poolSource = 'UNIVERSAL_FALLBACK';
  }

  // STEP 7: Pick module using base weights
  const selectedMetadata = pickWeighted(selectedPool);

  // STEP 8: Concise development log
  if (import.meta.env.DEV) {
    console.debug(
      `[ModuleSelector] Floor: ${floorNumber} | Env: ${envRegion} | Selected: ${selectedMetadata.style} | Categories: ${selectedMetadata.categories.join(', ')} | Pool: ${poolSource}`
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
