import type { L } from "@/lib/i18n";

export const vikDesigner = {
  meta: {
    title: { bg: "ВиК Проектант · ITT Digital Hub", en: "WSS Designer · ITT Digital Hub" },
    description: {
      bg: "Нормативна справка за водоснабдяване, канализация, присъединяване и свързани изисквания.",
      en: "A normative lookup for water supply, sewerage, connections and related requirements.",
    },
  },
  title: { bg: "ВиК Проектант", en: "WSS Designer" },
  subtitle: { bg: "Нормативен асистент за ВиК проектиране", en: "Normative assistant for water and sewerage design" },
  intro: {
    bg: "Бърза справка в нормативната база за водоснабдяване, канализация, присъединяване, питейни и отпадъчни води и свързани изисквания.",
    en: "A quick lookup in the Bulgarian rules for water supply, sewerage, connections, drinking water, wastewater and related requirements.",
  },
  back: { bg: "Инструменти", en: "Tools" },
  you: { bg: "Вие", en: "You" },
  assistant: { bg: "ВиК Проектант", en: "WSS Designer" },
  startersLabel: { bg: "Примерни въпроси", en: "Example questions" },
  placeholder: { bg: "Задайте въпрос за ВиК нормативната база…", en: "Ask about the water and sewerage rules…" },
  send: { bg: "Изпрати", en: "Send" },
  sending: { bg: "Изпращане…", en: "Sending…" },
  generating: { bg: "Преглеждам нормативната база…", en: "Checking the rule base…" },
  source: { bg: "Източник", en: "Source" },
  retry: { bg: "Опитай отново", en: "Try again" },
  notice: {
    bg: "Демонстрационна справка по наличните текстове. Не замества проектантска проверка, заверка или пълния текст на стандарт.",
    en: "A demonstration lookup of the available texts. It does not replace a design check, approval, or the full text of a standard.",
  },
  starters: [
    {
      bg: "Коя наредба урежда външните водоснабдителни системи?",
      en: "Which ordinance covers external water supply systems?",
    },
    {
      bg: "Какви са основните правила за присъединяване към ВиК?",
      en: "What are the main rules for connecting to a water and sewerage network?",
    },
    {
      bg: "Какво урежда Наредба № 9 за питейната вода?",
      en: "What does Ordinance No. 9 cover for drinking water?",
    },
    {
      bg: "Какъв е обхватът на Наредба РД-02-20-2/2024?",
      en: "What is the scope of Ordinance RD-02-20-2/2024?",
    },
  ] satisfies L[],
  errors: {
    rate_limited: { bg: "Моля, изчакайте малко и опитайте отново.", en: "Please wait a moment and try again." },
    timeout: { bg: "Справката отне твърде дълго. Опитайте с по-кратък въпрос.", en: "The lookup took too long. Try a shorter question." },
    provider_error: { bg: "В момента не успях да обработя въпроса. Опитайте отново след малко.", en: "The question could not be processed just now. Try again in a moment." },
    network: { bg: "Няма връзка със сървъра. Проверете мрежата и опитайте отново.", en: "The server cannot be reached. Check the connection and try again." },
    invalid: { bg: "Въпросът не може да бъде приет в този вид.", en: "The question cannot be accepted in this form." },
    generic: { bg: "В момента не успях да обработя въпроса. Опитайте отново след малко.", en: "The question could not be processed just now. Try again in a moment." },
  },
};
