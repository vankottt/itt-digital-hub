import type { L } from "@/lib/i18n";

export type StoryCover =
  | {
      kind: "photo";
      src: string;
      alt: L;
      overlay?: "light" | "heavy";
      objectPosition?: string;
    }
  | {
      kind: "diagram";
      diagram: "warranty-relation" | "orchestration";
      alt: L;
    };

export type ProjectVisual = {
  src: string;
  alt: L;
  caption?: L;
  objectPosition?: string;
};

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

/** Homepage and index covers. No client brands, no confidential screens. */
export const storyCovers: Record<string, StoryCover> = {
  "atn-warranty-portal": {
    kind: "photo",
    src: "/stories/warranty-journey.jpg",
    overlay: "light",
    objectPosition: "center 42%",
    alt: {
      bg: "Производство, склад и търговия, свързани с краен клиент на открито, който регистрира оптично устройство с телефон",
      en: "Factory, warehouse and retail connected to an outdoor customer registering an optical device on a phone",
    },
  },
  "atn-creator-social-intelligence": {
    kind: "photo",
    src: "/stories/creator-content-library.jpg",
    overlay: "light",
    objectPosition: "center 38%",
    alt: {
      bg: "Илюстративен екран с библиотека със съдържание, тенденции и представяне",
      en: "Illustrative screen with a content library, trends and performance",
    },
  },
  "ai-assisted-solar-operations": {
    kind: "photo",
    src: "/stories/solar-batteries-cover.jpg",
    overlay: "light",
    objectPosition: "center 45%",
    alt: {
      bg: "Соларен парк с фотоволтаични панели и контейнерна батерийна система",
      en: "Solar park with photovoltaic panels and a containerised battery system",
    },
  },
  "local-ai-orchestration": {
    kind: "diagram",
    diagram: "orchestration",
    alt: {
      bg: "Схема на изпълнение: задача, политика, оркестрация, локални работници, проверка и резултат, с облак само при нужда",
      en: "Execution diagram: task, policy, orchestration, local workers, verification and result, with cloud only when justified",
    },
  },
};

export const projectHeroVisuals: Record<string, ProjectVisual> = {
  "atn-creator-social-intelligence": {
    src: "/stories/creator-profile.jpg",
    alt: {
      bg: "Илюстративен профил на създател със сътрудничество, доставки и публикувано съдържание",
      en: "Illustrative creator profile with a collaboration, deliverables and published content",
    },
    caption: {
      bg: "Илюстративен профил на създател. Примерни данни.",
      en: "Illustrative creator profile. Sample data.",
    },
    objectPosition: "center",
  },
  "atn-warranty-portal": {
    src: "/stories/warranty-relationship.jpg",
    alt: {
      bg: "Физическият път от производство през дистрибуция и търговия до клиента, с дигитална платформа между производител и краен клиент",
      en: "The physical path from factory through distribution and retail to the customer, with a digital platform linking manufacturer and end customer",
    },
    objectPosition: "center",
  },
  "ai-assisted-solar-operations": {
    src: "/stories/solar-batteries-cover.jpg",
    alt: {
      bg: "Соларен парк с фотоволтаични панели и контейнерна батерийна система",
      en: "Solar park with photovoltaic panels and a containerised battery system",
    },
    objectPosition: "center 45%",
  },
};

export const projectStoryVisuals: Record<string, Partial<Record<"built" | "how" | "value", ProjectVisual>>> = {
  "atn-warranty-portal": {
    built: {
      src: "/stories/warranty-verification.jpg",
      alt: {
        bg: "Клиент снима касова бележка с телефон, докато екранът показва качване, извличане и проверка на документа",
        en: "A customer photographs a purchase receipt while a screen shows upload, extract and validate steps",
      },
      caption: {
        bg: "Илюстративен процес на проверка. Примерни данни.",
        en: "Illustrative verification flow. Sample data.",
      },
    },
    how: {
      src: "/stories/warranty-exceptions.jpg",
      alt: {
        bg: "Оператор преглежда случай за човешка проверка на настолен и мобилен екран",
        en: "An operator reviews a human-exception case on desktop and mobile",
      },
      caption: {
        bg: "Илюстративен случай за човешка проверка. Примерни данни.",
        en: "Illustrative exception case. Sample data.",
      },
    },
    value: {
      src: "/stories/warranty-intelligence.jpg",
      alt: {
        bg: "Илюстративно управленско табло с примерни регистрации, пазари, търговци и случаи",
        en: "Illustrative management dashboard with sample registrations, markets, retailers and cases",
      },
      caption: {
        bg: "Илюстративно управленско табло. Примерни данни.",
        en: "Illustrative management dashboard. Sample data.",
      },
    },
  },
  "atn-creator-social-intelligence": {
    built: {
      src: "/stories/creator-content-performance.jpg",
      alt: {
        bg: "Илюстративен екран за представяне на съдържание, свързано със създатели и публикации",
        en: "Illustrative content performance screen linking posts to creators and results",
      },
      caption: {
        bg: "Илюстративно представяне на съдържание. Примерни данни.",
        en: "Illustrative content performance. Sample data.",
      },
    },
    value: {
      src: "/stories/creator-analytics.jpg",
      alt: {
        bg: "Илюстративен анализ с тенденции, типове съдържание и сравнение между създатели",
        en: "Illustrative analytics with trends, content types and creator comparison",
      },
      caption: {
        bg: "Илюстративен анализ на представянето. Примерни данни.",
        en: "Illustrative performance analytics. Sample data.",
      },
    },
  },
};
