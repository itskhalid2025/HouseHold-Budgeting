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

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('You are back online!');
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.error('Working offline. Changes will be saved locally.');
        };

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsInstallable(false);
            setIsInstalled(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installApp = async () => {
        if (!deferredPrompt) {
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                toast.error('On iOS, tap the share icon and select "Add to Home Screen"');
            } else {
                toast.error('Use Chrome/Edge browser and look for the install icon in the address bar.');
            }
            return false;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
            return true;
        }
        return false;
    };

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
        <SyncContext.Provider value={{
            isOnline,
            syncQueue,
            queueRequest,
            removeFromQueue,
            clearQueue,
            isInstallable,
            isInstalled,
            installApp
        }}>
            {children}
        </SyncContext.Provider>
    );
};
