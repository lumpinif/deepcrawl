'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { SpinnerButton } from '@/components/spinner-button';
import { authClient } from '@/lib/auth.client';
import { authViewRoutes } from '@/routes/auth';
import { type PasswordValidation, getPasswordSchema } from '@/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@deepcrawl/ui/components/ui/form';
import { cn } from '@deepcrawl/ui/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
      router.push(`/${authViewRoutes.login}${window.location.search}`);
      toast.error('Invalid token');
    }
  }, [router]);

  async function resetPassword({ newPassword }: z.infer<typeof formSchema>) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token') as string;

      await authClient.resetPassword({
        token,
        newPassword,
        fetchOptions: { throw: true },
      });

      toast.success('Password reset successfully');

      router.push(`/${authViewRoutes.login}${window.location.search}`);
    } catch (error) {
      toast.error('Error resetting password');

      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(resetPassword)}
        className={cn('grid w-full gap-6', className)}
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
                  placeholder="New Password"
                  disabled={isSubmitting}
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
                  placeholder="Confirm Password"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <SpinnerButton
          type="submit"
          disabled={isSubmitting}
          className="w-full text-md"
          isLoading={isSubmitting}
          buttonState={isSubmitting ? 'loading' : 'idle'}
        >
          Reset Password
        </SpinnerButton>
      </form>
    </Form>
  );
}
