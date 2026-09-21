import type { Locale } from "@/lib/i18n";
import { sa } from "./copy";
import { formatNumber } from "./lib/format";
import type {
  AnalysisWarningCode,
  BoundaryReasonCode,
  ConfidenceLevel,
  ConfidenceReason,
  SettlementProfileCode,
} from "./types";

export function presentProfile(locale: Locale, code: SettlementProfileCode) {
  return sa(locale).profiles[code];
}

export function presentBoundaryReason(locale: Locale, code: BoundaryReasonCode) {
  return sa(locale).boundaryReasons[code];
}

export function presentWarning(locale: Locale, code: AnalysisWarningCode) {
  return sa(locale).analysisWarnings[code];
}

export function presentConfidenceLevel(locale: Locale, level: ConfidenceLevel) {
  return sa(locale).confidenceLevels[level];
}

export function presentConfidenceReason(locale: Locale, reason: ConfidenceReason) {
  const template = sa(locale).confidenceReasons[reason.code];
  return template.replace("{value}", formatNumber(reason.value, 1, locale));
}
