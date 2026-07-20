import React from 'react';
import type { Service } from '../types/index';
import { getServiceLogo } from '../lib/services-logos';
import styles from './service-logo.module.css';

export interface ServiceLogoProps {
  service: Service;
  size?: number;
}

export function ServiceLogo({ service, size = 56 }: ServiceLogoProps): React.JSX.Element {
  const radius = size * 0.32;

  // Priority: 1) user-uploaded, 2) default logo map, 3) colored tile with text
  const imgSrc = service.logoImage || getServiceLogo(service.id, service.name) || undefined;

  return (
    <div
      className={styles.logo}
      style={{
        width: size,
        height: size,
        background: imgSrc ? 'transparent' : service.color,
        fontSize: size * 0.36,
        borderRadius: radius,
      }}
      aria-hidden
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={service.name}
          className={styles.img}
          style={{ borderRadius: radius }}
          onError={(e) => {
            // If image fails to load, hide it so the fallback tile shows
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span className={styles.mark}>{service.logoText ?? service.name.charAt(0)}</span>
      )}
    </div>
  );
}
