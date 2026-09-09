import type { L } from "@/lib/i18n";

export interface Partner {
  id: string;
  name: L;
  href: string;
  logo: string;
  width: number;
  height: number;
}

/**
 * Logo strip on the homepage. Marks are taken from each organisation’s public site.
 * Presentation follows the diva-e partners marquee; it does not invent endorsements.
 */
export const partners: Partner[] = [
  {
    id: "atn",
    name: { bg: "ATN", en: "ATN" },
    href: "https://www.atneu.com/",
    logo: "/partners/atn.svg",
    width: 357,
    height: 310,
  },
  {
    id: "merkanto",
    name: { bg: "Мерканто", en: "Merkanto" },
    href: "https://www.merkanto.com/",
    logo: "/partners/merkanto.png",
    width: 223,
    height: 36,
  },
  {
    id: "tomchevi",
    name: { bg: "Томчеви", en: "Tomchevi" },
    href: "https://tomchevi.com/",
    logo: "/partners/tomchevi.png",
    width: 161,
    height: 120,
  },
  {
    id: "uacg",
    name: { bg: "УАСГ", en: "UACG" },
    href: "https://uacg.bg/",
    logo: "/partners/uacg.png",
    width: 285,
    height: 123,
  },
  {
    id: "unwe",
    name: { bg: "УНСС", en: "UNWE" },
    href: "https://www.unwe.bg/",
    logo: "/partners/unwe.png",
    width: 223,
    height: 100,
  },
  {
    id: "mg-klima",
    name: { bg: "МГ Клима", en: "MG Klima" },
    href: "https://mgklima.bg/",
    logo: "/partners/mg-klima.png",
    width: 1024,
    height: 354,
  },
  {
    id: "nakra",
    name: { bg: "Накра", en: "Nakra" },
    href: "https://nakra.eu/",
    logo: "/partners/nakra.png",
    width: 464,
    height: 90,
  },
];
