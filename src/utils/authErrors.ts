export class AuthenticationRequiredError extends Error {
  constructor(message = 'Authentication required. Please log in.') {
    super(message);
    this.name = 'AuthenticationRequiredError';
  }
}

export const isAuthenticationRequiredError = (error: unknown): boolean =>
  error instanceof AuthenticationRequiredError ||
  (error instanceof Error && error.name === 'AuthenticationRequiredError');
