'use client';

import {
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
  DEFAULT_METADATA_OPTIONS,
  DEFAULT_READ_OPTIONS,
  DEFAULT_TREE_OPTIONS,
} from '@deepcrawl/types/configs';
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
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@deepcrawl/ui/components/ui/select';
import { Separator } from '@deepcrawl/ui/components/ui/separator';
import { Switch } from '@deepcrawl/ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import type {
  LinksOptions,
  MarkdownConverterOptions,
  MetadataOptions,
  ReadOptions,
  ScrapeOptions,
  TreeOptions,
} from 'deepcrawl/types';
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
import {
  cloneElement,
  isValidElement,
  memo,
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  usePlaygroundCoreSelector,
  usePlaygroundOptionsSelector,
} from '@/contexts/playground-context';
import type { PlaygroundOptionsContextValue } from '@/hooks/playground/types';

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
type ContentFormatOptions = Pick<
  ScrapeOptions,
  'metadata' | 'cleanedHtml' | 'robots' | 'sitemapXML'
> &
  Pick<LinksOptions, 'tree'> &
  Pick<ReadOptions, 'markdown' | 'rawHtml'> & {};

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

// Tree option field definitions !IMPORTANT!: TEHY ARE FLATTEND IN THE LINKSOPTIONS ROOT LEVEL INSTEAD OF A NESTED OBJECT
const TREE_OPTION_FIELDS: Array<{
  key: keyof TreeOptions;
  label: string;
  tooltip: string;
  type: 'switch' | 'select';
  options?: Array<{ value: string; label: string; tooltip?: string }>;
}> = [
  {
    key: 'folderFirst',
    label: 'Folders First',
    tooltip: 'Whether to place folders before leaf nodes in the tree',
    type: 'switch',
  },
  {
    key: 'extractedLinks',
    label: 'Include Extracted Links',
    tooltip: 'Whether to include extracted links for each node in the tree',
    type: 'switch',
  },
  {
    key: 'subdomainAsRootUrl',
    label: 'Subdomain as Root URL',
    tooltip:
      'Whether to treat subdomain as root URL. If false, subdomain will be excluded from root URL',
    type: 'switch',
  },
  {
    key: 'isPlatformUrl',
    label: 'Platform URL',
    tooltip:
      'Whether the URL is a platform URL. If true, the targetUrl will be the platform URL',
    type: 'switch',
  },
  {
    key: 'linksOrder',
    label: 'Links Ordering',
    tooltip: 'How to order links within each folder',
    type: 'select',
    options: [
      {
        value: 'page',
        label: 'Page Order',
        tooltip: 'Preserve original order',
      },
      {
        value: 'alphabetical',
        label: 'Alphabetical (A→Z)',
        tooltip: 'Sort links alphabetically',
      },
    ],
  },
];

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

