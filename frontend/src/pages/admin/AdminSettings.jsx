import React, { useState } from 'react';
import './AdminTheme.css';
import './AdminSettings.css';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        platformName: 'GrowWise',
        maintenanceMode: false,
        aiRateLimit: 50,
        enableRegistration: true
    });

    const handleSave = () => {
        alert('Settings saved (Simulated)');
    };

    return (
        <div className="admin-page-container admin-settings-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Platform Settings</h1>
                    <p className="page-subtitle">Configure global system parameters, maintenance modes, and registration policies.</p>
                </div>
            </div>

            <div className="settings-grid">
                {/* General Configuration */}
                <div className="settings-card">
                    <h3 className="settings-group-title">
                        <svg className="settings-group-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        General Configuration
                    </h3>

                    <div className="settings-form-stack">
                        <div className="form-group">
                            <label className="metric-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Platform Name</label>
                            <input
                                type="text"
                                value={settings.platformName}
                                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                className="neon-input"
                            />
                        </div>

                        <div className="setting-toggle-row">
                            <div>
                                <div className="toggle-info-title">Maintenance Mode</div>
                                <div className="toggle-info-desc">Disable access for all non-admin users.</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-toggle-row">
                            <div>
                                <div className="toggle-info-title">Enable New Registrations</div>
                                <div className="toggle-info-desc">Allow new users to create accounts.</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.enableRegistration}
                                    onChange={(e) => setSettings({ ...settings, enableRegistration: e.target.checked })}
                                />
                                <span className="slider green-toggle"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* AI & Resource Limits */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="settings-card">
                        <h3 className="settings-group-title">
                            <svg className="settings-group-icon" style={{ color: '#bc13fe' }} width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            AI & Resource Limits
                        </h3>

                        <div>
                            <label className="metric-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Global AI Rate Limit (Req/Hour/User)</label>
                            <input
                                type="number"
                                value={settings.aiRateLimit}
                                onChange={(e) => setSettings({ ...settings, aiRateLimit: parseInt(e.target.value) })}
                                className="neon-input"
                                style={{ borderColor: settings.aiRateLimit > 100 ? '#bc13fe' : '' }}
                            />
                            <p className="toggle-info-desc" style={{ marginTop: '0.5rem' }}>This is a global fallback. User-specific limits take precedence.</p>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <button onClick={handleSave} className="save-btn">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                            Save All Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
