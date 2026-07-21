/**
 * PWAUpdateToast — shows a toast when a new service worker is waiting.
 * PWAInstallButton — shows install button when app can be installed.
 */
import React from 'react';
import { usePWA } from '../hooks/use-pwa';
import styles from './pwa-update-toast.module.css';

// ── Update toast ──────────────────────────────────────────────────────────────
export function PWAUpdateToast(): React.JSX.Element | null {
  const { needRefresh, update } = usePWA();

  if (!needRefresh) return null;

  return (
    <div className={styles.toast} role="alert">
      <div className={styles.toastIcon}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </div>
      <span className={styles.toastText}>نسخه جدید آماده بروزرسانی است</span>
      <button className={styles.toastBtn} onClick={update} type="button">
        بروزرسانی
      </button>
    </div>
  );
}

// ── Install button ────────────────────────────────────────────────────────────
export interface InstallButtonProps {
  variant?: 'sidebar' | 'hero' | 'inline';
  className?: string;
}

export function InstallButton({ variant = 'inline', className = '' }: InstallButtonProps): React.JSX.Element | null {
  const { canInstall, isInstalled, isInstalling, install } = usePWA();

  // In dev mode, always show for testing. In production, only show when installable.
  const isDev = import.meta.env.DEV;
  const show  = isDev ? !isInstalled : (canInstall && !isInstalled);

  if (!show) return null;

  return (
    <button
      type="button"
      className={`${styles.installBtn} ${styles[`installBtn_${variant}`]} ${className}`}
      onClick={isDev ? () => alert('Install PWA: فقط در production build و HTTPS کار می‌کند.') : install}
      disabled={isInstalling}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {isInstalling ? 'در حال نصب...' : 'نصب اپ'}
    </button>
  );
}
