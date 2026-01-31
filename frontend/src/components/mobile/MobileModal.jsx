import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './MobileModal.css';

export default function MobileModal({ isOpen, onClose, title, children }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setVisible(false), 300); // Wait for animation
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !visible) return null;

    return (
        <div className={`mobile-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div
                className={`mobile-modal-content ${isOpen ? 'open' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="mobile-modal-header">
                    <h3>{title}</h3>
                    <button className="mobile-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="mobile-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
