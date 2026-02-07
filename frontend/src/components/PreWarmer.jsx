import { useEffect } from 'react';

/**
 * PreWarmer Component
 * 
 * Pings the backend health check endpoint immediately when the app loads.
 * This helps wake up Render.com free tier services (which have a 30s cold start)
 * while the user is still on the login page or splash screen.
 */
export default function PreWarmer() {
    useEffect(() => {
        // Only ping if we are online
        if (navigator.onLine) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

            console.log('🔥 Pre-warming backend...');
            fetch(`${API_URL}/health`)
                .then(res => {
                    if (res.ok) console.log('✅ Backend is awake');
                })
                .catch(() => {
                    // Silently fail, it's just a pre-warm
                });
        }
    }, []);

    return null; // This component doesn't render anything
}
