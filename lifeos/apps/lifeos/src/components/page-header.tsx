import React from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import styles from './page-header.module.css';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
}

export function PageHeader({ title, subtitle, back }: PageHeaderProps): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      {back && (
        <button className={styles.back} type="button" onClick={() => navigate(-1)} aria-label="بازگشت">
          <IconChevronRight size={18} stroke={2} />
        </button>
      )}
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.sub}>{subtitle}</p>}
      </div>
    </header>
  );
}
