import type { L } from "@/lib/i18n";

/**
 * Temporary UASG photography for V1 atmosphere only.
 * These assets do not depict CIT staff, laboratories, projects or results.
 * Replace before a final public launch — see docs/TEMP_IMAGE_SOURCES.md.
 */
export const campusPhotos = {
  facade: {
    src: "/images/temporary-uacg/campus-facade.jpg",
    width: 980,
    height: 663,
    alt: {
      bg: "Фасада на Университета по архитектура, строителство и геодезия в София, с името на университета над входа.",
      en: "Facade of the University of Architecture, Civil Engineering and Geodesy in Sofia, with the university name above the entrance.",
    } satisfies L,
  },
  hall: {
    src: "/images/temporary-uacg/campus-hall.jpg",
    width: 999,
    height: 663,
    alt: {
      bg: "Коридор в УАСГ с изложбени табла на Хидротехническия факултет.",
      en: "A corridor at UASG with exhibition boards of the Faculty of Hydraulic Engineering.",
    } satisfies L,
  },
} as const;

export type CampusPhotoId = keyof typeof campusPhotos;

/**
 * Infographic supplied for the confirmed UASG construction-game news article.
 * Credits on the graphic: idea and concept Dr Eng. Stanislav Darachev, © 2025.
 * It does not depict CIT laboratory, team or project activity.
 */
export const constructionGameInfographic = {
  id: "media-bulgarian-construction-game",
  src: "/images/news/bulgarian-construction-game.jpg",
  width: 1024,
  height: 571,
  byteSize: 179977,
  mimeType: "image/jpeg",
  alt: {
    bg: "Инфографика на „Българска строителна игра“: роли на инвеститори, строители и строителен надзор в симулация на общински строителен процес.",
    en: "Infographic of the Bulgarian Construction Game: roles of investors, builders and construction supervision in a simulated municipal construction process.",
  } satisfies L,
} as const;

/**
 * Generated editorial photograph for the card/hero of the confirmed UASG
 * construction-game news article. It does not depict the event, CIT staff or results.
 */
export const constructionGameEditorial = {
  id: "media-bulgarian-construction-game-editorial",
  src: "/images/news/bulgarian-construction-game-editorial.jpg",
  width: 1024,
  height: 576,
  byteSize: 114901,
  mimeType: "image/jpeg",
  alt: {
    bg: "Генерирана илюстрация: работен плот с каска, чертежи и книги пред изглед към град и планина. Не изобразява събитието „Българска строителна игра“, екип или дейност на Центъра.",
    en: "Generated illustration: a desk with a hard hat, drawings and books facing a city and mountain view. It does not depict the Bulgarian Construction Game, Center staff or activity.",
  } satisfies L,
} as const;

/**
 * Editorial illustration for the confirmed seed concept note
 * `why-social-systems-behave-like-algorithms`.
 * Generated image; it does not depict CIT staff, a Center operations room, or results.
 */
export const socialSystemsIllustration = {
  id: "media-social-systems-as-algorithms",
  src: "/images/insights/social-systems-as-algorithms.jpg",
  width: 1024,
  height: 768,
  byteSize: 195665,
  mimeType: "image/jpeg",
  alt: {
    bg: "Генерирана илюстрация: група хора разглежда карта на градски потоци върху голям екран. Не изобразява екип или дейност на Центъра.",
    en: "Generated illustration: a group of people studying a map of urban flows on a large screen. It does not depict Center staff or activity.",
  } satisfies L,
} as const;

/**
 * Editorial illustration for the confirmed seed concept note
 * `asaesis-from-framework-to-method`.
 * Generated image; it does not depict CIT staff, a Center workshop, or results.
 */
export const asaesisMethodIllustration = {
  id: "media-asaesis-from-framework-to-method",
  src: "/images/insights/asaesis-from-framework-to-method.jpg",
  width: 1024,
  height: 768,
  byteSize: 168539,
  mimeType: "image/jpeg",
  alt: {
    bg: "Генерирана илюстрация: хора разглеждат блокова схема на бяла дъска в работна зала. Не изобразява екип или дейност на Центъра.",
    en: "Generated illustration: people studying a flowchart on a whiteboard in a workroom. It does not depict Center staff or activity.",
  } satisfies L,
} as const;

