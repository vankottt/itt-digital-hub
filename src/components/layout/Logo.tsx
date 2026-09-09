import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import lockup from "../../../public/brand/itt-lockup-compact.png";
import lockupOnDark from "../../../public/brand/itt-lockup-compact-on-dark.png";
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

/** Stack both lockups and crossfade with opacity so navy/white text can mix over a changing surface. */
function LockupPair({
  light,
  dark,
  mix,
  className,
}: {
  light: StaticImageData;
  dark: StaticImageData;
  mix: number;
  className?: string;
}) {
  const height = 35;
  const width = Math.round((height * light.width) / light.height);
  const imgClass =
    "max-h-full w-auto max-w-full select-none object-contain object-left";
  return (
    // Height comes from `className`. Overflow stays visible so the underline
    // and the “g” descender are not clipped when the img’s intrinsic box is taller.
    <span className={cn("relative inline-flex max-w-full items-center overflow-visible leading-none", className)}>
      <Image
        src={light}
        alt=""
        priority
        width={width}
        height={height}
        className={cn("relative h-full", imgClass)}
        style={{ opacity: 1 - mix, width: "auto", height: "auto", maxHeight: "100%" }}
      />
      <Image
        src={dark}
        alt=""
        priority
        width={width}
        height={height}
        aria-hidden="true"
        className={cn("pointer-events-none absolute top-0 left-0 h-full", imgClass)}
        style={{ opacity: mix, width: "auto", height: "auto", maxHeight: "100%" }}
      />
    </span>
  );
}

export function Logo({
  locale,
  tone = "ink",
  darkMix,
  className,
  layout = "compact",
}: {
  locale: Locale;
  tone?: "ink" | "on-dark";
  /** 0 = ink lockup, 1 = on-dark. When set, overrides `tone` for a scroll-driven fade. */
  darkMix?: number;
  className?: string;
  /** `compact` = sticky header wordmark. `full` = footer wordmark. `lockup` kept as compact alias. */
  layout?: "compact" | "lockup" | "full";
  /** Unused — height is driven by layout so the official artwork stays in proportion. */
  markSize?: number;
}) {
  const mix = darkMix ?? (tone === "on-dark" ? 1 : 0);
  const full = layout === "full";

  return (
    <Link
      href={href(locale, "home")}
      aria-label={site.name[locale]}
      className={cn("group inline-flex min-w-0 items-center overflow-visible no-underline outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal", className)}
    >
      {full ? (
        <LockupPair
          light={lockupFull}
          dark={lockupFullOnDark}
          mix={mix}
          className="h-[2.4rem] max-w-[min(100%,16rem)] md:h-11 md:max-w-[19.2rem]"
        />
      ) : (
        <LockupPair
          light={lockup}
          dark={lockupOnDark}
          mix={mix}
          className="h-9 max-w-[min(100%,13.2rem)] shrink-0 md:max-w-[16.4rem]"
        />
      )}
    </Link>
  );
}
