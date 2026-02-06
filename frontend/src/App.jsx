import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon, HelpCircle, UploadCloud } from 'lucide-react';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Logo from './assets/Logo.png';
import useIsMobile from './hooks/useIsMobile';
import Navbar from './components/mobile/Navbar';
import Sidebar from './components/desktop/Sidebar';
import TopBar from './components/desktop/TopBar';
import DesktopBackground from './components/desktop/DesktopBackground';
import { SmartEntryProvider, useSmartEntry } from './context/SmartEntryContext';
import { TourProvider } from './context/TourContext';
import TourOverlay from './components/common/TourOverlay';
import './components/gamification/RewardAnimation.css';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Household from './pages/Household';
import { getJoinRequests, approveJoinRequest, rejectJoinRequest } from './api/api';
import Income from './pages/Income';
import Savings from './pages/Savings';
import Advisor from './pages/Advisor';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminHouseholds from './pages/admin/AdminHouseholds';
import AdminAiUsage from './pages/admin/AdminAiUsage';
import AdminRegister from './pages/admin/AdminRegister';
import AdminSettings from './pages/admin/AdminSettings';
import SystemStatus from './pages/admin/dashboard/SystemStatus';
import Onboarding from './pages/Onboarding';
import { SyncProvider } from './context/SyncContext';
import { BudgetProvider } from './context/BudgetContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import PreWarmer from './components/PreWarmer';
import { initAnalytics } from './services/analytics';
import LandingPage from './pages/LandingPage';
import ContactPage from './pages/ContactPage';
import FeaturesPage from './pages/FeaturesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import Footer from './components/Footer';

import './App.css';

// Server Status component to handle cold starts
function ServerStatus() {
  const [isSlow, setIsSlow] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  useEffect(() => {
    const handleSlow = () => setIsSlow(true);
    const handleReady = () => setIsSlow(false);
    const handleAIStart = () => setIsAIProcessing(true);
    const handleAIComplete = () => setIsAIProcessing(false);

    window.addEventListener('api-slow', handleSlow);
    window.addEventListener('api-ready', handleReady);
    window.addEventListener('ai-processing-start', handleAIStart);
    window.addEventListener('ai-processing-complete', handleAIComplete);

    return () => {
      window.removeEventListener('api-slow', handleSlow);
      window.removeEventListener('api-ready', handleReady);
      window.removeEventListener('ai-processing-start', handleAIStart);
      window.removeEventListener('ai-processing-complete', handleAIComplete);
    };
  }, []);

  // Hide server banner when AI is processing
  if (!isSlow || isAIProcessing) return null;

  return (
    <div className="server-status-banner">
      <div className="server-status-content">
        <span className="server-status-icon">☕</span>
        <div className="server-status-text">
          <strong>Loading please wait...</strong>
          <p>Server is waking up. This may take up to 30s.</p>
        </div>
        <div className="server-status-loader"></div>
      </div>
    </div>
  );
}

// AI Processing Notification
function AINotification() {
  const [status, setStatus] = useState('idle'); // idle, processing, done

  useEffect(() => {
    const handleStart = () => setStatus('processing');
    const handleComplete = () => {
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    };

    window.addEventListener('ai-processing-start', handleStart);
    window.addEventListener('ai-processing-complete', handleComplete);

    return () => {
      window.removeEventListener('ai-processing-start', handleStart);
      window.removeEventListener('ai-processing-complete', handleComplete);
    };
  }, []);

  if (status === 'idle') return null;

  return (
    <div className={`ai-notification ${status === 'processing' ? 'processing' : 'done'}`}>
      <div className="ai-notification-content">
        <span className="ai-icon">{status === 'processing' ? '⏳' : '✅'}</span>
        <span className="ai-text">
          {status === 'processing' ? 'AI Processing...' : 'Done!'}
        </span>
      </div>
    </div>
  );
}

