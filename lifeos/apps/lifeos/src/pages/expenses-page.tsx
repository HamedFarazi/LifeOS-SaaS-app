import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { PageHeader } from '../components/page-header';
import { ServiceRow } from '../components/service-row';
import { monthlyCost } from '../lib/dates';
import { formatMoney } from '../lib/format';
import styles from './renewals-page.module.css';

/**
 * Lists recurring expenses (expense-category services) with a total summary.
 *
 * @returns The expenses page.
 */
export function ExpensesPage(): React.JSX.Element {
  const services = useServices((s) => s.services);
  const currency = useSettings((s) => s.currency);
  const navigate = useNavigate();

  const expenses = useMemo(
    () => services.filter((s) => s.category === 'expense'),
    [services]
  );
  const total = useMemo(
    () => expenses.filter((s) => s.active).reduce((sum, s) => sum + monthlyCost(s), 0),
    [expenses]
  );

  return (
    <div>
      <PageHeader title="هزینه‌ها" subtitle="هزینه‌های تکراری ماهانه" back />

      <div className={styles.group}>
        <p className={styles.groupTitle}>مجموع ماهانه: {formatMoney(total, 'IRT', currency)}</p>
        {expenses.map((s) => (
          <ServiceRow key={s.id} service={s} onClick={() => navigate(`/service/${s.id}`)} />
        ))}
        {expenses.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px 0' }}>
            هزینه‌ای ثبت نشده است
          </p>
        ) : null}
      </div>
    </div>
  );
}
