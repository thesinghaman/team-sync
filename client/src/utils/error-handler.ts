/**
 * Error handling utilities for user-friendly error messages
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
}

/**
 * Generic error type that covers most error scenarios
 */
export type GenericError =
  | Error
  | { message?: string; code?: string; errorCode?: string; status?: number }
  | {
      response?: {
        data?: {
          message?: string;
          errorCode?: string;
          code?: string;
          status?: number;
        };
        status?: number;
        statusText?: string;
      };
    }
  | string
  | null
  | undefined;

/**
 * Maps common error codes and messages to user-friendly alternatives
 */
const ERROR_MESSAGES: Record<string, UserFriendlyError> = {
  // Network errors
  "Network Error": {
    title: "Connection Problem",
    message: "Please check your internet connection and try again.",
    action: "Retry",
  },
  ERR_NETWORK: {
    title: "Connection Problem",
    message: "Please check your internet connection and try again.",
    action: "Retry",
  },
  ERR_INTERNET_DISCONNECTED: {
    title: "No Internet Connection",
    message: "Please check your internet connection and try again.",
    action: "Retry",
  },

  // Authentication errors
  USER_NOT_FOUND: {
    title: "Account Not Found",
    message: "No account found with this email address.",
    action: "Sign Up",
  },
  INVALID_CREDENTIALS: {
    title: "Invalid Credentials",
    message: "The email or password you entered is incorrect.",
    action: "Try Again",
  },
  EMAIL_NOT_VERIFIED: {
    title: "Email Not Verified",
    message: "Please verify your email address before signing in.",
    action: "Resend Verification",
  },
  USER_ALREADY_EXISTS: {
    title: "Account Already Exists",
    message:
      "An account with this email already exists. Please sign in instead.",
    action: "Sign In",
  },
  UNAUTHORIZED: {
    title: "Access Denied",
    message: "You don't have permission to perform this action.",
    action: "Contact Admin",
  },
  TOKEN_EXPIRED: {
    title: "Session Expired",
    message: "Your session has expired. Please sign in again.",
    action: "Sign In",
  },

  // Workspace errors
  WORKSPACE_NOT_FOUND: {
    title: "Workspace Not Found",
    message:
      "The workspace you're looking for doesn't exist or has been deleted.",
    action: "Go Home",
  },
  NOT_WORKSPACE_MEMBER: {
    title: "Access Denied",
    message: "You're not a member of this workspace.",
    action: "Request Access",
  },
  WORKSPACE_LIMIT_EXCEEDED: {
    title: "Workspace Limit Reached",
    message: "You've reached the maximum number of workspaces allowed.",
    action: "Upgrade Plan",
  },

  // Task/Project errors
  TASK_NOT_FOUND: {
    title: "Task Not Found",
    message: "The task you're looking for doesn't exist or has been deleted.",
    action: "Go Back",
  },
  PROJECT_NOT_FOUND: {
    title: "Project Not Found",
    message:
      "The project you're looking for doesn't exist or has been deleted.",
    action: "Go Back",
  },
  INSUFFICIENT_PERMISSIONS: {
    title: "Permission Denied",
    message: "You don't have the necessary permissions to perform this action.",
    action: "Contact Admin",
  },

  // File/Upload errors
  FILE_TOO_LARGE: {
    title: "File Too Large",
    message:
      "The file you're trying to upload is too large. Please choose a smaller file.",
    action: "Try Again",
  },
  INVALID_FILE_TYPE: {
    title: "Invalid File Type",
    message: "This file type is not supported. Please choose a different file.",
    action: "Try Again",
  },
  UPLOAD_FAILED: {
    title: "Upload Failed",
    message: "Failed to upload the file. Please try again.",
    action: "Retry",
  },

  // Validation errors
  VALIDATION_ERROR: {
    title: "Invalid Input",
    message: "Please check your input and try again.",
    action: "Fix Errors",
  },
  EMAIL_INVALID: {
    title: "Invalid Email",
    message: "Please enter a valid email address.",
    action: "Correct Email",
  },
  PASSWORD_TOO_WEAK: {
    title: "Weak Password",
    message:
      "Password must be at least 8 characters with numbers and special characters.",
    action: "Choose Stronger Password",
  },

  // Server errors
  INTERNAL_SERVER_ERROR: {
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
    action: "Try Again Later",
  },
  SERVICE_UNAVAILABLE: {
    title: "Service Unavailable",
    message: "The service is temporarily unavailable. Please try again later.",
    action: "Try Again Later",
  },
  RATE_LIMIT_EXCEEDED: {
    title: "Too Many Requests",
    message:
      "You've made too many requests. Please wait a moment and try again.",
    action: "Wait and Retry",
  },
};

