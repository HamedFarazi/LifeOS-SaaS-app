import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useServices } from '../store/use-services';
import { PageHeader } from '../components/page-header';
import { CategoryIcon } from '../components/category-icon';
import { CATEGORY_META, CATEGORY_ORDER } from '../data/categories';
import { daysUntil } from '../lib/dates';
import { resizeImageToDataUrl, ACCEPTED_IMAGE_TYPES } from '../lib/image';
import type { BillingCycle, Currency, ServiceCategory } from '../types/index';
import styles from './add-service-page.module.css';

const COLORS = ['#A855F7', '#2FD0FF', '#63E8FF', '#34D399', '#F472B6', '#FBBF24', '#FB7185', '#6366F1'];

export function EditServicePage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const service = useServices((s) => s.services.find((x) => x.id === id));
  const updateService = useServices((s) => s.updateService);
  const imgRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(service?.name ?? '');
  const [plan, setPlan] = useState(service?.plan ?? '');
  const [price, setPrice] = useState(String(service?.price ?? ''));
  const [priceCurrency, setPriceCurrency] = useState<Currency>(service?.priceCurrency ?? 'IRT');
  const [category, setCategory] = useState<ServiceCategory>(service?.category ?? 'subscription');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(service?.billingCycle ?? 'monthly');
  const [days, setDays] = useState(String(service ? Math.max(daysUntil(service.nextRenewal), 0) : 30));
  const [color, setColor] = useState(service?.color ?? COLORS[0]);
  const [logoImage, setLogoImage] = useState<string | undefined>(service?.logoImage);

  if (!service) {
    return <div><PageHeader title="سرویس یافت نشد" back /><p className={styles.label}>این سرویس وجود ندارد.</p></div>;
  }

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    try { setLogoImage(await resizeImageToDataUrl(file, 256)); } catch { /* ignore */ }
  };

  const submit = () => {
    if (!name.trim() || !price) return;
    const next = new Date();
    next.setDate(next.getDate() + Number(days || 0));
    updateService(service.id, {
      name: name.trim(),
      plan: plan.trim() || CATEGORY_META[category].label,
      price: Number(price),
      priceCurrency,
      category, billingCycle,
      nextRenewal: next.toISOString(),
      color,
      logoText: service.logoText ?? name.trim().charAt(0).toUpperCase(),
      logoImage,
    });
    navigate(`/service/${service.id}`);
  };

  return (
    <div>
      <PageHeader title="ویرایش سرویس" back />
      <div className={styles.form}>

        <label className={styles.label}>لوگو</label>
        <div className={styles.logoRow}>
          <div className={styles.logoPreview} style={{ background: logoImage ? 'transparent' : color }}>
            {logoImage
              ? <img src={logoImage} alt="logo" className={styles.logoPreviewImg} />
              : <span>{name.charAt(0).toUpperCase() || service.name.charAt(0)}</span>}
          </div>
          <button type="button" className={styles.uploadBtn} onClick={() => imgRef.current?.click()}><Camera size={15} strokeWidth={1.8} /> آپلود تصویر</button>
          {logoImage && <button type="button" className={styles.removeBtn} onClick={() => setLogoImage(undefined)}>✕</button>}
          <input ref={imgRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={pickImage} style={{ display: 'none' }} />
        </div>

        <label className={styles.label}>نام سرویس</label>
        <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً Netflix" />

        <label className={styles.label}>پلن</label>
        <input className={styles.input} value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="مثلاً پریمیوم" />

        <label className={styles.label}>دسته‌بندی</label>
        <div className={styles.chips}>
          {CATEGORY_ORDER.map((cat) => (
            <button key={cat} type="button"
              className={`${styles.chip} ${category === cat ? styles.activeChip : ''}`}
              onClick={() => setCategory(cat)}>
              <CategoryIcon icon={CATEGORY_META[cat].icon} size={15} color={CATEGORY_META[cat].color} />
              {CATEGORY_META[cat].label}
            </button>
          ))}
        </div>

        <label className={styles.label}>قیمت</label>
        <div className={styles.priceRow}>
          <input className={`${styles.input} ${styles.priceInput}`} value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric" />
          <div className={styles.currencyToggle}>
            {(['IRT', 'USD'] as Currency[]).map((c) => (
              <button key={c} type="button"
                className={`${styles.segBtn} ${priceCurrency === c ? styles.segActive : ''}`}
                onClick={() => setPriceCurrency(c)}>
                {c === 'IRT' ? 'تومان' : 'دلار'}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.label}>دوره پرداخت</label>
        <div className={styles.segment}>
          <button type="button" className={`${styles.segBtn} ${billingCycle === 'monthly' ? styles.segActive : ''}`} onClick={() => setBillingCycle('monthly')}>ماهانه</button>
          <button type="button" className={`${styles.segBtn} ${billingCycle === 'yearly' ? styles.segActive : ''}`} onClick={() => setBillingCycle('yearly')}>سالانه</button>
        </div>

        <label className={styles.label}>تمدید بعدی (روز دیگر)</label>
        <input className={styles.input} value={days}
          onChange={(e) => setDays(e.target.value.replace(/\D/g, ''))} inputMode="numeric" />

        <label className={styles.label}>رنگ پس‌زمینه</label>
        <div className={styles.colors}>
          {COLORS.map((c) => (
            <button key={c} type="button"
              className={`${styles.swatch} ${color === c ? styles.activeSwatch : ''}`}
              style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />
          ))}
        </div>

        <button className={styles.submit} type="button" onClick={submit}>ذخیره تغییرات</button>
      </div>
    </div>
  );
}
