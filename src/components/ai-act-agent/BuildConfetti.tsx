"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const COLORS = ["#002cff", "#1b3dff", "#0a1850", "#f7f8fd", "#9aa8c4"];
const PIECES = 28;

/**
 * One-shot confetti burst for the build completion band. Renders nothing
 * until the band scrolls into view; disabled for reduced motion.
 */
export function BuildConfetti() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const host = document.querySelector<HTMLElement>("[data-build-step='complete']");
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [reduced]);

  if (!active || reduced) return null;

  return (
    <div className="build-confetti" aria-hidden="true">
      {Array.from({ length: PIECES }, (_, i) => {
        const style: CSSProperties = {
          left: `${(i / PIECES) * 100 + (i % 3)}%`,
          "--confetti-color": COLORS[i % COLORS.length],
          "--confetti-delay": `${(i % 7) * 0.18}s`,
          "--confetti-duration": `${2.6 + (i % 5) * 0.35}s`,
        } as CSSProperties;
        return <i key={i} style={style} />;
      })}
    </div>
  );
}
