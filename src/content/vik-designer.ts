import type { L } from "@/lib/i18n";

export const vikDesigner = {
  meta: {
    title: { bg: "ВиК Проектант · ITT Digital Hub", en: "WSS Designer · ITT Digital Hub" },
    description: {
      bg: "Нормативен асистент за справка във ВиК наредбите: водоснабдяване, канализация, присъединяване и свързани изисквания.",
      en: "A normative assistant for Bulgarian water and sewerage rules: supply, sewerage, connections and related requirements.",
    },
  },
  title: { bg: "ВиК Проектант", en: "WSS Designer" },
  subtitle: { bg: "Нормативен асистент за ВиК проектиране", en: "Normative assistant for water and sewerage design" },
  intro: {
    bg: "Помага за бърза справка в нормативната база за водоснабдяване, канализация, присъединяване, питейни и отпадъчни води и свързани изисквания.",
    en: "Helps look up the Bulgarian rules for water supply, sewerage, connections, drinking water, wastewater and related requirements.",
  },
  back: { bg: "Инструменти", en: "Tools" },
  you: { bg: "Вие", en: "You" },
  assistant: { bg: "ВиК Проектант", en: "WSS Designer" },
  startersLabel: { bg: "Примерни въпроси", en: "Example questions" },
  placeholder: { bg: "Въпрос към нормативната база", en: "Question for the rule base" },
  send: { bg: "Изпрати", en: "Send" },
  sending: { bg: "Търси", en: "Searching" },
  generating: { bg: "Преглежда наредбите", en: "Checking the ordinances" },
  retry: { bg: "Опитай отново", en: "Try again" },
  notice: {
    bg: "Демонстрационна справка по наличните текстове. Не замества проектантска проверка, заверка или пълния текст на стандарт.",
    en: "A demonstration lookup of the available texts. It does not replace a design check, approval, or the full text of a standard.",
  },
  starters: [
    {
      bg: "Какви са изискванията при присъединяване към ВиК мрежата?",
      en: "What rules apply when connecting to a water and sewerage network?",
    },
    {
      bg: "Коя наредба урежда външните водоснабдителни системи?",
      en: "Which ordinance covers external water supply systems?",
    },
    {
      bg: "Какво изисква нормативната база за качеството на питейната вода?",
      en: "What does the rule base require for drinking-water quality?",
    },
    {
      bg: "Кои документи са приложими при проект за канализация?",
      en: "Which documents apply to a sewerage design?",
    },
  ] satisfies L[],
  errors: {
    rate_limited: { bg: "Моля, изчакайте малко и опитайте отново.", en: "Please wait a moment and try again." },
    timeout: { bg: "Справката отне твърде дълго. Опитайте с по-конкретен въпрос.", en: "The lookup took too long. Try a more specific question." },
    provider_error: { bg: "В момента не мога да завърша справката. Опитайте отново.", en: "The lookup cannot be completed right now. Try again." },
    network: { bg: "Няма връзка със сървъра. Проверете мрежата и опитайте отново.", en: "The server cannot be reached. Check the connection and try again." },
    invalid: { bg: "Въпросът не може да бъде приет в този вид.", en: "The question cannot be accepted in this form." },
    generic: { bg: "Нещо се обърка. Опитайте отново.", en: "Something went wrong. Try again." },
  },
};
