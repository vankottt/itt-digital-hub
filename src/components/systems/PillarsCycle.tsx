import type { Locale } from "@/lib/i18n";
import { pillars } from "@/content/methodology";
import { ArrowDefs, Edge, Figure } from "./diagram-primitives";
import { InView } from "./InView";

/**
 * The three pillars as one feedback cycle: Education → Research → Applied
 * science, with the applied layer feeding back to both (dashed, amber).
 * Labels carry the pillar titles only; the relations are listed beside it.
 */
export function PillarsCycle({ locale, title, desc, compact = false }: { locale: Locale; title: string; desc: string; compact?: boolean }) {
  const id = "pillars";
  const [edu, res, app] = pillars;
  if (!edu || !res || !app) return null;
  // Triangle centres (viewBox 560 × 420)
  const E = { x: 280, y: 84 };
  const R = { x: 92, y: 320 };
  const A = { x: 468, y: 320 };
  const r = 34;

  const node = (c: { x: number; y: number }, code: string, accent = false) => (
    <g>
      <circle cx={c.x} cy={c.y} r={r} fill="var(--color-paper)" stroke={accent ? "var(--color-amber)" : "var(--color-ink)"} strokeWidth={accent ? 1.4 : 1} />
      <text x={c.x} y={c.y + 5} textAnchor="middle" fontSize="17" fontWeight="500" className="font-serif" fill="var(--color-ink)">
        {code}
      </text>
    </g>
  );

  const label = (x: number, y: number, name: string, anchor: "start" | "middle" | "end") => (
    <text x={x} y={y} textAnchor={anchor} fontSize="17" fontWeight="500" className="font-sans" fill="var(--color-ink)">
      {name}
    </text>
  );

  return (
    <Figure title={title} desc={desc} className={compact ? "max-w-md" : undefined}>
      <InView>
        <svg viewBox="0 0 560 420" className="h-auto w-full" aria-hidden="true">
          <ArrowDefs id={id} tone="ink" />
          <Edge id={id} tone="ink" draw delay={0} d={`M${E.x - 28},${E.y + 20} L${R.x + 22},${R.y - 28}`} />
          <Edge id={id} tone="ink" draw delay={0.18} d={`M${R.x + r + 4},${R.y} H${A.x - r - 6}`} />
          <Edge id={id} tone="ink" amber dashed fade delay={0.42} d={`M${A.x - 22},${A.y - 28} L${E.x + 28},${E.y + 20}`} />
          <Edge id={id} tone="ink" amber dashed fade delay={0.55} d={`M${A.x - r - 4},${A.y + 16} Q280,392 ${R.x + r + 6},${R.y + 16}`} />
        {node(E, edu.code)}
        {node(R, res.code)}
        {node(A, app.code, true)}
        {label(E.x, E.y - r - 16, edu.title[locale], "middle")}
        {label(R.x - r, R.y + r + 26, res.title[locale], "start")}
        {label(A.x + r, A.y + r + 26, app.title[locale], "end")}
        <circle cx={A.x + r - 6} cy={A.y - r + 6} r="3.5" fill="var(--color-amber)" />
      </svg>
      </InView>
    </Figure>
  );
}
