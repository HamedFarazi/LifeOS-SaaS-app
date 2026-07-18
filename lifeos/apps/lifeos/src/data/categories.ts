import type { ServiceCategory } from '../types/index';

/**
 * Human-readable Persian metadata for every service category.
 */
export const CATEGORY_META: Record<
  ServiceCategory,
  { label: string; icon: string; color: string }
> = {
  subscription: { label: 'اشتراک',       icon: 'layers',       color: '#A855F7' },
  domain:       { label: 'دامنه',          icon: 'globe',        color: '#2FD0FF' },
  hosting:      { label: 'هاستینگ',        icon: 'server',       color: '#63E8FF' },
  ssl:          { label: 'گواهی SSL',      icon: 'shield-check', color: '#34D399' },
  vpn:          { label: 'وی‌پی‌ان',        icon: 'shield',       color: '#F472B6' },
  internet:     { label: 'اینترنت',        icon: 'wifi',         color: '#FBBF24' },
  expense:      { label: 'هزینه تکراری',   icon: 'wallet',       color: '#FB7185' },
};

/**
 * Ordered list of categories for filter chips.
 */
export const CATEGORY_ORDER: ServiceCategory[] = [
  'subscription',
  'domain',
  'hosting',
  'ssl',
  'vpn',
  'internet',
  'expense',
];
