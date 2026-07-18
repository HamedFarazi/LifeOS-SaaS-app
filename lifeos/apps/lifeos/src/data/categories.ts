import type { ServiceCategory } from '../types/index';

/**
 * Human-readable Persian metadata for every service category.
 */
export const CATEGORY_META: Record<
  ServiceCategory,
  { label: string; icon: string; color: string }
> = {
  subscription: { label: 'اشتراک', icon: '🎬', color: '#A855F7' },
  domain: { label: 'دامنه', icon: '🌐', color: '#2FD0FF' },
  hosting: { label: 'هاستینگ', icon: '🖥️', color: '#63E8FF' },
  ssl: { label: 'گواهی SSL', icon: '🔒', color: '#34D399' },
  vpn: { label: 'وی‌پی‌ان', icon: '🛡️', color: '#F472B6' },
  internet: { label: 'اینترنت', icon: '📶', color: '#FBBF24' },
  expense: { label: 'هزینه تکراری', icon: '💳', color: '#FB7185' },
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
