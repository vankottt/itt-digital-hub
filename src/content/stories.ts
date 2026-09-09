import type { L } from "@/lib/i18n";

export type StoryCover = { kind: "photo"; src: string; alt: L; overlay?: "light" | "heavy" };

export type ProjectShot = {
  src: string;
  alt: L;
  caption: L;
  frame: "browser" | "phone" | "screen";
};

export type ProjectScreenSet = {
  liveUrl: L;
  liveLabel: L;
  hero: ProjectShot;
  shots: ProjectShot[];
};

/** Homepage “Our stories” covers — photographs only, no decorative icons. */
export const storyCovers: Record<string, StoryCover> = {
  "atn-warranty-portal": {
    kind: "photo",
    src: "/stories/atn-mars-cover.webp",
    overlay: "heavy",
    alt: {
      bg: "Интерфейс на термовизионен прицел ATN — прицел, увеличение и показания на дисплея",
      en: "ATN thermal-scope interface — reticle, zoom and on-display readouts",
    },
  },
};

/** Product screens captured from the public portal. */
export const projectScreens: Record<string, ProjectScreenSet> = {
  "atn-warranty-portal": {
    liveUrl: {
      bg: "https://warranty.atneu.com/?selected_locale=bg",
      en: "https://warranty.atneu.com/?selected_locale=en",
    },
    liveLabel: { bg: "Отворете портала", en: "Open the portal" },
    hero: {
      src: "/stories/atn-warranty-hero.webp",
      frame: "browser",
      alt: {
        bg: "Настолен изглед на гаранционния портал на ATN Europe — стъпка 1, регистрация по сериен номер",
        en: "Desktop view of the ATN Europe Warranty Portal — step 1, serial-number registration",
      },
      caption: {
        bg: "Публична регистрация. warranty.atneu.com",
        en: "Public registration. warranty.atneu.com",
      },
    },
    shots: [
      {
        src: "/stories/atn-warranty-register.webp",
        frame: "screen",
        alt: {
          bg: "Форма за регистрация: език, три стъпки и поле за сериен номер",
          en: "Registration form: language, three steps and serial-number field",
        },
        caption: {
          bg: "Стъпка 1 — сериен номер, шест езика, ясен следващ ход.",
          en: "Step 1 — serial number, six languages, a clear next action.",
        },
      },
      {
        src: "/stories/atn-warranty-mobile.webp",
        frame: "phone",
        alt: {
          bg: "Мобилен изглед на същия регистрационен поток",
          en: "Mobile view of the same registration flow",
        },
        caption: {
          bg: "Същият поток на тесен екран — без счупена йерархия.",
          en: "The same flow on a narrow screen — hierarchy intact.",
        },
      },
    ],
  },
};
