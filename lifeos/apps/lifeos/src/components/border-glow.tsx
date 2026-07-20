/**
 * BorderGlow — React Bits edge-proximity glow card
 * Source: https://reactbits.dev/components/border-glow
 */
import { useRef, useCallback, useEffect } from 'react';
import './border-glow.css';

function parseHSL(s: string) {
  const m = s.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!m) return { h: 40, s: 80, l: 80 };
  return { h: +m[1], s: +m[2], l: +m[3] };
}

function buildGlowVars(glowColor: string, intensity: number): Record<string, string> {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const ops = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const v: Record<string, string> = {};
  for (let i = 0; i < ops.length; i++) {
    v[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(ops[i] * intensity, 100)}%)`;
  }
  return v;
}

const G_POS  = ['80% 55%','69% 34%','8% 6%','41% 38%','86% 85%','82% 18%','51% 4%'];
const G_KEYS = ['--gradient-one','--gradient-two','--gradient-three','--gradient-four','--gradient-five','--gradient-six','--gradient-seven'];
const C_MAP  = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]): Record<string, string> {
  const v: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(C_MAP[i], colors.length - 1)];
    v[G_KEYS[i]] = `radial-gradient(at ${G_POS[i]}, ${c} 0px, transparent 50%)`;
  }
  v['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return v;
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn  = (x: number) => x * x * x;

function animVal({ start = 0, end = 100, duration = 1000, delay = 0,
  ease = easeOut, onUpdate, onEnd }: {
  start?: number; end?: number; duration?: number; delay?: number;
  ease?: (t: number) => number;
  onUpdate: (v: number) => void; onEnd?: () => void;
}) {
  const t0 = performance.now() + delay;
  const tick = () => {
    const t = Math.min((performance.now() - t0) / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else onEnd?.();
  };
  setTimeout(() => requestAnimationFrame(tick), delay);
}

export interface BorderGlowProps {
  children?: React.ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
  style?: React.CSSProperties;
}

export default function BorderGlow({
  children, className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#111827',
  borderRadius = 14,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ['#3b82f6', '#06b6d4', '#8b5cf6'],
  fillOpacity = 0.4,
  style,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const center = useCallback((el: HTMLElement): [number, number] => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const proximity = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = center(el);
    const dx = x - cx, dy = y - cy;
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }, [center]);

  const angle = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = center(el);
    const deg = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
    return deg < 0 ? deg + 360 : deg;
  }, [center]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const card = cardRef.current; if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    card.style.setProperty('--edge-proximity', `${(proximity(card, x, y) * 100).toFixed(3)}`);
    card.style.setProperty('--cursor-angle',   `${angle(card, x, y).toFixed(3)}deg`);
  }, [proximity, angle]);

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const card = cardRef.current;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', '110deg');
    animVal({ duration: 500,  onUpdate: v => card.style.setProperty('--edge-proximity', `${v}`) });
    animVal({ ease: easeIn,   duration: 1500, end: 50,  onUpdate: v => card.style.setProperty('--cursor-angle', `${355 * (v/100) + 110}deg`) });
    animVal({ ease: easeOut,  delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => card.style.setProperty('--cursor-angle', `${355 * (v/100) + 110}deg`) });
    animVal({ ease: easeIn,   delay: 2500, duration: 1500, start: 100, end: 0,
      onUpdate: v => card.style.setProperty('--edge-proximity', `${v}`),
      onEnd: () => card.classList.remove('sweep-active') });
  }, [animated]);

  const glowVars = buildGlowVars(glowColor, glowIntensity);

  return (
    <div
      ref={cardRef}
      onPointerMove={onPointerMove}
      className={`border-glow-card ${className}`}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...glowVars,
        ...buildGradientVars(colors),
        ...style,
      } as React.CSSProperties}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
