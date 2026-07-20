/**
 * BackgroundPicker — modal popup for selecting the app background.
 * Sections:
 *  1. پیشفرض — default (no background)
 *  2. عکس — preset images + custom upload
 *  3. ویژه — animated: Ballpit, Hyperspeed, Galaxy
 */
import React, { useRef } from 'react';
import {
  IconX,
  IconCheck,
  IconPhoto,
  IconUpload,
  IconBolt,
  IconAtom,
  IconBallBasketball,
  IconColorSwatch,
} from '@tabler/icons-react';
import { useBackground, type BgType } from '../store/use-background';
import styles from './background-picker.module.css';

interface BackgroundPickerProps {
  open: boolean;
  onClose: () => void;
}

const PRESET_IMAGES = [
  { id: 'bg1', url: '/backgrounds/background1.jpg', label: 'تم ۱' },
  { id: 'bg2', url: '/backgrounds/background2.jpg', label: 'تم ۲' },
  { id: 'bg3', url: '/backgrounds/background3.jpg', label: 'تم ۳' },
  { id: 'bg4', url: '/backgrounds/background4.jpg', label: 'تم ۴' },
];

const ANIMATED_BGs: { type: BgType; label: string; labelEn: string; icon: React.ReactNode; desc: string }[] = [
  {
    type: 'ballpit',
    label: 'توپ‌های شناور',
    labelEn: 'Ballpit',
    icon: <IconBallBasketball size={22} stroke={1.5} />,
    desc: 'گوی‌های متحرک سه‌بعدی',
  },
  {
    type: 'hyperspeed',
    label: 'سرعت نور',
    labelEn: 'Hyperspeed',
    icon: <IconBolt size={22} stroke={1.5} />,
    desc: 'افکت جاده‌ی سرعت نور',
  },
  {
    type: 'galaxy',
    label: 'کهکشان',
    labelEn: 'Galaxy',
    icon: <IconAtom size={22} stroke={1.5} />,
    desc: 'ذرات کهکشانی شناور',
  },
];

export function BackgroundPicker({ open, onClose }: BackgroundPickerProps): React.JSX.Element | null {
  const { type, imageUrl, setType, setImageUrl } = useBackground();
  const uploadRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleSelectDefault = () => {
    setType('default');
    setImageUrl(null);
  };

  const handleSelectPresetImage = (url: string) => {
    setImageUrl(url);
    setType('image');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objUrl = URL.createObjectURL(file);
    setImageUrl(objUrl);
    setType('image');
    // revoke previous object URL cleanup is handled by store reset
  };

  const handleSelectAnimated = (bgType: BgType) => {
    setType(bgType);
    setImageUrl(null);
  };

  const isActive = (t: BgType, url?: string | null): boolean => {
    if (t === 'image') return type === 'image' && imageUrl === url;
    return type === t;
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="انتخاب بکگراند">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <IconColorSwatch size={18} stroke={1.8} className={styles.headerIcon} />
            <span className={styles.headerTitle}>تغییر بکگراند</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="بستن">
            <IconX size={18} stroke={2} />
          </button>
        </div>

        <div className={styles.body}>

          {/* Section 1: Default */}
          <section className={styles.section}>
            <p className={styles.sectionLabel}>پیشفرض</p>
            <div className={styles.defaultRow}>
              <button
                className={`${styles.defaultCard} ${type === 'default' ? styles.activeCard : ''}`}
                onClick={handleSelectDefault}
                type="button"
              >
                <div className={styles.defaultPreview}>
                  <div className={styles.defaultDot} />
                  <div className={styles.defaultDot} />
                  <div className={styles.defaultDot} />
                </div>
                <span className={styles.cardLabel}>بدون بکگراند</span>
                {type === 'default' && (
                  <div className={styles.activeBadge}>
                    <IconCheck size={11} stroke={2.5} />
                  </div>
                )}
              </button>
            </div>
          </section>

          {/* Section 2: Images */}
          <section className={styles.section}>
            <p className={styles.sectionLabel}>تصویر</p>
            <div className={styles.imageGrid}>
              {PRESET_IMAGES.map((img) => (
                <button
                  key={img.id}
                  className={`${styles.imageCard} ${isActive('image', img.url) ? styles.activeCard : ''}`}
                  onClick={() => handleSelectPresetImage(img.url)}
                  type="button"
                  aria-label={img.label}
                >
                  <div
                    className={styles.imagePreview}
                    style={{ backgroundImage: `url(${img.url})` }}
                  />
                  <span className={styles.cardLabel}>{img.label}</span>
                  {isActive('image', img.url) && (
                    <div className={styles.activeBadge}>
                      <IconCheck size={11} stroke={2.5} />
                    </div>
                  )}
                </button>
              ))}

              {/* Upload button */}
              <button
                className={`${styles.imageCard} ${styles.uploadCard} ${type === 'image' && imageUrl && !PRESET_IMAGES.find(p => p.url === imageUrl) ? styles.activeCard : ''}`}
                onClick={() => uploadRef.current?.click()}
                type="button"
                aria-label="آپلود تصویر"
              >
                <div className={styles.uploadPreview}>
                  <IconUpload size={20} stroke={1.5} />
                </div>
                <span className={styles.cardLabel}>آپلود عکس</span>
                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleUpload}
                />
              </button>
            </div>
          </section>

          {/* Section 3: Animated / Premium */}
          <section className={styles.section}>
            <div className={styles.sectionLabelRow}>
              <p className={styles.sectionLabel}>ویژه</p>
              <span className={styles.premiumBadge}>Premium</span>
            </div>
            <div className={styles.animatedList}>
              {ANIMATED_BGs.map((bg) => (
                <button
                  key={bg.type}
                  className={`${styles.animatedCard} ${type === bg.type ? styles.activeAnimated : ''}`}
                  onClick={() => handleSelectAnimated(bg.type)}
                  type="button"
                >
                  <div className={`${styles.animatedIcon} ${type === bg.type ? styles.animatedIconActive : ''}`}>
                    {bg.icon}
                  </div>
                  <div className={styles.animatedInfo}>
                    <span className={styles.animatedLabel}>{bg.label}</span>
                    <span className={styles.animatedDesc}>{bg.desc}</span>
                  </div>
                  {type === bg.type && (
                    <div className={styles.animatedCheck}>
                      <IconCheck size={13} stroke={2.5} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Photo icon section indicator */}
          <div className={styles.notice}>
            <IconPhoto size={13} stroke={1.8} />
            <span>تغییرات فوری اعمال می‌شوند</span>
          </div>

        </div>
      </div>
    </div>
  );
}
