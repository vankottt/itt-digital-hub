import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Detail-page section: mono label + heading in the left column, content on
 * the right. Renders nothing when `children` is null so empty fields are
 * omitted elegantly.
 */
export function ProjectSection({
  id,
  code,
  heading,
  children,
  className,
}: {
  id: string;
  code?: string;
  heading: string;
  children: ReactNode;
  className?: string;
}) {
  if (children === null || children === undefined || children === false) return null;
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={cn("grid gap-5 border-t border-line py-10 md:grid-cols-12 md:gap-8", className)}>
      <div className="md:col-span-4">
        {code ? <p className="label">{code}</p> : null}
        <h2 id={`${id}-heading`} className="mt-1 text-h3 text-ink">
          {heading}
        </h2>
      </div>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}
