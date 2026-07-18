import { useEffect, useState } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'mobile';
  if (window.innerWidth >= 1024) return 'desktop';
  if (window.innerWidth >= 768) return 'tablet';
  return 'mobile';
}

/**
 * Returns the current responsive breakpoint and updates on window resize.
 */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    const mql = {
      desktop: window.matchMedia('(min-width: 1024px)'),
      tablet:  window.matchMedia('(min-width: 768px)'),
    };

    const update = () => setBp(getBreakpoint());
    mql.desktop.addEventListener('change', update);
    mql.tablet.addEventListener('change', update);
    return () => {
      mql.desktop.removeEventListener('change', update);
      mql.tablet.removeEventListener('change', update);
    };
  }, []);

  return bp;
}
