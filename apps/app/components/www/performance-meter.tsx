'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Memoized mark component for static rendering
const StaticMark = memo(
  ({ index, maxValue }: { index: number; maxValue: number }) => {
    const markAngle = (index / 10) * 180 - 90;
    const isMainMark = index % 2 === 0;
    const markLength = isMainMark ? 16 : 8;
    const markValue = (index / 10) * maxValue;

    return (
      <div
        className="absolute bottom-0 left-1/2 origin-bottom"
        key={`mark-${markValue}`}
        style={{
          height: '90%',
          transform: `translateX(-50%) rotate(${markAngle}deg)`,
        }}
      >
        <div className="w-px bg-border" style={{ height: `${markLength}px` }} />
      </div>
    );
  },
);

StaticMark.displayName = 'StaticMark';

// Static needle component
const StaticNeedle = memo(({ angle }: { angle: number }) => (
  <div
    className="absolute bottom-0 left-1/2 origin-bottom"
    style={{
      height: '100%',
      transform: `translateX(-50%) rotate(${angle}deg)`,
    }}
  >
    <div className="relative h-full w-px bg-muted-foreground" />
  </div>
));

StaticNeedle.displayName = 'StaticNeedle';

export const PerformanceMeter = memo(() => {
  const ref = useRef<HTMLDivElement>(null);

  // Speedometer configuration
  const maxValue = 100;

  // Convert percentage to degrees (-90 to 90 range)
  const percentToAngle = useCallback(
    (percent: number) => (percent / 100) * 180 - 90,
    [],
  );

  // Generate random static angle for non-animated version (85-95%)
  // Use state to avoid hydration mismatch - initialize with neutral value
  const [staticAngle, setStaticAngle] = useState(() => percentToAngle(90));

  // Set random angle only on client side after hydration
  useEffect(() => {
    setStaticAngle(percentToAngle(85 + Math.random() * 10));
  }, [percentToAngle]);

  // Memoize marks array
  const marks = useMemo(() => {
    const markCount = 11;
    return Array.from({ length: markCount }, (_, i) => (
      <StaticMark index={i} key={`mark-${i}`} maxValue={maxValue} />
    ));
  }, [maxValue]);

  return (
    <div className="relative flex h-fit w-full max-w-xs items-center justify-center">
      <div
        className="relative aspect-[2/1] w-full overflow-hidden rounded-t-full border border-b-0 bg-gradient-to-b from-foreground/5 to-transparent"
        ref={ref}
      >
        {/* Speed marks */}
        {marks}

        {/* Needle */}
        <StaticNeedle angle={staticAngle} />
        <div className="absolute right-0 bottom-0 left-0 h-5 bg-gradient-to-t from-background to-transparent" />
      </div>
    </div>
  );
});

PerformanceMeter.displayName = 'PerformanceMeter';
