'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import { useMemo } from 'react';
import type { ReadUrlPlaygroundResponse } from '@/hooks/playground/types';
import { MetricsDisplay } from '../playground/response-area/task-info-card';

const metricsCards = [
  {
    id: 'card-bottom',
    className:
      "[grid-area:stack] hover:-translate-y-15 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    seed: 250,
    method: 'POST' as const,
    cached: false,
  },
  {
    id: 'card-middle',
    className:
      "[grid-area:stack] -translate-x-16 translate-y-10 hover:-translate-y-5 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    seed: 500,
    method: 'GET' as const,
    cached: false,
  },
  {
    id: 'card-top',
    className:
      '[grid-area:stack] -translate-x-32 translate-y-20 hover:translate-y-5',
    seed: 750,
    method: 'POST' as const,
    cached: true,
  },
] as const;

const BASE_CARD_CLASSES =
  'hover:-translate-y-10 h-36 w-[22rem] skew-y-[8deg] transition-all duration-300 hover:border-white/30  will-change transform-gpu';

/**
 * Generate minimal demo data for MetricsDisplay card
 * Only creates the fields actually used by the component
 */
function createDemoCardData(
  seed: number,
  cached: boolean,
): {
  response: ReadUrlPlaygroundResponse;
  apiMetrics: NonNullable<ReadUrlPlaygroundResponse['data']>['metrics'];
} {
  const random = seed / 1000;

  // Realistic API response times:
  // - Cached: 10-50ms
  // - Non-cached: 100-200ms
  const durationMs = cached
    ? Math.round(10 + random * 20) // 10-30ms for cached
    : Math.round(100 + random * 100); // 100-200ms for non-cached

  // Randomize execution time between 300ms and 600ms
  const executionTime = Math.round(300 + random * 300);

  // Calculate timestamps
  const startTimeMs = 1760876195810 + Math.round(random * 10000);
  const endTimeMs = startTimeMs + durationMs;
  const readableDuration = `${durationMs.toFixed(2)}ms`;

  // Create timestamp string (used for display)
  const timestamp = new Date().toISOString();

  const metrics = {
    readableDuration,
    durationMs,
    startTimeMs,
    endTimeMs,
  };

  // Only include fields actually used by MetricsDisplay:
  // - operation, executionTime, status, timestamp (for the response)
  // - cached (for the cached badge)
  // - metrics (for API duration display)
  const response: ReadUrlPlaygroundResponse = {
    operation: 'readUrl',
    executionTime,
    status: 200,
    timestamp,
    data: {
      cached: !!cached,
      metrics,
    } as ReadUrlPlaygroundResponse['data'],
  };

  return { response, apiMetrics: metrics };
}

export default function DisplayCards() {
  // Memoize demo data creation to prevent unnecessary recalculations
  const displayCards = useMemo(
    () =>
      metricsCards.map((card) => {
        const { response, apiMetrics } = createDemoCardData(
          card.seed,
          card.cached,
        );
        return {
          id: card.id,
          className: cn(BASE_CARD_CLASSES, card.className),
          method: card.method,
          response,
          apiMetrics,
        };
      }),
    [],
  );

  return (
    <div className="fade-in-0 -translate-y-16 grid h-1/2 translate-x-16 animate-in place-items-center opacity-100 duration-700 [grid-template-areas:'stack']">
      {displayCards.map((cardProps) => (
        <MetricsDisplay
          apiMetrics={cardProps.apiMetrics}
          className={cardProps.className}
          enableTooltip={false}
          key={cardProps.id}
          operationMethod={cardProps.method}
          response={cardProps.response}
        />
      ))}
    </div>
  );
}
