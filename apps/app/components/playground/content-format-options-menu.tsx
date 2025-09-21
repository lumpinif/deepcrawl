'use client';

import type { LinksOptions, ReadOptions } from '@deepcrawl/types';
import {
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_READ_OPTIONS,
} from '@deepcrawl/types/configs';
import type { ScrapeOptions } from '@deepcrawl/types/services/scrape/types';
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { FilePenLineIcon } from '@deepcrawl/ui/components/icons/file-pen-line';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { Switch } from '@deepcrawl/ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import { useRef, useState } from 'react';
import type { DeepcrawlOperations } from '@/hooks/playground/use-task-input-state';

// Union type for all possible content format options
// {
//   metadata?: boolean;
//   cleanedHtml?: boolean;
//   robots?: boolean;
//   sitemapXML?: boolean;
//   tree?: boolean;
//   markdown?: boolean;
//   rawHtml?: boolean;
// };
type AllContentFormatOptions = Pick<
  ScrapeOptions,
  'metadata' | 'cleanedHtml' | 'robots' | 'sitemapXML'
> &
  Pick<LinksOptions, 'tree'> &
  Pick<ReadOptions, 'markdown' | 'rawHtml'> & {};

interface ContentFormatOptionsMenuProps {
  operation: DeepcrawlOperations;
  contentFormatOptions: AllContentFormatOptions | undefined;
  onContentFormatOptionsChange: (
    contentFormatOptions: AllContentFormatOptions,
  ) => void;
}

// Configuration for different operations
const OPERATION_CONFIGS = {
  readUrl: {
    availableOptions: [
      'metadata',
      'markdown',
      'cleanedHtml',
      'rawHtml',
      'robots',
    ] as const,
    defaults: {
      metadata: DEFAULT_READ_OPTIONS.metadata,
      markdown: DEFAULT_READ_OPTIONS.markdown,
      cleanedHtml: DEFAULT_READ_OPTIONS.cleanedHtml,
      rawHtml: DEFAULT_READ_OPTIONS.rawHtml,
      robots: DEFAULT_READ_OPTIONS.robots,
    },
  },
  extractLinks: {
    availableOptions: [
      'tree',
      'metadata',
      'cleanedHtml',
      'robots',
      'sitemapXML',
    ] as const,
    defaults: {
      tree: DEFAULT_LINKS_OPTIONS.tree,
      metadata: DEFAULT_LINKS_OPTIONS.metadata,
      cleanedHtml: DEFAULT_LINKS_OPTIONS.cleanedHtml,
      robots: DEFAULT_LINKS_OPTIONS.robots,
      sitemapXML: DEFAULT_LINKS_OPTIONS.sitemapXML,
    },
  },
} as const;

// Option definitions with metadata
const OPTION_DEFINITIONS = {
  metadata: {
    label: 'Extract Metadata',
    tooltip: 'Whether to extract metadata from the page.',
  },
  markdown: {
    label: 'Extract Markdown',
    tooltip: 'Whether to extract markdown from the page.',
  },
  cleanedHtml: {
    label: 'Cleaned HTML',
    tooltip: 'Whether to return cleaned HTML.',
  },
  rawHtml: {
    label: 'Raw HTML',
    tooltip: 'Whether to return raw HTML.',
  },
  robots: {
    label: 'Fetch Robots.txt',
    tooltip: 'Whether to fetch and parse robots.txt.',
  },
  tree: {
    label: 'Build Site Tree',
    tooltip: 'Whether to build a site map tree.',
  },
  sitemapXML: {
    label: 'Sitemap XML',
    tooltip: 'Parse and include sitemap.xml data',
    badge: <Badge variant="secondary">Beta</Badge>,
  },
} as const;

export function ContentFormatOptionsMenu({
  operation,
  contentFormatOptions,
  onContentFormatOptionsChange,
}: ContentFormatOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  // Get operation-specific configuration
  const operationConfig =
    OPERATION_CONFIGS[operation as keyof typeof OPERATION_CONFIGS];

  // Skip rendering if operation doesn't have content options or is getMarkdown
  if (!operationConfig || operation === 'getMarkdown') {
    return null;
  }

  const updateContentFormatOption = (
    key: keyof AllContentFormatOptions,
    value: boolean,
  ) => {
    onContentFormatOptionsChange({
      ...contentFormatOptions,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onContentFormatOptionsChange(operationConfig.defaults);
  };

  const hasCustomSettings = operationConfig.availableOptions.some(
    (optionKey) => {
      const currentValue =
        contentFormatOptions?.[optionKey as keyof AllContentFormatOptions];
      const defaultValue =
        operationConfig.defaults[
          optionKey as keyof typeof operationConfig.defaults
        ];
      return currentValue !== undefined && currentValue !== defaultValue;
    },
  );

  return (
    <Tooltip>
      <PromptInputActionMenu onOpenChange={setIsOpen} open={isOpen}>
        <TooltipTrigger asChild>
          <PromptInputActionMenuTrigger
            className="cursor-help"
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
          >
            <FilePenLineIcon
              className={cn('h-4 w-4', hasCustomSettings && 'text-orange-600')}
              ref={iconRef}
            />
          </PromptInputActionMenuTrigger>
        </TooltipTrigger>
        <PromptInputActionMenuContent
          alignOffset={-4}
          className="w-fit overflow-visible p-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
          sideOffset={10}
        >
          <div className="min-w-80 space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Content Format Options</h3>
              <Button
                className="text-xs"
                onClick={resetToDefaults}
                size="sm"
                variant="outline"
              >
                Reset
              </Button>
            </div>

            <div className="space-y-4">
              {operationConfig.availableOptions.map((optionKey) => {
                const optionDef =
                  OPTION_DEFINITIONS[
                    optionKey as keyof typeof OPTION_DEFINITIONS
                  ];
                const defaultValue =
                  operationConfig.defaults[
                    optionKey as keyof typeof operationConfig.defaults
                  ];
                const currentValue =
                  contentFormatOptions?.[
                    optionKey as keyof AllContentFormatOptions
                  ] ?? defaultValue;

                const content = (
                  <div
                    className="flex w-fit items-center space-x-2"
                    key={optionKey}
                  >
                    <Switch
                      checked={Boolean(currentValue)}
                      id={`content-format-${optionKey}`}
                      onCheckedChange={(checked) =>
                        updateContentFormatOption(
                          optionKey as keyof AllContentFormatOptions,
                          Boolean(checked),
                        )
                      }
                    />
                    <Label
                      className="cursor-pointer text-sm"
                      htmlFor={`content-format-${optionKey}`}
                    >
                      {optionDef.label}
                      {'badge' in optionDef && optionDef.badge}
                      <Badge
                        className="ml-2 text-muted-foreground text-xs uppercase"
                        variant="outline"
                      >
                        Default: {defaultValue ? 'On' : 'Off'}
                      </Badge>
                    </Label>
                  </div>
                );

                return (
                  <Tooltip key={optionKey}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{optionDef.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <div className="border-t pt-3">
              <p className="text-muted-foreground text-xs">
                * Content format settings control what data is extracted from
                the page
              </p>
            </div>
          </div>
        </PromptInputActionMenuContent>
        <TooltipContent align="start" side="bottom">
          <p>Configure content extraction and format options</p>
        </TooltipContent>
      </PromptInputActionMenu>
    </Tooltip>
  );
}
