/**
 * @fileoverview usePolling Hook
 *
 * Provides a reusable polling mechanism for fetching data at regular intervals.
 * Supports manual refetch and can be paused via the `enabled` flag.
 *
 * @module hooks/usePolling
 * @requires react
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * usePolling - Custom hook for polling data at regular intervals
 * 
 * @param {Function} fetchFn - The async function to call for fetching data
 * @param {number} interval - Polling interval in milliseconds (default: 30000)
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 * @param {Array} deps - Dependencies array that will trigger a refetch when changed
 * 
 * @returns {Object} - { refetch: Function to manually trigger a fetch }
 */
export function usePolling(fetchFn, interval = 30000, enabled = true, deps = []) {
    const savedFetchFn = useRef(fetchFn);
    const intervalRef = useRef(null);

    // Update ref when fetchFn changes
    useEffect(() => {
        savedFetchFn.current = fetchFn;
    }, [fetchFn]);

    // Manual refetch function
    const refetch = useCallback(() => {
        savedFetchFn.current({ isManual: true });
    }, []);

    // Set up polling
    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Initial fetch
        savedFetchFn.current({ isInitial: true });

        // Set up interval
        intervalRef.current = setInterval(() => {
            savedFetchFn.current({ isPoll: true });
        }, interval);

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [interval, enabled, ...deps]);

    return { refetch };
}

/**
 * useVisibilityPolling - Polling that pauses when tab is not visible
 * 
 * @param {Function} fetchFn - The async function to call for fetching data
 * @param {number} interval - Polling interval in milliseconds
 */
export function useVisibilityPolling(fetchFn, interval = 30000) {
    const { refetch } = usePolling(fetchFn, interval, true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Refetch when tab becomes visible again
                refetch();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [refetch]);

    return { refetch };
}

export default usePolling;
