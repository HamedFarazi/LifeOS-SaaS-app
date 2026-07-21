import type { Service } from '../types/index';

/**
 * Returns an ISO date string offset from today by the given number of days.
 */
function daysFromNow(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const SEED_SERVICES: Service[] = [
  { id: 'svc-chatgpt', name: 'ChatGPT Plus', category: 'subscription', plan: 'Plus', price: 20, priceCurrency: 'USD', billingCycle: 'monthly', nextRenewal: daysFromNow(3), color: '#10A37F', logoText: 'AI', active: true, createdAt: daysFromNow(-90) },
  { id: 'svc-netflix', name: 'Netflix', category: 'subscription', plan: 'پریمیوم', price: 199_000, priceCurrency: 'IRT', billingCycle: 'monthly', nextRenewal: daysFromNow(3), color: '#E50914', logoText: 'N', active: true, createdAt: daysFromNow(-200) },
  { id: 'svc-spotify', name: 'Spotify', category: 'subscription', plan: 'پریمیوم', price: 129_000, priceCurrency: 'IRT', billingCycle: 'monthly', nextRenewal: daysFromNow(7), color: '#1DB954', logoText: '♪', active: true, createdAt: daysFromNow(-160) },
  { id: 'svc-prime', name: 'Prime Video', category: 'subscription', plan: 'استاندارد', price: 179_000, priceCurrency: 'IRT', billingCycle: 'monthly', nextRenewal: daysFromNow(6), color: '#1399FF', logoText: 'P', active: true, createdAt: daysFromNow(-120) },
  { id: 'svc-copilot', name: 'GitHub Copilot', category: 'subscription', plan: 'Individual', price: 10, priceCurrency: 'USD', billingCycle: 'monthly', nextRenewal: daysFromNow(12), color: '#24292F', logoText: '⌥', active: true, createdAt: daysFromNow(-75) },
  { id: 'svc-adobe', name: 'Adobe CC', category: 'subscription', plan: 'All Apps', price: 55, priceCurrency: 'USD', billingCycle: 'monthly', nextRenewal: daysFromNow(18), color: '#FF0000', logoText: 'Ai', active: true, createdAt: daysFromNow(-300) },
  { id: 'svc-domain-ir', name: 'example.ir', category: 'domain', plan: 'دامنه .ir', price: 250_000, priceCurrency: 'IRT', billingCycle: 'yearly', nextRenewal: daysFromNow(12), color: '#2FD0FF', logoText: '.ir', active: true, createdAt: daysFromNow(-353) },
  { id: 'svc-domain-com', name: 'trackly.com', category: 'domain', plan: 'دامنه .com', price: 15, priceCurrency: 'USD', billingCycle: 'yearly', nextRenewal: daysFromNow(40), color: '#6366F1', logoText: '.com', active: true, createdAt: daysFromNow(-325) },
  { id: 'svc-hosting', name: 'هاست ابری', category: 'hosting', plan: 'پلن حرفه‌ای', price: 1_800_000, priceCurrency: 'IRT', billingCycle: 'yearly', nextRenewal: daysFromNow(25), color: '#63E8FF', logoText: 'H', active: true, createdAt: daysFromNow(-340) },
  { id: 'svc-ssl', name: 'گواهی SSL', category: 'ssl', plan: 'Wildcard', price: 950_000, priceCurrency: 'IRT', billingCycle: 'yearly', nextRenewal: daysFromNow(5), color: '#34D399', logoText: 'SSL', active: true, createdAt: daysFromNow(-360) },
  { id: 'svc-vpn', name: 'VPN پرمیوم', category: 'vpn', plan: 'سالانه', price: 1_200_000, priceCurrency: 'IRT', billingCycle: 'yearly', nextRenewal: daysFromNow(60), color: '#F472B6', logoText: 'V', active: true, createdAt: daysFromNow(-305) },
  { id: 'svc-internet', name: 'اینترنت خانگی', category: 'internet', plan: 'فیبر نوری', price: 720_000, priceCurrency: 'IRT', billingCycle: 'monthly', nextRenewal: daysFromNow(9), color: '#FBBF24', logoText: 'NET', active: true, createdAt: daysFromNow(-220) },
  { id: 'svc-gym', name: 'باشگاه ورزشی', category: 'expense', plan: 'عضویت ماهانه', price: 850_000, priceCurrency: 'IRT', billingCycle: 'monthly', nextRenewal: daysFromNow(14), color: '#FB7185', logoText: '🏋', active: true, createdAt: daysFromNow(-95) },
];
