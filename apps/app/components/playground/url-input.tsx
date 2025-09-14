'use client';

import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { ComponentProps, KeyboardEventHandler } from 'react';
import { useEffect } from 'react';
import { useIsHydrated } from '@/hooks/use-hydrated';

export type UrlInputProps = ComponentProps<typeof Input> & {
  onSubmit?: () => void;
  validationError?: string;
};

export function UrlInput({
  onChange,
  onSubmit,
  validationError,
  className,
  placeholder = 'example.com',
  autoFocus,
  ...props
}: UrlInputProps) {
  const isHydrated = useIsHydrated();

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

      // Call onSubmit if provided, otherwise fallback to form submission
      if (onSubmit) {
        onSubmit();
      } else {
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  // Simple URL validation
  const isValidUrl = (value: string): boolean => {
    if (!value) {
      return true; // Allow empty for now
    }
    try {
      const url = new URL(
        value.startsWith('http') ? value : `https://${value}`,
      );
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const currentValue = props.value?.toString() || '';
  const hasError =
    validationError || (currentValue && !isValidUrl(currentValue));

  return (
    <div className="relative h-16" role="textbox">
      <Badge className="-translate-y-1/2 absolute top-1/2 left-3 cursor-default select-none border-border bg-background py-1 text-muted-foreground">
        https://
      </Badge>
      <Input
        className={cn(
          '!bg-transparent h-full border-none pl-20 shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-transparent',
          hasError && 'border-destructive focus-visible:ring-destructive',
          className,
        )}
        id="url-input"
        name="message"
        onChange={(e) => {
          onChange?.(e);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        // Never pass autoFocus to DOM to avoid hydration mismatch
        {...props}
      />
      {hasError && (
        <div className="absolute top-full left-0 mt-1 text-destructive text-sm">
          {validationError || 'Please enter a valid URL'}
        </div>
      )}
    </div>
  );
}
