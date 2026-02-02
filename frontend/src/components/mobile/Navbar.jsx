import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart2, Settings, Plus, Users } from 'lucide-react';
import { useSmartEntry } from '../../context/SmartEntryContext'; // Import context
import RankBadge from '../gamification/RankBadge';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();
    const { openSmartEntry } = useSmartEntry(); // Use hook

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
        <nav className="mobile-navbar">
            {navItems.map((item) => (
                <NavLink
                    key={item.label} // Use label as key since path might be duplicate or dummy
                    to={item.path}
                    onClick={item.onClick} // Attach click handler
                    className={({ isActive }) => `nav-item ${isActive && !item.isPrimary ? 'active' : ''} ${item.isPrimary ? 'nav-item-primary' : ''}`}
                >
                    <div className={item.isPrimary ? "icon-container" : ""}>
                        <item.icon className="nav-icon" size={item.isPrimary ? 28 : 24} />
                    </div>
                    <span className="nav-label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
