import { cn } from '@deepcrawl/ui/lib/utils';
import type { CSSProperties } from 'react';

type TickPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type LineLength = {
  base?: number;
  md?: number;
};

type TickLineConfig = {
  horizontal?: LineLength;
  vertical?: LineLength;
};

type TickLengths =
  | TickLineConfig
  | Partial<Record<TickPosition, TickLineConfig>>;

type CompleteLineLength = {
  base: number;
  md?: number;
};

type CompleteTickLineConfig = {
  horizontal: CompleteLineLength;
  vertical: CompleteLineLength;
};

type TickProps = {
  length?: number;
  lengths?: TickLengths;
  position?: TickPosition[];
};

const DEFAULT_POSITIONS: TickPosition[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

const DEFAULT_LENGTHS: Record<TickPosition, CompleteTickLineConfig> = {
  'top-left': {
    horizontal: { base: 12, md: 22 },
    vertical: { base: 12, md: 22 },
  },
  'top-right': {
    horizontal: { base: 12, md: 22 },
    vertical: { base: 12, md: 22 },
  },
  'bottom-left': {
    horizontal: { base: 12, md: 22 },
    vertical: { base: 12, md: 22 },
  },
  'bottom-right': {
    horizontal: { base: 12, md: 22 },
    vertical: { base: 12, md: 22 },
  },
};

const CONTAINER_CLASSES: Record<TickPosition, string> = {
  'top-left': '-left-[1px] top-0',
  'top-right': '-right-[0.5px] top-0',
  'bottom-left': '-left-[0.5px] bottom-0',
  'bottom-right': '-right-[0.5px] bottom-0',
};

const BASE_CONTAINER_CLASS = 'absolute !z-30 max-lg:hidden';

export function Tick({
  length,
  lengths,
  position = DEFAULT_POSITIONS,
}: TickProps) {
  if (!position.length) {
    return null;
  }

  const overrides = lengths ?? createLegacyLengths(length);

  return (
    <>
      {position.map((pos) => {
        const config = resolveConfig(pos, overrides);

        return (
          <div
            className={cn(BASE_CONTAINER_CLASS, CONTAINER_CLASSES[pos])}
            key={pos}
          >
            <div {...buildLineProps('horizontal', config.horizontal)} />
            <div {...buildLineProps('vertical', config.vertical)} />
          </div>
        );
      })}
    </>
  );
}

function resolveConfig(
  position: TickPosition,
  lengths?: TickLengths,
): CompleteTickLineConfig {
  const defaults = DEFAULT_LENGTHS[position];

  const globalOverride = isLineConfig(lengths) ? lengths : undefined;
  const positionOverride = isPositionMap(lengths)
    ? lengths[position]
    : undefined;

  return {
    horizontal: mergeLineLength(
      defaults.horizontal,
      globalOverride?.horizontal,
      positionOverride?.horizontal,
    ),
    vertical: mergeLineLength(
      defaults.vertical,
      globalOverride?.vertical,
      positionOverride?.vertical,
    ),
  };
}

type TickLineStyle = CSSProperties & {
  '--tick-line-offset'?: string;
  '--tick-line-offset-md'?: string;
  '--tick-line-size'?: string;
  '--tick-line-size-md'?: string;
};

function buildLineProps(
  axis: 'horizontal' | 'vertical',
  lengths: CompleteLineLength,
): { className: string; style: TickLineStyle } {
  const base = Math.max(0, Math.round(lengths.base));
  const baselineClasses = [
    'absolute',
    'border-zinc-300',
    'dark:border-zinc-500',
    axis === 'horizontal' ? 'top-0 border-t-[1px]' : 'left-0 border-l-[1px]',
    axis === 'horizontal'
      ? 'w-[var(--tick-line-size)]'
      : 'h-[var(--tick-line-size)]',
    axis === 'horizontal'
      ? 'h-[var(--tick-line-size)]'
      : 'w-[var(--tick-line-size)]',
    axis === 'horizontal'
      ? '-left-[var(--tick-line-offset)]'
      : '-top-[var(--tick-line-offset)]',
  ];

  const style: TickLineStyle = {
    '--tick-line-offset': `${Math.round(base / 2)}px`,
    '--tick-line-size': `${base}px`,
  };

  const md =
    lengths.md !== undefined ? Math.max(0, Math.round(lengths.md)) : undefined;

  if (md !== undefined) {
    baselineClasses.push(
      axis === 'horizontal'
        ? 'md:w-[var(--tick-line-size-md)]'
        : 'md:h-[var(--tick-line-size-md)]',
      axis === 'horizontal'
        ? 'md:h-[var(--tick-line-size-md)]'
        : 'md:w-[var(--tick-line-size-md)]',
      axis === 'horizontal'
        ? 'md:-left-[var(--tick-line-offset-md)]'
        : 'md:-top-[var(--tick-line-offset-md)]',
    );

    style['--tick-line-offset-md'] = `${Math.round(md / 2)}px`;
    style['--tick-line-size-md'] = `${md}px`;
  }

  return { className: cn(...baselineClasses), style };
}

function mergeLineLength(
  defaults: CompleteLineLength,
  globalOverride?: LineLength,
  positionOverride?: LineLength,
): CompleteLineLength {
  return {
    base: positionOverride?.base ?? globalOverride?.base ?? defaults.base,
    md: positionOverride?.md ?? globalOverride?.md ?? defaults.md,
  };
}

function createLegacyLengths(length?: number): TickLineConfig | undefined {
  if (typeof length !== 'number') {
    return;
  }

  return {
    horizontal: { base: length, md: length * 2 },
    vertical: { base: length, md: length * 2 },
  };
}

function isPositionMap(
  value: TickLengths | undefined,
): value is Partial<Record<TickPosition, TickLineConfig>> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    'top-left' in value ||
    'top-right' in value ||
    'bottom-left' in value ||
    'bottom-right' in value
  );
}

function isLineConfig(value: TickLengths | undefined): value is TickLineConfig {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return !isPositionMap(value);
}
