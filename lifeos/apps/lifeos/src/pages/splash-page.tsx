import React, { useEffect, useState } from 'react';
import { IconCreditCard } from '@tabler/icons-react';
import styles from './splash-page.module.css';

interface SplashPageProps {
  onDone: () => void;
}

export function SplashPage({ onDone }: SplashPageProps): React.JSX.Element {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('out'),  1800);
    const t3 = setTimeout(() => onDone(),          2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`${styles.splash} ${phase === 'out' ? styles.fadeOut : styles.fadeIn}`}>
      <div className={`${styles.logo} ${phase === 'hold' || phase === 'out' ? styles.logoVisible : ''}`}>
        <div className={styles.logoMark}>
          <img src="/mainLogo.png" alt="Trackly" style={{ width: 28, height: 28, objectFit: 'contain' }} />
        </div>
        <span className={styles.logoText}>Trackly</span>
      </div>
      <p className={`${styles.tagline} ${phase === 'hold' || phase === 'out' ? styles.taglineVisible : ''}`}>
        Subscription &amp; Expense Manager
      </p>
    </div>
  );
}
