'use client';

import { ClockIcon } from '@deepcrawl/ui/components/icons/clock';
import { FilePenLineIcon } from '@deepcrawl/ui/components/icons/file-pen-line';
import { LinkIcon } from '@deepcrawl/ui/components/icons/link';
import { MarkdownIcon } from '@deepcrawl/ui/components/icons/markdown';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@deepcrawl/ui/components/ui/card';
import { Label } from '@deepcrawl/ui/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import {
  Bot,
  Check,
  ExternalLink,
  FileCheck2,
  FileCode2,
  FileCog,
  ListTree,
  Network,
  Pickaxe,
  Settings2,
  Timer,
  Trash2,
  X,
} from 'lucide-react';
import { memo, type ReactElement } from 'react';
import {
  usePlaygroundActionsSelector,
  usePlaygroundCoreSelector,
  usePlaygroundOptionsSelector,
} from '@/contexts/playground-context';
import type {
  DeepcrawlOperations,
  OperationToOptions,
} from '@/hooks/playground/types';
import CopyButton from '../copy-button';
import { convertSmartBool } from './option-preview-badges';

interface OptionGroup {
  title: string;
  icon: ReactElement;
  colorClass: string;
  options: OptionDefinition[];
}

interface OptionDefinition<T = unknown> {
  key: string;
  label: string;
  icon: ReactElement;
  getValue: (options: OperationToOptions[DeepcrawlOperations]) => T;
  getDisplayValue: (
    value: T,
    options: OperationToOptions[DeepcrawlOperations],
    operation: DeepcrawlOperations,
  ) => string | ReactElement;
  operations: DeepcrawlOperations[] | 'all';
  isApplicable?: (operation: DeepcrawlOperations) => boolean;
}

