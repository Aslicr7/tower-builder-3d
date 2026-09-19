/**
 * TrolleyKinematics
 * 
 * Provides smooth, causal, and mathematically continuous trolley trajectories
 * along the crane boom (X) and lateral axis (Z).
 * 
 * Kinematic stages:
 * 1. Offscreen Entry:
 *    - Accelerates smoothly from spawn position (v=0) to cruise speed over T_acc
 *    - Cruises at CONSTANT VELOCITY across the boom and through tower center (a=0)
 *    - Brakes smoothly to first turnaround limit (v=0 at +ampX or -ampX) over T_acc
 * 
 * 2. Steady Cyclic Oscillation:
 *    - Accelerates away from turnaround limit over T_acc
 *    - Cruises across center at CONSTANT VELOCITY (a=0)
 *    - Brakes smoothly into the opposite limit over T_acc
 * 
 * Zero sudden jerks. Zero continuous sine-wave driving forces during cruise.
 */

export interface TrolleyState {
  x: number;
  vx: number;
  ax: number;
  z: number;
  vz: number;
  az: number;
  isCruising: boolean;
  isTurning: boolean;
}

export class TrolleyKinematics {
  public readonly entrySpawnX: number;
  public readonly entrySide: 'LEFT' | 'RIGHT';
  public readonly ampX: number;
  public readonly ampZ: number;
  public readonly speedMult: number;

  public readonly V_entryCruise: number;
  public readonly V_oscCruise: number;
  public readonly T_acc: number;
  public readonly a_peak_osc: number;
  public readonly a_peak_entry: number;
  public readonly maxVelocity: number;
  public readonly d_acc_entry: number;
  public readonly d_acc_osc: number;

  public readonly T_entryCruise: number;
  public readonly T_entryTotal: number;

  public readonly d_cruise_osc: number;
  public readonly T_cruise_osc: number;
  public readonly T_half: number;
  public readonly T_period: number;

  public readonly zOmega: number;

  // Analytical velocity evolution parameters across boom
  public readonly w1: number;
  public readonly w2: number;
  public readonly A1_entry: number;
  public readonly A2_entry: number;
  public readonly P_end_entry: number;

  public readonly A1_osc: number;
  public readonly A2_osc: number;
  public readonly P_end_osc: number;

