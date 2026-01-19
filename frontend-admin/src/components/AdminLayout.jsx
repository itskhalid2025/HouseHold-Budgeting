
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Home, Settings, LogOut } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link
            to={to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
}

const AdminLayout = () => {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">HomeHarmony<span className="text-gray-900 dark:text-white">Admin</span></h1>
                </div>

                <nav className="p-4 space-y-1">
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/households" icon={Home} label="Households" />
                    <SidebarItem to="/users" icon={Users} label="Users" />
                    <SidebarItem to="/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {admin?.firstName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {admin?.firstName} {admin?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {admin?.adminLevel}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
