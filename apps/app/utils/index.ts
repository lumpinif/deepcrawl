import * as z from 'zod';
import type { AuthView, AuthViewRoutes } from '@/routes/auth';

// Re-export utilities
export { copyToClipboard } from './clipboard';

export function getAuthViewByPath(
  authViewPaths: AuthViewRoutes,
  path?: string,
) {
  for (const authViewPathsKey in authViewPaths) {
    if (authViewPaths[authViewPathsKey as AuthView] === path) {
      return authViewPathsKey as AuthView;
    }
  }
}

/**
 * Check if a pathname is a valid auth route
 */
export function isValidAuthRoute(
  authViewRoutes: AuthViewRoutes,
  pathname?: string,
): boolean {
  if (!pathname) return false;

  // Extract the last part of the pathname (in case it's a full path)
  const path = pathname.split('/').pop();

  return Object.values(authViewRoutes).includes(path as string);
}

/**
 * Get all valid auth route paths as an array
 */
export function getValidAuthPaths(authViewRoutes: AuthViewRoutes): string[] {
  return Object.values(authViewRoutes);
}

/**
 * Validate and normalize an auth pathname
 * Returns the normalized path if valid, or null if invalid
 */
export function validateAuthPathname(
  authViewRoutes: AuthViewRoutes,
  pathname?: string,
): string | null {
  if (!pathname) return null;

  const path = pathname.split('/').pop();

  if (path && isValidAuthRoute(authViewRoutes, path)) {
    return path;
  }

  return null;
}

export function getSearchParam(paramName: string) {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get(paramName)
    : null;
}

/**
 * Get normalized, user-friendly titles for auth views
 */
export function getAuthViewTitle(authView: AuthView): string {
  const titleMap: Record<AuthView, string> = {
    login: 'Login to Deepcrawl',
    signUp: 'Sign Up to Deepcrawl',
    logout: 'Logout of Deepcrawl',
    callback: 'Authentication Callback',
    emailOTP: 'Email Verification',
    magicLink: 'Magic Link to Deepcrawl',
    twoFactor: 'Two-Factor Authentication',
    resetPassword: 'Reset Password for Deepcrawl',
    forgotPassword: 'Forgot Password for Deepcrawl',
    verifyEmail: 'Verify Your Email',
    acceptInvitation: 'Accept Invitation',
    // recoverAccount: 'Recover Account for Deepcrawl',
  };

  return titleMap[authView] || 'Authentication';
}

/**
 * Get short description titles for auth views
 */
export function getAuthViewDescriptionTitle(authView: AuthView): string {
  const descriptionTitleMap: Record<AuthView, string> = {
    login: 'Welcome back',
    signUp: 'Get started',
    logout: 'Logging out',
    callback: 'Authenticating',
    emailOTP: 'Check your email',
    magicLink: 'Magic link sign in',
    twoFactor: 'Two-factor authentication',
    resetPassword: 'Reset your password',
    forgotPassword: 'Forgot your password?',
    verifyEmail: 'Check your inbox',
    acceptInvitation: 'Join organization',
    // recoverAccount: 'Recover your account',
  };

  return descriptionTitleMap[authView] || 'Authentication';
}

/**
 * Get detailed description text for auth views (without the greeting)
 */
export function getAuthViewDetailedDescription(authView: AuthView): string {
  const detailedDescriptionMap: Record<AuthView, string> = {
    login: 'Please sign in to your account to continue.',
    signUp: 'Create a new account to get started with DeepCrawl Dashboard.',
    logout: 'You are being logged out of your account.',
    callback: 'Processing your authentication request...',
    emailOTP: 'Enter the verification code sent to your email address.',
    magicLink: "We'll send you a secure link to sign in without a password.",
    twoFactor: 'Enter your two-factor authentication code to complete sign in.',
    resetPassword: 'Create a new password for your account.',
    forgotPassword: "Enter your email address and we'll send you a reset link.",
    verifyEmail:
      'Click the verification link in your email to complete account setup.',
    acceptInvitation:
      "You've been invited to join an organization. We're processing your invitation.",
    // recoverAccount: "Let's help you regain access to your account.",
  };

  return (
    detailedDescriptionMap[authView] ||
    'Complete the authentication process to continue.'
  );
}

/**
 * Get normalized title from pathname
 */
export function getAuthTitleFromPath(
  authViewRoutes: AuthViewRoutes,
  pathname?: string,
): string {
  if (!pathname) return 'Authentication';

  const authView = getAuthViewByPath(authViewRoutes, pathname);

  if (authView) {
    return getAuthViewTitle(authView);
  }

  return 'Authentication';
}

export function isValidEmail(email: string) {
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export type PasswordValidation = {
  /**
   * Maximum password length
   */
  maxLength?: number;

  /**
   * Minimum password length
   */
  minLength?: number;

  /**
   * Password validation regex
   */
  regex?: RegExp;
};

type PasswordSchemaMessage = {
  passwordRequired?: string;
  passwordTooShort?: string;
  passwordTooLong?: string;
  passwordInvalid?: string;
};

export function getPasswordSchema(
  passwordValidation?: PasswordValidation,
  message?: PasswordSchemaMessage,
) {
  let schema = z.string().min(1, {
    error: message?.passwordRequired || 'Password is required',
  });
  if (passwordValidation?.minLength) {
    schema = schema.min(passwordValidation.minLength, {
      error: message?.passwordTooShort || 'Password is too short',
    });
  }
  if (passwordValidation?.maxLength) {
    schema = schema.max(passwordValidation.maxLength, {
      error: message?.passwordTooLong || 'Password is too long',
    });
  }
  if (passwordValidation?.regex) {
    schema = schema.regex(passwordValidation.regex, {
      error: message?.passwordInvalid || 'Password is invalid',
    });
  }
  return schema;
}
