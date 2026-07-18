import type { Currency } from '../types/index';

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts Latin digits in a string to Persian digits.
 *
 * @param input - String or number containing Latin digits.
 * @returns String with Persian digits.
 */
export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Approximate Toman -> USD conversion rate used for display only. */
const USD_RATE = 60_000;

/**
 * Formats a Toman amount into a localized currency string with Persian digits.
 *
 * @param amount - Amount in Toman.
 * @param currency - Target display currency.
 * @returns Formatted, grouped currency string.
 */
/**
 * Formats an amount (in `sourceCurrency`) into the user's display currency.
 */
export function formatMoney(
  amount: number,
  sourceCurrency: Currency = 'IRT',
  displayCurrency: Currency = 'IRT'
): string {
  const inIRT = sourceCurrency === 'USD' ? amount * USD_RATE : amount;
  if (displayCurrency === 'USD') {
    const usd = inIRT / USD_RATE;
    return `${usd.toLocaleString('en-US', { maximumFractionDigits: 1 })}`;
  }
  return `${toFaDigits(Math.round(inIRT).toLocaleString('en-US'))} تومان`;
}

/** Format a price in its native currency without conversion. */
export function formatNative(amount: number, currency: Currency): string {
  if (currency === 'USD') return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  return `${toFaDigits(Math.round(amount).toLocaleString('en-US'))} تومان`;
}

/**
 * Compact money formatting for chart axes and tight spaces.
 *
 * @param amount - Amount in Toman.
 * @returns Short string like "۱.۲م".
 */
export function formatMoneyShort(amount: number): string {
  if (amount >= 1_000_000) {
    return `${toFaDigits((amount / 1_000_000).toFixed(1))}م`;
  }
  if (amount >= 1_000) {
    return `${toFaDigits(Math.round(amount / 1_000))}ه`;
  }
  return toFaDigits(amount);
}
