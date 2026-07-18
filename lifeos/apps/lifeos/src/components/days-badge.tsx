import React from 'react';
import { daysUntil } from '../lib/dates';
import { toFaDigits } from '../lib/format';
import styles from './days-badge.module.css';

/**
 * Props for {@link DaysBadge}.
 */
export interface DaysBadgeProps {
  /** ISO date the badge counts down to. */
  date: string;
}

/**
 * A small pill showing days remaining until a renewal, colored by urgency.
 *
 * @param props - The target date.
 * @returns A colored countdown pill.
 */
export function DaysBadge({ date }: DaysBadgeProps): React.JSX.Element {
  const d = daysUntil(date);
  const tone = d <= 3 ? 'urgent' : d <= 7 ? 'soon' : 'normal';
  const label = d < 0 ? 'منقضی' : d === 0 ? 'امروز' : `${toFaDigits(d)} روز`;
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}
