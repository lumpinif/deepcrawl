'use client';

import {
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_LINK_EXTRACTION_OPTIONS,
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
  DEFAULT_METADATA_OPTIONS,
  DEFAULT_METRICS_OPTIONS,
  DEFAULT_READ_OPTIONS,
  DEFAULT_SCRAPE_OPTIONS,
  DEFAULT_TREE_OPTIONS,
} from '@deepcrawl/types/configs';
import type { MetricsOptions } from '@deepcrawl/types/metrics';
import type { LinksOrder } from '@deepcrawl/types/routers/links/types';
import type { MetadataOptions } from '@deepcrawl/types/services/metadata/types';

import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  type CardFooter,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { Checkbox } from '@deepcrawl/ui/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@deepcrawl/ui/components/ui/collapsible';
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
import { Textarea } from '@deepcrawl/ui/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import type {
  ExtractLinksOptions,
  GetMarkdownOptions,
  MarkdownConverterOptions,
  ReadUrlOptions,
} from 'deepcrawl';
import { ChevronDown } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import type { DeepcrawlOperations } from './playground-client';

// Type aliases for component props using indexed types from input types
type CacheOptionsInput =
  | ReadUrlOptions['cacheOptions']
  | ExtractLinksOptions['cacheOptions']
  | GetMarkdownOptions['cacheOptions'];
type MetadataOptionsInput =
  | ReadUrlOptions['metadataOptions']
  | ExtractLinksOptions['metadataOptions'];
type MarkdownOptionsInput =
  | ReadUrlOptions['markdownConverterOptions']
  | GetMarkdownOptions['markdownConverterOptions'];
type MetricsOptionsInput =
  | ReadUrlOptions['metricsOptions']
  | ExtractLinksOptions['metricsOptions'];

interface OptionSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  badge?: React.ReactNode;
  tooltip?: string;
}

function OptionSwitch({
  id,
  label,
  checked,
  onCheckedChange,
  badge,
  tooltip,
}: OptionSwitchProps) {
  const content = (
    <div className="flex w-fit items-center space-x-2">
      <Switch checked={checked} id={id} onCheckedChange={onCheckedChange} />
      <Label className="cursor-pointer text-sm" htmlFor={id}>
        {label} {badge}
      </Label>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

interface OptionCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  tooltip?: string;
}

function OptionCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  tooltip,
}: OptionCheckboxProps) {
  const content = (
    <div className="flex w-fit items-center space-x-2">
      <Checkbox checked={checked} id={id} onCheckedChange={onCheckedChange} />
      <Label className="cursor-pointer text-sm" htmlFor={id}>
        {label}
      </Label>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

interface NumberInputProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  min?: string;
  max?: string;
}

function NumberInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
}: NumberInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm" htmlFor={id}>
        {label}
      </Label>
      <Input
        className="font-mono text-xs"
        id={id}
        max={max}
        min={min}
        onChange={(e) => {
          const newValue = e.target.value ? Number(e.target.value) : undefined;
          onChange(newValue);
        }}
        placeholder={placeholder}
        type="number"
        value={value || ''}
      />
    </div>
  );
}

interface CacheOptionsComponentProps {
  idPrefix: string;
  cacheOptions: CacheOptionsInput | undefined;
  onCacheOptionsChange: (cacheOptions: CacheOptionsInput) => void;
  defaultTtl: number;
}

