import type { Insight, Service } from '../types/index';
import { daysUntil, monthlyCost } from './dates';
import { toFaDigits } from './format';

/**
 * Computes Command Center insights purely from local service data.
 *
 * @param services - All managed services.
 * @returns Ordered list of actionable insights.
 */
export function computeInsights(services: Service[]): Insight[] {
  const active = services.filter((s) => s.active);
  const insights: Insight[] = [];

  // Soonest expiring domain / ssl / hosting.
  const expiring = active
    .filter((s) => ['domain', 'ssl', 'hosting'].includes(s.category))
    .map((s) => ({ s, d: daysUntil(s.nextRenewal) }))
    .filter((x) => x.d >= 0 && x.d <= 20)
    .sort((a, b) => a.d - b.d)[0];
  if (expiring) {
    insights.push({
      id: 'expiring',
      tone: 'warning',
      icon: 'alert-triangle',
      text: `${expiring.s.name} تا ${toFaDigits(expiring.d)} روز دیگر منقضی می‌شود`,
    });
  }

  // Payments in the next 7 days.
  const soon = active.filter((s) => {
    const d = daysUntil(s.nextRenewal);
    return d >= 0 && d <= 7;
  });
  if (soon.length > 0) {
    insights.push({
      id: 'upcoming-pay',
      tone: 'info',
      icon: 'calendar',
      text: `${toFaDigits(soon.length)} پرداخت در ۷ روز آینده دارید`,
    });
  }

  // Spending trend (simulated comparison vs. last month using created dates).
  const monthly = active.reduce((sum, s) => sum + monthlyCost(s), 0);
  const newThisMonth = active.filter((s) => daysUntil(s.createdAt) >= -30);
  if (newThisMonth.length > 0 && monthly > 0) {
    const added = newThisMonth.reduce((sum, s) => sum + monthlyCost(s), 0);
    const pct = Math.round((added / monthly) * 100);
    if (pct > 0) {
      insights.push({
        id: 'trend',
        tone: 'danger',
        icon: 'trending-up',
        text: `هزینه این ماه ${toFaDigits(Math.min(pct, 99))}٪ بیشتر از ماه قبل است`,
      });
    }
  }

  // Renewals this week.
  const thisWeek = active.filter((s) => {
    const d = daysUntil(s.nextRenewal);
    return d >= 0 && d <= 7;
  });
  insights.push({
    id: 'renew-week',
    tone: 'success',
    icon: 'check-circle',
    text: `${toFaDigits(thisWeek.length)} سرویس این هفته تمدید می‌شوند`,
  });

  return insights;
}
