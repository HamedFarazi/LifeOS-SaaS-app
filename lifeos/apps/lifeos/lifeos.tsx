import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MobileShell } from './src/components/mobile-shell';
import { ToastProvider } from './src/components/toast-provider';
import { ProtectedRoute } from './src/components/protected-route';
import { AppBackground } from './src/components/app-background';
import { PWAUpdateToast } from './src/components/pwa-update-toast';
import { SplashPage } from './src/pages/splash-page';
import styles from './src/styles/global.module.css';
import './src/styles/reset.css';

// ── Eagerly loaded (auth + splash — shown immediately) ────────────────────────
import { LoginPage }    from './src/pages/login-page';
import { RegisterPage } from './src/pages/register-page';

// ── Lazy loaded pages (code split) ────────────────────────────────────────────
const DashboardPage    = lazy(() => import('./src/pages/dashboard-page').then(m => ({ default: m.DashboardPage })));
const ServicesPage     = lazy(() => import('./src/pages/services-page').then(m => ({ default: m.ServicesPage })));
const RenewalsPage     = lazy(() => import('./src/pages/renewals-page').then(m => ({ default: m.RenewalsPage })));
const AnalyticsPage    = lazy(() => import('./src/pages/analytics-page').then(m => ({ default: m.AnalyticsPage })));
const SettingsPage     = lazy(() => import('./src/pages/settings-page').then(m => ({ default: m.SettingsPage })));
const AddServicePage   = lazy(() => import('./src/pages/add-service-page').then(m => ({ default: m.AddServicePage })));
const ServiceDetailPage= lazy(() => import('./src/pages/service-detail-page').then(m => ({ default: m.ServiceDetailPage })));
const EditServicePage  = lazy(() => import('./src/pages/edit-service-page').then(m => ({ default: m.EditServicePage })));
const ExpensesPage     = lazy(() => import('./src/pages/expenses-page').then(m => ({ default: m.ExpensesPage })));
const GoalsPage        = lazy(() => import('./src/pages/goals-page').then(m => ({ default: m.GoalsPage })));
const ReportsPage      = lazy(() => import('./src/pages/reports-page').then(m => ({ default: m.ReportsPage })));
const LandingPage      = lazy(() => import('./src/pages/landing-page').then(m => ({ default: m.LandingPage })));

// ── Skeleton fallback while lazy pages load ───────────────────────────────────
function PageSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', color: 'rgba(226,232,240,0.2)', fontSize: 13,
      fontFamily: 'Vazirmatn, system-ui',
    }}>
      در حال بارگذاری...
    </div>
  );
}

export function Lifeos(): React.JSX.Element {
  const [splashDone, setSplashDone] = useState(false);
  const [showSplash] = useState(() => !sessionStorage.getItem('lifeos-splash-shown'));

  useEffect(() => {
    if (!showSplash) setSplashDone(true);
  }, [showSplash]);

  const handleSplashDone = () => {
    sessionStorage.setItem('lifeos-splash-shown', '1');
    setSplashDone(true);
  };

  if (!splashDone) {
    return <SplashPage onDone={handleSplashDone} />;
  }

  return (
    <div className={styles.app}>
      <AppBackground />
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/landing"  element={
          <Suspense fallback={<PageSkeleton />}>
            <LandingPage />
          </Suspense>
        } />

        {/* Protected routes — wrapped in MobileShell */}
        <Route path="/*" element={
          <ProtectedRoute>
            <MobileShell>
              <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  <Route path="/"            element={<DashboardPage />} />
                  <Route path="/services"    element={<ServicesPage />} />
                  <Route path="/renewals"    element={<RenewalsPage />} />
                  <Route path="/analytics"   element={<AnalyticsPage />} />
                  <Route path="/expenses"    element={<ExpensesPage />} />
                  <Route path="/goals"       element={<GoalsPage />} />
                  <Route path="/reports"     element={<ReportsPage />} />
                  <Route path="/settings"    element={<SettingsPage />} />
                  <Route path="/add"         element={<AddServicePage />} />
                  <Route path="/service/:id" element={<ServiceDetailPage />} />
                  <Route path="/edit/:id"    element={<EditServicePage />} />
                  <Route path="*"            element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </MobileShell>
          </ProtectedRoute>
        } />
      </Routes>
      <ToastProvider />
      <PWAUpdateToast />
    </div>
  );
}
