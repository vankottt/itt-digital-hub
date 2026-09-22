import { calculatePipeThermal, temperatureAtHours } from "./engine";
import type { PipeThermalInput, ThermalProfilePoint } from "./types";

export { temperatureAtHours };

export type ComparisonCurve = {
  tInsMm: number;
  tauHours: number;
  tauSeconds: number;
  temperatureAt24hC: number;
  timeToZeroHours: number | null;
  profile: ThermalProfilePoint[];
};

export type ChartMarker = {
  hours: number;
  temperatureC: number;
};

export function sampleProfileOnDomain(
  t0C: number,
  toutC: number,
  tauSeconds: number,
  domainHours: number,
  count = 97,
): ThermalProfilePoint[] {
  const span = Math.max(domainHours, 1);
  const points: ThermalProfilePoint[] = [];
  for (let i = 0; i < count; i += 1) {
    const hours = (span * i) / (count - 1);
    points.push({ hours, temperatureC: temperatureAtHours(t0C, toutC, tauSeconds, hours) });
  }
  return points;
}

export function hoursFromPlotX(svgX: number, plotLeft: number, innerW: number, xMax: number): number {
  const ratio = (svgX - plotLeft) / innerW;
  if (ratio <= 0) return 0;
  if (ratio >= 1) return xMax;
  return ratio * xMax;
}

export function zeroCurveMarker(timeToZeroHours: number | null, xMax: number): ChartMarker | null {
  if (timeToZeroHours === null) return null;
  if (timeToZeroHours < 0 || timeToZeroHours > xMax) return null;
  return { hours: timeToZeroHours, temperatureC: 0 };
}

export function at24hCurveMarker(temperatureAt24hC: number, xMax: number): ChartMarker | null {
  if (xMax < 24) return null;
  return { hours: 24, temperatureC: temperatureAt24hC };
}

/** Thicknesses the table may overlay on the chart — never the live input. */
export function overlayComparisonMm(currentMm: number, selected: readonly number[]): number[] {
  return selected.filter((mm) => mm !== currentMm);
}

export function comparisonCurves(
  input: PipeThermalInput,
  selectedMm: readonly number[],
  domainHours: number,
): ComparisonCurve[] {
  return overlayComparisonMm(input.tInsMm, selectedMm).map((tInsMm) => {
    const result = calculatePipeThermal({ ...input, tInsMm });
    return {
      tInsMm,
      tauHours: result.tauHours,
      tauSeconds: result.tauSeconds,
      temperatureAt24hC: result.temperatures.at24h,
      timeToZeroHours: result.timeToZeroHours,
      profile: sampleProfileOnDomain(input.t0C, input.toutC, result.tauSeconds, domainHours),
    };
  });
}
