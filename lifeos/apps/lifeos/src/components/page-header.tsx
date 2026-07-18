import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './page-header.module.css';

/**
 * Props for {@link PageHeader}.
 */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Show a back button (defaults to false). */
  back?: boolean;
}

/**
 * A simple page header for inner screens with an optional back button.
 *
 * @param props - Title, subtitle, and back-button flag.
 * @returns A page header.
 */
export function PageHeader({ title, subtitle, back }: PageHeaderProps): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      {back ? (
        <button className={styles.back} type="button" onClick={() => navigate(-1)} aria-label="بازگشت">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      ) : null}
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.sub}>{subtitle}</p> : null}
      </div>
    </header>
  );
}
