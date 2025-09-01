'use client';

import {
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_READ_OPTIONS,
} from '@deepcrawl/types/configs';
import type { LinksOrder } from '@deepcrawl/types/routers/links/types';
import type { MetadataOptions } from '@deepcrawl/types/services/metadata/types';

import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import type {
  ExtractLinksOptions,
  GetMarkdownOptions,
  MarkdownConverterOptions,
  ReadUrlOptions,
} from 'deepcrawl';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
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

interface OptionSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  badge?: React.ReactNode;
}

function OptionSwitch({
  id,
  label,
  checked,
  onCheckedChange,
  badge,
}: OptionSwitchProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="text-sm">
        {label} {badge}
      </Label>
    </div>
  );
}

interface OptionCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function OptionCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: OptionCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
    </div>
  );
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
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => {
          const newValue = e.target.value ? Number(e.target.value) : undefined;
          onChange(newValue);
        }}
        className="font-mono text-xs"
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
        id={`${idPrefix}-cache-enabled`}
        label="Enable Cache"
        checked={cacheOptions?.enabled !== false}
        onCheckedChange={(checked) =>
          updateCacheOption('enabled', Boolean(checked))
        }
      />
      <NumberInput
        id={`${idPrefix}-expiration`}
        label="Expiration (epoch timestamp)"
        value={cacheOptions?.expiration || ''}
        onChange={(value) => updateCacheOption('expiration', value)}
        placeholder="1717708800"
      />
      <NumberInput
        id={`${idPrefix}-expirationTtl`}
        label="Expiration TTL (seconds, min 60)"
        value={cacheOptions?.expirationTtl || ''}
        onChange={(value) => updateCacheOption('expirationTtl', value)}
        placeholder={`default - ${defaultTtl} (4 days)`}
        min="60"
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
  const metadataFields: Array<{ key: keyof MetadataOptions; label: string }> = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'language', label: 'Language' },
    { key: 'canonical', label: 'Canonical URL' },
    { key: 'robots', label: 'Robots' },
    { key: 'author', label: 'Author' },
    { key: 'keywords', label: 'Keywords' },
    { key: 'favicon', label: 'Favicon' },
    { key: 'openGraph', label: 'Open Graph' },
    { key: 'twitter', label: 'Twitter Cards' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metadataFields.map(({ key, label }) => (
        <OptionCheckbox
          key={key}
          id={`${idPrefix}-metadata-${key}`}
          label={label}
          checked={metadataOptions?.[key] !== false}
          onCheckedChange={(checked) => onMetadataOptionChange(key, checked)}
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
          id={`${idPrefix}-markdown-preferNativeParser`}
          label="Prefer Native Parser"
          checked={markdownOptions?.preferNativeParser !== false}
          onCheckedChange={(checked) =>
            onMarkdownOptionChange('preferNativeParser', checked)
          }
        />
        <OptionCheckbox
          id={`${idPrefix}-markdown-keepDataImages`}
          label="Keep Data Images"
          checked={markdownOptions?.keepDataImages === true}
          onCheckedChange={(checked) =>
            onMarkdownOptionChange('keepDataImages', checked)
          }
        />
        <OptionCheckbox
          id={`${idPrefix}-markdown-useInlineLinks`}
          label="Use Inline Links"
          checked={markdownOptions?.useInlineLinks !== false}
          onCheckedChange={(checked) =>
            onMarkdownOptionChange('useInlineLinks', checked)
          }
        />
        <OptionCheckbox
          id={`${idPrefix}-markdown-useLinkReferenceDefinitions`}
          label="Use Link References"
          checked={markdownOptions?.useLinkReferenceDefinitions === true}
          onCheckedChange={(checked) =>
            onMarkdownOptionChange('useLinkReferenceDefinitions', checked)
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor={`${idPrefix}-markdown-bulletMarker`}
            className="text-sm"
          >
            Bullet Marker
          </Label>
          <Select
            value={markdownOptions?.bulletMarker || '*'}
            onValueChange={(value) =>
              onMarkdownOptionChange('bulletMarker', value)
            }
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
            htmlFor={`${idPrefix}-markdown-codeBlockStyle`}
            className="text-sm"
          >
            Code Block Style
          </Label>
          <Select
            value={markdownOptions?.codeBlockStyle || 'fenced'}
            onValueChange={(value) =>
              onMarkdownOptionChange('codeBlockStyle', value)
            }
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
          value={markdownOptions?.maxConsecutiveNewlines || ''}
          onChange={(value) =>
            onMarkdownOptionChange('maxConsecutiveNewlines', value || 3)
          }
          placeholder="3"
          min="1"
          max="10"
        />
      </div>
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
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

interface OptionsPanelProps {
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
        : never;

  const updateNestedOptionValue = <
    P extends
      | 'metadataOptions'
      | 'linkExtractionOptions'
      | 'markdownConverterOptions',
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Options for Get Markdown
                <Badge variant="outline" className="text-xs">
                  GET /read
                </Badge>
              </CardTitle>
              <CardDescription>
                Get Markdown returns only the markdown content. Configure cache
                options below.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs"
            >
              Reset to default
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cache Options */}
          <CollapsibleSection
            id="markdownCacheOptions"
            title="Cache Options"
            isOpen={expandedSections.has('markdownCacheOptions')}
            onToggle={() => toggleSection('markdownCacheOptions')}
          >
            <CacheOptionsComponent
              idPrefix="markdown"
              cacheOptions={markdownOptions.cacheOptions}
              onCacheOptionsChange={(cacheOptions) => {
                onOptionsChange({
                  ...markdownOptions,
                  cacheOptions,
                });
              }}
              defaultTtl={DEFAULT_CACHE_OPTIONS.expirationTtl}
            />
          </CollapsibleSection>

          <Separator />

          {/* Markdown Converter Options */}
          <CollapsibleSection
            id="markdownConverterOptions"
            title="Markdown Options"
            isOpen={expandedSections.has('markdownConverterOptions')}
            onToggle={() => toggleSection('markdownConverterOptions')}
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Options for Read URL
                <Badge variant="outline" className="text-xs">
                  POST /read
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure what data to extract from the target URL
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs"
            >
              Reset to default
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Content Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <OptionSwitch
                id="metadata"
                label="Extract Metadata"
                checked={readOptions.metadata !== false}
                onCheckedChange={(checked) => updateOption('metadata', checked)}
              />
              <OptionSwitch
                id="markdown"
                label="Extract Markdown"
                checked={readOptions.markdown !== false}
                onCheckedChange={(checked) => updateOption('markdown', checked)}
              />
              <OptionSwitch
                id="cleanedHtml"
                label="Cleaned HTML"
                checked={readOptions.cleanedHtml === true}
                onCheckedChange={(checked) =>
                  updateOption('cleanedHtml', checked)
                }
              />
              <OptionSwitch
                id="rawHtml"
                label="Raw HTML"
                checked={readOptions.rawHtml === true}
                onCheckedChange={(checked) => updateOption('rawHtml', checked)}
              />
              <OptionSwitch
                id="robots"
                label="Fetch Robots.txt"
                checked={readOptions.robots === true}
                onCheckedChange={(checked) => updateOption('robots', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Metadata Options */}
          <CollapsibleSection
            id="metadataOptions"
            title="Metadata Options"
            isOpen={expandedSections.has('metadataOptions')}
            onToggle={() => toggleSection('metadataOptions')}
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
            title="Cache Options"
            isOpen={expandedSections.has('cacheOptions')}
            onToggle={() => toggleSection('cacheOptions')}
          >
            <CacheOptionsComponent
              idPrefix="read"
              cacheOptions={readOptions.cacheOptions}
              onCacheOptionsChange={(cacheOptions) => {
                onOptionsChange({
                  ...readOptions,
                  cacheOptions,
                });
              }}
              defaultTtl={DEFAULT_READ_OPTIONS.cacheOptions.expirationTtl}
            />
          </CollapsibleSection>

          <Separator />

          {/* Markdown Converter Options for ReadUrl */}
          <CollapsibleSection
            id="readMarkdownConverterOptions"
            title="Markdown Options"
            isOpen={expandedSections.has('readMarkdownConverterOptions')}
            onToggle={() => toggleSection('readMarkdownConverterOptions')}
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

          {/* Cleaning Processor Options */}
          <CollapsibleSection
            id="cleaningOptions"
            title="Cleaning Options"
            isOpen={expandedSections.has('cleaningOptions')}
            onToggle={() => toggleSection('cleaningOptions')}
          >
            <div className="space-y-2">
              <Label htmlFor="cleaningProcessor" className="text-sm">
                Cleaning Processor
              </Label>
              <Select
                value={readOptions.cleaningProcessor || 'cheerio-reader'}
                onValueChange={(value) =>
                  updateOption('cleaningProcessor', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select processor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheerio-reader">Cheerio Reader</SelectItem>
                  <SelectItem value="html-rewriter">HTML Rewriter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleSection>
        </CardContent>
      </Card>
    );
  }

  if (selectedOperation === 'extractLinks') {
    const linksOptions = options as ExtractLinksOptions;
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Options for Extract Links
                <Badge variant="outline" className="text-xs">
                  POST /links
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure link extraction and tree generation options
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs"
            >
              Reset to default
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Content Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <OptionSwitch
                id="tree"
                label="Build Site Tree"
                checked={linksOptions.tree !== false}
                onCheckedChange={(checked) => updateOption('tree', checked)}
              />
              <OptionSwitch
                id="metadata"
                label="Extract Metadata"
                checked={linksOptions.metadata !== false}
                onCheckedChange={(checked) => updateOption('metadata', checked)}
              />
              <OptionSwitch
                id="cleanedHtml"
                label="Cleaned HTML"
                checked={linksOptions.cleanedHtml === true}
                onCheckedChange={(checked) =>
                  updateOption('cleanedHtml', checked)
                }
              />
              <OptionSwitch
                id="robots"
                label="Fetch Robots.txt"
                checked={linksOptions.robots === true}
                onCheckedChange={(checked) => updateOption('robots', checked)}
              />
              <OptionSwitch
                id="sitemapXML"
                label="Sitemap XML"
                checked={linksOptions.sitemapXML === true}
                onCheckedChange={(checked) =>
                  updateOption('sitemapXML', checked)
                }
                badge={<Badge variant="secondary">Beta</Badge>}
              />
            </div>
          </div>

          <Separator />

          {/* Tree Options */}
          <CollapsibleSection
            id="treeOptions"
            title="Tree Options"
            isOpen={expandedSections.has('treeOptions')}
            onToggle={() => toggleSection('treeOptions')}
          >
            <div className="grid grid-cols-1 gap-3">
              <OptionSwitch
                id="folderFirst"
                label="Folders First"
                checked={linksOptions.folderFirst !== false}
                onCheckedChange={(checked) =>
                  updateOption('folderFirst', checked)
                }
              />
              <OptionSwitch
                id="extractedLinks"
                label="Include Extracted Links"
                checked={linksOptions.extractedLinks !== false}
                onCheckedChange={(checked) =>
                  updateOption('extractedLinks', checked)
                }
              />
              <OptionSwitch
                id="subdomainAsRootUrl"
                label="Subdomain as Root URL"
                checked={linksOptions.subdomainAsRootUrl !== false}
                onCheckedChange={(checked) =>
                  updateOption('subdomainAsRootUrl', checked)
                }
              />
              <div className="space-y-2">
                <Label htmlFor="linksOrder" className="text-sm">
                  Links Ordering
                </Label>
                <Select
                  value={linksOptions.linksOrder || 'page'}
                  onValueChange={(value: LinksOrder) =>
                    updateOption('linksOrder', value)
                  }
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
            title="Link Extraction Options"
            isOpen={expandedSections.has('linksOptions')}
            onToggle={() => toggleSection('linksOptions')}
          >
            <div className="grid grid-cols-2 gap-3">
              <OptionSwitch
                id="includeExternal"
                label="Include External"
                checked={
                  linksOptions.linkExtractionOptions?.includeExternal !== false
                }
                onCheckedChange={(checked) =>
                  updateNestedOptionValue(
                    'linkExtractionOptions',
                    'includeExternal',
                    checked,
                  )
                }
              />
              <OptionSwitch
                id="includeMedia"
                label="Include Media"
                checked={
                  linksOptions.linkExtractionOptions?.includeMedia !== false
                }
                onCheckedChange={(checked) =>
                  updateNestedOptionValue(
                    'linkExtractionOptions',
                    'includeMedia',
                    checked,
                  )
                }
              />
              <OptionSwitch
                id="removeQueryParams"
                label="Remove Query Params"
                checked={
                  linksOptions.linkExtractionOptions?.removeQueryParams !==
                  false
                }
                onCheckedChange={(checked) =>
                  updateNestedOptionValue(
                    'linkExtractionOptions',
                    'removeQueryParams',
                    checked,
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excludePatterns" className="text-sm">
                Exclude Patterns (regex, one per line)
              </Label>
              <Textarea
                id="excludePatterns"
                placeholder="/admin/&#10;\.pdf$&#10;/private/"
                value={
                  linksOptions.linkExtractionOptions?.excludePatterns?.join(
                    '\n',
                  ) || ''
                }
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
                rows={3}
                className="font-mono text-xs"
              />
            </div>
          </CollapsibleSection>

          <Separator />

          {/* Metadata Options for Links */}
          <CollapsibleSection
            id="metadataOptions"
            title="Metadata Options"
            isOpen={expandedSections.has('metadataOptions')}
            onToggle={() => toggleSection('metadataOptions')}
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
            title="Cache Options"
            isOpen={expandedSections.has('linksCacheOptions')}
            onToggle={() => toggleSection('linksCacheOptions')}
          >
            <CacheOptionsComponent
              idPrefix="links"
              cacheOptions={linksOptions.cacheOptions}
              onCacheOptionsChange={(cacheOptions) => {
                onOptionsChange({
                  ...linksOptions,
                  cacheOptions,
                });
              }}
              defaultTtl={DEFAULT_LINKS_OPTIONS.cacheOptions.expirationTtl}
            />
          </CollapsibleSection>

          <Separator />

          {/* Cleaning Processor Options for Links */}
          <CollapsibleSection
            id="linksCleaningOptions"
            title="Cleaning Options"
            isOpen={expandedSections.has('linksCleaningOptions')}
            onToggle={() => toggleSection('linksCleaningOptions')}
          >
            <div className="space-y-2">
              <Label htmlFor="links-cleaningProcessor" className="text-sm">
                Cleaning Processor
              </Label>
              <Select
                value={linksOptions.cleaningProcessor || 'cheerio-reader'}
                onValueChange={(value) =>
                  updateOption('cleaningProcessor', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select processor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheerio-reader">Cheerio Reader</SelectItem>
                  <SelectItem value="html-rewriter">HTML Rewriter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleSection>
        </CardContent>
      </Card>
    );
  }

  return null;
}
