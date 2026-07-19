import type { ServiceCategory } from '../types/index';

type CategoryMeta = { labelFa: string; labelEn: string; icon: string; color: string };

export const CATEGORY_META: Record<ServiceCategory, CategoryMeta> = {
  subscription: { labelFa: 'اشتراک',       labelEn: 'Subscription', icon: 'layers',       color: '#3B82F6' },
  domain:       { labelFa: 'دامنه',          labelEn: 'Domain',       icon: 'globe',        color: '#06B6D4' },
  hosting:      { labelFa: 'هاستینگ',        labelEn: 'Hosting',      icon: 'server',       color: '#8B5CF6' },
  ssl:          { labelFa: 'گواهی SSL',      labelEn: 'SSL',          icon: 'shield-check', color: '#34D399' },
  vpn:          { labelFa: 'وی‌پی‌ان',        labelEn: 'VPN',          icon: 'shield',       color: '#F59E0B' },
  internet:     { labelFa: 'اینترنت',        labelEn: 'Internet',     icon: 'wifi',         color: '#6366F1' },
  expense:      { labelFa: 'هزینه تکراری',   labelEn: 'Expense',      icon: 'wallet',       color: '#F87171' },
};

/** Returns the label in the current UI language */
export function categoryLabel(cat: ServiceCategory): string {
  const meta = CATEGORY_META[cat];
  return document.documentElement.lang === 'en' ? meta.labelEn : meta.labelFa;
}

export const CATEGORY_ORDER: ServiceCategory[] = [
  'subscription', 'domain', 'hosting', 'ssl', 'vpn', 'internet', 'expense',
];
