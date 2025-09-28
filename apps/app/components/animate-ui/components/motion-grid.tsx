'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import { type HTMLMotionProps, motion } from 'motion/react';
import * as React from 'react';

type FrameDot = [number, number];
type Frame = FrameDot[];
type Frames = Frame[];

const EMPTY_SET = new Set<number>();

type MotionGridCellProps = {
  baseClassName: string;
  activeClassName: string;
  inactiveClassName: string;
  isActive: boolean;
  transition: HTMLMotionProps<'div'>['transition'];
  cellProps?: HTMLMotionProps<'div'>;
};

const MotionGridCell = React.memo(
  ({
    baseClassName,
    activeClassName,
    inactiveClassName,
    isActive,
    transition,
    cellProps,
  }: MotionGridCellProps) => {
    const {
      className: cellPropsClassName,
      transition: userTransition,
      ...restCellProps
    } = cellProps ?? {};

    return (
      <motion.div
        {...restCellProps}
        className={cn(
          baseClassName,
          isActive ? activeClassName : inactiveClassName,
          cellPropsClassName,
        )}
        transition={userTransition ?? transition}
      />
    );
  },
  (prev, next) =>
    prev.isActive === next.isActive &&
    prev.transition === next.transition &&
    prev.baseClassName === next.baseClassName &&
    prev.activeClassName === next.activeClassName &&
    prev.inactiveClassName === next.inactiveClassName &&
    prev.cellProps === next.cellProps,
);

MotionGridCell.displayName = 'MotionGridCell';

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
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const [cols, rows] = gridSize;
  const cellCount = cols * rows;

  React.useEffect(() => {
    if (!animate || frames.length === 0) {
      return;
    }
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, duration);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [frames.length, duration, animate]);

  React.useEffect(() => {
    if (frames.length === 0) {
      setIndex(0);
      return;
    }
    setIndex((current) => {
      if (current >= frames.length) {
        return 0;
      }
      return current;
    });
  }, [frames.length]);

  const gridCells = React.useMemo(
    () => Array.from({ length: cellCount }, (_, i) => i),
    [cellCount],
  );

  const frameSets = React.useMemo(() => {
    return frames.map((frame) => {
      const set = new Set<number>();
      for (const [x, y] of frame) {
        set.add(y * cols + x);
      }
      return set;
    });
  }, [frames, cols]);

  const active = frameSets[index] ?? EMPTY_SET;

  const baseCellClassName = React.useMemo(
    () => cn('aspect-square size-3 rounded-full', cellClassName),
    [cellClassName],
  );

  const activeCellClassName = React.useMemo(
    () => cn('scale-110 bg-primary', cellActiveClassName),
    [cellActiveClassName],
  );

  const inactiveCellClassName = React.useMemo(
    () => cn('scale-100 bg-muted', cellInactiveClassName),
    [cellInactiveClassName],
  );

  const transition = React.useMemo<HTMLMotionProps<'div'>['transition']>(() => {
    const seconds = Math.max(duration / 1000, 0.01);
    return {
      duration: seconds,
      ease: 'easeInOut',
    };
  }, [duration]);

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
      {gridCells.map((cellIndex) => (
        <MotionGridCell
          activeClassName={activeCellClassName}
          baseClassName={baseCellClassName}
          cellProps={cellProps}
          inactiveClassName={inactiveCellClassName}
          isActive={active.has(cellIndex)}
          key={cellIndex}
          transition={transition}
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
