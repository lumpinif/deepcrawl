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
import type { CacheOptions } from 'deepcrawl/types';
import { useCallback, useRef, useState } from 'react';
import { usePlaygroundOptionsSelector } from '@/contexts/playground-context';
import type { PlaygroundOptionsContextValue } from '@/hooks/playground/types';
import { formatDaysFromSeconds } from '@/utils/playground/formatter';

const CACHE_OPTION_FIELDS = [
  {
    key: 'enabled',
    defaultValue: DEFAULT_CACHE_OPTIONS.enabled,
    type: 'switch',
    label: 'Enable Cache',
    tooltip: 'Enable or disable caching for this request',
  },
  /* @deprecated */
  // {
  //   key: 'expiration',
  //   defaultValue: undefined,
  //   type: 'number',
  //   label: 'Expiration (epoch timestamp)',
  //   tooltip: 'Specific timestamp when cache expires',
  //   placeholder: '1717708800',
  // },
  {
    key: 'expirationTtl',
    defaultValue: DEFAULT_CACHE_OPTIONS.expirationTtl,
    type: 'number',
    label: 'Expiration TTL (seconds, min 60)',
    tooltip: 'Time-to-live in seconds from now',
    min: 60,
    placeholder: `Default: ${DEFAULT_CACHE_OPTIONS.expirationTtl}`,
    badge: `Default: ${formatDaysFromSeconds(DEFAULT_CACHE_OPTIONS.expirationTtl)} days`,
  },
] as const satisfies readonly {
  key: string;
  defaultValue: boolean | number | undefined;
  type: 'switch' | 'number';
  label: string;
  tooltip: string;
  placeholder?: string;
  min?: number;
  badge?: string;
}[];

// Component now uses context - no props needed!
export function CacheOptionsMenu() {
  // Get state and actions from context
  const currentOpts = usePlaygroundOptionsSelector('currentOptions');
  const selectSetOptions = useCallback(
    (state: PlaygroundOptionsContextValue) =>
      state.currentQueryState.setOptions,
    [],
  );
  const setOptions = usePlaygroundOptionsSelector(selectSetOptions);

  // Extract cache options from current options
  const cacheOptions =
    'cacheOptions' in currentOpts ? currentOpts.cacheOptions : undefined;

  // Create change handler that uses context
  const onCacheOptionsChange = (cacheOptions: CacheOptions) => {
    setOptions({ cacheOptions });
  };
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  const resetToDefaults = () => {
    onCacheOptionsChange({
      enabled: DEFAULT_CACHE_OPTIONS.enabled,
      expirationTtl: DEFAULT_CACHE_OPTIONS.expirationTtl,
    });
  };

  const hasCustomSettings = CACHE_OPTION_FIELDS.some(
    ({ key, defaultValue }) => {
      const currentValue = cacheOptions?.[key];
      return currentValue !== undefined && currentValue !== defaultValue;
    },
  );

  const baseColor =
    'group-data-[customized=true]:text-green-600 group-hover:!text-green-600' as const;

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
            <ClockIcon className={cn(baseColor)} ref={iconRef} />
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
              {CACHE_OPTION_FIELDS.map((field) => {
                const currentValue =
                  cacheOptions?.[field.key] ?? field.defaultValue;
                const fieldId = `cache-${field.key}`;

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
                          onCacheOptionsChange({
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

                if (field.type === 'number') {
                  return (
                    <div className="space-y-2" key={field.key}>
                      <Label className="text-sm" htmlFor={fieldId}>
                        {field.label}
                        {'badge' in field && field.badge && (
                          <Badge
                            className="ml-2 text-muted-foreground text-xs uppercase"
                            variant="outline"
                          >
                            {field.badge}
                          </Badge>
                        )}
                      </Label>
                      <Input
                        className="font-mono text-xs"
                        id={fieldId}
                        min={'min' in field ? field.min?.toString() : undefined}
                        onBlur={(e) => {
                          const newValue = e.target.value
                            ? Number(e.target.value)
                            : undefined;

                          // Enforce minimum value if specified when user finishes typing
                          if (
                            newValue !== undefined &&
                            'min' in field &&
                            field.min &&
                            newValue < field.min
                          ) {
                            onCacheOptionsChange({
                              [field.key]: field.min,
                            });
                          }
                        }}
                        onChange={(e) => {
                          const newValue = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          onCacheOptionsChange({
                            [field.key]: newValue,
                          });
                        }}
                        placeholder={field.placeholder}
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
