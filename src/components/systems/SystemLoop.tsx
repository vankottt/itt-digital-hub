import type { Locale } from "@/lib/i18n";
import { ArrowDefs, Edge, Figure, Node } from "./diagram-primitives";
import { InView } from "./InView";

/**
 * Core system model — the homepage's first signature visual.
 * Cycle: Goals → Architecture & roles → Rules & decision points →
 * Information → Actions/outputs → Outcomes/performance → Feedback → Goals.
 * Incentives and constraints act across the cycle; the dashed frame is the environment.
 */

const labels = {
  bg: {
    env: "Външна среда",
    incentives: ["Стимули и", "ограничения"],
    nodes: [
      ["Цели"],
      ["Архитектура", "и роли"],
      ["Правила и", "точки за решения"],
      ["Информация"],
      ["Действия", "и продукти"],
      ["Резултати и", "ефективност"],
      ["Обратна връзка"],
    ],
    list: [
      "Цели — предназначението на системата и измеримите резултати",
      "Архитектура и роли — участници, компоненти и компетентности",
      "Правила и точки за решения — формални и неформални правила и процедури",
      "Информация — какво знае системата и кога",
      "Действия и продукти — какво системата произвежда",
      "Резултати и ефективност — измерени спрямо критериите",
      "Обратна връзка — коригира целите, архитектурата и правилата",
    ],
    incentivesList: "Стимулите и ограниченията действат върху всяка стъпка; средата се променя около системата.",
  },
  en: {
    env: "Environment",
    incentives: ["Incentives and", "constraints"],
    nodes: [
      ["Goals"],
      ["Architecture", "and roles"],
      ["Rules and", "decision points"],
      ["Information"],
      ["Actions", "and outputs"],
      ["Outcomes and", "performance"],
      ["Feedback"],
    ],
    list: [
      "Goals — the purpose of the system and its measurable outcomes",
      "Architecture and roles — actors, components and competences",
      "Rules and decision points — formal and informal rules and procedures",
      "Information — what the system knows and when",
      "Actions and outputs — what the system produces",
      "Outcomes and performance — measured against the criteria",
      "Feedback — corrects goals, architecture and rules",
    ],
    incentivesList: "Incentives and constraints act on every step; the environment changes around the system.",
  },
} as const;

export function SystemLoop({ locale, title, desc }: { locale: Locale; title: string; desc: string }) {
  const L = labels[locale];
  const id = "sysloop";
  const W = 148;
  const H = 54;
  const n1 = { x: 28, y: 40 };
  const n2 = { x: 246, y: 40 };
  const n3 = { x: 464, y: 40 };
  const n4 = { x: 464, y: 168 };
  const n5 = { x: 464, y: 296 };
  const n6 = { x: 246, y: 296 };
  const n7 = { x: 28, y: 296 };
  const inc = { x: 246, y: 168 };

  return (
    <>
      <Figure title={title} desc={desc} className="hidden sm:block">
        <InView>
          <svg viewBox="0 0 640 400" className="h-auto w-full" aria-hidden="true">
            <ArrowDefs id={id} tone="ink" />
            <rect x="10.5" y="12.5" width="619" height="375" fill="none" stroke="var(--color-line-strong)" strokeDasharray="3 5" />
            <text x="22" y="30" fontSize="9.5" letterSpacing="0.06em" className="font-mono" fill="var(--color-ink-3)">
              {L.env.toUpperCase()}
            </text>

            <Edge id={id} tone="ink" draw delay={0} d={`M${n1.x + W},${n1.y + H / 2} H${n2.x - 2}`} />
            <Edge id={id} tone="ink" draw delay={0.12} d={`M${n2.x + W},${n2.y + H / 2} H${n3.x - 2}`} />
            <Edge id={id} tone="ink" draw delay={0.24} d={`M${n3.x + W / 2},${n3.y + H} V${n4.y - 2}`} />
            <Edge id={id} tone="ink" draw delay={0.36} d={`M${n4.x + W / 2},${n4.y + H} V${n5.y - 2}`} />
            <Edge id={id} tone="ink" draw delay={0.48} d={`M${n5.x},${n5.y + H / 2} H${n6.x + W + 2}`} />
            <Edge id={id} tone="ink" draw delay={0.6} d={`M${n6.x},${n6.y + H / 2} H${n7.x + W + 2}`} />
            <Edge id={id} tone="ink" amber dashed fade delay={0.88} d={`M${n7.x + W / 2},${n7.y} V${n1.y + H + 2}`} />
            <Edge id={id} tone="ink" draw delay={0.72} d={`M${inc.x + W},${inc.y + H / 2} H${n4.x - 2}`} />
            <Edge id={id} tone="ink" draw delay={0.8} d={`M${inc.x},${inc.y + H / 2} H${n7.x + W + 36} V${n7.y - 2}`} />

          <Node x={n1.x} y={n1.y} w={W} h={H} code="01" lines={[...L.nodes[0]]} tone="ink" />
          <Node x={n2.x} y={n2.y} w={W} h={H} code="02" lines={[...L.nodes[1]]} tone="ink" />
          <Node x={n3.x} y={n3.y} w={W} h={H} code="03" lines={[...L.nodes[2]]} tone="ink" />
          <Node x={n4.x} y={n4.y} w={W} h={H} code="04" lines={[...L.nodes[3]]} tone="ink" />
          <Node x={n5.x} y={n5.y} w={W} h={H} code="05" lines={[...L.nodes[4]]} tone="ink" />
          <Node x={n6.x} y={n6.y} w={W} h={H} code="06" lines={[...L.nodes[5]]} tone="ink" />
          <Node x={n7.x} y={n7.y} w={W} h={H} code="07" lines={[...L.nodes[6]]} tone="ink" emphasis />
          <Node x={inc.x} y={inc.y} w={W} h={H} code="→" lines={[...L.incentives]} tone="ink" />
        </svg>
        </InView>
      </Figure>

      <div className="border border-line p-4 sm:hidden">
        <p className="label">{L.env}</p>
        <ol className="mt-3 space-y-2.5 text-small text-ink-2">
          {L.list.map((item, i) => (
            <li key={item} className="flex gap-3">
              <span className="label mt-1 w-5 shrink-0 text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <p className="rule mt-4 pt-3 text-small text-ink-2">{L.incentivesList}</p>
      </div>
    </>
  );
}
