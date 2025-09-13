export const authViewSegments = {
  login: 'login',
  signUp: 'sign-up',
  logout: 'logout',
  callback: 'callback',
  emailOTP: 'email-otp',
  magicLink: 'magic-link',
  twoFactor: 'two-factor',
  resetPassword: 'reset-password',
  forgotPassword: 'forgot-password',
  verifyEmail: 'verify-email',
  acceptInvitation: 'accept-invitation',
  // recoverAccount: 'recover-account',
};

export type AuthViewSegments = typeof authViewSegments;
export type AuthView = keyof AuthViewSegments;
