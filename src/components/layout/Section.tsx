import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

type Tone = "paper" | "tint" | "dark";

const tones: Record<Tone, string> = {
  paper: "bg-paper",
  tint: "bg-paper-2",
  dark: "bg-marine text-on-dark",
};

/**
 * Vertical-rhythm primitive. Every section opens with a hairline rule
 * inside the container (the "ruled page" signature).
 */
export function Section({
  children,
  tone = "paper",
  id,
  className,
  rule = true,
  size = "default",
  labelledBy,
}: {
  children: ReactNode;
  tone?: Tone;
  id?: string;
  className?: string;
  rule?: boolean;
  size?: "default" | "sm";
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-surface={tone === "dark" ? "dark" : undefined}
      className={cn(tones[tone], size === "default" ? "py-section" : "py-section-sm", className)}
    >
      <Container>
        {rule ? <div className={tone === "dark" ? "rule-dark" : "rule"} aria-hidden="true" /> : null}
        <div className={rule ? "pt-8 md:pt-10" : undefined}>{children}</div>
      </Container>
    </section>
  );
}
