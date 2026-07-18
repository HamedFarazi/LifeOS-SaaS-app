import React, { useMemo, useState } from 'react';
import { IconTrendingUp, IconTrendingDown, IconCalendar } from '@tabler/icons-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { monthlyCost, yearlyCost, daysUntil, todayJalali } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import { spendTrend } from '../lib/analytics';
import styles from './hero-card.module.css';

export function HeroCard(): React.JSX.Element {
  const services        = useServices((s) => s.services);
  const displayCurrency = useSettings((s) => s.currency);
  const monthlyBudget   = useSettings((s) => s.monthlyBudget);
  const [yearly, setYearly] = useState(false);

  const active = useMemo(() => services.filter((s) => s.active), [services]);
  const trend  = useMemo(() => spendTrend(services), [services]);

  const total = useMemo(
    () => active.reduce((sum, s) => sum + (yearly ? yearlyCost(s) : monthlyCost(s)), 0),
    [active, yearly]
  );

  const prevTotal = useMemo(() => {
    const base = active.reduce((sum, s) => sum + monthlyCost(s), 0);
    return Math.round(base * 0.85);
  }, [active]);

  const changePct = prevTotal > 0
    ? Math.round(((total - prevTotal) / prevTotal) * 100)
    : 0;
  const isUp = changePct > 0;

  const upcoming7 = useMemo(
    () => active.filter((s) => { const d = daysUntil(s.nextRenewal); return d >= 0 && d <= 7; }),
    [active]
  );

  const budgetPct = monthlyBudget
    ? Math.min(Math.round((total / monthlyBudget) * 100), 100)
    : null;

  return (
    <div className={styles.hero}>
      <div className={styles.left}>
        {/* spending */}
        <div>
          <p className={styles.metaLabel}>{yearly ? 'هزینه سالانه' : 'هزینه این ماه'}</p>
          <p className={styles.amount}>{formatMoney(total, 'IRT', displayCurrency)}</p>
          <div className={`${styles.change} ${isUp ? styles.changeUp : styles.changeDown}`}>
            {isUp
              ? <IconTrendingUp size={13} stroke={2} />
              : <IconTrendingDown size={13} stroke={2} />}
            <span>{isUp ? '+' : ''}{toFaDigits(Math.abs(changePct))}٪ نسبت به ماه قبل</span>
          </div>
        </div>

        {/* meta info */}
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>سرویس‌های فعال</span>
            <span className={styles.metaVal}>{toFaDigits(active.length)}</span>
          </div>
          {upcoming7.length > 0 && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>پرداخت این هفته</span>
              <span className={`${styles.metaVal} ${styles.metaWarn}`}>
                <IconCalendar size={12} stroke={2} />
                {toFaDigits(upcoming7.length)} سرویس
              </span>
            </div>
          )}
          {budgetPct !== null && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>از بودجه ماهانه</span>
              <span className={`${styles.metaVal} ${budgetPct > 80 ? styles.metaDanger : ''}`}>
                {toFaDigits(budgetPct)}٪
              </span>
            </div>
          )}
        </div>

        {/* budget bar */}
        {budgetPct !== null && (
          <div className={styles.budgetBar}>
            <div
              className={styles.budgetFill}
              style={{
                width: `${budgetPct}%`,
                background: budgetPct > 80 ? '#F87171' : budgetPct > 60 ? '#FBBF24' : '#34D399',
              }}
            />
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.toggleWrap}>
          <button type="button" className={styles.toggle} onClick={() => setYearly((v) => !v)}>
            <span className={`${styles.opt} ${!yearly ? styles.optActive : ''}`}>ماه</span>
            <span className={`${styles.opt} ${yearly ? styles.optActive : ''}`}>سال</span>
          </button>
          <p className={styles.dateLabel}>{todayJalali()}</p>
        </div>
        <div className={styles.chart}>
          <div style={{ direction: 'ltr', width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                <defs>
                  <linearGradient id="hg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ display: 'none' }} cursor={false} />
                <Area
                  type="monotone" dataKey="value"
                  stroke="#7C3AED" strokeWidth={1.5}
                  fill="url(#hg2)" dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
