import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">🏠 HomeHarmony Budget</h1>
            <nav className="main-nav">
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Dashboard
              </NavLink>
              <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Transactions
              </NavLink>
              <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Reports
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Settings
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>&copy; 2026 HomeHarmony Budget. Built with React + Vite.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
