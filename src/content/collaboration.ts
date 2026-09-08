import type { L } from "@/lib/i18n";
import type { CollaborationRoute } from "./types";

/* Routes follow the Action Plan's potential clients, commercial products and
   funding model. The service portfolio is planned (Year 2 priority), so the
   routes describe directions the Center is designed to support — not an
   existing catalogue. */

export const collaborationRoutes: CollaborationRoute[] = [
  {
    slug: "public-institutions",
    code: "R1",
    audience: { bg: "Публични институции", en: "Public institutions" },
    audienceExamples: {
      bg: ["Министерства и държавни агенции", "Общински и регионални органи", "Регулаторни органи", "Публични предприятия", "Европейски и международни институции"],
      en: ["Ministries and state agencies", "Municipal and regional authorities", "Regulators", "Public enterprises", "European and international institutions"],
    },
    problems: {
      bg: ["Политики, чиито резултати не съответстват на целите им", "Регулаторни режими с натрупана сложност и противоречиви правила", "Административни процеси с тесни места и слаба координация", "Липса на измерими показатели и обратна връзка"],
      en: ["Policies whose results do not match their goals", "Regulatory regimes with accumulated complexity and contradictory rules", "Administrative processes with bottlenecks and weak coordination", "Missing measurable indicators and feedback"],
    },
    modes: {
      bg: ["Диагностика на институционални системи", "Преглед на архитектурата на политики и регулации", "Оценка на въздействието на регулациите", "Възложени изследвания в областта на публичните политики", "Системи за мониторинг и оценяване"],
      en: ["Diagnostics of institutional systems", "Policy and regulatory architecture review", "Regulatory impact assessment", "Commissioned public-policy research", "Monitoring and evaluation systems"],
    },
    partnerBrings: {
      bg: ["Конкретен системен проблем с обществено значение", "Достъп до данни, документи и участници", "Институционален ангажимент към проверка и адаптация"],
      en: ["A specific system problem of public significance", "Access to data, documents and actors", "Institutional commitment to testing and adaptation"],
    },
    citBrings: {
      bg: ["Системна карта и карта на процесите и алгоритмите", "Анализ на дефектите и алтернативни архитектури", "Интегриран пакет от препоръки с архитектура на изпълнението и показатели"],
      en: ["A system map and a process and algorithm map", "Failure analysis and alternative architectures", "An integrated recommendation package with implementation architecture and indicators"],
    },
  },
  {
    slug: "universities-researchers",
    code: "R2",
    audience: { bg: "Университети и изследователи", en: "Universities and researchers" },
    audienceExamples: {
      bg: ["Университети и научни институти", "Изследователски групи", "Докторанти и постдокторанти", "Международни академични мрежи"],
      en: ["Universities and research institutes", "Research groups", "Doctoral and postdoctoral researchers", "International academic networks"],
    },
    problems: {
      bg: ["Интердисциплинарни въпроси, които не се вместват в една дисциплина", "Нужда от реални системи, върху които да се изпитват методи", "Свързване на инженерни, икономически, статистически и поведенчески подходи"],
      en: ["Interdisciplinary questions that do not fit a single discipline", "The need for real systems on which to test methods", "Connecting engineering, economic, statistical and behavioural approaches"],
    },
    modes: {
      bg: ["Съвместни научни проекти по национални и европейски програми", "Съвместни курсове и квалификации", "Участие в Научния и програмен съвет", "Докторантски и постдокторантски проекти", "Семинари, летни школи и международни лекции"],
      en: ["Joint research projects under national and European programmes", "Joint courses and qualifications", "Participation in the Scientific and Programme Council", "Doctoral and postdoctoral projects", "Seminars, summer schools and international lectures"],
    },
    partnerBrings: {
      bg: ["Дисциплинарна експертиза и изследователски капацитет", "Академичен състав, докторанти и инфраструктура", "Международни контакти"],
      en: ["Disciplinary expertise and research capacity", "Faculty, doctoral students and infrastructure", "International contacts"],
    },
    citBrings: {
      bg: ["Обща методологична рамка – алгоритмизация на социалните процеси и ASAESIS", "Приложни системи като изследователски терен", "Интердисциплинарна платформа между инженерни науки, икономика, статистика, ИИ и публични политики"],
      en: ["A shared methodological framework — algorithmization of social processes and ASAESIS", "Applied systems as a research field", "An interdisciplinary platform across engineering, economics, statistics, AI and public policy"],
    },
  },
  {
    slug: "business-industry",
    code: "R3",
    audience: { bg: "Бизнес и индустрия", en: "Business and industry" },
    audienceExamples: {
      bg: ["Частни компании", "Браншови организации", "Здравни и образователни организации", "Организации на гражданското общество"],
      en: ["Private companies", "Branch organizations", "Health and education organizations", "Civil-society organizations"],
    },
    problems: {
      bg: ["Организационни процеси и потоци на решения, които не произвеждат желания резултат", "Секторни проблеми, които не могат да се решат от отделен участник", "Дигитална трансформация и изкуствен интелект без ясна системна архитектура"],
      en: ["Organizational processes and decision flows that do not produce the intended result", "Sector problems that no single actor can solve", "Digital transformation and AI without a clear system architecture"],
    },
    modes: {
      bg: ["Анализ на процеси и потоци на решения", "Програми за организационно препроектиране", "Стратегии за изкуствен интелект и дигитална трансформация", "Анализ на поведенчески и стимулиращи системи", "Професионално обучение"],
      en: ["Process and decision-flow analysis", "Organizational redesign programmes", "AI and digital-transformation strategies", "Behavioural and incentive-system analysis", "Professional training"],
    },
    partnerBrings: {
      bg: ["Реален организационен или секторен проблем", "Оперативни данни и достъп до процеси", "Готовност за пилотна проверка на решенията"],
      en: ["A real organizational or sector problem", "Operational data and access to processes", "Willingness to pilot solutions"],
    },
    citBrings: {
      bg: ["Диагностика на системата и нейните алгоритми", "Целева архитектура и пакет от интервенции", "Дизайн на пилотно изпитване с базово измерване и показатели"],
      en: ["Diagnosis of the system and its algorithms", "A target architecture and intervention package", "Pilot design with baseline measurement and indicators"],
    },
  },
  {
    slug: "funding-innovation",
    code: "R4",
    audience: { bg: "Финансиращи и иновационни партньори", en: "Funding and innovation partners" },
    audienceExamples: {
      bg: ["Национални научноизследователски и иновационни програми", "Програми на Европейския съюз", "Фондации и частни спонсори", "Програми за реформа на публичната администрация и дигитална трансформация"],
      en: ["National research and innovation programmes", "European Union programmes", "Foundations and private sponsors", "Public-administration reform and digital-transformation programmes"],
    },
    problems: {
      bg: ["Нужда от възпроизводима методология за системна трансформация", "Проекти, които изискват интердисциплинарен консорциум", "Измерими резултати вместо разпокъсани мерки"],
      en: ["The need for a reproducible methodology for systemic transformation", "Projects that require an interdisciplinary consortium", "Measurable results rather than fragmented measures"],
    },
    modes: {
      bg: ["Участие в консорциуми по национални и европейски програми", "Възложени научни изследвания", "Спонсорство при гаранции за академична независимост, прозрачност и предотвратяване на конфликти на интереси", "Дългосрочни програми за трансформация"],
      en: ["Consortium participation under national and European programmes", "Commissioned research", "Sponsorship subject to guarantees of academic independence, transparency and conflict-of-interest prevention", "Long-term transformation programmes"],
    },
    partnerBrings: {
      bg: ["Финансиране или съфинансиране", "Програмна рамка и критерии за въздействие", "Мрежа от партньори"],
      en: ["Funding or co-funding", "A programme framework and impact criteria", "A partner network"],
    },
    citBrings: {
      bg: ["Възпроизводима методология с ясни етапи и резултати", "Интердисциплинарен екип и университетска институционална основа", "Ангажимент към измерване и адаптация след внедряване"],
      en: ["A reproducible methodology with clear stages and outputs", "An interdisciplinary team and a university institutional base", "A commitment to measurement and adaptation after implementation"],
    },
  },
];

/** Preferred transformation logic (confirmed project decision). */
export const transformationPath: L<string[]> = {
  bg: ["Идея", "Прототип", "Демонстрация", "Проект", "Финансиране", "Приложение"],
  en: ["Idea", "Prototype", "Demonstration", "Project", "Funding", "Application"],
};