/**
 * Editorial illustration for the confirmed seed concept note
 * `testing-instead-of-assuming` (card / hero).
 * Generated image; it does not depict CIT staff, a Center laboratory, or results.
 */
export const testingInsteadIllustration = {
  id: "media-testing-instead-of-assuming",
  src: "/images/insights/testing-instead-of-assuming.jpg",
  width: 1024,
  height: 768,
  byteSize: 187970,
  mimeType: "image/jpeg",
  alt: {
    bg: "Генерирана илюстрация: хора измерват натоварване върху бетонна греда в изпитателна зала. Не изобразява лаборатория или екип на Центъра.",
    en: "Generated illustration: people measuring load on a concrete beam in a testing hall. It does not depict a Center laboratory or team.",
  } satisfies L,
} as const;

/**
 * Second figure for `testing-instead-of-assuming`, placed in the article body.
 * Generated image; it does not depict a Center model, site or result.
 */
export const testingModelIllustration = {
  id: "media-testing-instead-of-assuming-model",
  src: "/images/insights/testing-instead-of-assuming-model.jpg",
  width: 1024,
  height: 768,
  byteSize: 145661,
  mimeType: "image/jpeg",
  alt: {
    bg: "Генерирана илюстрация: поредица от диаграми, свързани със златиста линия към пейзаж и макет. Не изобразява модел или резултат на Центъра.",
    en: "Generated illustration: a sequence of diagrams linked by a gold line to a landscape and a model. It does not depict a Center model or result.",
  } satisfies L,
} as const;

/**
 * Generated demonstration photographs for public News samples.
 * They do not depict CIT staff, fieldwork, teaching, sites or results.
 * Never seed into CMS.
 */
export const DEV_NEWS_FIXTURE_MEDIA_ID_PREFIX = "media-dev-fixture-";

export const devNewsFixturePhotos = {
  coastalWaterSampling: {
    id: `${DEV_NEWS_FIXTURE_MEDIA_ID_PREFIX}coastal-water-sampling`,
    src: "/images/dev-fixtures/coastal_water_sampling_fieldwork.png",
    width: 1024,
    height: 768,
    byteSize: 1083905,
    mimeType: "image/png",
    alt: {
      bg: "Демонстрационно изображение: човек измерва показатели на крайбрежна вода с портативен уред. Генерирана фикстура; не изобразява дейност на Центъра.",
      en: "Demonstration image: a person measuring coastal water with a handheld instrument. Generated fixture; it does not depict Center activity.",
    } satisfies L,
  },
  coastalResilienceClassroom: {
    id: `${DEV_NEWS_FIXTURE_MEDIA_ID_PREFIX}coastal-resilience-classroom`,
    src: "/images/dev-fixtures/coastal_resilience_classroom_presentation.png",
    width: 1024,
    height: 768,
    byteSize: 990346,
    mimeType: "image/png",
    alt: {
      bg: "Демонстрационно изображение: преподавател показва карта на крайбрежна устойчивост пред аудитория. Генерирана фикстура; не изобразява обучение на Центъра.",
      en: "Demonstration image: an instructor presenting a coastal-resilience map to a class. Generated fixture; it does not depict Center teaching.",
    } satisfies L,
  },
  goldenHourVineyard: {
    id: `${DEV_NEWS_FIXTURE_MEDIA_ID_PREFIX}golden-hour-vineyard`,
    src: "/images/dev-fixtures/golden_hour_vineyard_terrace.png",
    width: 1024,
    height: 768,
    byteSize: 1258876,
    mimeType: "image/png",
    alt: {
      bg: "Демонстрационно изображение: чаша вино и лозе при залез. Генерирана фикстура; не изобразява обект или резултат на Центъра.",
      en: "Demonstration image: a glass of wine and a vineyard at sunset. Generated fixture; it does not depict a Center site or result.",
    } satisfies L,
  },
} as const;

export type DevNewsFixturePhotoId = keyof typeof devNewsFixturePhotos;

