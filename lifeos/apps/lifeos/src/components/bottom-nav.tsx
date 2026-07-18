import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, ChartPie, Settings2, Plus } from 'lucide-react';
import styles from './bottom-nav.module.css';

interface Tab { path: string; label: string; icon: React.ReactNode; }

const LEFT: Tab[] = [
  { path: '/',         label: 'داشبورد',  icon: <LayoutDashboard size={20} strokeWidth={1.8} /> },
  { path: '/services', label: 'سرویس‌ها', icon: <Layers          size={20} strokeWidth={1.8} /> },
];
const RIGHT: Tab[] = [
  { path: '/analytics', label: 'تحلیل',    icon: <ChartPie  size={20} strokeWidth={1.8} /> },
  { path: '/settings',  label: 'تنظیمات',  icon: <Settings2 size={20} strokeWidth={1.8} /> },
];

export function BottomNav(): React.JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const renderTab = (tab: Tab) => {
    const active = pathname === tab.path;
    return (
      <button key={tab.path} type="button"
        className={`${styles.tab} ${active ? styles.active : ''}`}
        onClick={() => navigate(tab.path)}>
        <span className={styles.icon}>{tab.icon}</span>
        <span className={styles.label}>{tab.label}</span>
      </button>
    );
  };

  return (
    <nav className={styles.nav}>
      <svg className={styles.bg} viewBox="0 0 360 80" preserveAspectRatio="none" aria-hidden>
        <path
          fill="#1a1040"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          d="M26,6 L140,6 C155,6 157,38 180,38 C203,38 205,6 220,6 L334,6
             C350,6 360,16 360,30 L360,60 C360,74 350,80 334,80
             L26,80 C10,80 0,74 0,60 L0,30 C0,16 10,6 26,6 Z"
        />
      </svg>

      <div className={styles.row}>
        <div className={styles.side}>{LEFT.map(renderTab)}</div>
        <div className={styles.gap} />
        <div className={styles.side}>{RIGHT.map(renderTab)}</div>
      </div>

      <button type="button" className={styles.fab} onClick={() => navigate('/add')} aria-label="افزودن سرویس">
        <Plus size={22} strokeWidth={2.5} />
      </button>
    </nav>
  );
}
