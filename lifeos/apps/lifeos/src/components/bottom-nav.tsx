import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './bottom-nav.module.css';

interface Tab {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const HomeIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M11.3 2.7a1 1 0 0 1 1.4 0l8 7.3A1 1 0 0 1 21 11h-1v8a2 2 0 0 1-2 2h-3v-6h-6v6H6a2 2 0 0 1-2-2v-8H3a1 1 0 0 1-.7-1l8-7.3Z" />
  </svg>
);
const CardIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <path d="M2.5 9.5h19" />
    <path d="M6 14.5h4" />
  </svg>
);
const ChartIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M7 15l3-3 2.5 2.5L17 9" />
  </svg>
);
const BellIcon = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

const LEFT: Tab[] = [
  { path: '/', label: 'داشبورد', icon: HomeIcon },
  { path: '/services', label: 'سرویس‌ها', icon: CardIcon },
];
const RIGHT: Tab[] = [
  { path: '/analytics', label: 'تحلیل', icon: ChartIcon },
  { path: '/settings', label: 'اعلان‌ها', icon: BellIcon },
];

/**
 * Floating bottom navigation with a single curved cyan bar and a central FAB.
 * Uses `position: absolute` so it stays inside the mobile frame boundary.
 *
 * @returns The bottom navigation bar.
 */
export function BottomNav(): React.JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const renderTab = (tab: Tab) => {
    const active = pathname === tab.path;
    return (
      <button
        key={tab.path}
        type="button"
        className={`${styles.tab} ${active ? styles.active : ''}`}
        onClick={() => navigate(tab.path)}
      >
        <span className={styles.icon}>{tab.icon}</span>
        <span className={styles.label}>{tab.label}</span>
      </button>
    );
  };

  return (
    <nav className={styles.nav}>
      <svg
        className={styles.bg}
        viewBox="0 0 360 80"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="#3ed0f0"
          d="M26,6
             L140,6
             C155,6 157,38 180,38
             C203,38 205,6 220,6
             L334,6
             C350,6 360,16 360,30
             L360,60
             C360,74 350,80 334,80
             L26,80
             C10,80 0,74 0,60
             L0,30
             C0,16 10,6 26,6 Z"
        />
      </svg>

      <div className={styles.row}>
        <div className={styles.side}>{LEFT.map(renderTab)}</div>
        <div className={styles.gap} />
        <div className={styles.side}>{RIGHT.map(renderTab)}</div>
      </div>

      <button
        type="button"
        className={styles.fab}
        onClick={() => navigate('/add')}
        aria-label="افزودن سرویس"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </nav>
  );
}
