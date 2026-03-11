export class UserAbortError extends Error {
  constructor(message = 'Aborted by user.') {
    super(message);
    this.name = 'UserAbortError';
  }
}

export function createUserAbortError(message?: string): UserAbortError {
  return new UserAbortError(message);
}

export function isUserAbortError(error: unknown): error is UserAbortError {
  return error instanceof UserAbortError;
}