function CacheOptionsComponent({
  idPrefix,
  cacheOptions,
  onCacheOptionsChange,
  defaultTtl,
}: CacheOptionsComponentProps) {
  const updateCacheOption = (
    key: string,
    value: boolean | number | undefined,
  ) => {
    onCacheOptionsChange({
      ...cacheOptions,
      [key]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <OptionSwitch
        checked={Boolean(
          cacheOptions?.enabled ?? DEFAULT_CACHE_OPTIONS.enabled,
        )}
        id={`${idPrefix}-cache-enabled`}
        label="Enable Cache"
        onCheckedChange={(checked) =>
          updateCacheOption('enabled', Boolean(checked))
        }
        tooltip="Whether to enable cache. Default is true."
      />
      <NumberInput
        id={`${idPrefix}-expiration`}
        label="Expiration (epoch timestamp)"
        onChange={(value) => updateCacheOption('expiration', value)}
        placeholder="1717708800"
        value={cacheOptions?.expiration || ''}
      />
      <NumberInput
        id={`${idPrefix}-expirationTtl`}
        label="Expiration TTL (seconds, min 60)"
        min="60"
        onChange={(value) => updateCacheOption('expirationTtl', value)}
        placeholder={`default - ${defaultTtl} (4 days)`}
        value={cacheOptions?.expirationTtl || ''}
      />
    </div>
  );
}

interface MetadataOptionsComponentProps {
  idPrefix: string;
  metadataOptions: MetadataOptionsInput | undefined;
  onMetadataOptionChange: (key: keyof MetadataOptions, value: boolean) => void;
}

function MetadataOptionsComponent({
  idPrefix,
  metadataOptions,
  onMetadataOptionChange,
}: MetadataOptionsComponentProps) {
  const metadataFields: Array<{
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

  return (
    <div className="grid grid-cols-2 gap-3">
      {metadataFields.map(({ key, label, tooltip }) => (
        <OptionCheckbox
          checked={Boolean(
            metadataOptions?.[key] ?? DEFAULT_METADATA_OPTIONS[key],
          )}
          id={`${idPrefix}-metadata-${key}`}
          key={key}
          label={label}
          onCheckedChange={(checked) => onMetadataOptionChange(key, checked)}
          tooltip={tooltip}
        />
      ))}
    </div>
  );
}

interface MarkdownOptionsComponentProps {
  idPrefix: string;
  markdownOptions: MarkdownOptionsInput | undefined;
  onMarkdownOptionChange: (
    key: keyof MarkdownConverterOptions,
    value: boolean | string | number,
  ) => void;
}

function MarkdownOptionsComponent({
  idPrefix,
  markdownOptions,
  onMarkdownOptionChange,
}: MarkdownOptionsComponentProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <OptionCheckbox
          checked={
            markdownOptions?.preferNativeParser ??
            DEFAULT_MARKDOWN_CONVERTER_OPTIONS.preferNativeParser
          }
          id={`${idPrefix}-markdown-preferNativeParser`}
          label="Prefer Native Parser"
          onCheckedChange={(checked) =>
            onMarkdownOptionChange('preferNativeParser', checked)
          }
          tooltip="Use native window DOMParser when available instead of fallback parser"
        />
        <OptionCheckbox
          checked={markdownOptions?.keepDataImages === true}
          id={`${idPrefix}-markdown-keepDataImages`}
          label="Keep Data Images"
          onCheckedChange={(checked) =>
            onMarkdownOptionChange('keepDataImages', checked)
          }
          tooltip="Whether to preserve images with data: URIs (can be up to 1MB each)"
        />
        <OptionCheckbox
          checked={
            markdownOptions?.useInlineLinks ??
            DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useInlineLinks
          }
          id={`${idPrefix}-markdown-useInlineLinks`}
          label="Use Inline Links"
          onCheckedChange={(checked) =>
            onMarkdownOptionChange('useInlineLinks', checked)
          }
          tooltip="Wrap URL text in <> instead of []() syntax when text matches URL"
        />
        <OptionCheckbox
          checked={markdownOptions?.useLinkReferenceDefinitions === true}
          id={`${idPrefix}-markdown-useLinkReferenceDefinitions`}
          label="Use Link References"
          onCheckedChange={(checked) =>
            onMarkdownOptionChange('useLinkReferenceDefinitions', checked)
          }
          tooltip="Format links using reference definitions at bottom instead of inline"
        />
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <Label
            className="text-sm"
            htmlFor={`${idPrefix}-markdown-bulletMarker`}
          >
            Bullet Marker
          </Label>
          <Select
            onValueChange={(value) =>
              onMarkdownOptionChange('bulletMarker', value)
            }
            value={markdownOptions?.bulletMarker || '*'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bullet marker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="*">* (asterisk)</SelectItem>
              <SelectItem value="-">- (dash)</SelectItem>
              <SelectItem value="+">+ (plus)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label
            className="text-sm"
            htmlFor={`${idPrefix}-markdown-codeBlockStyle`}
          >
            Code Block Style
          </Label>
          <Select
            onValueChange={(value) =>
              onMarkdownOptionChange('codeBlockStyle', value)
            }
            value={markdownOptions?.codeBlockStyle || 'fenced'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select code style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fenced">Fenced (```)</SelectItem>
              <SelectItem value="indented">Indented (4 spaces)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NumberInput
          id={`${idPrefix}-markdown-maxConsecutiveNewlines`}
          label="Max Consecutive Newlines"
          max="10"
          min="1"
          onChange={(value) =>
            onMarkdownOptionChange('maxConsecutiveNewlines', value || 3)
          }
          placeholder="3"
          value={markdownOptions?.maxConsecutiveNewlines || ''}
        />
      </div>
    </div>
  );
}

interface MetricsOptionsComponentProps {
  idPrefix: string;
  metricsOptions: MetricsOptionsInput | undefined;
  onMetricsOptionChange: (key: keyof MetricsOptions, value: boolean) => void;
}

function MetricsOptionsComponent({
  idPrefix,
  metricsOptions,
  onMetricsOptionChange,
}: MetricsOptionsComponentProps) {
  return (
    <div className="space-y-3">
      <OptionSwitch
        checked={Boolean(
          metricsOptions?.enable ?? DEFAULT_METRICS_OPTIONS.enable,
        )}
        id={`${idPrefix}-metrics-enable`}
        label="Enable Performance Metrics"
        onCheckedChange={(checked) => onMetricsOptionChange('enable', checked)}
        tooltip="Include performance timing metrics in the response (duration, start/end times)"
      />
    </div>
  );
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible onOpenChange={onToggle} open={isOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

interface CleaningProcessorSelectProps {
  id: string;
  label: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
}

function CleaningProcessorSelect({
  id,
  label,
  value,
  onValueChange,
}: CleaningProcessorSelectProps) {
  return (
    <div className="flex w-full items-center justify-between space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Label className="cursor-help text-sm" htmlFor={id}>
            {label}
          </Label>
        </TooltipTrigger>
        <TooltipContent className="max-w-md" side="right">
          <p className="text-pretty">
            The cleaning processor to use. Cheerio-reader is the default and
            recommended cleaning processor, but our custom html-rewriter is used
            for github.com urls. Try different processors for potential better
            results.
          </p>
        </TooltipContent>
      </Tooltip>
      <Select onValueChange={onValueChange} value={value || 'cheerio-reader'}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Select processor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cheerio-reader">Cheerio Reader</SelectItem>
          <SelectItem value="html-rewriter">HTML Rewriter</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

interface CardProps {
  card?: ComponentProps<typeof Card>;
  header?: ComponentProps<typeof CardHeader>;
  content?: ComponentProps<typeof CardContent>;
  footer?: ComponentProps<typeof CardFooter>;
}

interface OptionsPanelProps {
  cardProps?: CardProps;
  selectedOperation: DeepcrawlOperations;
  options: ReadUrlOptions | ExtractLinksOptions | GetMarkdownOptions;
  onOptionsChange: (
    options: ReadUrlOptions | ExtractLinksOptions | GetMarkdownOptions,
  ) => void;
}

export function OptionsPanel({
  selectedOperation,
  options,
  onOptionsChange,
  cardProps,
}: OptionsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateOption = (key: string, value: boolean | string | string[]) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  // Helper type to get valid child keys for nested options
  type NestedOptionKeys<T> = T extends 'metadataOptions'
    ? keyof NonNullable<ReadUrlOptions['metadataOptions']>
    : T extends 'linkExtractionOptions'
      ? keyof NonNullable<ExtractLinksOptions['linkExtractionOptions']>
      : T extends 'markdownConverterOptions'
        ? keyof NonNullable<MarkdownConverterOptions>
        : T extends 'metricsOptions'
          ? keyof NonNullable<MetricsOptions>
          : never;

  const updateNestedOptionValue = <
    P extends
      | 'metadataOptions'
      | 'linkExtractionOptions'
      | 'markdownConverterOptions'
      | 'metricsOptions',
  >(
    parentKey: P,
    childKey: NestedOptionKeys<P>,
    value: boolean | string | string[] | number,
  ) => {
    const currentParent =
      (options[parentKey as keyof typeof options] as Record<
        string,
        boolean | string | string[] | number
      >) || {};
    onOptionsChange({
      ...options,
      [parentKey]: {
        ...currentParent,
        [childKey]: value,
      },
    });
  };

  const resetToDefaults = () => {
    if (selectedOperation === 'readUrl') {
      onOptionsChange({ url: options.url });
    } else if (selectedOperation === 'extractLinks') {
      onOptionsChange({ url: options.url });
    } else if (selectedOperation === 'getMarkdown') {
      onOptionsChange({ url: options.url });
    }
  };

  if (selectedOperation === 'getMarkdown') {
    const markdownOptions = options as GetMarkdownOptions;
    return (
      <Card {...cardProps?.card}>
        <CardHeader {...cardProps?.header}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Options for Get Markdown
                <Badge className="text-xs" variant="outline">
                  GET /read
                </Badge>
              </CardTitle>
              <CardDescription>
                Get Markdown returns only the markdown content. Configure cache
                options below.
              </CardDescription>
            </div>
            <Button
              className="text-xs"
              onClick={resetToDefaults}
              size="sm"
              variant="outline"
            >
              Reset to default
            </Button>
          </div>
        </CardHeader>
        <CardContent
          {...cardProps?.content}
          className={cn('space-y-4', cardProps?.content?.className)}
        >
          <CleaningProcessorSelect
            id="markdown-cleaningProcessor"
            label="HTML Cleaning Processor"
            onValueChange={(value) => updateOption('cleaningProcessor', value)}
            value={markdownOptions.cleaningProcessor}
          />
          <Separator />
          {/* Cache Options */}
          <CollapsibleSection
            id="markdownCacheOptions"
            isOpen={expandedSections.has('markdownCacheOptions')}
            onToggle={() => toggleSection('markdownCacheOptions')}
            title="Cache Options"
          >
            <CacheOptionsComponent
              cacheOptions={markdownOptions.cacheOptions}
              defaultTtl={DEFAULT_CACHE_OPTIONS.expirationTtl}
              idPrefix="markdown"
              onCacheOptionsChange={(cacheOptions) => {
                onOptionsChange({
                  ...markdownOptions,
                  cacheOptions,
                });
              }}
            />
          </CollapsibleSection>

          <Separator />

          {/* Markdown Converter Options */}
          <CollapsibleSection
            id="markdownConverterOptions"
            isOpen={expandedSections.has('markdownConverterOptions')}
            onToggle={() => toggleSection('markdownConverterOptions')}
            title="Markdown Options"
          >
            <MarkdownOptionsComponent
              idPrefix="getMarkdown"
              markdownOptions={markdownOptions.markdownConverterOptions}
              onMarkdownOptionChange={(key, value) =>
                updateNestedOptionValue(
                  'markdownConverterOptions',
                  key as NestedOptionKeys<'markdownConverterOptions'>,
                  value,
                )
              }
            />
          </CollapsibleSection>
        </CardContent>
      </Card>
    );
  }

  if (selectedOperation === 'readUrl') {
    const readOptions = options as ReadUrlOptions;
    return (
      <Card {...cardProps?.card}>
        <CardHeader {...cardProps?.header}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Options for Read URL
                <Badge className="text-xs" variant="outline">
                  POST /read
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure what data to extract from the target URL
              </CardDescription>
            </div>
            <Button
              className="text-xs"
              onClick={resetToDefaults}
              size="sm"
              variant="outline"
            >
              Reset to default
            </Button>
          </div>
        </CardHeader>
        <CardContent
          {...cardProps?.content}
          className={cn('space-y-4', cardProps?.content?.className)}
        >
          {/* Basic Options */}
          <CleaningProcessorSelect
            id="cleaningProcessor"
            label="HTML Cleaning Processor"
            onValueChange={(value) => updateOption('cleaningProcessor', value)}
            value={readOptions.cleaningProcessor}
          />
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Content Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <OptionSwitch
                checked={Boolean(
                  readOptions.metadata ?? DEFAULT_READ_OPTIONS.metadata,
                )}
                id="metadata"
                label="Extract Metadata"
                onCheckedChange={(checked) => updateOption('metadata', checked)}
                tooltip="Whether to extract metadata from the page."
              />
              <OptionSwitch
                checked={Boolean(
                  readOptions.markdown ?? DEFAULT_READ_OPTIONS.markdown,
                )}
                id="markdown"
                label="Extract Markdown"
                onCheckedChange={(checked) => updateOption('markdown', checked)}
                tooltip="Whether to extract markdown from the page."
              />
              <OptionSwitch
                checked={readOptions.cleanedHtml === true}
                id="cleanedHtml"
                label="Cleaned HTML"
                onCheckedChange={(checked) =>
                  updateOption('cleanedHtml', checked)
                }
                tooltip="Whether to return cleaned HTML."
              />
              <OptionSwitch
                checked={readOptions.rawHtml === true}
                id="rawHtml"
                label="Raw HTML"
                onCheckedChange={(checked) => updateOption('rawHtml', checked)}
                tooltip="Whether to return raw HTML."
              />
              <OptionSwitch
                checked={readOptions.robots === true}
                id="robots"
                label="Fetch Robots.txt"
                onCheckedChange={(checked) => updateOption('robots', checked)}
                tooltip="Whether to fetch and parse robots.txt."
              />
            </div>
          </div>

          <Separator />

          {/* Metadata Options */}
          <CollapsibleSection
            id="metadataOptions"
            isOpen={expandedSections.has('metadataOptions')}
            onToggle={() => toggleSection('metadataOptions')}
            title="Metadata Options"
          >
            <MetadataOptionsComponent
              idPrefix="read"
              metadataOptions={readOptions.metadataOptions}
              onMetadataOptionChange={(key, checked) =>
                updateNestedOptionValue(
                  'metadataOptions',
                  key as NestedOptionKeys<'metadataOptions'>,
                  checked,
                )
              }
            />
          </CollapsibleSection>

          <Separator />

          {/* Cache Options */}
          <CollapsibleSection
            id="cacheOptions"
            isOpen={expandedSections.has('cacheOptions')}
            onToggle={() => toggleSection('cacheOptions')}
            title="Cache Options"
          >
            <CacheOptionsComponent
              cacheOptions={readOptions.cacheOptions}
              defaultTtl={DEFAULT_READ_OPTIONS.cacheOptions.expirationTtl}
              idPrefix="read"
              onCacheOptionsChange={(cacheOptions) => {
                onOptionsChange({
                  ...readOptions,
                  cacheOptions,
                });
              }}
            />
          </CollapsibleSection>

          <Separator />

          {/* Markdown Converter Options for ReadUrl */}
          <CollapsibleSection
            id="readMarkdownConverterOptions"
            isOpen={expandedSections.has('readMarkdownConverterOptions')}
            onToggle={() => toggleSection('readMarkdownConverterOptions')}
            title="Markdown Options"
          >
            <MarkdownOptionsComponent
              idPrefix="readUrl"
              markdownOptions={readOptions.markdownConverterOptions}
              onMarkdownOptionChange={(key, value) =>
                updateNestedOptionValue(
                  'markdownConverterOptions',
                  key as NestedOptionKeys<'markdownConverterOptions'>,
                  value,
                )
              }
            />
          </CollapsibleSection>

          <Separator />

          {/* Metrics Options for ReadUrl */}
          <CollapsibleSection
            id="readMetricsOptions"
            isOpen={expandedSections.has('readMetricsOptions')}
            onToggle={() => toggleSection('readMetricsOptions')}
            title="Metrics Options"
          >
            <MetricsOptionsComponent
              idPrefix="readUrl"
              metricsOptions={readOptions.metricsOptions}
              onMetricsOptionChange={(key, value) =>
                updateNestedOptionValue(
                  'metricsOptions',
                  key as NestedOptionKeys<'metricsOptions'>,
                  value,
                )
              }
            />
          </CollapsibleSection>
        </CardContent>
      </Card>
    );
  }

  if (selectedOperation === 'extractLinks') {
    const linksOptions = options as ExtractLinksOptions;
    return (
      <Card {...cardProps?.card}>
        <CardHeader {...cardProps?.header}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Options for Extract Links
                <Badge className="text-xs" variant="outline">
                  POST /links
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure link extraction and tree generation options
              </CardDescription>
            </div>
            <Button
              className="text-xs"
              onClick={resetToDefaults}
              size="sm"
              variant="outline"
            >
              Reset to default
            </Button>
          </div>
        </CardHeader>
        <CardContent
          {...cardProps?.content}
          className={cn('space-y-4', cardProps?.content?.className)}
        >
          <CleaningProcessorSelect
            id="links-cleaningProcessor"
            label="HTML Cleaning Processor"
            onValueChange={(value) => updateOption('cleaningProcessor', value)}
            value={linksOptions.cleaningProcessor}
          />
          <Separator />
          {/* Basic Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Content Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <OptionSwitch
                checked={Boolean(
                  linksOptions.tree ?? DEFAULT_LINKS_OPTIONS.tree,
                )}
                id="tree"
                label="Build Site Tree"
                onCheckedChange={(checked) => updateOption('tree', checked)}
                tooltip="Whether to build a site map tree."
              />
              <OptionSwitch
                checked={Boolean(
                  linksOptions.metadata ?? DEFAULT_SCRAPE_OPTIONS.metadata,
                )}
                id="metadata"
                label="Extract Metadata"
                onCheckedChange={(checked) => updateOption('metadata', checked)}
                tooltip="Whether to extract metadata from the page."
              />
              <OptionSwitch
                checked={linksOptions.cleanedHtml === true}
                id="cleanedHtml"
                label="Cleaned HTML"
                onCheckedChange={(checked) =>
                  updateOption('cleanedHtml', checked)
                }
                tooltip="Whether to return cleaned HTML."
              />
              <OptionSwitch
                checked={linksOptions.robots === true}
                id="robots"
                label="Fetch Robots.txt"
                onCheckedChange={(checked) => updateOption('robots', checked)}
              />
              <OptionSwitch
                badge={<Badge variant="secondary">Beta</Badge>}
                checked={linksOptions.sitemapXML === true}
                id="sitemapXML"
                label="Sitemap XML"
                onCheckedChange={(checked) =>
                  updateOption('sitemapXML', checked)
                }
              />
            </div>
          </div>

          <Separator />

          {/* Tree Options */}
          <CollapsibleSection
            id="treeOptions"
            isOpen={expandedSections.has('treeOptions')}
            onToggle={() => toggleSection('treeOptions')}
            title="Tree Options"
          >
            <div className="grid grid-cols-1 gap-3">
              <OptionSwitch
                checked={Boolean(
                  linksOptions.folderFirst ?? DEFAULT_TREE_OPTIONS.folderFirst,
                )}
                id="folderFirst"
                label="Folders First"
                onCheckedChange={(checked) =>
                  updateOption('folderFirst', checked)
                }
                tooltip="Whether to place folders before leaf nodes in the tree."
              />
              <OptionSwitch
                checked={Boolean(
                  linksOptions.extractedLinks ??
                    DEFAULT_TREE_OPTIONS.extractedLinks,
                )}
                id="extractedLinks"
                label="Include Extracted Links"
                onCheckedChange={(checked) =>
                  updateOption('extractedLinks', checked)
                }
                tooltip="Whether to include extracted links for each node in the tree."
              />
              <OptionSwitch
                checked={Boolean(
                  linksOptions.subdomainAsRootUrl ??
                    DEFAULT_TREE_OPTIONS.subdomainAsRootUrl,
                )}
                id="subdomainAsRootUrl"
                label="Subdomain as Root URL"
                onCheckedChange={(checked) =>
                  updateOption('subdomainAsRootUrl', checked)
                }
                tooltip="Whether to treat subdomain as root URL. If false, subdomain will be excluded from root URL."
              />
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="linksOrder">
                  Links Ordering
                </Label>
                <Select
                  onValueChange={(value: LinksOrder) =>
                    updateOption('linksOrder', value)
                  }
                  value={linksOptions.linksOrder || 'page'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ordering" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Page Order</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleSection>

          <Separator />

          {/* Link Extraction Options */}
          <CollapsibleSection
            id="linksOptions"
            isOpen={expandedSections.has('linksOptions')}
            onToggle={() => toggleSection('linksOptions')}
            title="Link Extraction Options"
          >
            <div className="grid grid-cols-2 gap-3">
              <OptionSwitch
                checked={Boolean(
                  linksOptions.linkExtractionOptions?.includeExternal ??
                    DEFAULT_LINK_EXTRACTION_OPTIONS.includeExternal,
                )}
                id="includeExternal"
                label="Include External"
                onCheckedChange={(checked) =>
                  updateNestedOptionValue(
                    'linkExtractionOptions',
                    'includeExternal',
                    checked,
                  )
                }
                tooltip="Whether to include links from other domains."
              />
              <OptionSwitch
                checked={Boolean(
                  linksOptions.linkExtractionOptions?.includeMedia ??
                    DEFAULT_LINK_EXTRACTION_OPTIONS.includeMedia,
                )}
                id="includeMedia"
                label="Include Media"
                onCheckedChange={(checked) =>
                  updateNestedOptionValue(
                    'linkExtractionOptions',
                    'includeMedia',
                    checked,
                  )
                }
                tooltip="Whether to include media files (images, videos, docs)."
              />
              <OptionSwitch
                checked={Boolean(
                  linksOptions.linkExtractionOptions?.removeQueryParams ??
                    DEFAULT_LINK_EXTRACTION_OPTIONS.removeQueryParams,
                )}
                id="removeQueryParams"
                label="Remove Query Params"
                onCheckedChange={(checked) =>
                  updateNestedOptionValue(
                    'linkExtractionOptions',
                    'removeQueryParams',
                    checked,
                  )
                }
                tooltip="Whether to remove query parameters from the extracted links."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" htmlFor="excludePatterns">
                Exclude Patterns (regex, one per line)
              </Label>
              <Textarea
                className="font-mono text-xs"
                id="excludePatterns"
                onChange={(e) => {
                  const patterns = e.target.value
                    .split('\n')
                    .filter((p) => p.trim());
                  updateNestedOptionValue(
                    'linkExtractionOptions',
                    'excludePatterns',
                    patterns,
                  );
                }}
                placeholder="/admin/&#10;\.pdf$&#10;/private/"
                rows={3}
                value={
                  linksOptions.linkExtractionOptions?.excludePatterns?.join(
                    '\n',
                  ) || ''
                }
              />
            </div>
          </CollapsibleSection>

          <Separator />

          {/* Metadata Options for Links */}
          <CollapsibleSection
            id="metadataOptions"
            isOpen={expandedSections.has('metadataOptions')}
            onToggle={() => toggleSection('metadataOptions')}
            title="Metadata Options"
          >
            <MetadataOptionsComponent
              idPrefix="links"
              metadataOptions={linksOptions.metadataOptions}
              onMetadataOptionChange={(key, checked) =>
                updateNestedOptionValue(
                  'metadataOptions',
                  key as NestedOptionKeys<'metadataOptions'>,
                  checked,
                )
              }
            />
          </CollapsibleSection>

          <Separator />

          {/* Cache Options for Links */}
          <CollapsibleSection
            id="linksCacheOptions"
            isOpen={expandedSections.has('linksCacheOptions')}
            onToggle={() => toggleSection('linksCacheOptions')}
            title="Cache Options"
          >
            <CacheOptionsComponent
              cacheOptions={linksOptions.cacheOptions}
              defaultTtl={DEFAULT_LINKS_OPTIONS.cacheOptions.expirationTtl}
              idPrefix="links"
              onCacheOptionsChange={(cacheOptions) => {
                onOptionsChange({
                  ...linksOptions,
                  cacheOptions,
                });
              }}
            />
          </CollapsibleSection>

          <Separator />

          {/* Metrics Options for Extract Links */}
          <CollapsibleSection
            id="linksMetricsOptions"
            isOpen={expandedSections.has('linksMetricsOptions')}
            onToggle={() => toggleSection('linksMetricsOptions')}
            title="Metrics Options"
          >
            <MetricsOptionsComponent
              idPrefix="extractLinks"
              metricsOptions={linksOptions.metricsOptions}
              onMetricsOptionChange={(key, value) =>
                updateNestedOptionValue(
                  'metricsOptions',
                  key as NestedOptionKeys<'metricsOptions'>,
                  value,
                )
              }
            />
          </CollapsibleSection>
        </CardContent>
      </Card>
    );
  }

  return null;
}
