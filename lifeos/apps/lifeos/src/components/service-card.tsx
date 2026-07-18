import React from 'react';
import { IconChevronLeft } from '@tabler/icons-react';
import type { Service } from '../types/index';
import { ServiceLogo } from './service-logo';
import { monthlyCost, daysUntil } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import { useSettings } from '../store/use-settings';
import styles from './service-card.module.css';

export interface ServiceCardProps {
  service: Service;
  onClick?: () => void;
}

export function ServiceCard({ service, onClick }: ServiceCardProps): React.JSX.Element {
  const currency = useSettings((s) => s.currency);
  const days     = daysUntil(service.nextRenewal);
  const urgent   = days >= 0 && days <= 5;
  const soon     = days >= 0 && days <= 14 && !urgent;

  return (
    <button className={styles.card} type="button" onClick={onClick}>
      <div className={styles.header}>
        <ServiceLogo service={service} size={36} />
        <div className={styles.badge}>
          {urgent && <span className={styles.urgentBadge}>{toFaDigits(days)} روز</span>}
          {soon   && <span className={styles.soonBadge}>{toFaDigits(days)} روز</span>}
          {!urgent && !soon && <span className={styles.activeDot} />}
        </div>
      </div>
      <p className={styles.name}>{service.name}</p>
      <p className={styles.plan}>{service.plan}</p>
      <div className={styles.footer}>
        <span className={styles.price}>{formatMoney(monthlyCost(service), 'IRT', currency)}</span>
        <IconChevronLeft size={13} stroke={1.8} className={styles.arrow} />
      </div>
    </button>
  );
}
