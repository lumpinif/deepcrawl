'use client';

import { DEFAULT_MARKDOWN_CONVERTER_OPTIONS } from '@deepcrawl/types/configs';
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { MarkdownIcon } from '@deepcrawl/ui/components/icons/markdown';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@deepcrawl/ui/components/ui/select';
import { Switch } from '@deepcrawl/ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { GetMarkdownOptions, ReadUrlOptions } from 'deepcrawl';
import { useState } from 'react';

type MarkdownOptionsInput =
  | ReadUrlOptions['markdownConverterOptions']
  | GetMarkdownOptions['markdownConverterOptions'];

interface MarkdownOptionsMenuProps {
  markdownOptions: MarkdownOptionsInput | undefined;
  onMarkdownOptionsChange: (markdownOptions: MarkdownOptionsInput) => void;
}

export function MarkdownOptionsMenu({
  markdownOptions,
  onMarkdownOptionsChange,
}: MarkdownOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateMarkdownOption = (
    key: string,
    value: boolean | number | string | undefined,
  ) => {
    onMarkdownOptionsChange({
      ...markdownOptions,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onMarkdownOptionsChange({
      preferNativeParser: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.preferNativeParser,
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

  const hasCustomSettings =
    (markdownOptions?.preferNativeParser !== undefined &&
      markdownOptions.preferNativeParser !==
        DEFAULT_MARKDOWN_CONVERTER_OPTIONS.preferNativeParser) ||
    (markdownOptions?.bulletMarker !== undefined &&
      markdownOptions.bulletMarker !==
        DEFAULT_MARKDOWN_CONVERTER_OPTIONS.bulletMarker) ||
    (markdownOptions?.codeBlockStyle !== undefined &&
      markdownOptions.codeBlockStyle !==
        DEFAULT_MARKDOWN_CONVERTER_OPTIONS.codeBlockStyle) ||
    (markdownOptions?.maxConsecutiveNewlines !== undefined &&
      markdownOptions.maxConsecutiveNewlines !==
        DEFAULT_MARKDOWN_CONVERTER_OPTIONS.maxConsecutiveNewlines) ||
    (markdownOptions?.keepDataImages !== undefined &&
      markdownOptions.keepDataImages !==
        DEFAULT_MARKDOWN_CONVERTER_OPTIONS.keepDataImages) ||
    (markdownOptions?.useInlineLinks !== undefined &&
      markdownOptions.useInlineLinks !==
        DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useInlineLinks) ||
    (markdownOptions?.useLinkReferenceDefinitions !== undefined &&
      markdownOptions.useLinkReferenceDefinitions !==
        DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useLinkReferenceDefinitions);

  return (
    <Tooltip>
      <PromptInputActionMenu onOpenChange={setIsOpen} open={isOpen}>
        <TooltipTrigger asChild>
          <PromptInputActionMenuTrigger className="cursor-help">
            <MarkdownIcon
              className={cn('h-4 w-4', hasCustomSettings && 'text-purple-600')}
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
              <h3 className="font-medium text-sm">Markdown Options</h3>
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
              {/* Prefer Native Parser */}
              <div className="flex w-fit items-center space-x-2">
                <Switch
                  checked={Boolean(
                    markdownOptions?.preferNativeParser ??
                      DEFAULT_MARKDOWN_CONVERTER_OPTIONS.preferNativeParser,
                  )}
                  id="prefer-native-parser"
                  onCheckedChange={(checked) =>
                    updateMarkdownOption('preferNativeParser', Boolean(checked))
                  }
                />
                <Label
                  className="cursor-pointer text-sm"
                  htmlFor="prefer-native-parser"
                >
                  Prefer Native Parser
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Default:{' '}
                    {DEFAULT_MARKDOWN_CONVERTER_OPTIONS.preferNativeParser
                      ? 'On'
                      : 'Off'}
                  </Badge>
                </Label>
              </div>

              {/* Keep Data Images */}
              <div className="flex w-fit items-center space-x-2">
                <Switch
                  checked={Boolean(
                    markdownOptions?.keepDataImages ??
                      DEFAULT_MARKDOWN_CONVERTER_OPTIONS.keepDataImages,
                  )}
                  id="keep-data-images"
                  onCheckedChange={(checked) =>
                    updateMarkdownOption('keepDataImages', Boolean(checked))
                  }
                />
                <Label
                  className="cursor-pointer text-sm"
                  htmlFor="keep-data-images"
                >
                  Keep Data Images
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Default:{' '}
                    {DEFAULT_MARKDOWN_CONVERTER_OPTIONS.keepDataImages
                      ? 'On'
                      : 'Off'}
                  </Badge>
                </Label>
              </div>

              {/* Use Inline Links */}
              <div className="flex w-fit items-center space-x-2">
                <Switch
                  checked={Boolean(
                    markdownOptions?.useInlineLinks ??
                      DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useInlineLinks,
                  )}
                  id="use-inline-links"
                  onCheckedChange={(checked) =>
                    updateMarkdownOption('useInlineLinks', Boolean(checked))
                  }
                />
                <Label
                  className="cursor-pointer text-sm"
                  htmlFor="use-inline-links"
                >
                  Use Inline Links
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Default:{' '}
                    {DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useInlineLinks
                      ? 'On'
                      : 'Off'}
                  </Badge>
                </Label>
              </div>

              {/* Use Link Reference Definitions */}
              <div className="flex w-fit items-center space-x-2">
                <Switch
                  checked={Boolean(
                    markdownOptions?.useLinkReferenceDefinitions ??
                      DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useLinkReferenceDefinitions,
                  )}
                  id="use-link-reference-definitions"
                  onCheckedChange={(checked) =>
                    updateMarkdownOption(
                      'useLinkReferenceDefinitions',
                      Boolean(checked),
                    )
                  }
                />
                <Label
                  className="cursor-pointer text-sm"
                  htmlFor="use-link-reference-definitions"
                >
                  Use Link References
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Default:{' '}
                    {DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useLinkReferenceDefinitions
                      ? 'On'
                      : 'Off'}
                  </Badge>
                </Label>
              </div>

              {/* Bullet Marker */}
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="bullet-marker">
                  Bullet Marker
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Default: {DEFAULT_MARKDOWN_CONVERTER_OPTIONS.bulletMarker}
                  </Badge>
                </Label>
                <Select
                  onValueChange={(value) =>
                    updateMarkdownOption('bulletMarker', value)
                  }
                  value={
                    markdownOptions?.bulletMarker ||
                    DEFAULT_MARKDOWN_CONVERTER_OPTIONS.bulletMarker
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

              {/* Code Block Style */}
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="code-block-style">
                  Code Block Style
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Default: {DEFAULT_MARKDOWN_CONVERTER_OPTIONS.codeBlockStyle}
                  </Badge>
                </Label>
                <Select
                  onValueChange={(value) =>
                    updateMarkdownOption('codeBlockStyle', value)
                  }
                  value={
                    markdownOptions?.codeBlockStyle ||
                    DEFAULT_MARKDOWN_CONVERTER_OPTIONS.codeBlockStyle
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

              {/* Max Consecutive Newlines */}
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="max-consecutive-newlines">
                  Max Consecutive Newlines
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Default:{' '}
                    {DEFAULT_MARKDOWN_CONVERTER_OPTIONS.maxConsecutiveNewlines}
                  </Badge>
                </Label>
                <Input
                  className="font-mono text-xs"
                  id="max-consecutive-newlines"
                  max="10"
                  min="1"
                  onChange={(e) => {
                    const newValue = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    updateMarkdownOption('maxConsecutiveNewlines', newValue);
                  }}
                  placeholder={`Default: ${DEFAULT_MARKDOWN_CONVERTER_OPTIONS.maxConsecutiveNewlines}`}
                  type="number"
                  value={markdownOptions?.maxConsecutiveNewlines || ''}
                />
                <p className="text-muted-foreground text-xs">
                  Maximum number of consecutive newlines allowed
                </p>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-muted-foreground text-xs">
                * Markdown settings apply to content conversion
              </p>
            </div>
          </div>
        </PromptInputActionMenuContent>
        <TooltipContent align="start" side="bottom">
          <p>Configure markdown conversion options</p>
        </TooltipContent>
      </PromptInputActionMenu>
    </Tooltip>
  );
}
