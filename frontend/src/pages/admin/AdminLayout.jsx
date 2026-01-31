import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getAdminMe } from '../../api/api';
import './AdminLayout.css'; // Create if needed

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            try {
                const data = await getAdminMe();
                if (data.success) {
                    setAdmin(data.admin);
                } else {
                    localStorage.removeItem('adminToken');
                    navigate('/admin/login');
                }
            } catch (err) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (loading) {
        return <div style={{
            height: '100vh',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
        }}>Loading Admin Portal...</div>;
    }

    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: '#1e293b',
                borderRight: '1px solid #334155',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>Platform Admin</h1>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>HouseHold Budgeting</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <NavItem label="Dashboard" path="/admin/dashboard" active={location.pathname === '/admin/dashboard'} />
                    <NavItem label="Users" path="/admin/users" active={location.pathname === '/admin/users'} />
                    <NavItem label="Households" path="/admin/households" active={location.pathname === '/admin/households'} />
                    <NavItem label="AI Usage" path="/admin/ai-usage" active={location.pathname === '/admin/ai-usage'} />
                    <NavItem label="Settings" path="/admin/settings" active={location.pathname === '/admin/settings'} />
                </nav>

                <div style={{ borderTop: '1px solid #334155', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', color: '#fff'
                        }}>
                            {admin?.firstName?.[0]}
                        </div>
                        <div>
                            <div style={{ fontWeight: '500', color: '#fff' }}>{admin?.firstName}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{admin?.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('adminToken');
                            navigate('/admin/login');
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#fca5a5',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
};

const NavItem = ({ label, path, active }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(path)}
            style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: active ? '#2563eb' : 'transparent',
                color: active ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}
            onMouseEnter={(e) => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}
        >
            {label}
        </div>
    );
};

export default AdminLayout;
