'use client';

import { DEFAULT_CACHE_OPTIONS } from '@deepcrawl/types/configs';
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { ClockIcon } from '@deepcrawl/ui/components/icons/clock';
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
import type {
  ExtractLinksOptions,
  GetMarkdownOptions,
  ReadUrlOptions,
} from 'deepcrawl';
import { useState } from 'react';

type CacheOptionsInput =
  | ReadUrlOptions['cacheOptions']
  | ExtractLinksOptions['cacheOptions']
  | GetMarkdownOptions['cacheOptions'];

interface CacheOptionsMenuProps {
  cacheOptions: CacheOptionsInput | undefined;
  onCacheOptionsChange: (cacheOptions: CacheOptionsInput) => void;
  defaultTtl: number;
}

export function CacheOptionsMenu({
  cacheOptions,
  onCacheOptionsChange,
  defaultTtl,
}: CacheOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateCacheOption = (
    key: string,
    value: boolean | number | undefined,
  ) => {
    onCacheOptionsChange({
      ...cacheOptions,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onCacheOptionsChange({
      enabled: DEFAULT_CACHE_OPTIONS.enabled,
      expiration: undefined,
      expirationTtl: undefined,
    });
  };

  const hasCustomSettings =
    (cacheOptions?.enabled !== undefined &&
      cacheOptions.enabled !== DEFAULT_CACHE_OPTIONS.enabled) ||
    cacheOptions?.expiration ||
    cacheOptions?.expirationTtl;

  return (
    <Tooltip>
      <PromptInputActionMenu onOpenChange={setIsOpen} open={isOpen}>
        <TooltipTrigger asChild>
          <PromptInputActionMenuTrigger className="cursor-help">
            <ClockIcon
              className={cn('h-4 w-4', hasCustomSettings && 'text-green-500')}
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
              <h3 className="font-medium text-sm">Cache Options</h3>
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
              {/* Enable Cache */}
              <div className="flex w-fit items-center space-x-2">
                <Switch
                  checked={Boolean(
                    cacheOptions?.enabled ?? DEFAULT_CACHE_OPTIONS.enabled,
                  )}
                  id="cache-enabled"
                  onCheckedChange={(checked) =>
                    updateCacheOption('enabled', Boolean(checked))
                  }
                />
                <Label
                  className="cursor-pointer text-sm"
                  htmlFor="cache-enabled"
                >
                  Enable Cache
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Default: {DEFAULT_CACHE_OPTIONS.enabled ? 'On' : 'Off'}
                  </Badge>
                </Label>
              </div>

              {/* Expiration Timestamp */}
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="cache-expiration">
                  Expiration (epoch timestamp)
                </Label>
                <Input
                  className="font-mono text-xs"
                  id="cache-expiration"
                  onChange={(e) => {
                    const newValue = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    updateCacheOption('expiration', newValue);
                  }}
                  placeholder="1717708800"
                  type="number"
                  value={cacheOptions?.expiration || ''}
                />
                <p className="text-muted-foreground text-xs">
                  Specific timestamp when cache expires
                </p>
              </div>

              {/* Expiration TTL */}
              <div className="space-y-2">
                <Label className="text-sm" htmlFor="cache-expiration-ttl">
                  Expiration TTL (seconds, min 60)
                </Label>
                <Input
                  className="font-mono text-xs"
                  id="cache-expiration-ttl"
                  min="60"
                  onChange={(e) => {
                    const newValue = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    updateCacheOption('expirationTtl', newValue);
                  }}
                  placeholder={`Default: ${defaultTtl} (4 days)`}
                  type="number"
                  value={cacheOptions?.expirationTtl || ''}
                />
                <p className="text-muted-foreground text-xs">
                  Time-to-live in seconds from now
                </p>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-muted-foreground text-xs">
                * Cache settings apply to the current request
              </p>
            </div>
          </div>
        </PromptInputActionMenuContent>
        <TooltipContent align="start" side="bottom">
          <p>Configure cache behavior for requests</p>
        </TooltipContent>
      </PromptInputActionMenu>
    </Tooltip>
  );
}
