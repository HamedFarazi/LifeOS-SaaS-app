import React from 'react';
import { BottomNav } from './bottom-nav';
import { DesktopSidebar } from './desktop-sidebar';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { useBackground } from '../store/use-background';
import styles from './mobile-shell.module.css';

export interface MobileShellProps {
  children: React.ReactNode;
}

/**
 * Responsive application shell — renders exactly ONE layout at a time.
 *
 * Mobile  (<768px)  : full-width layout, bottom nav.
 * Tablet  (768–1023px): full-width layout, no frame, bottom nav.
 * Desktop (≥1024px) : fixed sidebar + content area, no bottom nav.
 */
export function MobileShell({ children }: MobileShellProps): React.JSX.Element {
  const bp = useBreakpoint();
  const { type: bgType } = useBackground();
  const hasBg = bgType !== 'default';

  if (bp === 'desktop') {
    return (
      <div className={styles.desktopLayout} data-has-bg={hasBg || undefined}>
        <DesktopSidebar />
        <main className={styles.desktopMain}>
          <div className={styles.desktopInner}>{children}</div>
        </main>
      </div>
    );
  }

  if (bp === 'tablet') {
    return (
      <div className={styles.tabletLayout} data-has-bg={hasBg || undefined}>
        <div className={styles.tabletScroll}>
          <div className={styles.tabletInner}>{children}</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // mobile
  return (
    <div className={styles.tabletLayout} data-has-bg={hasBg || undefined}>
      <div className={styles.tabletScroll}>
        <div className={styles.tabletInner}>{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
