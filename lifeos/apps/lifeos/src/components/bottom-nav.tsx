import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  IconLayoutDashboard, IconStack2, IconChartPie,
  IconSettings, IconPlus,
} from '@tabler/icons-react';
import styles from './bottom-nav.module.css';

interface DockTab {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: DockTab[] = [
  { path: '/',          label: 'داشبورد',  icon: <IconLayoutDashboard size={22} stroke={1.8} /> },
  { path: '/services',  label: 'سرویس‌ها', icon: <IconStack2          size={22} stroke={1.8} /> },
  { path: '/analytics', label: 'تحلیل',   icon: <IconChartPie        size={22} stroke={1.8} /> },
  { path: '/settings',  label: 'تنظیمات', icon: <IconSettings        size={22} stroke={1.8} /> },
];

/** Single dock item with magnification spring effect */
function DockItem({
  tab,
  mouseX,
  isActive,
  onClick,
}: {
  tab: DockTab;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const el = ref.current;
    if (!el) return 999;
    const rect = el.getBoundingClientRect();
    return Math.abs(val - (rect.left + rect.width / 2));
  });

  // Magnify: 44px base → 58px at cursor
  const size = useSpring(
    useTransform(distance, [0, 80, 160], [58, 50, 44]),
    { stiffness: 340, damping: 28 }
  );

  // Lift: float up toward cursor
  const y = useSpring(
    useTransform(distance, [0, 80, 160], [-10, -4, 0]),
    { stiffness: 340, damping: 28 }
  );

  const [tooltip, setTooltip] = useState(false);

  return (
    <div className={styles.dockItemWrap}>
      {tooltip && (
        <motion.div
          className={styles.tooltip}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
        >
          {tab.label}
        </motion.div>
      )}
      <motion.button
        ref={ref}
        type="button"
        className={`${styles.dockItem} ${isActive ? styles.dockItemActive : ''}`}
        style={{ width: size, height: size, y }}
        onClick={onClick}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        whileTap={{ scale: 0.88 }}
        aria-label={tab.label}
      >
        {tab.icon}
        {isActive && <span className={styles.dot} />}
      </motion.button>
    </div>
  );
}

export function BottomNav(): React.JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mouseX = useMotionValue(Infinity);

  return (
    <nav
      className={styles.nav}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <motion.div
        className={styles.dock}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {TABS.map((tab) => (
          <DockItem
            key={tab.path}
            tab={tab}
            mouseX={mouseX}
            isActive={pathname === tab.path}
            onClick={() => navigate(tab.path)}
          />
        ))}

        <div className={styles.sep} />

        {/* FAB */}
        <div className={styles.dockItemWrap}>
          <motion.button
            type="button"
            className={styles.fab}
            onClick={() => navigate('/add')}
            style={{ width: 44, height: 44 }}
            whileHover={{ scale: 1.12, y: -6 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            aria-label="افزودن سرویس"
          >
            <IconPlus size={20} stroke={2.5} />
          </motion.button>
        </div>
      </motion.div>
    </nav>
  );
}
