import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SyncContext = createContext();

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncQueue, setSyncQueue] = useState(() => {
        const saved = localStorage.getItem('syncQueue');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('You are back online!');
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.error('Working offline. Changes will be saved locally.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
    }, [syncQueue]);

    const queueRequest = (request) => {
        // request: { id, type: 'ADD_TRANSACTION', data, timestamp }
        setSyncQueue((prev) => [...prev, { ...request, id: Date.now() }]);
    };

    const removeFromQueue = (requestId) => {
        setSyncQueue((prev) => prev.filter((req) => req.id !== requestId));
    };

    const clearQueue = () => {
        setSyncQueue([]);
    };

    return (
        <SyncContext.Provider value={{ isOnline, syncQueue, queueRequest, removeFromQueue, clearQueue }}>
            {children}
        </SyncContext.Provider>
    );
};
