'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import type { Transition, Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export interface MarkdownIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MarkdownIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const transition: Transition = {
  duration: 0.6,
  ease: 'easeInOut',
};

const pathVariants: Variants = {
  normal: {
    y: 0,
    opacity: 1,
  },
  animate: {
    y: [0, 24, -20, 0],
    opacity: [1, 0, 0, 1],
  },
};

/* SOCIAL: SHARE HOW I CREATED THIS ICON */

const MarkdownIcon = forwardRef<MarkdownIconHandle, MarkdownIconProps>(
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
          {/* Letter M */}
          <motion.path d="M11 17C11 17.2652 11.1054 17.5196 11.2929 17.7071C11.4804 17.8946 11.7348 18 12 18C12.2652 18 12.5196 17.8946 12.7071 17.7071C12.8946 17.5196 13 17.2652 13 17C13 16.4176 13 15.8352 13 15.2528C13 12.6534 13 10.054 13 7.45455C12.999 7.26238 12.9721 7.07104 12.892 6.85839C12.8208 6.68154 12.7234 6.47918 12.473 6.27019C12.283 6.10769 11.9163 5.95253 11.5493 6.01229C11.1598 6.07204 10.9169 6.28792 10.7786 6.45453C10.762 6.47465 10.7168 6.53731 10.7029 6.55941C9.57794 8.35234 8.45294 10.1453 7.32794 11.9382L7.40363 11.8333C7.34997 11.8984 7.36684 11.837 7.5 11.8333C7.5874 11.8326 7.63892 11.873 7.62485 11.8631C7.62082 11.8599 7.60999 11.8499 7.59637 11.8333L7.67206 11.9382C6.54706 10.1453 5.42206 8.35234 4.29706 6.55941C4.28319 6.53731 4.23797 6.47465 4.22137 6.45453C4.08309 6.28793 3.84024 6.07204 3.45071 6.01229C3.0837 5.95253 2.71703 6.10769 2.52695 6.27019C2.27657 6.47918 2.17915 6.68154 2.10797 6.85839C2.02793 7.07104 2.00096 7.26238 2 7.45455C2 10.054 2 12.6534 2 15.2528C2 15.8352 2 16.4176 2 17C2 17.2652 2.10536 17.5196 2.29289 17.7071C2.48043 17.8946 2.73478 18 3 18C3.26522 18 3.51957 17.8946 3.70711 17.7071C3.89464 17.5196 4 17.2652 4 17C4 16.4176 4 15.8352 4 15.2528C4 12.6534 4 10.054 4 7.45455C3.99924 7.4842 3.99822 7.51224 3.97604 7.57276C3.95366 7.62279 3.92812 7.70346 3.78399 7.82578C3.67723 7.91969 3.42117 8.0343 3.1623 7.99138C2.88796 7.94822 2.74437 7.80549 2.67863 7.72729L2.60294 7.62241C3.72794 9.41534 4.85294 11.2083 5.97794 13.0012C5.99181 13.0233 6.03703 13.086 6.05363 13.1061C6.13837 13.2087 6.23601 13.3099 6.35117 13.4051C6.62289 13.6336 7.03651 13.8359 7.5 13.8333C8.17018 13.8327 8.66995 13.4464 8.94637 13.1061C8.96297 13.086 9.00819 13.0233 9.02206 13.0012C10.1471 11.2083 11.2721 9.41534 12.3971 7.62241L12.3214 7.72729C12.2556 7.80549 12.112 7.94822 11.8377 7.99138C11.5788 8.0343 11.3228 7.91969 11.216 7.82578C11.0719 7.70346 11.0463 7.62279 11.024 7.57276C11.0018 7.51224 11.0008 7.4842 11 7.45455C11 10.054 11 12.6534 11 15.2528C11 15.8352 11 16.4176 11 17Z" />
          {/* Arrow */}
          <motion.path
            animate={controls}
            d="M19 7V17M19 17L22 14M19 17L16 14"
            transition={transition}
            variants={pathVariants}
          />
        </svg>
      </div>
    );
  },
);

MarkdownIcon.displayName = 'MarkdownIcon';

export { MarkdownIcon };
