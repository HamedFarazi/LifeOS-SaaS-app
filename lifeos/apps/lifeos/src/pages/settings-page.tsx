import React, { useRef } from 'react';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { PageHeader } from '../components/page-header';
import type { Currency, Language, Service } from '../types/index';
import styles from './settings-page.module.css';

/**
 * Settings screen: currency, language, data export/import, and reset. Profile
 * management lives in the avatar popover, not here.
 *
 * @returns The settings page.
 */
export function SettingsPage(): React.JSX.Element {
  const { currency, language, setCurrency, setLanguage } = useSettings();
  const services = useServices((s) => s.services);
  const replaceAll = useServices((s) => s.replaceAll);
  const reset = useServices((s) => s.reset);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Downloads all services as a JSON file. */
  const exportData = () => {
    const blob = new Blob([JSON.stringify(services, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lifeos-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Reads a selected JSON file and replaces all services. */
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Service[];
        if (Array.isArray(parsed)) replaceAll(parsed);
      } catch {
        // ignore malformed files
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <PageHeader title="تنظیمات" subtitle="شخصی‌سازی LifeOS" back />

      <div className={styles.section}>
        <p className={styles.sectionTitle}>واحد پول</p>
        <div className={styles.segment}>
          {(['IRT', 'USD'] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.segBtn} ${currency === c ? styles.segActive : ''}`}
              onClick={() => setCurrency(c)}
            >
              {c === 'IRT' ? 'تومان' : 'دلار'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>زبان</p>
        <div className={styles.segment}>
          {(['fa', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              type="button"
              className={`${styles.segBtn} ${language === l ? styles.segActive : ''}`}
              onClick={() => setLanguage(l)}
            >
              {l === 'fa' ? 'فارسی' : 'English'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>داده‌ها</p>
        <button className={styles.action} type="button" onClick={exportData}>
          📤 خروجی گرفتن از داده‌ها
        </button>
        <button className={styles.action} type="button" onClick={() => fileRef.current?.click()}>
          📥 وارد کردن داده‌ها
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={importData}
          style={{ display: 'none' }}
        />
        <button
          className={`${styles.action} ${styles.danger}`}
          type="button"
          onClick={() => {
            if (confirm('بازنشانی برنامه؟ همه داده‌ها به حالت اولیه برمی‌گردند.')) reset();
          }}
        >
          ♻️ بازنشانی برنامه
        </button>
      </div>

      <p className={styles.version}>LifeOS · نسخه ۱.۰.۰</p>
    </div>
  );
}
