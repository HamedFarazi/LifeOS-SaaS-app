import React, { useState } from 'react';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { monthlyCost, yearlyCost, daysUntil, todayJalali } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import styles from './hero-card.module.css';

/**
 * The large purple gradient hero card. Shows monthly or yearly cost
 * (toggled by a switch), active service count, upcoming renewals count,
 * and today's Shamsi date.
 *
 * @returns The hero summary card.
 */
export function HeroCard(): React.JSX.Element {
  const services = useServices((s) => s.services);
  const displayCurrency = useSettings((s) => s.currency);
  const [yearly, setYearly] = useState(false);

  const active = services.filter((s) => s.active);
  const total = active.reduce(
    (sum, s) => sum + (yearly ? yearlyCost(s) : monthlyCost(s)),
    0
  );
  const upcoming = active.filter((s) => {
    const d = daysUntil(s.nextRenewal);
    return d >= 0 && d <= 14;
  }).length;

  return (
    <div className={styles.card}>
      <i className={styles.blob1} />
      <i className={styles.blob2} />

      <div className={styles.top}>
        <div className={styles.labelWrap}>
          <span className={styles.label}>{yearly ? 'هزینه سالانه' : 'هزینه ماهانه'}</span>
          <div className={styles.switcher} onClick={() => setYearly((v) => !v)}>
            <span className={`${styles.switchOpt} ${!yearly ? styles.switchActive : ''}`}>ماه</span>
            <span className={`${styles.switchOpt} ${yearly ? styles.switchActive : ''}`}>سال</span>
          </div>
        </div>
        <button className={styles.wallet} type="button" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="13" rx="3" />
            <path d="M16 12h2" /><path d="M3 9h13a2 2 0 0 1 2 2" />
          </svg>
        </button>
      </div>

      <p className={styles.amount}>{formatMoney(total, 'IRT', displayCurrency)}</p>

      <p className={styles.date}>{todayJalali()}</p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{toFaDigits(active.length)} سرویس</span>
          <span className={styles.statLabel}>سرویس‌های فعال</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{toFaDigits(upcoming)} مورد</span>
          <span className={styles.statLabel}>تمدید نزدیک</span>
        </div>
      </div>
    </div>
  );
}
