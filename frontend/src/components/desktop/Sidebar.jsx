import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSmartEntry } from '../../context/SmartEntryContext';
import { Plus } from 'lucide-react';
import Logo from '../../assets/Logo.png';
import './Sidebar.css';
import {
    getHousehold
} from '../../api/api';

const Sidebar = () => {
    const { isAuthenticated, user } = useAuth();
    const { openSmartEntry } = useSmartEntry();

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
        <aside className="app-sidebar">
            <div className="sidebar-header">
                <img src={Logo} alt="Logo" className="sidebar-logo" />
                <h1 className="sidebar-title">{householdName || 'HouseHold'}</h1>
            </div>

            <div className="sidebar-action">
                <button onClick={() => openSmartEntry()} className="new-entry-btn">
                    <Plus size={20} />
                    <span>New Entry</span>
                </button>
            </div>

            <nav className="sidebar-nav">
                {user?.householdId && (
                    <>
                        <NavLink to="/" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">🏠</span>
                            Dashboard
                        </NavLink>
                        <NavLink to="/transactions" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">💳</span>
                            Transactions
                        </NavLink>
                        <NavLink to="/income" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">💰</span>
                            Income
                        </NavLink>
                        <NavLink to="/savings" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">🐷</span>
                            Savings
                        </NavLink>
                    </>
                )}
                <NavLink to="/household" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                    <span className="icon">👥</span>
                    Household
                </NavLink>
                {user?.householdId && (
                    <>
                        <NavLink to="/reports" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">📊</span>
                            Reports
                        </NavLink>
                        <NavLink to="/advisor" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">🤖</span>
                            AI Advisor
                        </NavLink>
                        <NavLink to="/settings" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                            <span className="icon">⚙️</span>
                            Settings
                        </NavLink>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
