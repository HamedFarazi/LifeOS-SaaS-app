import React, { useMemo } from 'react';
import {
  IconApps, IconCalendarDue, IconTrendingUp, IconReceipt,
} from '@tabler/icons-react';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { monthlyCost, daysUntil } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import styles from './kpi-row.module.css';

export function KpiRow(): React.JSX.Element {
  const services        = useServices((s) => s.services);
  const displayCurrency = useSettings((s) => s.currency);

  const active = useMemo(() => services.filter((s) => s.active), [services]);

  const monthlyTotal = useMemo(
    () => active.reduce((sum, s) => sum + monthlyCost(s), 0), [active]
  );

  const upcoming = useMemo(
    () => active.filter((s) => { const d = daysUntil(s.nextRenewal); return d >= 0 && d <= 14; }).length,
    [active]
  );

  const monthlyChange = useMemo(() => {
    const base = monthlyTotal;
    return base > 0 ? 12 : 0;
  }, [monthlyTotal]);

  const avgCost = active.length > 0 ? Math.round(monthlyTotal / active.length) : 0;

  const kpis = [
    {
      icon:  <IconApps        size={16} stroke={1.8} />,
      label: 'سرویس فعال',
      value: toFaDigits(active.length),
      sub:   'اشتراک',
    },
    {
      icon:  <IconCalendarDue size={16} stroke={1.8} />,
      label: 'تمدید نزدیک',
      value: toFaDigits(upcoming),
      sub:   '۱۴ روز آینده',
      warn:  upcoming > 0,
    },
    {
      icon:  <IconTrendingUp  size={16} stroke={1.8} />,
      label: 'رشد ماهانه',
      value: `+${toFaDigits(monthlyChange)}٪`,
      sub:   'نسبت به ماه قبل',
    },
    {
      icon:  <IconReceipt     size={16} stroke={1.8} />,
      label: 'میانگین هر سرویس',
      value: formatMoney(avgCost, 'IRT', displayCurrency),
      sub:   'در ماه',
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
