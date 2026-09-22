import type { FieldError } from "./types";

export function formatTemperature(value: number): string {
  return value.toFixed(1);
}

export function formatHours(value: number): string {
  if (Math.abs(value) < 0.05) return value.toFixed(2);
  if (Math.abs(value) < 10) return value.toFixed(2);
  return value.toFixed(1);
}

export function formatPower(value: number): string {
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

export function formatUa(value: number): string {
  if (value < 0.1) return value.toFixed(3);
  return value.toFixed(2);
}

export function formatH(value: number): string {
  if (value < 1) return value.toFixed(3);
  if (value < 10) return value.toFixed(2);
  return value.toFixed(1);
}

export function fieldErrorMessage(error: FieldError, locale: "bg" | "en"): string {
  const bg: Record<FieldError["code"], string> = {
    required: "Въведете стойност.",
    "not-finite": "Въведете валидно число.",
    "too-small": "Стойността е под допустимия диапазон.",
    "too-large": "Стойността е над допустимия диапазон.",
    geometry: "Дебелината на стената трябва да остави светъл отвор в тръбата.",
  };
  const en: Record<FieldError["code"], string> = {
    required: "Enter a value.",
    "not-finite": "Enter a valid number.",
    "too-small": "This value is below the allowed range.",
    "too-large": "This value is above the allowed range.",
    geometry: "Wall thickness must leave a clear opening inside the pipe.",
  };
  return locale === "bg" ? bg[error.code] : en[error.code];
}
