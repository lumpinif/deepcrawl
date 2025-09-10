'use client';

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
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod/v4';
import { SpinnerButton } from '@/components/spinner-button';
import { useAuthRedirect } from '@/hooks/auth.hooks';
import { useIsHydrated } from '@/hooks/use-hydrated';
import { useOnSuccessTransition } from '@/hooks/use-success-transition';
import { authClient } from '@/lib/auth.client';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { authViewRoutes } from '@/routes/auth';
import { getPasswordSchema, type PasswordValidation } from '@/utils';
import { PasswordInput } from '../password-input';

/* Configurable compile-time constants for form fields */
const nameRequired = true;
const emailVerification = true;
const confirmPasswordEnabled = true;

export interface SignUpFormProps {
  className?: string;
  isSubmitting?: boolean;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
  passwordValidation?: PasswordValidation;
}

export function SignUpForm({
  className,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
  passwordValidation,
}: SignUpFormProps) {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const { getFrontendCallbackURL } = useAuthRedirect(redirectTo);
  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  // Form values type aligned with the schema (uses compile-time constants)
  type BaseFormValues = {
    email: string;
    password: string;
  };
  type Empty = Record<never, never>;
  type MaybeName = typeof nameRequired extends true ? { name: string } : Empty;
  type MaybeConfirm = typeof confirmPasswordEnabled extends true
    ? { confirmPassword: string }
    : Empty;
  type OptionalExtras = { username?: string };
  /* We chose explicit conditional types instead of z.infer<typeof formSchema> to make optional field inclusion follow the compile-time flags precisely */
  type FormValues = BaseFormValues & MaybeName & MaybeConfirm & OptionalExtras;

  const formSchema = z
    .object({
      email: z
        .email({ error: 'Email is invalid' })
        .min(1, { error: 'Email is required' }),
      password: getPasswordSchema(passwordValidation),
      ...(confirmPasswordEnabled && {
        confirmPassword: getPasswordSchema(passwordValidation, {
          passwordRequired: 'Confirm Password is required',
          passwordTooShort: 'Password is too short',
          passwordTooLong: 'Password is too long',
          passwordInvalid: 'Password is invalid',
        }),
      }),
      ...(nameRequired && {
        name: z.string().min(1, { error: 'Name is required' }),
      }),
      // Accept but don't require username if present in downstream API
      username: z.string().optional(),
    })
    .refine(
      (data) => {
        // Skip validation if confirmPassword is not enabled
        if (!confirmPasswordEnabled) {
          return true;
        }
        return data.password === data.confirmPassword;
      },
      {
        error: 'Passwords do not match',
        path: ['confirmPassword'],
      },
    );

  // Create default values for the form
  const defaultValues: FormValues = {
    email: '',
    password: '',
    ...(confirmPasswordEnabled && { confirmPassword: '' }),
    ...(nameRequired ? { name: '' } : {}),
  } as FormValues;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  isSubmitting =
    isSubmitting || form.formState.isSubmitting || transitionPending;

  useEffect(() => {
    setIsSubmitting?.(form.formState.isSubmitting || transitionPending);
  }, [form.formState.isSubmitting, transitionPending, setIsSubmitting]);

  async function signUp({
    email,
    password,
    name,
    username,
    confirmPassword,
    ...additionalFieldValues
  }: FormValues) {
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: name || '',
        ...(username !== undefined && { username }),
        ...additionalFieldValues,
        ...(emailVerification && { callbackURL: getFrontendCallbackURL() }),
      });

      if (error) {
        toast.error(getAuthErrorMessage(error));
        return;
      }

      if ('token' in data && data.token) {
        await onSuccess();
      } else {
        router.push(`${authViewRoutes.login}${window.location.search}`);
        toast.success('Please check your email to verify your account.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');

      form.resetField('password');
      form.resetField('confirmPassword');
    }
  }

  return (
    <Form {...form}>
      <form
        className={cn('grid w-full gap-6', className)}
        noValidate={isHydrated}
        onSubmit={form.handleSubmit(signUp)}
      >
        {nameRequired && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>

                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Name"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>

              <FormControl>
                <Input
                  disabled={isSubmitting}
                  placeholder="your@email.com"
                  type="email"
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
              <FormLabel>Password</FormLabel>

              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        {confirmPasswordEnabled && (
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
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {/* // TODO: Add captcha */}
        {/* <Captcha
          ref={captchaRef}
          localization={localization}
          action="/sign-up/email"
        /> */}
        <SpinnerButton
          buttonState={isSubmitting ? 'loading' : 'idle'}
          className="w-full text-md"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          type="submit"
        >
          Sign up
        </SpinnerButton>
      </form>
    </Form>
  );
}