/**
 * HTTP status code to user-friendly error mapping
 */
const HTTP_STATUS_MESSAGES: Record<number, UserFriendlyError> = {
  400: {
    title: "Invalid Request",
    message:
      "There was an error with your request. Please check your input and try again.",
    action: "Try Again",
  },
  401: {
    title: "Authentication Required",
    message: "Please sign in to continue.",
    action: "Sign In",
  },
  403: {
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
    action: "Contact Admin",
  },
  404: {
    title: "Not Found",
    message: "The page or resource you're looking for doesn't exist.",
    action: "Go Home",
  },
  409: {
    title: "Conflict",
    message:
      "This action conflicts with existing data. Please refresh and try again.",
    action: "Refresh Page",
  },
  429: {
    title: "Too Many Requests",
    message:
      "You've made too many requests. Please wait a moment and try again.",
    action: "Wait and Retry",
  },
  500: {
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
    action: "Try Again Later",
  },
  502: {
    title: "Bad Gateway",
    message: "The server is temporarily unavailable. Please try again later.",
    action: "Try Again Later",
  },
  503: {
    title: "Service Unavailable",
    message: "The service is temporarily unavailable. Please try again later.",
    action: "Try Again Later",
  },
};

/**
 * Default fallback error message
 */
const DEFAULT_ERROR: UserFriendlyError = {
  title: "Something Went Wrong",
  message: "An unexpected error occurred. Please try again later.",
  action: "Try Again",
};

/**
 * Extracts error code from various error formats
 */
function extractErrorCode(error: GenericError): string | null {
  if (!error || typeof error === "string") return null;

  const e = error as Record<string, unknown>;
  const response = e.response as Record<string, unknown>;
  const data = response?.data as Record<string, unknown>;

  return (
    (e.errorCode as string) ||
    (e.code as string) ||
    (data?.errorCode as string) ||
    (data?.code as string) ||
    null
  );
}

/**
 * Extracts HTTP status code from error
 */
function extractStatusCode(error: GenericError): number | null {
  if (!error || typeof error === "string") return null;

  const e = error as Record<string, unknown>;
  const response = e.response as Record<string, unknown>;
  const data = response?.data as Record<string, unknown>;

  return (
    (e.status as number) ||
    (response?.status as number) ||
    (data?.status as number) ||
    null
  );
}

/**
 * Extracts raw error message from various error formats
 */
function extractRawMessage(error: GenericError): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;

  const e = error as Record<string, unknown>;
  const response = e.response as Record<string, unknown>;
  const data = response?.data as Record<string, unknown>;

  // Prioritize backend message over generic axios message
  return (
    (data?.message as string) ||
    (response?.statusText as string) ||
    (e.message as string) ||
    null
  );
}

/**
 * Checks if error message contains sensitive information that shouldn't be shown to users
 */
function isSensitiveError(message: string): boolean {
  const sensitivePatterns = [
    /stack trace/i,
    /internal error/i,
    /database/i,
    /sql/i,
    /mongodb/i,
    /prisma/i,
    /jwt/i,
    /token/i,
    /secret/i,
    /key/i,
    /password/i,
    /hash/i,
    /encryption/i,
    /connection string/i,
    /env/i,
    /config/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(message));
}

