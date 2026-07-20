/**
 * BackgroundBoxes — Aceternity UI inspired animated grid
 * Adapted from: https://ui.aceternity.com/components/background-boxes
 * No Tailwind / cn dependency — pure CSS-in-JS with framer-motion
 */
import React, { memo } from 'react';
import { motion } from 'framer-motion';

const COLORS = [
  'rgb(125 211 252)', // sky-300
  'rgb(249 168 212)', // pink-300
  'rgb(134 239 172)', // green-300
  'rgb(253 224 71)',  // yellow-300
  'rgb(252 165 165)', // red-300
  'rgb(216 180 254)', // purple-300
  'rgb(147 197 253)', // blue-300
  'rgb(165 180 252)', // indigo-300
  'rgb(196 181 253)', // violet-300
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const ROWS = 150;
const COLS = 100;

function BackgroundBoxesCore({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        transform:
          'translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)',
        position: 'absolute',
        left: '25%',
        top: '-25%',
        display: 'flex',
        padding: '16px',
        width: '100%',
        height: '100%',
        zIndex: 0,
        ...style,
      }}
    >
      {Array.from({ length: ROWS }).map((_, i) => (
        <motion.div
          key={`row-${i}`}
          style={{
            width: 64,
            height: 32,
            borderLeft: '1px solid rgb(51 65 85)', // slate-700
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {Array.from({ length: COLS }).map((_, j) => (
            <motion.div
              key={`col-${j}`}
              style={{
                width: 64,
                height: 32,
                borderRight: '1px solid rgb(51 65 85)',
                borderTop: '1px solid rgb(51 65 85)',
                position: 'relative',
                cursor: 'default',
              }}
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  style={{
                    position: 'absolute',
                    height: 24,
                    width: 40,
                    top: -14,
                    left: -22,
                    color: 'rgb(51 65 85)',
                    strokeWidth: 1,
                    pointerEvents: 'none',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

export const BackgroundBoxes = memo(BackgroundBoxesCore);
