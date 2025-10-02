import { cn } from '@deepcrawl/ui/lib/utils';
import NumberFlow, {
  continuous,
  type NumberFlowProps,
} from '@number-flow/react';
import type { PlaygroundActions } from '@/hooks/playground/types';

export function MetricsNumber({
  value,
  className,
  formatTime,
  options,
}: {
  value: number;
  className?: string;
  formatTime: PlaygroundActions['formatTime'];
  options?: NumberFlowProps;
}) {
  return (
    <NumberFlow
      plugins={[continuous]}
      willChange={true}
      {...options}
      className={cn('pointer-events-none', options?.className, className)}
      format={{
        style: 'decimal',
        signDisplay: 'auto',
        maximumFractionDigits: value > 1000 ? 2 : 0,
      }}
      suffix={value > 1000 ? ' s' : ' ms'}
      value={
        formatTime(
          value,
          false, // asString = false
        ) as number
      }
    />
  );
}
