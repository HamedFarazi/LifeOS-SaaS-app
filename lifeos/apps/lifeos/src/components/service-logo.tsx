import React from 'react';
import type { Service } from '../types/index';
import styles from './service-logo.module.css';

/**
 * Props for {@link ServiceLogo}.
 */
export interface ServiceLogoProps {
  service: Service;
  /** Pixel size of the square logo tile. */
  size?: number;
}

/**
 * Renders a rounded brand tile for a service using its color and short mark.
 *
 * @param props - The service and optional size.
 * @returns A colored logo tile.
 */
export function ServiceLogo({ service, size = 56 }: ServiceLogoProps): React.JSX.Element {
  const mark = service.logoText ?? service.name.charAt(0);
  return (
    <div
      className={styles.logo}
      style={{
        width: size,
        height: size,
        background: service.color,
        fontSize: size * 0.36,
        borderRadius: size * 0.32,
      }}
      aria-hidden
    >
      <span className={styles.mark}>{mark}</span>
    </div>
  );
}
