import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TourContext = createContext(null);

// LocalStorage keys
const TOUR_STORAGE_KEY = 'householdBudgeting_tourState';

/**
 * TourProvider - Manages the global state for the interactive guided tour system.
 * 
 * Features:
 * - Track which tours have been completed
 * - Manage current tour and step
 * - Provide navigation controls
 * - Persist tour completion state to localStorage
 */
export function TourProvider({ children }) {
    // Tour state
    const [isTourActive, setIsTourActive] = useState(false);
    const [currentTourId, setCurrentTourId] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tourSteps, setTourSteps] = useState([]);
    const [completedTours, setCompletedTours] = useState(() => {
        try {
            const saved = localStorage.getItem(TOUR_STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // Persist completed tours to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(completedTours));
        } catch (err) {
            console.warn('Failed to save tour state:', err);
        }
    }, [completedTours]);

    /**
     * Start a tour with the given ID and steps
     * @param {string} tourId - Unique identifier for the tour
     * @param {Array} steps - Array of step objects with targetSelector, title, description, position
     */
    const startTour = useCallback((tourId, steps) => {
        if (!steps || steps.length === 0) {
            console.warn('Cannot start tour with empty steps');
            return;
        }

        setCurrentTourId(tourId);
        setTourSteps(steps);
        setCurrentStepIndex(0);
        setIsTourActive(true);
    }, []);

    /**
     * Navigate to next step
     */
    const nextStep = useCallback(() => {
        setCurrentStepIndex(prev => {
            if (prev >= tourSteps.length - 1) {
                // Last step - end tour
                endTour();
                return prev;
            }
            return prev + 1;
        });
    }, [tourSteps.length]);

    /**
     * Navigate to previous step
     */
    const prevStep = useCallback(() => {
        setCurrentStepIndex(prev => Math.max(0, prev - 1));
    }, []);

    /**
     * End the current tour and mark as completed
     */
    const endTour = useCallback(() => {
        if (currentTourId) {
            setCompletedTours(prev => ({
                ...prev,
                [currentTourId]: true
            }));
        }
        setIsTourActive(false);
        setCurrentTourId(null);
        setTourSteps([]);
        setCurrentStepIndex(0);
    }, [currentTourId]);

    /**
     * Skip tour without marking as completed permanently
     * User can restart from Settings
     */
    const skipTour = useCallback(() => {
        // Mark as completed so it doesn't auto-trigger again
        if (currentTourId) {
            setCompletedTours(prev => ({
                ...prev,
                [currentTourId]: true
            }));
        }
        setIsTourActive(false);
        setCurrentTourId(null);
        setTourSteps([]);
        setCurrentStepIndex(0);
    }, [currentTourId]);

    /**
     * Check if a specific tour has been completed
     * @param {string} tourId 
     * @returns {boolean}
     */
    const hasCompletedTour = useCallback((tourId) => {
        return !!completedTours[tourId];
    }, [completedTours]);

    /**
     * Check if the initial navigation tour (sidebar/navbar) has been completed
     * @returns {boolean}
     */
    const hasCompletedInitialTour = useCallback(() => {
        return !!completedTours['navigation'];
    }, [completedTours]);

    /**
     * Reset all tour completion states
     * Used when user wants to restart all guides
     */
    const resetAllTours = useCallback(() => {
        setCompletedTours({});
        localStorage.removeItem(TOUR_STORAGE_KEY);
    }, []);

    /**
     * Reset a specific tour
     * @param {string} tourId 
     */
    const resetTour = useCallback((tourId) => {
        setCompletedTours(prev => {
            const updated = { ...prev };
            delete updated[tourId];
            return updated;
        });
    }, []);

    // Current step data
    const currentStep = tourSteps[currentStepIndex] || null;
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === tourSteps.length - 1;
    const totalSteps = tourSteps.length;

    const value = {
        // State
        isTourActive,
        currentTourId,
        currentStep,
        currentStepIndex,
        totalSteps,
        isFirstStep,
        isLastStep,

        // Actions
        startTour,
        nextStep,
        prevStep,
        endTour,
        skipTour,

        // Query
        hasCompletedTour,
        hasCompletedInitialTour,

        // Reset
        resetAllTours,
        resetTour
    };

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
}

/**
 * Hook to access tour context
 */
export function useTour() {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
}

export default TourContext;
