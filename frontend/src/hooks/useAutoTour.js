import { useEffect } from 'react';
import { useTour } from '../context/TourContext';

/**
 * Custom hook to auto-trigger tours for first-time users
 * @param {string} tourId - Unique identifier for the tour
 * @param {Array} tourSteps - Array of tour step configurations
 * @param {boolean} loading - Whether the page is still loading
 * @param {number} delay - Delay in ms before triggering tour (default: 1000)
 */
export function useAutoTour(tourId, tourSteps, loading = false, delay = 1000) {
    const { startTour, hasCompletedTour, isTourActive } = useTour();

    useEffect(() => {
        // Don't trigger if:
        // 1. Page is still loading
        // 2. A tour is already active
        // 3. This tour has been completed before
        if (loading || isTourActive || hasCompletedTour(tourId)) {
            return;
        }

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            startTour(tourId, tourSteps);
        }, delay);

        return () => clearTimeout(timer);
    }, [loading, isTourActive, hasCompletedTour, tourId, tourSteps, startTour, delay]);
}

export default useAutoTour;
