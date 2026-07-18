import React from 'react';
import { IconChevronLeft } from '@tabler/icons-react';
import type { Service } from '../types/index';
import { ServiceLogo } from './service-logo';
import { DaysBadge } from './days-badge';
import { monthlyCost } from '../lib/dates';
import { formatMoney } from '../lib/format';
import { useSettings } from '../store/use-settings';
import styles from './service-row.module.css';

export interface ServiceRowProps { service: Service; onClick?: () => void; }

export function ServiceRow({ service, onClick }: ServiceRowProps): React.JSX.Element {
  const currency = useSettings((s) => s.currency);
  return (
    <button className={styles.row} type="button" onClick={onClick}>
      <ServiceLogo service={service} size={40} />
      <div className={styles.info}>
        <p className={styles.name}>{service.name}</p>
        <p className={styles.plan}>{service.plan} · {service.billingCycle === 'monthly' ? 'ماهانه' : 'سالانه'}</p>
      </div>
      <div className={styles.right}>
        <span className={styles.price}>{formatMoney(monthlyCost(service), 'IRT', currency)}</span>
        <DaysBadge date={service.nextRenewal} />
      </div>
      <IconChevronLeft size={14} stroke={1.8} className={styles.chevron} />
    </button>
  );
}
