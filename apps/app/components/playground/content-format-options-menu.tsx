'use client';

import type {
  LinksOptions,
  MetadataOptions,
  ReadOptions,
} from '@deepcrawl/types';
import {
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_METADATA_OPTIONS,
  DEFAULT_READ_OPTIONS,
} from '@deepcrawl/types/configs';
import type { ScrapeOptions } from '@deepcrawl/types/services/scrape/types';
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { FilePenLineIcon } from '@deepcrawl/ui/components/icons/file-pen-line';
import { MarkdownIcon } from '@deepcrawl/ui/components/icons/markdown';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Checkbox } from '@deepcrawl/ui/components/ui/checkbox';
import {
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@deepcrawl/ui/components/ui/dropdown-menu';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { Switch } from '@deepcrawl/ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { ExtractLinksOptions, ReadUrlOptions } from 'deepcrawl';
import {
  Bot,
  FileCheck2,
  FileCode2,
  FileCog,
  ListTree,
  Network,
  Settings2,
} from 'lucide-react';
import type { ElementType, ReactElement } from 'react';
import { cloneElement, isValidElement, useRef, useState } from 'react';
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

type MetadataOptionsInput =
  | ReadUrlOptions['metadataOptions']
  | ExtractLinksOptions['metadataOptions'];

interface ContentFormatOptionsMenuProps {
  operation: DeepcrawlOperations;
  contentFormatOptions: AllContentFormatOptions | undefined;
  onContentFormatOptionsChange: (
    contentFormatOptions: AllContentFormatOptions,
  ) => void;
  metadataOptions?: MetadataOptionsInput;
  onMetadataOptionsChange?: (metadataOptions: MetadataOptionsInput) => void;
}

// Configuration for different operations
const OPERATION_CONFIGS = {
  readUrl: {
    availableOptions: [
      'markdown',
      'metadata',
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
  markdown: {
    label: 'Extract Markdown',
    tooltip: 'Whether to extract markdown from the page.',
    icon: <MarkdownIcon disableAnimation size={18} />,
  },
  metadata: {
    label: 'Extract Metadata',
    tooltip: 'Whether to extract metadata from the page.',
    icon: <FileCog />,
  },
  cleanedHtml: {
    label: 'Cleaned HTML',
    tooltip: 'Whether to return cleaned HTML.',
    icon: <FileCheck2 />,
  },
  rawHtml: {
    label: 'Raw HTML',
    tooltip: 'Whether to return raw HTML.',
    icon: <FileCode2 />,
  },
  robots: {
    label: 'Fetch Robots.txt',
    tooltip: 'Whether to fetch and parse robots.txt.',
    icon: <Bot />,
  },
  tree: {
    label: 'Build Site Tree',
    tooltip: 'Whether to build a site map tree.',
    icon: <ListTree />,
  },
  sitemapXML: {
    label: 'Sitemap XML',
    tooltip: 'Parse and include sitemap.xml data',
    badge: <Badge variant="secondary">Beta</Badge>,
    icon: <Network />,
  },
} as const;

// Metadata field definitions
const METADATA_FIELDS: Array<{
  key: keyof MetadataOptions;
  label: string;
  tooltip: string;
}> = [
  {
    key: 'title',
    label: 'Title',
    tooltip: 'Extract page title from title tag or meta title',
  },
  {
    key: 'description',
    label: 'Description',
    tooltip: 'Extract meta description content',
  },
  {
    key: 'language',
    label: 'Language',
    tooltip: 'Extract page language from html lang attribute',
  },
  {
    key: 'canonical',
    label: 'Canonical URL',
    tooltip: 'Extract canonical URL from link rel="canonical"',
  },
  {
    key: 'robots',
    label: 'Robots',
    tooltip: 'Extract robots directives from meta robots',
  },
  {
    key: 'author',
    label: 'Author',
    tooltip: 'Extract author information from meta author',
  },
  {
    key: 'keywords',
    label: 'Keywords',
    tooltip: 'Extract meta keywords and convert to array',
  },
  {
    key: 'favicon',
    label: 'Favicon',
    tooltip: 'Extract favicon URL from link rel="icon" or similar',
  },
  {
    key: 'openGraph',
    label: 'Open Graph',
    tooltip: 'Extract Open Graph metadata (og:* properties)',
  },
  {
    key: 'twitter',
    label: 'Twitter Cards',
    tooltip: 'Extract Twitter Card metadata (twitter:* properties)',
  },
];

interface IconProps {
  className?: string;
  'aria-hidden'?: boolean;
}

function renderIcon(
  icon: ReactElement | ElementType<IconProps>,
  extraClass: string,
) {
  if (isValidElement(icon)) {
    const el = icon as ReactElement<IconProps>;
    return cloneElement<IconProps>(el, {
      className: cn(el.props?.className, extraClass),
      'aria-hidden': true,
    });
  }
  const C = icon as ElementType<IconProps>;
  return <C aria-hidden className={extraClass} />;
}

export function ContentFormatOptionsMenu({
  operation,
  contentFormatOptions,
  onContentFormatOptionsChange,
  metadataOptions,
  onMetadataOptionsChange,
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

    // Also reset metadata options if the handler is available
    if (onMetadataOptionsChange) {
      resetMetadataToDefaults();
    }
  };

  // Metadata options helpers
  const updateMetadataOption = (key: keyof MetadataOptions, value: boolean) => {
    if (onMetadataOptionsChange) {
      onMetadataOptionsChange({
        ...metadataOptions,
        [key]: value,
      });
    }
  };

  const resetMetadataToDefaults = () => {
    if (onMetadataOptionsChange) {
      onMetadataOptionsChange({
        title: DEFAULT_METADATA_OPTIONS.title,
        description: DEFAULT_METADATA_OPTIONS.description,
        language: DEFAULT_METADATA_OPTIONS.language,
        canonical: DEFAULT_METADATA_OPTIONS.canonical,
        robots: DEFAULT_METADATA_OPTIONS.robots,
        author: DEFAULT_METADATA_OPTIONS.author,
        keywords: DEFAULT_METADATA_OPTIONS.keywords,
        favicon: DEFAULT_METADATA_OPTIONS.favicon,
        openGraph: DEFAULT_METADATA_OPTIONS.openGraph,
        twitter: DEFAULT_METADATA_OPTIONS.twitter,
      });
    }
  };

  // Check if metadata extraction is enabled
  const isMetadataEnabled = Boolean(
    contentFormatOptions?.metadata ?? operationConfig.defaults.metadata,
  );

  // Check if metadata options have been customized
  const hasCustomMetadataSettings =
    metadataOptions &&
    METADATA_FIELDS.some(({ key }) => {
      const currentValue = metadataOptions[key];
      const defaultValue = DEFAULT_METADATA_OPTIONS[key];
      return currentValue !== undefined && currentValue !== defaultValue;
    });

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

                // Special handling for metadata option - add sub-menu
                if (optionKey === 'metadata' && onMetadataOptionsChange) {
                  return (
                    <div className="space-y-2" key={optionKey}>
                      {/* Main metadata toggle */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex w-full items-center space-x-2">
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
                              className="flex-1 cursor-pointer text-sm"
                              htmlFor={`content-format-${optionKey}`}
                            >
                              {renderIcon(optionDef.icon, 'h-4 w-4')}
                              {optionDef.label}
                              {hasCustomMetadataSettings && (
                                <div className="ml-1 inline-flex h-2 w-2 rounded-full bg-orange-500" />
                              )}
                              {'badge' in optionDef && optionDef.badge}
                              {!isMetadataEnabled && (
                                <Badge
                                  className="ml-auto text-muted-foreground text-xs uppercase"
                                  variant="outline"
                                >
                                  Default: {defaultValue ? 'On' : 'Off'}
                                </Badge>
                              )}
                            </Label>

                            {/* Metadata sub-menu - only show when metadata is enabled */}
                            {isMetadataEnabled && (
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger
                                  className="data-[state=open]:!text-foreground gap-x-1 rounded-lg border px-2 py-0.5 text-muted-foreground"
                                  icon={<Settings2 className="size-3" />}
                                >
                                  <span className="font-medium text-xs uppercase">
                                    Configure
                                  </span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent
                                    className="w-80 p-4"
                                    sideOffset={25}
                                  >
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">
                                          Metadata Fields
                                        </h4>
                                        <Button
                                          className="text-xs"
                                          onClick={resetMetadataToDefaults}
                                          size="sm"
                                          variant="outline"
                                        >
                                          Reset
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        {METADATA_FIELDS.map(
                                          ({ key, label, tooltip }) => (
                                            <Tooltip key={key}>
                                              <TooltipTrigger asChild>
                                                <div className="flex w-fit items-center space-x-2">
                                                  <Checkbox
                                                    checked={Boolean(
                                                      metadataOptions?.[key] ??
                                                        DEFAULT_METADATA_OPTIONS[
                                                          key
                                                        ],
                                                    )}
                                                    id={`metadata-${key}`}
                                                    onCheckedChange={(
                                                      checked,
                                                    ) =>
                                                      updateMetadataOption(
                                                        key,
                                                        Boolean(checked),
                                                      )
                                                    }
                                                  />
                                                  <Label
                                                    className="cursor-pointer text-sm"
                                                    htmlFor={`metadata-${key}`}
                                                  >
                                                    {label}
                                                  </Label>
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent side="right">
                                                <p>{tooltip}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent align="end" side="bottom">
                          <p>{optionDef.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                }

                // Standard option rendering for non-metadata options
                const content = (
                  <div
                    className="flex w-full items-center space-x-2"
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
                      className="flex-1 cursor-pointer text-sm"
                      htmlFor={`content-format-${optionKey}`}
                    >
                      {renderIcon(optionDef.icon, 'h-4 w-4')}
                      {optionDef.label}
                      {'badge' in optionDef && optionDef.badge}
                      <Badge
                        className="ml-auto text-muted-foreground text-xs uppercase"
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
                    <TooltipContent align="end" side="bottom">
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
