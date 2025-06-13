import type { authClient } from './auth.client';

type ErrorTypes = Partial<
  Record<
    keyof typeof authClient.$ERROR_CODES,
    {
      en: string;
      es: string;
    }
  >
>;

const BASE_ERROR_CODES = {
  USER_ALREADY_EXISTS: {
    en: 'user already registered',
    es: 'usuario ya registrada',
  },
  USER_NOT_FOUND: {
    en: 'User not found',
    es: 'Usuario no encontrado',
  },
  FAILED_TO_CREATE_USER: {
    en: 'Failed to create user',
    es: 'No se pudo crear el usuario',
  },
  FAILED_TO_CREATE_SESSION: {
    en: 'Failed to create session',
    es: 'No se pudo crear la sesión',
  },
  FAILED_TO_UPDATE_USER: {
    en: 'Failed to update user',
    es: 'No se pudo actualizar el usuario',
  },
  FAILED_TO_GET_SESSION: {
    en: 'Failed to get session',
    es: 'No se pudo obtener la sesión',
  },
  INVALID_PASSWORD: {
    en: 'Invalid password',
    es: 'Contraseña inválida',
  },
  INVALID_EMAIL: {
    en: 'Invalid email',
    es: 'Correo electrónico inválido',
  },
  INVALID_EMAIL_OR_PASSWORD: {
    en: 'Invalid email or password',
    es: 'Correo electrónico o contraseña inválidos',
  },
  SOCIAL_ACCOUNT_ALREADY_LINKED: {
    en: 'Social account already linked',
    es: 'La cuenta social ya está vinculada',
  },
  PROVIDER_NOT_FOUND: {
    en: 'Provider not found',
    es: 'Proveedor no encontrado',
  },
  INVALID_TOKEN: {
    en: 'invalid token',
    es: 'token inválido',
  },
  ID_TOKEN_NOT_SUPPORTED: {
    en: 'id_token not supported',
    es: 'id_token no soportado',
  },
  FAILED_TO_GET_USER_INFO: {
    en: 'Failed to get user info',
    es: 'No se pudo obtener la información del usuario',
  },
  USER_EMAIL_NOT_FOUND: {
    en: 'User email not found',
    es: 'Correo electrónico de usuario no encontrado',
  },
  EMAIL_NOT_VERIFIED: {
    en: 'Email not verified',
    es: 'Correo electrónico no verificado',
  },
  PASSWORD_TOO_SHORT: {
    en: 'Password too short',
    es: 'La contraseña es demasiado corta',
  },
  PASSWORD_TOO_LONG: {
    en: 'Password too long',
    es: 'La contraseña es demasiado larga',
  },
  EMAIL_CAN_NOT_BE_UPDATED: {
    en: 'Email can not be updated',
    es: 'El correo electrónico no puede ser actualizado',
  },
  CREDENTIAL_ACCOUNT_NOT_FOUND: {
    en: 'Credential account not found',
    es: 'Cuenta de credenciales no encontrada',
  },
  SESSION_EXPIRED: {
    en: 'Session expired. Re-authenticate to perform this action.',
    es: 'Sesión expirada. Vuelve a autenticarte para realizar esta acción.',
  },
  FAILED_TO_UNLINK_LAST_ACCOUNT: {
    en: "You can't unlink your last account",
    es: 'No puedes desvincular tu última cuenta',
  },
  ACCOUNT_NOT_FOUND: {
    en: 'Account not found',
    es: 'Cuenta no encontrada',
  },
} satisfies ErrorTypes;

export const getErrorMessageFromCode = (code: string, lang: 'en' | 'es') => {
  if (code in BASE_ERROR_CODES) {
    return BASE_ERROR_CODES[code as keyof typeof BASE_ERROR_CODES][lang];
  }
  return 'An unexpected error occurred. Please try again.';
};

export const getAuthErrorMessage = (error: {
  code?: string | undefined;
  message?: string | undefined;
  status: number;
  statusText: string;
}) => {
  const errorMessage =
    error?.message ||
    (error?.code && getErrorMessageFromCode(error.code, 'en')) ||
    error?.statusText ||
    'An unknown error occurred';

  return errorMessage;
};

/**
 * Check if an error is a WebAuthn user cancellation/timeout error
 * These errors should be handled silently as they represent intentional user actions
 */
export function isWebAuthnCancellationError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  return (
    lowerMessage.includes('timed out') ||
    lowerMessage.includes('not allowed') ||
    lowerMessage.includes('cancelled') ||
    lowerMessage.includes('aborted') ||
    lowerMessage.includes('user cancelled') ||
    errorMessage.includes(
      'https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client',
    )
  );
}
