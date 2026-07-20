import React, { useRef, useEffect, useState } from 'react';
import {
  IconUpload, IconDownload, IconRefresh,
  IconMoon, IconSun, IconDeviceDesktop,
  IconColorSwatch,
} from '@tabler/icons-react';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { useToast } from '../store/use-toast';
import { useT } from '../hooks/use-t';
import { PageHeader } from '../components/page-header';
import { BackgroundPicker } from '../components/background-picker';
import { useBackground } from '../store/use-background';
import type { Currency, Language, ThemeMode, Service } from '../types/index';
import styles from './settings-page.module.css';

export function SettingsPage(): React.JSX.Element {
  const {
    currency, language, themeMode, monthlyBudget,
    setCurrency, setLanguage, setThemeMode, setMonthlyBudget,
  } = useSettings();
  const services   = useServices((s) => s.services);
  const replaceAll = useServices((s) => s.replaceAll);
  const reset      = useServices((s) => s.reset);
  const { addToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useT();
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const { type: bgType } = useBackground();

  const bgTypeLabel: Record<string, string> = {
    default: 'پیشفرض',
    image: 'تصویر',
    ballpit: 'توپ‌های شناور',
    hyperspeed: 'سرعت نور',
    galaxy: 'کهکشان',
  };

  /* Apply theme to <html data-theme="dark|light"> */
  useEffect(() => {
    const effective =
      themeMode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : (themeMode ?? 'dark');
    document.documentElement.setAttribute('data-theme', effective);
  }, [themeMode]);

  /* Apply RTL / LTR direction */
  useEffect(() => {
    document.documentElement.lang = language === 'fa' ? 'fa' : 'en';
    document.documentElement.dir  = language === 'fa' ? 'rtl' : 'ltr';
  }, [language]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(services, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'lifeos-data.json'; a.click();
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
        if (Array.isArray(parsed)) {
          replaceAll(parsed);
          addToast(`${parsed.length} ${t('importSuccess')}`, 'success');
        }
      } catch {
        addToast(t('importError'), 'error');
      }
    };
    reader.readAsText(file);
  };

  const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'dark',   label: t('dark'),   icon: <IconMoon          size={15} stroke={1.8} /> },
    { value: 'light',  label: t('light'),  icon: <IconSun           size={15} stroke={1.8} /> },
    { value: 'system', label: t('system'), icon: <IconDeviceDesktop size={15} stroke={1.8} /> },
  ];

  return (
    <div>
      <PageHeader title={t('settingsTitle')} subtitle={t('settingsSub')} />

      <div className={styles.settingsGrid}>

        {/* Theme */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>{t('appearance')}</p>
          <div className={styles.themeRow}>
            {themes.map((th) => (
              <button
                key={th.value}
                type="button"
                className={`${styles.themeBtn} ${themeMode === th.value ? styles.themeBtnActive : ''}`}
                onClick={() => setThemeMode(th.value)}
              >
                {th.icon}
                <span>{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>{t('currency')}</p>
          <div className={styles.segment}>
            {(['IRT', 'USD'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.segBtn} ${currency === c ? styles.segActive : ''}`}
                onClick={() => setCurrency(c)}
              >
                {c === 'IRT' ? t('toman') : t('dollar')}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>{t('language')}</p>
          <div className={styles.segment}>
            {(['fa', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                className={`${styles.segBtn} ${language === l ? styles.segActive : ''}`}
                onClick={() => setLanguage(l)}
              >
                {l === 'fa' ? t('persian') : t('english')}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly budget */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>{t('monthlyBudget')}</p>
          <p className={styles.sectionHint}>{t('budgetHint')}</p>
          <input
            type="number"
            className={styles.budgetInput}
            value={monthlyBudget ?? ''}
            onChange={(e) => setMonthlyBudget(e.target.value ? Number(e.target.value) : undefined)}
            placeholder={language === 'fa' ? 'مثلاً ۵۰۰۰۰۰۰ (تومان)' : 'e.g. 5000000 (Toman)'}
            inputMode="numeric"
          />
        </div>

        {/* Background */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>بکگراند سامانه</p>
          <p className={styles.sectionHint}>پس‌زمینه متحرک یا تصویری برای کل اپلیکیشن</p>
          <button
            className={styles.bgPickerBtn}
            type="button"
            onClick={() => setBgPickerOpen(true)}
          >
            <IconColorSwatch size={16} stroke={1.8} />
            <span>تغییر بکگراند</span>
            <span className={styles.bgCurrentLabel}>{bgTypeLabel[bgType] ?? 'پیشفرض'}</span>
          </button>
          <BackgroundPicker open={bgPickerOpen} onClose={() => setBgPickerOpen(false)} />
        </div>

        {/* Data management */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>{t('dataManagement')}</p>
          <div className={styles.actionList}>
            <button className={styles.action} type="button" onClick={exportData}>
              <IconUpload size={16} stroke={1.8} />
              {t('exportData')}
            </button>
            <button className={styles.action} type="button" onClick={() => fileRef.current?.click()}>
              <IconDownload size={16} stroke={1.8} />
              {t('importData')}
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
                if (confirm(t('resetConfirm'))) {
                  reset();
                  addToast(t('resetSuccess'), 'info');
                }
              }}
            >
              <IconRefresh size={16} stroke={1.8} />
              {t('resetApp')}
            </button>
          </div>
        </div>

      </div>

      <p className={styles.version}>{t('version')}</p>
    </div>
  );
}
