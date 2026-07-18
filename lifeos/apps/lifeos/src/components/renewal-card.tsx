import React from 'react';
import type { Service } from '../types/index';
import { ServiceLogo } from './service-logo';
import { DaysBadge } from './days-badge';
import { monthlyCost } from '../lib/dates';
import { formatMoney } from '../lib/format';
import { useSettings } from '../store/use-settings';
import styles from './renewal-card.module.css';

/**
 * Props for {@link RenewalCard}.
 */
export interface RenewalCardProps {
  service: Service;
  onClick?: () => void;
}

/**
 * Collectible-style white card for an upcoming renewal with a large logo,
 * name, monthly cost, and a days-remaining badge.
 *
 * @param props - The service to display.
 * @returns A renewal card.
 */
export function RenewalCard({ service, onClick }: RenewalCardProps): React.JSX.Element {
  const currency = useSettings((s) => s.currency);
  return (
    <button className={styles.card} type="button" onClick={onClick}>
      <div className={styles.head}>
        <ServiceLogo service={service} size={52} />
        <DaysBadge date={service.nextRenewal} />
      </div>
      <p className={styles.name}>{service.name}</p>
      <p className={styles.plan}>{service.plan}</p>
      <p className={styles.price}>{formatMoney(monthlyCost(service), 'IRT', currency)}</p>
    </button>
  );
}
