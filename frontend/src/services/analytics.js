import posthog from 'posthog-js';

// Expose for debugging
window.posthog = posthog;

const API_KEY = import.meta.env.VITE_POSTHOG_KEY;
const API_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export const initAnalytics = () => {
    // Check local storage for preferences
    let analyticsEnabled = true; // Default to true or false based on policy
    try {
        const prefs = localStorage.getItem('cookiePreferences');
        if (prefs) {
            const parsed = JSON.parse(prefs);
            analyticsEnabled = !!parsed.analytics;
        }
    } catch (e) {
        console.warn('Failed to parse cookie preferences', e);
    }

    if (!API_KEY) {
        console.warn('PostHog API Key not found');
        return;
    }

    try {
        posthog.init(API_KEY, {
            api_host: API_HOST,
            person_profiles: 'identified_only',
            autocapture: analyticsEnabled, // Only capture if enabled
            capture_pageview: analyticsEnabled,
            persistence: 'localStorage',
            opt_out_capturing_by_default: !analyticsEnabled, // Opt out if not enabled
            loaded: (posthog) => {
                // Confirm state on load
                if (analyticsEnabled) {
                    posthog.opt_in_capturing();
                } else {
                    posthog.opt_out_capturing();
                }
            }
        });
    } catch (error) {
        console.error('PostHog Init Failed:', error);
    }
};

export const updateConsent = (analyticsEnabled) => {
    if (posthog.__loaded) {
        if (analyticsEnabled) {
            posthog.opt_in_capturing();
        } else {
            posthog.opt_out_capturing();
        }
    }
};

export const identifyUser = (userId, email, name) => {
    if (posthog.__loaded) {
        posthog.identify(userId, {
            email: email,
            name: name
        });
    }
};

export const resetAnalytics = () => {
    if (posthog.__loaded) {
        posthog.reset();
    }
};
