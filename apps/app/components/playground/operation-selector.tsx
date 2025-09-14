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
            'group relative cursor-pointer transition-all duration-200 ease-out hover:bg-muted/50 hover:shadow-md',
            selectedOperation === feat.operation && 'bg-muted/50',
          )}
          key={feat.operation}
          onClick={() => onOperationChange(feat.operation)}
          onMouseEnter={() => setHoveredOperation(feat.operation)}
          onMouseLeave={() => setHoveredOperation(null)}
        >
          <div className="absolute top-2 left-2 flex items-center justify-center opacity-0 transition-all duration-200 ease-out group-hover:opacity-100">
            <Badge className="text-muted-foreground text-xs" variant="outline">
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
