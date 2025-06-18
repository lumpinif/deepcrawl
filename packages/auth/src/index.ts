export * from './configs';
export * from './lib';

// Auth configuration
export { createAuthConfig } from './configs/auth.config';

// Configuration validation utilities
export {
  validateAuthConfiguration,
  assertValidAuthConfiguration,
} from './utils/config-validator';

// Email utilities
export {
  createResendClient,
  sendEmail,
  validateEmailConfig,
  type SendEmailOptions,
} from './utils/email';

// Email templates
export {
  EmailVerification,
  PasswordReset,
  OrganizationInvitation,
  type EmailVerificationProps,
  type PasswordResetProps,
  type OrganizationInvitationProps,
} from './templates';
