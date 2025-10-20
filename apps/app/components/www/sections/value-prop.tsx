'use client';

import { Label } from '@deepcrawl/ui/components/ui/label';
import type { LinksTree } from 'deepcrawl/types';
import { useState } from 'react';
import { extractLinksResponseSample } from '@/lib/response-samples';
import { TreeViewCard } from '../../playground/response-area/content-tabs';
import DisplayCards from '../display-cards';
import { DottedWorldMap } from '../dotted-map';
import { FreeTag } from '../free-tag';
import { H2 } from '../h2';
import { SDKCodeblock } from '../sdk-codeblock';
import { Tick } from '../tick';
import { TiltedScroll } from '../tilted-scroll';

const VALUE_ITEMS = [
  {
    label: '5-10x faster than Firecrawl on general',
    title: 'Better Performance by Default',
    description:
      "No headless browser tax or virtual DOM overhead required for simple HTML parsing! Edge-native Workers on V8 engine returns response in milliseconds with specially optimized Deepcrawl's parsers and tuned HTML cleaners, and smart dynamic caching controls.",
    illustration: <DisplayCards />,
  },
  {
    label: 'Open with full transparency',
    title: 'Free to anyone and Open Source',
    description:
      '100% free to consume APIs or use playground without any metered credits. MIT licensing mean you can fork, extend, and deploy your own version of Deepcrawl without server maintenance overhead.',
    illustration: <FreeTag />,
  },
  {
    label: "Save your LLM's tokens with better context",
    title: 'Optimized for AI, less tokens spent',
    description:
      'Deepcrawl assembles markdown, metadata, and link trees from any target URL without relying on sitemap.xml, so agents plan next steps with real topology and fewer wasted tokens spending, potentially outperforming llms.txt.',
    illustration: (
      <div className="fade-in-0 will-change relative size-full transform-gpu animate-in overflow-hidden rounded-xl border bg-background-subtle pb-10 opacity-100 not-dark:shadow-md transition-opacity duration-700">
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
    illustration: (
      <div className="fade-in-0 will-change relative size-full transform-gpu animate-in overflow-hidden rounded-xl opacity-100 transition-opacity duration-700">
        <div className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(circle_at_center,transparent_40%,color-mix(in_oklch,var(--color-background)_90%,transparent)_75%,var(--color-background)_100%)]" />
        <SDKCodeblock className="flex items-center justify-center" />
      </div>
    ),
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
      <Tick />
      <div className="md:col-span-2">
        <div className="scrollbar-none flex gap-2 overflow-x-auto p-4 md:flex-col md:gap-4 md:p-4">
          {VALUE_ITEMS.map((option, index) => (
            <button
              className={`w-64 flex-shrink-0 space-y-2 border p-4 text-left transition-colors duration-300 ease-out last:mr-0 md:mr-0 md:w-full md:p-6 ${
                selectedIndex === index
                  ? '!bg-background-subtle shadow-sm'
                  : 'hover:dark:bg-background-subtle'
              }`}
              key={option.label}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <Label className="text-muted-foreground text-sm tracking-tight md:text-md lg:text-md">
                {option.label}
              </Label>
              <H2 className="font-semibold text-foreground text-lg tracking-tight md:text-xl lg:text-2xl">
                {option.title}
              </H2>
            </button>
          ))}
        </div>
      </div>
      <div className="col-span-1 flex flex-col items-center justify-evenly overflow-hidden p-4 max-sm:gap-6 md:col-span-3 md:p-6">
        <div className="h-[30rem] w-full flex-none">
          {VALUE_ITEMS[selectedIndex]?.illustration}
        </div>
        <p className="flex min-h-0 max-w-md flex-grow flex-col items-center justify-center text-pretty text-center font-semibold text-foreground text-lg tracking-tight md:text-xl lg:text-xl">
          {VALUE_ITEMS[selectedIndex]?.description}
        </p>
      </div>
    </div>
  );
}