  constructor(
    entrySpawnX: number,
    entrySide: 'LEFT' | 'RIGHT',
    ampX: number,
    ampZ: number,
    speedMult: number,
    speedVariation: number = 1.0
  ) {
    this.entrySpawnX = entrySpawnX;
    this.entrySide = entrySide;
    this.ampX = Math.max(ampX, 1.2);
    this.ampZ = ampZ;
    this.speedMult = Math.max(speedMult * speedVariation, 0.5);

    // Cruise velocities (m/s) scaled directly and proportionally with continuous speed multiplier
    this.V_entryCruise = 3.20 * this.speedMult;
    this.V_oscCruise = 1.80 * this.speedMult;

    // Acceleration duration: crisp, smooth S-curve (0.38s down to 0.28s on high floors)
    // Scale acceleration moderately (a_peak proportional to speedMult^1.35)
    this.T_acc = Math.max(0.24, 0.38 / Math.pow(this.speedMult, 0.35));

    this.a_peak_osc = this.V_oscCruise * 0.5 * (Math.PI / this.T_acc);
    this.a_peak_entry = this.V_entryCruise * 0.5 * (Math.PI / this.T_acc);
    this.maxVelocity = Math.max(this.V_entryCruise, this.V_oscCruise);

    this.d_acc_entry = 0.5 * this.V_entryCruise * this.T_acc;
    this.d_acc_osc = 0.5 * this.V_oscCruise * this.T_acc;

    const dir = this.entrySide === 'LEFT' ? 1 : -1;
    const firstLimitX = dir * this.ampX;
    const totalEntryDist = Math.abs(firstLimitX - this.entrySpawnX);
    const entryCruiseDist = Math.max(0.1, totalEntryDist - 2 * this.d_acc_entry);

    this.T_entryCruise = entryCruiseDist / this.V_entryCruise;
    this.T_entryTotal = 2 * this.T_acc + this.T_entryCruise;

    // Steady periodic boom traversal
    this.d_cruise_osc = Math.max(0.15, 2 * this.ampX - 2 * this.d_acc_osc);
    this.T_cruise_osc = this.d_cruise_osc / this.V_oscCruise;
    this.T_half = 2 * this.T_acc + this.T_cruise_osc;
    this.T_period = 2 * this.T_half;

    // Lateral Z frequency (smooth, non-harmonic)
    this.zOmega = (2 * Math.PI) / (Math.max(3.6, 5.2 / Math.sqrt(this.speedMult)));

    // Frequency components with incommensurate (golden ratio) ratio to prevent simple repeating beats
    this.w1 = (2 * Math.PI) / (Math.max(2.4, 3.8 / Math.sqrt(this.speedMult)));
    this.w2 = this.w1 * 1.6180339887; // Golden ratio phi

    // Modulation amplitudes scaled smoothly with floor speed multiplier:
    // Floor 1 (~1.0x): A1 ~0.10, A2 ~0.06 (gentle, readable)
    // Floor 20 (~1.3x): A1 ~0.14, A2 ~0.08
    // Floor 50 (~1.9x): A1 ~0.19, A2 ~0.11 (vigorous, demanding)
    this.A1_entry = Math.min(0.24, 0.10 * Math.pow(this.speedMult, 0.70));
    this.A2_entry = this.A1_entry * (this.w1 / this.w2);
    this.P_end_entry = this.evalPeriodicDist(this.T_entryCruise, this.A1_entry, this.A2_entry);

    this.A1_osc = Math.min(0.20, 0.08 * Math.pow(this.speedMult, 0.70));
    this.A2_osc = this.A1_osc * (this.w1 / this.w2);
    this.P_end_osc = this.evalPeriodicDist(this.T_cruise_osc, this.A1_osc, this.A2_osc);
  }

  private evalPeriodicDist(dt: number, A1: number, A2: number): number {
    return (A1 / this.w1) * (1 - Math.cos(this.w1 * dt)) - (A2 / this.w2) * (1 - Math.cos(this.w2 * dt));
  }

