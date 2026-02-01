import React from 'react';
import { X, Mic, MessageSquare, FileText, Zap } from 'lucide-react';
import './UserGuide.css';

const UserGuide = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="guide-overlay" onClick={onClose}>
            <div className="guide-modal" onClick={e => e.stopPropagation()}>
                <div className="guide-header">
                    <h2>Platform Guide</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="guide-content">
                    <p className="guide-intro">
                        Welcome to your AI-powered financial workspace. Here's how to use the advanced capabilities:
                    </p>

                    <div className="guide-section">
                        <div className="section-icon smart">
                            <Mic size={20} />
                        </div>
                        <div className="section-text">
                            <h3>Smart Entry</h3>
                            <p>
                                <strong>Voice or Text:</strong> Simply say or type your transaction naturally.
                                <br />
                                <em>"Spent 50 dollars on groceries at Walmart."</em>
                                <br />
                                <strong>Bilingual:</strong> Works in <strong>English</strong> and many other languages automatically.
                            </p>
                        </div>
                    </div>

                    <div className="guide-section">
                        <div className="section-icon advisor">
                            <MessageSquare size={20} />
                        </div>
                        <div className="section-text">
                            <h3>AI Advisor</h3>
                            <p>
                                Chat with your financial assistant for personalized advice, budget tips, or quick analysis of your spending habits.
                            </p>
                        </div>
                    </div>

                    <div className="guide-section">
                        <div className="section-icon reports">
                            <FileText size={20} />
                        </div>
                        <div className="section-text">
                            <h3>Smart Reports</h3>
                            <p>
                                Generate detailed monthly summaries with a single click. The AI analyzes trends, anomalies, and savings opportunities for you.
                            </p>
                        </div>
                    </div>

                    <div className="guide-section">
                        <div className="section-icon general">
                            <Zap size={20} />
                        </div>
                        <div className="section-text">
                            <h3>Pro Tips</h3>
                            <p>
                                • Use the <strong>Category</strong> filters to drill down.<br />
                                • Set <strong>Savings Goals</strong> to track progress.<br />
                                • Invite family members to manage a shared <strong>Household</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserGuide;
