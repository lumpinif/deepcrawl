'use client';

import { DEFAULT_METRICS_OPTIONS } from '@deepcrawl/types/configs';
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { ChartLineIcon } from '@deepcrawl/ui/components/icons/chart-line';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { Switch } from '@deepcrawl/ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { ExtractLinksOptions, ReadUrlOptions } from 'deepcrawl';
import { useRef, useState } from 'react';

type MetricsOptionsInput =
  | ReadUrlOptions['metricsOptions']
  | ExtractLinksOptions['metricsOptions'];

interface MetricsOptionsMenuProps {
  metricsOptions: MetricsOptionsInput | undefined;
  onMetricsOptionsChange: (metricsOptions: MetricsOptionsInput) => void;
}

export function MetricsOptionsMenu({
  metricsOptions,
  onMetricsOptionsChange,
}: MetricsOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);

  const updateMetricsOption = (key: string, value: boolean) => {
    onMetricsOptionsChange({
      ...metricsOptions,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onMetricsOptionsChange({
      enable: DEFAULT_METRICS_OPTIONS.enable,
    });
  };

  const hasCustomSettings =
    metricsOptions?.enable !== undefined &&
    metricsOptions.enable !== DEFAULT_METRICS_OPTIONS.enable;

  const currentEnabled =
    metricsOptions?.enable ?? DEFAULT_METRICS_OPTIONS.enable;

  return (
    <Tooltip>
      <PromptInputActionMenu onOpenChange={setIsOpen} open={isOpen}>
        <TooltipTrigger asChild>
          <PromptInputActionMenuTrigger
            className="cursor-help"
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
          >
            <ChartLineIcon
              className={cn('h-4 w-4', hasCustomSettings && 'text-violet-600')}
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
              <h3 className="font-medium text-sm">Metrics Options</h3>
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
              <div className="flex w-fit items-center space-x-2">
                <Switch
                  checked={Boolean(currentEnabled)}
                  id="metrics-enable"
                  onCheckedChange={(checked) =>
                    updateMetricsOption('enable', Boolean(checked))
                  }
                />
                <Label
                  className="cursor-pointer text-sm"
                  htmlFor="metrics-enable"
                >
                  Enable Performance Metrics
                  <Badge
                    className="ml-2 text-muted-foreground text-xs uppercase"
                    variant="outline"
                  >
                    Default: {DEFAULT_METRICS_OPTIONS.enable ? 'On' : 'Off'}
                  </Badge>
                </Label>
              </div>
              <p className="text-muted-foreground text-xs">
                Include timing data and operation duration in API responses
              </p>
            </div>

            <div className="border-t pt-3">
              <p className="text-muted-foreground text-xs">
                * Metrics provide detailed performance information
              </p>
            </div>
          </div>
        </PromptInputActionMenuContent>
        <TooltipContent align="start" side="bottom">
          <p>Configure performance metrics collection</p>
        </TooltipContent>
      </PromptInputActionMenu>
    </Tooltip>
  );
}
