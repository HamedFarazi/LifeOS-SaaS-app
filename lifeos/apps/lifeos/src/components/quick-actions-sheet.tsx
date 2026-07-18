import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './quick-actions-sheet.module.css';

/**
 * Props for {@link QuickActionsSheet}.
 */
export interface QuickActionsSheetProps {
  open: boolean;
  onClose: () => void;
}

/** A quick action tile definition. */
interface QuickAction {
  icon: string;
  label: string;
  to: string;
  color: string;
}

const ACTIONS: QuickAction[] = [
  { icon: '➕', label: 'افزودن سرویس', to: '/add', color: '#A855F7' },
  { icon: '🌐', label: 'افزودن دامنه', to: '/add', color: '#2FD0FF' },
  { icon: '📅', label: 'افزودن تمدید', to: '/renewals', color: '#63E8FF' },
  { icon: '✅', label: 'افزودن وظیفه', to: '/add', color: '#34D399' },
  { icon: '💰', label: 'ثبت هزینه', to: '/add', color: '#FBBF24' },
];

/**
 * A premium glassmorphism bottom sheet of quick actions. Slides up from the
 * bottom with large rounded icon tiles. Closes on overlay click, ESC, or
 * action selection.
 *
 * @param props - Open state and close handler.
 * @returns The bottom sheet with overlay.
 */
export function QuickActionsSheet({ open, onClose }: QuickActionsSheetProps): React.JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /** Navigates and closes the sheet. */
  const go = (to: string) => {
    navigate(to);
    onClose();
  };

  return (
    <div className={`${styles.root} ${open ? styles.open : ''}`} aria-hidden={!open}>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-label="عملیات سریع">
        <div className={styles.handle} />
        <p className={styles.title}>عملیات سریع</p>
        <div className={styles.grid}>
          {ACTIONS.map((a) => (
            <button key={a.label} type="button" className={styles.tile} onClick={() => go(a.to)}>
              <span
                className={styles.tileIcon}
                style={{ background: `${a.color}22`, color: a.color }}
              >
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
