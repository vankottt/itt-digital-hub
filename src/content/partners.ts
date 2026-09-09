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
];
