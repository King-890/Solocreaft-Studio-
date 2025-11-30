import { Platform } from 'react-native';

class ErrorMonitor {
    constructor() {
        this.errors = [];
        this.listeners = [];
        this.maxErrors = 50; // Keep last 50 errors
    }

    report(error, context = {}) {
        const errorInfo = {
            id: Date.now() + Math.random(), // Ensure uniqueness
            timestamp: new Date().toISOString(),
            message: error?.message || String(error),
            stack: error?.stack,
            context,
            platform: Platform.OS
        };

        this.errors.unshift(errorInfo); // Add to beginning
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }

        console.error('🚨 ERROR REPORTED:', {
            message: errorInfo.message,
            context: errorInfo.context,
            timestamp: errorInfo.timestamp
        });

        // Notify all listeners
        this.listeners.forEach(listener => {
            try {
                listener(errorInfo);
            } catch (err) {
                console.error('Error in error listener:', err);
            }
        });

        return errorInfo;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    getErrors() {
        return [...this.errors];
    }

    getRecentErrors(count = 5) {
        return this.errors.slice(0, count);
    }

    clearErrors() {
        this.errors = [];
        console.log('✅ Error monitor cleared');
    }

    getErrorsByContext(contextKey) {
        return this.errors.filter(err => err.context[contextKey]);
    }
}

export const errorMonitor = new ErrorMonitor();

// Global error handler setup
export const setupGlobalErrorHandler = () => {
    if (typeof ErrorUtils !== 'undefined') {
        const originalHandler = ErrorUtils.getGlobalHandler();

        ErrorUtils.setGlobalHandler((error, isFatal) => {
            errorMonitor.report(error, {
                isFatal,
                global: true,
                type: 'GLOBAL_ERROR'
            });

            // Call original handler
            if (originalHandler) {
                originalHandler(error, isFatal);
            }
        });

        console.log('✅ Global error handler installed');
    }
};
