import React from 'react';
import styles from './carousel.module.css';

/**
 * Props for {@link Carousel}.
 */
export interface CarouselProps {
  children: React.ReactNode;
}

/**
 * A horizontally scrolling, snap-aligned row used for card carousels.
 *
 * @param props - The cards to render in the row.
 * @returns A horizontal carousel.
 */
export function Carousel({ children }: CarouselProps): React.JSX.Element {
  return <div className={styles.row}>{children}</div>;
}
