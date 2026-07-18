import React from 'react';
import { useSettings } from '../store/use-settings';
import styles from './user-avatar.module.css';

/**
 * Props for {@link UserAvatar}.
 */
export interface UserAvatarProps {
  /** Pixel size of the circular avatar. */
  size?: number;
  /** Whether to render the cyan online status dot. */
  showStatus?: boolean;
  /** Optional click handler (renders as a button when provided). */
  onClick?: () => void;
  /** Accessible label / aria attributes passthrough. */
  ariaLabel?: string;
  ariaExpanded?: boolean;
}

/**
 * Circular profile avatar that shows the uploaded profile image from
 * LocalStorage, falling back to the user's initial. Includes an optional
 * cyan online indicator and a smooth fade when the image changes.
 *
 * @param props - Sizing, status, and interaction options.
 * @returns The avatar element.
 */
export function UserAvatar({
  size = 48,
  showStatus = true,
  onClick,
  ariaLabel,
  ariaExpanded,
}: UserAvatarProps): React.JSX.Element {
  const userName = useSettings((s) => s.userName);
  const avatarImage = useSettings((s) => s.avatarImage);

  const inner = avatarImage ? (
    <img
      key={avatarImage}
      className={styles.img}
      src={avatarImage}
      alt={userName}
    />
  ) : (
    <span className={styles.initial} style={{ fontSize: size * 0.38 }}>
      {userName.charAt(0)}
    </span>
  );

  const dotSize = Math.max(10, size * 0.25);
  const style: React.CSSProperties = { width: size, height: size };

  const content = (
    <>
      {inner}
      {showStatus ? (
        <i
          className={styles.dot}
          style={{ width: dotSize, height: dotSize }}
        />
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        className={styles.avatar}
        style={style}
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={ariaExpanded}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={styles.avatar} style={style} aria-label={ariaLabel}>
      {content}
    </div>
  );
}
