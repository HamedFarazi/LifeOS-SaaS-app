import type { Service } from '../types/index';
import { daysUntil, monthlyCost } from './dates';

/**
 * A raw insight — uses template keys instead of hard-coded Persian text.
 * The component resolves the final string using useT().
 */
export interface RawInsight {
  id: string;
  tone: 'warning' | 'info' | 'success' | 'danger';
  icon: string;
  /** Template key + params for i18n rendering */
  template: 'expiring' | 'upcoming-payments' | 'trend' | 'renew-week';
  params: Record<string, string | number>;
}

export function computeRawInsights(services: Service[]): RawInsight[] {
  const active = services.filter((s) => s.active);
  const insights: RawInsight[] = [];

  // Soonest expiring domain / ssl / hosting
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
      template: 'expiring',
      params: { name: expiring.s.name, days: expiring.d },
    });
  }

  // Payments in next 7 days
  const soon = active.filter((s) => {
    const d = daysUntil(s.nextRenewal);
    return d >= 0 && d <= 7;
  });
  if (soon.length > 0) {
    insights.push({
      id: 'upcoming-pay',
      tone: 'info',
      icon: 'calendar',
      template: 'upcoming-payments',
      params: { count: soon.length },
    });
  }

  // Spending trend
  const monthly = active.reduce((sum, s) => sum + monthlyCost(s), 0);
  const newThisMonth = active.filter((s) => daysUntil(s.createdAt) >= -30);
  if (newThisMonth.length > 0 && monthly > 0) {
    const added = newThisMonth.reduce((sum, s) => sum + monthlyCost(s), 0);
    const pct   = Math.round((added / monthly) * 100);
    if (pct > 0) {
      insights.push({
        id: 'trend',
        tone: 'danger',
        icon: 'trending-up',
        template: 'trend',
        params: { pct: Math.min(pct, 99) },
      });
    }
  }

  // Renewals this week
  const thisWeek = active.filter((s) => {
    const d = daysUntil(s.nextRenewal);
    return d >= 0 && d <= 7;
  });
  insights.push({
    id: 'renew-week',
    tone: 'success',
    icon: 'check-circle',
    template: 'renew-week',
    params: { count: thisWeek.length },
  });

  return insights;
}

/* Keep backward-compat export */
export function computeInsights(services: Service[]) {
  return computeRawInsights(services).map((r) => ({
    id: r.id,
    tone: r.tone,
    icon: r.icon,
    text: r.params as unknown as string,   // will be replaced by component
    _raw: r,
  }));
}
