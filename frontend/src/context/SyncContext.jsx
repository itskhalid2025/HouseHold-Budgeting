import { registerSW } from 'virtual:pwa-register';

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
    const [needRefresh, setNeedRefresh] = useState(false);
    const [updateServiceWorker, setUpdateServiceWorker] = useState(null);

    useEffect(() => {
        console.log('PWA: Initial State - isInstalled:', isInstalled);
        console.log('PWA: Browser Supports beforeinstallprompt:', 'onbeforeinstallprompt' in window);

        // Register Service Worker for updates
        if ('serviceWorker' in navigator) {
            const updateSW = registerSW({
                onNeedRefresh() {
                    console.log('PWA: New content available!');
                    setNeedRefresh(true);
                    setUpdateServiceWorker(() => updateSW);
                },
                onOfflineReady() {
                    console.log('PWA: App is ready for offline use.');
                },
            });
        }
    }, []);

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
            console.log('PWA: beforeinstallprompt event fired! Browser is ready.');
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        // Check if service worker is actually running
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                console.log('PWA: Service Worker is READY and ACTIVE.');
            });
        }

        const handleAppInstalled = () => {
            console.log('PWA: appinstalled event fired');
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
        console.log('PWA: installApp called, deferredPrompt exists:', !!deferredPrompt);
        if (!deferredPrompt) {
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                toast('To install: Tap the "Share" icon (square with arrow) and then "Add to Home Screen".', { icon: '📲' });
            } else {
                toast('To install: Look for the "Install" icon in your browser address bar or menu.', { icon: '📲' });
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

    const updateApp = () => {
        if (updateServiceWorker) {
            updateServiceWorker(true);
        }
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
            installApp,
            needRefresh,
            updateApp
        }}>
            {children}
        </SyncContext.Provider>
    );
};
