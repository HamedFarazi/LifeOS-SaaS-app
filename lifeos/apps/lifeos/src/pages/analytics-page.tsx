import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { PageHeader } from '../components/page-header';
import { ServiceLogo } from '../components/service-logo';
import {
  spendByCategory,
  spendTrend,
  topServices,
} from '../lib/analytics';
import { monthlyCost, daysUntil } from '../lib/dates';
import { formatMoney, formatMoneyShort, toFaDigits } from '../lib/format';
import styles from './analytics-page.module.css';

/**
 * Analytics screen with monthly spending trend, category breakdown, most
 * expensive services, and upcoming cost — all powered by Recharts.
 *
 * @returns The analytics page.
 */
export function AnalyticsPage(): React.JSX.Element {
  const services = useServices((s) => s.services);
  const currency = useSettings((s) => s.currency);

  const trend = useMemo(() => spendTrend(services), [services]);
  const byCat = useMemo(() => spendByCategory(services), [services]);
  const top = useMemo(() => topServices(services, 5), [services]);
  const monthlyTotal = useMemo(
    () => services.filter((s) => s.active).reduce((sum, s) => sum + monthlyCost(s), 0),
    [services]
  );
  const upcomingCost = useMemo(
    () =>
      services
        .filter((s) => s.active && daysUntil(s.nextRenewal) >= 0 && daysUntil(s.nextRenewal) <= 30)
        .reduce((sum, s) => sum + s.price, 0),
    [services]
  );

  return (
    <div>
      <PageHeader title="تحلیل هزینه‌ها" subtitle="نمای کامل مخارج شما" back />

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>هزینه ماهانه</span>
          <span className={styles.kpiValue}>{formatMoney(monthlyTotal, 'IRT', currency)}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>پرداخت ۳۰ روز آینده</span>
          <span className={styles.kpiValue}>{formatMoney(upcomingCost, 'IRT', currency)}</span>
        </div>
      </div>

      <div className={styles.panel}>
        <p className={styles.panelTitle}>روند هزینه ماهانه</p>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trend} margin={{ top: 10, right: 6, left: 6, bottom: 0 }}>
              <defs>
                <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#63E8FF" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#63E8FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'Vazirmatn' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#0a154f',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  fontFamily: 'Vazirmatn',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(v: number) => [formatMoney(v, 'IRT', currency), 'هزینه']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#63E8FF"
                strokeWidth={3}
                fill="url(#spend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.panel}>
        <p className={styles.panelTitle}>تفکیک بر اساس دسته</p>
        <div className={styles.pieWrap}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={byCat}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke="none"
              >
                {byCat.map((slice) => (
                  <Cell key={slice.category} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0a154f',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  fontFamily: 'Vazirmatn',
                  fontSize: 12,
                }}
                formatter={(v: number, n) => [formatMoney(v, 'IRT', currency), n]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.legend}>
          {byCat.map((slice) => (
            <div key={slice.category} className={styles.legendItem}>
              <span className={styles.dot} style={{ background: slice.color }} />
              <span className={styles.legendLabel}>{slice.label}</span>
              <span className={styles.legendValue}>{formatMoneyShort(slice.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <p className={styles.panelTitle}>گران‌ترین سرویس‌ها</p>
        {top.map((item, i) => (
          <div key={item.service.id} className={styles.topRow}>
            <span className={styles.rank}>{toFaDigits(i + 1)}</span>
            <ServiceLogo service={item.service} size={40} />
            <span className={styles.topName}>{item.service.name}</span>
            <span className={styles.topPrice}>{formatMoney(item.monthly, 'IRT', currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
