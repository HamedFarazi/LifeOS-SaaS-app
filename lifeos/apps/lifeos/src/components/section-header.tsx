import React from 'react';
import styles from './section-header.module.css';

/**
 * Props for {@link SectionHeader}.
 */
export interface SectionHeaderProps {
  title: string;
  /** Optional action text shown on the opposite side (e.g. "مشاهده همه"). */
  action?: string;
  onAction?: () => void;
}

/**
 * A row with a section title and an optional trailing action link.
 *
 * @param props - Title and optional action.
 * @returns A section header row.
 */
export function SectionHeader({
  title,
  action,
  onAction,
}: SectionHeaderProps): React.JSX.Element {
  return (
    <div className={styles.row}>
      <h2 className={styles.title}>{title}</h2>
      {action ? (
        <button className={styles.action} onClick={onAction} type="button">
          {action}
        </button>
      ) : null}
    </div>
  );
}
