import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Globe, CalendarClock, CheckSquare, Wallet,
  Settings2, Upload, HardDrive, Pencil, Camera, ChevronLeft,
} from 'lucide-react';
import { useServices } from '../store/use-services';
import { useSettings } from '../store/use-settings';
import { daysUntil } from '../lib/dates';
import { toFaDigits } from '../lib/format';
import { resizeImageToDataUrl, ACCEPTED_IMAGE_TYPES } from '../lib/image';
import { UserAvatar } from './user-avatar';
import styles from './avatar-popover.module.css';

export interface AvatarPopoverProps {
  open: boolean;
  onClose: () => void;
}

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  to: string;
}

const QUICK_ACTIONS: ActionItem[] = [
  { icon: <Plus size={16} strokeWidth={1.8} />,          label: 'افزودن سرویس',  to: '/add' },
  { icon: <Globe size={16} strokeWidth={1.8} />,         label: 'افزودن دامنه',   to: '/add' },
  { icon: <CalendarClock size={16} strokeWidth={1.8} />, label: 'افزودن تمدید',   to: '/renewals' },
  { icon: <CheckSquare size={16} strokeWidth={1.8} />,   label: 'افزودن وظیفه',  to: '/add' },
  { icon: <Wallet size={16} strokeWidth={1.8} />,        label: 'ثبت هزینه',     to: '/add' },
];

const SECONDARY_ACTIONS: ActionItem[] = [
  { icon: <Settings2 size={16} strokeWidth={1.8} />, label: 'تنظیمات',                  to: '/settings' },
  { icon: <Upload size={16} strokeWidth={1.8} />,    label: 'خروجی گرفتن از اطلاعات',   to: '/settings' },
  { icon: <HardDrive size={16} strokeWidth={1.8} />, label: 'پشتیبان‌گیری',              to: '/settings' },
];

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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const startEdit = () => { setNameDraft(userName); setEmailDraft(userEmail ?? ''); setEditing(true); };
  const saveEdit = () => {
    if (nameDraft.trim()) setUserName(nameDraft.trim());
    setUserEmail(emailDraft.trim());
    setEditing(false);
  };

  if (!open) return null;

  const go = (to: string) => { navigate(to); onClose(); };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    try { setAvatarImage(await resizeImageToDataUrl(file, 256)); } catch { /* ignore */ }
  };

  const renderRow = (item: ActionItem) => (
    <button key={item.label} type="button" className={styles.row} onClick={() => go(item.to)}>
      <span className={styles.rowIcon}>{item.icon}</span>
      <span className={styles.rowLabel}>{item.label}</span>
      <ChevronLeft size={14} strokeWidth={1.8} className={styles.chevron} />
    </button>
  );

  return (
    <div ref={ref} className={styles.popover} role="menu">
      {/* Header */}
      <div className={styles.header}>
        <UserAvatar size={44} showStatus={false} />
        <div className={styles.identity}>
          <p className={styles.name}>{userName}</p>
          <p className={styles.subtitle}>{userEmail || 'Trackly User'}</p>
        </div>
        {!editing && (
          <button type="button" className={styles.editBtn} onClick={startEdit} aria-label="ویرایش">
            <Pencil size={14} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* Edit panel */}
      {editing ? (
        <div className={styles.editPanel}>
          <input className={styles.editInput} value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="نام شما" />
          <input className={styles.editInput} value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} placeholder="ایمیل" inputMode="email" />
          <button type="button" className={styles.changePhoto} onClick={() => fileRef.current?.click()}>
            <Camera size={14} strokeWidth={1.8} /> تغییر تصویر پروفایل
          </button>
          <div className={styles.editActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>انصراف</button>
            <button type="button" className={styles.saveBtn} onClick={saveEdit}>ذخیره</button>
          </div>
        </div>
      ) : (
        <button type="button" className={styles.editProfile} onClick={startEdit}>
          <Pencil size={13} strokeWidth={1.8} /> ویرایش پروفایل
        </button>
      )}
      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={onPickImage} style={{ display: 'none' }} />

      {/* Stats */}
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

      <p className={styles.footer}>Trackly v1.0</p>
    </div>
  );
}