// Markdown option field definitions
const MARKDOWN_OPTION_FIELDS: Array<{
  key: keyof typeof DEFAULT_MARKDOWN_CONVERTER_OPTIONS;
  label: string;
  tooltip: string;
  type: 'switch' | 'select' | 'number';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
}> = [
  {
    key: 'preferNativeParser',
    label: 'Prefer Native Parser',
    tooltip: 'Use native parser when available for better performance',
    type: 'switch',
  },
  {
    key: 'keepDataImages',
    label: 'Keep Data Images',
    tooltip: 'Preserve base64 encoded images in markdown output',
    type: 'switch',
  },
  {
    key: 'useInlineLinks',
    label: 'Use Inline Links',
    tooltip: 'Use inline link format instead of reference links',
    type: 'switch',
  },
  {
    key: 'useLinkReferenceDefinitions',
    label: 'Use Link References',
    tooltip: 'Generate reference-style links with definitions at the end',
    type: 'switch',
  },
  {
    key: 'bulletMarker',
    label: 'Bullet Marker',
    tooltip: 'Character used for unordered list items',
    type: 'select',
    options: [
      { value: '*', label: '* (asterisk)' },
      { value: '-', label: '- (dash)' },
      { value: '+', label: '+ (plus)' },
    ],
  },
  {
    key: 'codeBlockStyle',
    label: 'Code Block Style',
    tooltip: 'Format style for code blocks in markdown',
    type: 'select',
    options: [
      { value: 'fenced', label: 'Fenced (```)' },
      { value: 'indented', label: 'Indented (4 spaces)' },
    ],
  },
  {
    key: 'maxConsecutiveNewlines',
    label: 'Max Consecutive Newlines',
    tooltip: 'Maximum number of consecutive newlines allowed',
    type: 'number',
    min: 1,
    max: 10,
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

// Type for all possible content format option keys
type AvailableOptionKey = keyof ContentFormatOptions;
// TODO: CONSIDER SHOULD WE ACTUALLY MOVE THIS FUNCTION TO THE HOOK'S SETOPTIONS FUNCTION LEVEL? FOR EXAMPLE MAKE A GUARD TO CHECK IF NEW UPDATES ARE VALID FOR THE CURRENT OPERATION?
// Helper function to filter options by current operation with proper typing
const getFilteredContentFormatOptions = <
  T extends (typeof OPERATION_CONFIGS)[keyof typeof OPERATION_CONFIGS],
>(
  contentFormatOptions: ContentFormatOptions,
  operationConfig: T,
): Pick<ContentFormatOptions, T['availableOptions'][number]> => {
  const availableKeys =
    operationConfig.availableOptions as readonly AvailableOptionKey[];

  return Object.fromEntries(
    Object.entries(contentFormatOptions).filter(([key]) =>
      availableKeys.includes(key as AvailableOptionKey),
    ),
  ) as Pick<ContentFormatOptions, T['availableOptions'][number]>;
};

export const ContentFormatOptionsMenu = memo(
  function ContentFormatOptionsMenu() {
    // Get state and actions from context
    const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
    const currentOpts = usePlaygroundOptionsSelector('currentOptions');
    const selectSetOptions = useCallback(
      (state: PlaygroundOptionsContextValue) =>
        state.currentQueryState.setOptions,
      [],
    );
    const setOptions = usePlaygroundOptionsSelector(selectSetOptions);

    // Extract all the data that was previously passed as props
    const op = selectedOperation;

    const contentFormatOptions = {
      metadata: 'metadata' in currentOpts ? currentOpts.metadata : undefined,
      markdown:
        'markdown' in currentOpts
          ? currentOpts.markdown
          : selectedOperation === 'getMarkdown', // always true for getMarkdown
      cleanedHtml:
        'cleanedHtml' in currentOpts ? currentOpts.cleanedHtml : undefined,
      rawHtml: 'rawHtml' in currentOpts ? currentOpts.rawHtml : undefined,
      robots: 'robots' in currentOpts ? currentOpts.robots : undefined,
      tree: 'tree' in currentOpts ? currentOpts.tree : undefined,
      sitemapXML:
        'sitemapXML' in currentOpts ? currentOpts.sitemapXML : undefined,
    } as ContentFormatOptions;

    const metadataOptions =
      'metadataOptions' in currentOpts
        ? currentOpts.metadataOptions
        : undefined;
    const treeOptions =
      'folderFirst' in currentOpts && selectedOperation === 'extractLinks'
        ? {
            folderFirst: currentOpts.folderFirst,
            linksOrder: currentOpts.linksOrder,
            extractedLinks: currentOpts.extractedLinks,
            subdomainAsRootUrl: currentOpts.subdomainAsRootUrl,
            isPlatformUrl: currentOpts.isPlatformUrl,
          }
        : undefined;
    const markdownOptions =
      'markdownConverterOptions' in currentOpts
        ? currentOpts.markdownConverterOptions
        : undefined;

    // Create change handlers that use context
    const onContentFormatOptionsChange = (
      contentFormatOptions: ContentFormatOptions,
    ) => {
      setOptions(
        getFilteredContentFormatOptions(contentFormatOptions, operationConfig),
      );
    };

    const onMetadataOptionsChange = (metadataOptions: MetadataOptions) => {
      setOptions({
        metadataOptions: {
          ...('metadataOptions' in currentOpts
            ? currentOpts.metadataOptions
            : {}),
          ...metadataOptions,
        },
      });
    };

    const onTreeOptionsChange = (treeOptions: TreeOptions) => {
      // Only allow tree options for extractLinks operation
      if (op !== 'extractLinks') {
        return;
      }

      const treeOptionsToSet = {
        ...TREE_OPTION_FIELDS.reduce(
          (acc, field) => {
            if (field.key in currentOpts) {
              acc[field.key] =
                currentOpts[field.key as keyof typeof currentOpts];
            }
            return acc;
          },
          {} as Record<string, unknown>,
        ),
        ...treeOptions,
      };

      setOptions(treeOptionsToSet);
    };

    const onMarkdownOptionsChange = (
      markdownOptions: MarkdownConverterOptions,
    ) => {
      // Only allow markdown options for readUrl and getMarkdown operations
      if (op !== 'readUrl' && op !== 'getMarkdown') {
        return;
      }

      setOptions({
        markdownConverterOptions: {
          ...('markdownConverterOptions' in currentOpts
            ? currentOpts.markdownConverterOptions
            : {}),
          ...markdownOptions,
        },
      });
    };
    const [isOpen, setIsOpen] = useState(false);
    const [isMetadataSubOpen, setIsMetadataSubOpen] = useState(false);
    const [isTreeSubOpen, setIsTreeSubOpen] = useState(false);
    const [isMarkdownSubOpen, setIsMarkdownSubOpen] = useState(false);
    const iconRef = useRef<{
      startAnimation: () => void;
      stopAnimation: () => void;
    }>(null);

    // Get operation-specific configuration
    const operationConfig =
      OPERATION_CONFIGS[op as keyof typeof OPERATION_CONFIGS];

    // Skip rendering if operation doesn't have content options
    if (!operationConfig) {
      return null;
    }

    const resetToDefaults = () => {
      onContentFormatOptionsChange(operationConfig.defaults);

      // Also reset metadata options
      resetMetadataToDefaults();

      // Also reset tree options
      resetTreeToDefaults();

      // Also reset markdown options
      resetMarkdownToDefaults();
    };

    // Metadata options helpers
    const resetMetadataToDefaults = () => {
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
    };

    // Tree options helpers
    const resetTreeToDefaults = () => {
      onTreeOptionsChange({
        folderFirst: DEFAULT_TREE_OPTIONS.folderFirst,
        linksOrder: DEFAULT_TREE_OPTIONS.linksOrder,
        extractedLinks: DEFAULT_TREE_OPTIONS.extractedLinks,
        subdomainAsRootUrl: DEFAULT_TREE_OPTIONS.subdomainAsRootUrl,
        isPlatformUrl: DEFAULT_TREE_OPTIONS.isPlatformUrl,
      });
    };

    // Markdown options helpers
    const resetMarkdownToDefaults = () => {
      onMarkdownOptionsChange({
        preferNativeParser:
          DEFAULT_MARKDOWN_CONVERTER_OPTIONS.preferNativeParser,
        bulletMarker: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.bulletMarker,
        codeBlockStyle: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.codeBlockStyle,
        maxConsecutiveNewlines:
          DEFAULT_MARKDOWN_CONVERTER_OPTIONS.maxConsecutiveNewlines,
        keepDataImages: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.keepDataImages,
        useInlineLinks: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useInlineLinks,
        useLinkReferenceDefinitions:
          DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useLinkReferenceDefinitions,
      });
    };

    // Check if metadata extraction is enabled
    const isMetadataEnabled = Boolean(
      contentFormatOptions?.metadata ??
        ('metadata' in operationConfig.defaults
          ? operationConfig.defaults.metadata
          : false),
    );

    // Check if tree is enabled (only for extractLinks operation)
    const isTreeEnabled = Boolean(
      contentFormatOptions?.tree ??
        (op === 'extractLinks' ? DEFAULT_LINKS_OPTIONS.tree : false),
    );

    // Check if markdown is enabled (for readUrl and getMarkdown operations)
    const isMarkdownEnabled = Boolean(
      contentFormatOptions?.markdown ??
        (op === 'readUrl'
          ? DEFAULT_READ_OPTIONS.markdown
          : op === 'getMarkdown'),
    );

    // Check if metadata options have been customized
    const hasCustomMetadataSettings =
      metadataOptions &&
      METADATA_FIELDS.some(({ key }) => {
        const currentValue = metadataOptions[key];
        const defaultValue = DEFAULT_METADATA_OPTIONS[key];
        return currentValue !== undefined && currentValue !== defaultValue;
      });

    // Check if tree options have been customized
    const hasCustomTreeSettings =
      treeOptions &&
      TREE_OPTION_FIELDS.some(({ key }) => {
        const currentValue = treeOptions[key];
        const defaultValue = DEFAULT_TREE_OPTIONS[key];
        return currentValue !== undefined && currentValue !== defaultValue;
      });

    // Check if markdown options have been customized
    const hasCustomMarkdownSettings =
      markdownOptions &&
      MARKDOWN_OPTION_FIELDS.some(({ key }) => {
        const currentValue = markdownOptions[key];
        const defaultValue = DEFAULT_MARKDOWN_CONVERTER_OPTIONS[key];
        return currentValue !== undefined && currentValue !== defaultValue;
      });

    const hasCustomSettings =
      hasCustomMetadataSettings ||
      hasCustomTreeSettings ||
      hasCustomMarkdownSettings ||
      operationConfig.availableOptions.some((optionKey) => {
        const currentValue =
          contentFormatOptions?.[optionKey as keyof ContentFormatOptions];
        const defaultValue =
          operationConfig.defaults[
            optionKey as keyof typeof operationConfig.defaults
          ];
        return currentValue !== undefined && currentValue !== defaultValue;
      });

    return (
      <Tooltip>
        <PromptInputActionMenu onOpenChange={setIsOpen} open={isOpen}>
          <TooltipTrigger asChild>
            <PromptInputActionMenuTrigger
              className="cursor-help"
              data-customized={hasCustomSettings ? 'true' : 'false'}
              data-state={isOpen ? 'open' : 'closed'}
              onMouseEnter={() => iconRef.current?.startAnimation()}
              onMouseLeave={() => iconRef.current?.stopAnimation()}
            >
              <FilePenLineIcon
                className={cn(
                  'group-hover:!text-metadata group-data-[customized=true]:text-metadata',
                )}
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
                      optionKey as keyof ContentFormatOptions
                    ] ?? defaultValue;

                  // Special handling for metadata option - add sub-menu
                  if (optionKey === 'metadata') {
                    return (
                      <div className="group/metadata space-y-2" key={optionKey}>
                        {/* Main metadata toggle */}
                        <Tooltip
                          delayDuration={isMetadataSubOpen ? 999999 : undefined}
                        >
                          <TooltipTrigger asChild>
                            <div className="flex w-full items-center space-x-2">
                              <Switch
                                checked={Boolean(currentValue)}
                                id={`content-format-${optionKey}`}
                                onCheckedChange={(checked) =>
                                  onContentFormatOptionsChange({
                                    [optionKey]: Boolean(checked),
                                  })
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
                                <DropdownMenuSub
                                  onOpenChange={setIsMetadataSubOpen}
                                >
                                  <DropdownMenuSubTrigger
                                    className="data-[state=open]:!text-foreground gap-x-1 rounded-lg border px-2 py-0.5 text-muted-foreground transition-colors duration-200 ease-out group-hover/metadata:bg-muted group-hover/metadata:text-foreground"
                                    icon={<Settings2 className="size-3" />}
                                  >
                                    <span className="font-medium text-xs uppercase">
                                      Configure
                                    </span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent
                                      className="min-w-80 p-4"
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
                                                        metadataOptions?.[
                                                          key
                                                        ] ??
                                                          DEFAULT_METADATA_OPTIONS[
                                                            key
                                                          ],
                                                      )}
                                                      id={`metadata-${key}`}
                                                      onCheckedChange={(
                                                        checked,
                                                      ) =>
                                                        onMetadataOptionsChange?.(
                                                          {
                                                            [key]:
                                                              Boolean(checked),
                                                          },
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
                          <TooltipContent align="start" side="bottom">
                            <p>{optionDef.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  }

                  // Special handling for tree option - add sub-menu
                  if (optionKey === 'tree') {
                    return (
                      <div className="group/tree space-y-2" key={optionKey}>
                        {/* Main tree toggle */}
                        <Tooltip
                          delayDuration={isTreeSubOpen ? 999999 : undefined}
                        >
                          <TooltipTrigger asChild>
                            <div className="flex w-full items-center space-x-2">
                              <Switch
                                checked={Boolean(currentValue)}
                                id={`content-format-${optionKey}`}
                                onCheckedChange={(checked) =>
                                  onContentFormatOptionsChange({
                                    [optionKey]: Boolean(checked),
                                  })
                                }
                              />
                              <Label
                                className="flex-1 cursor-pointer text-sm"
                                htmlFor={`content-format-${optionKey}`}
                              >
                                {renderIcon(optionDef.icon, 'h-4 w-4')}
                                {optionDef.label}
                                {hasCustomTreeSettings && (
                                  <div className="ml-1 inline-flex h-2 w-2 rounded-full bg-orange-500" />
                                )}
                                {'badge' in optionDef && optionDef.badge}
                                {!isTreeEnabled && (
                                  <Badge
                                    className="ml-auto text-muted-foreground text-xs uppercase"
                                    variant="outline"
                                  >
                                    Default: {defaultValue ? 'On' : 'Off'}
                                  </Badge>
                                )}
                              </Label>

                              {/* Tree sub-menu - only show when tree is enabled */}
                              {isTreeEnabled && (
                                <DropdownMenuSub
                                  onOpenChange={setIsTreeSubOpen}
                                >
                                  <DropdownMenuSubTrigger
                                    className="data-[state=open]:!text-foreground gap-x-1 rounded-lg border px-2 py-0.5 text-muted-foreground transition-colors duration-200 ease-out group-hover/tree:bg-muted group-hover/tree:text-foreground"
                                    icon={<Settings2 className="size-3" />}
                                  >
                                    <span className="font-medium text-xs uppercase">
                                      Configure
                                    </span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent
                                      className="min-w-80 p-4"
                                      sideOffset={25}
                                    >
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-medium text-sm">
                                            Tree Options
                                          </h4>
                                          <Button
                                            className="text-xs"
                                            onClick={resetTreeToDefaults}
                                            size="sm"
                                            variant="outline"
                                          >
                                            Reset
                                          </Button>
                                        </div>
                                        <div className="space-y-3">
                                          {TREE_OPTION_FIELDS.map(
                                            ({
                                              key,
                                              label,
                                              tooltip,
                                              type,
                                              options,
                                            }) => (
                                              <Tooltip key={key}>
                                                <TooltipTrigger asChild>
                                                  <div className="flex w-full items-center space-x-2">
                                                    {type === 'switch' ? (
                                                      <>
                                                        <Switch
                                                          checked={Boolean(
                                                            treeOptions?.[
                                                              key
                                                            ] ??
                                                              DEFAULT_TREE_OPTIONS[
                                                                key
                                                              ],
                                                          )}
                                                          id={`tree-${key}`}
                                                          onCheckedChange={(
                                                            checked,
                                                          ) =>
                                                            onTreeOptionsChange?.(
                                                              {
                                                                [key]:
                                                                  Boolean(
                                                                    checked,
                                                                  ),
                                                              },
                                                            )
                                                          }
                                                        />
                                                        <Label
                                                          className="flex-1 cursor-pointer text-sm"
                                                          htmlFor={`tree-${key}`}
                                                        >
                                                          {label}
                                                        </Label>
                                                      </>
                                                    ) : (
                                                      <div className="w-full space-y-2">
                                                        <Separator />
                                                        <div className="flex w-full items-center justify-between gap-x-2">
                                                          <Label
                                                            className="min-w-0 flex-1 text-sm"
                                                            htmlFor={`tree-${key}`}
                                                          >
                                                            {label}
                                                          </Label>
                                                          <Select
                                                            onValueChange={(
                                                              value,
                                                            ) =>
                                                              onTreeOptionsChange?.(
                                                                {
                                                                  [key]: value,
                                                                },
                                                              )
                                                            }
                                                            value={
                                                              (treeOptions?.[
                                                                key
                                                              ] as string) ??
                                                              (DEFAULT_TREE_OPTIONS[
                                                                key
                                                              ] as string)
                                                            }
                                                          >
                                                            <SelectTrigger
                                                              className="w-auto min-w-fit"
                                                              id={`tree-${key}`}
                                                            >
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              {options?.map(
                                                                (option) => (
                                                                  <SelectItem
                                                                    key={
                                                                      option.value
                                                                    }
                                                                    title={
                                                                      option.tooltip
                                                                    }
                                                                    value={
                                                                      option.value
                                                                    }
                                                                  >
                                                                    {
                                                                      option.label
                                                                    }
                                                                  </SelectItem>
                                                                ),
                                                              )}
                                                            </SelectContent>
                                                          </Select>
                                                        </div>
                                                      </div>
                                                    )}
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
                          <TooltipContent align="start" side="bottom">
                            <p>{optionDef.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  }

                  // Special handling for markdown option - add sub-menu
                  if (optionKey === 'markdown') {
                    // For getMarkdown operation, markdown is displayed as a standalone option menu
                    if (op === 'getMarkdown') {
                      return null;
                    }

                    // For readUrl operation, markdown is toggleable
                    return (
                      <div className="group/markdown space-y-2" key={optionKey}>
                        {/* Main markdown toggle */}
                        <Tooltip
                          delayDuration={isMarkdownSubOpen ? 999999 : undefined}
                        >
                          <TooltipTrigger asChild>
                            <div className="flex w-full items-center space-x-2">
                              <Switch
                                checked={Boolean(currentValue)}
                                id={`content-format-${optionKey}`}
                                onCheckedChange={(checked) =>
                                  onContentFormatOptionsChange({
                                    [optionKey]: Boolean(checked),
                                  })
                                }
                              />
                              <Label
                                className="flex-1 cursor-pointer text-sm"
                                htmlFor={`content-format-${optionKey}`}
                              >
                                {renderIcon(optionDef.icon, 'h-4 w-4')}
                                {optionDef.label}
                                {hasCustomMarkdownSettings && (
                                  <div className="ml-1 inline-flex h-2 w-2 rounded-full bg-purple-500" />
                                )}
                                {'badge' in optionDef && optionDef.badge}
                                {!isMarkdownEnabled && (
                                  <Badge
                                    className="ml-auto text-muted-foreground text-xs uppercase"
                                    variant="outline"
                                  >
                                    Default: {defaultValue ? 'On' : 'Off'}
                                  </Badge>
                                )}
                              </Label>

                              {/* Markdown sub-menu - only show when markdown is enabled */}
                              {isMarkdownEnabled && (
                                <DropdownMenuSub
                                  onOpenChange={setIsMarkdownSubOpen}
                                >
                                  <DropdownMenuSubTrigger
                                    className="data-[state=open]:!text-foreground gap-x-1 rounded-lg border px-2 py-0.5 text-muted-foreground transition-colors duration-200 ease-out group-hover/markdown:bg-muted group-hover/markdown:text-foreground"
                                    icon={<Settings2 className="size-3" />}
                                  >
                                    <span className="font-medium text-xs uppercase">
                                      Configure
                                    </span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent
                                      alignOffset={-65}
                                      className="min-w-80 p-4"
                                      sideOffset={25}
                                    >
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-medium text-sm">
                                            Markdown Options
                                          </h4>
                                          <Button
                                            className="text-xs"
                                            onClick={resetMarkdownToDefaults}
                                            size="sm"
                                            variant="outline"
                                          >
                                            Reset
                                          </Button>
                                        </div>
                                        <div className="space-y-4">
                                          {MARKDOWN_OPTION_FIELDS.map(
                                            (field) => {
                                              const fieldCurrentValue =
                                                markdownOptions?.[field.key] ??
                                                DEFAULT_MARKDOWN_CONVERTER_OPTIONS[
                                                  field.key
                                                ];
                                              const fieldId = `markdown-${field.key}`;

                                              if (field.type === 'switch') {
                                                return (
                                                  <Tooltip key={field.key}>
                                                    <TooltipTrigger asChild>
                                                      <div className="flex w-fit items-center space-x-2">
                                                        <Switch
                                                          checked={Boolean(
                                                            fieldCurrentValue,
                                                          )}
                                                          id={fieldId}
                                                          onCheckedChange={(
                                                            checked,
                                                          ) =>
                                                            onMarkdownOptionsChange?.(
                                                              {
                                                                [field.key]:
                                                                  Boolean(
                                                                    checked,
                                                                  ),
                                                              },
                                                            )
                                                          }
                                                        />
                                                        <Label
                                                          className="cursor-pointer text-sm"
                                                          htmlFor={fieldId}
                                                        >
                                                          {field.label}
                                                        </Label>
                                                      </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                      <p>{field.tooltip}</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                );
                                              }

                                              if (field.type === 'select') {
                                                return (
                                                  <Tooltip key={field.key}>
                                                    <TooltipTrigger asChild>
                                                      <div className="w-full space-y-2">
                                                        <Separator />
                                                        <div className="flex w-full items-center justify-between gap-x-2">
                                                          <Label
                                                            className="min-w-0 flex-1 text-sm"
                                                            htmlFor={fieldId}
                                                          >
                                                            {field.label}
                                                          </Label>
                                                          <Select
                                                            onValueChange={(
                                                              value,
                                                            ) =>
                                                              onMarkdownOptionsChange?.(
                                                                {
                                                                  [field.key]:
                                                                    value,
                                                                },
                                                              )
                                                            }
                                                            value={
                                                              typeof fieldCurrentValue ===
                                                              'string'
                                                                ? fieldCurrentValue
                                                                : String(
                                                                    DEFAULT_MARKDOWN_CONVERTER_OPTIONS[
                                                                      field.key
                                                                    ],
                                                                  )
                                                            }
                                                          >
                                                            <SelectTrigger
                                                              className="w-auto min-w-fit"
                                                              id={fieldId}
                                                            >
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              {field.options?.map(
                                                                (option) => (
                                                                  <SelectItem
                                                                    key={
                                                                      option.value
                                                                    }
                                                                    value={
                                                                      option.value
                                                                    }
                                                                  >
                                                                    {
                                                                      option.label
                                                                    }
                                                                  </SelectItem>
                                                                ),
                                                              )}
                                                            </SelectContent>
                                                          </Select>
                                                        </div>
                                                      </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                      <p>{field.tooltip}</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                );
                                              }

                                              if (field.type === 'number') {
                                                return (
                                                  <Tooltip key={field.key}>
                                                    <TooltipTrigger asChild>
                                                      <div className="w-full space-y-2">
                                                        <Separator />
                                                        <div className="space-y-2">
                                                          <Label
                                                            className="text-sm"
                                                            htmlFor={fieldId}
                                                          >
                                                            {field.label}
                                                          </Label>
                                                          <Input
                                                            className="font-mono text-xs"
                                                            id={fieldId}
                                                            max={field.max?.toString()}
                                                            min={field.min?.toString()}
                                                            onBlur={(e) => {
                                                              const newValue = e
                                                                .target.value
                                                                ? Number(
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                : undefined;

                                                              // Enforce minimum and maximum values when user finishes typing
                                                              if (
                                                                newValue !==
                                                                undefined
                                                              ) {
                                                                let correctedValue =
                                                                  newValue;

                                                                if (
                                                                  field.min &&
                                                                  newValue <
                                                                    field.min
                                                                ) {
                                                                  correctedValue =
                                                                    field.min;
                                                                } else if (
                                                                  field.max &&
                                                                  newValue >
                                                                    field.max
                                                                ) {
                                                                  correctedValue =
                                                                    field.max;
                                                                }

                                                                if (
                                                                  correctedValue !==
                                                                  newValue
                                                                ) {
                                                                  onMarkdownOptionsChange?.(
                                                                    {
                                                                      [field.key]:
                                                                        correctedValue,
                                                                    },
                                                                  );
                                                                }
                                                              }
                                                            }}
                                                            onChange={(e) => {
                                                              const newValue = e
                                                                .target.value
                                                                ? Number(
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                : undefined;
                                                              onMarkdownOptionsChange?.(
                                                                {
                                                                  [field.key]:
                                                                    newValue,
                                                                },
                                                              );
                                                            }}
                                                            placeholder={`Default: ${DEFAULT_MARKDOWN_CONVERTER_OPTIONS[field.key]}`}
                                                            type="number"
                                                            value={
                                                              fieldCurrentValue?.toString() ||
                                                              ''
                                                            }
                                                          />
                                                        </div>
                                                      </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                      <p>{field.tooltip}</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                );
                                              }

                                              return null;
                                            },
                                          )}
                                        </div>
                                      </div>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent align="start" side="bottom">
                            <p>{optionDef.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  }

                  // Standard option rendering for non-metadata, non-tree, and non-markdown options
                  const content = (
                    <div
                      className="flex w-full items-center space-x-2"
                      key={optionKey}
                    >
                      <Switch
                        checked={Boolean(currentValue)}
                        id={`content-format-${optionKey}`}
                        onCheckedChange={(checked) =>
                          onContentFormatOptionsChange({
                            [optionKey]: Boolean(checked),
                          })
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
  },
);
