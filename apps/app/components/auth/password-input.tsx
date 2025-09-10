'use client';

import { Button } from '@deepcrawl/ui/components/ui/button';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as React from 'react';

const PasswordInput = ({
  ref,
  className,
  ...props
}: React.ComponentProps<'input'>) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const disabled =
    props.value === '' || props.value === undefined || props.disabled;

  return (
    <div className="relative">
      <Input
        {...props}
        className={cn('hide-password-toggle pr-10', className)}
        name="password_fake"
        ref={ref}
        type={showPassword ? 'text' : 'password'}
      />
      <Button
        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
        disabled={disabled}
        onClick={() => setShowPassword((prev) => !prev)}
        size="sm"
        type="button"
        variant="ghost"
      >
        {showPassword && !disabled ? (
          <EyeIcon aria-hidden="true" className="h-4 w-4" />
        ) : (
          <EyeOffIcon aria-hidden="true" className="h-4 w-4" />
        )}
        <span className="sr-only">
          {showPassword ? 'Hide password' : 'Show password'}
        </span>
      </Button>

      {/* hides browsers password toggles */}
      <style>{`
                .hide-password-toggle::-ms-reveal,
                .hide-password-toggle::-ms-clear {
                    visibility: hidden;
                    pointer-events: none;
                    display: none;
                }
            `}</style>
    </div>
  );
};
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
