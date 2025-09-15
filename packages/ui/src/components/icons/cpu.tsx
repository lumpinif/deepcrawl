'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import type { Transition, Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export interface CpuIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CpuIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const transition: Transition = {
  duration: 0.5,
  ease: 'easeInOut',
  repeat: 1,
};

const yVariants: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  animate: {
    scaleY: [1, 1.5, 1],
    opacity: [1, 0.8, 1],
  },
};
const xVariants: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  animate: {
    scaleX: [1, 1.5, 1],
    opacity: [1, 0.8, 1],
  },
};

const CpuIcon = forwardRef<CpuIconHandle, CpuIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start('animate');
        }
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start('normal');
        }
      },
      [controls, onMouseLeave],
    );
    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect height="16" rx="2" width="16" x="4" y="4" />
          <rect height="6" rx="1" width="6" x="9" y="9" />
          <motion.path
            animate={controls}
            d="M15 2v2"
            transition={transition}
            variants={yVariants}
          />
          <motion.path
            animate={controls}
            d="M15 20v2"
            transition={transition}
            variants={yVariants}
          />
          <motion.path
            animate={controls}
            d="M2 15h2"
            transition={transition}
            variants={xVariants}
          />
          <motion.path
            animate={controls}
            d="M2 9h2"
            transition={transition}
            variants={xVariants}
          />
          <motion.path
            animate={controls}
            d="M20 15h2"
            transition={transition}
            variants={xVariants}
          />
          <motion.path
            animate={controls}
            d="M20 9h2"
            transition={transition}
            variants={xVariants}
          />
          <motion.path
            animate={controls}
            d="M9 2v2"
            transition={transition}
            variants={yVariants}
          />
          <motion.path
            animate={controls}
            d="M9 20v2"
            transition={transition}
            variants={yVariants}
          />
        </svg>
      </div>
    );
  },
);

CpuIcon.displayName = 'CpuIcon';

export { CpuIcon };
