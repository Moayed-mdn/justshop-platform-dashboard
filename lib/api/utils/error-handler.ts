import type { ApiError } from '../types';

export class ApiException extends Error {
  public code: string;
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, code: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

export function mapErrorToMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    // Authentication
    AUTH_INVALID_CREDENTIALS: 'auth.invalidCredentials',
    AUTH_SESSION_EXPIRED: 'auth.sessionExpired',
    AUTH_UNAUTHORIZED: 'errors.unauthorized',
    AUTH_FORBIDDEN: 'errors.forbidden',

    // Users
    USER_NOT_FOUND: 'errors.userNotFound',
    USER_ALREADY_SUSPENDED: 'errors.userAlreadySuspended',
    USER_CANNOT_SUSPEND_SELF: 'errors.cannotSuspendSelf',

    // Stores
    STORE_NOT_FOUND: 'errors.storeNotFound',
    STORE_ALREADY_SUSPENDED: 'errors.storeAlreadySuspended',

    // Generic
    INTERNAL_SERVER_ERROR: 'errors.serverError',
    VALIDATION_ERROR: 'errors.validationError',
    UNAUTHORIZED: 'errors.unauthorized',
    FORBIDDEN: 'errors.forbidden',
    NOT_FOUND: 'errors.notFound',
  };

  return errorMessages[errorCode] || 'common.error';
}

export async function handleApiError(response: Response): Promise<never> {
  let errorData: ApiError;

  try {
    errorData = await response.json();
  } catch {
    throw new ApiException(
      'An error occurred while processing your request',
      'UNKNOWN_ERROR',
      response.status
    );
  }

  throw new ApiException(
    errorData.message || 'An error occurred',
    errorData.code || 'UNKNOWN_ERROR',
    response.status,
    errorData.errors
  );
}
