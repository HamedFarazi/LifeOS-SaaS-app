import React from 'react';
import { useSettings } from '../store/use-settings';
import styles from './user-avatar.module.css';

export interface UserAvatarProps {
  size?: number;
  showStatus?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  ariaExpanded?: boolean;
}

/**
 * Circular profile avatar with optional status dot and click handler.
 * Forwards ref to the underlying button element for dropdown anchoring.
 */
export const UserAvatar = React.forwardRef<HTMLButtonElement, UserAvatarProps>(
  function UserAvatar(
    { size = 48, showStatus = true, onClick, ariaLabel, ariaExpanded },
    ref
  ) {
    const userName = useSettings((s) => s.userName);
    const avatarImage = useSettings((s) => s.avatarImage);

    const inner = avatarImage ? (
      <img key={avatarImage} className={styles.img} src={avatarImage} alt={userName} />
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
          <i className={styles.dot} style={{ width: dotSize, height: dotSize }} />
        ) : null}
      </>
    );

    if (onClick) {
      return (
        <button
          ref={ref}
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
);
