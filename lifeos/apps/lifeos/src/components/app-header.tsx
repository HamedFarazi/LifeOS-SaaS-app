import React, { useState } from 'react';
import { useSettings } from '../store/use-settings';
import { UserAvatar } from './user-avatar';
import { SidebarDrawer } from './sidebar-drawer';
import { QuickActionsSheet } from './quick-actions-sheet';
import styles from './app-header.module.css';

/**
 * Top header with a hamburger menu that opens the sidebar drawer, a Persian
 * greeting, and a user avatar that opens the Quick Actions bottom sheet.
 *
 * @returns The home screen header.
 */
export function AppHeader(): React.JSX.Element {
  const userName = useSettings((s) => s.userName);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <button
          className={styles.menu}
          type="button"
          aria-label="منو"
          onClick={() => setDrawerOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={styles.greeting}>
          <p className={styles.hi}>
            سلام، {userName} <span className={styles.wave}>👋</span>
          </p>
          <p className={styles.sub}>خوش آمدی به LifeOS</p>
        </div>
        <UserAvatar
          size={48}
          onClick={() => setSheetOpen(true)}
          ariaLabel="عملیات سریع"
          ariaExpanded={sheetOpen}
        />
      </header>

      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <QuickActionsSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
