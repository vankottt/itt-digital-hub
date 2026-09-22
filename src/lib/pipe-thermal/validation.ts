import { PIPE_LENGTH_M } from "./constants";
import type { FieldError, HOutMode, PipeThermalField, PipeThermalInput, ValidationResult, WindClass } from "./types";

export type RawPipeThermalInput = {
  t0C: unknown;
  toutC: unknown;
  dOutMm: unknown;
  tPeMm: unknown;
  tInsMm: unknown;
  kPe: unknown;
  kIns: unknown;
  hOutMode: unknown;
  wind: unknown;
  windSpeedMs: unknown;
  hManual: unknown;
  flowM3h: unknown;
  includePeCapacity: unknown;
  kWater: unknown;
  muWater: unknown;
  prWater: unknown;
  kAir: unknown;
  rhoWater: unknown;
  cpWater: unknown;
  rhoPe: unknown;
  cpPe: unknown;
  lengthM?: unknown;
};

const LIMITS: Record<
  Exclude<PipeThermalField, never>,
  { min: number; max: number }
> = {
  t0C: { min: -40, max: 150 },
  toutC: { min: -60, max: 80 },
  dOutMm: { min: 10, max: 2000 },
  tPeMm: { min: 0.3, max: 80 },
  tInsMm: { min: 0, max: 300 },
  kPe: { min: 0.05, max: 5 },
  kIns: { min: 0.01, max: 0.2 },
  windSpeedMs: { min: 0, max: 40 },
  hManual: { min: 0.5, max: 80 },
  flowM3h: { min: 0, max: 200 },
  kWater: { min: 0.4, max: 0.8 },
  muWater: { min: 1e-5, max: 0.02 },
  prWater: { min: 1, max: 20 },
  kAir: { min: 0.015, max: 0.04 },
  rhoWater: { min: 900, max: 1100 },
  cpWater: { min: 3500, max: 5000 },
  rhoPe: { min: 800, max: 1200 },
  cpPe: { min: 1500, max: 3000 },
};

const WIND: readonly WindClass[] = ["calm", "breeze", "windy"];
const MODES: readonly HOutMode[] = ["wind", "physics", "manual"];

function parseNumber(value: unknown, field: PipeThermalField, errors: FieldError[]): number | null {
  if (value === "" || value === null || value === undefined) {
    errors.push({ field, code: "required" });
    return null;
  }
  const n = typeof value === "number" ? value : Number(String(value).trim().replace(",", "."));
  if (!Number.isFinite(n)) {
    errors.push({ field, code: "not-finite" });
    return null;
  }
  const { min, max } = LIMITS[field];
  if (n < min) {
    errors.push({ field, code: "too-small" });
    return null;
  }
  if (n > max) {
    errors.push({ field, code: "too-large" });
    return null;
  }
  return n;
}

function asWind(value: unknown): WindClass {
  return WIND.includes(value as WindClass) ? (value as WindClass) : "calm";
}

function asMode(value: unknown): HOutMode {
  return MODES.includes(value as HOutMode) ? (value as HOutMode) : "wind";
}

/** Validate a raw form/API payload against the Excel model's physical limits. */
export function validatePipeThermalInput(raw: RawPipeThermalInput): ValidationResult {
  const errors: FieldError[] = [];
  const t0C = parseNumber(raw.t0C, "t0C", errors);
  const toutC = parseNumber(raw.toutC, "toutC", errors);
  const dOutMm = parseNumber(raw.dOutMm, "dOutMm", errors);
  const tPeMm = parseNumber(raw.tPeMm, "tPeMm", errors);
  const tInsMm = parseNumber(raw.tInsMm, "tInsMm", errors);
  const kPe = parseNumber(raw.kPe, "kPe", errors);
  const kIns = parseNumber(raw.kIns, "kIns", errors);
  const windSpeedMs = parseNumber(raw.windSpeedMs, "windSpeedMs", errors);
  const hManual = parseNumber(raw.hManual, "hManual", errors);
  const flowM3h = parseNumber(raw.flowM3h, "flowM3h", errors);
  const kWater = parseNumber(raw.kWater, "kWater", errors);
  const muWater = parseNumber(raw.muWater, "muWater", errors);
  const prWater = parseNumber(raw.prWater, "prWater", errors);
  const kAir = parseNumber(raw.kAir, "kAir", errors);
  const rhoWater = parseNumber(raw.rhoWater, "rhoWater", errors);
  const cpWater = parseNumber(raw.cpWater, "cpWater", errors);
  const rhoPe = parseNumber(raw.rhoPe, "rhoPe", errors);
  const cpPe = parseNumber(raw.cpPe, "cpPe", errors);

  if (dOutMm !== null && tPeMm !== null) {
    const innerMm = dOutMm - 2 * tPeMm;
    if (!(innerMm > 1)) {
      errors.push({ field: "tPeMm", code: "geometry" });
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  const input: PipeThermalInput = {
    t0C: t0C as number,
    toutC: toutC as number,
    dOutMm: dOutMm as number,
    tPeMm: tPeMm as number,
    tInsMm: tInsMm as number,
    kPe: kPe as number,
    kIns: kIns as number,
    hOutMode: asMode(raw.hOutMode),
    wind: asWind(raw.wind),
    windSpeedMs: windSpeedMs as number,
    hManual: hManual as number,
    flowM3h: flowM3h as number,
    includePeCapacity: Boolean(raw.includePeCapacity),
    kWater: kWater as number,
    muWater: muWater as number,
    prWater: prWater as number,
    kAir: kAir as number,
    rhoWater: rhoWater as number,
    cpWater: cpWater as number,
    rhoPe: rhoPe as number,
    cpPe: cpPe as number,
    lengthM: PIPE_LENGTH_M,
  };
  return { ok: true, input };
}

export function errorForField(errors: FieldError[], field: PipeThermalField): FieldError | undefined {
  return errors.find((item) => item.field === field);
}
