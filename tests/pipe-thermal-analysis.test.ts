import { describe, expect, it } from "vitest";
import {
  DEFAULT_INPUT,
  at24hCurveMarker,
  calculatePipeThermal,
  comparisonCurves,
  overlayComparisonMm,
  temperatureAtHours,
  validatePipeThermalInput,
  zeroCurveMarker,
} from "../src/lib/pipe-thermal";
import type { PipeThermalInput } from "../src/lib/pipe-thermal";

function close(actual: number, expected: number, digits = 7) {
  expect(actual).toBeCloseTo(expected, digits);
}

function run(overrides: Partial<PipeThermalInput> = {}) {
  return calculatePipeThermal({ ...DEFAULT_INPUT, ...overrides });
}

describe("pipe thermal calculation engine", () => {
  it("matches the reconstructed Excel default (Calm, 50 mm, T0=7, Tout=-30)", () => {
    const r = run();
    close(r.innerRadiusM, 0.0368);
    close(r.outerRadiusM, 0.045);
    close(r.insulationRadiusM, 0.095);
    close(r.hOut, 5);
    close(r.hIn, 1000);
    close(r.uaWK, 0.294767834713);
    close(r.tauHours, 16.7666750129);
    close(r.temperatures.at1Min, 6.96323896816);
    close(r.temperatures.at1h, 4.85776049557);
    close(r.temperatures.at6h, -4.13048604418);
    close(r.temperatures.at24h, -21.158053061);
    close(r.temperatures.at72h, -29.4950594312);
    close(r.temperatures.at7d, -29.9983532602);
    close(r.timeToZeroHours ?? Number.NaN, 3.51631598651);
    close(r.timeToFullFreezeHours ?? Number.NaN, 44.5962015926);
    close(r.heatLossAtT0W, 10.9064098844);
  });

  it("applies Churchill–Bernstein h_out from wind speed", () => {
    const r = run({ hOutMode: "physics", windSpeedMs: 5 });
    close(r.hOut, 21.8479113462);
    close(r.tauHours, 15.4896785231);
    close(r.temperatures.at24h, -22.1422598282);
    close(r.timeToZeroHours ?? Number.NaN, 3.2485036046);
  });

  it("changes tau and 24 h temperature with insulation thickness", () => {
    const thin = run({ tInsMm: 10 });
    const thick = run({ tInsMm: 90 });
    close(thin.tauHours, 7.22340548877);
    close(thin.temperatures.at24h, -28.6657286428);
    close(thick.tauHours, 23.1861476806);
    close(thick.temperatures.at24h, -16.8579486839);
    expect(thick.tauHours).toBeGreaterThan(thin.tauHours);
  });

  it("omits freeze times when ambient is not below 0 °C", () => {
    const r = run({ t0C: 20, toutC: 0 });
    expect(r.timeToZeroHours).toBeNull();
    expect(r.timeToFullFreezeHours).toBeNull();
    close(r.temperatures.at24h, 4.77943077783);
  });

  it("uses Dittus–Boelter internal convection when flow is present", () => {
    const r = run({ flowM3h: 2 });
    close(r.hIn, 626.972261817);
    close(r.tauHours, 16.7793922319);
  });

  it("adds PE wall capacity when the option is on", () => {
    const r = run({ includePeCapacity: true });
    close(r.capacityJK, 22396.546854);
    close(r.tauHours, 21.1056373266);
  });

  it("keeps Churchill U=0 as the 0.3 Nu floor from the Excel formula", () => {
    const r = run({ hOutMode: "physics", windSpeedMs: 0 });
    close(r.hOut, 0.0410526315789);
    close(r.tauHours, 216.799863231);
  });

  it("maps Windy to 25 W/m²K", () => {
    const r = run({ wind: "windy" });
    close(r.hOut, 25);
    close(r.heatLossAtT0W, 11.8420842859);
  });

  it("builds a monotonic cooling profile from T0 toward Tout", () => {
    const r = run();
    expect(r.profile.length).toBeGreaterThan(20);
    const first = r.profile[0];
    const last = r.profile[r.profile.length - 1];
    expect(first?.temperatureC).toBeCloseTo(7, 6);
    expect(last?.temperatureC ?? 0).toBeLessThan(first?.temperatureC ?? 0);
    expect(last?.temperatureC ?? 0).toBeGreaterThan(-30);
  });

  it("rejects empty, non-finite and impossible geometry", () => {
    expect(validatePipeThermalInput({ ...DEFAULT_INPUT, dOutMm: "" }).ok).toBe(false);
    expect(validatePipeThermalInput({ ...DEFAULT_INPUT, t0C: Number.NaN }).ok).toBe(false);
    expect(validatePipeThermalInput({ ...DEFAULT_INPUT, tInsMm: -1 }).ok).toBe(false);
    expect(validatePipeThermalInput({ ...DEFAULT_INPUT, tPeMm: 80, dOutMm: 90 }).ok).toBe(false);
    expect(validatePipeThermalInput(DEFAULT_INPUT).ok).toBe(true);
  });
});

