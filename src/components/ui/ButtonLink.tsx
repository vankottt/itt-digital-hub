import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight } from "./Icons";

type Variant = "primary" | "secondary" | "on-dark" | "on-dark-fill";

const base =
  "inline-flex min-h-12 items-center gap-2.5 rounded-ctrl px-5 py-2.5 font-sans text-small font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";

const variants: Record<Variant, string> = {
  primary: "bg-marine text-on-dark hover:bg-marine-2",
  secondary: "border border-ink text-ink hover:border-marine hover:text-marine",
  "on-dark": "border border-on-dark/40 text-on-dark hover:border-on-dark hover:bg-on-dark/5",
  "on-dark-fill": "bg-on-dark text-marine hover:bg-paper",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  arrow = true,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      <span>{children}</span>
      {arrow ? <ArrowRight className="shrink-0" /> : null}
    </Link>
  );
}
