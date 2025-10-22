'use client';

import { H2 } from '../h2';
import { LazyOperationSelectorDemo } from '../lazy-components';
import { Tick } from '../tick';

export const ToolkitSuite = () => (
  <section className="relative px-4 py-24 sm:px-8">
    <Tick position={['bottom-right']} />
    <div className="space-y-12">
      <div className="space-y-3 text-center">
        <H2>Multi-purposes Features And Endpoints</H2>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground">
          Not only does it include enhanced commonly used tools, but there are
          more requested features and endpoints are regularly added!
        </p>
      </div>
      <LazyOperationSelectorDemo />
      <p className="mx-auto w-fit text-pretty rounded-full border bg-background-subtle px-7 py-3 text-center font-semibold text-base text-primary/70 tracking-tight shadow-sm">
        Headless Browser-rendering and asynchronous durable crawling are coming
        soon!
      </p>
    </div>
  </section>
);
