import { cn } from '@deepcrawl/ui/lib/utils';
import NumberFlow, {
  continuous,
  type NumberFlowProps,
} from '@number-flow/react';
import { memo, useMemo } from 'react';
import type { PlaygroundActions } from '@/hooks/playground/types';

export const MetricsNumber = memo(function MetricsNumber({
  value,
  className,
  formatTime,
  options,
}: {
  value: number;
  className?: string;
  formatTime?: PlaygroundActions['formatTime'];
  options?: Omit<NumberFlowProps, 'value'>;
}) {
  // Memoize format configuration to prevent recreation
  const format = useMemo(
    () => ({
      style: 'decimal' as const,
      signDisplay: 'auto' as const,
      maximumFractionDigits: value > 1000 ? 2 : 0,
    }),
    [value],
  );

  // Memoize suffix to prevent recreation
  const suffix = useMemo(() => (value > 1000 ? ' s' : ' ms'), [value]);

  // Memoize formatted value
  const formattedValue = useMemo(
    () => formatTime?.(value, false) as number,
    [formatTime, value],
  );

  // Memoize className
  const mergedClassName = useMemo(
    () => cn('pointer-events-none', options?.className, className),
    [options?.className, className],
  );

  return (
    <NumberFlow
      className={mergedClassName}
      format={format}
      plugins={[continuous]}
      suffix={suffix}
      willChange={true}
      {...options}
      value={formatTime ? formattedValue : value}
    />
  );
});
