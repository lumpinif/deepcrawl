'use client';

import DottedMap from 'dotted-map';

export function DottedWorldMap() {
  return (
    <div aria-hidden className="relative h-fit w-full max-w-lg">
      <div className="absolute inset-0 z-10 m-auto size-fit">
        <div className="relative z-[1] flex size-fit w-fit items-center gap-2 rounded-[--radius] border bg-background px-3 py-1 font-medium text-xs shadow-black/5 shadow-md dark:bg-muted">
          <span className="text-lg">🇨🇩</span> Last connection from DR Congo
        </div>
        <div className="-bottom-2 absolute inset-2 mx-auto rounded-[--radius] border bg-background px-3 py-4 font-medium text-xs shadow-black/5 shadow-md dark:bg-zinc-900" />
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-1 from-transparent to-75% to-background [background-image:radial-gradient(var(--tw-gradient-stops))]" />
        <Map />
      </div>
    </div>
  );
}

const map = new DottedMap({ height: 55, grid: 'diagonal' });

const points = map.getPoints();

const svgOptions = {
  backgroundColor: 'var(--color-background)',
  color: 'currentColor',
  radius: 0.1,
};

const Map = () => {
  const viewBox = '0 0 120 60';
  return (
    <svg style={{ background: svgOptions.backgroundColor }} viewBox={viewBox}>
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
