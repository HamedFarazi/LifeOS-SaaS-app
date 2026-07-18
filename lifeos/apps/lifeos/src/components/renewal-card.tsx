import React from 'react';
import { IconClock } from '@tabler/icons-react';
import type { Service } from '../types/index';
import { ServiceLogo } from './service-logo';
import { monthlyCost, daysUntil } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import { useSettings } from '../store/use-settings';
import styles from './renewal-card.module.css';

export interface RenewalCardProps { service: Service; onClick?: () => void; }

export function RenewalCard({ service, onClick }: RenewalCardProps): React.JSX.Element {
  const currency = useSettings((s) => s.currency);
  const days     = daysUntil(service.nextRenewal);
  const urgent   = days <= 3;
  const soon     = days <= 7 && !urgent;

  return (
    <button className={styles.card} type="button" onClick={onClick}>
      <div className={styles.top}>
        <ServiceLogo service={service} size={32} />
        <span className={`${styles.days} ${urgent ? styles.daysUrgent : soon ? styles.daysSoon : styles.daysNormal}`}>
          <IconClock size={11} stroke={2} />
          {days === 0 ? 'امروز' : days === 1 ? 'فردا' : `${toFaDigits(days)} روز`}
        </span>
      </div>
      <p className={styles.name}>{service.name}</p>
      <p className={styles.price}>{formatMoney(monthlyCost(service), 'IRT', currency)}</p>
    </button>
  );
}
