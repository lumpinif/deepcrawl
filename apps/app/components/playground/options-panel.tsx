'use client';

import {
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_READ_OPTIONS,
} from '@deepcrawl/types/configs';
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
  MetadataOptions,
  ReadUrlOptions,
} from 'deepcrawl';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { DeepcrawlOperations } from './playground-client';

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
          <Collapsible
            open={expandedSections.has('markdownCacheOptions')}
            onOpenChange={() => toggleSection('markdownCacheOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Cache Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="markdown-cache-enabled"
                    checked={markdownOptions.cacheOptions?.enabled !== false}
                    onCheckedChange={(checked) => {
                      onOptionsChange({
                        ...markdownOptions,
                        cacheOptions: {
                          ...markdownOptions.cacheOptions,
                          enabled: checked,
                        },
                      });
                    }}
                  />
                  <Label htmlFor="markdown-cache-enabled" className="text-sm">
                    Enable Cache
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="markdown-expiration" className="text-sm">
                    Expiration (epoch timestamp)
                  </Label>
                  <Input
                    id="markdown-expiration"
                    type="number"
                    placeholder="1717708800"
                    value={markdownOptions.cacheOptions?.expiration || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      onOptionsChange({
                        ...markdownOptions,
                        cacheOptions: {
                          ...markdownOptions.cacheOptions,
                          expiration: value,
                        },
                      });
                    }}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="markdown-expirationTtl" className="text-sm">
                    Expiration TTL (seconds, min 60)
                  </Label>
                  <Input
                    id="markdown-expirationTtl"
                    type="number"
                    min="60"
                    placeholder={`default - ${DEFAULT_CACHE_OPTIONS.expirationTtl} (4 days)`}
                    value={markdownOptions.cacheOptions?.expirationTtl || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      onOptionsChange({
                        ...markdownOptions,
                        cacheOptions: {
                          ...markdownOptions.cacheOptions,
                          expirationTtl: value,
                        },
                      });
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Markdown Converter Options */}
          <Collapsible
            open={expandedSections.has('markdownConverterOptions')}
            onOpenChange={() => toggleSection('markdownConverterOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Markdown Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="markdown-preferNativeParser"
                    checked={
                      markdownOptions.markdownConverterOptions
                        ?.preferNativeParser !== false
                    }
                    onCheckedChange={(checked) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'preferNativeParser',
                        checked,
                      )
                    }
                  />
                  <Label
                    htmlFor="markdown-preferNativeParser"
                    className="text-sm"
                  >
                    Prefer Native Parser
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="markdown-keepDataImages"
                    checked={
                      markdownOptions.markdownConverterOptions
                        ?.keepDataImages === true
                    }
                    onCheckedChange={(checked) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'keepDataImages',
                        checked,
                      )
                    }
                  />
                  <Label htmlFor="markdown-keepDataImages" className="text-sm">
                    Keep Data Images
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="markdown-useInlineLinks"
                    checked={
                      markdownOptions.markdownConverterOptions
                        ?.useInlineLinks !== false
                    }
                    onCheckedChange={(checked) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'useInlineLinks',
                        checked,
                      )
                    }
                  />
                  <Label htmlFor="markdown-useInlineLinks" className="text-sm">
                    Use Inline Links
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="markdown-useLinkReferenceDefinitions"
                    checked={
                      markdownOptions.markdownConverterOptions
                        ?.useLinkReferenceDefinitions === true
                    }
                    onCheckedChange={(checked) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'useLinkReferenceDefinitions',
                        checked,
                      )
                    }
                  />
                  <Label
                    htmlFor="markdown-useLinkReferenceDefinitions"
                    className="text-sm"
                  >
                    Use Link References
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="markdown-bulletMarker" className="text-sm">
                    Bullet Marker
                  </Label>
                  <Select
                    value={
                      markdownOptions.markdownConverterOptions?.bulletMarker ||
                      '*'
                    }
                    onValueChange={(value) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'bulletMarker',
                        value,
                      )
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
                  <Label htmlFor="markdown-codeBlockStyle" className="text-sm">
                    Code Block Style
                  </Label>
                  <Select
                    value={
                      markdownOptions.markdownConverterOptions
                        ?.codeBlockStyle || 'fenced'
                    }
                    onValueChange={(value) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'codeBlockStyle',
                        value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select code style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fenced">Fenced (```)</SelectItem>
                      <SelectItem value="indented">
                        Indented (4 spaces)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="markdown-maxConsecutiveNewlines"
                    className="text-sm"
                  >
                    Max Consecutive Newlines
                  </Label>
                  <Input
                    id="markdown-maxConsecutiveNewlines"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="3"
                    value={
                      markdownOptions.markdownConverterOptions
                        ?.maxConsecutiveNewlines || ''
                    }
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : 3;
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'maxConsecutiveNewlines',
                        value,
                      );
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="metadata"
                  checked={readOptions.metadata !== false}
                  onCheckedChange={(checked) =>
                    updateOption('metadata', checked)
                  }
                />
                <Label htmlFor="metadata" className="text-sm">
                  Extract Metadata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="markdown"
                  checked={readOptions.markdown !== false}
                  onCheckedChange={(checked) =>
                    updateOption('markdown', checked)
                  }
                />
                <Label htmlFor="markdown" className="text-sm">
                  Extract Markdown
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="cleanedHtml"
                  checked={readOptions.cleanedHtml === true}
                  onCheckedChange={(checked) =>
                    updateOption('cleanedHtml', checked)
                  }
                />
                <Label htmlFor="cleanedHtml" className="text-sm">
                  Cleaned HTML
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="rawHtml"
                  checked={readOptions.rawHtml === true}
                  onCheckedChange={(checked) =>
                    updateOption('rawHtml', checked)
                  }
                />
                <Label htmlFor="rawHtml" className="text-sm">
                  Raw HTML
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="robots"
                  checked={readOptions.robots === true}
                  onCheckedChange={(checked) => updateOption('robots', checked)}
                />
                <Label htmlFor="robots" className="text-sm">
                  Fetch Robots.txt
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata Options */}
          <Collapsible
            open={expandedSections.has('metadataOptions')}
            onOpenChange={() => toggleSection('metadataOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Metadata Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
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
                  { key: 'isIframeAllowed', label: 'Iframe Allowed' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`metadata-${key}`}
                      checked={
                        readOptions.metadataOptions?.[
                          key as keyof MetadataOptions
                        ] !== false
                      }
                      onCheckedChange={(checked) =>
                        updateNestedOptionValue(
                          'metadataOptions',
                          key as NestedOptionKeys<'metadataOptions'>,
                          checked,
                        )
                      }
                    />
                    <Label htmlFor={`metadata-${key}`} className="text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Cache Options */}
          <Collapsible
            open={expandedSections.has('cacheOptions')}
            onOpenChange={() => toggleSection('cacheOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Cache Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cache-enabled"
                    checked={readOptions.cacheOptions?.enabled !== false}
                    onCheckedChange={(checked) => {
                      onOptionsChange({
                        ...readOptions,
                        cacheOptions: {
                          ...readOptions.cacheOptions,
                          enabled: checked,
                        },
                      });
                    }}
                  />
                  <Label htmlFor="cache-enabled" className="text-sm">
                    Enable Cache
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiration" className="text-sm">
                    Expiration (epoch timestamp)
                  </Label>
                  <Input
                    id="expiration"
                    type="number"
                    placeholder="1717708800"
                    value={readOptions.cacheOptions?.expiration || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      onOptionsChange({
                        ...readOptions,
                        cacheOptions: {
                          ...readOptions.cacheOptions,
                          expiration: value,
                        },
                      });
                    }}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expirationTtl" className="text-sm">
                    Expiration TTL (seconds, min 60)
                  </Label>
                  <Input
                    id="expirationTtl"
                    type="number"
                    min="60"
                    placeholder={`default - ${DEFAULT_READ_OPTIONS.cacheOptions.expirationTtl} (4 days)`}
                    value={readOptions.cacheOptions?.expirationTtl || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      onOptionsChange({
                        ...readOptions,
                        cacheOptions: {
                          ...readOptions.cacheOptions,
                          expirationTtl: value,
                        },
                      });
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Markdown Converter Options for ReadUrl */}
          <Collapsible
            open={expandedSections.has('readMarkdownConverterOptions')}
            onOpenChange={() => toggleSection('readMarkdownConverterOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Markdown Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="read-markdown-preferNativeParser"
                    checked={
                      readOptions.markdownConverterOptions
                        ?.preferNativeParser !== false
                    }
                    onCheckedChange={(checked) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'preferNativeParser',
                        checked,
                      )
                    }
                  />
                  <Label
                    htmlFor="read-markdown-preferNativeParser"
                    className="text-sm"
                  >
                    Prefer Native Parser
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="read-markdown-keepDataImages"
                    checked={
                      readOptions.markdownConverterOptions?.keepDataImages ===
                      true
                    }
                    onCheckedChange={(checked) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'keepDataImages',
                        checked,
                      )
                    }
                  />
                  <Label
                    htmlFor="read-markdown-keepDataImages"
                    className="text-sm"
                  >
                    Keep Data Images
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="read-markdown-useInlineLinks"
                    checked={
                      readOptions.markdownConverterOptions?.useInlineLinks !==
                      false
                    }
                    onCheckedChange={(checked) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'useInlineLinks',
                        checked,
                      )
                    }
                  />
                  <Label
                    htmlFor="read-markdown-useInlineLinks"
                    className="text-sm"
                  >
                    Use Inline Links
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="read-markdown-useLinkReferenceDefinitions"
                    checked={
                      readOptions.markdownConverterOptions
                        ?.useLinkReferenceDefinitions === true
                    }
                    onCheckedChange={(checked) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'useLinkReferenceDefinitions',
                        checked,
                      )
                    }
                  />
                  <Label
                    htmlFor="read-markdown-useLinkReferenceDefinitions"
                    className="text-sm"
                  >
                    Use Link References
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="read-markdown-bulletMarker"
                    className="text-sm"
                  >
                    Bullet Marker
                  </Label>
                  <Select
                    value={
                      readOptions.markdownConverterOptions?.bulletMarker || '*'
                    }
                    onValueChange={(value) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'bulletMarker',
                        value,
                      )
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
                    htmlFor="read-markdown-codeBlockStyle"
                    className="text-sm"
                  >
                    Code Block Style
                  </Label>
                  <Select
                    value={
                      readOptions.markdownConverterOptions?.codeBlockStyle ||
                      'fenced'
                    }
                    onValueChange={(value) =>
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'codeBlockStyle',
                        value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select code style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fenced">Fenced (```)</SelectItem>
                      <SelectItem value="indented">
                        Indented (4 spaces)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="read-markdown-maxConsecutiveNewlines"
                    className="text-sm"
                  >
                    Max Consecutive Newlines
                  </Label>
                  <Input
                    id="read-markdown-maxConsecutiveNewlines"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="3"
                    value={
                      readOptions.markdownConverterOptions
                        ?.maxConsecutiveNewlines || ''
                    }
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : 3;
                      updateNestedOptionValue(
                        'markdownConverterOptions',
                        'maxConsecutiveNewlines',
                        value,
                      );
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Cleaning Processor Options */}
          <Collapsible
            open={expandedSections.has('cleaningOptions')}
            onOpenChange={() => toggleSection('cleaningOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Cleaning Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
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
                    <SelectItem value="cheerio-reader">
                      Cheerio Reader
                    </SelectItem>
                    <SelectItem value="html-rewriter">HTML Rewriter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="tree"
                  checked={linksOptions.tree !== false}
                  onCheckedChange={(checked) => updateOption('tree', checked)}
                />
                <Label htmlFor="tree" className="text-sm">
                  Build Site Tree
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="metadata"
                  checked={linksOptions.metadata !== false}
                  onCheckedChange={(checked) =>
                    updateOption('metadata', checked)
                  }
                />
                <Label htmlFor="metadata" className="text-sm">
                  Extract Metadata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="cleanedHtml"
                  checked={linksOptions.cleanedHtml === true}
                  onCheckedChange={(checked) =>
                    updateOption('cleanedHtml', checked)
                  }
                />
                <Label htmlFor="cleanedHtml" className="text-sm">
                  Cleaned HTML
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="robots"
                  checked={linksOptions.robots === true}
                  onCheckedChange={(checked) => updateOption('robots', checked)}
                />
                <Label htmlFor="robots" className="text-sm">
                  Fetch Robots.txt
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sitemapXML"
                  checked={linksOptions.sitemapXML === true}
                  onCheckedChange={(checked) =>
                    updateOption('sitemapXML', checked)
                  }
                />
                <Label htmlFor="sitemapXML" className="text-sm">
                  Sitemap XML <Badge variant="secondary">Beta</Badge>
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tree Options */}
          <Collapsible
            open={expandedSections.has('treeOptions')}
            onOpenChange={() => toggleSection('treeOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Tree Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="folderFirst"
                    checked={linksOptions.folderFirst !== false}
                    onCheckedChange={(checked) =>
                      updateOption('folderFirst', checked)
                    }
                  />
                  <Label htmlFor="folderFirst" className="text-sm">
                    Folders First
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="extractedLinks"
                    checked={linksOptions.extractedLinks !== false}
                    onCheckedChange={(checked) =>
                      updateOption('extractedLinks', checked)
                    }
                  />
                  <Label htmlFor="extractedLinks" className="text-sm">
                    Include Extracted Links
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="subdomainAsRootUrl"
                    checked={linksOptions.subdomainAsRootUrl !== false}
                    onCheckedChange={(checked) =>
                      updateOption('subdomainAsRootUrl', checked)
                    }
                  />
                  <Label htmlFor="subdomainAsRootUrl" className="text-sm">
                    Subdomain as Root URL
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linksOrder" className="text-sm">
                    Links Ordering
                  </Label>
                  <Select
                    value={linksOptions.linksOrder || 'page'}
                    onValueChange={(value) => updateOption('linksOrder', value)}
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
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Link Extraction Options */}
          <Collapsible
            open={expandedSections.has('linksOptions')}
            onOpenChange={() => toggleSection('linksOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Link Extraction Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeExternal"
                    checked={
                      linksOptions.linkExtractionOptions?.includeExternal !==
                      false
                    }
                    onCheckedChange={(checked) =>
                      updateNestedOptionValue(
                        'linkExtractionOptions',
                        'includeExternal',
                        checked,
                      )
                    }
                  />
                  <Label htmlFor="includeExternal" className="text-sm">
                    Include External
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeMedia"
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
                  <Label htmlFor="includeMedia" className="text-sm">
                    Include Media
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="removeQueryParams"
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
                  <Label htmlFor="removeQueryParams" className="text-sm">
                    Remove Query Params
                  </Label>
                </div>
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
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Metadata Options for Links */}
          <Collapsible
            open={expandedSections.has('metadataOptions')}
            onOpenChange={() => toggleSection('metadataOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Metadata Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
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
                  { key: 'isIframeAllowed', label: 'Iframe Allowed' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`links-metadata-${key}`}
                      checked={
                        linksOptions.metadataOptions?.[
                          key as keyof MetadataOptions
                        ] !== false
                      }
                      onCheckedChange={(checked) =>
                        updateNestedOptionValue(
                          'metadataOptions',
                          key as NestedOptionKeys<'metadataOptions'>,
                          checked,
                        )
                      }
                    />
                    <Label
                      htmlFor={`links-metadata-${key}`}
                      className="text-sm"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Cache Options for Links */}
          <Collapsible
            open={expandedSections.has('linksCacheOptions')}
            onOpenChange={() => toggleSection('linksCacheOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Cache Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="links-cache-enabled"
                    checked={linksOptions.cacheOptions?.enabled !== false}
                    onCheckedChange={(checked) => {
                      onOptionsChange({
                        ...linksOptions,
                        cacheOptions: {
                          ...linksOptions.cacheOptions,
                          enabled: checked,
                        },
                      });
                    }}
                  />
                  <Label htmlFor="links-cache-enabled" className="text-sm">
                    Enable Cache
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="links-expiration" className="text-sm">
                    Expiration (epoch timestamp)
                  </Label>
                  <Input
                    id="links-expiration"
                    type="number"
                    placeholder="1717708800"
                    value={linksOptions.cacheOptions?.expiration || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      onOptionsChange({
                        ...linksOptions,
                        cacheOptions: {
                          ...linksOptions.cacheOptions,
                          expiration: value,
                        },
                      });
                    }}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="links-expirationTtl" className="text-sm">
                    Expiration TTL (seconds, min 60)
                  </Label>
                  <Input
                    id="links-expirationTtl"
                    type="number"
                    min="60"
                    placeholder={`default - ${DEFAULT_LINKS_OPTIONS.cacheOptions.expirationTtl} (4 days)`}
                    value={linksOptions.cacheOptions?.expirationTtl || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      onOptionsChange({
                        ...linksOptions,
                        cacheOptions: {
                          ...linksOptions.cacheOptions,
                          expirationTtl: value,
                        },
                      });
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Cleaning Processor Options for Links */}
          <Collapsible
            open={expandedSections.has('linksCleaningOptions')}
            onOpenChange={() => toggleSection('linksCleaningOptions')}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
              <h4 className="font-medium text-sm">Cleaning Options</h4>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
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
                    <SelectItem value="cheerio-reader">
                      Cheerio Reader
                    </SelectItem>
                    <SelectItem value="html-rewriter">HTML Rewriter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  }

  return null;
}
