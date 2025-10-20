'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Installer } from '../installer';
import { Tick } from '../tick';

// Lazy load FlickeringGrid only when needed
const FlickeringGrid = dynamic(
  () =>
    import('../flickering-grid').then((mod) => ({
      default: mod.FlickeringGrid,
    })),
  {
    ssr: false,
    loading: () => <div className="h-full w-full" />,
  },
);

export const Hero = () => (
  <section className="relative sm:grid sm:grid-cols-12 sm:divide-x">
    <Tick position={['top-left']} />
    <div className="relative col-span-12 space-y-4 overflow-hidden px-4 py-60 text-center sm:px-8 md:py-64">
      <div className="absolute inset-0 z-[-10] size-full">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-30% from-transparent to-background" />
        <Suspense fallback={<div className="h-full w-full" />}>
          <FlickeringGrid
            className="h-full w-full"
            color="#6B7280"
            flickerChance={0.15}
            fontSize={100}
            gridGap={9}
            maxOpacity={0.15}
            squareSize={3}
            text="npm i deepcrawl"
            textOffsetY={260}
          />
        </Suspense>
      </div>
      <h1 className="-translate-y-12 relative mx-auto w-fit font-semibold text-5xl leading-tight tracking-tighter md:text-6xl lg:text-7xl 2xl:text-8xl">
        Deepcrawl
      </h1>
      <p className="-translate-y-12 mx-auto max-w-2xl text-balance text-lg text-muted-foreground md:text-2xl">
        Free and open-source agentic toolkit that makes any website data AI
        ready
      </p>
      <div className="-translate-y-12 mx-auto flex w-fit flex-col items-center gap-8 pt-4">
        <Installer />
      </div>
    </div>
  </section>
);
