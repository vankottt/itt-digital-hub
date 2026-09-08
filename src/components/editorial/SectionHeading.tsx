import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Mono label + serif heading (+ optional lead), the standard section opening.
 * `level` controls the heading element for a correct document outline.
 * Heading may be omitted; then `id` lands on the label so the section
 * can still be named via `aria-labelledby`.
 */
export function SectionHeading({
  label,
  heading,
  lead,
  id,
  level = 2,
  tone = "ink",
  align = "start",
  className,
  children,
}: {
  label?: string;
  heading?: string;
  lead?: ReactNode;
  id?: string;
  level?: 1 | 2 | 3;
  tone?: "ink" | "on-dark";
  align?: "start" | "split";
  className?: string;
  children?: ReactNode;
}) {
  const Heading = (`h${level}` as const) satisfies "h1" | "h2" | "h3";
  const headingSize = level === 1 ? "text-h1" : level === 2 ? "text-h2" : "text-h3";
  const dark = tone === "on-dark";

  return (
    <div className={cn(align === "split" ? "grid gap-6 lg:grid-cols-12 lg:gap-10" : "max-w-3xl", className)}>
      <div className={align === "split" ? "lg:col-span-5" : undefined}>
        {label ? (
          <p id={heading ? undefined : id} className={cn(dark ? "label-dark" : "label", heading && "mb-4")}>
            {label}
          </p>
        ) : null}
        {heading ? (
          <Heading id={id} className={cn(headingSize, dark && "text-on-dark")}>
            {heading}
          </Heading>
        ) : null}
      </div>
      {lead || children ? (
        <div className={cn(align === "split" ? cn("lg:col-span-7", heading && "lg:pt-9") : "mt-6", "max-w-2xl")}>
          {lead ? <p className={cn("text-lead", dark ? "text-on-dark-muted" : "text-ink-2")}>{lead}</p> : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}
