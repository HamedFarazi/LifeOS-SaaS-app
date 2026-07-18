import type { Service } from '../types/index';
import { toFaDigits } from './format';

/**
 * Number of whole days from today until the given ISO date.
 *
 * @param iso - ISO date string.
 * @returns Days remaining (negative if in the past).
 */
export function daysUntil(iso: string): number {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Persian relative label for a renewal date.
 *
 * @param iso - ISO date string.
 * @returns Label such as "امروز" or "۳ روز دیگر".
 */
export function renewalLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return `${toFaDigits(Math.abs(d))} روز پیش`;
  if (d === 0) return 'امروز';
  if (d === 1) return 'فردا';
  return `${toFaDigits(d)} روز دیگر`;
}

/**
 * Normalizes a service price to an equivalent monthly cost in Toman.
 *
 * @param service - The service to evaluate.
 * @returns Monthly-equivalent cost.
 */
const USD_RATE = 60_000;

export function monthlyCost(service: Service): number {
  const inIRT = service.priceCurrency === 'USD' ? service.price * USD_RATE : service.price;
  return service.billingCycle === 'yearly' ? inIRT / 12 : inIRT;
}

export function yearlyCost(service: Service): number {
  const inIRT = service.priceCurrency === 'USD' ? service.price * USD_RATE : service.price;
  return service.billingCycle === 'yearly' ? inIRT : inIRT * 12;
}

export function todayJalali(): string {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
  }
}

/**
 * Formats an ISO date as a Persian date string (Gregorian month names omitted,
 * uses localized numeric format).
 *
 * @param iso - ISO date string.
 * @returns Localized date string.
 */
export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return toFaDigits(new Date(iso).toLocaleDateString());
  }
}
