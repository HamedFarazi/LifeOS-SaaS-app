import React from 'react';
import type { Service } from '../types/index';
import { ServiceLogo } from './service-logo';
import { DaysBadge } from './days-badge';
import { monthlyCost } from '../lib/dates';
import { formatMoney } from '../lib/format';
import { useSettings } from '../store/use-settings';
import styles from './service-row.module.css';

/**
 * Props for {@link ServiceRow}.
 */
export interface ServiceRowProps {
  service: Service;
  onClick?: () => void;
}

/**
 * A full-width list row for a service showing logo, name/plan, price, and a
 * renewal badge. Used in list-style pages.
 *
 * @param props - The service to render.
 * @returns A service row.
 */
export function ServiceRow({ service, onClick }: ServiceRowProps): React.JSX.Element {
  const currency = useSettings((s) => s.currency);
  return (
    <button className={styles.row} type="button" onClick={onClick}>
      <ServiceLogo service={service} size={50} />
      <div className={styles.info}>
        <p className={styles.name}>{service.name}</p>
        <p className={styles.plan}>{service.plan}</p>
      </div>
      <div className={styles.right}>
        <span className={styles.price}>{formatMoney(monthlyCost(service), 'IRT', currency)}</span>
        <DaysBadge date={service.nextRenewal} />
      </div>
    </button>
  );
}
