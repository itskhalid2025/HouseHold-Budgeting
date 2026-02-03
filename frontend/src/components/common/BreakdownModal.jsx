import React from 'react';
import { X, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyUtils.js';
import './BreakdownModal.css';

export default function BreakdownModal({ isOpen, onClose, title, data, type, currency }) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'income': return <TrendingUp className="text-green" size={24} />;
            case 'expenses': return <TrendingDown className="text-red" size={24} />;
            case 'savings': return <PiggyBank className="text-blue" size={24} />;
            default: return null;
        }
    };

    const total = data?.reduce((sum, item) => sum + (Number(item.total) || 0), 0) || 0;

    return (
        <div className="breakdown-modal-overlay" onClick={onClose}>
            <div className="breakdown-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="title-with-icon">
                        {getIcon()}
                        <h2>{title.replace('Monthly ', '')} Breakdown</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="total-summary">
                    <span className="label">Monthly {title.replace('Monthly ', '')} Total</span>
                    <span className={`value ${type}`}>{formatCurrency(total, currency)}</span>
                </div>

                <div className="breakdown-section">
                    <h3 className="section-title">User Contributions</h3>
                    <div className="member-list">
                        {data && data.length > 0 ? (
                            data.map((member, idx) => {
                                const memberVal = Number(member.total) || 0;
                                const percent = total > 0 ? (memberVal / total) * 100 : 0;
                                return (
                                    <div key={member.userId || idx} className="member-item">
                                        <div className="member-info">
                                            <div className="member-name-row">
                                                <span className="name">{member.name}</span>
                                                <span className="amount">{formatCurrency(memberVal, currency)}</span>
                                            </div>
                                            <div className="progress-bg">
                                                <div
                                                    className={`progress-fill ${type}`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <span className="percent">{Math.round(percent)}% share</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="no-data">No contributions recorded for this month.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
