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
import { DeepcrawlFeatures } from '@/lib/playground/operations-config';
import {
  ExportResponseGridIcon,
  GetLinksGridIcon,
  ListLogsGridIcon,
} from '../animate-ui/components/grid-icons';
import { Tick } from './tick';

const FEATURES = [
  ...DeepcrawlFeatures,
  {
    label: 'Get Links',
    operation: 'getLinks',
    icon: GetLinksGridIcon,
    endpoint: '/links',
    method: 'GET',
    description: 'Get all page links with a single URL request.',
  },
  {
    label: 'Get Many Logs',
    operation: 'getManyLogs',
    icon: ListLogsGridIcon,
    endpoint: '/logs',
    method: 'POST',
    description:
      'Retrieve many activity logs with request options, pagination, and filtering support.',
  },
  {
    label: 'Export Response',
    operation: 'exportResponse',
    icon: ExportResponseGridIcon,
    endpoint: '/logs/export',
    method: 'GET',
    description:
      'Export the original response data from a specific request by request ID and format.',
  },
] as const;

type Feature = (typeof FEATURES)[number];

export function OperationSelectorDemo({ className }: { className?: string }) {
  const [selectedOperation, setSelectedOption] = useState<
    Feature['operation'] | null
  >(null);
  const [hoveredOperation, setHoveredOperation] = useState<
    Feature['operation'] | null
  >(null);

  return (
    <div
      className={cn(
        'group/operation-card grid w-full select-none divide-border md:grid-cols-3',
        className,
      )}
    >
      {FEATURES.map((feat, _index) => (
        <Card
          className={cn(
            'group relative cursor-pointer rounded-none bg-background transition-all duration-200 ease-out hover:bg-input/25 hover:shadow-md 2xl:py-8 hover:dark:bg-accent/35',
            selectedOperation === feat.operation &&
              '!bg-input/40 dark:!bg-accent/50 border border-ring/50 shadow-md dark:border-ring/70',
          )}
          key={feat.operation}
          onClick={() => setSelectedOption(feat.operation)}
          onMouseEnter={() => setHoveredOperation(feat.operation)}
          onMouseLeave={() => setHoveredOperation(null)}
        >
          <Tick
            length={12}
            position={_index === 0 || _index === 1 ? ['bottom-right'] : []}
          />
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
