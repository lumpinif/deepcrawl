'use client';

import { Label } from '@deepcrawl/ui/components/ui/label';
import type { LinksTree } from 'deepcrawl/types';
import { useState } from 'react';
import { extractLinksResponseSample } from '@/lib/response-samples';
import { TreeViewCard } from '../playground/response-area/content-tabs';
import { CpuArchitecture } from './cpu-architecture';
import DisplayCards from './display-cards';
import { DottedWorldMap } from './dotted-map';
// import { PerformanceMeter } from './performance-meter';
// import GlowingStrokeRadarChart from './radar-chart-stats';
import { TiltedScroll } from './tilted-scroll';

const VALUE_ITEMS = [
  {
    label: 'Lightning Fast',
    title: 'Better Performance by Default',
    description:
      'Edge-native workers on V8 engine — the same engine used by Chromium and Node.js — deliver results in milliseconds without headless browsers or virtual DOM overhead, with Deepcrawl specially optimized parsers.',
    illustration: <DisplayCards />,
  },
  {
    label: 'Optimized for LLMs',
    title: 'Optimized for LLM pipelines',
    description:
      "Deepcrawl's Links-tree intelligence helps agents strategically plan next steps while optimizing token usage for superior context management, outperforming manifests like llms.txt or traditional sitemap.xml.",
    illustration: (
      <div className="fade-in-0 will-change size-full transform-gpu animate-in overflow-hidden rounded-xl border bg-background-subtle pb-10 opacity-100 not-dark:shadow-md transition-opacity duration-700">
        <TreeViewCard
          content={
            extractLinksResponseSample.data &&
            'tree' in extractLinksResponseSample.data
              ? extractLinksResponseSample.data.tree
              : ({} as LinksTree)
          }
        />
      </div>
    ),
  },
  {
    label: 'Global CDN',
    title: 'Global CDN, resilient APIs',
    description:
      'Requests terminate on a worldwide footprint with built-in retries, and intelligent caching.',
    illustration: <DottedWorldMap />,
  },
  {
    label: 'Type Safety',
    title: 'Full type safety, plug-in schemas',
    description:
      'Shared contracts across OpenAPI, REST, oRPC, and workers ensure every response is typed, validated, and ready to slot into your checks.',
    illustration: <TiltedScroll />,
  },
  {
    label: 'Developer-first SDK',
    title: 'Developer-first SDK experience',
    description:
      'First-party TypeScript SDK exposes ergonomic helpers, and playground parity straight from install.',
    illustration: <CpuArchitecture />,
  },
  {
    label: 'Free and open',
    title: 'Free and open',
    description:
      'MIT-licensed, bring-your-own infra—no paywalls, credits, or surprise pricing.',
    illustration: <CpuArchitecture />,
  },
] as const;

export function ValueProp() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <div className="relative grid grid-cols-1 divide-x md:grid-cols-5">
      <div className="md:col-span-2">
        <div className="scrollbar-none flex gap-2 overflow-x-auto p-4 md:flex-col md:gap-4 md:p-4">
          {VALUE_ITEMS.map((option, index) => (
            <button
              className={`w-64 flex-shrink-0 space-y-2 border p-4 text-left transition-colors duration-200 ease-out last:mr-0 md:mr-0 md:w-full md:p-6 ${
                selectedIndex === index
                  ? 'bg-background-subtle shadow-md'
                  : 'hover:bg-background-subtle'
              }`}
              key={option.label}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <Label className="text-muted-foreground text-sm tracking-tight md:text-md lg:text-md">
                {option.label}
              </Label>
              <h2 className="font-semibold text-foreground text-lg tracking-tight md:text-xl lg:text-xl">
                {option.title}
              </h2>
            </button>
          ))}
        </div>
      </div>
      <div className="col-span-1 flex flex-col items-center justify-evenly overflow-hidden p-4 md:col-span-3 md:p-6">
        <div className="size-full h-[32.5rem]">
          {VALUE_ITEMS[selectedIndex]?.illustration}
        </div>
        <p className="flex h-1/4 max-w-md flex-none flex-col items-center justify-center text-pretty text-center font-semibold font-semibold text-foreground text-lg tracking-tight tracking-tight md:text-xl lg:text-xl">
          {VALUE_ITEMS[selectedIndex]?.description}
        </p>
      </div>
    </div>
  );
}
