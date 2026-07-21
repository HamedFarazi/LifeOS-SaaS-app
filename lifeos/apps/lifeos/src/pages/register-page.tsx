import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconUser, IconMail, IconLock, IconEye, IconEyeOff, IconCreditCard,
} from '@tabler/icons-react';
import { useAuth } from '../store/use-auth';
import { useSettings } from '../store/use-settings';
import { WelcomeTransition } from '../components/welcome-transition';
import styles from './auth-pages.module.css';

const FloatingLines = lazy(() => import('../components/floating-lines'));

export function RegisterPage(): React.JSX.Element {
  const navigate     = useNavigate();
  const register     = useAuth((s) => s.register);
  const setUserName  = useSettings((s) => s.setUserName);
  const setUserEmail = useSettings((s) => s.setUserEmail);
  const language     = useSettings((s) => s.language);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [welcoming, setWelcoming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) { setError('لطفاً همه فیلدها را پر کنید'); return; }
    if (password !== confirm) { setError('رمز عبور و تکرار آن یکسان نیستند'); return; }
    if (password.length < 6)  { setError('رمز عبور باید حداقل ۶ کاراکتر باشد'); return; }
    setLoading(true); setError('');
    await new Promise((r) => setTimeout(r, 900));
    const ok = register(name, email, password);
    if (ok) {
      setUserName(name.trim());
      setUserEmail(email.trim().toLowerCase());
      setWelcoming(true);
    } else {
      setError('خطا در ثبت نام');
      setLoading(false);
    }
  };

  if (welcoming) {
    return <WelcomeTransition userName={name} language={language} onDone={() => navigate('/')} />;
  }

  return (
    <div className={styles.authLayout}>
      <div className={styles.bgCanvas}>
        <Suspense fallback={null}>
          <FloatingLines
            enabledWaves={['top','middle','bottom']}
            lineCount={[8, 12, 16]}
            lineDistance={[8, 6, 4]}
            bendRadius={4.0} bendStrength={-0.4}
            interactive parallax
            linesGradient={['#0a0f1e','#1c3baf','#2563eb','#38bdf8','#e0f2fe']}
            mixBlendMode="normal"
          />
        </Suspense>
      </div>

      <div className={styles.card}>
        <div className={styles.brandRow}>
          <img src="/mainLogo.png" alt="LifeOS" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />
          <span className={styles.logoText}>LifeOS</span>
        </div>

        <h1 className={styles.title}>ایجاد حساب</h1>
        <p className={styles.subtitle}>رایگان شروع کنید</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>نام کامل</label>
            <div className={styles.inputWrap}>
              <IconUser size={15} stroke={1.8} className={styles.inputIcon} />
              <input type="text" className={styles.input} placeholder="علی رضایی"
                value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>ایمیل</label>
            <div className={styles.inputWrap}>
              <IconMail size={15} stroke={1.8} className={styles.inputIcon} />
              <input type="email" className={styles.input} placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>رمز عبور</label>
            <div className={styles.inputWrap}>
              <IconLock size={15} stroke={1.8} className={styles.inputIcon} />
              <input type={showPass ? 'text' : 'password'} className={styles.input} placeholder="حداقل ۶ کاراکتر"
                value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((v) => !v)}>
                {showPass ? <IconEyeOff size={15} stroke={1.8} /> : <IconEye size={15} stroke={1.8} />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>تکرار رمز عبور</label>
            <div className={styles.inputWrap}>
              <IconLock size={15} stroke={1.8} className={styles.inputIcon} />
              <input type={showPass ? 'text' : 'password'} className={styles.input} placeholder="••••••••"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'ایجاد حساب'}
          </button>
        </form>

        <p className={styles.switchText}>
          حساب دارید؟{' '}
          <button type="button" className={styles.switchLink} onClick={() => navigate('/login')}>
            وارد شوید
          </button>
        </p>
      </div>
    </div>
  );
}