/** Locale-paired diagrams for Insights analyses. Ids end in `-bg` / `-en`. */
export const ANALYSIS_MEDIA_ID_PREFIX = "media-analysis-";

function analysisPhoto(
  slug: string,
  locale: "bg" | "en",
  file: string,
  byteSize: number,
  alt: L,
) {
  return {
    id: `${ANALYSIS_MEDIA_ID_PREFIX}${slug}-${locale}`,
    src: `/images/insights/${file}`,
    width: 1024,
    height: 571,
    byteSize,
    mimeType: "image/jpeg",
    alt,
  } as const;
}

export const analysisInsightPhotos = {
  feedbackLoopBg: analysisPhoto(
    "closed-feedback-loop",
    "bg",
    "closed-feedback-loop-bg.jpg",
    50275,
    {
      bg: "Диаграма на затворен цикъл: стимул, откриване, реакция и обратна връзка.",
      en: "Diagram of a closed loop: stimulus, detection, response and feedback, labelled in Bulgarian.",
    },
  ),
  feedbackLoopEn: analysisPhoto(
    "closed-feedback-loop",
    "en",
    "closed-feedback-loop-en.jpg",
    72164,
    {
      bg: "Диаграма на кръгов цикъл на обратна връзка: stimulus, detection, response, feedback.",
      en: "Circular feedback loop diagram: stimulus, detection, response and feedback.",
    },
  ),
  hierarchyNetworkBg: analysisPhoto(
    "hierarchy-network",
    "bg",
    "hierarchy-network-bg.jpg",
    83445,
    {
      bg: "Сравнение между йерархия на четири нива и мрежова система от възли.",
      en: "Comparison of a four-level hierarchy and a networked node system, labelled in Bulgarian.",
    },
  ),
  hierarchyNetworkEn: analysisPhoto(
    "hierarchy-network",
    "en",
    "hierarchy-network-en.jpg",
    49363,
    {
      bg: "Сравнение между проста пирамида и свързана мрежова решетка.",
      en: "Comparison of a simple pyramid and a connected network grid.",
    },
  ),
  decisionTreeBg: analysisPhoto(
    "algorithmic-decision-tree",
    "bg",
    "algorithmic-decision-tree-bg.jpg",
    39540,
    {
      bg: "Алгоритмично дърво: начало, решение, опция А и опция Б с крайни състояния.",
      en: "Algorithmic decision tree in Bulgarian: start, decision, option A and option B with end states.",
    },
  ),
  decisionTreeEn: analysisPhoto(
    "algorithmic-decision-tree",
    "en",
    "algorithmic-decision-tree-en.jpg",
    35419,
    {
      bg: "Алгоритмично дърво: START, DECISION, OPTION A, OPTION B и стъпки.",
      en: "Algorithmic decision tree: start, decision, option A, option B and subsequent steps.",
    },
  ),
} as const;

export type AnalysisInsightPhotoId = keyof typeof analysisInsightPhotos;

/**
 * Homepage overlay clip. Source file: `Video/202609062306.mp4` (colour, ~2:05).
 * Production web loop is the full grayscale H.264 encode at the source frame rate:
 * - `/videos/hero.mp4` — 1920×1080, ~46 MiB, ~30 fps, ~2:05
 * - `/videos/hero-mobile.mp4` — 960×540, ~15 MiB, ~30 fps, ~2:05
 * Poster is a frame from that encode. The footage shows transport
 * infrastructure; it is not presented as CIT laboratory, team or project activity.
 * The clip is preloaded (`preload="auto"`); the poster is still the first paint.
 * `?v=` is bumped when the public files are replaced in place so caches miss.
 */
export const heroVideo = {
  src: "/videos/hero.mp4?v=20260908",
  mobileSrc: "/videos/hero-mobile.mp4?v=20260908",
  poster: {
    src: "/images/hero/poster.jpg",
    width: 1920,
    height: 1080,
    alt: {
      bg: "Въздушен кадър на автомагистрален мост над долина в мъгла.",
      en: "Aerial view of a highway bridge over a fog-filled valley.",
    } satisfies L,
  },
} as const;
