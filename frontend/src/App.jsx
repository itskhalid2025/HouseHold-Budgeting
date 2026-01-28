import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Logo from './assets/Logo.png';

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

import './App.css';

// Header component with auth state
function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (tab) => {
    setShowMenu(false);
    navigate('/settings', { state: { tab } });
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">
          <img src={Logo} alt="Logo" className="app-logo" />
          HouseHold Budgeting
        </h1>
        {isAuthenticated ? (
          <>
            <nav className="main-nav">
              {user?.householdId && (
                <>
                  <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Transactions
                  </NavLink>
                  <NavLink to="/income" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Income
                  </NavLink>
                  <NavLink to="/savings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Savings
                  </NavLink>
                </>
              )}
              <NavLink to="/household" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Household
              </NavLink>
              {user?.householdId && (
                <>
                  <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Reports
                  </NavLink>
                  <NavLink to="/advisor" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    AI Advisor
                  </NavLink>
                  <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    Settings
                  </NavLink>
                </>
              )}
            </nav>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="user-menu-container">
              <div
                className="user-menu-trigger"
                onClick={() => setShowMenu(!showMenu)}
              >
                <div className="user-avatar-circle">
                  {(user?.firstName?.[0] || 'U').toUpperCase()}
                </div>
              </div>

              {showMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">{user?.firstName} {user?.lastName}</div>
                    <div className="dropdown-user-email">{user?.email}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={() => handleNavigate('profile')} className="dropdown-item">
                    Profile settings
                  </button>
                  <button onClick={() => handleNavigate('household')} className="dropdown-item">
                    Household management
                  </button>
                  <button onClick={() => handleNavigate('notifications')} className="dropdown-item">
                    Notification preferences
                  </button>
                  <button onClick={() => handleNavigate('household')} className="dropdown-item">
                    Currency settings
                  </button>
                  <div className="dropdown-divider"></div>
                  <button onClick={logout} className="dropdown-item danger">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <nav className="main-nav">
            <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Login
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Register
            </NavLink>
          </nav>
        )}
      </div>
    </header >
  );
}

// Server Status component to handle cold starts
function ServerStatus() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const handleSlow = () => setIsSlow(true);
    const handleReady = () => setIsSlow(false);

    window.addEventListener('api-slow', handleSlow);
    window.addEventListener('api-ready', handleReady);

    return () => {
      window.removeEventListener('api-slow', handleSlow);
      window.removeEventListener('api-ready', handleReady);
    };
  }, []);

  if (!isSlow) return null;

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
  const [requests, setRequests] = useState([]);
  const [visibleRequest, setVisibleRequest] = useState(null);

  // Poll for join requests
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchRequests = async () => {
      try {
        const data = await getJoinRequests();
        const pending = data.requests || [];

        // Check for new requests (simplified logic: just show the first pending one if not already showing)
        // In a real app we'd track seen IDs to avoid re-notifying, but this works for "active pending requests"
        if (pending.length > 0 && !visibleRequest) {
          // Only show if we haven't just acted on it? 
          // Ideally we want to show it if it's NEW.
          // For now, let's just show it if there is one and we aren't showing one.
          setVisibleRequest(pending[0]);

          // Auto-dismiss after 45s
          setTimeout(() => {
            setVisibleRequest(null);
          }, 45000);
        }
      } catch (err) {
        // Ignore errors
      }
    };

    const interval = setInterval(fetchRequests, 30000); // Poll every 30s
    // Initial fetch
    fetchRequests();

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const handleAction = async (requestId, action) => {
    try {
      if (action === 'accept') {
        await approveJoinRequest(requestId, 'member');
      } else {
        await rejectJoinRequest(requestId);
      }
      setVisibleRequest(null);
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
        <p>{visibleRequest.user?.firstName} want to join.</p>
        <div className="join-actions">
          <button className="btn-accept" onClick={() => handleAction(visibleRequest.id, 'accept')}>Accept</button>
          <button className="btn-reject" onClick={() => handleAction(visibleRequest.id, 'reject')}>Reject</button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <div className="app">
      <ServerStatus />
      <AINotification />
      <JoinRequestNotification />
      <Header />

      <main className="app-main">
        <Routes>
          {/* Protected Routes */}
          <Route path="/" element={
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
        </Routes>
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 HouseHold Budgeting.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
