import type { Locale } from "@/lib/i18n";
import { campusPhotos, type CampusPhotoId } from "@/content/media";
import { EditorialFigure } from "./EditorialFigure";

/**
 * Typed wrapper around the two temporary UASG campus photographs.
 * Keeps alt in the content model so pages cannot drift.
 */
export function CampusFigure({
  photo,
  locale,
  sizes,
  className,
  ratio,
  imageClassName,
  priority = false,
}: {
  photo: CampusPhotoId;
  locale: Locale;
  sizes?: string;
  className?: string;
  ratio?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  const item = campusPhotos[photo];
  return (
    <EditorialFigure
      src={item.src}
      alt={item.alt[locale]}
      sizes={sizes}
      className={className}
      ratio={ratio}
      imageClassName={imageClassName}
      priority={priority}
    />
  );
}
