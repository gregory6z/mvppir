import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ptBR, enUS, es, fr } from "date-fns/locale";
import type { Locale } from "date-fns";

/**
 * Utility function to merge Tailwind CSS classes
 * Similar to shadcn/ui's cn function
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(value: number | string, currency = "USD") {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Get date-fns locale based on i18n language code
 */
export function getDateFnsLocale(languageCode: string): Locale {
  const localeMap: Record<string, Locale> = {
    pt: ptBR,
    en: enUS,
    es: es,
    fr: fr,
  };

  return localeMap[languageCode] || ptBR;
}

/**
 * Format date values with i18n support
 * Uses the user's current language from i18n
 */
export function formatDate(date: string | Date, languageCode = "pt") {
  const localeMap: Record<string, string> = {
    pt: "pt-BR",
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
  };

  const locale = localeMap[languageCode] || "pt-BR";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
