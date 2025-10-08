'use client';

import { DEFAULT_LINK_EXTRACTION_OPTIONS } from '@deepcrawl/types/configs';
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { LinkIcon } from '@deepcrawl/ui/components/icons/link';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { Switch } from '@deepcrawl/ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { ExtractLinksOptions } from 'deepcrawl';
import { useCallback, useRef, useState } from 'react';
import {
  usePlaygroundCoreSelector,
  usePlaygroundOptionsSelector,
} from '@/contexts/playground-context';
import type { PlaygroundOptionsContextValue } from '@/hooks/playground/types';

type LinkExtractionOptionsInput = ExtractLinksOptions['linkExtractionOptions'];

export function LinkExtractionOptionsMenu() {
  // Get state and actions from context
  const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
  const currentOpts = usePlaygroundOptionsSelector('currentOptions');
  const selectSetOptions = useCallback(
    (state: PlaygroundOptionsContextValue) =>
      state.currentQueryState.setOptions,
    [],
  );
  const setOptions = usePlaygroundOptionsSelector(selectSetOptions);

  // Extract link extraction options from current options
  const linkExtractionOptions =
    'linkExtractionOptions' in currentOpts
      ? currentOpts.linkExtractionOptions
      : undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [excludePatternsInput, setExcludePatternsInput] = useState<string>(
    linkExtractionOptions?.excludePatterns?.join('\n') ?? '',
  );
  const iconRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  // Create change handler that uses context
  const onLinkExtractionOptionsChange = (
    linkExtractionOptions: LinkExtractionOptionsInput,
  ) => {
    setOptions({ linkExtractionOptions });
  };

  // Only show for extractLinks operation
  if (selectedOperation !== 'extractLinks') {
    return null;
  }

  // Link extraction option fields with their defaults and metadata
  const LINK_EXTRACTION_OPTION_FIELDS = [
    {
      key: 'includeExternal' as const,
      defaultValue: DEFAULT_LINK_EXTRACTION_OPTIONS.includeExternal,
      type: 'switch' as const,
      label: 'Include External Links',
      tooltip: 'Include links from other domains in the extraction results',
    },
    {
      key: 'includeMedia' as const,
      defaultValue: DEFAULT_LINK_EXTRACTION_OPTIONS.includeMedia,
      type: 'switch' as const,
      label: 'Include Media Files',
      tooltip:
        'Include media files (images, videos, documents) in extraction results',
    },
    {
      key: 'removeQueryParams' as const,
      defaultValue: DEFAULT_LINK_EXTRACTION_OPTIONS.removeQueryParams,
      type: 'switch' as const,
      label: 'Remove Query Parameters',
      tooltip: 'Remove query parameters (?param=value) from extracted URLs',
    },
  ] as const;

  const handleExcludePatternsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setExcludePatternsInput(value);

    // Update the actual option value - split by newlines and filter empty strings
    const patterns = value
      .split('\n')
      .map((pattern) => pattern.trim())
      .filter((pattern) => pattern.length > 0);

    onLinkExtractionOptionsChange({
      excludePatterns: patterns.length > 0 ? patterns : undefined,
    });
  };

  const resetToDefaults = () => {
    onLinkExtractionOptionsChange({
      includeExternal: DEFAULT_LINK_EXTRACTION_OPTIONS.includeExternal,
      includeMedia: DEFAULT_LINK_EXTRACTION_OPTIONS.includeMedia,
      removeQueryParams: DEFAULT_LINK_EXTRACTION_OPTIONS.removeQueryParams,
      excludePatterns: undefined,
    });
    setExcludePatternsInput('');
  };

  const hasCustomSettings =
    LINK_EXTRACTION_OPTION_FIELDS.some(({ key, defaultValue }) => {
      const currentValue = linkExtractionOptions?.[key];
      return currentValue !== undefined && currentValue !== defaultValue;
    }) ||
    (linkExtractionOptions?.excludePatterns !== undefined &&
      linkExtractionOptions.excludePatterns.length > 0);

  const baseColor =
    'group-data-[customized=true]:text-blue-600 group-hover:!text-blue-600' as const;

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
            <LinkIcon className={cn(baseColor)} ref={iconRef} />
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
              <h3 className="font-medium text-sm">Link Extraction Options</h3>
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
              {LINK_EXTRACTION_OPTION_FIELDS.map((field) => {
                const currentValue =
                  linkExtractionOptions?.[field.key] ?? field.defaultValue;
                const fieldId = `link-extraction-${field.key}`;

                return (
                  <div key={field.key}>
                    <div className="flex w-fit items-center space-x-2">
                      <Switch
                        checked={Boolean(currentValue)}
                        id={fieldId}
                        onCheckedChange={(checked) =>
                          onLinkExtractionOptionsChange({
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
                    <p className="text-muted-foreground text-xs">
                      {field.tooltip}
                    </p>
                  </div>
                );
              })}

              <div className="space-y-2">
                <Label className="text-sm" htmlFor="exclude-patterns">
                  Exclude Patterns
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Optional
                  </Badge>
                </Label>
                <Input
                  className="font-mono text-xs"
                  id="exclude-patterns"
                  onChange={handleExcludePatternsChange}
                  placeholder="^/admin/&#10;\.pdf$&#10;/private/"
                  value={excludePatternsInput}
                />
                <p className="text-muted-foreground text-xs">
                  Regex patterns to exclude URLs (one per line). Examples:
                  ^/admin/, \.pdf$, /private/
                </p>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-muted-foreground text-xs">
                * Link extraction settings control which links are extracted and
                how they are processed
              </p>
            </div>
          </div>
        </PromptInputActionMenuContent>
        <TooltipContent align="start" side="bottom">
          <p>Configure link extraction behavior and filtering</p>
        </TooltipContent>
      </PromptInputActionMenu>
    </Tooltip>
  );
}
