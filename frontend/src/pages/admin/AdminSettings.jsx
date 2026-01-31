import React, { useState } from 'react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        platformName: 'HouseHold Budgeting',
        maintenanceMode: false,
        aiRateLimit: 50,
        enableRegistration: true
    });

    const handleSave = () => {
        alert('Settings saved (Simulated)');
    };

    return (
        <div style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>Platform Settings</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
                <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '20px' }}>General Configuration</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Platform Name</label>
                            <input
                                type="text"
                                value={settings.platformName}
                                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ color: '#fff', fontWeight: '500' }}>Maintenance Mode</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Disable access for all non-admin users.</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ color: '#fff', fontWeight: '500' }}>Enable New Registrations</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Allow new users to create accounts.</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.enableRegistration}
                                onChange={(e) => setSettings({ ...settings, enableRegistration: e.target.checked })}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '20px' }}>AI & Resource Limits</h3>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Global AI Rate Limit (Req/Hour/User)</label>
                        <input
                            type="number"
                            value={settings.aiRateLimit}
                            onChange={(e) => setSettings({ ...settings, aiRateLimit: parseInt(e.target.value) })}
                            style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    style={{
                        padding: '12px',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        alignSelf: 'flex-start'
                    }}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
