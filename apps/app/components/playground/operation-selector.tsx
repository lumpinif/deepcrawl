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
import type { DeepcrawlOperations } from '@/hooks/playground/use-task-input-state';
import { DeepcrawlFeatures } from '@/lib/playground/operations-config';

interface OperationSelectorProps {
  selectedOperation: DeepcrawlOperations;
  onOperationChange: (operation: DeepcrawlOperations | null) => void;
  className?: string;
  isLoading: boolean;
}

export function OperationSelector({
  selectedOperation,
  onOperationChange,
  className,
  isLoading,
}: OperationSelectorProps) {
  const [hoveredOperation, setHoveredOperation] =
    useState<DeepcrawlOperations | null>(null);

  return (
    <div className={cn('grid gap-2 p-1 lg:grid-cols-3', className)}>
      {DeepcrawlFeatures.map((feat) => (
        <Card
          className={cn(
            'group relative cursor-pointer transition-all duration-200 ease-out hover:bg-primary hover:shadow-md hover:dark:bg-background',
            selectedOperation === feat.operation &&
              'border-ring bg-primary shadow-md dark:bg-background',
          )}
          key={feat.operation}
          onClick={() => onOperationChange(feat.operation)}
          onMouseEnter={() => setHoveredOperation(feat.operation)}
          onMouseLeave={() => setHoveredOperation(null)}
        >
          <div
            className={cn(
              'absolute top-2 left-2 flex items-center justify-center opacity-0 transition-all duration-200 ease-out group-hover:opacity-100',
              selectedOperation === feat.operation && 'opacity-100',
            )}
          >
            <Badge
              className={cn(
                'text-muted-foreground text-xs',
                selectedOperation !== feat.operation &&
                  'group-hover:text-primary-foreground dark:group-hover:text-muted-foreground',
                selectedOperation === feat.operation &&
                  'text-primary-foreground dark:text-primary',
              )}
              variant="outline"
            >
              {feat.method} {feat.endpoint}
            </Badge>
          </div>

          <div className="flex items-center justify-center">
            <feat.icon
              animate={
                hoveredOperation === feat.operation ||
                (selectedOperation === feat.operation && isLoading)
              }
              cellClassName="size-[3px]"
            />
          </div>
          <CardContent
            className={cn(
              'space-y-2 text-center',
              'group-hover:text-primary-foreground dark:group-hover:text-primary',
              selectedOperation === feat.operation &&
                'text-primary-foreground dark:text-primary',
            )}
          >
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
