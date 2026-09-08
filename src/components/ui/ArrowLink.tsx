import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight } from "./Icons";

export function ArrowLink({
  href,
  children,
  className,
  tone = "ink",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: "ink" | "on-dark";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 font-sans text-small font-medium transition-colors duration-150",
        tone === "ink" ? "text-ink hover:text-marine" : "text-on-dark hover:text-amber",
        className,
      )}
    >
      <span className="underline decoration-line-strong underline-offset-[4px] transition-colors duration-150 group-hover:decoration-amber">
        {children}
      </span>
      <ArrowRight className="shrink-0 transition-transform duration-200 ease-out-soft motion-safe:group-hover:translate-x-0.5" />
    </Link>
  );
}
