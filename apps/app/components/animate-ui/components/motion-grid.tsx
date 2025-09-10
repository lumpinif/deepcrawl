'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import { type HTMLMotionProps, motion } from 'motion/react';
import * as React from 'react';

type FrameDot = [number, number];
type Frame = FrameDot[];
type Frames = Frame[];

type MotionGridProps = {
  gridSize: [number, number];
  frames: Frames;
  duration?: number;
  animate?: boolean;
  cellClassName?: string;
  cellProps?: HTMLMotionProps<'div'>;
  cellActiveClassName?: string;
  cellInactiveClassName?: string;
} & React.ComponentProps<'div'>;

const MotionGrid = ({
  gridSize,
  frames,
  duration = 200,
  animate = true,
  cellClassName,
  cellProps,
  cellActiveClassName,
  cellInactiveClassName,
  className,
  style,
  ...props
}: MotionGridProps) => {
  const [index, setIndex] = React.useState(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!animate || frames.length === 0) return;
    intervalRef.current = setInterval(
      () => setIndex((i) => (i + 1) % frames.length),
      duration,
    );
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [frames.length, duration, animate]);

  const [cols, rows] = gridSize;

  const active = new Set<number>(
    frames[index]?.map(([x, y]) => y * cols + x) ?? [],
  );

  return (
    <div
      className={cn('grid w-fit gap-0.5', className)}
      style={{
        ...style,
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridAutoRows: '1fr',
      }}
      {...props}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <motion.div
          className={cn(
            'aspect-square size-3 rounded-full',
            active.has(i)
              ? cn('scale-110 bg-primary', cellActiveClassName)
              : cn('scale-100 bg-muted', cellInactiveClassName),
            cellClassName,
          )}
          key={i}
          {...cellProps}
          transition={{ duration, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

export {
  MotionGrid,
  type MotionGridProps,
  type FrameDot,
  type Frame,
  type Frames,
};
