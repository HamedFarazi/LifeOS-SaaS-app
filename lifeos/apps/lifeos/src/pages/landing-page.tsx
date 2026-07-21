/**
 * LifeOS Landing Page — Premium Persian RTL SaaS
 * Inspired by Linear, Vercel, Stripe, Raycast
 */
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './landing-page.module.css';
import { BackgroundBoxes } from '../components/background-boxes';
import { ContainerScroll } from '../components/container-scroll';
import PixelCard from '../components/pixel-card';
import BorderGlow from '../components/border-glow';
import { InstallButton } from '../components/pwa-update-toast';

// ── animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.65, ease: 'easeOut' as const } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.5 } },
};
const stagger = (delay = 0.1) => ({
  hidden: {},
  show:   { transition: { staggerChildren: delay } },
});

// ── Section wrapper with InView animation ────────────────────────────────────
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref  = useRef(null);
  const inV  = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      className={className}
      id={id}
      variants={stagger()}
      initial="hidden"
      animate={inV ? 'show' : 'hidden'}
      style={{ overflow: 'visible' }}
    >
      {children}
    </motion.section>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.nav
      className={styles.nav}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className={styles.navInner}>
        <div className={styles.navLogo}>
          <img src="/mainLogo.png" alt="LifeOS" className={styles.navLogoImg} />
          <span className={styles.navLogoText}>LifeOS</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>ویژگی‌ها</a>
          <a href="#pricing"  className={styles.navLink}>قیمت‌گذاری</a>
          <a href="#about"    className={styles.navLink}>درباره ما</a>
        </div>
        <div className={styles.navActions}>
          <button className={styles.navBtnGhost} onClick={onLogin}>ورود</button>
          <button className={styles.navBtnPrimary} onClick={onLogin}>شروع رایگان</button>
        </div>
      </div>
    </motion.nav>
  );
}

