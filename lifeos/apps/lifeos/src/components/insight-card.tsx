import React from 'react';
import {
  IconAlertTriangle, IconCalendar, IconTrendingUp, IconCircleCheck,
} from '@tabler/icons-react';
import { useSettings } from '../store/use-settings';
import { toFaDigits } from '../lib/format';
import type { RawInsight } from '../lib/insights';
import styles from './insight-card.module.css';

const ICON_MAP: Record<string, React.ReactNode> = {
  'alert-triangle': <IconAlertTriangle size={15} stroke={2} />,
  'calendar':       <IconCalendar      size={15} stroke={2} />,
  'trending-up':    <IconTrendingUp    size={15} stroke={2} />,
  'check-circle':   <IconCircleCheck   size={15} stroke={2} />,
};

const TONE: Record<string, { color: string; bg: string }> = {
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  info:    { color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  success: { color: '#34D399', bg: 'rgba(52,211,153,0.08)' },
  danger:  { color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
};

function resolveText(insight: RawInsight, lang: 'fa' | 'en'): string {
  const p = insight.params;
  if (lang === 'en') {
    switch (insight.template) {
      case 'expiring':          return `${p.name} expires in ${p.days} days`;
      case 'upcoming-payments': return `${p.count} payment${Number(p.count) !== 1 ? 's' : ''} due in the next 7 days`;
      case 'trend':             return `Spending is up ${p.pct}% compared to last month`;
      case 'renew-week':        return `${p.count} service${Number(p.count) !== 1 ? 's' : ''} renewing this week`;
    }
  }
  // Persian
  switch (insight.template) {
    case 'expiring':          return `${p.name} تا ${toFaDigits(Number(p.days))} روز دیگر منقضی می‌شود`;
    case 'upcoming-payments': return `${toFaDigits(Number(p.count))} پرداخت در ۷ روز آینده دارید`;
    case 'trend':             return `هزینه این ماه ${toFaDigits(Number(p.pct))}٪ بیشتر از ماه قبل است`;
    case 'renew-week':        return `${toFaDigits(Number(p.count))} سرویس این هفته تمدید می‌شوند`;
  }
  return '';
}

export interface InsightCardProps {
  insight: RawInsight;
}

export function InsightCard({ insight }: InsightCardProps): React.JSX.Element {
  const lang = useSettings((s) => s.language);
  const cfg  = TONE[insight.tone] ?? TONE.info;
  const text = resolveText(insight, lang);

  return (
    <div
      className={styles.card}
      style={{ '--tone-color': cfg.color, '--tone-bg': cfg.bg } as React.CSSProperties}
    >
      <span className={styles.dot} />
      <span className={styles.icon}>{ICON_MAP[insight.icon] ?? <IconAlertTriangle size={15} stroke={2} />}</span>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
