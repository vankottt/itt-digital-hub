import {
  AIR_KINEMATIC_VISCOSITY_M2_S,
  AIR_PRANDTL,
  CHURCHILL_RE_REF,
  COMPARE_INSULATION_MM,
  ICE_LATENT_HEAT_J_KG,
  WIND_H_OUT,
} from "./constants";
import type {
  InsulationCompareRow,
  PipeThermalInput,
  PipeThermalResult,
  ThermalProfilePoint,
} from "./types";

function churchillBernsteinHOut(windSpeedMs: number, insulationRadiusM: number, kAir: number): number {
  const diameterM = 2 * insulationRadiusM;
  const reynolds = (windSpeedMs * diameterM) / AIR_KINEMATIC_VISCOSITY_M2_S;
  const pr = AIR_PRANDTL;
  // Excel Inputs!B32 operator order: 0.3 + (0.62√Re Pr^{1/3}) / (1+(0.4/Pr)^{2/3})^{1/4} * (1+(Re/282000)^{5/8})^{4/5}
  const nusselt =
    0.3 +
    ((0.62 * Math.sqrt(reynolds) * pr ** (1 / 3)) / (1 + (0.4 / pr) ** (2 / 3)) ** 0.25) *
      (1 + (reynolds / CHURCHILL_RE_REF) ** (5 / 8)) ** (4 / 5);
  return (nusselt * kAir) / diameterM;
}

function dittusBoelterHIn(input: PipeThermalInput, innerAreaM2: number, innerRadiusM: number): number {
  if (!(input.flowM3h > 0)) return 1000;
  const velocity = input.flowM3h / 3600 / innerAreaM2;
  const diameterM = 2 * innerRadiusM;
  const reynolds = (input.rhoWater * velocity * diameterM) / input.muWater;
  const nusselt = 0.023 * reynolds ** 0.8 * input.prWater ** 0.4;
  return (nusselt * input.kWater) / diameterM;
}

function resolveHOut(input: PipeThermalInput, insulationRadiusM: number): number {
  if (input.hOutMode === "physics") return churchillBernsteinHOut(input.windSpeedMs, insulationRadiusM, input.kAir);
  if (input.hOutMode === "manual") return input.hManual;
  return WIND_H_OUT[input.wind];
}

export function temperatureAtHours(t0C: number, toutC: number, tauSeconds: number, hours: number): number {
  return toutC + (t0C - toutC) * Math.exp(-(hours * 3600) / tauSeconds);
}

function timeToZeroHours(t0C: number, toutC: number, tauHours: number): number | null {
  if (!(t0C > 0 && toutC < 0)) return null;
  return -tauHours * Math.log((0 - toutC) / (t0C - toutC));
}

function profileDomainHours(tauHours: number, toZero: number | null): number {
  const fromTau = Math.max(24, tauHours * 3);
  const fromFreeze = toZero !== null ? toZero * 1.35 : 0;
  return Math.min(168, Math.max(fromTau, fromFreeze, 12));
}

function buildProfile(t0C: number, toutC: number, tauSeconds: number, domainHours: number): ThermalProfilePoint[] {
  const count = 97;
  const points: ThermalProfilePoint[] = [];
  for (let i = 0; i < count; i += 1) {
    const hours = (domainHours * i) / (count - 1);
    points.push({ hours, temperatureC: temperatureAtHours(t0C, toutC, tauSeconds, hours) });
  }
  return points;
}

type CoreResult = {
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
};

