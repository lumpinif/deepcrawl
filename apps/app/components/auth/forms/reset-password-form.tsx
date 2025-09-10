'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@deepcrawl/ui/components/ui/form';
import { cn } from '@deepcrawl/ui/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod/v4';
import { SpinnerButton } from '@/components/spinner-button';
import { authClient } from '@/lib/auth.client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { authViewRoutes } from '@/routes/auth';
import { getPasswordSchema, type PasswordValidation } from '@/utils';
import { PasswordInput } from '../password-input';

export interface ResetPasswordFormProps {
  className?: string;
  passwordValidation?: PasswordValidation;
}

export function ResetPasswordForm({
  className,
  passwordValidation,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const tokenChecked = useRef(false);

  const formSchema = z
    .object({
      newPassword: getPasswordSchema(passwordValidation, {
        passwordRequired: 'Password is required',
        passwordTooShort: 'Password is too short',
        passwordTooLong: 'Password is too long',
        passwordInvalid: 'Password is invalid',
      }),
      confirmPassword: getPasswordSchema(passwordValidation, {
        passwordRequired: 'Password is required',
        passwordTooShort: 'Password is too short',
        passwordTooLong: 'Password is too long',
        passwordInvalid: 'Password is invalid',
      }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (tokenChecked.current) return;
    tokenChecked.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');

    if (!token || token === 'INVALID_TOKEN') {
      // Redirect to login without carrying over the invalid token
      router.push(`/${authViewRoutes.login}`);
      toast.error('Invalid token');
    }
  }, [router]);

  async function resetPassword({ newPassword }: z.infer<typeof formSchema>) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token') as string;

      const { error } = await authClient.resetPassword({
        token,
        newPassword,
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return;
      }

      toast.success('Password reset successfully');

      // Clean up URL and redirect to login without the token for security
      router.push(`/${authViewRoutes.login}`);
    } catch (error) {
      toast.error('Error resetting password');

      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn('grid w-full gap-6', className)}
        onSubmit={form.handleSubmit(resetPassword)}
      >
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>

              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  placeholder="New Password"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>

              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  placeholder="Confirm Password"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <SpinnerButton
          buttonState={isSubmitting ? 'loading' : 'idle'}
          className="w-full text-md"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          type="submit"
        >
          Reset Password
        </SpinnerButton>
      </form>
    </Form>
  );
}
