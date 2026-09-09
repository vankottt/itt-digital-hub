"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight } from "./Icons";
import { scrollToHomeHash } from "@/components/layout/useHomeSectionSpy";

type Variant = "primary" | "secondary" | "on-dark" | "on-dark-fill";

const base =
  "inline-flex min-h-12 items-center gap-2.5 rounded-full px-6 py-2.5 font-sans text-small font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-signal text-on-dark hover:bg-signal-2",
  secondary: "border border-ink text-ink hover:border-signal hover:text-signal",
  "on-dark": "border border-on-dark/40 text-on-dark hover:border-on-dark hover:bg-on-dark/5",
  "on-dark-fill": "bg-on-dark text-marine hover:bg-paper",
};

export function Button({
  children,
  variant = "primary",
  className,
  arrow = false,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
}) {
  return (
    <button {...props} type={type} className={cn(base, variants[variant], className)}>
      <span>{children}</span>
      {arrow ? <ArrowRight className="shrink-0" /> : null}
    </button>
  );
}

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
    <Link
      href={href}
      onClick={(event) => {
        if (href.includes("#") && scrollToHomeHash(href)) event.preventDefault();
      }}
      className={cn(base, variants[variant], className)}
    >
      <span>{children}</span>
      {arrow ? <ArrowRight className="shrink-0" /> : null}
    </Link>
  );
}
