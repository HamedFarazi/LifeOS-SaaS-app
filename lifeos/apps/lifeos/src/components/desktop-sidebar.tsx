import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconLayoutDashboard, IconStack2, IconCalendarStats,
  IconChartPie, IconWallet, IconTarget, IconReportAnalytics,
  IconSettings, IconPlus, IconSearch, IconPencil, IconCamera,
} from '@tabler/icons-react';
import { useSettings } from '../store/use-settings';
import { useServices } from '../store/use-services';
import { resizeImageToDataUrl, ACCEPTED_IMAGE_TYPES } from '../lib/image';
import { monthlyCost } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import { UserAvatar } from './user-avatar';
import { QuickActionsSheet } from './quick-actions-sheet';
import { GlobalSearch } from './global-search';
import styles from './desktop-sidebar.module.css';

interface NavItem { path: string; label: string; icon: React.ReactNode; }

const NAV: NavItem[] = [
  { path: '/',          label: 'داشبورد',   icon: <IconLayoutDashboard   size={17} stroke={1.8} /> },
  { path: '/services',  label: 'سرویس‌ها',  icon: <IconStack2            size={17} stroke={1.8} /> },
  { path: '/renewals',  label: 'تمدیدها',   icon: <IconCalendarStats     size={17} stroke={1.8} /> },
  { path: '/analytics', label: 'تحلیل',     icon: <IconChartPie          size={17} stroke={1.8} /> },
  { path: '/expenses',  label: 'هزینه‌ها',  icon: <IconWallet            size={17} stroke={1.8} /> },
  { path: '/goals',     label: 'اهداف',     icon: <IconTarget            size={17} stroke={1.8} /> },
  { path: '/reports',   label: 'گزارش‌ها',  icon: <IconReportAnalytics   size={17} stroke={1.8} /> },
  { path: '/settings',  label: 'تنظیمات',   icon: <IconSettings          size={17} stroke={1.8} /> },
];

export function DesktopSidebar(): React.JSX.Element {
  const navigate    = useNavigate();
  const { pathname } = useLocation();
  const userName    = useSettings((s) => s.userName);
  const userEmail   = useSettings((s) => s.userEmail);
  const monthlyBudget = useSettings((s) => s.monthlyBudget);
  const currency    = useSettings((s) => s.currency);
  const setUserName = useSettings((s) => s.setUserName);
  const setUserEmail = useSettings((s) => s.setUserEmail);
  const setAvatarImage = useSettings((s) => s.setAvatarImage);
  const services    = useServices((s) => s.services);

  const fileRef   = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const [editing, setEditing]     = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [nameDraft, setNameDraft]   = useState(userName);
  const [emailDraft, setEmailDraft] = useState(userEmail ?? '');

  const active = services.filter((s) => s.active);
  const monthly = active.reduce((sum, s) => sum + monthlyCost(s), 0);
  const budgetPct = monthlyBudget ? Math.min(Math.round((monthly / monthlyBudget) * 100), 100) : null;
  const budgetColor = budgetPct != null ? (budgetPct > 80 ? '#F87171' : budgetPct > 60 ? '#FBBF24' : '#34D399') : '#34D399';

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file || !ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    try { setAvatarImage(await resizeImageToDataUrl(file, 256)); } catch { /**/ }
  };
  const saveEdit = () => {
    if (nameDraft.trim()) setUserName(nameDraft.trim());
    setUserEmail(emailDraft.trim());
    setEditing(false);
  };

  return (
    <>
      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>L</div>
          <span className={styles.logoText}>LifeOS</span>
        </div>

        {/* Search */}
        <button type="button" className={styles.searchBtn} onClick={() => setSearchOpen(true)}>
          <IconSearch size={14} stroke={1.8} />
          <span>جستجو</span>
          <kbd className={styles.kbd}>/</kbd>
        </button>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                type="button"
                className={`${styles.navItem} ${isActive ? styles.navActive : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Add */}
        <button type="button" className={styles.addBtn} onClick={() => navigate('/add')}>
          <IconPlus size={14} stroke={2.5} />
          افزودن سرویس
        </button>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>سرویس فعال</span>
            <span className={styles.statVal}>{toFaDigits(active.length)}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>این ماه</span>
            <span className={styles.statVal}>{formatMoney(monthly, 'IRT', currency)}</span>
          </div>
          {budgetPct !== null && (
            <>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>از بودجه</span>
                <span className={styles.statVal} style={{ color: budgetColor }}>{toFaDigits(budgetPct)}٪</span>
              </div>
              <div className={styles.progressBg}>
                <div className={styles.progressFill} style={{ width: `${budgetPct}%`, background: budgetColor }} />
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className={styles.profile}>
          {!editing ? (
            <div className={styles.profileRow}>
              <UserAvatar size={32} showStatus onClick={() => setSheetOpen((v) => !v)}
                ariaLabel="عملیات سریع" ariaExpanded={sheetOpen} ref={avatarRef} />
              <div className={styles.profileInfo}
                onClick={() => { setNameDraft(userName); setEmailDraft(userEmail ?? ''); setEditing(true); }}>
                <p className={styles.profileName}>{userName}</p>
                <p className={styles.profileEmail}>{userEmail || 'LifeOS User'}</p>
              </div>
              <IconPencil size={13} stroke={1.8} className={styles.editIcon}
                onClick={() => { setNameDraft(userName); setEmailDraft(userEmail ?? ''); setEditing(true); }} />
            </div>
          ) : (
            <div className={styles.editPanel}>
              <input className={styles.editInput} value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="نام شما" />
              <input className={styles.editInput} value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} placeholder="ایمیل" inputMode="email" />
              <button type="button" className={styles.photoBtn} onClick={() => fileRef.current?.click()}>
                <IconCamera size={13} stroke={1.8} /> تغییر تصویر
              </button>
              <div className={styles.editActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>انصراف</button>
                <button type="button" className={styles.saveBtn} onClick={saveEdit}>ذخیره</button>
              </div>
            </div>
          )}
          <QuickActionsSheet open={sheetOpen} onClose={() => setSheetOpen(false)}
            variant="popup" anchorRef={avatarRef as React.RefObject<HTMLElement>} />
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={onPickImage} style={{ display: 'none' }} />
        </div>
      </aside>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