describe("pipe thermal chart comparison helpers", () => {
  it("matches table calculations for 10, 50 and 90 mm curves", () => {
    const primary = run();
    const domain = primary.profile.at(-1)?.hours ?? 50;
    const overlays = comparisonCurves(DEFAULT_INPUT, [10, 50, 90], domain);

    for (const mm of [10, 50, 90] as const) {
      const table = primary.insulationCompare.find((row) => row.tInsMm === mm);
      const dedicated = run({ tInsMm: mm });
      expect(table).toBeDefined();
      close(table?.tauHours ?? Number.NaN, dedicated.tauHours);
      close(table?.temperatureAt24hC ?? Number.NaN, dedicated.temperatures.at24h);
      close(table?.timeToZeroHours ?? Number.NaN, dedicated.timeToZeroHours ?? Number.NaN);

      if (mm === DEFAULT_INPUT.tInsMm) {
        expect(overlays.some((curve) => curve.tInsMm === mm)).toBe(false);
        continue;
      }
      const curve = overlays.find((item) => item.tInsMm === mm);
      expect(curve).toBeDefined();
      close(curve?.tauHours ?? Number.NaN, table?.tauHours ?? Number.NaN);
      close(curve?.temperatureAt24hC ?? Number.NaN, table?.temperatureAt24hC ?? Number.NaN);
      const at24 = temperatureAtHours(DEFAULT_INPUT.t0C, DEFAULT_INPUT.toutC, curve?.tauSeconds ?? 0, 24);
      close(at24, table?.temperatureAt24hC ?? Number.NaN);
    }
  });

  it("does not duplicate the primary insulation thickness on the chart", () => {
    expect(overlayComparisonMm(50, [10, 50, 90])).toEqual([10, 90]);
    expect(comparisonCurves(DEFAULT_INPUT, [10, 50, 90], 50).map((curve) => curve.tInsMm)).toEqual([10, 90]);
  });

  it("uses the engine time-to-zero and 24 h results for markers", () => {
    const primary = run();
    const domain = primary.profile.at(-1)?.hours ?? 50;
    const zero = zeroCurveMarker(primary.timeToZeroHours, domain);
    const at24 = at24hCurveMarker(primary.temperatures.at24h, domain);
    expect(zero?.hours).toBe(primary.timeToZeroHours);
    expect(zero?.temperatureC).toBe(0);
    expect(at24?.hours).toBe(24);
    expect(at24?.temperatureC).toBe(primary.temperatures.at24h);
  });

  it("omits the 0 °C marker when zero is never reached", () => {
    const r = run({ t0C: 20, toutC: 0 });
    expect(r.timeToZeroHours).toBeNull();
    expect(zeroCurveMarker(r.timeToZeroHours, 50)).toBeNull();
  });

  it("recalculates comparison curves when base conditions change", () => {
    const cold = comparisonCurves({ ...DEFAULT_INPUT, toutC: -30 }, [10], 50);
    const milder = comparisonCurves({ ...DEFAULT_INPUT, toutC: -20 }, [10], 50);
    expect(cold[0]?.tInsMm).toBe(10);
    expect(milder[0]?.tInsMm).toBe(10);
    expect(cold[0]?.temperatureAt24hC).not.toBeCloseTo(milder[0]?.temperatureAt24hC ?? 0, 2);
    expect(cold[0]?.tauHours).toBeCloseTo(run({ tInsMm: 10, toutC: -30 }).tauHours, 7);
    expect(milder[0]?.tauHours).toBeCloseTo(run({ tInsMm: 10, toutC: -20 }).tauHours, 7);
  });
});
