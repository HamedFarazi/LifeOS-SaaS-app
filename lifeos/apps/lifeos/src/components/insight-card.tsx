import React from 'react';
import {
  IconAlertTriangle, IconCalendar, IconTrendingUp, IconCircleCheck,
} from '@tabler/icons-react';
import type { Insight } from '../types/index';
import styles from './insight-card.module.css';

const ICON_MAP: Record<string, React.ReactNode> = {
  'alert-triangle': <IconAlertTriangle size={15} stroke={2} />,
  'calendar':       <IconCalendar      size={15} stroke={2} />,
  'trending-up':    <IconTrendingUp    size={15} stroke={2} />,
  'check-circle':   <IconCircleCheck   size={15} stroke={2} />,
};

const TONE: Record<string, { color: string; bg: string; dot: string }> = {
  warning: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  dot: '#FBBF24' },
  info:    { color: '#38BDF8', bg: 'rgba(56,189,248,0.08)', dot: '#38BDF8' },
  success: { color: '#34D399', bg: 'rgba(52,211,153,0.08)', dot: '#34D399' },
  danger:  { color: '#F87171', bg: 'rgba(248,113,113,0.1)', dot: '#F87171' },
};

export interface InsightCardProps { insight: Insight; }

export function InsightCard({ insight }: InsightCardProps): React.JSX.Element {
  const t = TONE[insight.tone] ?? TONE.info;
  return (
    <div className={styles.card}>
      <span className={styles.dot} style={{ background: t.dot }} />
      <span className={styles.icon} style={{ color: t.color, background: t.bg }}>
        {ICON_MAP[insight.icon] ?? <IconAlertTriangle size={15} stroke={2} />}
      </span>
      <p className={styles.text}>{insight.text}</p>
    </div>
  );
}
