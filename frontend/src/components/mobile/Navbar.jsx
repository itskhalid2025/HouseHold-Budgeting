import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart2, Settings, Plus, Users, CloudOff } from 'lucide-react';
import { useSmartEntry } from '../../context/SmartEntryContext'; // Import context
import { useSync } from '../../context/SyncContext';
import { useNotification } from '../../context/NotificationContext';
import RankBadge from '../gamification/RankBadge';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();
    const { openSmartEntry } = useSmartEntry();
    const { isOnline } = useSync();
    const { requestCount } = useNotification();

    // Hide navbar on login/register pages
    if (['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname)) {
        return null;
    }

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Home' },
        { path: '/transactions', icon: Receipt, label: 'Txns' },
        {
            path: '#', // Dummy path
            icon: Plus, // Use Plus icon for 'Add'
            label: 'Add',
            isPrimary: true,
            onClick: (e) => {
                e.preventDefault();
                openSmartEntry();
            }
        },
        { path: '/reports', icon: BarChart2, label: 'Stats' },
        { path: '/household', icon: Users, label: 'Household' }
    ];

    return (
        <nav className={`mobile-navbar ${!isOnline ? 'offline' : ''}`}>
            {!isOnline && (
                <div className="offline-status-strip">
                    <CloudOff size={14} />
                    <span>Working Offline</span>
                </div>
            )}
            {navItems.map((item) => (
                <NavLink
                    key={item.label} // Use label as key since path might be duplicate or dummy
                    to={item.path}
                    onClick={item.onClick} // Attach click handler
                    className={({ isActive }) => `nav-item ${isActive && !item.isPrimary ? 'active' : ''} ${item.isPrimary ? 'nav-item-primary' : ''}`}
                >
                    <div className={item.isPrimary ? "icon-container" : ""}>
                        <item.icon className="nav-icon" size={item.isPrimary ? 28 : 24} />
                        {item.label === 'Household' && requestCount > 0 && (
                            <span className="nav-badge">{requestCount}</span>
                        )}
                    </div>
                    <span className="nav-label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
