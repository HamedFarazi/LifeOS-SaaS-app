/**
 * PixelCard — React Bits animated pixel hover card
 * Source: https://reactbits.dev/components/pixel-card
 */
import { useEffect, useRef } from 'react';
import './pixel-card.css';

class Pixel {
  width: number; height: number; ctx: CanvasRenderingContext2D;
  x: number; y: number; color: string; speed: number;
  size: number; sizeStep: number; minSize: number;
  maxSizeInteger: number; maxSize: number;
  delay: number; counter: number; counterStep: number;
  isIdle: boolean; isReverse: boolean; isShimmer: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number, y: number,
    color: string, speed: number, delay: number
  ) {
    this.width  = canvas.width;
    this.height = canvas.height;
    this.ctx    = context;
    this.x = x; this.y = y; this.color = color;
    this.speed = this.rand(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.rand(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false; this.isReverse = false; this.isShimmer = false;
  }

  rand(min: number, max: number) { return Math.random() * (max - min) + min; }

  draw() {
    const off = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + off, this.y + off, this.size, this.size);
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) { this.counter += this.counterStep; return; }
    if (this.size >= this.maxSize) this.isShimmer = true;
    if (this.isShimmer) this.shimmer(); else this.size += this.sizeStep;
    this.draw();
  }

  disappear() {
    this.isShimmer = false; this.counter = 0;
    if (this.size <= 0) { this.isIdle = true; return; }
    this.size -= 0.1;
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true;
    else if (this.size <= this.minSize) this.isReverse = false;
    if (this.isReverse) this.size -= this.speed; else this.size += this.speed;
  }
}

function getSpeed(value: number, reduced: boolean) {
  if (value <= 0 || reduced) return 0;
  if (value >= 100) return 0.1;
  return value * 0.001;
}

const VARIANTS: Record<string, { activeColor: string | null; gap: number; speed: number; colors: string; noFocus: boolean }> = {
  default: { activeColor: null,      gap: 5,  speed: 35, colors: '#f8fafc,#f1f5f9,#cbd5e1', noFocus: false },
  blue:    { activeColor: '#e0f2fe', gap: 10, speed: 25, colors: '#e0f2fe,#7dd3fc,#0ea5e9', noFocus: false },
  yellow:  { activeColor: '#fef08a', gap: 3,  speed: 20, colors: '#fef08a,#fde047,#eab308', noFocus: false },
  pink:    { activeColor: '#fecdd3', gap: 6,  speed: 80, colors: '#fecdd3,#fda4af,#e11d48', noFocus: true  },
};

export interface PixelCardProps {
  variant?: 'default' | 'blue' | 'yellow' | 'pink';
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function PixelCard({
  variant = 'default',
  gap, speed, colors, noFocus,
  className = '',
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const pixelsRef    = useRef<Pixel[]>([]);
  const rafRef       = useRef<number>(0);
  const prevTimeRef  = useRef(performance.now());
  const reduced      = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches).current;

  const cfg      = VARIANTS[variant] ?? VARIANTS.default;
  const fGap     = gap     ?? cfg.gap;
  const fSpeed   = speed   ?? cfg.speed;
  const fColors  = colors  ?? cfg.colors;
  const fNoFocus = noFocus ?? cfg.noFocus;

  const initPixels = () => {
    const container = containerRef.current, canvas = canvasRef.current;
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width), h = Math.floor(rect.height);
    const ctx = canvas.getContext('2d')!;
    canvas.width = w; canvas.height = h;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;

    const palette = fColors.split(',');
    const pxs: Pixel[] = [];
    for (let x = 0; x < w; x += fGap) {
      for (let y = 0; y < h; y += fGap) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        const dist  = Math.sqrt((x - w/2)**2 + (y - h/2)**2);
        pxs.push(new Pixel(canvas, ctx, x, y, color, getSpeed(fSpeed, reduced), reduced ? 0 : dist));
      }
    }
    pixelsRef.current = pxs;
  };

  const doAnimate = (fn: 'appear' | 'disappear') => {
    rafRef.current = requestAnimationFrame(() => doAnimate(fn));
    const now = performance.now();
    if (now - prevTimeRef.current < 1000/60) return;
    prevTimeRef.current = now;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let allIdle = true;
    for (const px of pixelsRef.current) { px[fn](); if (!px.isIdle) allIdle = false; }
    if (allIdle) cancelAnimationFrame(rafRef.current);
  };

  const animate = (fn: 'appear' | 'disappear') => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => doAnimate(fn));
  };

  useEffect(() => {
    initPixels();
    const ro = new ResizeObserver(initPixels);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => { ro.disconnect(); cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fGap, fSpeed, fColors, fNoFocus]);

  return (
    <div
      ref={containerRef}
      className={`pixel-card ${className}`}
      onMouseEnter={() => animate('appear')}
      onMouseLeave={() => animate('disappear')}
      onFocus={fNoFocus ? undefined : (e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) animate('appear'); }}
      onBlur={fNoFocus  ? undefined : (e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) animate('disappear'); }}
      tabIndex={fNoFocus ? -1 : 0}
    >
      <canvas className="pixel-canvas" ref={canvasRef} />
      {children}
    </div>
  );
}
