import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconMail, IconLock, IconBrandGoogle, IconBrandGithub,
  IconEye, IconEyeOff, IconCreditCard,
} from '@tabler/icons-react';
import { useAuth } from '../store/use-auth';
import { useSettings } from '../store/use-settings';
import { WelcomeTransition } from '../components/welcome-transition';
import styles from './auth-pages.module.css';

const FloatingLines = lazy(() => import('../components/floating-lines'));

export function LoginPage(): React.JSX.Element {
  const navigate     = useNavigate();
  const login        = useAuth((s) => s.login);
  const setUserEmail = useSettings((s) => s.setUserEmail);
  const setUserName  = useSettings((s) => s.setUserName);
  const language     = useSettings((s) => s.language);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [welcoming, setWelcoming] = useState(false);
  const [loggedName, setLoggedName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('لطفاً همه فیلدها را پر کنید'); return; }
    setLoading(true); setError('');
    await new Promise((r) => setTimeout(r, 800));
    const name = email.split('@')[0];
    const ok = login(name, email, password, remember);
    if (ok) {
      setUserEmail(email.trim().toLowerCase());
      setUserName(name);
      setLoggedName(name);
      setWelcoming(true);
    } else {
      setError('اطلاعات وارد شده صحیح نیست');
      setLoading(false);
    }
  };

  const handleSocial = (provider: string) => {
    const name = provider + ' User';
    login(name, `user@${provider.toLowerCase()}.com`, 'fake', true);
    setUserName(name);
    setLoggedName(name);
    setWelcoming(true);
  };

  if (welcoming) {
    return <WelcomeTransition userName={loggedName} language={language} onDone={() => navigate('/')} />;
  }

  return (
    <div className={styles.authLayout}>
      {/* Animated background */}
      <div className={styles.bgCanvas}>
        <Suspense fallback={null}>
          <FloatingLines
            enabledWaves={['top','middle','bottom']}
            lineCount={[8, 12, 16]}
            lineDistance={[8, 6, 4]}
            bendRadius={4.0}
            bendStrength={-0.4}
            interactive
            parallax
            linesGradient={['#0a0f1e','#1c3baf','#2563eb','#38bdf8','#e0f2fe']}
            mixBlendMode="normal"
          />
        </Suspense>
      </div>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.brandRow}>
          <img src="/mainLogo.png" alt="Trackly" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />
          <span className={styles.logoText}>Trackly</span>
        </div>

        <h1 className={styles.title}>ورود به حساب</h1>
        <p className={styles.subtitle}>خوش برگشتی! اطلاعاتت رو وارد کن</p>

        <div className={styles.socialRow}>
          <button type="button" className={styles.socialBtn} onClick={() => handleSocial('Google')}>
            <IconBrandGoogle size={16} stroke={1.8} /> Google
          </button>
          <button type="button" className={styles.socialBtn} onClick={() => handleSocial('GitHub')}>
            <IconBrandGithub size={16} stroke={1.8} /> GitHub
          </button>
        </div>

        <div className={styles.divider}><span>یا با ایمیل</span></div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>ایمیل</label>
            <div className={styles.inputWrap}>
              <IconMail size={15} stroke={1.8} className={styles.inputIcon} />
              <input type="email" className={styles.input} placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>رمز عبور</label>
              <button type="button" className={styles.forgotLink}>فراموشی رمز</button>
            </div>
            <div className={styles.inputWrap}>
              <IconLock size={15} stroke={1.8} className={styles.inputIcon} />
              <input type={showPass ? 'text' : 'password'} className={styles.input} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((v) => !v)}>
                {showPass ? <IconEyeOff size={15} stroke={1.8} /> : <IconEye size={15} stroke={1.8} />}
              </button>
            </div>
          </div>

          <label className={styles.checkRow}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>مرا به خاطر بسپار</span>
          </label>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'ورود'}
          </button>
        </form>

        <p className={styles.switchText}>
          حساب ندارید؟{' '}
          <button type="button" className={styles.switchLink} onClick={() => navigate('/register')}>
            ثبت نام کنید
          </button>
        </p>
      </div>
    </div>
  );
}
