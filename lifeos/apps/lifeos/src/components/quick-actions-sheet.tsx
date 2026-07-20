import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconPlus, IconWorld, IconCalendarPlus, IconCheckbox, IconCoin,
} from '@tabler/icons-react';
import styles from './quick-actions-sheet.module.css';

export interface QuickActionsSheetProps {
  open: boolean;
  onClose: () => void;
  /**
   * 'sheet'  — mobile/tablet bottom sheet (default)
   * 'popup'  — desktop centered fixed popup
   */
  variant?: 'sheet' | 'popup';
  anchorRef?: React.RefObject<HTMLElement>;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  to: string;
  color: string;
}

const ACTIONS: QuickAction[] = [
  { icon: <IconPlus         size={20} stroke={1.8} />, label: 'افزودن سرویس', to: '/add',      color: '#2563EB' },
  { icon: <IconWorld        size={20} stroke={1.8} />, label: 'افزودن دامنه',  to: '/add',      color: '#06B6D4' },
  { icon: <IconCalendarPlus size={20} stroke={1.8} />, label: 'تمدید جدید',   to: '/renewals', color: '#34D399' },
  { icon: <IconCheckbox     size={20} stroke={1.8} />, label: 'افزودن وظیفه', to: '/add',      color: '#FBBF24' },
  { icon: <IconCoin         size={20} stroke={1.8} />, label: 'ثبت هزینه',    to: '/add',      color: '#F87171' },
];

export function QuickActionsSheet({
  open,
  onClose,
  variant = 'sheet',
  anchorRef,
}: QuickActionsSheetProps): React.JSX.Element {
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);

  /* ESC */
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  /* Outside click — popup variant only */
  useEffect(() => {
    if (variant !== 'popup' || !open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popupRef.current?.contains(t) && !anchorRef?.current?.contains(t)) onClose();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', h), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', h); };
  }, [variant, open, onClose, anchorRef]);

  const go = (to: string) => { navigate(to); onClose(); };

  /* ── Desktop centered popup ── */
  if (variant === 'popup') {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`${styles.dropdownBackdrop} ${open ? styles.dropdownBackdropOpen : ''}`}
          onClick={onClose}
        />
        {/* Popup */}
        <div
          ref={popupRef}
          className={`${styles.dropdown} ${open ? styles.dropdownOpen : ''}`}
          role="dialog"
          aria-label="عملیات سریع"
          aria-hidden={!open}
        >
          <p className={styles.dropdownTitle}>عملیات سریع</p>
          <div className={styles.dropdownGrid}>
            {ACTIONS.map((a) => (
              <button key={a.label} type="button" className={styles.dropdownTile} onClick={() => go(a.to)}>
                <span className={styles.dropdownIcon} style={{ background: `${a.color}22`, color: a.color }}>
                  {a.icon}
                </span>
                <span className={styles.dropdownLabel}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ── Mobile/tablet bottom sheet ── */
  return (
    <div className={`${styles.root} ${open ? styles.open : ''}`} aria-hidden={!open}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-label="عملیات سریع">
        <div className={styles.handle} />
        <p className={styles.title}>عملیات سریع</p>
        <div className={styles.grid}>
          {ACTIONS.map((a) => (
            <button key={a.label} type="button" className={styles.tile} onClick={() => go(a.to)}>
              <span className={styles.tileIcon} style={{ background: `${a.color}22`, color: a.color }}>
                {a.icon}
              </span>
              <span className={styles.tileLabel}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
