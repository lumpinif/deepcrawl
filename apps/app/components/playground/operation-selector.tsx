'use client';

import {
  IconHoverButton,
  IconHoverButtonIcon,
  IconHoverButtonText,
} from '@deepcrawl/ui/components/annui/icon-hover-button';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { cn } from '@deepcrawl/ui/lib/utils';
import { CircleCheck } from 'lucide-react';
import { useState } from 'react';
import {
  usePlaygroundActionsSelector,
  usePlaygroundCoreSelector,
} from '@/hooks/playground/playground-context';
import type { DeepcrawlOperations } from '@/hooks/playground/types';
import { DeepcrawlFeatures } from '@/lib/playground/operations-config';
import { RESPONSE_SECTION_ID } from './scroll-anchors';
import { useScrollToAnchor } from './use-scroll-to-anchor';

export function OperationSelector({
  className,
  hasResponseData,
}: {
  className?: string;
  hasResponseData?: boolean;
}) {
  const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
  const isExecuting = usePlaygroundCoreSelector('isExecuting');
  const setSelectedOperation = usePlaygroundActionsSelector(
    'setSelectedOperation',
  );
  const scrollToAnchor = useScrollToAnchor();

  const [hoveredOperation, setHoveredOperation] =
    useState<DeepcrawlOperations | null>(null);

  const onOperationChange = (operation: DeepcrawlOperations) => {
    setSelectedOperation(operation);
  };

  const isLoading = isExecuting[selectedOperation];

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
            'group relative cursor-pointer transition-all duration-200 ease-out hover:bg-primary/80 hover:shadow-md 2xl:py-8 hover:dark:bg-background',
            selectedOperation === feat.operation &&
              'border-ring bg-primary/95 shadow-md hover:bg-primary/95 dark:bg-background',
          )}
          key={feat.operation}
          onClick={(e) => {
            e.stopPropagation();
            onOperationChange(feat.operation);
            if (hasResponseData && selectedOperation === feat.operation) {
              scrollToAnchor(RESPONSE_SECTION_ID);
            }
          }}
          onMouseEnter={() => setHoveredOperation(feat.operation)}
          onMouseLeave={() => setHoveredOperation(null)}
          title={
            hasResponseData && selectedOperation === feat.operation
              ? 'Click to scroll'
              : undefined
          }
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

          {hasResponseData && selectedOperation === feat.operation && (
            <div className="absolute top-2 right-2">
              <IconHoverButton
                aria-label="Scroll to results"
                className="!bg-transparent ml-auto h-2 p-0 text-muted-foreground hover:text-foreground"
                forceHover={
                  hoveredOperation === feat.operation ? true : undefined
                }
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToAnchor(RESPONSE_SECTION_ID);
                }}
                title="Click to scroll"
                type="button"
                variant="ghost"
              >
                <IconHoverButtonIcon>
                  <CircleCheck className="text-green-600" />
                </IconHoverButtonIcon>
                <IconHoverButtonText className="text-muted-foreground text-xs">
                  Scroll to results
                </IconHoverButtonText>
              </IconHoverButton>
            </div>
          )}

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
            <CardDescription
              className={cn(
                selectedOperation === feat.operation &&
                  'text-primary-foreground dark:text-primary',
                selectedOperation !== feat.operation &&
                  'group-hover:text-primary-foreground dark:group-hover:text-primary',
              )}
            >
              {feat.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
