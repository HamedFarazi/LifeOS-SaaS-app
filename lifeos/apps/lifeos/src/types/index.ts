export type ServiceCategory =
  | 'subscription'
  | 'domain'
  | 'hosting'
  | 'ssl'
  | 'vpn'
  | 'internet'
  | 'expense';

export type BillingCycle = 'monthly' | 'yearly';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  plan: string;
  price: number;
  priceCurrency: Currency;
  billingCycle: BillingCycle;
  nextRenewal: string;
  color: string;
  logoText?: string;
  logoImage?: string;
  active: boolean;
  createdAt: string;
}

export type InsightTone = 'warning' | 'info' | 'success' | 'danger';

export interface Insight {
  id: string;
  tone: InsightTone;
  icon: string;
  text: string;
}

export type Currency = 'IRT' | 'USD';
export type Language = 'fa' | 'en';
export type ThemeMode = 'dark' | 'slate' | 'arctic';

export interface Settings {
  currency: Currency;
  language: Language;
  userName: string;
  userEmail?: string;
  avatarImage?: string;
  themeMode?: ThemeMode;
  monthlyBudget?: number;
}

/** A savings / financial goal. */
export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  currency: Currency;
  deadline?: string;
  color: string;
  icon: string;
  createdAt: string;
}
