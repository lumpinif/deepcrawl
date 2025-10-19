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
    label: 'Lightning Fast Content Extraction',
    title: 'Better Performance by Default',
    description:
      'Edge-native Workers on V8 engine returns response in milliseconds with Deepcrawl specially optimized parsers and tuned HTML cleaners, KV caching, and no headless browser tax or virtual DOM overhead required.',
    illustration: <DisplayCards />,
  },
  {
    label: 'Better LLM-Ready Context',
    title: 'Optimized for pipelines and fewer tokens',
    description:
      'Deepcrawl assembles markdown, metadata, and link trees from any target URL without relying on sitemap.xml, so agents plan crawls with real topology and fewer wasted tokens comparing to other manifests like llms.txt.',
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
    label: 'Open Core And Transparency',
    title: 'Free to anyone and Self-Hostable',
    description:
      '100% free to consume APIs or use playground without any metered credits. MIT licensing mean you can fork, extend, and deploy your own version of Deepcrawl without server maintenance overhead.',
    illustration: <CpuArchitecture />,
  },
  {
    label: 'Resilient Edge',
    title: 'Worldwide CDN, Instant Retries',
    description:
      'Every request lands on the Cloudflare edge with automatic retries, configurable smart cache controls, for bursty workflows.',
    illustration: <DottedWorldMap />,
  },
  {
    label: 'SDK Ergonomics',
    title: 'Developer-first Tooling',
    description:
      'The super lightweight typeScript SDK ships the same contracts, types, and schemas we use to build Deepcrawl, and typed errors as the worker plus playground parity straight from install.',
    illustration: <CpuArchitecture />,
  },
  {
    label: 'Typed Contracts',
    title: 'Type Safety Across Every Surface',
    description:
      'Shared OpenAPI, oRPC, and Zod schemas keep workers, dashboard, and SDK aligned so inputs validate once and stay consistent from compile to runtime.',
    illustration: <TiltedScroll />,
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
