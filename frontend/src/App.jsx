import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Household from './pages/Household';
import Income from './pages/Income';
import Savings from './pages/Savings';

import './App.css';

// Header component with auth state
function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">🏠 HouseHold Budgeting</h1>
        {isAuthenticated ? (
          <>
            <nav className="main-nav">
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
              <NavLink to="/household" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Household
              </NavLink>
              <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Reports
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Settings
              </NavLink>
            </nav>
            <div className="user-menu">
              <span className="user-name">{user?.firstName || 'User'}</span>
              <button onClick={logout} className="logout-btn">Logout</button>
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
    </header>
  );
}

function AppContent() {
  return (
    <div className="app">
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
        <p>&copy; 2026 HouseHold Budgeting. Built with React + Vite.</p>
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
