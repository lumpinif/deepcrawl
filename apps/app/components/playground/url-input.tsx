'use client';

import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { ComponentProps, KeyboardEventHandler } from 'react';
import { useEffect } from 'react';
import { useIsHydrated } from '@/hooks/use-hydrated';

export type UrlInputProps = ComponentProps<typeof Input> & {
  onSubmit?: () => void;
  isError?: boolean;
  children?: React.ReactNode;
};

export function UrlInput({
  onChange,
  onSubmit,
  className,
  placeholder = 'example.com',
  autoFocus,
  isError,
  value,
  children,
  ...props
}: UrlInputProps) {
  const isHydrated = useIsHydrated();

  // Check if the value already has a protocol
  const hasProtocol = typeof value === 'string' && /^https?:\/\//i.test(value);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!autoFocus) {
      return;
    }
    // Focus after hydration without rendering the autoFocus attribute
    const el = document.getElementById('url-input') as HTMLInputElement | null;
    if (!el) {
      return;
    }
    // Two RAFs to ensure paint after hydration on some browsers/extensions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.focus({ preventScroll: true });
      });
    });
  }, [isHydrated, autoFocus]);

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      // Don't submit if IME composition is in progress
      if (e.nativeEvent.isComposing) {
        return;
      }

      if (e.shiftKey) {
        // Allow newline
        return;
      }

      // Submit on Enter (without Shift)
      e.preventDefault();

      // Delegate submit to parent handler if provided
      if (onSubmit) {
        onSubmit();
        return;
      }

      // Fallback to form submission
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="relative h-18 w-full flex-1">
      {!hasProtocol && (
        <Badge className="-translate-y-1/2 absolute top-1/2 left-3 cursor-default select-none border-border bg-background py-1 text-muted-foreground">
          https://
        </Badge>
      )}
      <Input
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        className={cn(
          'transition-all duration-200 ease-in-out',
          'border-none',
          // isError &&
          //   '!border-destructive animate-pulse !focus-visible:ring-destructive',
          'h-full rounded-none bg-transparent! shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-transparent',
          hasProtocol ? 'pl-3' : 'pl-20',
          className,
        )}
        id="url-input"
        name="message"
        onChange={(e) => {
          onChange?.(e);
        }}
        onKeyDown={handleKeyDown}
        placeholder={hasProtocol ? 'https://example.com' : placeholder}
        spellCheck={false}
        suppressHydrationWarning
        type="text"
        value={value}
        // Never pass autoFocus to DOM to avoid hydration mismatch
        {...props}
      />
      {children}
    </div>
  );
}
