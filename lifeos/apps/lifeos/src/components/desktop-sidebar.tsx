import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconLayoutDashboard, IconStack2, IconCalendarStats,
  IconChartPie, IconWallet, IconTarget, IconReportAnalytics,
  IconSettings, IconPlus, IconSearch, IconPencil, IconCamera,
  IconCreditCard, IconChevronLeft, IconLogout,
} from '@tabler/icons-react';
import { useSettings } from '../store/use-settings';
import { useServices } from '../store/use-services';
import { useAuth } from '../store/use-auth';
import { resizeImageToDataUrl, ACCEPTED_IMAGE_TYPES } from '../lib/image';
import { monthlyCost, daysUntil } from '../lib/dates';
import { formatMoney, toFaDigits } from '../lib/format';
import { useT } from '../hooks/use-t';
import { UserAvatar } from './user-avatar';
import { QuickActionsSheet } from './quick-actions-sheet';
import { GlobalSearch } from './global-search';
import styles from './desktop-sidebar.module.css';

interface NavItem { path: string; labelKey: string; icon: React.ReactNode; }

export function DesktopSidebar(): React.JSX.Element {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const t            = useT();
  const userName     = useSettings((s) => s.userName);
  const userEmail    = useSettings((s) => s.userEmail);
  const monthlyBudget = useSettings((s) => s.monthlyBudget);
  const currency     = useSettings((s) => s.currency);
  const setUserName  = useSettings((s) => s.setUserName);
  const setUserEmail = useSettings((s) => s.setUserEmail);
  const setAvatarImage = useSettings((s) => s.setAvatarImage);
  const services     = useServices((s) => s.services);
  const logout       = useAuth((s) => s.logout);
  const setUserEmail = useSettings((s) => s.setUserEmail);
  const setAvatarImage = useSettings((s) => s.setAvatarImage);
  const services     = useServices((s) => s.services);

  const fileRef      = useRef<HTMLInputElement>(null);
  const avatarRef    = useRef<HTMLButtonElement>(null);
  const [editing, setEditing]       = useState(false);
  const [sheetOpen, setSheetOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [nameDraft, setNameDraft]   = useState(userName);
  const [emailDraft, setEmailDraft] = useState(userEmail ?? '');

  const active    = services.filter((s) => s.active);
  const monthly   = active.reduce((sum, s) => sum + monthlyCost(s), 0);
  const upcoming7 = active.filter((s) => { const d = daysUntil(s.nextRenewal); return d >= 0 && d <= 7; }).length;
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

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/');

  const NAV_GROUPS = [
    {
      label: t('dashboard') === 'Dashboard' ? 'Main' : 'اصلی',
      items: [
        { path: '/',         labelKey: 'dashboard', icon: <IconLayoutDashboard size={17} stroke={1.8} /> },
        { path: '/services', labelKey: 'services',  icon: <IconStack2          size={17} stroke={1.8} /> },
      ] as NavItem[],
    },
    {
      label: t('dashboard') === 'Dashboard' ? 'Financial' : 'مالی',
      items: [
        { path: '/renewals',  labelKey: 'renewals',  icon: <IconCalendarStats   size={17} stroke={1.8} /> },
        { path: '/analytics', labelKey: 'analytics', icon: <IconChartPie        size={17} stroke={1.8} /> },
        { path: '/expenses',  labelKey: 'expenses',  icon: <IconWallet          size={17} stroke={1.8} /> },
        { path: '/goals',     labelKey: 'goals',     icon: <IconTarget          size={17} stroke={1.8} /> },
        { path: '/reports',   labelKey: 'reports',   icon: <IconReportAnalytics size={17} stroke={1.8} /> },
      ] as NavItem[],
    },
    {
      label: t('dashboard') === 'Dashboard' ? 'System' : 'سیستم',
      items: [
        { path: '/settings', labelKey: 'settings', icon: <IconSettings size={17} stroke={1.8} /> },
      ] as NavItem[],
    },
  ];

  return (
    <>
      <aside className={styles.sidebar}>

        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}><IconCreditCard size={14} stroke={2} /></div>
          <span className={styles.logoText}>LifeOS</span>
        </div>

        {/* Search */}
        <button type="button" className={styles.searchBtn} onClick={() => setSearchOpen(true)}>
          <IconSearch size={13} stroke={1.8} className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>{t('search')}</span>
          <kbd className={styles.kbd}>⌘K</kbd>
        </button>

        {/* Navigation groups */}
        <nav className={styles.nav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              <p className={styles.groupLabel}>{group.label}</p>
              {group.items.map((item) => {
                const act = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`${styles.navItem} ${act ? styles.navActive : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    {act && <span className={styles.activeBar} />}
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{t(item.labelKey as Parameters<typeof t>[0])}</span>
                    {act && <IconChevronLeft size={12} stroke={2} className={styles.navArrow} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Add */}
        <button type="button" className={styles.addBtn} onClick={() => navigate('/add')}>
          <IconPlus size={14} stroke={2.5} />
          {t('addService')}
        </button>

        {/* Stats widget */}
        <div className={styles.statsWidget}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{t('thisMonth')}</span>
            <span className={styles.statVal}>{formatMoney(monthly, 'IRT', currency)}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>{t('subscriptions')}</span>
            <span className={styles.statVal}>{toFaDigits(active.length)}</span>
          </div>
          {budgetPct !== null && (
            <>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>{t('monthlyBudget')}</span>
                <span className={styles.statVal} style={{ color: budgetColor }}>{toFaDigits(budgetPct)}%</span>
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
                ariaLabel="Quick actions" ariaExpanded={sheetOpen} ref={avatarRef} />
              <div className={styles.profileInfo}
                onClick={() => { setNameDraft(userName); setEmailDraft(userEmail ?? ''); setEditing(true); }}>
                <p className={styles.profileName}>{userName}</p>
                <p className={styles.profileEmail}>{userEmail || t('lifeosUser')}</p>
              </div>
              <div className={styles.profileActions}>
                <IconPencil size={13} stroke={1.8} className={styles.editIcon}
                  onClick={() => { setNameDraft(userName); setEmailDraft(userEmail ?? ''); setEditing(true); }} />
                <button type="button" className={styles.logoutBtn}
                  onClick={() => { logout(); navigate('/login'); }}
                  title="خروج">
                  <IconLogout size={13} stroke={1.8} />
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.editPanel}>
              <input className={styles.editInput} value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder={t('namePlaceholder')} />
              <input className={styles.editInput} value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} placeholder="Email" inputMode="email" />
              <button type="button" className={styles.photoBtn} onClick={() => fileRef.current?.click()}>
                <IconCamera size={13} stroke={1.8} /> Photo
              </button>
              <div className={styles.editActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>{t('cancel')}</button>
                <button type="button" className={styles.saveBtn} onClick={saveEdit}>{t('save')}</button>
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
