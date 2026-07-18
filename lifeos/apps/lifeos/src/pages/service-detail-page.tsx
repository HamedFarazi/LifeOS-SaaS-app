import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { PageHeader } from '../components/page-header';
import { ServiceLogo } from '../components/service-logo';
import { CATEGORY_META } from '../data/categories';
import { monthlyCost, renewalLabel, formatDate } from '../lib/dates';
import { formatMoney } from '../lib/format';
import styles from './service-detail-page.module.css';

/**
 * Detail screen for a single service with key facts and management actions
 * (toggle active, delete).
 *
 * @returns The service detail page.
 */
export function ServiceDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const service = useServices((s) => s.services.find((x) => x.id === id));
  const toggleActive = useServices((s) => s.toggleActive);
  const removeService = useServices((s) => s.removeService);
  const currency = useSettings((s) => s.currency);

  if (!service) {
    return (
      <div>
        <PageHeader title="سرویس یافت نشد" back />
        <p className={styles.notFound}>این سرویس وجود ندارد.</p>
      </div>
    );
  }

  const meta = CATEGORY_META[service.category];

  return (
    <div>
      <PageHeader title="جزئیات سرویس" back />

      <div className={styles.hero} style={{ background: service.color }}>
        <ServiceLogo service={service} size={72} />
        <h2 className={styles.name}>{service.name}</h2>
        <p className={styles.plan}>{service.plan}</p>
      </div>

      <div className={styles.facts}>
        <div className={styles.fact}>
          <span className={styles.factLabel}>هزینه ماهانه</span>
          <span className={styles.factValue}>{formatMoney(monthlyCost(service), 'IRT', currency)}</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>دسته‌بندی</span>
          <span className={styles.factValue}>{meta.icon} {meta.label}</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>دوره پرداخت</span>
          <span className={styles.factValue}>{service.billingCycle === 'monthly' ? 'ماهانه' : 'سالانه'}</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>تمدید بعدی</span>
          <span className={styles.factValue}>{renewalLabel(service.nextRenewal)}</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>تاریخ تمدید</span>
          <span className={styles.factValue}>{formatDate(service.nextRenewal)}</span>
        </div>
        <div className={styles.fact}>
          <span className={styles.factLabel}>وضعیت</span>
          <span className={styles.factValue}>{service.active ? 'فعال' : 'غیرفعال'}</span>
        </div>
      </div>

      <button className={`${styles.action} ${styles.primary}`} type="button" onClick={() => navigate(`/edit/${service.id}`)}>
        ✏️ ویرایش سرویس
      </button>
      <button className={styles.action} type="button" onClick={() => toggleActive(service.id)}>
        {service.active ? '⏸ غیرفعال کردن' : '▶️ فعال کردن'}
      </button>
      <button
        className={`${styles.action} ${styles.danger}`}
        type="button"
        onClick={() => {
          if (confirm(`حذف ${service.name}؟`)) {
            removeService(service.id);
            navigate('/services');
          }
        }}
      >
        🗑 حذف سرویس
      </button>
    </div>
  );
}
