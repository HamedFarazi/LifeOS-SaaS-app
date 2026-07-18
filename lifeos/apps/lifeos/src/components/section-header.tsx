import React from 'react';
import styles from './section-header.module.css';

export interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps): React.JSX.Element {
  return (
    <div className={styles.row}>
      <h2 className={styles.title}>{title}</h2>
      {action && (
        <button className={styles.action} onClick={onAction} type="button">
          {action}
        </button>
      )}
    </div>
  );
}