/**
 * Converts any error to a user-friendly format
 * @param error - The error object (can be Error, AxiosError, or any object)
 * @returns UserFriendlyError object with title, message, and optional action
 */
export function handleError(error: GenericError): UserFriendlyError {
  // Handle null/undefined errors
  if (!error) {
    return DEFAULT_ERROR;
  }

  // Extract error information
  const errorCode = extractErrorCode(error);
  const statusCode = extractStatusCode(error);
  const rawMessage = extractRawMessage(error);

  // Try to match by error code first
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  // Try to match by message content BEFORE status code (more specific)
  if (rawMessage) {
    // Check for network errors
    if (
      rawMessage.toLowerCase().includes("network") ||
      rawMessage.toLowerCase().includes("fetch")
    ) {
      return ERROR_MESSAGES["Network Error"];
    }

    // Check for authentication errors - be more specific about login failures
    if (
      rawMessage.toLowerCase().includes("invalid email or password") ||
      rawMessage.toLowerCase().includes("invalid credentials") ||
      rawMessage.toLowerCase().includes("wrong password") ||
      rawMessage.toLowerCase().includes("incorrect password") ||
      rawMessage.toLowerCase().includes("incorrect email or password")
    ) {
      return ERROR_MESSAGES["INVALID_CREDENTIALS"];
    }

    if (
      rawMessage.toLowerCase().includes("unauthorized") ||
      rawMessage.toLowerCase().includes("authentication required")
    ) {
      return ERROR_MESSAGES["UNAUTHORIZED"];
    }

    // Check for permission errors
    if (
      rawMessage.toLowerCase().includes("permission") ||
      rawMessage.toLowerCase().includes("forbidden")
    ) {
      return ERROR_MESSAGES["INSUFFICIENT_PERMISSIONS"];
    }

    // Check for validation errors
    if (
      rawMessage.toLowerCase().includes("validation") ||
      rawMessage.toLowerCase().includes("invalid")
    ) {
      return ERROR_MESSAGES["VALIDATION_ERROR"];
    }
  }

  // Try to match by HTTP status code (as fallback)
  if (statusCode && HTTP_STATUS_MESSAGES[statusCode]) {
    return HTTP_STATUS_MESSAGES[statusCode];
  }

  // Final fallback - check if raw message is safe to show
  if (rawMessage) {
    // Check if the raw message is safe to show
    if (!isSensitiveError(rawMessage)) {
      // If it's a short, user-friendly message, use it
      if (rawMessage.length < 100 && !rawMessage.includes("Error:")) {
        return {
          title: "Error",
          message: rawMessage,
          action: "Try Again",
        };
      }
    }
  }

  // Fallback to default error
  return DEFAULT_ERROR;
}

/**
 * Handles errors specifically for toast notifications
 * @param error - The error object
 * @returns Object with title and description for toast
 */
export function handleErrorForToast(error: GenericError): {
  title: string;
  description: string;
} {
  const userError = handleError(error);
  return {
    title: userError.title,
    description: userError.message,
  };
}

/**
 * Gets a user-friendly error message as a simple string
 * @param error - The error object
 * @returns User-friendly error message string
 */
export function getErrorMessage(error: GenericError): string {
  const userError = handleError(error);
  return userError.message;
}

/**
 * Checks if an error requires user action (like re-authentication)
 * @param error - The error object
 * @returns True if error requires special handling
 */
export function requiresUserAction(error: GenericError): boolean {
  const errorCode = extractErrorCode(error);
  const statusCode = extractStatusCode(error);
  const rawMessage = extractRawMessage(error)?.toLowerCase() || "";

  // Only require user action for specific cases, not general auth failures
  return (
    errorCode === "TOKEN_EXPIRED" ||
    errorCode === "EMAIL_NOT_VERIFIED" ||
    rawMessage.includes("verify your email") ||
    rawMessage.includes("email not verified") ||
    statusCode === 403 // Forbidden, but not unauthorized login attempts
  );
}
