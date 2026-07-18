import React, { useRef } from 'react';
import { Upload, Download, RotateCcw, Sun, Moon, Monitor } from 'lucide-react';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { useToast } from '../store/use-toast';
import { PageHeader } from '../components/page-header';
import type { Currency, Language, ThemeMode, Service } from '../types/index';
import styles from './settings-page.module.css';

export function SettingsPage(): React.JSX.Element {
  const { currency, language, themeMode, monthlyBudget, setCurrency, setLanguage, setThemeMode, setMonthlyBudget } = useSettings();
  const services = useServices((s) => s.services);
  const replaceAll = useServices((s) => s.replaceAll);
  const reset = useServices((s) => s.reset);
  const { addToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(services, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'lifeos-data.json'; a.click();
    URL.revokeObjectURL(url);
    addToast('داده‌ها با موفقیت دانلود شد', 'success');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Service[];
        if (Array.isArray(parsed)) { replaceAll(parsed); addToast(`${parsed.length} سرویس وارد شد`, 'success'); }
      } catch { addToast('فایل نامعتبر است', 'error'); }
    };
    reader.readAsText(file);
  };

  const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'dark',   label: 'تیره',   icon: <Moon   size={15} strokeWidth={1.8} /> },
    { value: 'light',  label: 'روشن',   icon: <Sun    size={15} strokeWidth={1.8} /> },
    { value: 'system', label: 'سیستم',  icon: <Monitor size={15} strokeWidth={1.8} /> },
  ];

  return (
    <div>
      <PageHeader title="تنظیمات" subtitle="شخصی‌سازی LifeOS" />
      <div className={styles.settingsGrid}>

        {/* Theme */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>ظاهر</p>
          <div className={styles.themeRow}>
            {themes.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`${styles.themeBtn} ${themeMode === t.value ? styles.themeBtnActive : ''}`}
                onClick={() => setThemeMode(t.value)}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>واحد پول</p>
          <div className={styles.segment}>
            {(['IRT', 'USD'] as Currency[]).map((c) => (
              <button key={c} type="button"
                className={`${styles.segBtn} ${currency === c ? styles.segActive : ''}`}
                onClick={() => setCurrency(c)}>
                {c === 'IRT' ? 'تومان' : 'دلار (USD)'}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>زبان</p>
          <div className={styles.segment}>
            {(['fa', 'en'] as Language[]).map((l) => (
              <button key={l} type="button"
                className={`${styles.segBtn} ${language === l ? styles.segActive : ''}`}
                onClick={() => setLanguage(l)}>
                {l === 'fa' ? 'فارسی' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly budget */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>بودجه ماهانه</p>
          <p className={styles.sectionHint}>برای نمایش نوار پیشرفت در sidebar</p>
          <input
            type="number"
            className={styles.budgetInput}
            value={monthlyBudget ?? ''}
            onChange={(e) => setMonthlyBudget(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="مثلاً ۵۰۰۰۰۰۰ (تومان)"
            inputMode="numeric"
          />
        </div>

        {/* Data management */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>مدیریت داده‌ها</p>
          <div className={styles.actionList}>
            <button className={styles.action} type="button" onClick={exportData}>
              <Upload size={16} strokeWidth={1.8} />
              خروجی گرفتن از داده‌ها
            </button>
            <button className={styles.action} type="button" onClick={() => fileRef.current?.click()}>
              <Download size={16} strokeWidth={1.8} />
              وارد کردن داده‌ها
            </button>
            <input ref={fileRef} type="file" accept="application/json" onChange={importData} style={{ display: 'none' }} />
            <button
              className={`${styles.action} ${styles.danger}`}
              type="button"
              onClick={() => { if (confirm('بازنشانی کامل؟ همه داده‌ها حذف می‌شوند.')) { reset(); addToast('برنامه بازنشانی شد', 'info'); } }}
            >
              <RotateCcw size={16} strokeWidth={1.8} />
              بازنشانی برنامه
            </button>
          </div>
        </div>

      </div>
      <p className={styles.version}>LifeOS · نسخه ۱.۰.۰</p>
    </div>
  );
}
