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
};

const innerRectVariants: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  animate: {
    rotate: [0, 180, 0],
    scale: [1, 0, 1],
  },
};

const outerRectVariants: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
  animate: {
    rotate: [0, -180, 0],
    scale: [1, 0, 1],
    opacity: [1, 0, 1],
    filter: ['blur(0px)', 'blur(0px)', 'blur(0px)'],
  },
};

const yTVariants: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  animate: {
    y: [0, 7, 0],
    scaleY: [1, 4, 1],
    rotate: [0, 180, 0],
  },
};

const yBVariants: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  animate: {
    y: [0, -7, 0],
    scaleY: [1, 4, 1],
    rotate: [0, -180, 0],
  },
};

const xRVariants: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  animate: {
    x: [0, -7, 0],
    scaleX: [1, 4, 1],
    rotate: [0, 180, 0],
  },
};

const xLVariants: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  animate: {
    x: [0, 7, 0],
    scaleX: [1, 4, 1],
    rotate: [0, -180, 0],
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
          <motion.rect
            animate={controls}
            height="16"
            rx="2"
            transition={transition}
            variants={outerRectVariants}
            width="16"
            x="4"
            y="4"
          />
          <motion.rect
            animate={controls}
            height="6"
            rx="1"
            transition={transition}
            variants={innerRectVariants}
            width="6"
            x="9"
            y="9"
          />

          <motion.path
            animate={controls}
            d="M15 2v2"
            transition={transition}
            variants={yTVariants}
          />
          <motion.path
            animate={controls}
            d="M9 2v2"
            transition={transition}
            variants={yTVariants}
          />

          <motion.path
            animate={controls}
            d="M2 15h2"
            transition={transition}
            variants={xLVariants}
          />
          <motion.path
            animate={controls}
            d="M2 9h2"
            transition={transition}
            variants={xLVariants}
          />

          <motion.path
            animate={controls}
            d="M20 15h2"
            transition={transition}
            variants={xRVariants}
          />
          <motion.path
            animate={controls}
            d="M20 9h2"
            transition={transition}
            variants={xRVariants}
          />

          <motion.path
            animate={controls}
            d="M15 20v2"
            transition={transition}
            variants={yBVariants}
          />
          <motion.path
            animate={controls}
            d="M9 20v2"
            transition={transition}
            variants={yBVariants}
          />
        </svg>
      </div>
    );
  },
);

CpuIcon.displayName = 'CpuIcon';

export { CpuIcon };
