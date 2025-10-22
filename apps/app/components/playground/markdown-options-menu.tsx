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
import type { MarkdownConverterOptions } from 'deepcrawl/types';
import { useCallback, useRef, useState } from 'react';
import {
  usePlaygroundCoreSelector,
  usePlaygroundOptionsSelector,
} from '@/contexts/playground-context';
import type { PlaygroundOptionsContextValue } from '@/hooks/playground/types';

// Markdown option fields with their defaults and metadata
const MARKDOWN_MENU_FIELDS = [
  {
    key: 'preferNativeParser',
    defaultValue: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.preferNativeParser,
    type: 'switch',
    label: 'Prefer Native Parser',
    tooltip: 'Use native parser when available for better performance',
  },
  {
    key: 'keepDataImages',
    defaultValue: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.keepDataImages,
    type: 'switch',
    label: 'Keep Data Images',
    tooltip: 'Preserve base64 encoded images in markdown output',
  },
  {
    key: 'useInlineLinks',
    defaultValue: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useInlineLinks,
    type: 'switch',
    label: 'Use Inline Links',
    tooltip: 'Use inline link format instead of reference links',
  },
  {
    key: 'useLinkReferenceDefinitions',
    defaultValue:
      DEFAULT_MARKDOWN_CONVERTER_OPTIONS.useLinkReferenceDefinitions,
    type: 'switch',
    label: 'Use Link References',
    tooltip: 'Generate reference-style links with definitions at the end',
  },
  {
    key: 'bulletMarker',
    defaultValue: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.bulletMarker,
    type: 'select',
    label: 'Bullet Marker',
    tooltip: 'Character used for unordered list items',
    options: [
      { value: '*', label: '* (asterisk)' },
      { value: '-', label: '- (dash)' },
      { value: '+', label: '+ (plus)' },
    ],
  },
  {
    key: 'codeBlockStyle',
    defaultValue: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.codeBlockStyle,
    type: 'select',
    label: 'Code Block Style',
    tooltip: 'Format style for code blocks in markdown',
    options: [
      { value: 'fenced', label: 'Fenced (```)' },
      { value: 'indented', label: 'Indented (4 spaces)' },
    ],
  },
  {
    key: 'maxConsecutiveNewlines',
    defaultValue: DEFAULT_MARKDOWN_CONVERTER_OPTIONS.maxConsecutiveNewlines,
    type: 'number',
    label: 'Max Consecutive Newlines',
    tooltip: 'Maximum number of consecutive newlines allowed',
    min: 1,
    max: 10,
  },
] as const;

// Component now uses context - no props needed!
export function MarkdownOptionsMenu() {
  // Get state and actions from context
  const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
  const currentOpts = usePlaygroundOptionsSelector('currentOptions');
  const selectSetOptions = useCallback(
    (state: PlaygroundOptionsContextValue) =>
      state.currentQueryState.setOptions,
    [],
  );
  const setOptions = usePlaygroundOptionsSelector(selectSetOptions);

  // Extract markdown options from current options
  const markdownOptions =
    'markdownConverterOptions' in currentOpts
      ? currentOpts.markdownConverterOptions
      : undefined;

  // Determine if markdown is enabled based on operation
  const isMarkdownEnabled = selectedOperation === 'getMarkdown';

  // Create change handler that uses context
  const onMarkdownOptionsChange = (
    markdownConverterOptions: MarkdownConverterOptions,
  ) => {
    setOptions({ markdownConverterOptions });
  };
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  // Skip rendering if markdown is not enabled
  if (!isMarkdownEnabled) {
    return null;
  }

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

  const hasCustomSettings = MARKDOWN_MENU_FIELDS.some(
    ({ key, defaultValue }) => {
      const currentValue = markdownOptions?.[key];
      return currentValue !== undefined && currentValue !== defaultValue;
    },
  );

  const baseColor =
    'group-data-[customized=true]:text-purple-600 group-hover:!text-purple-600' as const;

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
            <MarkdownIcon className={cn(baseColor)} ref={iconRef} />
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
              {MARKDOWN_MENU_FIELDS.map((field) => {
                const currentValue =
                  markdownOptions?.[field.key] ?? field.defaultValue;
                const fieldId = `markdown-${field.key}`;

                if (field.type === 'switch') {
                  return (
                    <div
                      className="flex w-fit items-center space-x-2"
                      key={field.key}
                    >
                      <Switch
                        checked={Boolean(currentValue)}
                        id={fieldId}
                        onCheckedChange={(checked) =>
                          onMarkdownOptionsChange({
                            [field.key]: Boolean(checked),
                          })
                        }
                      />
                      <Label
                        className="cursor-pointer text-sm"
                        htmlFor={fieldId}
                      >
                        {field.label}
                        <Badge
                          className="ml-2 text-muted-foreground text-xs uppercase"
                          variant="outline"
                        >
                          Default: {field.defaultValue ? 'On' : 'Off'}
                        </Badge>
                      </Label>
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div className="space-y-2" key={field.key}>
                      <Label className="text-sm" htmlFor={fieldId}>
                        {field.label}
                        <Badge
                          className="ml-2 text-muted-foreground text-xs uppercase"
                          variant="outline"
                        >
                          Default: {field.defaultValue}
                        </Badge>
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          onMarkdownOptionsChange({
                            [field.key]: value,
                          })
                        }
                        value={
                          typeof currentValue === 'string'
                            ? currentValue
                            : field.defaultValue
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select ${field.label.toLowerCase()}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                if (field.type === 'number') {
                  return (
                    <div className="space-y-2" key={field.key}>
                      <Label className="text-sm" htmlFor={fieldId}>
                        {field.label}
                        <Badge
                          className="ml-2 text-muted-foreground text-xs uppercase"
                          variant="outline"
                        >
                          Default: {field.defaultValue}
                        </Badge>
                      </Label>
                      <Input
                        className="font-mono text-xs"
                        id={fieldId}
                        max={field.max?.toString()}
                        min={field.min?.toString()}
                        onBlur={(e) => {
                          const newValue = e.target.value
                            ? Number(e.target.value)
                            : undefined;

                          // Enforce minimum and maximum values when user finishes typing
                          if (newValue !== undefined) {
                            let correctedValue = newValue;

                            if (field.min && newValue < field.min) {
                              correctedValue = field.min;
                            } else if (field.max && newValue > field.max) {
                              correctedValue = field.max;
                            }

                            if (correctedValue !== newValue) {
                              onMarkdownOptionsChange({
                                [field.key]: correctedValue,
                              });
                            }
                          }
                        }}
                        onChange={(e) => {
                          const newValue = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          onMarkdownOptionsChange({
                            [field.key]: newValue,
                          });
                        }}
                        placeholder={`Default: ${field.defaultValue}`}
                        type="number"
                        value={currentValue?.toString() || ''}
                      />
                      <p className="text-muted-foreground text-xs">
                        {field.tooltip}
                      </p>
                    </div>
                  );
                }

                return null;
              })}
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
