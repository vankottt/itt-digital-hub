import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";

/** Internal page opening: optional back, mono label, serif h1, lead; optional aside on the right. */
export function PageHeader({
  back,
  label,
  heading,
  lead,
  aside,
  className,
}: {
  back?: ReactNode;
  label?: string;
  heading: string;
  lead?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("bg-paper", className)}>
      <Container className="grid gap-10 pt-12 pb-12 md:pt-16 md:pb-14 lg:grid-cols-12 lg:gap-12">
        <div className={aside ? "lg:col-span-8" : "lg:col-span-10"}>
          {back ? <div className="mb-6">{back}</div> : null}
          {label ? <p className="label mb-5">{label}</p> : null}
          <h1 className="text-h1 text-pretty text-ink">{heading}</h1>
          {lead ? <p className="mt-7 max-w-[62ch] text-lead text-ink-2">{lead}</p> : null}
        </div>
        {aside ? <div className="lg:col-span-4 lg:pt-10">{aside}</div> : null}
      </Container>
    </header>
  );
}
