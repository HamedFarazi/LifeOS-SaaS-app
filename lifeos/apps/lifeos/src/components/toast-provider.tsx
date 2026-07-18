import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useToast } from '../store/use-toast';
import styles from './toast-provider.module.css';

const ICONS = {
  success: <CheckCircle size={16} strokeWidth={2} />,
  error:   <XCircle    size={16} strokeWidth={2} />,
  warning: <AlertTriangle size={16} strokeWidth={2} />,
  info:    <Info       size={16} strokeWidth={2} />,
};

export function ToastProvider(): React.JSX.Element {
  const { toasts, removeToast } = useToast();
  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>{ICONS[t.type]}</span>
          <span className={styles.message}>{t.message}</span>
          <button type="button" className={styles.close} onClick={() => removeToast(t.id)} aria-label="بستن">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>
  );
}
