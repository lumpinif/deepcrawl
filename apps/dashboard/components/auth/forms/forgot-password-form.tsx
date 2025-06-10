'use client';

import { SpinnerButton } from '@/components/spinner-button';
import { authClient } from '@/lib/auth.client';
import { authViewRoutes } from '@/routes/auth';
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
import type { BetterFetchOption } from 'better-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useIsHydrated } from '../../../hooks/use-hydrated';

export interface ForgotPasswordFormProps {
  className?: string;
  isSubmitting?: boolean;
  setIsSubmitting?: (value: boolean) => void;
}

export function ForgotPasswordForm({
  className,
  isSubmitting,
  setIsSubmitting,
}: ForgotPasswordFormProps) {
  const router = useRouter();
  const isHydrated = useIsHydrated();

  const formSchema = z.object({
    email: z
      .string()
      .min(1, {
        message: `Email is required`,
      })
      .email({
        message: `Email is invalid`,
      }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  isSubmitting = isSubmitting || form.formState.isSubmitting;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting);
  }, [form.formState.isSubmitting, setIsSubmitting]);

  async function forgotPassword({ email }: z.infer<typeof formSchema>) {
    try {
      const fetchOptions: BetterFetchOption = {
        throw: true,
      };

      await authClient.forgetPassword({
        email,
        redirectTo: `/${authViewRoutes.resetPassword}`,
        fetchOptions,
      });

      toast.success('Password reset email sent');

      router.push(`${authViewRoutes.login}${window.location.search}`);
    } catch (error) {
      toast.error('Error sending password reset email');
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(forgotPassword)}
        noValidate={isHydrated}
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
                  placeholder="Email"
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
          Send Reset Email
        </SpinnerButton>
      </form>
    </Form>
  );
}
