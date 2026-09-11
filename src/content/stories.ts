import type { L } from "@/lib/i18n";

export type StoryCover = {
  kind: "photo";
  src: string;
  alt: L;
  overlay?: "light" | "heavy";
  /** CSS object-position used when the 16:9 card crop trims the source. */
  objectPosition?: string;
};

export type ProjectVisual = {
  src: string;
  alt: L;
  caption: L;
  objectPosition?: string;
};

const prototypeCaption = {
  bg: "Концептуален продуктов прототип · Примерни данни · Крайната реализация може да се различава.",
  en: "Conceptual product prototype · Sample data · Final implementation may differ.",
} satisfies L;

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
  "ai-assisted-solar-operations": {
    kind: "photo",
    src: "/stories/solar-operations-cover.webp",
    overlay: "light",
    alt: {
      bg: "Инженер със защитна екипировка преглежда табло на таблет в соларен парк, с дрон и наземен робот за инспекция",
      en: "Engineer in safety gear reviewing a tablet dashboard at a solar farm, with a drone and a ground inspection robot",
    },
  },
  "local-ai-orchestration": {
    kind: "photo",
    src: "/stories/local-orchestration-cover.webp",
    overlay: "light",
    alt: {
      bg: "Команден център с архитектурна схема за локална AI оркестрация на стената и монитори за маршрутизиране и системни ресурси",
      en: "Command room with a local AI orchestration architecture diagram on the wall and monitors for routing and system resources",
    },
  },
  "atn-warranty-portal": {
    kind: "photo",
    src: "/stories/atn-warranty-desk-cover.webp",
    overlay: "light",
    alt: {
      bg: "Ръце върху лаптоп с регистрация на продукт ATN, до термовизионен прицел и кутия",
      en: "Hands at a laptop registering an ATN product, beside a thermal riflescope and its box",
    },
  },
  "atn-creator-social-intelligence": {
    kind: "photo",
    src: "/stories/atn-creator-collaboration-workspace.png",
    overlay: "light",
    alt: {
      bg: "Концептуален интерфейс на платформата ATN Creator & Social Intelligence с профил на криейтър, сътрудничество, доставки, публикувано съдържание и активност",
      en: "Conceptual ATN Creator & Social Intelligence Platform interface showing a creator profile, collaboration, deliverables, published content and activity",
    },
  },
};

/** Captioned article visuals — prototypes or live screens, separate from card covers. */
export const projectHeroVisuals: Record<string, ProjectVisual> = {
  "atn-creator-social-intelligence": {
    src: "/stories/atn-creator-collaboration-workspace.png",
    alt: {
      bg: "Концептуален интерфейс на платформата ATN Creator & Social Intelligence с профил на криейтър, сътрудничество, доставки, публикувано съдържание и активност",
      en: "Conceptual ATN Creator & Social Intelligence Platform interface showing a creator profile, collaboration, deliverables, published content and activity",
    },
    caption: prototypeCaption,
  },
};

export const projectSectionVisuals: Record<string, Partial<Record<"intelligence", ProjectVisual>>> = {
  "atn-creator-social-intelligence": {
    intelligence: {
      src: "/stories/atn-creator-content-intelligence.png",
      alt: {
        bg: "Концептуален аналитичен интерфейс на платформата ATN Creator & Social Intelligence с представяне на съдържание, тенденции и сравнение на криейтъри",
        en: "Conceptual ATN Creator & Social Intelligence Platform analytics interface showing content performance, trends and creator comparison",
      },
      caption: prototypeCaption,
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
