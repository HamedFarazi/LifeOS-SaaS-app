import React from 'react';
import type { Service } from '../types/index';
import { ServiceLogo } from './service-logo';
import { monthlyCost } from '../lib/dates';
import { formatMoney } from '../lib/format';
import { useSettings } from '../store/use-settings';
import styles from './service-card.module.css';

/**
 * Props for {@link ServiceCard}.
 */
export interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
}

/**
 * A larger card emphasizing the service logo, name, plan, and monthly price —
 * used in the "all services" carousel.
 *
 * @param props - The service to display.
 * @returns A service card.
 */
export function ServiceCard({ service, onClick }: ServiceCardProps): React.JSX.Element {
  const currency = useSettings((s) => s.currency);
  return (
    <button className={styles.card} type="button" onClick={onClick}>
      <div className={styles.logoWrap}>
        <ServiceLogo service={service} size={64} />
      </div>
      <p className={styles.name}>{service.name}</p>
      <p className={styles.plan}>{service.plan}</p>
      <div className={styles.footer}>
        <span className={styles.price}>{formatMoney(monthlyCost(service), 'IRT', currency)}</span>
        <span className={styles.per}>ماهانه</span>
      </div>
    </button>
  );
}
