import React, { useRef, useEffect, useState } from 'react';
import {
  IconUpload, IconDownload, IconRefresh,
  IconMoon,
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
    default:    t('bgDefault'),
    image:      t('bgImage'),
    ballpit:    t('bgBallpit'),
    hyperspeed: t('bgHyperspeed'),
    galaxy:     t('bgGalaxy'),
  };

  /* Apply theme to <html data-theme="..."> */
  useEffect(() => {
    const effective = themeMode ?? 'dark';
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
    a.href = url; a.download = 'trackly-data.json'; a.click();
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
    { value: 'dark',   label: t('dark'),  icon: <IconMoon size={15} stroke={1.8} /> },
    { value: 'slate',  label: 'Slate',    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/><path d="M12 3v9l4 2"/>
      </svg>
    )},
    { value: 'arctic', label: 'Arctic',   icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
        <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>
      </svg>
    )},
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
          <p className={styles.sectionTitle}>{t('bgSection')}</p>
          <p className={styles.sectionHint}>{t('bgSectionHint')}</p>
          <button
            className={styles.bgPickerBtn}
            type="button"
            onClick={() => setBgPickerOpen(true)}
          >
            <IconColorSwatch size={16} stroke={1.8} />
            <span>{t('bgChange')}</span>
            <span className={styles.bgCurrentLabel}>{bgTypeLabel[bgType] ?? t('bgDefault')}</span>
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

      <div className={styles.credit}>
        <span className={styles.creditHeart}>♥</span>
        <span>Built with love by</span>
        <span className={styles.creditName}>Hamed Farazi</span>
      </div>
    </div>
  );
}
