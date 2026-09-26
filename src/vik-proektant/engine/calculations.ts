export type CalculationResult = {
  operation: string;
  inputs: Record<string, number | string>;
  normalizedInputs: Record<string, number>;
  result: Record<string, number>;
  intermediates: Array<{ name: string; value: number; unit: string }>;
  units: Record<string, string>;
  assumptions: string[];
  formula: string;
};

export type CalculationFailure = { ok: false; code: "invalid_input"; message: string };
export type CalculationSuccess = { ok: true; calculation: CalculationResult };

const FLOW_UNITS = new Set(["L/s", "m3/s"]);

export function calculatePipeDiameter(input: Record<string, unknown>): CalculationSuccess | CalculationFailure {
  const flow = readFlow(input);
  if (!flow.ok) return flow;
  const velocity = readNumber(input.velocity_m_s, "velocity_m_s", { min: 0.05, max: 15 });
  if (!velocity.ok) return velocity;
  const area = flow.value / velocity.value;
  const diameterM = Math.sqrt((4 * area) / Math.PI);
  return {
    ok: true,
    calculation: {
      operation: "calculate_pipe_diameter",
      inputs: { flow: flow.raw, flow_unit: flow.unit, velocity_m_s: velocity.value },
      normalizedInputs: { flow_m3_s: round(flow.value), velocity_m_s: velocity.value },
      result: { diameter_mm: round(diameterM * 1000), area_m2: round(area, 6) },
      intermediates: [
        { name: "area", value: round(area, 6), unit: "m2" },
        { name: "diameter", value: round(diameterM, 6), unit: "m" },
      ],
      units: { diameter_mm: "mm", area_m2: "m2" },
      assumptions: ["Кръгло напречно сечение.", "Постоянни дебит и скорост.", "Диаметърът е вътрешен хидравличен размер, не търговски DN."],
      formula: "Q = V · π · D² / 4",
    },
  };
}

export function calculateFlowVelocity(input: Record<string, unknown>): CalculationSuccess | CalculationFailure {
  const flow = readFlow(input);
  if (!flow.ok) return flow;
  const diameter = readNumber(input.diameter_mm, "diameter_mm", { min: 10, max: 4000 });
  if (!diameter.ok) return diameter;
  const diameterM = diameter.value / 1000;
  const area = Math.PI * diameterM * diameterM / 4;
  const velocity = flow.value / area;
  return {
    ok: true,
    calculation: {
      operation: "calculate_flow_velocity",
      inputs: { flow: flow.raw, flow_unit: flow.unit, diameter_mm: diameter.value },
      normalizedInputs: { flow_m3_s: round(flow.value), diameter_m: round(diameterM, 6) },
      result: { velocity_m_s: round(velocity), area_m2: round(area, 6) },
      intermediates: [{ name: "area", value: round(area, 6), unit: "m2" }],
      units: { velocity_m_s: "m/s", area_m2: "m2" },
      assumptions: ["Кръгло сечение, изцяло запълнено.", "Постоянен дебит."],
      formula: "V = Q / A, A = π · D² / 4",
    },
  };
}

export function calculateHazenWilliams(input: Record<string, unknown>): CalculationSuccess | CalculationFailure {
  const flow = readFlow(input);
  if (!flow.ok) return flow;
  const diameter = readNumber(input.diameter_mm, "diameter_mm", { min: 10, max: 4000 });
  if (!diameter.ok) return diameter;
  const length = readNumber(input.length_m, "length_m", { min: 0.1, max: 200_000 });
  if (!length.ok) return length;
  const coefficient = readNumber(input.hazen_williams_c, "hazen_williams_c", { min: 50, max: 160 });
  if (!coefficient.ok) return coefficient;
  const diameterM = diameter.value / 1000;
  const headLoss =
    (10.67 * length.value * flow.value ** 1.852) / (coefficient.value ** 1.852 * diameterM ** 4.871);
  return {
    ok: true,
    calculation: {
      operation: "calculate_hazen_williams_head_loss",
      inputs: {
        flow: flow.raw,
        flow_unit: flow.unit,
        diameter_mm: diameter.value,
        length_m: length.value,
        hazen_williams_c: coefficient.value,
      },
      normalizedInputs: { flow_m3_s: round(flow.value), diameter_m: round(diameterM, 6), length_m: length.value },
      result: { head_loss_m: round(headLoss), hydraulic_gradient_m_per_m: round(headLoss / length.value, 6) },
      intermediates: [{ name: "diameter", value: round(diameterM, 6), unit: "m" }],
      units: { head_loss_m: "m", hydraulic_gradient_m_per_m: "m/m" },
      assumptions: [
        "Формула на Hazen–Williams в SI вида hf = 10.67 · L · Q^1.852 / (C^1.852 · D^4.871).",
        "Q е в m³/s, D в m, L в m, hf в m.",
        "Коефициентът C е подаден от потребителя. Не се приема подразбирана стойност.",
        "Формулата е хидравличен модел, не нормативна стойност от корпуса.",
      ],
      formula: "hf = 10.67 · L · Q^1.852 / (C^1.852 · D^4.871)",
    },
  };
}

