import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../store/use-services';
import { AppHeader } from '../components/app-header';
import { HeroCard } from '../components/hero-card';
import { SectionHeader } from '../components/section-header';
import { Carousel } from '../components/carousel';
import { RenewalCard } from '../components/renewal-card';
import { ServiceCard } from '../components/service-card';
import { InsightCard } from '../components/insight-card';
import { ServiceMiniPopup } from '../components/service-mini-popup';
import { computeInsights } from '../lib/insights';
import { daysUntil } from '../lib/dates';
import type { Service } from '../types/index';

export function DashboardPage(): React.JSX.Element {
  const services = useServices((s) => s.services);
  const navigate = useNavigate();
  const [popup, setPopup] = useState<Service | null>(null);

  const upcoming = useMemo(
    () =>
      services
        .filter((s) => s.active && daysUntil(s.nextRenewal) >= 0)
        .sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal))
        .slice(0, 8),
    [services]
  );
  const insights = useMemo(() => computeInsights(services), [services]);
  const all = useMemo(() => services.filter((s) => s.active), [services]);

  return (
    <div>
      <AppHeader />
      <HeroCard />

      <SectionHeader title="تمدیدهای نزدیک" action="مشاهده همه" onAction={() => navigate('/renewals')} />
      <Carousel>
        {upcoming.map((s) => (
          <RenewalCard key={s.id} service={s} onClick={() => setPopup(s)} />
        ))}
      </Carousel>

      <SectionHeader title="همه سرویس‌ها" action="مشاهده همه" onAction={() => navigate('/services')} />
      <Carousel>
        {all.map((s) => (
          <ServiceCard key={s.id} service={s} onClick={() => setPopup(s)} />
        ))}
      </Carousel>

      <SectionHeader title="مرکز کنترل" />
      <div>
        {insights.map((i) => (
          <InsightCard key={i.id} insight={i} />
        ))}
      </div>

      {popup ? <ServiceMiniPopup service={popup} onClose={() => setPopup(null)} /> : null}
    </div>
  );
}
