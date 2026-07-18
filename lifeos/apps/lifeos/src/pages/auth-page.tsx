import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import { useSettings } from '../store/use-settings';
import styles from './auth-page.module.css';

type AuthMode = 'welcome' | 'phone' | 'email' | 'register';

/**
 * Authentication / onboarding screen. Frontend-only — stores the user name
 * locally. Structured to be replaced by real auth APIs later (phone OTP,
 * email/password, OAuth Google).
 *
 * @returns The auth page.
 */
export function AuthPage(): React.JSX.Element {
  const setUserName = useSettings((s) => s.setUserName);
  const setUserEmail = useSettings((s) => s.setUserEmail);
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const finish = () => {
    if (name.trim()) setUserName(name.trim());
    if (email.trim()) setUserEmail(email.trim());
    navigate('/');
  };

  if (mode === 'welcome') {
    return (
      <div className={styles.page}>
        <div className={styles.logoBox}>
          <span className={styles.logoText}>L</span>
        </div>
        <h1 className={styles.appName}>LifeOS</h1>
        <p className={styles.tagline}>مدیریت هوشمند سرویس‌ها و هزینه‌ها</p>

        <div className={styles.methods}>
          <button type="button" className={styles.google} onClick={() => { setName('کاربر جیمیل'); finish(); }}>
            <span className={styles.googleIcon}>G</span>
            ورود با Google
          </button>
          <button type="button" className={styles.methodBtn} onClick={() => setMode('phone')}>
            <Phone size={17} strokeWidth={1.8} /> ورود با شماره تلفن
          </button>
          <button type="button" className={styles.methodBtn} onClick={() => setMode('email')}>
            <Mail size={17} strokeWidth={1.8} /> ورود با ایمیل
          </button>
        </div>

        <button type="button" className={styles.register} onClick={() => setMode('register')}>
          حساب ندارید؟ ثبت نام کنید
        </button>
      </div>
    );
  }

  if (mode === 'phone') {
    return (
      <div className={styles.page}>
        <button type="button" className={styles.back} onClick={() => setMode('welcome')}>← بازگشت</button>
        <h2 className={styles.title}>ورود با شماره موبایل</h2>
        {!otpSent ? (
          <>
            <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="09XXXXXXXXX" inputMode="tel" />
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="نام شما" />
            <button type="button" className={styles.primary} onClick={() => setOtpSent(true)}>ارسال کد تأیید</button>
          </>
        ) : (
          <>
            <p className={styles.hint}>کد ۶ رقمی ارسال شده به {phone} را وارد کنید</p>
            <input className={`${styles.input} ${styles.otpInput}`} value={otp} onChange={(e) => setOtp(e.target.value)}
              placeholder="_ _ _ _ _ _" inputMode="numeric" maxLength={6} />
            <button type="button" className={styles.primary} onClick={finish}>تأیید و ورود</button>
            <button type="button" className={styles.ghost} onClick={() => setOtpSent(false)}>ارسال مجدد کد</button>
          </>
        )}
      </div>
    );
  }

  if (mode === 'email') {
    return (
      <div className={styles.page}>
        <button type="button" className={styles.back} onClick={() => setMode('welcome')}>← بازگشت</button>
        <h2 className={styles.title}>ورود با ایمیل</h2>
        <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="نام شما" />
        <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com" inputMode="email" />
        <input className={styles.input} value={pass} onChange={(e) => setPass(e.target.value)}
          placeholder="رمز عبور" type="password" />
        <button type="button" className={styles.primary} onClick={finish}>ورود</button>
      </div>
    );
  }

  // register
  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => setMode('welcome')}>← بازگشت</button>
      <h2 className={styles.title}>ثبت نام</h2>
      <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="نام و نام خانوادگی" />
      <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com" inputMode="email" />
      <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)}
        placeholder="شماره موبایل (اختیاری)" inputMode="tel" />
      <input className={styles.input} value={pass} onChange={(e) => setPass(e.target.value)}
        placeholder="رمز عبور" type="password" />
      <button type="button" className={styles.primary} onClick={finish}>ثبت نام</button>
    </div>
  );
}
