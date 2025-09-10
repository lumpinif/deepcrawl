'use client';

import { Checkbox } from '@deepcrawl/ui/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@deepcrawl/ui/components/ui/form';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod/v4';
import { SpinnerButton } from '@/components/spinner-button';
import { useIsHydrated } from '@/hooks/use-hydrated';
import { useOnSuccessTransition } from '@/hooks/use-success-transition';
import { authClient } from '@/lib/auth.client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { authViewRoutes } from '@/routes/auth';
import { getPasswordSchema, type PasswordValidation } from '@/utils';
import { PasswordInput } from '../password-input';

export interface SignInFormProps {
  className?: string;
  isSubmitting?: boolean;
  redirectTo?: string;
  setIsSubmitting?: (isSubmitting: boolean) => void;
  passwordValidation?: PasswordValidation;
}

const REMEMBER_ME_ENABLED = false;

export function SignInForm({
  className,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
  passwordValidation,
}: SignInFormProps) {
  const isHydrated = useIsHydrated();
  // const { captchaRef, getCaptchaHeaders } = useCaptcha()

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  const formSchema = z.object({
    email: z.email(),
    password: getPasswordSchema(passwordValidation),
    rememberMe: z.boolean().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: REMEMBER_ME_ENABLED,
    },
  });

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending);
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting]);

  async function signIn({
    email,
    password,
    rememberMe,
  }: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (error) {
        const errorMessage = getAuthErrorMessage(error);

        form.resetField('password');
        toast.error(errorMessage);
        return;
      }

      if (data) {
        await onSuccess();
      }
    } catch (error) {
      form.resetField('password');
      console.error('Unexpected sign-in error:', error);
      toast.error('A network error occurred. Please try again.');
    }
  }

  return (
    <Form {...form}>
      <form
        noValidate={isHydrated}
        onSubmit={form.handleSubmit(signIn)}
        className={cn('grid w-full gap-6', className)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>

              <FormControl>
                <Input
                  type="email"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="email"
                  disabled={isSubmitting}
                  placeholder="your@email.com"
                  suppressHydrationWarning={true}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>

                <Link
                  className="text-muted-foreground text-sm hover:text-foreground hover:underline"
                  href={`${authViewRoutes.forgotPassword}${isHydrated ? window.location.search : ''}`}
                >
                  Forgot password?
                </Link>
              </div>

              <FormControl>
                <PasswordInput
                  disabled={isSubmitting}
                  suppressHydrationWarning={true}
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {REMEMBER_ME_ENABLED && (
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>Remember me</FormLabel>
              </FormItem>
            )}
          />
        )}

        {/* TODO: Add captcha */}
        {/* <Captcha
          ref={captchaRef}
          action="/login/email"
        /> */}

        <SpinnerButton
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="w-full text-md"
          buttonState={isSubmitting ? 'loading' : 'idle'}
        >
          Login
        </SpinnerButton>
      </form>
    </Form>
  );
}
