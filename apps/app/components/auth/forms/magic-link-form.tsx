'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { SpinnerButton } from '@/components/spinner-button';
import { useAuthRedirect } from '@/hooks/auth.hooks';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { authClient } from '@/lib/auth.client';
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
import { toast } from 'sonner';
import { useIsHydrated } from '../../../hooks/use-hydrated';

export interface MagicLinkFormProps {
  className?: string;
  isSubmitting?: boolean;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
}

export function MagicLinkForm({
  className,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
}: MagicLinkFormProps) {
  const isHydrated = useIsHydrated();
  const { getFrontendCallbackURL } = useAuthRedirect(redirectTo);

  const formSchema = z.object({
    email: z
      .string()
      .min(1, { message: `Email is required` })
      .email({ message: `Email is invalid` }),
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { email } = values;

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: getFrontendCallbackURL(),
    });

    if (error) {
      toast.error(getAuthErrorMessage(error));
      return;
    }

    toast.success('Magic link sent to email');

    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
          isLoading={isSubmitting}
          className="w-full text-md"
          buttonState={isSubmitting ? 'loading' : 'idle'}
        >
          Send Magic Link
        </SpinnerButton>
      </form>
    </Form>
  );
}
