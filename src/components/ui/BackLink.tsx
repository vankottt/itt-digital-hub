"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight } from "./Icons";

/** Quiet back control: browser history when it exists, otherwise `href`. */
export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (window.history.length <= 1) return;
    event.preventDefault();
    router.back();
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2 font-sans text-small font-medium text-ink transition-colors duration-150 hover:text-marine",
        className,
      )}
    >
      <ArrowRight className="shrink-0 rotate-180 transition-transform duration-200 ease-out-soft motion-safe:group-hover:-translate-x-0.5" />
      <span className="underline decoration-line-strong underline-offset-[4px] transition-colors duration-150 group-hover:decoration-amber">
        {children}
      </span>
    </Link>
  );
}
