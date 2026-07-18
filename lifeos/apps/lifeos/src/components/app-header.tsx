import React, { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useSettings } from '../store/use-settings';
import { UserAvatar } from './user-avatar';
import { SidebarDrawer } from './sidebar-drawer';
import { QuickActionsSheet } from './quick-actions-sheet';
import { GlobalSearch } from './global-search';
import { useBreakpoint } from '../hooks/use-breakpoint';
import styles from './app-header.module.css';

/**
 * Top header.
 * Mobile/Tablet: hamburger + greeting + search + avatar
 * Desktop: greeting only (sidebar handles nav + search)
 */
export function AppHeader(): React.JSX.Element {
  const userName = useSettings((s) => s.userName);
  const bp = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const isDesktop = bp === 'desktop';

  return (
    <>
      <header className={styles.header}>
        {!isDesktop && (
          <button className={styles.menu} type="button" aria-label="منو" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
        )}

        <div className={styles.greeting}>
          <p className={styles.hi}>سلام، {userName}</p>
          {!isDesktop && <p className={styles.sub}>خوش آمدی به LifeOS</p>}
        </div>

        {!isDesktop && (
          <>
            <button type="button" className={styles.searchBtn} onClick={() => setSearchOpen(true)} aria-label="جستجو">
              <Search size={18} strokeWidth={1.8} />
            </button>
            <UserAvatar
              ref={avatarRef}
              size={42}
              onClick={() => setSheetOpen((v) => !v)}
              ariaLabel="عملیات سریع"
              ariaExpanded={sheetOpen}
            />
          </>
        )}
      </header>

      {!isDesktop && (
        <>
          <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <QuickActionsSheet open={sheetOpen} onClose={() => setSheetOpen(false)} anchorRef={avatarRef as React.RefObject<HTMLElement>} />
          {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
        </>
      )}
    </>
  );
}
