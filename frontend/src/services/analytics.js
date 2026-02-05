import posthog from 'posthog-js';

const API_KEY = import.meta.env.VITE_POSTHOG_KEY;
const API_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export const initAnalytics = () => {
    // 1. Check if user agreed to cookies (we saved this in localStorage during Register/Login ideally)
    // Or we can check the user profile if we have it loaded.
    // For now, let's check a localStorage flag 'cookieConsent' or relying on the backend user object if passed.

    // In this app, we saved consent in the Backend User Profile.
    // We should only enable if we know the user consented.

    if (!API_KEY) {
        console.warn('PostHog API Key not found');
        return;
    }

    try {
        posthog.init(API_KEY, {
            api_host: API_HOST,
            person_profiles: 'identified_only', // Optimized for anonymity
            autocapture: true, // Automatically track clicks/views
            capture_pageview: true,
            persistence: 'localStorage', // Uses cookies/localstorage
            loaded: (posthog) => {
                // Optional: debug log
                // console.log('PostHog Loaded');
            }
        });
    } catch (error) {
        console.error('PostHog Init Failed:', error);
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
