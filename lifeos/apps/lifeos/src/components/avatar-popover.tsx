import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { daysUntil } from '../lib/dates';
import { toFaDigits } from '../lib/format';
import { resizeImageToDataUrl, ACCEPTED_IMAGE_TYPES } from '../lib/image';
import { UserAvatar } from './user-avatar';
import styles from './avatar-popover.module.css';

/**
 * Props for {@link AvatarPopover}.
 */
export interface AvatarPopoverProps {
  /** Whether the popover is open. */
  open: boolean;
  /** Called when the popover requests to close. */
  onClose: () => void;
}

/** A quick-action menu row definition. */
interface ActionItem {
  icon: string;
  label: string;
  to: string;
}

const CHEVRON = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 6-6 6 6 6" />
  </svg>
);

const QUICK_ACTIONS: ActionItem[] = [
  { icon: '➕', label: 'افزودن سرویس', to: '/add' },
  { icon: '🌐', label: 'افزودن دامنه', to: '/add' },
  { icon: '📅', label: 'افزودن تمدید', to: '/renewals' },
  { icon: '✅', label: 'افزودن وظیفه', to: '/add' },
  { icon: '💰', label: 'ثبت هزینه', to: '/add' },
];

const SECONDARY_ACTIONS: ActionItem[] = [
  { icon: '⚙️', label: 'تنظیمات', to: '/settings' },
  { icon: '📤', label: 'خروجی گرفتن از اطلاعات', to: '/settings' },
  { icon: '💾', label: 'پشتیبان‌گیری', to: '/settings' },
];

/**
 * A premium glassmorphism profile popover anchored beneath the avatar. Shows
 * the user header with live stats, quick actions, secondary actions, and a
 * footer. Closes on outside click, ESC, or item selection.
 *
 * @param props - Open state and close handler.
 * @returns The avatar popover, or null when closed.
 */
export function AvatarPopover({ open, onClose }: AvatarPopoverProps): React.JSX.Element | null {
  const navigate = useNavigate();
  const userName = useSettings((s) => s.userName);
  const userEmail = useSettings((s) => s.userEmail);
  const setUserName = useSettings((s) => s.setUserName);
  const setUserEmail = useSettings((s) => s.setUserEmail);
  const setAvatarImage = useSettings((s) => s.setAvatarImage);
  const services = useServices((s) => s.services);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(userName);
  const [emailDraft, setEmailDraft] = useState(userEmail ?? '');

  const activeCount = services.filter((s) => s.active).length;
  const upcomingCount = services.filter((s) => {
    const d = daysUntil(s.nextRenewal);
    return s.active && d >= 0 && d <= 14;
  }).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    // Defer so the opening click does not immediately close it.
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      clearTimeout(t);
    };
  }, [open, onClose]);

  /** Enters edit mode, seeding the drafts from current values. */
  const startEdit = () => {
    setNameDraft(userName);
    setEmailDraft(userEmail ?? '');
    setEditing(true);
  };

  /** Saves profile drafts to the store and exits edit mode. */
  const saveEdit = () => {
    if (nameDraft.trim()) setUserName(nameDraft.trim());
    setUserEmail(emailDraft.trim());
    setEditing(false);
  };

  if (!open) return null;

  /** Navigates to a target and closes the popover. */
  const go = (to: string) => {
    navigate(to);
    onClose();
  };

  /** Reads the selected image, resizes it, and persists it to LocalStorage. */
  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file, 256);
      setAvatarImage(dataUrl);
    } catch {
      // ignore unreadable images
    }
  };

  const renderRow = (item: ActionItem) => (
    <button key={item.label} type="button" className={styles.row} onClick={() => go(item.to)}>
      <span className={styles.rowIcon}>{item.icon}</span>
      <span className={styles.rowLabel}>{item.label}</span>
      <span className={styles.chevron}>{CHEVRON}</span>
    </button>
  );

  return (
    <div ref={ref} className={styles.popover} role="menu">
      <div className={styles.header}>
        <UserAvatar size={52} showStatus={false} />
        <div className={styles.identity}>
          <p className={styles.name}>{userName}</p>
          <p className={styles.subtitle}>{userEmail || 'LifeOS User'}</p>
        </div>
        {!editing ? (
          <button
            type="button"
            className={styles.editBtn}
            onClick={startEdit}
            aria-label="ویرایش پروفایل"
          >
            ✏️
          </button>
        ) : null}
      </div>

      {editing ? (
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
          <button
            type="button"
            className={styles.changePhoto}
            onClick={() => fileRef.current?.click()}
          >
            📷 تغییر تصویر پروفایل
          </button>
          <div className={styles.editActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>
              انصراف
            </button>
            <button type="button" className={styles.saveBtn} onClick={saveEdit}>
              ذخیره
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.editProfile}
          onClick={startEdit}
        >
          👤 ویرایش پروفایل
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={onPickImage}
        style={{ display: 'none' }}
      />

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{toFaDigits(activeCount)}</span>
          <span className={styles.statLabel}>سرویس فعال</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{toFaDigits(upcomingCount)}</span>
          <span className={styles.statLabel}>تمدید نزدیک</span>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>{QUICK_ACTIONS.map(renderRow)}</div>

      <div className={styles.divider} />

      <div className={styles.group}>{SECONDARY_ACTIONS.map(renderRow)}</div>

      <p className={styles.footer}>LifeOS v1.0</p>
    </div>
  );
}
