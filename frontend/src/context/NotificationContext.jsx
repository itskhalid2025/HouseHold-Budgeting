import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getJoinRequests } from '../api/api';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const [joinRequests, setJoinRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!isAuthenticated || !user || !user.householdId) return;

        try {
            // Only fetch if user might have permissions (optional optimization)
            // But assume all users might see this for now or standard auth checks handle it
            const data = await getJoinRequests();
            if (data && data.requests) {
                setJoinRequests(data.requests);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    // Poll every 30 seconds
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        } else {
            setJoinRequests([]);
        }
    }, [isAuthenticated, user]);

    const value = {
        joinRequests, // The array of pending requests
        requestCount: joinRequests.length,
        refreshNotifications: fetchNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}
