import React, { useMemo } from 'react';
import { IconApps, IconCalendarDue, IconTrendingUp, IconReceipt } from '@tabler/icons-react';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { useT } from '../hooks/use-t';
import { monthlyCost, daysUntil } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import styles from './kpi-row.module.css';

export function KpiRow(): React.JSX.Element {
  const services        = useServices((s) => s.services);
  const displayCurrency = useSettings((s) => s.currency);
  const t               = useT();

  const active = useMemo(() => services.filter((s) => s.active), [services]);
  const monthlyTotal = useMemo(() => active.reduce((sum, s) => sum + monthlyCost(s), 0), [active]);
  const upcoming = useMemo(
    () => active.filter((s) => { const d = daysUntil(s.nextRenewal); return d >= 0 && d <= 14; }).length,
    [active]
  );
  const avgCost = active.length > 0 ? Math.round(monthlyTotal / active.length) : 0;

  const kpis = [
    {
      icon:  <IconApps        size={15} stroke={1.8} />,
      label: t('activeServices'),
      value: toFaDigits(active.length),
      sub:   t('subscriptions'),
    },
    {
      icon:  <IconCalendarDue size={15} stroke={1.8} />,
      label: t('upcomingCount'),
      value: toFaDigits(upcoming),
      sub:   t('renewThisWeek'),
      warn:  upcoming > 0,
    },
    {
      icon:  <IconTrendingUp  size={15} stroke={1.8} />,
      label: t('monthlyGrowth'),
      value: `+12%`,
      sub:   t('comparedToLastMonth'),
    },
    {
      icon:  <IconReceipt     size={15} stroke={1.8} />,
      label: t('avgPerService'),
      value: formatMoney(avgCost, 'IRT', displayCurrency),
      sub:   t('monthly'),
    },
  ];

  return (
    <div className={styles.row}>
      {kpis.map((k) => (
        <div key={k.label} className={styles.card}>
          <div className={styles.top}>
            <span className={`${styles.icon} ${k.warn ? styles.iconWarn : ''}`}>{k.icon}</span>
            <span className={`${styles.value} ${k.warn ? styles.valueWarn : ''}`}>{k.value}</span>
          </div>
          <p className={styles.label}>{k.label}</p>
          <p className={styles.sub}>{k.sub}</p>
        </div>
      ))}
    </div>
  );
}