const DETAILED_OPTIONS_CONFIG: OptionGroup[] = [
  {
    title: 'Content Format',
    icon: <FilePenLineIcon size={16} />,
    colorClass: '',
    options: [
      {
        key: 'markdown',
        label: 'Extract Markdown',
        icon: <MarkdownIcon size={16} />,
        operations: ['readUrl', 'getMarkdown'],
        getValue: (options) =>
          convertSmartBool(
            'markdown' in options ? options.markdown : undefined,
          ),
        getDisplayValue: (value, options, operation) => {
          if (!value && operation !== 'getMarkdown') {
            return (
              <Badge className="text-muted-foreground" variant="outline">
                <X className="mr-1 size-3" />
                Disabled
              </Badge>
            );
          }

          const markdownOptions =
            'markdownConverterOptions' in options
              ? options.markdownConverterOptions
              : undefined;
          if (markdownOptions && typeof markdownOptions === 'object') {
            const enabledCount =
              Object.values(markdownOptions).filter(Boolean).length;
            const totalCount = Object.keys(markdownOptions).length;
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="" variant="secondary">
                    {enabledCount} / {totalCount} configured
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="w-fit max-w-xs" side="right">
                  <div className="text-xs">
                    {Object.entries(markdownOptions).map(([key, value]) => (
                      <div
                        className={cn(
                          'text-pretty',
                          !value && 'text-muted-foreground',
                        )}
                        key={key}
                      >
                        • {key}
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          );
        },
        isApplicable: (operation) =>
          operation === 'readUrl' || operation === 'getMarkdown',
      },
      {
        key: 'metadata',
        label: 'Extract Metadata',
        icon: <FileCog className="size-4" />,
        operations: ['readUrl', 'extractLinks'],
        getValue: (getOptionValue) =>
          convertSmartBool(
            'metadata' in getOptionValue ? getOptionValue.metadata : undefined,
          ),
        getDisplayValue: (value, options) => {
          if (!value) {
            return (
              <Badge className="text-muted-foreground" variant="outline">
                <X className="mr-1 size-3" />
                Disabled
              </Badge>
            );
          }

          const metadataOptions =
            'metadataOptions' in options ? options.metadataOptions : undefined;
          if (metadataOptions && typeof metadataOptions === 'object') {
            const enabledCount =
              Object.values(metadataOptions).filter(Boolean).length;
            const totalCount = Object.keys(metadataOptions).length;
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="" variant="secondary">
                    {enabledCount} / {totalCount} configured
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="w-fit max-w-xs" side="right">
                  <div className="text-xs">
                    {Object.entries(metadataOptions).map(([key, value]) => (
                      <div
                        className={cn(
                          'text-pretty',
                          !value && 'text-muted-foreground line-through',
                        )}
                        key={key}
                      >
                        • {key}
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          );
        },
        isApplicable: (operation) =>
          operation === 'readUrl' || operation === 'extractLinks',
      },
      {
        key: 'cleanedHtml',
        label: 'Cleaned HTML',
        icon: <FileCheck2 className="size-4" />,
        operations: ['readUrl', 'extractLinks'],
        getValue: (options) =>
          convertSmartBool(
            'cleanedHtml' in options ? options.cleanedHtml : undefined,
          ),
        getDisplayValue: (value) =>
          value ? (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          ) : (
            <Badge className="text-muted-foreground" variant="outline">
              <X className="mr-1 size-3" />
              Disabled
            </Badge>
          ),
        isApplicable: (operation) =>
          operation === 'readUrl' || operation === 'extractLinks',
      },
      {
        key: 'rawHtml',
        label: 'Raw HTML',
        icon: <FileCode2 className="size-4" />,
        operations: ['readUrl'],
        getValue: (options) =>
          convertSmartBool('rawHtml' in options ? options.rawHtml : undefined),
        getDisplayValue: (value) =>
          value ? (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          ) : (
            <Badge className="text-muted-foreground" variant="outline">
              <X className="mr-1 size-3" />
              Disabled
            </Badge>
          ),
        isApplicable: (operation) => operation === 'readUrl',
      },
      {
        key: 'robots',
        label: 'Fetch Robots.txt',
        icon: <Bot className="size-4" />,
        operations: ['readUrl', 'extractLinks'],
        getValue: (options) =>
          convertSmartBool('robots' in options ? options.robots : undefined),
        getDisplayValue: (value) =>
          value ? (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          ) : (
            <Badge className="text-muted-foreground" variant="outline">
              <X className="mr-1 size-3" />
              Disabled
            </Badge>
          ),
        isApplicable: (operation) =>
          operation === 'readUrl' || operation === 'extractLinks',
      },
      {
        key: 'tree',
        label: 'Build Site Tree',
        icon: <ListTree className="size-4" />,
        operations: ['extractLinks'],
        getValue: (options) =>
          convertSmartBool('tree' in options ? options.tree : undefined),
        getDisplayValue: (value, options) => {
          if (!value) {
            return (
              <Badge className="text-muted-foreground" variant="outline">
                <X className="mr-1 size-3" />
                Disabled
              </Badge>
            );
          }

          const treeOptions =
            'treeOptions' in options ? options.treeOptions : undefined;
          if (treeOptions && typeof treeOptions === 'object') {
            const enabledCount = Object.entries(treeOptions).filter(([_, v]) =>
              Boolean(v),
            ).length;
            const totalCount = Object.keys(treeOptions).length;
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="" variant="secondary">
                    {enabledCount} / {totalCount} enabled
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="w-fit max-w-xs" side="right">
                  <div className="text-xs">
                    {Object.entries(treeOptions).map(([key, value]) => (
                      <div
                        className={cn(
                          'text-pretty',
                          !value && 'text-muted-foreground',
                        )}
                        key={key}
                      >
                        • {key}
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          );
        },
        isApplicable: (operation) => operation === 'extractLinks',
      },
      {
        key: 'sitemapXML',
        label: 'Sitemap XML',
        icon: <Network className="size-4" />,
        operations: ['extractLinks'],
        getValue: (options) =>
          convertSmartBool(
            'sitemapXML' in options ? options.sitemapXML : undefined,
          ),
        getDisplayValue: (value) =>
          value ? (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          ) : (
            <Badge className="text-muted-foreground" variant="outline">
              <X className="mr-1 size-3" />
              Disabled
            </Badge>
          ),
        isApplicable: (operation) => operation === 'extractLinks',
      },
    ],
  },
  {
    title: 'Link Extraction',
    icon: <LinkIcon size={16} />,
    colorClass: '',
    options: [
      {
        key: 'includeExternal',
        label: 'Include External Links',
        icon: <ExternalLink className="size-4" />,
        operations: ['extractLinks'],
        getValue: (options) =>
          convertSmartBool(
            'linkExtractionOptions' in options
              ? options.linkExtractionOptions?.includeExternal
              : undefined,
          ),
        getDisplayValue: (value) =>
          value ? (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          ) : (
            <Badge className="text-muted-foreground" variant="outline">
              <X className="mr-1 size-3" />
              Disabled
            </Badge>
          ),
        isApplicable: (operation) => operation === 'extractLinks',
      },
      {
        key: 'includeMedia',
        label: 'Include Media Files',
        icon: <FileCode2 className="size-4" />,
        operations: ['extractLinks'],
        getValue: (options) =>
          convertSmartBool(
            'linkExtractionOptions' in options
              ? options.linkExtractionOptions?.includeMedia
              : undefined,
          ),
        getDisplayValue: (value) =>
          value ? (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          ) : (
            <Badge className="text-muted-foreground" variant="outline">
              <X className="mr-1 size-3" />
              Disabled
            </Badge>
          ),
        isApplicable: (operation) => operation === 'extractLinks',
      },
      {
        key: 'removeQueryParams',
        label: 'Remove Query Parameters',
        icon: <Settings2 className="size-4" />,
        operations: ['extractLinks'],
        getValue: (options) =>
          convertSmartBool(
            'linkExtractionOptions' in options
              ? options.linkExtractionOptions?.removeQueryParams
              : undefined,
          ),
        getDisplayValue: (value) =>
          value ? (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          ) : (
            <Badge className="text-muted-foreground" variant="outline">
              <X className="mr-1 size-3" />
              Disabled
            </Badge>
          ),
        isApplicable: (operation) => operation === 'extractLinks',
      },
      {
        key: 'excludePatterns',
        label: 'Exclude Patterns',
        icon: <X className="size-4" />,
        operations: ['extractLinks'],
        getValue: (options) =>
          'linkExtractionOptions' in options
            ? options.linkExtractionOptions?.excludePatterns
            : undefined,

        getDisplayValue: (value) => {
          if (Array.isArray(value) && value.length > 0) {
            return (
              <Badge className="" variant="secondary">
                {value.length} patterns
              </Badge>
            );
          }
          return (
            <Badge className="text-muted-foreground" variant="outline">
              <X className="mr-1 size-3" />
              None
            </Badge>
          );
        },
        isApplicable: (operation) => operation === 'extractLinks',
      },
    ],
  },
  {
    title: 'Processing & Cache',
    icon: <ClockIcon size={16} />,
    colorClass: '',
    options: [
      {
        key: 'cleaningProcessor',
        label: 'Cleaning Processor',
        icon: <Pickaxe className="size-4" />,
        operations: 'all',
        getValue: (options) =>
          convertSmartBool(
            'cleaningProcessor' in options
              ? options.cleaningProcessor
              : undefined,
          ),
        getDisplayValue: (value) => {
          const processor = value as string;
          return (
            <Badge className="" variant="secondary">
              <Settings2 className="mr-1 size-3" />
              {processor || 'Default'}
            </Badge>
          );
        },
      },
      {
        key: 'cache',
        label: 'Cache',
        icon: <ClockIcon size={16} />,
        operations: 'all',
        getValue: (options) =>
          'cacheOptions' in options ? options.cacheOptions : undefined,
        getDisplayValue: (_, options) => {
          const cacheOptions =
            'cacheOptions' in options ? options.cacheOptions : undefined;
          const ttl = cacheOptions?.expirationTtl as number | undefined;
          const enabled = cacheOptions?.enabled as boolean | undefined;

          if (!enabled) {
            return (
              <Badge className="text-muted-foreground" variant="outline">
                <X className="mr-1 size-3" />
                Disabled
              </Badge>
            );
          }

          if (ttl) {
            const days = Math.round(ttl / (24 * 60 * 60));
            return (
              <Badge className="" variant="secondary">
                <Timer className="mr-1 size-3" />
                {days}d TTL
              </Badge>
            );
          }

          return (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          );
        },
      },
      {
        key: 'metrics',
        label: 'Performance Metrics',
        icon: <Timer className="size-4" />,
        operations: ['readUrl', 'extractLinks'],
        getValue: (options) =>
          'metricsOptions' in options ? options.metricsOptions : undefined,
        getDisplayValue: (value) =>
          value ? (
            <Badge className="" variant="secondary">
              <Check className="mr-1 size-3" />
              Enabled
            </Badge>
          ) : (
            <Badge className="text-muted-foreground" variant="outline">
              <X className="mr-1 size-3" />
              Disabled
            </Badge>
          ),
        isApplicable: (operation) =>
          operation === 'readUrl' || operation === 'extractLinks',
      },
    ],
  },
];

export const DetailedOptions = memo(function DetailedOptions({
  className,
}: {
  className?: string;
}) {
  const requestUrl = usePlaygroundCoreSelector('requestUrl');
  const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
  const currentOptions = usePlaygroundOptionsSelector('currentOptions');
  const resetToDefaults = usePlaygroundActionsSelector('resetToDefaults');

  const operation = selectedOperation;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="font-medium text-muted-foreground text-xs">
          Detailed Options
        </Label>
        <div className="flex items-center gap-1">
          <Button
            className="w-fit select-none text-muted-foreground text-xs"
            onClick={() => resetToDefaults(operation)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Trash2 className="size-3" />
            Reset all
          </Button>

          <CopyButton
            className="w-fit select-none text-muted-foreground text-xs"
            iconProps={{ className: 'size-3' }}
            size={'sm'}
            textToCopy={JSON.stringify(
              { ...currentOptions, url: requestUrl },
              null,
              2,
            )}
            type="button"
            variant="outline"
          >
            Options
          </CopyButton>
        </div>
      </div>
      {DETAILED_OPTIONS_CONFIG.map((group) => {
        // Filter options that are applicable to the current operation
        const applicableOptions = group.options.filter((option) => {
          if (option.operations === 'all') {
            return true;
          }
          if (option.isApplicable) {
            return option.isApplicable(operation);
          }
          return option.operations.includes(operation);
        });

        if (applicableOptions.length === 0) {
          return null;
        }

        return (
          <Card className="border-muted/50" key={group.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className={cn(group.colorClass)}>{group.icon}</span>
                <h4 className="font-medium text-sm">{group.title}</h4>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                {applicableOptions.map((option) => {
                  const value = option.getValue(currentOptions);
                  const displayValue = option.getDisplayValue(
                    value,
                    currentOptions,
                    operation,
                  );

                  return (
                    <div className="space-y-2" key={option.key}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {option.icon}
                          </span>
                          <span className="font-medium text-sm">
                            {option.label}
                          </span>
                        </div>
                        <div className="flex-shrink-0">{displayValue}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
