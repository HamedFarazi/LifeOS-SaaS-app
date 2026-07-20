/**
 * ContainerScroll — Aceternity UI inspired scroll-driven 3D card
 * No Tailwind / Next.js — pure framer-motion + inline styles
 */
import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';

interface ContainerScrollProps {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}

export function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const rotate   = useTransform(scrollYProgress, [0, 0.5], [18, 0]);
  const scale    = useTransform(scrollYProgress, [0, 0.5], isMobile ? [0.7, 0.95] : [1.04, 1]);
  const translateY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <div
      ref={containerRef}
      style={{
        height: isMobile ? '52rem' : '72rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: isMobile ? '8px' : '80px 20px',
      }}
    >
      <div style={{ width: '100%', position: 'relative', perspective: '1000px' }}>
        {/* Title */}
        <motion.div
          style={{ translateY: translateY, textAlign: 'center', marginBottom: 40 }}
        >
          {titleComponent}
        </motion.div>

        {/* 3D Card */}
        <ScrollCard rotate={rotate} scale={scale}>
          {children}
        </ScrollCard>
      </div>
    </div>
  );
}

function ScrollCard({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        maxWidth: 1100,
        margin: '-40px auto 0',
        width: '100%',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '6px',
        background: '#1a1a2e',
        boxShadow: [
          '0 0 #0000004d',
          '0 9px 20px #0000004a',
          '0 37px 37px #00000042',
          '0 84px 50px #00000026',
          '0 149px 60px #0000000a',
          '0 0 60px rgba(59,130,246,0.08)',
        ].join(', '),
        transformOrigin: 'top center',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 18,
          background: '#0D1117',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
