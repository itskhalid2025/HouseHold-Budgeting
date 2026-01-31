import React from 'react';
import './MobileCard.css';

export default function MobileCard({ children, title, className = '', onClick }) {
    return (
        <div className={`mobile-card ${className}`} onClick={onClick}>
            {title && <h3 className="mobile-card-title">{title}</h3>}
            {children}
        </div>
    );
}
