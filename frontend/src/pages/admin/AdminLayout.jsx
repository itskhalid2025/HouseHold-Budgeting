import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Home, Activity, Settings, LogOut, Server } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminTheme.css';
import './AdminLayout.css';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
        { icon: <Home size={20} />, label: 'Households', path: '/admin/households' },
        { icon: <Activity size={20} />, label: 'AI Usage', path: '/admin/ai-usage' },
        { icon: <Server size={20} />, label: 'System Status', path: '/admin/status' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-icon">A</div>
                        <h1 className="logo-text">Admin Portal</h1>
                    </div>
                    <p className="version-text">HouseHold Budgeting v2.0</p>
                </div>

                <nav className="sidebar-nav custom-scrollbar">
                    <p className="nav-section-title">Main Menu</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.firstName?.[0] || 'A'}
                            </div>
                            <div className="user-details">
                                <p className="user-name">{user?.firstName || 'Admin'}</p>
                                <div className="user-role">
                                    <span className="status-dot"></span>
                                    <span>SysAdmin</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <LogOut size={14} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