function computeCore(input: PipeThermalInput): CoreResult {
  const lengthM = input.lengthM;
  const outerRadiusM = input.dOutMm / 1000 / 2;
  const innerRadiusM = outerRadiusM - input.tPeMm / 1000;
  const insulationRadiusM = outerRadiusM + input.tInsMm / 1000;
  const innerAreaM2 = Math.PI * innerRadiusM ** 2;
  const convectionAreaM2 = 2 * Math.PI * insulationRadiusM * lengthM;
  const innerSurfaceAreaM2 = 2 * Math.PI * innerRadiusM * lengthM;

  const hOut = resolveHOut(input, insulationRadiusM);
  const hIn = dittusBoelterHIn(input, innerAreaM2, innerRadiusM);

  const rConvIn = 1 / (hIn * innerSurfaceAreaM2);
  const rCondPe = Math.log(outerRadiusM / innerRadiusM) / (2 * Math.PI * lengthM * input.kPe);
  const rCondIns =
    insulationRadiusM <= outerRadiusM
      ? 0
      : Math.log(insulationRadiusM / outerRadiusM) / (2 * Math.PI * lengthM * input.kIns);
  const rConvOut = 1 / (hOut * convectionAreaM2);
  const rTotal = rConvIn + rCondPe + rCondIns + rConvOut;
  const uaWK = 1 / rTotal;

  const waterMassKg = input.rhoWater * innerAreaM2 * lengthM;
  const peMassKg = Math.PI * (outerRadiusM ** 2 - innerRadiusM ** 2) * lengthM * input.rhoPe;
  const capacityJK = waterMassKg * input.cpWater + (input.includePeCapacity ? peMassKg * input.cpPe : 0);
  const tauSeconds = capacityJK / uaWK;
  const tauHours = tauSeconds / 3600;
  const toZero = timeToZeroHours(input.t0C, input.toutC, tauHours);
  const timeToFullFreezeHours =
    toZero === null ? null : (waterMassKg * ICE_LATENT_HEAT_J_KG) / (uaWK * (0 - input.toutC)) / 3600;

  return {
    innerRadiusM,
    outerRadiusM,
    insulationRadiusM,
    innerAreaM2,
    convectionAreaM2,
    innerSurfaceAreaM2,
    hOut,
    hIn,
    rConvIn,
    rCondPe,
    rCondIns,
    rConvOut,
    rTotal,
    uaWK,
    waterMassKg,
    peMassKg,
    capacityJK,
    tauSeconds,
    tauHours,
    heatLossAtT0W: uaWK * (input.t0C - input.toutC),
    timeToZeroHours: toZero,
    timeToFullFreezeHours,
  };
}

/**
 * Lumped-capacity cooling of water in one metre of insulated PE pipe.
 *
 * Equations follow the Labels / Notes / formula structure of
 * Insulated_Pipe_T_cooling_calculator_v2_enhanced. The shipped workbook
 * inserted v2-enhanced rows without updating most cell addresses; this engine
 * uses the labeled physics, not the stale Results!B4/B5 references.
 */
export function calculatePipeThermal(input: PipeThermalInput): PipeThermalResult {
  const core = computeCore(input);
  const domain = profileDomainHours(core.tauHours, core.timeToZeroHours);
  const at = (h: number) => temperatureAtHours(input.t0C, input.toutC, core.tauSeconds, h);

  const compareThicknesses = [...new Set<number>([...COMPARE_INSULATION_MM, input.tInsMm])].sort((a, b) => a - b);

  const insulationCompare: InsulationCompareRow[] = compareThicknesses.map((tInsMm) => {
    const row = computeCore({ ...input, tInsMm });
    return {
      tInsMm,
      tauHours: row.tauHours,
      temperatureAt24hC: temperatureAtHours(input.t0C, input.toutC, row.tauSeconds, 24),
      timeToZeroHours: row.timeToZeroHours,
    };
  });

  return {
    ...core,
    temperatures: {
      at1Min: at(1 / 60),
      at1h: at(1),
      at2h: at(2),
      at3h: at(3),
      at6h: at(6),
      at12h: at(12),
      at24h: at(24),
      at48h: at(48),
      at72h: at(72),
      at7d: at(168),
    },
    profile: buildProfile(input.t0C, input.toutC, core.tauSeconds, domain),
    insulationCompare,
  };
}
