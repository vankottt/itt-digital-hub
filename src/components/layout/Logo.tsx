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
  /** `compact` = sticky header (mark on phones, lockup without tagline from sm). `full` = footer lockup + tagline. `lockup` kept as compact alias. */
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
      className={cn("group inline-flex min-w-0 items-center no-underline", className)}
    >
      {full ? (
        <Image
          src={dark ? lockupFullOnDark : lockupFull}
          alt=""
          priority
          className="h-16 w-auto max-w-[min(100%,18rem)] object-contain object-left md:h-[4.75rem] md:max-w-[22rem]"
        />
      ) : (
        <>
          <Image
            src={dark ? markOnDark : mark}
            alt=""
            priority
            className="h-9 w-auto object-contain object-left sm:hidden"
          />
          <Image
            src={dark ? lockupCompactOnDark : lockupCompact}
            alt=""
            priority
            className="hidden h-9 w-auto max-w-[11.75rem] object-contain object-left sm:block md:h-10 md:max-w-[14rem]"
          />
        </>
      )}
    </Link>
  );
}
