import React from 'react';
import { X, Mic, MessageSquare, FileText, Zap, Image, Trophy } from 'lucide-react';
import './UserGuideMobile.css';

const UserGuideMobile = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="guide-overlay-mobile" onClick={onClose}>
            <div className="guide-modal-mobile" onClick={e => e.stopPropagation()}>
                <div className="guide-header-mobile">
                    <h2>Quick Guide</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="guide-content-mobile">
                    <div className="guide-section-mobile">
                        <div className="section-icon-mobile smart">
                            <Mic size={20} />
                        </div>
                        <div className="section-text-mobile">
                            <h3>Smart Entry</h3>
                            <p>Tap + to use Voice, Text, or Scan Receipt.</p>
                        </div>
                    </div>

                    <div className="guide-section-mobile">
                        <div className="section-icon-mobile report">
                            <FileText size={20} />
                        </div>
                        <div className="section-text-mobile">
                            <h3>Generate Reports</h3>
                            <p>Go to Reports → Select Period → View AI Insights.</p>
                        </div>
                    </div>

                    <div className="guide-section-mobile">
                        <div className="section-icon-mobile smart">
                            <Image size={24} />
                        </div>
                        <div className="section-text-mobile">
                            <h3>Scan Receipts</h3>
                            <p>Take pixel-perfect snaps of receipts for auto-entry.</p>
                        </div>
                    </div>


                    <div className="guide-section-mobile">
                        <div className="section-icon-mobile advisor">
                            <MessageSquare size={20} />
                        </div>
                        <div className="section-text-mobile">
                            <h3>AI Chat</h3>
                            <p>Ask "How much did I spend on food?"</p>
                        </div>
                    </div>

                    <div className="guide-section-mobile">
                        <div className="section-icon-mobile reward">
                            <Trophy size={20} />
                        </div>
                        <div className="section-text-mobile">
                            <h3>Rewards</h3>
                            <p>Earn XP, maintain streaks, and level up!</p>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default UserGuideMobile;
