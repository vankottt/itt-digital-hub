import type { HOutMode, PipeThermalInput, WindClass } from "./types";

/** Model length in the Excel Notes: lumped capacity of one metre of PE pipe. */
export const PIPE_LENGTH_M = 1;

/** Calm / Breeze / Windy selector from Inputs (W/m²K). */
export const WIND_H_OUT: Record<WindClass, number> = {
  calm: 5,
  breeze: 15,
  windy: 25,
};

/** Churchill–Bernstein air properties hardcoded in Inputs!B32. */
export const AIR_KINEMATIC_VISCOSITY_M2_S = 0.000015;
export const AIR_PRANDTL = 0.71;
export const CHURCHILL_RE_REF = 282_000;

/** Water density used for mass and Dittus–Boelter (original compact layout). */
export const WATER_DENSITY_KG_M3 = 1000;
/** Specific heat used for water thermal capacity. */
export const WATER_CP_J_KG_K = 4182;
/** Latent heat of fusion from Results!B34. */
export const ICE_LATENT_HEAT_J_KG = 333_700;

export const PE_DENSITY_KG_M3 = 950;
export const PE_CP_J_KG_K = 2300;

/** Sample times on the Results sheet (hours). */
export const EXCEL_RESULT_HOURS = [1 / 60, 1, 2, 3, 6, 12, 24, 48, 72, 168] as const;

/** Insulation thicknesses on Compare_Insulation. */
export const COMPARE_INSULATION_MM = [10, 50, 90] as const;

export const WIND_CLASSES: readonly WindClass[] = ["calm", "breeze", "windy"];
export const H_OUT_MODES: readonly HOutMode[] = ["wind", "physics", "manual"];

/**
 * Representative initial state: Excel geometry and temperatures, Calm h_out,
 * 50 mm insulation (middle Compare_Insulation case). Physics-from-U with U = 0
 * is available as a mode but is not the opening scenario because Churchill's
 * 0.3 term then yields an unrealistically small h_out.
 */
export const DEFAULT_INPUT: PipeThermalInput = {
  t0C: 7,
  toutC: -30,
  dOutMm: 90,
  tPeMm: 8.2,
  tInsMm: 50,
  kPe: 0.4,
  kIns: 0.04,
  hOutMode: "wind",
  wind: "calm",
  windSpeedMs: 0,
  hManual: 5,
  flowM3h: 0,
  includePeCapacity: false,
  kWater: 0.6,
  muWater: 0.001,
  prWater: 7,
  kAir: 0.026,
  rhoWater: WATER_DENSITY_KG_M3,
  cpWater: WATER_CP_J_KG_K,
  rhoPe: PE_DENSITY_KG_M3,
  cpPe: PE_CP_J_KG_K,
  lengthM: PIPE_LENGTH_M,
};
