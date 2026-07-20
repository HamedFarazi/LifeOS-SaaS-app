import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useServices } from "../store/use-services";
import { AppHeader } from "../components/app-header";
import { HeroCard } from "../components/hero-card";
import { KpiRow } from "../components/kpi-row";
import { SectionHeader } from "../components/section-header";
import { Carousel } from "../components/carousel";
import { RenewalCard } from "../components/renewal-card";
import { ServiceCard } from "../components/service-card";
import { InsightCard } from "../components/insight-card";
import { ServiceMiniPopup } from "../components/service-mini-popup";
import { ServiceLogo } from "../components/service-logo";
import { computeRawInsights } from "../lib/insights";
import { daysUntil, monthlyCost } from "../lib/dates";
import { spendTrend, spendByCategory, topServices } from "../lib/analytics";
import { formatMoney, formatMoneyShort, toFaDigits } from "../lib/format";
import { useSettings } from "../store/use-settings";
import { useT } from "../hooks/use-t";
import type { Service } from "../types/index";
import styles from "./dashboard-page.module.css";

const TOOLTIP = {
  background: "#ffffff",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  borderRadius: 10,
  fontFamily: "Vazirmatn",
  fontSize: 11,
};

export function DashboardPage(): React.JSX.Element {
  const services = useServices((s) => s.services);
  const currency = useSettings((s) => s.currency);
  const navigate = useNavigate();
  const t = useT();
  const [popup, setPopup] = useState<Service | null>(null);

  const upcoming = useMemo(
    () =>
      services
        .filter((s) => s.active && daysUntil(s.nextRenewal) >= 0)
        .sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal))
        .slice(0, 8),
    [services],
  );
  const insights = useMemo(() => computeRawInsights(services), [services]);
  const all = useMemo(() => services.filter((s) => s.active), [services]);
  const trend = useMemo(() => spendTrend(services), [services]);
  const byCat = useMemo(() => spendByCategory(services), [services]);
  const top = useMemo(() => topServices(services, 5), [services]);

  return (
    <div>
      <AppHeader />
      <HeroCard />
      <KpiRow />

      {/* ── Desktop: two-column layout ── */}
      <div className={styles.desktopGrid}>
        {/* Left / main column */}
        <div className={styles.mainCol}>
          {/* Spending trend mini-chart */}
          <div className={styles.trendPanel}>
            <div className={styles.trendHeader}>
              <p className={styles.trendTitle}>{t("spendTrend")}</p>
              <button
                type="button"
                className={styles.trendLink}
                onClick={() => navigate("/analytics")}
              >
                {t("moreDetails")}
              </button>
            </div>
            <div style={{ direction: "ltr" }}>
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart
                  data={trend}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#3B82F6"
                        stopOpacity={0.45}
                      />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: "rgba(255,255,255,0.35)",
                      fontSize: 10,
                      fontFamily: "Vazirmatn",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP}
                    labelStyle={{ color: "#fff" }}
                    formatter={(v: number) => [
                      formatMoney(v, "IRT", currency),
                      "هزینه",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#dashGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <SectionHeader
            title={t("upcomingRenewals")}
            action={t("viewAll")}
            onAction={() => navigate("/renewals")}
          />
          <Carousel>
            {upcoming.map((s) => (
              <RenewalCard key={s.id} service={s} onClick={() => setPopup(s)} />
            ))}
          </Carousel>

          <SectionHeader
            title={t("allServices")}
            action={t("viewAll")}
            onAction={() => navigate("/services")}
          />
          <Carousel>
            {all.map((s) => (
              <ServiceCard key={s.id} service={s} onClick={() => setPopup(s)} />
            ))}
          </Carousel>
        </div>

        {/* Right column — desktop only */}
        <aside className={styles.sideCol}>
          {/* Category pie */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}>{t("byCategory")}</p>
            <div style={{ direction: "ltr" }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={byCat}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {byCat.map((s) => (
                      <Cell key={s.category} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP}
                    formatter={(v: number) => [formatMoneyShort(v), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.legend}>
              {byCat.map((s) => (
                <div key={s.category} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: s.color }}
                  />
                  <span className={styles.legendLabel}>{s.label}</span>
                  <span className={styles.legendVal}>
                    {formatMoneyShort(s.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top services */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}>گران‌ترین سرویس‌ها</p>
            {top.map((item, i) => (
              <div key={item.service.id} className={styles.topRow}>
                <span className={styles.topRank}>{toFaDigits(i + 1)}</span>
                <ServiceLogo service={item.service} size={32} />
                <span className={styles.topName}>{item.service.name}</span>
                <span className={styles.topPrice}>
                  {formatMoney(item.monthly, "IRT", currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className={styles.panel}>
            <p className={styles.panelTitle}>{t("controlCenter")}</p>
            {insights.map((i) => (
              <InsightCard key={i.id} insight={i} />
            ))}
          </div>
        </aside>
      </div>

      {/* Mobile/tablet: insights + mini analytics below */}
      <div className={styles.mobileExtra}>
        {/* Mini category chart */}
        <div className={styles.trendPanel} style={{ marginTop: 8 }}>
          <div className={styles.trendHeader}>
            <p className={styles.trendTitle}>{t("spendTrend")}</p>
            <button
              type="button"
              className={styles.trendLink}
              onClick={() => navigate("/analytics")}
            >
              {t("moreDetails")}
            </button>
          </div>
          <div style={{ direction: "ltr" }}>
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart
                data={trend}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="dashGradM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{
                    fill: "rgba(255,255,255,0.35)",
                    fontSize: 10,
                    fontFamily: "Vazirmatn",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP}
                  formatter={(v: number) => [
                    formatMoney(v, "IRT", currency),
                    "هزینه",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#dashGradM)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <SectionHeader title={t("controlCenter")} />
        {insights.map((i) => (
          <InsightCard key={i.id} insight={i} />
        ))}
      </div>

      {popup && (
        <ServiceMiniPopup service={popup} onClose={() => setPopup(null)} />
      )}
    </div>
  );
}
