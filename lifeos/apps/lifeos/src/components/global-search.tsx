import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useServices } from '../store/use-services';
import { ServiceLogo } from './service-logo';
import { formatMoney } from '../lib/format';
import { monthlyCost } from '../lib/dates';
import { useSettings } from '../store/use-settings';
import { CATEGORY_META } from '../data/categories';
import styles from './global-search.module.css';

interface GlobalSearchProps {
  onClose: () => void;
}

export function GlobalSearch({ onClose }: GlobalSearchProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const services = useServices((s) => s.services);
  const currency = useSettings((s) => s.currency);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.plan.toLowerCase().includes(q) ||
        CATEGORY_META[s.category].label.includes(q)
    ).slice(0, 8);
  }, [query, services]);

  const go = (id: string) => { navigate(`/service/${id}`); onClose(); };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <Search size={18} strokeWidth={1.8} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="جستجو در سرویس‌ها..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {results.length > 0 && (
          <div className={styles.results}>
            {results.map((s) => (
              <button key={s.id} type="button" className={styles.result} onClick={() => go(s.id)}>
                <ServiceLogo service={s} size={36} />
                <div className={styles.resultInfo}>
                  <p className={styles.resultName}>{s.name}</p>
                  <p className={styles.resultMeta}>
                    {CATEGORY_META[s.category].label} · {s.plan}
                  </p>
                </div>
                <span className={styles.resultPrice}>
                  {formatMoney(monthlyCost(s), 'IRT', currency)}
                </span>
              </button>
            ))}
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <p className={styles.empty}>نتیجه‌ای یافت نشد</p>
        )}

        {!query.trim() && (
          <p className={styles.hint}>نام سرویس، پلن یا دسته‌بندی را تایپ کنید</p>
        )}
      </div>
    </div>
  );
}
