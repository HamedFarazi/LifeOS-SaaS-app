import React from 'react';
import type { Service } from '../types/index';
import styles from './service-logo.module.css';

export interface ServiceLogoProps {
  service: Service;
  size?: number;
}

export function ServiceLogo({ service, size = 56 }: ServiceLogoProps): React.JSX.Element {
  const radius = size * 0.32;

  return (
    <div
      className={styles.logo}
      style={{
        width: size,
        height: size,
        background: service.logoImage ? 'transparent' : service.color,
        fontSize: size * 0.36,
        borderRadius: radius,
      }}
      aria-hidden
    >
      {service.logoImage ? (
        <img src={service.logoImage} alt={service.name} className={styles.img} style={{ borderRadius: radius }} />
      ) : (
        <span className={styles.mark}>{service.logoText ?? service.name.charAt(0)}</span>
      )}
    </div>
  );
}
