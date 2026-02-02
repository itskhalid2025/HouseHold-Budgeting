import React, { useEffect } from 'react';
import { X, Mic, MessageSquare, FileText, Zap, Image, Command } from 'lucide-react';
import './UserGuideDesktop.css';

const UserGuideDesktop = ({ isOpen, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="guide-overlay-desktop" onClick={onClose}>
            <div className="guide-drawer-desktop" onClick={e => e.stopPropagation()}>
                <div className="guide-header-desktop">
                    <h2>Platform Guide</h2>
                    <button className="close-btn-desktop" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="guide-content-desktop">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem' }}>
                        Designed for power users. Master your financial workspace with these tools:
                    </p>

                    <div className="guide-section-desktop">
                        <div className="section-icon-desktop smart">
                            <Mic size={28} />
                        </div>
                        <div className="section-text-desktop">
                            <h3>Smart Entry & Voice</h3>
                            <p>
                                Speak naturally or type commands. <br />
                                <em>"Split $100 dinner with bob"</em>
                            </p>
                        </div>
                    </div>

                    <div className="guide-section-desktop">
                        <div className="section-icon-desktop smart">
                            <Image size={28} />
                        </div>
                        <div className="section-text-desktop">
                            <h3>Receipt Scanning</h3>
                            <p>
                                Drag & Drop receipts anywhere on the dashboard to initiate Smart Scan.
                            </p>
                        </div>
                    </div>

                    <div className="guide-section-desktop">
                        <div className="section-icon-desktop advisor">
                            <MessageSquare size={28} />
                        </div>
                        <div className="section-text-desktop">
                            <h3>Financial Advisor</h3>
                            <p>
                                Deep dive analysis. Ask complex questions like "Forecast my savings for next year based on current trends."
                            </p>
                        </div>
                    </div>

                    <div className="guide-section-desktop">
                        <div className="section-icon-desktop report">
                            <FileText size={28} />
                        </div>
                        <div className="section-text-desktop">
                            <h3>Report Generation</h3>
                            <p>
                                Navigate to Reports page. <br />
                                Select period to view detailed AI analysis & charts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserGuideDesktop;
