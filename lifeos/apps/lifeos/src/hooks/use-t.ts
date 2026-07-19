import { useSettings } from '../store/use-settings';
import { translations, type TranslationKey } from '../lib/i18n';

/**
 * Returns a translation function `t(key)` based on the current language.
 *
 * Usage:
 *   const t = useT();
 *   <p>{t('dashboard')}</p>
 */
export function useT() {
  const language = useSettings((s) => s.language);
  const dict = translations[language] ?? translations.fa;
  return (key: TranslationKey): string => dict[key] as string;
}
