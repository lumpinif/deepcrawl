export * from './configs';
// Auth configuration
export { createAuthConfig } from './configs/auth.config';
// Static constants exported from constants.ts only
export * from './configs/constants';
export * from './lib';
// Email templates
export {
  EmailVerification,
  type EmailVerificationProps,
  MagicLink,
  type MagicLinkProps,
  OrganizationInvitation,
  type OrganizationInvitationProps,
  PasswordReset,
  type PasswordResetProps,
} from './templates';
// Configuration validation utilities
export {
  assertValidAuthConfiguration,
  validateAuthConfiguration,
} from './utils/config-validator';
// Email utilities
export {
  createResendClient,
  type SendEmailOptions,
  sendEmail,
  validateEmailConfig,
} from './utils/email';
