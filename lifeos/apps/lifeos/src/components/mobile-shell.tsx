import React from 'react';
import { BottomNav } from './bottom-nav';
import styles from './mobile-shell.module.css';

/**
 * Props for {@link MobileShell}.
 */
export interface MobileShellProps {
  children: React.ReactNode;
}

/**
 * Centers the app inside a 390×844 phone frame on larger screens and renders
 * the persistent bottom navigation.
 *
 * The scroll area has NO horizontal padding — each page/section adds its own
 * padding so carousels can extend full-bleed to the frame edge.
 *
 * @param props - The page content.
 * @returns The mobile app frame.
 */
export function MobileShell({ children }: MobileShellProps): React.JSX.Element {
  return (
    <div className={styles.stage}>
      <div className={styles.frame}>
        <div className={styles.scroll}>
          <div className={styles.inner}>{children}</div>
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
