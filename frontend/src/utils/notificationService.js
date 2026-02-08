/**
 * @fileoverview Notification Service
 * 
 * Handles native PWA notifications, permission requests, and 
 * triggering system-level alerts for critical insights.
 */

/**
 * Requests browser notification permission if not already granted
 */
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

/**
 * Shows a native notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options (body, icon, etc)
 */
export const showNativeNotification = (title, options = {}) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return null;
    }

    const defaultOptions = {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        ...options
    };

    try {
        // Use service worker notification if available (better for PWA)
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, defaultOptions);
            });
            return true;
        } else {
            // Fallback to standard notification
            return new Notification(title, defaultOptions);
        }
    } catch (err) {
        console.error("Failed to show notification:", err);
        return null;
    }
};

/**
 * Specifically triggers an alert for a smart insight
 * @param {Object} insight - The insight object from the backend
 */
export const notifySmartInsight = (insight) => {
    if (!insight || !insight.insights) return;

    // Only notify for critical themes (danger or warning)
    const criticalInsight = insight.insights.find(i =>
        i.theme === 'danger' || i.theme === 'warning'
    );

    if (criticalInsight) {
        showNativeNotification("GrowWise: Critical Insight", {
            body: criticalInsight.message,
            tag: 'smart-insight-alert', // Prevents flooding
            renotify: true
        });
    }
};
