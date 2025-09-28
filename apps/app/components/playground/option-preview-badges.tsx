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
import {
  usePlaygroundCoreSelector,
  usePlaygroundOptionsSelector,
} from '@/hooks/playground/playground-context';
import type {
  DeepcrawlOperations,
  OperationToOptions,
} from '@/hooks/playground/types';

// Helper function to convert smartbool values to boolean
export function convertSmartBool(
  value: string | boolean | undefined,
): boolean | undefined {
  if (value === undefined) {
    return;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return;
}

interface OptionPreviewConfig<T = boolean | undefined> {
  icon: ReactElement;
  label: string;
  condition: 'enabled' | 'always';
  operations: DeepcrawlOperations[] | 'all';
  colorClass: string;
  getValue: (options: OperationToOptions[DeepcrawlOperations]) => T;
  shouldShow?: (
    value: T,
    operation: DeepcrawlOperations,
    options: OperationToOptions[DeepcrawlOperations],
  ) => boolean;
}

const OPTION_PREVIEW_CONFIG: Record<string, OptionPreviewConfig> = {
  cache: {
    icon: <ClockIcon size={14} />,
    label: 'Cache',
    condition: 'always',
    operations: 'all',
    colorClass: 'green-600' as const,
    getValue: (options) => convertSmartBool(options.cacheOptions?.enabled),
    shouldShow: () => true, // Always show cache status
  },
  markdown: {
    icon: <MarkdownIcon size={14} />,
    label: 'Markdown',
    condition: 'enabled',
    operations: ['readUrl', 'getMarkdown'],
    colorClass: 'purple-600' as const,
    getValue: (options) =>
      'markdown' in options ? convertSmartBool(options.markdown) : undefined,
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
      'metadata' in options ? convertSmartBool(options.metadata) : undefined,
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
      'cleanedHtml' in options
        ? convertSmartBool(options.cleanedHtml)
        : undefined,
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
    getValue: (options) =>
      'tree' in options ? convertSmartBool(options.tree) : undefined,
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
      return 'linkExtractionOptions' in options
        ? convertSmartBool(options.linkExtractionOptions?.includeExternal)
        : undefined;
    },
    shouldShow: (value, operation) =>
      operation === 'extractLinks' && Boolean(value),
  },
};

interface OptionPreviewBadgesProps {
  className?: string;
  isAccordionOpen?: boolean;
}

export function OptionPreviewBadges({
  className,
  isAccordionOpen,
}: OptionPreviewBadgesProps) {
  // Get state from context
  const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
  const currentOptions = usePlaygroundOptionsSelector('currentOptions');

  // Use context data instead of props
  const operation = selectedOperation;
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
      const value = config.getValue(currentOptions);

      // Check if should show based on condition and custom logic
      return config.shouldShow
        ? config.shouldShow(value, operation, currentOptions)
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
        const value = config.getValue(currentOptions);
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
                !isEnabled && 'border-destructive',
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
