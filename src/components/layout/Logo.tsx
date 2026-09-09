import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import lockupCompact from "../../../public/brand/itt-lockup-compact.png";
import lockupCompactOnDark from "../../../public/brand/itt-lockup-compact-on-dark.png";
import lockupFull from "../../../public/brand/itt-lockup.png";
import lockupFullOnDark from "../../../public/brand/itt-lockup-on-dark.png";
import mark from "../../../public/brand/itt-mark.png";
import markOnDark from "../../../public/brand/itt-mark-on-dark.png";

/**
 * Official ITT mark. Header/footer swap assets here — do not rebuild the shell.
 */
export function Mark({
  className,
  size = 40,
  tone = "ink",
}: {
  className?: string;
  size?: number;
  tone?: "ink" | "on-dark";
}) {
  const src = tone === "on-dark" ? markOnDark : mark;
  return (
    <Image
      src={src}
      alt=""
      height={size}
      width={Math.round((size * src.width) / src.height)}
      priority
      className={cn("shrink-0 select-none object-contain object-left", className)}
    />
  );
}

export function Logo({
  locale,
  tone = "ink",
  className,
  layout = "compact",
}: {
  locale: Locale;
  tone?: "ink" | "on-dark";
  className?: string;
  /** `compact` = sticky header (mark on phones, wordmark from sm). `full` = footer wordmark. `lockup` kept as compact alias. */
  layout?: "compact" | "lockup" | "full";
  /** Unused — height is driven by layout so the official artwork stays in proportion. */
  markSize?: number;
}) {
  const dark = tone === "on-dark";
  const full = layout === "full";

  return (
    <Link
      href={href(locale, "home")}
      aria-label={site.name[locale]}
      className={cn("group inline-flex min-w-0 items-center overflow-visible no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal", className)}
    >
      {full ? (
        <>
          <Image
            src={lockupFull}
            alt=""
            priority
            className={cn("h-12 w-auto max-w-[min(100%,20rem)] object-contain object-left md:h-14 md:max-w-[24rem]", dark && "hidden")}
          />
          <Image
            src={lockupFullOnDark}
            alt=""
            priority
            className={cn("h-12 w-auto max-w-[min(100%,20rem)] object-contain object-left md:h-14 md:max-w-[24rem]", !dark && "hidden")}
          />
        </>
      ) : (
        <>
          <Image
            src={mark}
            alt=""
            priority
            className={cn("h-9 w-auto overflow-visible object-contain object-left sm:hidden", dark && "hidden")}
          />
          <Image
            src={markOnDark}
            alt=""
            priority
            className={cn("h-9 w-auto overflow-visible object-contain object-left sm:hidden", !dark && "hidden")}
          />
          <Image
            src={lockupCompact}
            alt=""
            priority
            className={cn(
              "h-9 w-auto max-w-[15.5rem] overflow-visible object-contain object-left md:h-11 md:max-w-[19rem]",
              dark ? "hidden" : "hidden sm:block",
            )}
          />
          <Image
            src={lockupCompactOnDark}
            alt=""
            priority
            className={cn(
              "h-9 w-auto max-w-[15.5rem] overflow-visible object-contain object-left md:h-11 md:max-w-[19rem]",
              dark ? "hidden sm:block" : "hidden",
            )}
          />
        </>
      )}
    </Link>
  );
}
