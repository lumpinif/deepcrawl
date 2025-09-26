'use client';

import { ClockIcon } from '@deepcrawl/ui/components/icons/clock';
import { MarkdownIcon } from '@deepcrawl/ui/components/icons/markdown';
import { cn } from '@deepcrawl/ui/lib/utils';
import {
  Check,
  ExternalLink,
  FileCheck2,
  FileCog,
  ListTree,
  X,
} from 'lucide-react';
import type { ReactElement } from 'react';
import type {
  DeepcrawlOperations,
  ExtractLinksOptionsWithoutUrl,
  GetMarkdownOptionsWithoutUrl,
  ReadUrlOptionsWithoutUrl,
} from '@/hooks/playground/types';

// Union type for all operation options
type AllOperationOptions =
  | ReadUrlOptionsWithoutUrl
  | ExtractLinksOptionsWithoutUrl
  | GetMarkdownOptionsWithoutUrl;

interface OptionPreviewConfig {
  icon: ReactElement;
  label: string;
  condition: 'enabled' | 'always';
  operations: DeepcrawlOperations[] | 'all';
  colorClass: string;
  getValue: (options: AllOperationOptions) => unknown;
  shouldShow?: (
    value: unknown,
    operation: DeepcrawlOperations,
    options: AllOperationOptions,
  ) => boolean;
}

const OPTION_PREVIEW_CONFIG: Record<string, OptionPreviewConfig> = {
  cache: {
    icon: <ClockIcon size={14} />,
    label: 'Cache',
    condition: 'always',
    operations: 'all',
    colorClass: 'green-600' as const,
    getValue: (options) => options.cacheOptions?.enabled,
    shouldShow: () => true, // Always show cache status
  },
  markdown: {
    icon: <MarkdownIcon size={14} />,
    label: 'Markdown',
    condition: 'enabled',
    operations: ['readUrl', 'getMarkdown'],
    colorClass: 'purple-600' as const,
    getValue: (options) =>
      'markdown' in options ? options.markdown : undefined,
    shouldShow: (value, operation) =>
      (operation === 'readUrl' || operation === 'getMarkdown') &&
      Boolean(value),
  },
  metadata: {
    icon: <FileCog className="size-3.5" />,
    label: 'Metadata',
    condition: 'enabled',
    operations: ['readUrl', 'extractLinks'],
    colorClass: 'orange-600' as const,
    getValue: (options) =>
      'metadata' in options ? options.metadata : undefined,
    shouldShow: (value, operation) =>
      (operation === 'readUrl' || operation === 'extractLinks') &&
      Boolean(value),
  },
  cleanedHtml: {
    icon: <FileCheck2 className="size-3.5" />,
    label: 'Clean HTML',
    condition: 'enabled',
    operations: ['readUrl', 'extractLinks'],
    colorClass: 'blue-600' as const,
    getValue: (options) =>
      'cleanedHtml' in options ? options.cleanedHtml : undefined,
    shouldShow: (value, operation) =>
      (operation === 'readUrl' || operation === 'extractLinks') &&
      Boolean(value),
  },
  tree: {
    icon: <ListTree className="size-3.5" />,
    label: 'Links Tree',
    condition: 'enabled',
    operations: ['extractLinks'],
    colorClass: 'indigo-600' as const,
    getValue: (options) => ('tree' in options ? options.tree : undefined),
    shouldShow: (value, operation) =>
      operation === 'extractLinks' && Boolean(value),
  },
  external: {
    icon: <ExternalLink className="size-3.5" />,
    label: 'External Links',
    condition: 'enabled',
    operations: ['extractLinks'],
    colorClass: 'cyan-600' as const,
    getValue: (options) => {
      const extractOptions = options as ExtractLinksOptionsWithoutUrl;
      return extractOptions.linkExtractionOptions?.includeExternal;
    },
    shouldShow: (value, operation) =>
      operation === 'extractLinks' && Boolean(value),
  },
};

interface OptionPreviewBadgesProps {
  operation: DeepcrawlOperations;
  options: AllOperationOptions;
  className?: string;
  isAccordionOpen?: boolean;
}

export function OptionPreviewBadges({
  operation,
  options,
  className,
  isAccordionOpen,
}: OptionPreviewBadgesProps) {
  // Get all applicable options for the current operation
  const applicableOptions = Object.entries(OPTION_PREVIEW_CONFIG).filter(
    ([_, config]) => {
      // Check if operation matches
      const operationMatches =
        config.operations === 'all' || config.operations.includes(operation);

      if (!operationMatches) {
        return false;
      }

      // Get the current value
      const value = config.getValue(options);

      // Check if should show based on condition and custom logic
      return config.shouldShow
        ? config.shouldShow(value, operation, options)
        : config.condition === 'always'
          ? true
          : Boolean(value);
    },
  );

  // Limit to maximum 5 options to prevent overflow
  const optionsToShow = applicableOptions.slice(0, 5);

  if (optionsToShow.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex select-none flex-row items-center transition-all duration-300 ease-in-out',
        isAccordionOpen && 'translate-y-5 scale-95 opacity-0 blur',
        className,
      )}
    >
      {optionsToShow.map(([key, config]) => {
        const value = config.getValue(options);
        const isEnabled = Boolean(value);

        // Special handling for cache - show enabled/disabled status
        // const displayLabel =
        //   key === 'cache' ? (isEnabled ? 'Cache' : 'No Cache') : config.label;

        return (
          <div
            className="group-hover/toolbar:[&_svg:not([class*='text-']),_span]:!text-primary flex items-center gap-x-1 px-1.5 py-0.5 font-medium text-muted-foreground text-xs [&_svg,_span]:transition-colors [&_svg,_span]:duration-200 [&_svg,_span]:ease-out"
            key={key}
          >
            <div
              className={cn(
                `border-${key}`,
                "flex items-center justify-center rounded-full border p-0.5 not-hover:[&_svg:not([class*='text-'])]:text-muted-foreground",
              )}
            >
              {isEnabled ? (
                <Check
                  className={cn(`text-${key}`, 'size-2 shrink-0 rounded-full')}
                />
              ) : (
                <X
                  className={cn(
                    'text-destructive',
                    'size-2 shrink-0 rounded-full',
                  )}
                />
              )}
            </div>
            {/* <span className={cn(config.colorClass, 'shrink-0')}>
              {config.icon}
            </span> */}
            <span className="truncate">{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}
