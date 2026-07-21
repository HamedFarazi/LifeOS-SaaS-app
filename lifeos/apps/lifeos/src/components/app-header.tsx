import React, { useRef, useState } from 'react';
import { IconMenu2, IconSearch } from '@tabler/icons-react';
import { useSettings } from '../store/use-settings';
import { useT } from '../hooks/use-t';
import { UserAvatar } from './user-avatar';
import { SidebarDrawer } from './sidebar-drawer';
import { QuickActionsSheet } from './quick-actions-sheet';
import { GlobalSearch } from './global-search';
import { useBreakpoint } from '../hooks/use-breakpoint';
import styles from './app-header.module.css';

export function AppHeader(): React.JSX.Element {
  const userName = useSettings((s) => s.userName);
  const bp = useBreakpoint();
  const t  = useT();
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [sheetOpen, setSheetOpen]     = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const isDesktop = bp === 'desktop';

  return (
    <>
      <header className={styles.header}>
        {!isDesktop && (
          <button className={styles.icon} type="button" aria-label="منو" onClick={() => setDrawerOpen(true)}>
            <IconMenu2 size={18} stroke={1.8} />
          </button>
        )}
        <div className={styles.greeting}>
          <p className={styles.hi}>{t('welcomeBack')} {userName}</p>
          {!isDesktop && <p className={styles.sub}>Trackly</p>}
        </div>
        {!isDesktop && (
          <>
            <button type="button" className={styles.icon} onClick={() => setSearchOpen(true)} aria-label="جستجو">
              <IconSearch size={17} stroke={1.8} />
            </button>
            <UserAvatar ref={avatarRef} size={34} onClick={() => setSheetOpen((v) => !v)}
              ariaLabel="عملیات سریع" ariaExpanded={sheetOpen} />
          </>
        )}
      </header>
      {!isDesktop && (
        <>
          <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <QuickActionsSheet open={sheetOpen} onClose={() => setSheetOpen(false)}
            anchorRef={avatarRef as React.RefObject<HTMLElement>} />
          {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
        </>
      )}
    </>
  );
}
