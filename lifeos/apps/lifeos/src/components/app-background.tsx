/**
 * AppBackground — renders the selected background behind the app shell.
 * Reads from useBackground store and shows the appropriate component or image.
 */
import React, { Suspense, lazy } from 'react';
import { useBackground } from '../store/use-background';
import styles from './app-background.module.css';

const Ballpit = lazy(() => import('./ballpit'));
const Hyperspeed = lazy(() => import('./hyperspeed'));
const Galaxy = lazy(() => import('./galaxy'));

export function AppBackground(): React.JSX.Element | null {
  const { type, imageUrl } = useBackground();

  if (type === 'default') return null;

  return (
    <div className={styles.root} aria-hidden="true">
      {type === 'image' && imageUrl && (
        <div
          className={styles.imageBg}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {type === 'ballpit' && (
        <Suspense fallback={null}>
          <div className={styles.canvasBg}>
            <Ballpit
              count={120}
              gravity={0}
              friction={0.98}
              wallBounce={0.95}
              followCursor
              colors={[0x2563eb, 0x3b82f6, 0x06b6d4, 0x1d4ed8]}
              minSize={0.4}
              maxSize={0.9}
            />
          </div>
        </Suspense>
      )}

      {type === 'hyperspeed' && (
        <Suspense fallback={null}>
          <div className={styles.canvasBg}>
            <Hyperspeed />
          </div>
        </Suspense>
      )}

      {type === 'galaxy' && (
        <Suspense fallback={null}>
          <div className={styles.canvasBg}>
            <Galaxy count={1200} maxSize={80} color={0x3b82f6} />
          </div>
        </Suspense>
      )}

      {/* Overlay to keep content readable */}
      <div className={styles.overlay} />
    </div>
  );
}
