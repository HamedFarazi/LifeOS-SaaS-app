import type { Currency } from "../types/index";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number): string {
  // In English mode, return Latin digits unchanged
  if (document.documentElement.lang === "en") return String(input);
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

const USD_RATE = 60_000;

/**
 * Returns the current UI language from <html> lang attribute.
 * Avoids importing useSettings (which needs React context) in a pure lib.
 */
function uiLang(): "fa" | "en" {
  return document.documentElement.lang === "en" ? "en" : "fa";
}

export function formatMoney(
  amount: number,
  sourceCurrency: Currency = "IRT",
  displayCurrency: Currency = "IRT",
): string {
  const inIRT = sourceCurrency === "USD" ? amount * USD_RATE : amount;
  if (displayCurrency === "USD") {
    const usd = inIRT / USD_RATE;
    return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;
  }
  const lang = uiLang();
  const number = Math.round(inIRT).toLocaleString("en-US");
  if (lang === "en") {
    return `${number} Toman`;
  }
  return `${toFaDigits(number)} تومان`;
}

export function formatNative(amount: number, currency: Currency): string {
  const lang = uiLang();
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
  const number = Math.round(amount).toLocaleString("en-US");
  return lang === "en" ? `${number} Toman` : `${toFaDigits(number)} تومان`;
}

export function formatMoneyShort(amount: number): string {
  const lang = uiLang();
  if (lang === "en") {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
    return String(amount);
  }
  if (amount >= 1_000_000)
    return `${toFaDigits((amount / 1_000_000).toFixed(1))}میلیون`;
  if (amount >= 1_000) return `${toFaDigits(Math.round(amount / 1_000))}هزار`;
  return toFaDigits(amount);
}
