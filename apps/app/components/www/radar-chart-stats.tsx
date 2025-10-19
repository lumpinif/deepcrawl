'use client';

import { memo, useMemo } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './radar-chart';

// Move static data outside component to prevent recreation on each render
const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 273 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

// Memoize filter ID to prevent recreation
const FILTER_ID = 'stroke-line-glow';

// Memoize SVG filter definition outside component
const GlowFilter = memo(() => (
  <defs>
    <filter height="140%" id={FILTER_ID} width="140%" x="-20%" y="-20%">
      <feGaussianBlur result="blur" stdDeviation="10" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
));

GlowFilter.displayName = 'GlowFilter';

// Memoize tooltip content to prevent unnecessary re-renders
const MemoizedTooltipContent = memo(ChartTooltipContent);
MemoizedTooltipContent.displayName = 'MemoizedTooltipContent';

function GlowingStrokeRadarChart() {
  // Memoize filter URL to prevent string recreation
  const filterUrl = useMemo(() => `url(#${FILTER_ID})`, []);

  return (
    <div className="h-fit w-full">
      <ChartContainer
        className="mx-auto aspect-square max-h-[250px]"
        config={chartConfig}
      >
        <RadarChart data={chartData}>
          <ChartTooltip content={<MemoizedTooltipContent />} cursor={false} />
          <PolarAngleAxis dataKey="month" />
          <PolarGrid strokeDasharray="3 3" />
          <Radar
            dataKey="desktop"
            fill="none"
            filter={filterUrl}
            stroke="var(--color-desktop)"
          />
          <GlowFilter />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}

// Memoize entire component to prevent unnecessary re-renders
export default memo(GlowingStrokeRadarChart);
