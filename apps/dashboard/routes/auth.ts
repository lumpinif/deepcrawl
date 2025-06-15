export const authViewRoutes = {
  login: 'login',
  signUp: 'sign-up',
  logout: 'logout',
  callback: 'callback',
  emailOTP: 'email-otp',
  magicLink: 'magic-link',
  twoFactor: 'two-factor',
  resetPassword: 'reset-password',
  forgotPassword: 'forgot-password',
  // recoverAccount: 'recover-account',
};

export type AuthViewRoutes = typeof authViewRoutes;
export type AuthView = keyof AuthViewRoutes;