  public evaluate(time: number): TrolleyState {
    const t = Math.max(time, 0);
    const dir = this.entrySide === 'LEFT' ? 1 : -1;

    let x = 0;
    let vx = 0;
    let ax = 0;
    let isCruising = false;
    let isTurning = false;

    if (t < this.T_entryTotal) {
      // Stage 1: Offscreen entry
      if (t < this.T_acc) {
        // Smooth ramp up from v=0
        const tau = t / this.T_acc;
        vx = dir * this.V_entryCruise * 0.5 * (1 - Math.cos(Math.PI * tau));
        ax = dir * this.V_entryCruise * 0.5 * (Math.PI / this.T_acc) * Math.sin(Math.PI * tau);
        const dist = dir * this.V_entryCruise * 0.5 * (t - (this.T_acc / Math.PI) * Math.sin(Math.PI * tau));
        x = this.entrySpawnX + dist;
      } else if (t < this.T_acc + this.T_entryCruise) {
        // Continuous smooth velocity evolution during boom traversal across center (NO constant velocity pause!)
        const dtCruise = t - this.T_acc;
        const tau = dtCruise / this.T_entryCruise;
        const pDist = this.evalPeriodicDist(dtCruise, this.A1_entry, this.A2_entry);
        const dx = this.V_entryCruise * (dtCruise + pDist - tau * this.P_end_entry);

        const dP_dt = this.A1_entry * Math.sin(this.w1 * dtCruise) - this.A2_entry * Math.sin(this.w2 * dtCruise);
        vx = dir * this.V_entryCruise * (1 + dP_dt - (this.P_end_entry / this.T_entryCruise));

        const d2P_dt2 = this.A1_entry * this.w1 * Math.cos(this.w1 * dtCruise) - this.A2_entry * this.w2 * Math.cos(this.w2 * dtCruise);
        ax = dir * this.V_entryCruise * d2P_dt2;

        x = this.entrySpawnX + dir * (this.d_acc_entry + dx);
        isCruising = true;
      } else {
        // Smooth deceleration into first turnaround limit
        const dtDecel = t - (this.T_acc + this.T_entryCruise);
        const tau = dtDecel / this.T_acc;
        vx = dir * this.V_entryCruise * 0.5 * (1 + Math.cos(Math.PI * tau));
        ax = -dir * this.V_entryCruise * 0.5 * (Math.PI / this.T_acc) * Math.sin(Math.PI * tau);
        const dist = dir * this.V_entryCruise * 0.5 * (dtDecel + (this.T_acc / Math.PI) * Math.sin(Math.PI * tau));
        x = this.entrySpawnX + dir * (this.d_acc_entry + this.V_entryCruise * this.T_entryCruise) + dist;
        isTurning = true;
      }
    } else {
      // Stage 2: Steady periodic oscillation between +ampX and -ampX
      const tCycle = t - this.T_entryTotal;
      const modT = tCycle % this.T_period;

      const cycleDir = modT < this.T_half ? -dir : dir;
      const subT = modT < this.T_half ? modT : (modT - this.T_half);
      const startX = modT < this.T_half ? (dir * this.ampX) : (-dir * this.ampX);

      if (subT < this.T_acc) {
        // Smooth acceleration out of limit
        const tau = subT / this.T_acc;
        vx = cycleDir * this.V_oscCruise * 0.5 * (1 - Math.cos(Math.PI * tau));
        ax = cycleDir * this.V_oscCruise * 0.5 * (Math.PI / this.T_acc) * Math.sin(Math.PI * tau);
        const dist = cycleDir * this.V_oscCruise * 0.5 * (subT - (this.T_acc / Math.PI) * Math.sin(Math.PI * tau));
        x = startX + dist;
        isTurning = true;
      } else if (subT < this.T_acc + this.T_cruise_osc) {
        // Continuous smooth velocity evolution during periodic boom traversal
        const dtCruise = subT - this.T_acc;
        const tau = dtCruise / this.T_cruise_osc;
        const pDist = this.evalPeriodicDist(dtCruise, this.A1_osc, this.A2_osc);
        const dx = this.V_oscCruise * (dtCruise + pDist - tau * this.P_end_osc);

        const dP_dt = this.A1_osc * Math.sin(this.w1 * dtCruise) - this.A2_osc * Math.sin(this.w2 * dtCruise);
        vx = cycleDir * this.V_oscCruise * (1 + dP_dt - (this.P_end_osc / this.T_cruise_osc));

        const d2P_dt2 = this.A1_osc * this.w1 * Math.cos(this.w1 * dtCruise) - this.A2_osc * this.w2 * Math.cos(this.w2 * dtCruise);
        ax = cycleDir * this.V_oscCruise * d2P_dt2;

        x = startX + cycleDir * (this.d_acc_osc + dx);
        isCruising = true;
      } else {
        // Smooth braking into opposite limit
        const dtDecel = subT - (this.T_acc + this.T_cruise_osc);
        const tau = dtDecel / this.T_acc;
        vx = cycleDir * this.V_oscCruise * 0.5 * (1 + Math.cos(Math.PI * tau));
        ax = -cycleDir * this.V_oscCruise * 0.5 * (Math.PI / this.T_acc) * Math.sin(Math.PI * tau);
        const dist = cycleDir * this.V_oscCruise * 0.5 * (dtDecel + (this.T_acc / Math.PI) * Math.sin(Math.PI * tau));
        x = startX + cycleDir * (this.d_acc_osc + this.V_oscCruise * this.T_cruise_osc) + dist;
        isTurning = true;
      }
    }

    // Lateral Z support motion: smooth excursion
    // Scaled to ampZ from difficulty curve
    let z = 0;
    let vz = 0;
    let az = 0;
    if (this.ampZ > 0.01) {
      const zPhase = t * this.zOmega;
      z = Math.cos(zPhase) * this.ampZ;
      vz = -Math.sin(zPhase) * this.ampZ * this.zOmega;
      az = -Math.cos(zPhase) * this.ampZ * this.zOmega * this.zOmega;
    }

    return { x, vx, ax, z, vz, az, isCruising, isTurning };
  }
}
