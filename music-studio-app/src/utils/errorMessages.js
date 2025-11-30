/**
 * Error Message Helper
 * Maps raw Supabase error messages to user-friendly text
 * while keeping technical details in console logs
 */

/**
 * Converts a Supabase error to a user-friendly message
 * @param {Error|string} error - The error object or message from Supabase
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
    // Extract the error message
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
    const errorCode = error?.error_code || error?.code;

    // Log the full technical error for debugging
    console.error('Technical error details:', { errorMessage, errorCode, error });

    // Map common Supabase errors to user-friendly messages
    const errorLower = errorMessage.toLowerCase();

    // Authentication errors
    if (errorLower.includes('invalid login credentials') ||
        errorLower.includes('invalid email or password')) {
        return 'Invalid email or password. Please check your credentials and try again.';
    }

    if (errorLower.includes('email not confirmed') ||
        errorLower.includes('email confirmation')) {
        return 'Please confirm your email address before signing in.';
    }

    if (errorLower.includes('user not found')) {
        return 'No account found with this email address.';
    }

    if (errorLower.includes('user already registered') ||
        errorLower.includes('email already exists')) {
        return 'An account with this email already exists. Try logging in instead.';
    }

    if (errorLower.includes('password') && errorLower.includes('weak')) {
        return 'Password is too weak. Please use a stronger password with at least 6 characters.';
    }

    if (errorLower.includes('invalid email')) {
        return 'Please enter a valid email address.';
    }

    // Network errors
    if (errorLower.includes('network') ||
        errorLower.includes('fetch failed') ||
        errorLower.includes('failed to fetch')) {
        return 'Network error. Please check your internet connection and try again.';
    }

    if (errorLower.includes('timeout')) {
        return 'Request timed out. Please try again.';
    }

    // Session errors
    if (errorLower.includes('session') && errorLower.includes('expired')) {
        return 'Your session has expired. Please sign in again.';
    }

    if (errorLower.includes('refresh token')) {
        return 'Session refresh failed. Please sign in again.';
    }

    // Rate limiting
    if (errorLower.includes('rate limit') ||
        errorLower.includes('too many requests')) {
        return 'Too many attempts. Please wait a moment and try again.';
    }

    // OAuth errors
    if (errorLower.includes('provider is not enabled') ||
        errorCode === 'validation_failed') {
        return 'This sign-in method is not available. Please use email and password.';
    }

    // Server errors
    if (errorLower.includes('internal server error') ||
        errorLower.includes('500')) {
        return 'Server error. Please try again later.';
    }

    if (errorLower.includes('service unavailable') ||
        errorLower.includes('503')) {
        return 'Service temporarily unavailable. Please try again later.';
    }

    // Database errors
    if (errorLower.includes('database')) {
        return 'Database error. Please try again or contact support.';
    }

    // Initialization errors
    if (errorLower.includes('failed to initialize') ||
        errorLower.includes('not initialized')) {
        return 'Authentication service is not available. Please refresh the page.';
    }

    if (errorLower.includes('supabase')) {
        return 'Authentication service error. Please try again or contact support.';
    }

    // Generic fallback
    if (errorMessage.length > 100) {
        // If error message is too long, provide a generic message
        return 'An error occurred. Please try again or contact support if the problem persists.';
    }

    // If we don't have a specific mapping, return a sanitized version
    // Remove technical jargon but keep some context
    return errorMessage
        .replace(/supabase/gi, 'authentication service')
        .replace(/postgres/gi, 'database')
        .replace(/jwt/gi, 'session token')
        .replace(/\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi, '[ID]') // Remove UUIDs
        || 'An unexpected error occurred. Please try again.';
};

/**
 * Checks if an error is a network-related error
 * @param {Error|string} error - The error to check
 * @returns {boolean} True if it's a network error
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
 * Checks if an error is an authentication error
 * @param {Error|string} error - The error to check
 * @returns {boolean} True if it's an auth error
 */
export const isAuthError = (error) => {
    const errorMessage = typeof error === 'string' ? error : (error?.message || '');
    const errorLower = errorMessage.toLowerCase();

    return errorLower.includes('invalid login') ||
        errorLower.includes('invalid email') ||
        errorLower.includes('invalid password') ||
        errorLower.includes('user not found') ||
        errorLower.includes('credentials');
};