// Join Request Notification (Polling)
function JoinRequestNotification() {
  const { isAuthenticated, user } = useAuth();
  const { joinRequests, refreshNotifications } = useNotification();
  const [visibleRequest, setVisibleRequest] = useState(null);

  // Poll for join requests handled by Context now.
  // We just react to changes.

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (joinRequests.length > 0 && !visibleRequest) {
      // Only show if we haven't just acted on it? 
      // Ideally we want to show it if it's NEW.
      // For now, let's just show it if there is one and we aren't showing one.
      setVisibleRequest(joinRequests[0]);

      // Auto-dismiss after 45s
      setTimeout(() => {
        setVisibleRequest(null);
      }, 45000);
    }
  }, [joinRequests, isAuthenticated, user]);

  const handleAction = async (requestId, action, role) => {
    try {
      if (action === 'accept') {
        await approveJoinRequest(requestId, role);
      } else {
        await rejectJoinRequest(requestId);
      }
      setVisibleRequest(null);
      refreshNotifications(); // Refresh context after action
    } catch (err) {
      console.error('Failed to handle join request', err);
    }
  };

  if (!visibleRequest) return null;

  return (
    <div className="join-request-notification">
      <div className="join-request-content">
        <div className="join-header">
          <strong>👤 Join Request</strong>
          <div className="timer-bar"></div>
        </div>
        <p>{visibleRequest.requester?.firstName} wants to join.</p>
        <div className="join-actions" style={{ flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-accept" style={{ fontSize: '13px' }} onClick={() => handleAction(visibleRequest.id, 'accept', 'VIEWER')}>Viewer 👁️</button>
            <button className="btn-accept" style={{ fontSize: '13px', background: '#3b82f6' }} onClick={() => handleAction(visibleRequest.id, 'accept', 'EDITOR')}>Editor ✏️</button>
          </div>
          <button className="btn-reject" onClick={() => handleAction(visibleRequest.id, 'reject')}>Reject</button>
        </div>
      </div>
    </div>
  );
}

// AI Limit Notification
function AiLimitNotification({ isMobile }) {
  const [notification, setNotification] = useState(null); // { type: 'warning' | 'error', message: string, title: string }

  useEffect(() => {
    const handleWarning = (e) => {
      // Backend msg: "2 chat uses remaining."
      setNotification({
        type: 'warning',
        title: 'Low Usage Warning',
        message: e.detail
      });
      // Warning stays for 8s
      setTimeout(() => setNotification(null), 4000);
    };

    const handleError = (e) => {
      // Backend msg examples: "Your monthly limit of 50 reached...", "AI access is globally restricted..."
      let title = 'AI Limit Reached';
      if (e.detail && (
        e.detail.toLowerCase().includes('restricted') ||
        e.detail.toLowerCase().includes('disabled')
      )) {
        title = 'AI Access Blocked';
      }

      setNotification({
        type: 'error',
        title: title,
        message: e.detail
      });
      // Error stays for 8s
      setTimeout(() => setNotification(null), 4000);
    };

    window.addEventListener('ai-warning', handleWarning);
    window.addEventListener('ai-error', handleError);

    // Initialize Analytics
    initAnalytics();

    return () => {
      window.removeEventListener('ai-warning', handleWarning);
      window.removeEventListener('ai-error', handleError);
    };
  }, []);

  if (!notification) return null;

  // Banner Style (mimicking ServerStatus)
  const bannerStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    left: isMobile ? '20px' : 'auto',
    zIndex: 9999,
    background: 'white',
    // Border color based on type
    borderLeft: `5px solid ${notification.type === 'error' ? '#ef4444' : '#ff9800'}`,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    borderRadius: '8px',
    padding: '16px',
    animation: 'slideIn 0.3s ease-out',
    maxWidth: isMobile ? 'none' : '350px'
  };

  const icon = notification.type === 'error' ? '🚫' : '⚠️';
  const textColor = '#333';
  const subTextColor = '#666';

  return (
    <div style={bannerStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
        <span style={{ fontSize: '24px', lineHeight: 1 }}>{icon}</span>
        <div>
          <strong style={{ display: 'block', color: textColor, marginBottom: '4px', fontSize: '15px' }}>
            {notification.title}
          </strong>
          <p style={{ margin: 0, fontSize: '13px', color: subTextColor, lineHeight: '1.4' }}>
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
}

import GlobalSmartEntry from './components/mobile/GlobalSmartEntry';

function AppContent() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLandingPage = location.pathname === '/';
  const { openSmartEntry } = useSmartEntry();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = e.dataTransfer.files;
      // Basic validation for images/pdf
      const validFiles = Array.from(files).filter(file =>
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );

      if (validFiles.length > 0) {
        openSmartEntry({ mode: 'image', files: files });
      }
    }
  };

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="households" element={<AdminHouseholds />} />
          <Route path="ai-usage" element={<AdminAiUsage />} />
          <Route path="status" element={<SystemStatus />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    );
  }

  // Landing page - no sidebar/navbar
  if (isLandingPage) {
    return (
      <div className="app">
        <ServerStatus />
        <main className="app-main">
          <AppRoutes />
        </main>
      </div>
    );
  }

  return (
    <div
      className="app"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="drag-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(var(--primary-rgb, 99, 102, 241), 0.8)',
          zIndex: 10000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'white', backdropFilter: 'blur(4px)', pointerEvents: 'none'
        }}>
          <UploadCloud size={64} style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Drop Receipt to Scan</h2>
        </div>
      )}
      <ServerStatus />
      <AINotification />
      <AiLimitNotification isMobile={isMobile} />
      <JoinRequestNotification />

      {isMobile ? (
        <>
          <main className="app-main">
            <GlobalSmartEntry />
            <AppRoutes />
          </main>
          <Navbar />
        </>
      ) : (
        <div className="app-desktop-layout">
          <DesktopBackground />
          <GlobalSmartEntry />
          <Sidebar />
          <div className="desktop-main-wrapper">
            <TopBar />
            <main className="app-main" style={{ paddingBottom: '100px' }}> {/* Add padding for fixed footer */}
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </div>
      )}
    </div>
  );
}

// Extracted Routes to avoid duplication in render
function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <Transactions />
        </ProtectedRoute>
      } />
      <Route path="/income" element={
        <ProtectedRoute>
          <Income />
        </ProtectedRoute>
      } />
      <Route path="/savings" element={
        <ProtectedRoute>
          <Savings />
        </ProtectedRoute>
      } />
      <Route path="/household" element={
        <ProtectedRoute>
          <Household />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/advisor" element={
        <ProtectedRoute>
          <Advisor />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />

      {/* Public Routes (redirect if logged in) */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      <Route path="/verify-email" element={
        <PublicRoute>
          <VerifyEmail />
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <PreWarmer />
      <AuthProvider>
        <ThemeProvider>
          <SyncProvider>
            <BudgetProvider>
              <NotificationProvider>
                <SmartEntryProvider>
                  <TourProvider>
                    <TourOverlay />
                    <AppContent />
                  </TourProvider>
                </SmartEntryProvider>
              </NotificationProvider>
            </BudgetProvider>
          </SyncProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
