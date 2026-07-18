import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MobileShell } from './src/components/mobile-shell';
import { DashboardPage } from './src/pages/dashboard-page';
import { ServicesPage } from './src/pages/services-page';
import { RenewalsPage } from './src/pages/renewals-page';
import { AnalyticsPage } from './src/pages/analytics-page';
import { SettingsPage } from './src/pages/settings-page';
import { AddServicePage } from './src/pages/add-service-page';
import { ServiceDetailPage } from './src/pages/service-detail-page';
import { EditServicePage } from './src/pages/edit-service-page';
import { ExpensesPage } from './src/pages/expenses-page';
import { AuthPage } from './src/pages/auth-page';
import styles from './src/styles/global.module.css';
import './src/styles/reset.css';

/**
 * Root LifeOS component: applies the global theme shell and routes between
 * the five main screens plus add/detail flows inside the mobile frame.
 *
 * @returns The routed application.
 */
export function Lifeos(): React.JSX.Element {
  return (
    <div className={styles.app}>
      <MobileShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/renewals" element={<RenewalsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/add" element={<AddServicePage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="/edit/:id" element={<EditServicePage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </MobileShell>
    </div>
  );
}
