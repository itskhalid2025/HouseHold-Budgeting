import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import * as api from '../api/api';

const SyncContext = createContext();

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
};

export const SyncProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [syncQueue, setSyncQueue] = useState(() => {
        const saved = localStorage.getItem('budget_sync_queue');
        return saved ? JSON.parse(saved) : [];
    });

    // Monitor Online Status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('You are back online! Syncing changes...', { icon: '🌐' });
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.error('You are offline. Changes will be saved locally.', { icon: '📴' });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Monitor PWA Install Prompt
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsInstallable(true);
            console.log('PWA Install Prompt ready');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstallable(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const removeFromQueue = useCallback((id) => {
        setSyncQueue(prev => prev.filter(req => req.id !== id));
    }, []);

    const processSyncQueue = useCallback(async () => {
        if (!isOnline || syncQueue.length === 0) return;

        console.log(`🔄 Processing sync queue: ${syncQueue.length} items`);

        // Clone queue to avoid mutation issues during loop
        const queueToProcess = [...syncQueue];

        for (const request of queueToProcess) {
            try {
                // Determine which API function to call based on type or endpoint
                let result;

                // For simplicity, we can use trackedFetch directly or map types to functions
                // Here we'll use base trackedFetch logic or map
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                };

                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${request.endpoint}`, {
                    method: request.method,
                    headers,
                    body: JSON.stringify(request.data)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Synced: ${request.type}`, data);

                    // Dispatch event for components to update their optimistic state
                    window.dispatchEvent(new CustomEvent('sync-success', {
                        detail: {
                            tempId: request.tempId,
                            realData: data.transaction || data.income || data.goal || data
                        }
                    }));

                    removeFromQueue(request.id);
                } else {
                    console.error(`❌ Sync failed for ${request.type}:`, response.status);
                    // If it's a 4xx error, it might be invalid data, should we remove it?
                    // For now, let's keep it in queue if it's a 5xx, or remove if 4xx
                    if (response.status >= 400 && response.status < 500) {
                        window.dispatchEvent(new CustomEvent('sync-failure', { detail: { tempId: request.tempId } }));
                        removeFromQueue(request.id);
                    }
                }
            } catch (err) {
                console.error('❌ Sync error:', err);
                break; // Stop processing if we hit a network error
            }
        }
    }, [isOnline, syncQueue, removeFromQueue]);

    // Persistent Queue
    useEffect(() => {
        localStorage.setItem('budget_sync_queue', JSON.stringify(syncQueue));

        // If we just went online and have items, start syncing
        if (isOnline && syncQueue.length > 0) {
            processSyncQueue();
        }
    }, [syncQueue, isOnline, processSyncQueue]);

    const queueRequest = useCallback((request) => {
        // request format: { id: Date.now(), type: 'ADD_TRANSACTION', data: {}, endpoint: '/api/transactions', method: 'POST' }
        const newRequest = {
            id: Date.now(),
            ...request,
            timestamp: new Date().toISOString()
        };
        setSyncQueue(prev => [...prev, newRequest]);
    }, []);

    const clearQueue = useCallback(() => {
        setSyncQueue([]);
    }, []);

    const installApp = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    const value = {
        isOnline,
        isInstallable,
        installApp,
        syncQueue,
        queueRequest,
        removeFromQueue,
        clearQueue
    };

    return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};
