import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSmartEntry } from '../../context/SmartEntryContext';
import { useNotification } from '../../context/NotificationContext';
import { Plus, LogOut, X } from 'lucide-react';
import GrowWiseLogo from '../GrowWiseLogo';
import './Sidebar.css';
import {
    getHousehold
} from '../../api/api';

const Sidebar = ({ isOpen, onClose }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const { openSmartEntry } = useSmartEntry();
    const { requestCount } = useNotification();

    // State for household name
    const [householdName, setHouseholdName] = React.useState('');

    React.useEffect(() => {
        if (user?.householdId) {
            getHousehold()
                .then(data => {
                    if (data?.household?.name) {
                        setHouseholdName(data.household.name);
                    }
                })
                .catch(err => console.error("Failed to fetch household name:", err));
        }
    }, [user?.householdId]);

    if (!isAuthenticated) return null;

    return (
        <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header" data-tour-id="sidebar-logo">
                <div className="sidebar-header-top">
                    <GrowWiseLogo size="text-3xl" style={{ fontSize: '1.3rem', textTransform: 'none' }} className="sidebar-logo-text mb-1" />
                    <button className="sidebar-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                {householdName && <span className="text-xs text-gray-400 font-medium tracking-wide ">{householdName}</span>}
            </div>

            <div className="sidebar-action">
                <button onClick={() => openSmartEntry()} className="new-entry-btn" data-tour-id="sidebar-new-entry">
                    <Plus size={20} />
                    <span>New Entry</span>
                </button>
            </div>

            <nav className="sidebar-nav">
                {user?.householdId && (
                    <>
                        <NavLink to="/dashboard" data-tour-id="sidebar-dashboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">🏠</span>
                            Dashboard
                        </NavLink>
                        <NavLink to="/transactions" data-tour-id="sidebar-transactions" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">💳</span>
                            Transactions
                        </NavLink>
                        <NavLink to="/income" data-tour-id="sidebar-income" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">💰</span>
                            Income
                        </NavLink>
                        <NavLink to="/savings" data-tour-id="sidebar-savings" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">🐷</span>
                            Savings
                        </NavLink>
                    </>
                )}
                <NavLink to="/household" data-tour-id="sidebar-household" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                    <span className="icon">👥</span>
                    Household
                    {requestCount > 0 && (
                        <span className="sidebar-badge">{requestCount}</span>
                    )}
                </NavLink>
                {user?.householdId && (
                    <>
                        <NavLink to="/reports" data-tour-id="sidebar-reports" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">📊</span>
                            Reports
                        </NavLink>
                        <NavLink to="/advisor" data-tour-id="sidebar-advisor" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">🤖</span>
                            AI Advisor
                        </NavLink>
                        <NavLink to="/settings" data-tour-id="sidebar-settings" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">⚙️</span>
                            Settings
                        </NavLink>
                    </>
                )}
            </nav>

            <button onClick={logout} className="logout-btn-glass" data-tour-id="sidebar-logout">
                <div className="icon-box"><LogOut size={18} /></div>
                <span>Logout</span>
            </button>
        </aside>
    );
};

export default Sidebar;
