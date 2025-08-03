'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export interface LayoutPanelLeftIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface LayoutPanelLeftIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  svgClassName?: string;
}

const LayoutPanelLeftIcon = forwardRef<
  LayoutPanelLeftIconHandle,
  LayoutPanelLeftIconProps
>(
  (
    {
      onMouseEnter,
      onMouseLeave,
      className,
      svgClassName,
      size = 28,
      ...props
    },
    ref,
  ) => {
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
        if (!isControlledRef.current) {
          controls.start('animate');
        } else {
          onMouseEnter?.(e);
        }
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start('normal');
        } else {
          onMouseLeave?.(e);
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
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={svgClassName}
        >
          <motion.rect
            width="7"
            height="18"
            x="3"
            y="3"
            rx="1"
            initial="normal"
            animate={controls}
            variants={{
              normal: { opacity: 1, x: 0 },
              animate: {
                opacity: [0, 1],
                x: [-8, 0],
                transition: {
                  opacity: { duration: 0.6, times: [0.3, 1] },
                  duration: 0.6,
                },
              },
            }}
          />
          <motion.rect
            width="7"
            height="7"
            x="14"
            y="3"
            rx="1"
            initial="normal"
            animate={controls}
            variants={{
              normal: { opacity: 1, y: 0 },
              animate: {
                opacity: [0, 1],
                y: [-8, 0],
                transition: {
                  opacity: { duration: 0.7, times: [0.4, 1] },
                  y: { delay: 0.2 },
                  duration: 0.5,
                },
              },
            }}
          />
          <motion.rect
            width="7"
            height="7"
            x="14"
            y="14"
            rx="1"
            initial="normal"
            animate={controls}
            variants={{
              normal: { opacity: 1, y: 0 },
              animate: {
                opacity: [0, 1],
                y: [8, 0],
                transition: {
                  opacity: { duration: 0.8, times: [0.4, 1] },
                  y: { delay: 0.3 },
                  duration: 0.5,
                },
              },
            }}
          />
        </svg>
      </div>
    );
  },
);

LayoutPanelLeftIcon.displayName = 'LayoutPanelLeftIcon';

export { LayoutPanelLeftIcon };
