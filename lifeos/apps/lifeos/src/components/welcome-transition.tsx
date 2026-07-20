import React, { useEffect, useState } from 'react';
import { IconCreditCard } from '@tabler/icons-react';
import styles from './welcome-transition.module.css';

interface WelcomeTransitionProps {
  userName: string;
  onDone: () => void;
  language?: 'fa' | 'en';
}

export function WelcomeTransition({ userName, onDone, language = 'fa' }: WelcomeTransitionProps): React.JSX.Element {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  // 0 = mount (invisible)
  // 1 = logo visible
  // 2 = greeting visible
  // 3 = fading out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);   // logo in
    const t2 = setTimeout(() => setPhase(2), 500);  // greeting in
    const t3 = setTimeout(() => setPhase(3), 1800); // fade out starts
    const t4 = setTimeout(() => onDone(), 2300);    // navigate

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  const greeting = language === 'en'
    ? `Welcome back, ${userName} 👋`
    : `خوش آمدی ${userName} 👋`;

  const subtitle = language === 'en'
    ? 'Setting up your personal workspace...'
    : 'داریم محیط شخصی تو را آماده می‌کنیم...';

  return (
    <div className={`${styles.wrap} ${phase === 3 ? styles.fadeOut : styles.fadeIn}`}>
      {/* Ambient glow */}
      <div className={styles.glow} />

      {/* Logo */}
      <div className={`${styles.logo} ${phase >= 1 ? styles.logoVisible : ''}`}>
        <div className={styles.logoMark}>
          <IconCreditCard size={26} stroke={2} />
        </div>
        <span className={styles.logoText}>LifeOS</span>
      </div>

      {/* Greeting */}
      <div className={`${styles.greeting} ${phase >= 2 ? styles.greetingVisible : ''}`}>
        <h1 className={styles.hi}>{greeting}</h1>
        <p className={styles.sub}>{subtitle}</p>
      </div>

      {/* Progress bar */}
      <div className={`${styles.progressWrap} ${phase >= 2 ? styles.progressVisible : ''}`}>
        <div className={`${styles.progressBar} ${phase >= 2 ? styles.progressAnimate : ''}`} />
      </div>
    </div>
  );
}
