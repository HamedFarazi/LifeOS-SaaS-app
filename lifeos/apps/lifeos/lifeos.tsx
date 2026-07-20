import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MobileShell } from './src/components/mobile-shell';
import { ToastProvider } from './src/components/toast-provider';
import { ProtectedRoute } from './src/components/protected-route';
import { AppBackground } from './src/components/app-background';
import { SplashPage } from './src/pages/splash-page';
import { LoginPage } from './src/pages/login-page';
import { RegisterPage } from './src/pages/register-page';
import { DashboardPage } from './src/pages/dashboard-page';
import { ServicesPage } from './src/pages/services-page';
import { RenewalsPage } from './src/pages/renewals-page';
import { AnalyticsPage } from './src/pages/analytics-page';
import { SettingsPage } from './src/pages/settings-page';
import { AddServicePage } from './src/pages/add-service-page';
import { ServiceDetailPage } from './src/pages/service-detail-page';
import { EditServicePage } from './src/pages/edit-service-page';
import { ExpensesPage } from './src/pages/expenses-page';
import { GoalsPage } from './src/pages/goals-page';
import { ReportsPage } from './src/pages/reports-page';
import { LandingPage } from './src/pages/landing-page';
import styles from './src/styles/global.module.css';
import './src/styles/reset.css';

export function Lifeos(): React.JSX.Element {
  const [splashDone, setSplashDone] = useState(false);

  // Only show splash on first ever visit per session
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
        <Route path="/landing"  element={<LandingPage />} />

        {/* Protected routes — wrapped in MobileShell */}
        <Route path="/*" element={
          <ProtectedRoute>
            <MobileShell>
              <Routes>
                <Route path="/"           element={<DashboardPage />} />
                <Route path="/services"   element={<ServicesPage />} />
                <Route path="/renewals"   element={<RenewalsPage />} />
                <Route path="/analytics"  element={<AnalyticsPage />} />
                <Route path="/expenses"   element={<ExpensesPage />} />
                <Route path="/goals"      element={<GoalsPage />} />
                <Route path="/reports"    element={<ReportsPage />} />
                <Route path="/settings"   element={<SettingsPage />} />
                <Route path="/add"        element={<AddServicePage />} />
                <Route path="/service/:id" element={<ServiceDetailPage />} />
                <Route path="/edit/:id"   element={<EditServicePage />} />
                <Route path="*"           element={<Navigate to="/" replace />} />
              </Routes>
            </MobileShell>
          </ProtectedRoute>
        } />
      </Routes>
      <ToastProvider />
    </div>
  );
}
