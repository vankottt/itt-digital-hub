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
    kind: "diagram",
    diagram: "warranty-relation",
    alt: {
      bg: "Схема на дистрибуционната верига и директната дигитална връзка между производител и краен клиент",
      en: "Diagram of the distribution chain and the direct digital relationship between manufacturer and end customer",
    },
  },
  "atn-creator-social-intelligence": {
    kind: "photo",
    src: "/stories/creator-studio-cover.jpg",
    overlay: "light",
    objectPosition: "center 40%",
    alt: {
      bg: "Студио за съдържание с камера, лаптоп и контактни листове",
      en: "Content studio desk with a camera, laptop and contact sheets",
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
      bg: "Архитектурна схема: локални модели по подразбиране, инструменти чрез MCP и облак само при нужда",
      en: "Architecture diagram: local models by default, tools through MCP and cloud only when justified",
    },
  },
};

export const projectHeroVisuals: Record<string, ProjectVisual> = {
  "ai-assisted-solar-operations": {
    src: "/stories/solar-batteries-cover.jpg",
    alt: {
      bg: "Соларен парк с фотоволтаични панели и контейнерна батерийна система",
      en: "Solar park with photovoltaic panels and a containerised battery system",
    },
    objectPosition: "center 45%",
  },
};
