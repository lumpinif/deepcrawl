'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { cn } from '@deepcrawl/ui/lib/utils';
import { IconBrightness } from '@tabler/icons-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      className="text-muted-foreground"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      size="icon"
      variant="ghost"
    >
      <IconBrightness
        aria-hidden="true"
        className="size-4 rotate-0 transition-all duration-200 ease-out dark:-rotate-180"
      />
      {/* <Sun
        className="dark:-rotate-90 size-4 rotate-0 scale-100 transition-all dark:scale-0"
        aria-hidden="true"
      /> */}
      {/* <Moon
        className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      /> */}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function ThemeGroupToggle({
  className,
  buttonClassName,
  iconClassName,
  withLabel,
}: {
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
  withLabel?: boolean;
}) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ];

  return (
    <div
      className={cn(
        'flex size-fit h-fit flex-nowrap items-center justify-center gap-0.5 rounded-full border p-0.5',
        className,
      )}
    >
      {themes.map(({ value, icon: Icon }) => (
        // <Tooltip key={value} disableHoverableContent={true} delayDuration={200}>
        //   <TooltipTrigger asChild>
        <Button
          className={cn(
            buttonClassName,
            'h-5 w-5 rounded-full',
            mounted && theme === value
              ? 'bg-muted text-primary shadow-sm'
              : 'hover:bg-muted/50',
          )}
          key={value}
          onClick={(e) => {
            e.stopPropagation();
            setTheme(value);
          }}
          size="icon"
          variant={mounted && theme === value ? 'outline' : 'ghost'}
        >
          <Icon className={cn('size-3', iconClassName)} />
          {withLabel && (
            <span className="capitalize">
              {value === 'system' ? 'follow device' : value}
            </span>
          )}
          <span className="sr-only">Set {value} theme</span>
        </Button>
        // </TooltipTrigger>
        // <TooltipContent
        //   side="bottom"
        //   align="center"
        //   className="w-fit max-w-xs text-pretty border bg-background-subtle text-muted-foreground text-sm shadow-lg"
        // >
        //   <span className="font-semibold capitalize">{value}</span>
        // </TooltipContent>
        // </Tooltip>
      ))}
    </div>
  );
}
