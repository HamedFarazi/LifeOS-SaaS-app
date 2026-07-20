import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Service } from '../types/index';
import { ServiceLogo } from './service-logo';
import { monthlyCost, daysUntil } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import { useSettings } from '../store/use-settings';
import { useT } from '../hooks/use-t';
import styles from './service-mini-popup.module.css';

export interface ServiceMiniPopupProps {
  service: Service;
  onClose: () => void;
}

/**
 * A small glassmorphism popup shown when tapping a service card on the
 * dashboard. Displays logo, name, cost, days remaining and a Details button.
 */
export function ServiceMiniPopup({ service, onClose }: ServiceMiniPopupProps): React.JSX.Element {
  const navigate = useNavigate();
  const displayCurrency = useSettings((s) => s.currency);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      clearTimeout(t);
    };
  }, [onClose]);

  const days = daysUntil(service.nextRenewal);
  const cost = formatMoney(monthlyCost(service), 'IRT', displayCurrency);
  const t    = useT();

  return (
    <div className={styles.overlay}>
      <div ref={ref} className={styles.popup} role="dialog">
        <div className={styles.logoWrap}>
          <ServiceLogo service={service} size={64} />
        </div>

        <p className={styles.name}>{service.name}</p>
        <p className={styles.plan}>{service.plan}</p>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('monthlySpend')}</span>
            <span className={styles.metaValue}>{cost}</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>{t('renewals')}</span>
            <span
              className={`${styles.metaValue} ${days <= 3 ? styles.urgent : days <= 7 ? styles.soon : ''}`}
            >
              {days <= 0 ? t('expired') : days === 1 ? t('tomorrow') : `${toFaDigits(days)} ${t('daysLeft')}`}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={styles.detailBtn}
          onClick={() => { navigate(`/service/${service.id}`); onClose(); }}
        >
          {t('manage')}
        </button>
      </div>
    </div>
  );
}
