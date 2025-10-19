'use client';

import { cn } from '@deepcrawl/ui/lib/utils';
import { useEffect, useState } from 'react';
import type { ReadUrlPlaygroundResponse } from '@/hooks/playground/types';
import { MetricsDisplay } from '../playground/response-area/task-info-card';

const metricsCards = [
  {
    id: 'card-bottom',
    className:
      "[grid-area:stack] hover:-translate-y-15 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-300 hover:grayscale-0 before:left-0 before:top-0",
    method: 'POST' as const,
    cached: false,
  },
  {
    id: 'card-middle',
    className:
      "[grid-area:stack] -translate-x-16 translate-y-10 hover:-translate-y-5 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-300 hover:grayscale-0 before:left-0 before:top-0",
    method: 'GET' as const,
    cached: false,
  },
  {
    id: 'card-top',
    className:
      '[grid-area:stack] -translate-x-32 translate-y-20 hover:translate-y-5',
    method: 'POST' as const,
    cached: true,
  },
] as const;

const BASE_CARD_CLASSES =
  'hover:-translate-y-10 h-36 w-[22rem] skew-y-[8deg] transition-transform duration-200 ease-out hover:border-white/30 will-change-transform transform-gpu';

/**
 * Generate random number within a range
 */
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate minimal demo data for MetricsDisplay card with randomized values
 * Only creates the fields actually used by the component
 */
function createDemoCardData(cached: boolean): {
  response: ReadUrlPlaygroundResponse;
  apiMetrics: NonNullable<ReadUrlPlaygroundResponse['data']>['metrics'];
} {
  // Realistic API response times with more variation:
  // - Cached: 6-20ms
  // - Non-cached: 85-215ms
  const durationMs = cached
    ? Math.round(randomInRange(6, 20)) // Cached responses are faster
    : Math.round(randomInRange(85, 215)); // Non-cached have more variation

  // Randomize execution time between 280ms and 620ms
  const executionTime = Math.round(randomInRange(280, 620));

  // Calculate timestamps with current time
  const now = Date.now();
  const startTimeMs = now - durationMs;
  const endTimeMs = now;
  const readableDuration = `${durationMs}ms`;

  // Create timestamp string (used for display)
  const timestamp = new Date(now).toISOString();

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
  // State to store card data that changes on each mount
  const [displayCards, setDisplayCards] = useState(() =>
    metricsCards.map((card) => {
      const { response, apiMetrics } = createDemoCardData(card.cached);
      return {
        id: card.id,
        className: cn(BASE_CARD_CLASSES, card.className),
        method: card.method,
        response,
        apiMetrics,
      };
    }),
  );

  // Regenerate metrics on mount (when user refreshes or navigates to page)
  useEffect(() => {
    setDisplayCards(
      metricsCards.map((card) => {
        const { response, apiMetrics } = createDemoCardData(card.cached);
        return {
          id: card.id,
          className: cn(BASE_CARD_CLASSES, card.className),
          method: card.method,
          response,
          apiMetrics,
        };
      }),
    );
  }, []);

  return (
    <div className="fade-in-0 grid h-full animate-in place-items-center pl-32 opacity-100 duration-500 [grid-template-areas:'stack'] max-sm:pl-40">
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
