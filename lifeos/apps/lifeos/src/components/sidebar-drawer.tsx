import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  {
    path: '/',
    label: 'داشبورد',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    path: '/services',
    label: 'سرویس‌ها',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="5" width="19" height="14" rx="3" />
        <path d="M2.5 9.5h19" />
      </svg>
    ),
  },
  {
    path: '/renewals',
    label: 'تمدیدها',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    path: '/analytics',
    label: 'تحلیل',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    path: '/expenses',
    label: 'هزینه‌ها',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="13" rx="3" />
        <path d="M2 10h20M6 15h4" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'تنظیمات',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
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
                ✏️ ویرایش پروفایل
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
                📷 تغییر تصویر پروفایل
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
