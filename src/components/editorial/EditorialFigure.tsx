import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Editorial photograph: hairline frame, square corners.
 * Alt describes the picture; visible captions are not used on public figures.
 */
export function EditorialFigure({
  src,
  alt,
  caption,
  sizes = "(min-width: 1024px) 800px, 100vw",
  priority = false,
  className,
  ratio = "aspect-[16/9]",
  imageClassName,
}: {
  src: string;
  alt: string;
  caption?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
  imageClassName?: string;
}) {
  return (
    <figure className={cn("overflow-hidden border border-line bg-paper-3", className)}>
      <div className={cn("relative w-full", ratio)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={imageClassName ?? "object-cover object-left"}
        />
      </div>
      {caption ? <figcaption className="border-t border-line px-4 py-3 text-small text-ink-3">{caption}</figcaption> : null}
    </figure>
  );
}
