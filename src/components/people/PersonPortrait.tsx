import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Matched square portrait over a circular plate. The torso continues
 * beyond the disk and is cropped by its edge.
 */
export function PersonPortrait({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("person-portrait", className)}>
      <span className="person-portrait-plate" aria-hidden="true" />
      <div className="person-portrait-clip">
        <div className="person-portrait-photo-wrap">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 240px, (min-width: 768px) 28vw, 30vw"
            className="person-portrait-photo"
          />
        </div>
      </div>
    </div>
  );
}

/** Quiet reserved slot — not a person record, not hover-interactive. */
export function PersonPortraitVacant() {
  return (
    <div className="person-portrait person-portrait-vacant" aria-hidden="true">
      <span className="person-portrait-plate" />
      <span className="person-portrait-plus" />
    </div>
  );
}

/** Real person without a supplied portrait — plate only, no join-us plus. */
export function PersonPortraitPlate() {
  return (
    <div className="person-portrait person-portrait-vacant" aria-hidden="true">
      <span className="person-portrait-plate" />
    </div>
  );
}
