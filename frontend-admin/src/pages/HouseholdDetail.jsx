import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/adminApi';
import '../styles/Admin.css';

export default function HouseholdDetail() {
    const { id } = useParams();
    const [household, setHousehold] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHousehold();
    }, [id]);

    const fetchHousehold = async () => {
        try {
            setLoading(true);
            const data = await api.getHouseholdDetail(id);
            setHousehold(data.household);
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
                    <p>Loading household...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-page">
                <div className="error-state">
                    <p>{error}</p>
                    <Link to="/households" className="btn btn-secondary">Back to Households</Link>
                </div>
            </div>
        );
    }

    if (!household) {
        return (
            <div className="admin-page">
                <div className="error-state">
                    <p>Household not found</p>
                    <Link to="/households" className="btn btn-secondary">Back to Households</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div className="header-left">
                    <Link to="/households" className="back-link">← Back to Households</Link>
                    <h1>{household.name}</h1>
                </div>
                <div className="header-actions">
                    <span className={`status-badge status-${household.isActive ? 'active' : 'inactive'}`}>
                        {household.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Household Info Card */}
            <div className="detail-section">
                <h2>Household Information</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label>Household ID</label>
                        <span className="mono">{household.id}</span>
                    </div>
                    <div className="info-item">
                        <label>Invite Code</label>
                        <span className="mono">{household.inviteCode}</span>
                    </div>
                    <div className="info-item">
                        <label>Created At</label>
                        <span>{new Date(household.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                        <label>Last Modified</label>
                        <span>{new Date(household.lastModifiedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Members Section */}
            <div className="detail-section">
                <h2>Members ({household.members?.length || 0})</h2>
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {household.members?.map(member => (
                                <tr key={member.id}>
                                    <td>
                                        <Link to={`/users/${member.user?.id}`} className="table-link">
                                            {member.user?.firstName} {member.user?.lastName}
                                        </Link>
                                    </td>
                                    <td>{member.user?.email}</td>
                                    <td>
                                        <span className={`role-badge role-${member.role.toLowerCase()}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {(!household.members || household.members.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="empty-row">No members found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats Section */}
            <div className="detail-section">
                <h2>Statistics</h2>
                <div className="stats-row">
                    <div className="stat-box">
                        <span className="stat-value">{household._count?.transactions || 0}</span>
                        <span className="stat-label">Transactions</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{household._count?.incomes || 0}</span>
                        <span className="stat-label">Income Sources</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{household._count?.sinkingFunds || 0}</span>
                        <span className="stat-label">Sinking Funds</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{household._count?.budgets || 0}</span>
                        <span className="stat-label">Budgets</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
