import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../store/use-services';
import { PageHeader } from '../components/page-header';
import { ServiceRow } from '../components/service-row';
import { daysUntil } from '../lib/dates';
import styles from './renewals-page.module.css';

/**
 * Groups upcoming renewals into time buckets (this week, this month, later).
 *
 * @returns The renewals page.
 */
export function RenewalsPage(): React.JSX.Element {
  const services = useServices((s) => s.services);
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const active = services
      .filter((s) => s.active && daysUntil(s.nextRenewal) >= 0)
      .sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal));
    return {
      week: active.filter((s) => daysUntil(s.nextRenewal) <= 7),
      month: active.filter((s) => {
        const d = daysUntil(s.nextRenewal);
        return d > 7 && d <= 30;
      }),
      later: active.filter((s) => daysUntil(s.nextRenewal) > 30),
    };
  }, [services]);

  const renderGroup = (title: string, items: typeof groups.week) =>
    items.length > 0 ? (
      <div className={styles.group}>
        <p className={styles.groupTitle}>{title}</p>
        <div className={styles.groupItems}>
          {items.map((s) => (
            <ServiceRow key={s.id} service={s} onClick={() => navigate(`/service/${s.id}`)} />
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div>
      <PageHeader title="تمدیدها" subtitle="یادآوری پرداخت‌های پیش رو" back />
      {renderGroup('این هفته', groups.week)}
      {renderGroup('این ماه', groups.month)}
      {renderGroup('بعداً', groups.later)}
    </div>
  );
}
