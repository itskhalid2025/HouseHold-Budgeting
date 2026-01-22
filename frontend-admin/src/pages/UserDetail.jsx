import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/adminApi';
import '../styles/Admin.css';

export default function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const data = await api.getUserDetail(id);
            setUser(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading user...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="admin-page">
                <div className="error-state">
                    <p>{error || 'User not found'}</p>
                    <Link to="/users" className="btn btn-secondary">Back to Users</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div className="header-left">
                    <Link to="/users" className="back-link">← Back to Users</Link>
                    <h1>{user.firstName} {user.lastName}</h1>
                </div>
                <div className="header-actions">
                    <span className={`status-badge status-${user.status?.toLowerCase() || 'active'}`}>
                        {user.status || 'Active'}
                    </span>
                </div>
            </div>

            {/* User Info Card */}
            <div className="detail-section">
                <h2>User Information</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>User ID</label>
                        <span className="mono">{user.id}</span>
                    </div>
                    <div className="info-item">
                        <label>Email</label>
                        <span>{user.email}</span>
                    </div>
                    <div className="info-item">
                        <label>Phone</label>
                        <span>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                        <label>Currency</label>
                        <span>{user.currency || 'USD'}</span>
                    </div>
                    <div className="info-item">
                        <label>Created At</label>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                        <label>Last Login</label>
                        <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</span>
                    </div>
                </div>
            </div>

            {/* Household Membership */}
            <div className="detail-section">
                <h2>Household Membership</h2>
                {user.householdMembers && user.householdMembers.length > 0 ? (
                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Household</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {user.householdMembers.map(membership => (
                                    <tr key={membership.id}>
                                        <td>
                                            <Link to={`/households/${membership.household?.id}`} className="table-link">
                                                {membership.household?.name}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className={`role-badge role-${membership.role.toLowerCase()}`}>
                                                {membership.role}
                                            </span>
                                        </td>
                                        <td>{new Date(membership.joinedAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>User is not a member of any household</p>
                    </div>
                )}
            </div>

            {/* Activity Stats */}
            <div className="detail-section">
                <h2>Activity Statistics</h2>
                <div className="stats-row">
                    <div className="stat-box">
                        <span className="stat-value">{user._count?.transactions || 0}</span>
                        <span className="stat-label">Transactions</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{user._count?.incomes || 0}</span>
                        <span className="stat-label">Income Records</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{user._count?.categoryOverrides || 0}</span>
                        <span className="stat-label">Category Overrides</span>
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            <div className="detail-section">
                <h2>Admin Actions</h2>
                <div className="action-buttons">
                    <button className="btn btn-primary">Reset Password</button>
                    <button className="btn btn-warning">Suspend User</button>
                    <button className="btn btn-danger">Delete User</button>
                </div>
            </div>
        </div>
    );
}
