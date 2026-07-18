/**
 * The category a managed service belongs to.
 */
export type ServiceCategory =
  | 'subscription'
  | 'domain'
  | 'hosting'
  | 'ssl'
  | 'vpn'
  | 'internet'
  | 'expense';

/**
 * Billing cadence for a service.
 */
export type BillingCycle = 'monthly' | 'yearly';

/**
 * A single managed service / recurring expense in LifeOS.
 */
export interface Service {
  /** Unique identifier. */
  id: string;
  /** Display name, e.g. "Netflix". */
  name: string;
  /** Domain category used for grouping and analytics. */
  category: ServiceCategory;
  /** Plan label, e.g. "استاندارد", "Pro". */
  plan: string;
  /** Price for one billing cycle. */
  price: number;
  /** Currency the service price is denominated in. */
  priceCurrency: Currency;
  /** Billing cadence. */
  billingCycle: BillingCycle;
  /** ISO date string of the next renewal/charge. */
  nextRenewal: string;
  /** Brand color used for the logo background. */
  color: string;
  /** Short text mark shown in the logo tile (fallback to first letter). */
  logoText?: string;
  /** Base64 data URL of a custom service logo uploaded by the user. */
  logoImage?: string;
  /** Whether the service is currently active. */
  active: boolean;
  /** ISO date the service was added. */
  createdAt: string;
}

/**
 * Severity / tone of a Command Center insight.
 */
export type InsightTone = 'warning' | 'info' | 'success' | 'danger';

/**
 * A locally-computed insight shown in the Command Center.
 */
export interface Insight {
  id: string;
  tone: InsightTone;
  icon: string;
  text: string;
}

/**
 * Supported display currencies.
 */
export type Currency = 'IRT' | 'USD';

/**
 * Supported UI languages.
 */
export type Language = 'fa' | 'en';

/**
 * User-level application preferences.
 */
export interface Settings {
  currency: Currency;
  language: Language;
  userName: string;
  /** Optional user email shown in the profile popover. */
  userEmail?: string;
  /** Base64 data URL of the uploaded profile picture, or undefined. */
  avatarImage?: string;
}
