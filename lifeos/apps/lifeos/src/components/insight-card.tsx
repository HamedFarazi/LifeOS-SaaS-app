import React from 'react';
import type { Insight } from '../types/index';
import styles from './insight-card.module.css';

/**
 * Props for {@link InsightCard}.
 */
export interface InsightCardProps {
  insight: Insight;
}

/**
 * A single Command Center insight row with a tone-colored icon chip.
 *
 * @param props - The insight to render.
 * @returns An insight card.
 */
export function InsightCard({ insight }: InsightCardProps): React.JSX.Element {
  return (
    <div className={styles.card}>
      <span className={`${styles.icon} ${styles[insight.tone]}`}>{insight.icon}</span>
      <p className={styles.text}>{insight.text}</p>
    </div>
  );
}
