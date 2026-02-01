'use client';

import DottedMap from 'dotted-map';

export function DottedWorldMap() {
  return (
    <div
      aria-hidden
      className="fade-in-0 will-change relative size-full size-full transform-gpu animate-in overflow-hidden rounded-xl opacity-100 transition-opacity duration-700"
    >
      <div className="absolute inset-0 z-10 m-auto size-fit">
        <div className="relative z-[1] flex size-fit w-fit items-center gap-2 rounded-[--radius] border bg-background px-3 py-1 font-medium text-xs shadow-black/5 shadow-md dark:bg-muted">
          <span className="text-sm">🇫🇷</span> Last connection from Paris, France
        </div>
        <div className="absolute inset-2 -bottom-2 mx-auto rounded-[--radius] border bg-background px-3 py-4 font-medium text-xs shadow-black/5 shadow-md dark:bg-zinc-900" />
      </div>

      <div className="relative flex size-full items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(circle_at_center,transparent_30%,color-mix(in_oklch,var(--color-background)_85%,transparent)_68%,var(--color-background)_100%)]" />
        <Map />
      </div>
    </div>
  );
}

const map = new DottedMap({ height: 55, grid: 'diagonal' });

const points = map.getPoints();

const mapBounds = points.reduce(
  (bounds, point) => ({
    minX: Math.min(bounds.minX, point.x),
    maxX: Math.max(bounds.maxX, point.x),
    minY: Math.min(bounds.minY, point.y),
    maxY: Math.max(bounds.maxY, point.y),
  }),
  {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  },
);

const mapDimensions = {
  width: mapBounds.maxX - mapBounds.minX,
  height: mapBounds.maxY - mapBounds.minY,
};

const svgOptions = {
  backgroundColor: 'var(--color-background)',
  color: 'currentColor',
  radius: 0.2,
};

const viewBox = `${mapBounds.minX} ${mapBounds.minY} ${mapDimensions.width} ${mapDimensions.height}`;

const Map = () => {
  return (
    <svg
      className="mx-auto block h-auto w-full max-w-4xl text-muted-foreground dark:text-muted-foreground/60"
      preserveAspectRatio="xMidYMid meet"
      style={{ background: svgOptions.backgroundColor }}
      viewBox={viewBox}
    >
      {points.map((point, index) => (
        <circle
          cx={point.x}
          cy={point.y}
          fill={svgOptions.color}
          key={index}
          r={svgOptions.radius}
        />
      ))}
    </svg>
  );
};
