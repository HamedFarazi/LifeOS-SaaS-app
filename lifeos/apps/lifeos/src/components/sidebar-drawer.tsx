import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Layers, CalendarClock, ChartPie,
  Wallet, Settings2, Pencil, Camera, Target, FileBarChart2,
} from 'lucide-react';
import { useSettings } from '../store/use-settings';
import { resizeImageToDataUrl, ACCEPTED_IMAGE_TYPES } from '../lib/image';
import { UserAvatar } from './user-avatar';
import styles from './sidebar-drawer.module.css';

/**
 * Props for {@link SidebarDrawer}.
 */
export interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** A navigation entry in the drawer. */
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/',          label: 'داشبورد',   icon: <LayoutDashboard size={20} strokeWidth={1.8} /> },
  { path: '/services',  label: 'سرویس‌ها',  icon: <Layers          size={20} strokeWidth={1.8} /> },
  { path: '/renewals',  label: 'تمدیدها',   icon: <CalendarClock   size={20} strokeWidth={1.8} /> },
  { path: '/analytics', label: 'تحلیل',     icon: <ChartPie        size={20} strokeWidth={1.8} /> },
  { path: '/expenses',  label: 'هزینه‌ها',  icon: <Wallet          size={20} strokeWidth={1.8} /> },
  { path: '/goals',     label: 'اهداف',     icon: <Target          size={20} strokeWidth={1.8} /> },
  { path: '/reports',   label: 'گزارش‌ها',  icon: <FileBarChart2   size={20} strokeWidth={1.8} /> },
  { path: '/settings',  label: 'تنظیمات',   icon: <Settings2       size={20} strokeWidth={1.8} /> },
];

/**
 * A premium glassmorphism sidebar drawer that slides in from the right (RTL).
 * Contains an editable user profile section and rounded navigation cards with
 * hover and active states. Closes on overlay click or ESC.
 *
 * @param props - Open state and close handler.
 * @returns The drawer with overlay.
 */
export function SidebarDrawer({ open, onClose }: SidebarDrawerProps): React.JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const userName = useSettings((s) => s.userName);
  const userEmail = useSettings((s) => s.userEmail);
  const setUserName = useSettings((s) => s.setUserName);
  const setUserEmail = useSettings((s) => s.setUserEmail);
  const setAvatarImage = useSettings((s) => s.setAvatarImage);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(userName);
  const [emailDraft, setEmailDraft] = useState(userEmail ?? '');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /** Reads, resizes, and persists the selected profile image. */
  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    try {
      setAvatarImage(await resizeImageToDataUrl(file, 256));
    } catch {
      // ignore
    }
  };

  /** Saves the profile drafts and exits edit mode. */
  const saveEdit = () => {
    if (nameDraft.trim()) setUserName(nameDraft.trim());
    setUserEmail(emailDraft.trim());
    setEditing(false);
  };

  /** Navigates and closes the drawer. */
  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className={`${styles.root} ${open ? styles.open : ''}`} aria-hidden={!open}>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.drawer} role="dialog" aria-label="منو">
        <div className={styles.profile}>
          <UserAvatar size={60} showStatus />
          {!editing ? (
            <>
              <p className={styles.name}>{userName}</p>
              <p className={styles.email}>{userEmail || 'LifeOS User'}</p>
              <button
                type="button"
                className={styles.editProfile}
                onClick={() => {
                  setNameDraft(userName);
                  setEmailDraft(userEmail ?? '');
                  setEditing(true);
                }}
              >
                <Pencil size={14} strokeWidth={1.8} /> ویرایش پروفایل
              </button>
            </>
          ) : (
            <div className={styles.editPanel}>
              <input
                className={styles.editInput}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="نام شما"
              />
              <input
                className={styles.editInput}
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                placeholder="ایمیل (اختیاری)"
                inputMode="email"
              />
              <button type="button" className={styles.changePhoto} onClick={() => fileRef.current?.click()}>
                <Camera size={14} strokeWidth={1.8} /> تغییر تصویر پروفایل
              </button>
              <div className={styles.editActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>انصراف</button>
                <button type="button" className={styles.saveBtn} onClick={saveEdit}>ذخیره</button>
              </div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={onPickImage}
            style={{ display: 'none' }}
          />
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                className={`${styles.navItem} ${active ? styles.activeItem : ''}`}
                onClick={() => go(item.path)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <p className={styles.footer}>LifeOS v1.0</p>
      </aside>
    </div>
  );
}
