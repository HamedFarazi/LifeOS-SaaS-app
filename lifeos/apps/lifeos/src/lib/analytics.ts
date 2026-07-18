import type { Service, ServiceCategory } from '../types/index';
import { monthlyCost } from './dates';
import { CATEGORY_META } from '../data/categories';

/** Aggregated spending grouped by category. */
export interface CategorySlice {
  category: ServiceCategory;
  label: string;
  color: string;
  value: number;
}

/**
 * Groups monthly spend by category for the breakdown chart.
 *
 * @param services - Services to aggregate.
 * @returns Non-empty category slices sorted by value descending.
 */
export function spendByCategory(services: Service[]): CategorySlice[] {
  const map = new Map<ServiceCategory, number>();
  services
    .filter((s) => s.active)
    .forEach((s) => {
      map.set(s.category, (map.get(s.category) ?? 0) + monthlyCost(s));
    });
  return Array.from(map.entries())
    .map(([category, value]) => ({
      category,
      label: CATEGORY_META[category].label,
      color: CATEGORY_META[category].color,
      value: Math.round(value),
    }))
    .sort((a, b) => b.value - a.value);
}

/** A single point on the monthly spending trend line. */
export interface MonthPoint {
  month: string;
  value: number;
}

const FA_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
];

/**
 * Builds a simulated 6-month spending trend based on the current monthly base.
 *
 * @param services - Services to derive the base spend from.
 * @returns Six trend points ending at the current month.
 */
export function spendTrend(services: Service[]): MonthPoint[] {
  const base = services
    .filter((s) => s.active)
    .reduce((sum, s) => sum + monthlyCost(s), 0);
  const factors = [0.74, 0.81, 0.88, 0.92, 0.85, 1];
  return FA_MONTHS.map((month, i) => ({
    month,
    value: Math.round(base * factors[i]),
  }));
}

/**
 * Returns the most expensive services by monthly cost.
 *
 * @param services - Services to rank.
 * @param limit - Maximum number of results.
 * @returns Ranked list with computed monthly cost.
 */
export function topServices(
  services: Service[],
  limit = 5
): Array<{ service: Service; monthly: number }> {
  return services
    .filter((s) => s.active)
    .map((s) => ({ service: s, monthly: Math.round(monthlyCost(s)) }))
    .sort((a, b) => b.monthly - a.monthly)
    .slice(0, limit);
}
