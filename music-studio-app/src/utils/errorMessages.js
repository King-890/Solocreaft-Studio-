/**
 * Error Message Helper
 * Maps raw error messages to user-friendly text
 */

/**
 * Converts an error to a user-friendly message
 * @param {Error|string} error - The error object or message
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
    const errorCode = error?.error_code || error?.code;

    console.error('Technical error details:', { errorMessage, errorCode, error });

    const errorLower = errorMessage.toLowerCase();

    // Network errors
    if (errorLower.includes('network') ||
        errorLower.includes('fetch failed') ||
        errorLower.includes('failed to fetch')) {
        return 'Network error. Please check your internet connection.';
    }

    if (errorLower.includes('timeout')) {
        return 'Request timed out. Please try again.';
    }

    // Generic fallback
    if (errorMessage.length > 100) {
        return 'An error occurred. Please try again or contact support.';
    }

    return errorMessage || 'An unexpected error occurred. Please try again.';
};

/**
 * Checks if an error is a network-related error
 */
export const isNetworkError = (error) => {
    const errorMessage = typeof error === 'string' ? error : (error?.message || '');
    const errorLower = errorMessage.toLowerCase();

    return errorLower.includes('network') ||
        errorLower.includes('fetch failed') ||
        errorLower.includes('failed to fetch') ||
        errorLower.includes('timeout');
};

/**
 * Checks if an error is an authentication error (Obsolete but kept for compatibility)
 */
export const isAuthError = () => false;
