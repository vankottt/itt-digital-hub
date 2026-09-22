"use client";

import { useId, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { pipeThermalAnalysis as copy } from "@/content/pipe-thermal-analysis";
import {
  at24hCurveMarker,
  formatHours,
  formatTemperature,
  hoursFromPlotX,
  temperatureAtHours,
  zeroCurveMarker,
  type ComparisonCurve,
} from "@/lib/pipe-thermal";

type Point = { hours: number; temperatureC: number };

const COMPARE_STYLE: Record<number, { stroke: string; dash: string }> = {
  10: { stroke: "var(--color-marine)", dash: "6 4" },
  50: { stroke: "var(--color-spruce)", dash: "3.5 4" },
  90: { stroke: "var(--color-ink-2)", dash: "1.5 3.5" },
};

export function compareLineStyle(tInsMm: number): { stroke: string; dash: string } {
  return COMPARE_STYLE[tInsMm] ?? { stroke: "var(--color-ink-3)", dash: "4 4" };
}

export function TemperatureChart({
  locale,
  points,
  t0C,
  toutC,
  tauSeconds,
  timeToZeroHours,
  temperatureAt24hC,
  currentTInsMm,
  comparisons = [],
}: {
  locale: Locale;
  points: Point[];
  t0C: number;
  toutC: number;
  tauSeconds: number;
  timeToZeroHours: number | null;
  temperatureAt24hC: number;
  currentTInsMm: number;
  comparisons?: ComparisonCurve[];
}) {
  const c = copy.chart;
  const id = useId();
  const [hover, setHover] = useState<Point | null>(null);

  const geom = useMemo(() => {
    const width = 720;
    const height = 300;
    const pad = { l: 52, r: 16, t: 22, b: 36 };
    const innerW = width - pad.l - pad.r;
    const innerH = height - pad.t - pad.b;
    const xMax = Math.max(points.at(-1)?.hours ?? 24, 1);
    const temps = [
      ...points.map((p) => p.temperatureC),
      ...comparisons.flatMap((series) => series.profile.map((p) => p.temperatureC)),
    ];
    const yRawMin = Math.min(toutC, t0C, 0, ...temps);
    const yRawMax = Math.max(toutC, t0C, 0, ...temps);
    const yPad = Math.max(2, (yRawMax - yRawMin) * 0.08);
    const yMin = yRawMin - yPad;
    const yMax = yRawMax + yPad;
    const x = (hours: number) => pad.l + (hours / xMax) * innerW;
    const y = (temp: number) => pad.t + ((yMax - temp) / (yMax - yMin)) * innerH;
    const line = pathFromPoints(points, x, y);
    const yTicks = niceTicks(yMin, yMax, 5);
    const xTicks = niceTicks(0, xMax, 6);
    return { width, height, pad, innerW, innerH, xMax, yMin, yMax, x, y, line, yTicks, xTicks };
  }, [points, comparisons, t0C, toutC]);

  const zeroMark = zeroCurveMarker(timeToZeroHours, geom.xMax);
  const mark24 = at24hCurveMarker(temperatureAt24hC, geom.xMax);
  const labelsCollide =
    zeroMark && mark24 ? Math.abs(geom.x(zeroMark.hours) - geom.x(mark24.hours)) < 86 : false;

  function readPoint(clientX: number, target: SVGSVGElement): Point | null {
    const rect = target.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const svgX = ((clientX - rect.left) / rect.width) * geom.width;
    if (svgX < geom.pad.l || svgX > geom.width - geom.pad.r) return null;
    const hours = hoursFromPlotX(svgX, geom.pad.l, geom.innerW, geom.xMax);
    return { hours, temperatureC: temperatureAtHours(t0C, toutC, tauSeconds, hours) };
  }

  const active = hover;
  const zeroInRange = geom.yMin < 0 && geom.yMax > 0;
  const hasOverlays = comparisons.length > 0;
  const tooltipFlipX = active ? geom.x(active.hours) > geom.pad.l + geom.innerW * 0.62 : false;
  const tooltipFlipY = active ? geom.y(active.temperatureC) < geom.pad.t + geom.innerH * 0.3 : false;

  return (
    <figure className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <figcaption className="text-h4 text-ink">{c.title[locale]}</figcaption>
        <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-meta text-ink-3">
          <li className="inline-flex items-center gap-2">
            <span className="h-[2px] w-4 rounded-full bg-signal" aria-hidden="true" />
            {hasOverlays
              ? `${c.series[locale]} — ${c.seriesCurrent[locale]} ${currentTInsMm} mm`
              : c.series[locale]}
          </li>
          {comparisons.map((series) => {
            const style = compareLineStyle(series.tInsMm);
            return (
              <li key={series.tInsMm} className="inline-flex items-center gap-2">
                <span
                  className="w-4 border-t-2"
                  style={{ borderColor: style.stroke, borderStyle: "dashed" }}
                  aria-hidden="true"
                />
                {series.tInsMm} mm
              </li>
            );
          })}
          <li className="inline-flex items-center gap-2">
            <span className="w-4 border-t border-dashed border-ink-3" aria-hidden="true" />
            {c.zero[locale]}
          </li>
        </ul>
      </div>
      <div className="mt-3">
        <div className="relative min-w-0">
          <svg
          role="img"
          aria-labelledby={`${id}-title`}
          viewBox={`0 0 ${geom.width} ${geom.height}`}
          className="h-auto w-full max-h-[16.5rem] cursor-crosshair touch-pan-y"
          onMouseLeave={() => setHover(null)}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setHover(null);
          }}
          onPointerMove={(event) => setHover(readPoint(event.clientX, event.currentTarget))}
          onPointerDown={(event) => setHover(readPoint(event.clientX, event.currentTarget))}
        >
          <title id={`${id}-title`}>{c.title[locale]}</title>
          <text
            x={14}
            y={geom.pad.t + geom.innerH / 2}
            textAnchor="middle"
            fill="var(--color-ink-3)"
            fontSize="11"
            fontFamily="var(--font-sans)"
            transform={`rotate(-90 14 ${geom.pad.t + geom.innerH / 2})`}
          >
            {c.y[locale]}
          </text>
          <defs>
            <clipPath id={`${id}-plot`}>
              <rect x={geom.pad.l} y={geom.pad.t} width={geom.innerW} height={geom.innerH} />
            </clipPath>
          </defs>
          {geom.yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={geom.pad.l}
                x2={geom.width - geom.pad.r}
                y1={geom.y(tick)}
                y2={geom.y(tick)}
                stroke="var(--color-line)"
                strokeWidth="1"
              />
              <text
                x={geom.pad.l - 8}
                y={geom.y(tick) + 4}
                textAnchor="end"
                fill="var(--color-ink-2)"
                fontSize="11"
                fontFamily="var(--font-sans)"
              >
                {formatTick(tick)}
              </text>
            </g>
          ))}
          <line
            x1={geom.pad.l}
            x2={geom.width - geom.pad.r}
            y1={geom.pad.t + geom.innerH}
            y2={geom.pad.t + geom.innerH}
            stroke="var(--color-line-strong)"
            strokeWidth="1"
          />
          {geom.xTicks.map((tick, index) => (
            <text
              key={`x-${tick}`}
              x={geom.x(tick)}
              y={geom.height - 14}
              textAnchor={index === 0 ? "start" : index === geom.xTicks.length - 1 ? "end" : "middle"}
              fill="var(--color-ink-2)"
              fontSize="11"
              fontFamily="var(--font-sans)"
            >
              {formatTick(tick)}
            </text>
          ))}
          <g clipPath={`url(#${id}-plot)`}>
            {zeroInRange ? (
              <line
                x1={geom.pad.l}
                x2={geom.width - geom.pad.r}
                y1={geom.y(0)}
                y2={geom.y(0)}
                stroke="var(--color-ink-3)"
                strokeDasharray="4 5"
                strokeWidth="1.25"
              />
            ) : null}
            {comparisons.map((series) => {
              const style = compareLineStyle(series.tInsMm);
              return (
                <path
                  key={series.tInsMm}
                  d={pathFromPoints(series.profile, geom.x, geom.y)}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth="1.6"
                  strokeDasharray={style.dash}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              );
            })}
            <path
              d={geom.line}
              fill="none"
              stroke="var(--color-signal)"
              strokeWidth="2.25"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {active ? (
              <g>
                <line
                  x1={geom.x(active.hours)}
                  x2={geom.x(active.hours)}
                  y1={geom.pad.t}
                  y2={geom.height - geom.pad.b}
                  stroke="var(--color-line-strong)"
                  strokeWidth="1"
                />
                <circle
                  cx={geom.x(active.hours)}
                  cy={geom.y(active.temperatureC)}
                  r="4.5"
                  fill="var(--color-signal)"
                />
              </g>
            ) : null}
          </g>
          {zeroMark ? (
            <Marker
              x={geom.x(zeroMark.hours)}
              y={geom.y(zeroMark.temperatureC)}
              label={`${c.zero[locale]} · ${formatHours(zeroMark.hours)} h`}
              fill="var(--color-marine)"
              anchor={mark24 && geom.x(zeroMark.hours) > geom.x(mark24.hours) ? "end" : "start"}
              dy={labelsCollide ? 16 : -10}
            />
          ) : null}
          {mark24 ? (
            <Marker
              x={geom.x(mark24.hours)}
              y={geom.y(mark24.temperatureC)}
              label={`24 h · ${formatTemperature(mark24.temperatureC)} °C`}
              fill="var(--color-signal)"
              anchor={geom.x(mark24.hours) > geom.pad.l + geom.innerW * 0.72 || labelsCollide ? "end" : "start"}
              dy={-10}
            />
          ) : null}
        </svg>
        {active ? (
          <div
            className="pointer-events-none absolute z-10 max-w-[11rem] rounded-md bg-marine px-2.5 py-1.5 text-meta text-on-dark shadow-[0_8px_20px_rgba(4,14,49,0.16)]"
            style={{
              left: `${(geom.x(active.hours) / geom.width) * 100}%`,
              top: `${(geom.y(active.temperatureC) / geom.height) * 100}%`,
              transform: `${tooltipFlipX ? "translateX(-112%)" : "translateX(10%)"} ${
                tooltipFlipY ? "translateY(10px)" : "translateY(calc(-100% - 10px))"
              }`,
            }}
          >
            <p>
              {c.tooltipTime[locale]}: {formatHours(active.hours)} h
            </p>
            <p>
              {c.tooltipTemp[locale]}: {formatTemperature(active.temperatureC)} °C
            </p>
          </div>
        ) : null}
        </div>
        <p className="mt-0.5 text-center text-meta text-ink-3">{c.x[locale]}</p>
      </div>
    </figure>
  );
}

function Marker({
  x,
  y,
  label,
  fill,
  anchor,
  dy,
}: {
  x: number;
  y: number;
  label: string;
  fill: string;
  anchor: "start" | "end";
  dy: number;
}) {
  const labelX = anchor === "start" ? x + 7 : x - 7;
  return (
    <g>
      <circle cx={x} cy={y} r="3.6" fill="#fff" stroke={fill} strokeWidth="1.6" />
      <text
        className="pta-chart-label"
        x={labelX}
        y={y + dy}
        textAnchor={anchor}
        fill="var(--color-ink-2)"
        fontSize="10"
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>
    </g>
  );
}

function pathFromPoints(points: Point[], x: (hours: number) => number, y: (temp: number) => number): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.hours).toFixed(2)} ${y(p.temperatureC).toFixed(2)}`).join(" ");
}

function formatTick(value: number): string {
  if (Math.abs(value) < 1e-9) return "0";
  if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-6) return String(Math.round(value));
  return value.toFixed(1);
}

function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min || 1;
  const raw = span / Math.max(count - 1, 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const residual = raw / mag;
  const step = residual >= 5 ? 5 * mag : residual >= 2 ? 2 * mag : mag;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step / 1000; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}
