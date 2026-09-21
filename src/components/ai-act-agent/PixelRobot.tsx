import type { CSSProperties } from "react";

/**
 * Pixel-art robot, drawn from a character map. Brand palette only:
 * marine body, signal accents, white face screen.
 */
const MAP = [
  "..........A...........",
  "..........A...........",
  ".........AAA..........",
  "..BBBBBBBBBBBBBBB.....",
  "..BWWWWWWWWWWWB.......",
  "..BWWEEWWWEEWWB.......",
  "..BWWEEWWWEEWWB.......",
  "..BWWWWWWWWWWWB.......",
  "..BWWWWWWWWWWWB.......",
  "..BBBBBBBBBBBBBBB.....",
  ".....BBBBBBBBB........",
  "..BBBBBBBBBBBBBBB.....",
  ".BBBBBBBBBBBBBBBBB....",
  ".BBBSBBBBBBBSBBBBB....",
  ".BBBBBBBBBBBBBBBBB....",
  ".BBBBBBBBBBBBBBBBB....",
  ".BBBBBBBBBBBBBBBBB....",
  "..BBBB.......BBBB.....",
  "..BBBB.......BBBB.....",
  "..BBBB.......BBBB.....",
] as const;

const COLORS: Record<string, string> = {
  A: "#1b3dff", // antenna — signal-2
  B: "#0a1850", // body — marine-2
  W: "#f7f8fd", // face screen — on-dark
  E: "#002cff", // eyes — signal
  S: "#1b3dff", // chest lights — signal-2
};

const COLS = MAP[0].length;
const ROWS = MAP.length;

/**
 * Half-pixel pixel-art outline: each empty cell touching the silhouette
 * (8-way) is filled only on the side(s) facing the robot, so the outline
 * reads as 0.5px instead of a full cell.
 */
function outlineCells(): Array<{ x: number; y: number; w: number; h: number }> {
  const filled = new Set<string>();
  MAP.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      if (COLORS[ch]) filled.add(`${x},${y}`);
    });
  });
  const rects = new Map<string, { x: number; y: number; w: number; h: number }>();
  const add = (x: number, y: number, w: number, h: number) => rects.set(`${x},${y},${w},${h}`, { x, y, w, h });

  for (let y = -1; y <= ROWS; y++) {
    for (let x = -1; x <= COLS; x++) {
      if (filled.has(`${x},${y}`)) continue;
      const left = filled.has(`${x - 1},${y}`);
      const right = filled.has(`${x + 1},${y}`);
      const up = filled.has(`${x},${y - 1}`);
      const down = filled.has(`${x},${y + 1}`);
      if (left) add(x, y - 0.01, 0.52, 1.02);
      if (right) add(x + 0.5, y - 0.01, 0.52, 1.02);
      if (up) add(x - 0.01, y, 1.02, 0.52);
      if (down) add(x - 0.01, y + 0.5, 1.02, 0.52);
      // Diagonal-only contact: quarter block in that corner.
      if (!right && !down && filled.has(`${x + 1},${y + 1}`)) add(x + 0.5, y + 0.5, 0.52, 0.52);
      if (!left && !down && filled.has(`${x - 1},${y + 1}`)) add(x - 0.01, y + 0.5, 0.52, 0.52);
      if (!right && !up && filled.has(`${x + 1},${y - 1}`)) add(x + 0.5, y - 0.01, 0.52, 0.52);
      if (!left && !up && filled.has(`${x - 1},${y - 1}`)) add(x - 0.01, y - 0.01, 0.52, 0.52);
    }
  }
  return [...rects.values()];
}

const OUTLINE = outlineCells();
const OUTLINE_COLOR = "#f7f8fd"; // on-dark — sticker-style silhouette

export function PixelRobot({ className, style }: { className?: string; style?: CSSProperties }) {
  const rects: Array<{ x: number; y: number; fill: string }> = [];
  MAP.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      const fill = COLORS[ch];
      if (fill) rects.push({ x, y, fill });
    });
  });

  return (
    <svg
      viewBox={`-1.5 -1.5 ${COLS + 3} ${ROWS + 3}`}
      role="img"
      aria-label="Pixel robot"
      className={className}
      style={style}
      shapeRendering="crispEdges"
    >
      {OUTLINE.map((c, i) => (
        <rect key={`o${i}`} x={c.x} y={c.y} width={c.w} height={c.h} fill={OUTLINE_COLOR} />
      ))}
      {rects.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={1.02} height={1.02} fill={r.fill} />
      ))}
    </svg>
  );
}
