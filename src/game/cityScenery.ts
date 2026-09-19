import * as THREE from 'three';
import { EnvironmentManager, RegionState } from './environmentManager';

export { EnvironmentManager };
export type { RegionState };

/**
 * CityScenery is the high-level environment container, fully backed by
 * the EnvironmentManager to drive the continuous 10-region vertical journey.
 */
export class CityScenery extends EnvironmentManager {
  constructor() {
    super();
  }
}
