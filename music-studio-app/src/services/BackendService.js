import { Platform } from 'react-native';

/**
 * BackendService - Bridge between the Expo App and the Cloudflare Workers Backend.
 */
class BackendService {
    constructor() {
        // Use the professional workers.dev domain for the production backend
        this.baseUrl = 'https://solocreaft-studio.ujstudio.workers.dev';
    }

    /**
     * Helper to perform fetch requests with consistent error handling
     */
    async _request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorBody}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`🚨 BackendService Error [${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * Logs an event to the Cloudflare Analytics Engine
     */
    async logEvent(eventName, eventData = {}) {
        try {
            // Non-blocking call for analytics
            fetch(`${this.baseUrl}/api/analytics/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventName,
                    os: Platform.OS,
                    ...eventData,
                    timestamp: new Date().toISOString(),
                })
            }).catch(e => console.warn('Analytics log failed:', e));
        } catch (e) {
            // Silently fail for analytics to not disturb user flow
        }
    }

    /**
     * Ask the Workers AI (Llama-3.1) for assistance or analysis
     */
    async askAI(prompt) {
        return this._request('/api/ai/ask', {
            method: 'POST',
            body: JSON.stringify({ prompt })
        });
    }

    /**
     * Fetch project history from the D1 database
     */
    async getHistory() {
        return this._request('/api/db/history');
    }

    /**
     * Trigger a background audio workflow
     */
    async startAudioWorkflow(projectId, audioUrl) {
        return this._request('/api/workflow/start', {
            method: 'POST',
            body: JSON.stringify({ projectId, audioUrl })
        });
    }
}

export default new BackendService();
