import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../store/use-services';
import { PageHeader } from '../components/page-header';
import { ServiceRow } from '../components/service-row';
import { CATEGORY_META, CATEGORY_ORDER } from '../data/categories';
import type { ServiceCategory } from '../types/index';
import styles from './services-page.module.css';

/**
 * Lists every service with category filter chips.
 *
 * @returns The services page.
 */
export function ServicesPage(): React.JSX.Element {
  const services = useServices((s) => s.services);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ServiceCategory | 'all'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? services : services.filter((s) => s.category === filter)),
    [services, filter]
  );

  return (
    <div>
      <PageHeader title="سرویس‌ها" subtitle={`${services.length} سرویس مدیریت‌شده`} back />

      <div className={styles.chips}>
        <button
          type="button"
          className={`${styles.chip} ${filter === 'all' ? styles.activeChip : ''}`}
          onClick={() => setFilter('all')}
        >
          همه
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.chip} ${filter === cat ? styles.activeChip : ''}`}
            onClick={() => setFilter(cat)}
          >
            {CATEGORY_META[cat].icon} {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map((s) => (
          <ServiceRow key={s.id} service={s} onClick={() => navigate(`/service/${s.id}`)} />
        ))}
        {filtered.length === 0 ? (
          <p className={styles.empty}>سرویسی در این دسته وجود ندارد</p>
        ) : null}
      </div>
    </div>
  );
}
