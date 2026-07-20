import React, { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid,
} from 'recharts';
import { Download, FileText, TrendingUp, CalendarClock, Layers, Wallet } from 'lucide-react';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { useToast } from '../store/use-toast';
import { PageHeader } from '../components/page-header';
import { spendTrend, spendByCategory, topServices } from '../lib/analytics';
import { monthlyCost, daysUntil, yearlyCost } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import styles from './reports-page.module.css';

const TOOLTIP_STYLE = {
  background: '#0F1630',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  fontFamily: 'Vazirmatn',
  fontSize: 12,
};

export function ReportsPage(): React.JSX.Element {
  const services = useServices((s) => s.services);
  const currency = useSettings((s) => s.currency);
  const { addToast } = useToast();

  const active = useMemo(() => services.filter((s) => s.active), [services]);
  const trend = useMemo(() => spendTrend(services), [services]);
  const byCat = useMemo(() => spendByCategory(services), [services]);
  const top = useMemo(() => topServices(services, 8), [services]);

  const monthlyTotal = useMemo(() => active.reduce((s, sv) => s + monthlyCost(sv), 0), [active]);
  const yearlyTotal  = useMemo(() => active.reduce((s, sv) => s + yearlyCost(sv), 0),  [active]);

  const upcoming30 = useMemo(
    () => active.filter((s) => { const d = daysUntil(s.nextRenewal); return d >= 0 && d <= 30; }),
    [active]
  );
  const upcoming30Cost = useMemo(
    () => upcoming30.reduce((s, sv) => s + sv.price, 0),
    [upcoming30]
  );

  const exportCSV = () => {
    const header = 'نام,دسته,پلن,قیمت,ارز,تمدید بعدی,وضعیت';
    const rows = services.map(
      (s) => `${s.name},${s.category},${s.plan},${s.price},${s.priceCurrency},${s.nextRenewal},${s.active ? 'فعال' : 'غیرفعال'}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'lifeos-report.csv'; a.click();
    URL.revokeObjectURL(url);
    addToast('گزارش CSV دانلود شد', 'success');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(services, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'lifeos-data.json'; a.click();
    URL.revokeObjectURL(url);
    addToast('داده‌ها به JSON دانلود شد', 'success');
  };

  return (
    <div>
      <PageHeader title="گزارش‌ها" subtitle="تحلیل جامع هزینه‌های شما" />

      {/* Summary KPIs */}
      <div className={styles.kpiRow}>
        {[
          { icon: <Wallet size={18} strokeWidth={1.8} />, label: 'هزینه ماهانه',   value: formatMoney(monthlyTotal, 'IRT', currency), color: '#3B82F6' },
          { icon: <TrendingUp size={18} strokeWidth={1.8} />, label: 'هزینه سالانه', value: formatMoney(yearlyTotal, 'IRT', currency),  color: '#22D3EE' },
          { icon: <Layers size={18} strokeWidth={1.8} />,    label: 'تعداد سرویس',  value: toFaDigits(active.length) + ' سرویس',        color: '#34D399' },
          { icon: <CalendarClock size={18} strokeWidth={1.8} />, label: 'پرداخت ۳۰ روز', value: formatMoney(upcoming30Cost, 'IRT', currency), color: '#F59E0B' },
        ].map((k) => (
          <div key={k.label} className={styles.kpi}>
            <div className={styles.kpiIcon} style={{ background: `${k.color}18`, color: k.color }}>{k.icon}</div>
            <div className={styles.kpiText}>
              <p className={styles.kpiLabel}>{k.label}</p>
              <p className={styles.kpiValue}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Export buttons */}
      <div className={styles.exportRow}>
        <button type="button" className={styles.exportBtn} onClick={exportCSV}>
          <Download size={15} strokeWidth={1.8} /> دانلود CSV
        </button>
        <button type="button" className={styles.exportBtn} onClick={exportJSON}>
          <FileText size={15} strokeWidth={1.8} /> دانلود JSON
        </button>
      </div>

      {/* Charts grid */}
      <div className={styles.chartsGrid}>
        {/* Spending trend */}
        <div className={styles.panel}>
          <p className={styles.panelTitle}>روند هزینه ۶ ماه اخیر</p>
          <div style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3B82F6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Vazirmatn' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000).toFixed(0) + 'K'} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#fff' }} formatter={(v: number) => [formatMoney(v, 'IRT', currency), 'هزینه']} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className={styles.panel}>
          <p className={styles.panelTitle}>هزینه بر اساس دسته</p>
          <div style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCat} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Vazirmatn' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000).toFixed(0) + 'K'} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [formatMoney(v, 'IRT', currency), 'هزینه ماهانه']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {byCat.map((slice) => (
                    <rect key={slice.category} fill={slice.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top services table */}
      <div className={styles.panel}>
        <p className={styles.panelTitle}>گران‌ترین سرویس‌ها</p>
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.thRank}>#</span>
            <span className={styles.thName}>نام</span>
            <span className={styles.thCat}>دسته</span>
            <span className={styles.thPrice}>ماهانه</span>
            <span className={styles.thPrice}>سالانه</span>
          </div>
          {top.map((item, i) => (
            <div key={item.service.id} className={styles.tableRow}>
              <span className={styles.tdRank}>{toFaDigits(i + 1)}</span>
              <span className={styles.tdName}>{item.service.name}</span>
              <span className={styles.tdCat}>{item.service.category}</span>
              <span className={styles.tdPrice}>{formatMoney(item.monthly, 'IRT', currency)}</span>
              <span className={styles.tdPrice}>{formatMoney(item.monthly * 12, 'IRT', currency)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming renewals */}
      <div className={styles.panel}>
        <p className={styles.panelTitle}>پرداخت‌های ۳۰ روز آینده ({toFaDigits(upcoming30.length)} مورد)</p>
        {upcoming30.length === 0 ? (
          <p className={styles.empty}>پرداختی در ۳۰ روز آینده وجود ندارد</p>
        ) : (
          <div className={styles.table}>
            {upcoming30.map((s) => (
              <div key={s.id} className={styles.tableRow}>
                <span className={styles.tdName}>{s.name}</span>
                <span className={styles.tdCat}>{toFaDigits(daysUntil(s.nextRenewal))} روز دیگر</span>
                <span className={styles.tdPrice}>{formatMoney(s.price, s.priceCurrency, currency)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
