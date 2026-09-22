/** Wind class used when external convection is taken from the Excel selector. */
export type WindClass = "calm" | "breeze" | "windy";

/**
 * How h_out is obtained. The enhanced workbook overlapped a physics flag and a
 * wind-override flag; the product exposes the three resulting modes explicitly.
 */
export type HOutMode = "wind" | "physics" | "manual";

/** Validated SI-ready input for the lumped-capacity PE-pipe model. */
export type PipeThermalInput = {
  t0C: number;
  toutC: number;
  dOutMm: number;
  tPeMm: number;
  tInsMm: number;
  kPe: number;
  kIns: number;
  hOutMode: HOutMode;
  wind: WindClass;
  windSpeedMs: number;
  hManual: number;
  flowM3h: number;
  includePeCapacity: boolean;
  kWater: number;
  muWater: number;
  prWater: number;
  kAir: number;
  rhoWater: number;
  cpWater: number;
  rhoPe: number;
  cpPe: number;
  lengthM: number;
};

export type PipeThermalField =
  | "t0C"
  | "toutC"
  | "dOutMm"
  | "tPeMm"
  | "tInsMm"
  | "kPe"
  | "kIns"
  | "windSpeedMs"
  | "hManual"
  | "flowM3h"
  | "kWater"
  | "muWater"
  | "prWater"
  | "kAir"
  | "rhoWater"
  | "cpWater"
  | "rhoPe"
  | "cpPe";

export type FieldError = {
  field: PipeThermalField;
  code: "required" | "not-finite" | "too-small" | "too-large" | "geometry";
};

export type ValidationResult =
  | { ok: true; input: PipeThermalInput }
  | { ok: false; errors: FieldError[] };

export type ThermalProfilePoint = {
  hours: number;
  temperatureC: number;
};

export type InsulationCompareRow = {
  tInsMm: number;
  tauHours: number;
  temperatureAt24hC: number;
  timeToZeroHours: number | null;
};

export type PipeThermalResult = {
  innerRadiusM: number;
  outerRadiusM: number;
  insulationRadiusM: number;
  innerAreaM2: number;
  convectionAreaM2: number;
  innerSurfaceAreaM2: number;
  hOut: number;
  hIn: number;
  rConvIn: number;
  rCondPe: number;
  rCondIns: number;
  rConvOut: number;
  rTotal: number;
  uaWK: number;
  waterMassKg: number;
  peMassKg: number;
  capacityJK: number;
  tauSeconds: number;
  tauHours: number;
  heatLossAtT0W: number;
  timeToZeroHours: number | null;
  timeToFullFreezeHours: number | null;
  temperatures: {
    at1Min: number;
    at1h: number;
    at2h: number;
    at3h: number;
    at6h: number;
    at12h: number;
    at24h: number;
    at48h: number;
    at72h: number;
    at7d: number;
  };
  profile: ThermalProfilePoint[];
  insulationCompare: InsulationCompareRow[];
};