// ── Dashboard Mockup ──────────────────────────────────────────────────────────
function DashboardMockup() {
  const services = [
    { name: 'Netflix',   price: '۱۷۹,۰۰۰', color: '#E50914', days: 5  },
    { name: 'Spotify',   price: '۹۵,۰۰۰',  color: '#1DB954', days: 12 },
    { name: 'ChatGPT+',  price: '۲۲۰,۰۰۰', color: '#10A37F', days: 18 },
    { name: 'GitHub',    price: '۱۴۵,۰۰۰', color: '#6E40C9', days: 24 },
  ];
  return (
    <div className={styles.mockup}>
      <div className={styles.mockupBar}>
        <span className={styles.mockupDot} style={{ background: '#FF5F57' }} />
        <span className={styles.mockupDot} style={{ background: '#FEBC2E' }} />
        <span className={styles.mockupDot} style={{ background: '#28C840' }} />
        <span className={styles.mockupTitle}>LifeOS Dashboard</span>
      </div>
      <div className={styles.mockupBody}>
        {/* hero card */}
        <div className={styles.mockupHero}>
          <div className={styles.mockupHeroLabel}>هزینه این ماه</div>
          <div className={styles.mockupHeroAmount}>۷,۶۰۲,۰۰۰ <span>تومان</span></div>
          <div className={styles.mockupHeroSub}>
            <span className={styles.mockupBadgeUp}>+۱۸٪</span> نسبت به ماه قبل
          </div>
          {/* mini sparkline */}
          <svg className={styles.mockupSparkline} viewBox="0 0 120 36" fill="none">
            <polyline points="0,28 20,22 40,26 60,14 80,18 100,8 120,10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>
            <polyline points="0,28 20,22 40,26 60,14 80,18 100,8 120,10 120,36 0,36" fill="url(#sg)" opacity="0.15"/>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* kpi row */}
        <div className={styles.mockupKpi}>
          {[
            { label: 'سرویس فعال', value: '۱۳' },
            { label: 'تمدید نزدیک', value: '۴' },
            { label: 'میانگین', value: '۵۸۵K' },
          ].map(k => (
            <div key={k.label} className={styles.mockupKpiItem}>
              <div className={styles.mockupKpiVal}>{k.value}</div>
              <div className={styles.mockupKpiLabel}>{k.label}</div>
            </div>
          ))}
        </div>
        {/* service list */}
        <div className={styles.mockupList}>
          {services.map(s => (
            <div key={s.name} className={styles.mockupService}>
              <div className={styles.mockupServiceIcon} style={{ background: s.color + '22', color: s.color }}>
                {s.name[0]}
              </div>
              <div className={styles.mockupServiceInfo}>
                <span className={styles.mockupServiceName}>{s.name}</span>
                <span className={styles.mockupServiceDays}>{s.days} روز دیگر</span>
              </div>
              <div className={styles.mockupServicePrice}>{s.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection({ onStart }: { onStart: () => void }) {
  const { scrollY } = useScroll();
  const mockupY   = useTransform(scrollY, [0, 600], [0, -60]);
  const mockupRot = useTransform(scrollY, [0, 600], [3, 0]);
  const bgY       = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <section className={styles.hero}>
      {/* animated background grid */}
      <motion.div className={styles.heroBg} style={{ y: bgY }} aria-hidden="true" />
      {/* glow orbs */}
      <div className={styles.glowBlue}   aria-hidden="true" />
      <div className={styles.glowCyan}   aria-hidden="true" />

      <div className={styles.heroInner}>
        {/* left: copy */}
        <motion.div
          className={styles.heroCopy}
          variants={stagger(0.12)}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            ساخته شده برای مدیریت بهتر زندگی دیجیتال
          </motion.div>

          <motion.h1 variants={fadeUp} className={styles.heroH1}>
            تمام هزینه‌های دیجیتال زندگی‌ات را{' '}
            <span className={styles.heroAccent}>هوشمند</span>{' '}
            مدیریت کن
          </motion.h1>

          <motion.p variants={fadeUp} className={styles.heroSub}>
            اشتراک‌ها، پرداخت‌های ماهانه و تمدیدها را در یک داشبورد ساده
            و حرفه‌ای کنترل کن. هیچ سرویسی فراموش نمی‌شود.
          </motion.p>

          <motion.div variants={fadeUp} className={styles.heroBtns}>
            <button className={styles.btnPrimary} onClick={onStart}>
              شروع رایگان
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className={styles.btnGhost} onClick={onStart}>
              مشاهده داشبورد
            </button>
            <InstallButton variant="hero" />
          </motion.div>

          <motion.div variants={fadeUp} className={styles.heroTrust}>
            {['بدون نیاز به کارت اعتباری', 'نصب فوری', 'رایگان برای همیشه'].map(t => (
              <span key={t} className={styles.heroTrustItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* right: floating dashboard mockup */}
        <motion.div
          className={styles.heroMockupWrap}
          initial={{ opacity: 0, x: 60, rotateY: -8 }}
          animate={{ opacity: 1, x: 0,  rotateY: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: mockupY, rotateX: mockupRot }}
        >
          <DashboardMockup />
          {/* floating badges */}
          <motion.div
            className={styles.floatBadge}
            style={{ top: '10%', left: '-18%' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className={styles.floatBadgeIcon}>🔔</span>
            <div>
              <div className={styles.floatBadgeTitle}>تمدید نزدیک</div>
              <div className={styles.floatBadgeSub}>Netflix — ۵ روز دیگر</div>
            </div>
          </motion.div>
          <motion.div
            className={styles.floatBadge}
            style={{ bottom: '12%', left: '-16%' }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <span className={styles.floatBadgeIcon}>✅</span>
            <div>
              <div className={styles.floatBadgeTitle}>صرفه‌جویی ماهانه</div>
              <div className={styles.floatBadgeSub}>۳۲۰,۰۰۰ تومان</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Problem Section ───────────────────────────────────────────────────────────
const problemServices = [
  { name: 'Netflix',   color: '#E50914', monthly: '۱۷۹K' },
  { name: 'Spotify',   color: '#1DB954', monthly: '۹۵K'  },
  { name: 'ChatGPT',   color: '#10A37F', monthly: '۲۲۰K' },
  { name: 'Hosting',   color: '#3B82F6', monthly: '۱۵۰K' },
  { name: 'VPN',       color: '#8B5CF6', monthly: '۱۰۰K' },
  { name: 'Domain',    color: '#F59E0B', monthly: '۹۶K'  },
  { name: 'SSL',       color: '#06B6D4', monthly: '۷۹K'  },
  { name: 'GitHub',    color: '#6E40C9', monthly: '۱۴۵K' },
];

function ProblemSection() {
  return (
    <Section className={styles.problem}>
      <div className={styles.sectionInner}>
        <motion.div variants={fadeUp} className={styles.sectionTag}>مشکل</motion.div>
        <motion.h2 variants={fadeUp} className={styles.sectionH2}>
          هر ماه چند سرویس پرداخت می‌کنی؟
        </motion.h2>
        <motion.p variants={fadeUp} className={styles.sectionSub}>
          اما نمی‌دانی چقدر خرج می‌کنی یا چه زمانی تمدید می‌شوند.
        </motion.p>

        <motion.div variants={stagger(0.06)} className={styles.problemGrid}>
          {problemServices.map((s, i) => (
            <motion.div
              key={s.name}
              variants={fadeUp}
              className={styles.problemCard}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className={styles.problemCardIcon} style={{ background: s.color + '20', color: s.color }}>
                {s.name[0]}
              </div>
              <div className={styles.problemCardName}>{s.name}</div>
              <div className={styles.problemCardPrice}>{s.monthly} تومان</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className={styles.problemResult}>
          <PixelCard
            variant="blue"
            gap={8}
            speed={40}
            colors="#e0f2fe,#7dd3fc,#0ea5e9,#2563eb"
            className={styles.problemPixelCard}
          >
            <div className={styles.problemResultTotal}>
              <span className={styles.problemResultNum}>۷.۶ میلیون</span>
              <span className={styles.problemResultLabel}>تومان در ماه — بدون اینکه بدانی!</span>
            </div>
          </PixelCard>
        </motion.div>
      </div>
    </Section>
  );
}

// ── Scroll Showcase (ContainerScroll) ─────────────────────────────────────────
function ScrollShowcase() {
  return (
    <div className={styles.scrollShowcase}>
      <ContainerScroll
        titleComponent={
          <div className={styles.scrollShowcaseTitle}>
            <div className={styles.sectionTag} style={{ display: 'inline-block', marginBottom: 16 }}>
              داشبورد
            </div>
            <h2 className={styles.sectionH2} style={{ marginBottom: 10 }}>
              یک نگاه — همه چیز زیر کنترل
            </h2>
            <p className={styles.sectionSub} style={{ margin: '0 auto' }}>
              داشبورد LifeOS تمام اشتراک‌ها، هزینه‌ها و تمدیدهای تو را
              در یک صفحه نشان می‌دهد.
            </p>
          </div>
        }
      >
        <img
          src="/paralaxsec.jpg"
          alt="LifeOS Dashboard"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}


const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title: 'مدیریت اشتراک‌ها',
    desc:  'همه سرویس‌های دیجیتال خود را در یک جا مدیریت کن. قیمت، تاریخ تمدید و دسته‌بندی.',
    color: '#3B82F6',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: 'یادآوری تمدیدها',
    desc:  'قبل از هر تمدید به موقع اطلاع‌رسانی می‌شود. دیگر سرویسی ناخواسته تمدید نمی‌شود.',
    color: '#06B6D4',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>
      </svg>
    ),
    title: 'تحلیل هزینه‌ها',
    desc:  'ببین پولت دقیقاً کجا خرج می‌شود. نمودارها و گزارش‌های ماهانه و سالانه.',
    color: '#8B5CF6',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'اهداف مالی',
    desc:  'هدف‌گذاری مالی کن و پیشرفت خود را دنبال کن. صرفه‌جویی را به عادت تبدیل کن.',
    color: '#10B981',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'دسته‌بندی هوشمند',
    desc:  'هزینه‌ها به صورت خودکار دسته‌بندی می‌شوند. استریمینگ، ابزارها، دامنه و بیشتر.',
    color: '#F59E0B',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'گزارش‌های دقیق',
    desc:  'خروجی CSV و JSON از تمام داده‌ها. برای آنالیز شخصی یا حسابداری.',
    color: '#EC4899',
  },
];

function FeaturesSection() {
  return (
    <Section className={styles.features} id="features">
      <div className={styles.sectionInner}>
        <motion.div variants={fadeUp} className={styles.sectionTag}>ویژگی‌ها</motion.div>
        <motion.h2 variants={fadeUp} className={styles.sectionH2}>
          هر چیزی که برای کنترل مالی نیاز داری
        </motion.h2>
        <motion.p variants={fadeUp} className={styles.sectionSub}>
          از مدیریت اشتراک تا تحلیل هزینه — همه در یک پلتفرم
        </motion.p>

        <motion.div variants={stagger(0.08)} className={styles.featuresGrid}>
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <BorderGlow
                backgroundColor="rgba(17,24,39,0.85)"
                borderRadius={14}
                glowColor="210 80 60"
                glowRadius={36}
                glowIntensity={0.9}
                coneSpread={28}
                colors={[f.color, '#06b6d4', '#3b82f6']}
                fillOpacity={0.25}
                className={styles.featureCardGlow}
              >
                <div className={styles.featureCard}>
                  <div className={styles.featureIconWrap} style={{ color: f.color, background: f.color + '18' }}>
                    {f.icon}
                  </div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

// ── Subscriptions Section — Tailwind sticky-image layout ─────────────────────
function SubscriptionsSection() {
  return (
    <Section className={styles.subscriptions}>
      {/* SVG grid background */}
      <div className={styles.subBgGrid} aria-hidden="true">
        <svg aria-hidden="true" className={styles.subBgSvg}>
          <defs>
            <pattern id="sub-grid" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y="-1" className={styles.subBgSquares}>
            <path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" strokeWidth="0" />
          </svg>
          <rect width="100%" height="100%" fill="url(#sub-grid)" strokeWidth="0" />
        </svg>
      </div>

      <div className={styles.subGrid2}>

        {/* ── ROW 1: header text (col 1) + image sticky (col 2, row-span 2) ── */}

        {/* Header text — col 1, row 1 */}
        <motion.div variants={stagger(0.1)} className={styles.subHeaderCell}>
          <motion.div variants={fadeUp} className={styles.sectionTag}>اشتراک‌ها</motion.div>
          <motion.h2 variants={fadeUp} className={styles.sectionH2} style={{ marginBottom: 16 }}>
            همه سرویس‌ها یکجا،<br />مرتب و واضح
          </motion.h2>
          <motion.p variants={fadeUp} className={styles.subIntro}>
            مدیریت اشتراک‌های دیجیتال هیچ‌وقت اینقدر ساده نبوده. تمام سرویس‌هایی که هر ماه
            پرداخت می‌کنی را در یک داشبورد واضح ببین، تمدیدها را زیر نظر بگیر و هزینه‌هایت
            را کنترل کن.
          </motion.p>
        </motion.div>

        {/* Image — col 2, row 1+2 (sticky) */}
        <motion.div variants={fadeUp} className={styles.subImageCell}>
          <img
            src="/hero1.jpg"
            alt="LifeOS subscription management"
            className={styles.subImage}
            draggable={false}
          />
        </motion.div>

        {/* ── ROW 2: body text (col 1, row 2) ── */}
        <motion.div variants={stagger(0.1)} className={styles.subBodyCell}>
          <motion.p variants={fadeUp} className={styles.subBodyText}>
            با LifeOS دیگر لازم نیست نگران فراموش کردن تاریخ تمدید یا پرداخت ناخواسته باشی.
            سیستم هوشمند یادآوری، قبل از هر تمدید به تو اطلاع می‌دهد تا بتوانی تصمیم بگیری.
            تمام اشتراک‌ها با قیمت، دسته‌بندی و وضعیت نمایش داده می‌شوند.
          </motion.p>

          <motion.ul variants={stagger(0.1)} className={styles.subFeatureList}>
            {[
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path d="M5.5 17a4.5 4.5 0 0 1-1.44-8.765 4.5 4.5 0 0 1 8.302-3.046 3.5 3.5 0 0 1 4.504 4.272A4 4 0 0 1 15 17H5.5Zm3.75-2.75a.75.75 0 0 0 1.5 0V9.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0l-3.25 3.5a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z" clipRule="evenodd" fillRule="evenodd" />
                  </svg>
                ),
                title: 'اضافه کردن فوری',
                desc: 'هر سرویسی را در چند ثانیه اضافه کن. قیمت، دوره تمدید و دسته‌بندی — همه در یک فرم ساده.',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" fillRule="evenodd" />
                  </svg>
                ),
                title: 'یادآور گواهی SSL',
                desc: 'تاریخ انقضای دامنه‌ها و گواهی‌های SSL را زیر نظر بگیر — قبل از خاموش شدن سایت.',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path d="M4.632 3.533A2 2 0 0 1 6.577 2h6.846a2 2 0 0 1 1.945 1.533l1.976 8.234A3.489 3.489 0 0 0 16 11.5H4c-.476 0-.93.095-1.344.267l1.976-8.234Z" /><path d="M4 13a2 2 0 1 0 0 4h12a2 2 0 1 0 0-4H4Zm11.24 2a.75.75 0 0 1 .75-.75H16a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75h-.01a.75.75 0 0 1-.75-.75V15Zm-2.25-.75a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 0 0 .75-.75V15a.75.75 0 0 0-.75-.75h-.01Z" clipRule="evenodd" fillRule="evenodd" />
                  </svg>
                ),
                title: 'پشتیبان‌گیری از داده‌ها',
                desc: 'خروجی JSON و CSV بگیر. داده‌هایت مال توست — هر وقت خواستی export کن.',
              },
            ].map((f) => (
              <motion.li key={f.title} variants={fadeUp} className={styles.subFeatureItem}>
                <span className={styles.subFeatureIcon}>{f.icon}</span>
                <span>
                  <strong className={styles.subFeatureTitle}>{f.title}. </strong>
                  <span className={styles.subFeatureDesc}>{f.desc}</span>
                </span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.p variants={fadeUp} className={styles.subBodyText} style={{ marginTop: 24 }}>
            همه داده‌ها به صورت امن در مرورگر شما ذخیره می‌شوند. هیچ اطلاعاتی به سرور خارجی
            ارسال نمی‌شود و حریم خصوصی شما کاملاً محفوظ است.
          </motion.p>

          <motion.div variants={fadeUp} className={styles.subExtra}>
            <h3 className={styles.subExtraTitle}>بدون سرور؟ مشکلی نیست.</h3>
            <p className={styles.subExtraDesc}>
              LifeOS کاملاً در مرورگر کار می‌کند. نه نیاز به حساب کاربری خاصی، نه نگرانی از
              نشت داده. همه چیز روی دستگاه شما — زیر کنترل شما.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </Section>
  );
}

// ── Analytics Section ─────────────────────────────────────────────────────────
const analyticsCategories = [
  { label: 'استریمینگ',  pct: 32, color: '#3B82F6', amount: '۲,۴۳۲K' },
  { label: 'ابزار',      pct: 27, color: '#06B6D4', amount: '۲,۰۵۲K' },
  { label: 'هوش مصنوعی', pct: 22, color: '#8B5CF6', amount: '۱,۶۷۲K' },
  { label: 'زیرساخت',   pct: 12, color: '#F59E0B', amount: '۹۱۲K'  },
  { label: 'سایر',       pct: 7,  color: '#6B7280', amount: '۵۳۲K'  },
];

function AnalyticsSection() {
  return (
    <Section className={styles.analytics}>
      <div className={styles.sectionInner}>
        <motion.div variants={fadeUp} className={styles.sectionTag}>تحلیل</motion.div>
        <motion.h2 variants={fadeUp} className={styles.sectionH2}>
          پولت دقیقاً کجا خرج می‌شود؟
        </motion.h2>
        <motion.p variants={fadeUp} className={styles.sectionSub}>
          با نمودارها و گزارش‌های دقیق، الگوی هزینه‌هایت را بشناس
        </motion.p>

        <motion.div variants={stagger(0.09)} className={styles.analyticsCard}>
          <motion.div variants={fadeUp} className={styles.analyticsLeft}>
            <div className={styles.analyticsDonutWrap}>
              <svg viewBox="0 0 120 120" className={styles.analyticsDonut}>
                {analyticsCategories.reduce((acc, cat, i) => {
                  const r = 48, circ = 2 * Math.PI * r;
                  const offset = acc.offset;
                  const dash = (cat.pct / 100) * circ;
                  const gap  = 2;
                  acc.elements.push(
                    <circle
                      key={cat.label}
                      cx="60" cy="60" r={r}
                      fill="none"
                      stroke={cat.color}
                      strokeWidth="16"
                      strokeDasharray={`${dash - gap} ${circ - dash + gap}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  );
                  acc.offset += dash;
                  return acc;
                }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
                <text x="60" y="56" textAnchor="middle" fontSize="11" fill="#E2E8F0" fontFamily="Vazirmatn">کل ماهانه</text>
                <text x="60" y="72" textAnchor="middle" fontSize="9" fill="#94A3B8" fontFamily="Vazirmatn">۷.۶ میلیون</text>
              </svg>
            </div>
          </motion.div>
          <motion.div variants={stagger(0.07)} className={styles.analyticsRight}>
            {analyticsCategories.map((c) => (
              <motion.div key={c.label} variants={fadeUp} className={styles.analyticsRow}>
                <div className={styles.analyticsDot} style={{ background: c.color }} />
                <div className={styles.analyticsLabel}>{c.label}</div>
                <div className={styles.analyticsBar}>
                  <motion.div
                    className={styles.analyticsBarFill}
                    style={{ background: c.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
                <div className={styles.analyticsPct}>{c.pct}٪</div>
                <div className={styles.analyticsAmt}>{c.amount}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

// ── Final CTA ──────────────────────────────────────────────────────────────────
function CtaSection({ onStart }: { onStart: () => void }) {
  return (
    <Section className={styles.cta}>
      <div className={styles.ctaGlow} aria-hidden="true" />
      <div className={styles.sectionInner}>
        <motion.h2 variants={fadeUp} className={styles.ctaH2}>
          کنترل مالی زندگی دیجیتال خودت را
          <br />
          <span className={styles.heroAccent}>همین امروز شروع کن</span>
        </motion.h2>
        <motion.p variants={fadeUp} className={styles.ctaSub}>
          رایگان شروع کن. هیچ کارت اعتباری لازم نیست.
        </motion.p>
        <motion.button
          variants={fadeUp}
          className={styles.ctaBtn}
          onClick={onStart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          ساخت حساب رایگان
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.button>
        <motion.p variants={fadeIn} className={styles.ctaNote}>
          بیش از ۱۰۰۰ نفر از LifeOS استفاده می‌کنند
        </motion.p>
      </div>
    </Section>
  );
}

// ── Footer with BackgroundBoxes ────────────────────────────────────────────────
function Footer({ onStart }: { onStart: () => void }) {
  return (
    <footer className={styles.footerBoxes}>
      {/* Background grid */}
      <BackgroundBoxes />

      {/* Radial mask so center content is readable */}
      <div className={styles.footerMask} aria-hidden="true" />

      {/* Two-column content */}
      <div className={styles.footerContent}>
        {/* Right col — brand + CTA */}
        <div className={styles.footerRight}>
          <div className={styles.navLogo}>
            <img src="/mainLogo.png" alt="LifeOS" className={styles.navLogoImg} />
            <span className={styles.navLogoText}>LifeOS</span>
          </div>
          <p className={styles.footerTagline}>
            یک سامانه هوشمند برای مدیریت اشتراک‌ها،<br />
            هزینه‌های ماهانه و اهداف مالی شخصی.
          </p>
          <button className={styles.footerStartBtn} onClick={onStart}>
            ساخت حساب رایگان
          </button>
          <p className={styles.footerCopy}>
            LifeOS © ۱۴۰۴ — همه حقوق محفوظ است
          </p>
        </div>

        {/* Left col — newsletter */}
        <div className={styles.footerLeft}>
          <p className={styles.newsletterTitle}>عضویت در خبرنامه</p>
          <p className={styles.newsletterSub}>
            آخرین اخبار، مقالات و به‌روزرسانی‌های LifeOS را هر هفته دریافت کن.
          </p>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              className={styles.newsletterInput}
              placeholder="ایمیل خود را وارد کن..."
              dir="rtl"
            />
            <button className={styles.newsletterBtn} type="button">
              عضویت
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const handleStart = () => navigate('/login');

  // lock direction to RTL for this page
  useEffect(() => {
    document.documentElement.dir  = 'rtl';
    document.documentElement.lang = 'fa';
  }, []);

  return (
    <div className={styles.landing}>
      <Navbar onLogin={handleStart} />
      <HeroSection onStart={handleStart} />
      <ProblemSection />
      <ScrollShowcase />
      <FeaturesSection />
      <SubscriptionsSection />
      <AnalyticsSection />
      <CtaSection onStart={handleStart} />
      <Footer onStart={handleStart} />
    </div>
  );
}
