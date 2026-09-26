import type { Locale } from "../../../shared/src/index";
import type { RetrievalResult } from "./retrieval";

const REFUSAL: Record<Locale, string> = {
  bg: "Не намирам достатъчно нормативно основание в наличните източници за този въпрос. Посочете наредба или член, или питайте по водоснабдяване, канализация, присъединяване, питейни или отпадъчни води.",
  en: "The available sources do not contain enough normative basis for this question. Name an ordinance or article, or ask about water supply, sewerage, connections, drinking water or wastewater.",
};

const HELP: Record<Locale, string> = {
  bg: "Мога да направя бърза справка в наличната нормативна база за ВиК проектиране: водоснабдяване, канализация, присъединяване, питейни и отпадъчни води. Посочете наредба, член или конкретен въпрос от тези теми. Това е демонстрационна справка и не замества проектантска проверка.",
  en: "I can look up the available Bulgarian rules for water and sewerage design: supply, sewerage, connections, drinking water and wastewater. Name an ordinance, an article, or ask a specific question on those topics. This is a demonstration lookup and does not replace a design check.",
};

const OUTSIDE: Record<Locale, string> = {
  bg: "Отговарям само на въпроси по ВиК нормативната база: водоснабдяване, канализация, присъединяване, питейни и отпадъчни води. За този въпрос нямам данни.",
  en: "I only answer questions about the Bulgarian water and sewerage rules: supply, sewerage, connections, drinking water and wastewater. I do not have an answer for this question.",
};

const NORMATIVE = /наредба|чл\.|член|вик|водоснаб|канализац|присъедин|питейн|отпадъч|водопровод|зут|бдс|рд-|стандарт/i;
const HELP_ASK = /как можеш да( ми)? помогнеш|какво можеш|с какво можеш|какво правиш|кой си|здравей|здрасти|how can you help|what can you do|^hello\b|^hi\b/i;
const OUTSIDE_ASK = /времето|време навън|weather|forecast|шега|рецепта|футбол|новини/i;

export function refusalFor(locale: Locale): string {
  return REFUSAL[locale];
}

export function guidedReply(locale: Locale, message: string): string | null {
  const text = message.trim();
  if (!text || NORMATIVE.test(text)) return null;
  if (HELP_ASK.test(text)) return HELP[locale];
  if (OUTSIDE_ASK.test(text)) return OUTSIDE[locale];
  return null;
}

export function systemPrompt(locale: Locale, retrieved: RetrievalResult): string {
  const language =
    locale === "en"
      ? "Answer in English. Keep the official Bulgarian names of the acts in every citation."
      : "Отговаряй на български, освен ако потребителят пише на друг език. Цитатите запазват официалните български имена на актовете.";
  const standard = retrieved.standardGuard
    ? "Въпросът засяга БДС, БДС EN, EN, ISO или DIN. Пълният текст на такъв стандарт не е в базата. Не възстановявай числени изисквания от него. Кажи кой стандарт е посочен, ако е в контекста, и че проверката зависи от пълния му текст."
    : "";
  return [
    "Ти си ВиК Проектант — нормативен асистент за ВиК проектиране на ITT Digital Hub.",
    "Това е помощен демонстрационен инструмент, не официална правна или проектантска експертиза.",
    language,
    "Използвай само предоставения retrieval context за нормативни твърдения. Не допълвай липсващи членове, стойности, разстояния, диаметри, дебити или срокове от памет.",
    "Цитирай член само за твърдение, което неговият текст директно подкрепя. Не описвай съдържание на член извън този текст.",
    "Ако исканата стойност или срок липсват от контекста, кажи, че наличните източници не ги съдържат, и спри. Не представяй съседен член като доказателство за липсващата стойност и не добавяй странични нормативни твърдения.",
    "Когато контекстът съдържа член, цитирай: Наредба, чл. X, и алинея или точка само ако са изрично в текста. Ако липсват, спри до члена.",
    "Ако контекстът има ред limit, не давай нормативна числова стойност. Посочи източника и ограничението.",
    "Ако контекстът не стига, кажи ясно, че не намираш достатъчно нормативно основание в наличните източници.",
    standard,
    "Нормативен контекст:",
    retrieved.context || "(няма намерен контекст)",
  ]
    .filter(Boolean)
    .join("\n\n");
}
