'use client';

import { Badge } from '@deepcrawl/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { cn } from '@deepcrawl/ui/lib/utils';
import { useState } from 'react';
import type { DeepcrawlOperations } from '@/hooks/playground/types';
import { DeepcrawlFeatures } from '@/lib/playground/operations-config';

export function OperationSelectorDemo({ className }: { className?: string }) {
  const [selectedOperation, setSelectedOption] =
    useState<DeepcrawlOperations>('readUrl');
  const [hoveredOperation, setHoveredOperation] =
    useState<DeepcrawlOperations | null>(null);
  return (
    <div
      className={cn(
        'group/operation-card grid w-full select-none gap-2 p-1 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]',
        className,
      )}
    >
      {DeepcrawlFeatures.map((feat) => (
        <Card
          className={cn(
            'group relative cursor-pointer bg-background transition-all duration-200 ease-out hover:bg-input/25 hover:shadow-md 2xl:py-8 hover:dark:bg-accent/35',
            selectedOperation === feat.operation &&
              '!bg-input/40 dark:!bg-accent/50 border border-ring/50 shadow-md dark:border-ring/70',
          )}
          key={feat.operation}
          onClick={() => setSelectedOption(feat.operation)}
          onMouseEnter={() => setHoveredOperation(feat.operation)}
          onMouseLeave={() => setHoveredOperation(null)}
        >
          <div
            className={cn(
              'absolute top-2 left-2 flex items-center justify-center opacity-0 transition-all duration-200 ease-out group-hover:opacity-100',
              selectedOperation === feat.operation && 'opacity-100',
            )}
          >
            <Badge className="text-xs" variant="outline">
              {feat.method} {feat.endpoint}
            </Badge>
          </div>

          <div className="flex items-center justify-center">
            <feat.icon
              animate={hoveredOperation === feat.operation}
              cellClassName="size-[3px]"
            />
          </div>

          <CardContent className="space-y-2 text-center">
            <div className="flex items-center justify-center">
              <CardTitle className="flex items-center gap-2">
                {feat.label}
              </CardTitle>
            </div>
            <CardDescription>{feat.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
