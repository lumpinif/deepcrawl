'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { BetterFetchOption } from 'better-auth/react';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useCaptcha } from '@/hooks/use-captcha';
import { useIsHydrated } from '@/hooks/use-hydrated';
import { useOnSuccessTransition } from '@/hooks/use-success-transition';

import { SpinnerButton } from '@/components/spinner-button';
import { authClient } from '@/lib/auth.client';
import { authViewRoutes } from '@/routes/auth';
import {
  type PasswordValidation,
  getPasswordSchema,
  getSearchParam,
} from '@/utils';
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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PasswordInput } from '../password-input';

export interface SignUpFormProps {
  className?: string;
  callbackURL?: string;
  isSubmitting?: boolean;
  redirectTo?: string;
  setIsSubmitting?: (value: boolean) => void;
  passwordValidation?: PasswordValidation;
}

const nameRequired = true;
const confirmPasswordEnabled = true;
const emailVerification = true;
const persistClient = true;

export function SignUpForm({
  className,
  callbackURL,
  isSubmitting,
  redirectTo,
  setIsSubmitting,
  passwordValidation,
}: SignUpFormProps) {
  const isHydrated = useIsHydrated();
  const { captchaRef, getCaptchaHeaders } = useCaptcha();
  const router = useRouter();
  const getRedirectTo = useCallback(
    () => redirectTo || getSearchParam('redirectTo'),
    [redirectTo],
  );

  const getCallbackURL = useCallback(
    () =>
      `${
        callbackURL ||
        `/${authViewRoutes.callback}?redirectTo=${getRedirectTo()}`
      }`,
    [callbackURL, getRedirectTo],
  );

  const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
    redirectTo,
  });

  // Create the base schema for standard fields
  const schemaFields: Record<string, z.ZodTypeAny> = {
    email: z
      .string()
      .min(1, {
        message: `Email is required`,
      })
      .email({
        message: `Email is invalid`,
      }),
    password: getPasswordSchema(passwordValidation),
  };

  // Add confirmPassword field if enabled
  schemaFields.confirmPassword = getPasswordSchema(passwordValidation, {
    passwordRequired: 'Confirm Password is required',
    passwordTooShort: 'Password is too short',
    passwordTooLong: 'Password is too long',
    passwordInvalid: 'Password is invalid',
  });

  // required name
  if (nameRequired) {
    schemaFields.name = z.string().min(1, {
      message: `Name is required`,
    });
  }

  const formSchema = z.object(schemaFields).refine(
    (data) => {
      // Skip validation if confirmPassword is not enabled
      if (!confirmPasswordEnabled) return true;
      return data.password === data.confirmPassword;
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  );

  // Create default values for the form
  const defaultValues: Record<string, unknown> = {
    email: '',
    password: '',
    ...(confirmPasswordEnabled && { confirmPassword: '' }),
    ...(nameRequired ? { name: '' } : {}),
  };

  const form = useForm({
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
  }: z.infer<typeof formSchema>) {
    try {
      const fetchOptions: BetterFetchOption = {
        throw: true,
        // headers: await getCaptchaHeaders('/sign-up/email'),
      };

      const data = await authClient.signUp.email({
        email,
        password,
        name: name || '',
        ...(username !== undefined && { username }),
        ...additionalFieldValues,
        ...(emailVerification &&
          persistClient && { callbackURL: getCallbackURL() }),
        fetchOptions,
      });

      if ('token' in data && data.token) {
        await onSuccess();
      } else {
        router.push(`${authViewRoutes.login}${window.location.search}`);
        toast.success('Sign up successful');
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
        onSubmit={form.handleSubmit(signUp)}
        noValidate={isHydrated}
        className={cn('grid w-full gap-6', className)}
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
                    placeholder="Name"
                    disabled={isSubmitting}
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
                  type="email"
                  placeholder="your@email.com"
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
          type="submit"
          disabled={isSubmitting}
          className="w-full text-md"
          isLoading={isSubmitting}
          buttonState={isSubmitting ? 'loading' : 'idle'}
        >
          Sign up
        </SpinnerButton>
      </form>
    </Form>
  );
}