export function calculateManningFullPipe(input: Record<string, unknown>): CalculationSuccess | CalculationFailure {
  const diameter = readNumber(input.diameter_mm, "diameter_mm", { min: 10, max: 4000 });
  if (!diameter.ok) return diameter;
  const slope = readNumber(input.slope_m_per_m, "slope_m_per_m", { min: 0.00001, max: 0.2 });
  if (!slope.ok) return slope;
  const roughness = readNumber(input.manning_n, "manning_n", { min: 0.008, max: 0.04 });
  if (!roughness.ok) return roughness;
  const diameterM = diameter.value / 1000;
  const hydraulicRadius = diameterM / 4;
  const velocity = (1 / roughness.value) * hydraulicRadius ** (2 / 3) * Math.sqrt(slope.value);
  const area = Math.PI * diameterM * diameterM / 4;
  const discharge = velocity * area;
  return {
    ok: true,
    calculation: {
      operation: "calculate_manning_full_pipe",
      inputs: { diameter_mm: diameter.value, slope_m_per_m: slope.value, manning_n: roughness.value },
      normalizedInputs: { diameter_m: round(diameterM, 6), hydraulic_radius_m: round(hydraulicRadius, 6) },
      result: { velocity_m_s: round(velocity), discharge_m3_s: round(discharge, 6), discharge_l_s: round(discharge * 1000) },
      intermediates: [
        { name: "hydraulic_radius", value: round(hydraulicRadius, 6), unit: "m" },
        { name: "area", value: round(area, 6), unit: "m2" },
      ],
      units: { velocity_m_s: "m/s", discharge_m3_s: "m3/s", discharge_l_s: "L/s" },
      assumptions: [
        "Кръгла тръба, пълно сечение, R = D / 4.",
        "Формула на Manning: V = (1/n) · R^(2/3) · S^(1/2).",
        "n и наклонът са подадени от потребителя. Не се приема подразбирана грапавина.",
        "Частично пълнене не се изчислява.",
      ],
      formula: "V = (1/n) · R^(2/3) · S^(1/2), R = D/4",
    },
  };
}

function readFlow(input: Record<string, unknown>): { ok: true; value: number; raw: number; unit: string } | CalculationFailure {
  const unit = input.flow_unit;
  if (typeof unit !== "string" || !FLOW_UNITS.has(unit)) {
    return { ok: false, code: "invalid_input", message: "flow_unit трябва да е L/s или m3/s." };
  }
  const max = unit === "L/s" ? 5000 : 5;
  const flow = readNumber(input.flow, "flow", { min: 0.000001, max });
  if (!flow.ok) return flow;
  return { ok: true, value: unit === "L/s" ? flow.value / 1000 : flow.value, raw: flow.value, unit };
}

function readNumber(
  value: unknown,
  name: string,
  bounds: { min: number; max: number },
): { ok: true; value: number } | CalculationFailure {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { ok: false, code: "invalid_input", message: `${name} трябва да е крайно число.` };
  }
  if (value < bounds.min || value > bounds.max) {
    return { ok: false, code: "invalid_input", message: `${name} е извън допустимия обхват ${bounds.min}–${bounds.max}.` };
  }
  return { ok: true, value };
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
